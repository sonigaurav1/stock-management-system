import { NextRequest, NextResponse } from 'next/server';

/**
 * Mark a user as having submitted company details
 * Updates Clerk user's public metadata with companyDetailsSubmitted flag
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    // Validate required field
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Validate userId format (should be from Clerk)
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid userId format' },
        { status: 400 }
      );
    }

    // Get Clerk API key
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      console.error('CLERK_SECRET_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Update Clerk user metadata via Clerk API
    const clerkResponse = await fetch(
      `https://api.clerk.dev/v1/users/${userId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${clerkSecretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          public_metadata: {
            companyDetailsSubmitted: true,
            companyDetailsSubmittedAt: new Date().toISOString()
          }
        })
      }
    );

    if (!clerkResponse.ok) {
      const errorData = await clerkResponse.text();
      console.error(
        'Clerk API error updating user metadata:',
        clerkResponse.status,
        errorData
      );
      return NextResponse.json(
        { error: `Failed to update user metadata: ${clerkResponse.status}` },
        { status: clerkResponse.status }
      );
    }

    const updatedUser = await clerkResponse.json();

    console.log(
      `Successfully marked company details as submitted for user ${userId}`
    );

    return NextResponse.json({
      success: true,
      message: 'Company details marked as submitted',
      userId: updatedUser.id
    });
  } catch (error) {
    console.error('Error in company-details-submitted endpoint:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
