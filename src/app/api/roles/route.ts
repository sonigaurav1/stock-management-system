import { clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to set user roles in Clerk with multi-tenant metadata
 *
 * POST /api/roles - Create or update user role
 * PATCH /api/roles - Update user role (from signup flow)
 *
 * Enterprise Metadata Structure:
 * - Owner: { role, username, companyOwnerId, isMultiTenant }
 * - Staff: { role, username, companyOwnerId, ownerUsername, companyName }
 */

// Valid roles for the system
const VALID_ROLES = ['owner', 'manager', 'staff', 'viewer'] as const;
type UserRole = (typeof VALID_ROLES)[number];

/**
 * Get company owner details for a user
 * Used to determine companyOwnerId for staff members
 */
async function getCompanyOwnerContext(userId: string): Promise<{
  companyOwnerId: string | null;
  ownerUsername: string | null;
  companyName: string | null;
} | null> {
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
    return {
      companyOwnerId: userData.public_metadata?.companyOwnerId || null,
      ownerUsername: userData.public_metadata?.ownerUsername || null,
      companyName: userData.public_metadata?.companyName || null
    };
  } catch (error) {
    console.error('Error fetching company owner context:', error);
    return null;
  }
}

/**
 * Check if user is an owner (has staff members)
 */
async function checkIsMultiTenant(ownerId: string): Promise<boolean> {
  try {
    // Query companyMembers to check if owner has any staff
    // This would require Convex query, but we'll use Clerk metadata flag
    const response = await fetch(`https://api.clerk.dev/v1/users/${ownerId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return false;
    }

    const userData = await response.json();
    // Check if isMultiTenant flag is set or if they have companyMembers in Convex
    return userData.public_metadata?.isMultiTenant === true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate role is in allowed list
 */
function isValidRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role.toLowerCase() as UserRole);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      role = 'staff',
      username,
      companyOwnerId,
      ownerUsername,
      companyName,
      isMultiTenant = false
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Validate role
    const normalizedRole = role.toLowerCase();
    if (!isValidRole(normalizedRole)) {
      return NextResponse.json(
        {
          error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Determine metadata based on role
    const isOwner = normalizedRole === 'owner';
    const publicMetadata: Record<string, any> = {
      role: normalizedRole,
      updatedAt: Date.now()
    };

    // Add username if provided
    if (username) {
      publicMetadata.username = username;
    }

    if (isOwner) {
      // Owner metadata: set companyOwnerId to self, isMultiTenant flag
      publicMetadata.companyOwnerId = userId;
      publicMetadata.isMultiTenant = isMultiTenant;
    } else {
      // Staff metadata: companyOwnerId is the owner's Clerk ID
      if (companyOwnerId) {
        publicMetadata.companyOwnerId = companyOwnerId;
      }
      if (ownerUsername) {
        publicMetadata.ownerUsername = ownerUsername;
      }
      if (companyName) {
        publicMetadata.companyName = companyName;
      }
    }

    // Update user's public metadata with role and company context
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata
    });

    return NextResponse.json(
      {
        success: true,
        message: `User role set to ${normalizedRole}`,
        metadata: publicMetadata
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error setting user role:', error);
    return NextResponse.json(
      { error: 'Failed to set user role' },
      { status: 500 }
    );
  }
}

// In-memory rate limiting (per-process, not distributed)
// For production, use Redis or similar
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10; // requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

/**
 * Check rate limit for a user
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const key = `roles_api:${userId}`;
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    // New window
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return false;
  }

  current.count++;
  return true;
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      role,
      username,
      companyOwnerId,
      ownerUsername,
      companyName,
      isMultiTenant,
      idempotencyKey // Optional: for retry safety
    } = body;

    // Validation
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Validate userId format (Clerk user IDs start with 'user_')
    if (!userId.startsWith('user_')) {
      return NextResponse.json(
        { error: 'Invalid userId format' },
        { status: 400 }
      );
    }

    // Build partial metadata update
    const publicMetadata: Record<string, any> = {
      updatedAt: Date.now()
    };

    // Add idempotency key if provided (for tracking retries)
    if (idempotencyKey) {
      publicMetadata.lastIdempotencyKey = idempotencyKey;
    }

    // Validate and add role if provided
    if (role) {
      const normalizedRole = role.toLowerCase();
      if (!isValidRole(normalizedRole)) {
        return NextResponse.json(
          {
            error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`
          },
          { status: 400 }
        );
      }
      publicMetadata.role = normalizedRole;

      // Add role-specific metadata
      if (normalizedRole === 'owner') {
        publicMetadata.companyOwnerId = userId;
        if (isMultiTenant !== undefined) {
          publicMetadata.isMultiTenant = isMultiTenant;
        }
      } else if (companyOwnerId) {
        // Validate companyOwnerId format
        if (!companyOwnerId.startsWith('user_')) {
          return NextResponse.json(
            { error: 'Invalid companyOwnerId format' },
            { status: 400 }
          );
        }
        publicMetadata.companyOwnerId = companyOwnerId;
      }
    }

    // Add other optional fields
    if (username !== undefined) {
      publicMetadata.username = username;
    }
    if (ownerUsername !== undefined) {
      publicMetadata.ownerUsername = ownerUsername;
    }
    if (companyName !== undefined) {
      publicMetadata.companyName = companyName;
    }

    // Update user's public metadata
    const clerk = await clerkClient();

    try {
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata
      });
    } catch (clerkError: any) {
      console.error('[roles API] Clerk update failed:', clerkError);

      // Handle specific Clerk errors
      if (clerkError?.status === 404) {
        return NextResponse.json(
          { error: 'User not found in Clerk' },
          { status: 404 }
        );
      }
      if (clerkError?.status === 429) {
        return NextResponse.json(
          { error: 'Clerk rate limit exceeded. Please try again.' },
          { status: 429 }
        );
      }

      throw clerkError; // Re-throw for general error handling
    }

    // Verify the update by fetching the user back
    const updatedUser = await clerk.users.getUser(userId);
    const verifiedMetadata = updatedUser.publicMetadata;

    return NextResponse.json(
      {
        success: true,
        message: `User role updated`,
        metadata: publicMetadata,
        verified: {
          role: verifiedMetadata.role,
          companyOwnerId: verifiedMetadata.companyOwnerId
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[roles API] Error updating user role:', error);

    // Return more detailed error in development
    const isDev = process.env.NODE_ENV === 'development';

    return NextResponse.json(
      {
        error: 'Failed to update user role',
        details: isDev ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve user metadata (for debugging)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Fetch user from Clerk
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    return NextResponse.json(
      {
        userId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        publicMetadata: user.publicMetadata,
        privateMetadata: user.privateMetadata
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error getting user metadata:', error);
    return NextResponse.json(
      { error: 'Failed to get user metadata' },
      { status: 500 }
    );
  }
}
