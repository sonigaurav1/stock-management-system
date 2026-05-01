import { NextRequest, NextResponse } from 'next/server';

/**
 * Enterprise User Metadata API
 *
 * PATCH /api/user-metadata - Update username and preserve company context
 * GET /api/user-metadata - Get current user metadata
 *
 * This API handles username updates while preserving existing
 * multi-tenant metadata (role, companyOwnerId, ownerUsername, etc.)
 */

// Validate username format (3-30 chars, alphanumeric, underscore, hyphen)
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

/**
 * Fetch current user metadata from Clerk
 * Used to preserve existing fields during updates
 */
async function fetchCurrentMetadata(
  userId: string
): Promise<Record<string, any>> {
  try {
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return {};
    }

    const userData = await response.json();
    return userData.public_metadata || {};
  } catch (error) {
    console.error('Error fetching current metadata:', error);
    return {};
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const {
      userId,
      username,
      companyOwnerId,
      ownerUsername,
      companyName,
      role
    } = await request.json();

    // Validate required field
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Validate username format if provided
    if (username && !USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        {
          error:
            'Invalid username format. Must be 3-30 alphanumeric characters, underscores, or hyphens.'
        },
        { status: 400 }
      );
    }

    // Fetch current metadata to preserve existing fields
    const currentMetadata = await fetchCurrentMetadata(userId);

    // Build updated metadata - merge with existing
    const publicMetadata: Record<string, any> = {
      ...currentMetadata,
      updatedAt: Date.now()
    };

    // Update username if provided
    if (username) {
      publicMetadata.username = username;
    }

    // Update company context if provided
    if (companyOwnerId !== undefined) {
      publicMetadata.companyOwnerId = companyOwnerId;
    }
    if (ownerUsername !== undefined) {
      publicMetadata.ownerUsername = ownerUsername;
    }
    if (companyName !== undefined) {
      publicMetadata.companyName = companyName;
    }
    if (role !== undefined) {
      publicMetadata.role = role;
    }

    // Call Clerk API to update public metadata
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_metadata: publicMetadata
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.warn('Clerk API error:', response.status, errorData);
      return NextResponse.json(
        { error: 'Failed to update Clerk metadata' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Username stored successfully',
      metadata: publicMetadata
    });
  } catch (error) {
    console.error('Error storing username:', error);
    return NextResponse.json(
      { error: 'Failed to store username' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve user metadata
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

    // Fetch current metadata
    const metadata = await fetchCurrentMetadata(userId);

    return NextResponse.json({
      userId,
      metadata
    });
  } catch (error) {
    console.error('Error getting user metadata:', error);
    return NextResponse.json(
      { error: 'Failed to get user metadata' },
      { status: 500 }
    );
  }
}
