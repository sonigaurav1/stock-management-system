import { NextResponse } from 'next/server';

export async function PATCH(req: Request) {
  const body = await req.json();
  const { userId, role } = body;

  // Validate the role is one of your allowed roles
  const validRoles = ['Admin', 'Editor', 'User'];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

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
          role
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update Clerk metadata');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}
