import { mutation } from './_generated/server';

export const adminOnlyFunction = mutation(async ({ db, auth }) => {
  const user = await auth.getUserIdentity();
  const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

  if (user?.id !== ADMIN_USER_ID) {
    throw new Error('Unauthorized: Only admins can perform this action.');
  }

  // Admin-only logic here
  return { message: 'Admin action performed successfully.' };
});
