import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Create a new organization
export const createOrganization = mutation({
  args: {
    name: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const ownerId = identity.subject;

    const organizationId = await ctx.db.insert('organizations', {
      name: args.name,
      ownerId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Add owner as admin to the organization
    await ctx.db.insert('organizationMembers', {
      organizationId,
      userId: ownerId,
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;

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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;

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
