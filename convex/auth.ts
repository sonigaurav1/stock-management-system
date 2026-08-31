import { query } from './_generated/server';
import { resolveCallerContext } from './lib/authHelper';

/**
 * Get current user's permissions and role
 * Used by frontend to conditionally render UI elements
 */
export const getCurrentUserPermissions = query({
  args: {},
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);

    return {
      permissions: caller.permissions,
      role: caller.role,
      isOwner: caller.isOwner
    };
  }
});
