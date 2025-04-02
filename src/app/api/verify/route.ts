// 3. MIDDLEWARE SERVICE: Create a simple Express or Next.js API route

import { NextResponse } from 'next/server';

// file: middleware/api/update-clerk.js (example for Next.js API route)
export async function PATCH(req: Request) {
  const body = await req.json();
  const { userId, isVerified } = body;
  // // Validate secret
  // if (secret !== process.env.CONVEX_SECRET_TOKEN) {
  //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  // TODO: Add validation check from Convex to ensure the userId is valid and belongs to the authenticated user

  try {
    // Call Clerk API to update public metadata
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_metadata: {
          isVerified
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update Clerk metadata');
    }

    // // Also update Convex to keep systems in sync
    // await fetch('https://your-convex-deployment.convex.cloud/update-verification-result', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         userId,
    //         isVerified,
    //         token: process.env.MIDDLEWARE_SECRET_TOKEN
    //     })
    // });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating user verification:', error);
    return NextResponse.json({ error: error }, { status: 200 });
  }
}
