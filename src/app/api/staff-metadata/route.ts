import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

/**
 * Enterprise Staff Metadata Management API
 *
 * Provides comprehensive staff metadata management for multi-tenant applications.
 * This API is used by owners to manage their team members' metadata in Clerk.
 *
 * Endpoints:
 * - GET /api/staff-metadata - List all staff under an owner
 * - GET /api/staff-metadata?userId=<id> - Get specific staff metadata
 * - PATCH /api/staff-metadata - Update staff metadata
 * - POST /api/staff-metadata/sync - Sync metadata from Convex to Clerk
 *
 * Enterprise Features:
 * - Batch metadata operations
 * - Role-based metadata updates
 * - Company context preservation
 * - Audit tracking
 */

// Valid staff roles
const STAFF_ROLES = ['manager', 'staff', 'viewer'] as const;
type StaffRole = (typeof STAFF_ROLES)[number];

/**
 * Validate staff role
 */
function isValidStaffRole(role: string): role is StaffRole {
  return STAFF_ROLES.includes(role.toLowerCase() as StaffRole);
}

/**
 * Fetch user metadata from Clerk
 */
async function fetchUserMetadata(
  userId: string
): Promise<Record<string, any> | null> {
  try {
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    const userData = await response.json();
    return userData.public_metadata || {};
  } catch (error) {
    console.error('[staff-metadata] Error fetching metadata:', error);
    return null;
  }
}

/**
 * List all staff members for an owner
 * Uses Clerk's API to list users with metadata containing the owner's ID
 */
async function listStaffForOwner(ownerId: string): Promise<any[]> {
  try {
    // Get all users from Clerk (limited to 500 per call)
    const response = await fetch(`https://api.clerk.dev/v1/users?limit=500`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    // Filter users who have this owner in their companyOwnerId
    const staff = (data.data || []).filter((user: any) => {
      const meta = user.public_metadata || {};
      return meta.companyOwnerId === ownerId && meta.role !== 'owner';
    });

    return staff.map((user: any) => ({
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      username: user.public_metadata?.username,
      role: user.public_metadata?.role,
      companyOwnerId: user.public_metadata?.companyOwnerId,
      ownerUsername: user.public_metadata?.ownerUsername,
      companyName: user.public_metadata?.companyName,
      createdAt: user.created_at,
      updatedAt: user.public_metadata?.updatedAt
    }));
  } catch (error) {
    console.error('[staff-metadata] Error listing staff:', error);
    return [];
  }
}

/**
 * GET endpoint - List staff or get specific staff metadata
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const ownerId = searchParams.get('ownerId');

    // Get specific staff metadata
    if (userId) {
      const metadata = await fetchUserMetadata(userId);

      if (!metadata) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        userId,
        metadata
      });
    }

    // List all staff for an owner
    if (ownerId) {
      const staff = await listStaffForOwner(ownerId);
      return NextResponse.json({
        ownerId,
        staff,
        count: staff.length
      });
    }

    // Missing required parameters
    return NextResponse.json(
      { error: 'userId or ownerId is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[staff-metadata] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get staff metadata' },
      { status: 500 }
    );
  }
}

/**
 * PATCH endpoint - Update staff metadata
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role, username, ownerUsername, companyName, isActive } =
      body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Fetch current metadata to preserve existing fields
    const currentMetadata = await fetchUserMetadata(userId);

    if (!currentMetadata) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build updated metadata
    const publicMetadata: Record<string, any> = {
      ...currentMetadata,
      updatedAt: Date.now()
    };

    // Update role if provided
    if (role) {
      const normalizedRole = role.toLowerCase();
      if (!isValidStaffRole(normalizedRole)) {
        return NextResponse.json(
          {
            error: `Invalid role. Must be one of: ${STAFF_ROLES.join(', ')}`
          },
          { status: 400 }
        );
      }
      publicMetadata.role = normalizedRole;
    }

    // Update other fields
    if (username !== undefined) {
      publicMetadata.username = username;
    }
    if (ownerUsername !== undefined) {
      publicMetadata.ownerUsername = ownerUsername;
    }
    if (companyName !== undefined) {
      publicMetadata.companyName = companyName;
    }
    if (isActive !== undefined) {
      publicMetadata.isActive = isActive;
    }

    // Update Clerk metadata
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata
    });

    return NextResponse.json({
      success: true,
      userId,
      metadata: publicMetadata
    });
  } catch (error) {
    console.error('[staff-metadata] PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update staff metadata' },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint - Sync metadata from Convex to Clerk
 *
 * This is called when setting up staff from Convex companyMembers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      staffMembers, // Array of { userId, role, email, displayName }
      ownerId,
      ownerUsername,
      companyName
    } = body;

    // Validate required fields
    if (!ownerId || !staffMembers || !Array.isArray(staffMembers)) {
      return NextResponse.json(
        { error: 'ownerId and staffMembers array are required' },
        { status: 400 }
      );
    }

    const results: any[] = [];

    // Update each staff member's metadata
    for (const member of staffMembers) {
      if (!member.userId) continue;

      try {
        const currentMetadata = await fetchUserMetadata(member.userId);

        const publicMetadata = {
          ...(currentMetadata || {}),
          role: member.role || 'staff',
          companyOwnerId: ownerId,
          ownerUsername: ownerUsername || 'owner',
          companyName: companyName || '',
          updatedAt: Date.now()
        };

        const clerk = await clerkClient();
        await clerk.users.updateUserMetadata(member.userId, {
          publicMetadata
        });

        results.push({
          userId: member.userId,
          success: true
        });
      } catch (memberError) {
        console.error(
          '[staff-metadata] Error updating member:',
          member.userId,
          memberError
        );
        results.push({
          userId: member.userId,
          success: false,
          error: String(memberError)
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      total: staffMembers.length,
      successful: successCount,
      failed: staffMembers.length - successCount,
      results
    });
  } catch (error) {
    console.error('[staff-metadata] POST sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync staff metadata' },
      { status: 500 }
    );
  }
}

/**
 * DELETE endpoint - Remove staff metadata
 * Only clears company-related fields, preserves username
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Fetch current metadata
    const currentMetadata = await fetchUserMetadata(userId);

    if (!currentMetadata) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Clear company-related fields but preserve essential info
    const publicMetadata = {
      username: currentMetadata.username,
      role: 'staff', // Reset to default role
      updatedAt: Date.now()
    };

    // Update Clerk metadata
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata
    });

    return NextResponse.json({
      success: true,
      userId,
      message: 'Company metadata cleared'
    });
  } catch (error) {
    console.error('[staff-metadata] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to clear staff metadata' },
      { status: 500 }
    );
  }
}
