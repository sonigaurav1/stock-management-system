import { mutation, query, action } from './_generated/server';
import { v } from 'convex/values';
import { resolveCallerContext, getDataScopeUserId } from './lib/authHelper';
import { BUSINESS_TYPE_VALUES } from './lib/schemaConstants';

// Create account status for new user
export const createAccountStatus = mutation({
  args: {
    userId: v.string(),
    businessType: v.union(...BUSINESS_TYPE_VALUES.map(v.literal))
  },
  handler: async (ctx, args) => {
    // Authentication check: verify the caller is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Authorization check: user can only create their own account status
    // OR super admins can create for anyone
    const superAdminIds =
      process.env.NEXT_PUBLIC_SUPER_ADMIN_USER_IDS?.split(',') || [];
    const isSuperAdmin = superAdminIds.includes(identity.subject);

    if (identity.subject !== args.userId && !isSuperAdmin) {
      throw new Error('Can only create account status for yourself');
    }

    // Check if account status already exists
    const existing = await ctx.db
      .query('accountStatus')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create new account status - auto-approved on signup
    const accountStatusId = await ctx.db.insert('accountStatus', {
      userId: args.userId,
      businessType: args.businessType,
      status: 'approved', // Auto-approved on signup
      approvedBy: 'system:auto-signup',
      approvedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    return accountStatusId;
  }
});

// Get account status for current user
export const getAccountStatus = query({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('accountStatus')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();
  }
});

// Check if user can access dashboard/admin (super admin only)
export const checkUserAccess = query({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const accountStatus = await ctx.db
      .query('accountStatus')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (!accountStatus) {
      return {
        hasAccess: false,
        reason: 'Account not found',
        status: null
      };
    }

    if (accountStatus.status === 'blocked') {
      return {
        hasAccess: false,
        reason: accountStatus.blockedReason || 'Your account has been blocked',
        status: 'blocked'
      };
    }

    if (accountStatus.status === 'suspended') {
      return {
        hasAccess: false,
        reason: 'Your account has been suspended',
        status: 'suspended'
      };
    }

    if (accountStatus.status === 'approved') {
      return {
        hasAccess: true,
        reason: null,
        status: 'approved'
      };
    }

    return {
      hasAccess: false,
      reason: 'Account pending approval',
      status: 'pending'
    };
  }
});

// Block user account (super admin only)
export const blockAccount = mutation({
  args: {
    userId: v.string(),
    reason: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    // Verify super admin
    const superAdminIds =
      process.env.NEXT_PUBLIC_SUPER_ADMIN_USER_IDS?.split(',') || [];
    if (!superAdminIds.includes(identity.subject)) {
      throw new Error('Only super admins can block accounts');
    }

    const accountStatus = await ctx.db
      .query('accountStatus')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (!accountStatus) {
      throw new Error('Account not found');
    }

    await ctx.db.patch(accountStatus._id, {
      status: 'blocked',
      blockedBy: identity.subject,
      blockedAt: Date.now(),
      blockedReason: args.reason,
      updatedAt: Date.now()
    });

    return accountStatus._id;
  }
});

// Unblock user account (super admin only)
export const unblockAccount = mutation({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    // Verify super admin
    const superAdminIds =
      process.env.NEXT_PUBLIC_SUPER_ADMIN_USER_IDS?.split(',') || [];
    if (!superAdminIds.includes(identity.subject)) {
      throw new Error('Only super admins can unblock accounts');
    }

    const accountStatus = await ctx.db
      .query('accountStatus')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (!accountStatus) {
      throw new Error('Account not found');
    }

    await ctx.db.patch(accountStatus._id, {
      status: 'approved',
      blockedBy: undefined,
      blockedAt: undefined,
      blockedReason: undefined,
      updatedAt: Date.now()
    });

    return accountStatus._id;
  }
});

// Suspend account (super admin only)
export const suspendAccount = mutation({
  args: {
    userId: v.string(),
    reason: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    // Verify super admin
    const superAdminIds =
      process.env.NEXT_PUBLIC_SUPER_ADMIN_USER_IDS?.split(',') || [];
    if (!superAdminIds.includes(identity.subject)) {
      throw new Error('Only super admins can suspend accounts');
    }

    const accountStatus = await ctx.db
      .query('accountStatus')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (!accountStatus) {
      throw new Error('Account not found');
    }

    await ctx.db.patch(accountStatus._id, {
      status: 'suspended',
      blockedBy: identity.subject,
      blockedAt: Date.now(),
      blockedReason: args.reason,
      updatedAt: Date.now()
    });

    return accountStatus._id;
  }
});

// Get all accounts for super admin dashboard
export const getAllAccounts = query({
  handler: async (ctx) => {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);

    // Verify super admin
    const superAdminIds =
      process.env.NEXT_PUBLIC_SUPER_ADMIN_USER_IDS?.split(',') || [];
    if (!superAdminIds.includes(caller.callerId)) {
      throw new Error('Only super admins can view all accounts');
    }

    return await ctx.db.query('accountStatus').collect();
  }
});

// Get accounts by status (super admin only)
export const getAccountsByStatus = query({
  args: {
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('blocked'),
      v.literal('suspended')
    )
  },
  handler: async (ctx, args) => {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);

    // Verify super admin
    const superAdminIds =
      process.env.NEXT_PUBLIC_SUPER_ADMIN_USER_IDS?.split(',') || [];
    if (!superAdminIds.includes(caller.callerId)) {
      throw new Error('Only super admins can view accounts');
    }

    return await ctx.db
      .query('accountStatus')
      .withIndex('by_status', (q) => q.eq('status', args.status))
      .collect();
  }
});

// Update business type (user can update their own, or super admin)
export const updateBusinessType = mutation({
  args: {
    userId: v.string(),
    businessType: v.union(...BUSINESS_TYPE_VALUES.map(v.literal))
  },
  handler: async (ctx, args) => {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);

    // Users can only update their own business type
    // OR super admins can update any user's business type
    const superAdminIds =
      process.env.NEXT_PUBLIC_SUPER_ADMIN_USER_IDS?.split(',') || [];
    const isSuperAdmin = superAdminIds.includes(caller.callerId);

    if (caller.callerId !== args.userId && !isSuperAdmin) {
      throw new Error('Can only update your own account');
    }

    const accountStatus = await ctx.db
      .query('accountStatus')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (!accountStatus) {
      throw new Error('Account not found');
    }

    await ctx.db.patch(accountStatus._id, {
      businessType: args.businessType,
      updatedAt: Date.now()
    });

    return accountStatus._id;
  }
});

// Verify onboarding completion - ensures all data is in sync and returns if ready
export const verifyOnboardingComplete = query({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);

    // Users can only check their own onboarding status
    // OR super admins can check any user's status
    const superAdminIds =
      process.env.NEXT_PUBLIC_SUPER_ADMIN_USER_IDS?.split(',') || [];
    const isSuperAdmin = superAdminIds.includes(caller.callerId);

    if (caller.callerId !== args.userId && !isSuperAdmin) {
      throw new Error('Can only check your own onboarding status');
    }

    const accountStatus = await ctx.db
      .query('accountStatus')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (!accountStatus) {
      return {
        isComplete: false,
        reason: 'Account status not initialized',
        canRetry: true
      };
    }

    if (accountStatus.status !== 'approved') {
      return {
        isComplete: false,
        reason: `Account status is ${accountStatus.status}`,
        canRetry: accountStatus.status === 'pending'
      };
    }

    // All checks passed
    return {
      isComplete: true,
      reason: null,
      canRetry: false
    };
  }
});
