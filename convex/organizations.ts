import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

// Create a new organization
export const createOrganization = mutation({
  args: {
    name: v.string()
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);
    const userId = getDataScopeUserId(caller);

    const organizationId = await ctx.db.insert('organizations', {
      name: args.name,
      ownerId: userId,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Add owner as admin to the organization
    await ctx.db.insert('organizationMembers', {
      organizationId,
      userId: userId,
      role: 'admin',
      joinedAt: Date.now()
    });

    return organizationId;
  }
});

// Invite a user to an organization
export const inviteUserToOrganization = mutation({
  args: {
    organizationId: v.id('organizations'),
    userEmail: v.string(),
    role: v.string()
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_USERS);
    const userId = getDataScopeUserId(caller);

    // Check if user is admin of the organization
    const membership = await ctx.db
      .query('organizationMembers')
      .withIndex('by_org_and_user', (q) =>
        q.eq('organizationId', args.organizationId).eq('userId', userId)
      )
      .first();

    if (!membership || membership.role !== 'admin') {
      throw new Error('Unauthorized. Only admins can invite users.');
    }

    // Here you would send an invite email with Clerk's email API
    // This is a simplified example - in real app, you'd integrate with Clerk's API
    // to create an organization invitation

    // For demo purposes, let's assume the user already exists and we know their userId
    // In a real app, you'd handle the full invitation flow
    const invitedUserId = 'user_' + args.userEmail.replace(/[^a-zA-Z0-9]/g, '');

    // Check if the user is already a member
    const existingMembership = await ctx.db
      .query('organizationMembers')
      .withIndex('by_org_and_user', (q) =>
        q.eq('organizationId', args.organizationId).eq('userId', invitedUserId)
      )
      .first();

    if (existingMembership) {
      throw new Error('User is already a member of this organization');
    }

    // Add user to organization
    return await ctx.db.insert('organizationMembers', {
      organizationId: args.organizationId,
      userId: invitedUserId,
      role: args.role,
      joinedAt: Date.now()
    });
  }
});

// Get organizations a user belongs to
export const getUserOrganizations = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx); // caller context contains callerId, isOwner, membershipId, ownerId, permissions, roles
    // console.log('caller', caller.callerId)
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);
    const userId = getDataScopeUserId(caller);

    // Get all memberships
    const memberships = await ctx.db
      .query('organizationMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    // Fetch full organization details for each membership
    const orgs = await Promise.all(
      memberships.map(async (membership) => {
        const org = await ctx.db.get(membership.organizationId);
        return {
          ...org,
          role: membership.role
        };
      })
    );

    return orgs;
  }
});

// Upsert organization settings (create or update)
export const upsertOrganizationSettings = mutation({
  args: {
    userId: v.string(),
    companyName: v.string(),
    businessType: v.string(),
    taxNumber: v.string(),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    postalCode: v.optional(v.string()),
    country: v.string(),
    phone: v.optional(v.string()),
    email: v.string(),
    website: v.optional(v.string()),
    description: v.optional(v.string()),
    logo: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    if (identity.subject !== args.userId) {
      throw new Error('Can only update your own settings');
    }

    // Check if settings already exist for this user
    const existing = await ctx.db
      .query('organizationSettings')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        companyName: args.companyName,
        businessType: args.businessType,
        taxNumber: args.taxNumber,
        address: args.address,
        city: args.city,
        state: args.state,
        postalCode: args.postalCode,
        country: args.country,
        phone: args.phone,
        email: args.email,
        website: args.website,
        description: args.description,
        logo: args.logo,
        updatedAt: Date.now()
      });
      return existing._id;
    } else {
      // Create new
      return await ctx.db.insert('organizationSettings', {
        userId: args.userId,
        companyName: args.companyName,
        businessType: args.businessType,
        taxNumber: args.taxNumber,
        address: args.address,
        city: args.city,
        state: args.state,
        postalCode: args.postalCode,
        country: args.country,
        phone: args.phone,
        email: args.email,
        website: args.website,
        description: args.description,
        logo: args.logo,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
  }
});

// Get organization settings for a user
export const getOrganizationSettings = query({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('organizationSettings')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();
  }
});
