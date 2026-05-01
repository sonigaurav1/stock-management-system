import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// List all team members for a company (owner's company)
export const listCompanyTeamMembers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const companyOwnerId = identity.subject;

    // Get all users who are invited to this company (members with this owner as the company)
    const members = await ctx.db
      .query('companyMembers')
      .withIndex('by_company', (q) => q.eq('companyOwnerId', companyOwnerId))
      .collect();

    // Get role info for each member
    const ROLE_DEFINITIONS = {
      manager: {
        name: 'Manager',
        permissions: [
          'view_inventory',
          'create_transaction',
          'edit_transaction',
          'export_data',
          'view_reports',
          'view_audit_logs',
          'approve_transaction'
        ]
      },
      staff: {
        name: 'Staff',
        permissions: [
          'view_inventory',
          'create_transaction',
          'edit_transaction'
        ]
      },
      viewer: {
        name: 'Viewer',
        permissions: ['view_inventory', 'view_reports']
      },
      owner: {
        name: 'Owner',
        permissions: [
          'view_inventory',
          'create_transaction',
          'edit_transaction',
          'delete_transaction',
          'export_data',
          'view_reports',
          'manage_users',
          'view_audit_logs',
          'manage_settings',
          'view_compliance',
          'approve_transaction'
        ]
      }
    };

    return members.map((m) => ({
      ...m,
      roleInfo: ROLE_DEFINITIONS[m.role as keyof typeof ROLE_DEFINITIONS]
    }));
  }
});

// Invite a team member to the company
export const inviteCompanyMember = mutation({
  args: {
    email: v.string(),
    role: v.string(), // 'manager' | 'staff' | 'viewer'
    displayName: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const companyOwnerId = identity.subject;

    // Validate role
    const validRoles = ['manager', 'staff', 'viewer'];
    if (!validRoles.includes(args.role)) {
      throw new Error('Invalid role');
    }

    // Check if member already invited
    const existing = await ctx.db
      .query('companyMembers')
      .withIndex('by_company_and_email', (q) =>
        q
          .eq('companyOwnerId', companyOwnerId)
          .eq('email', args.email.toLowerCase())
      )
      .first();

    if (existing) {
      throw new Error('Member already invited to this company');
    }

    // Create invitation record
    const memberId = await ctx.db.insert('companyMembers', {
      companyOwnerId,
      email: args.email.toLowerCase(),
      displayName: args.displayName || args.email.split('@')[0],
      role: args.role,
      status: 'invited', // 'invited' | 'accepted' | 'removed'
      invitedAt: Date.now(),
      invitedBy: companyOwnerId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Create audit log
    await ctx.db.insert('auditLog', {
      userId: companyOwnerId,
      action: 'member.invited',
      entityType: 'companyMember',
      entityId: memberId,
      changes: {
        email: args.email,
        role: args.role,
        displayName: args.displayName
      },
      createdAt: Date.now()
    });

    return memberId;
  }
});

// Remove a team member from the company
export const removeCompanyMember = mutation({
  args: {
    memberId: v.id('companyMembers')
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const member = await ctx.db.get(args.memberId);
    if (!member) throw new Error('Member not found');

    // Verify ownership
    if (member.companyOwnerId !== identity.subject) {
      throw new Error('Unauthorized');
    }

    // Prevent removing self
    if (member.email === identity.subject) {
      throw new Error('Cannot remove yourself');
    }

    // Soft delete by marking as removed
    await ctx.db.patch(args.memberId, {
      status: 'removed',
      updatedAt: Date.now()
    });

    // Create audit log
    await ctx.db.insert('auditLog', {
      userId: identity.subject,
      action: 'member.removed',
      entityType: 'companyMember',
      entityId: args.memberId,
      changes: {
        status: 'removed'
      },
      createdAt: Date.now()
    });
  }
});

// Update member role
export const updateCompanyMemberRole = mutation({
  args: {
    memberId: v.id('companyMembers'),
    role: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const member = await ctx.db.get(args.memberId);
    if (!member) throw new Error('Member not found');

    // Verify ownership
    if (member.companyOwnerId !== identity.subject) {
      throw new Error('Unauthorized');
    }

    // Validate role
    const validRoles = ['manager', 'staff', 'viewer'];
    if (!validRoles.includes(args.role)) {
      throw new Error('Invalid role');
    }

    const oldRole = member.role;

    await ctx.db.patch(args.memberId, {
      role: args.role,
      updatedAt: Date.now()
    });

    // Create audit log
    await ctx.db.insert('auditLog', {
      userId: identity.subject,
      action: 'member.role_updated',
      entityType: 'companyMember',
      entityId: args.memberId,
      changes: {
        oldRole,
        newRole: args.role
      },
      createdAt: Date.now()
    });
  }
});

// Resend invitation
export const resendInvitation = mutation({
  args: {
    memberId: v.id('companyMembers')
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const member = await ctx.db.get(args.memberId);
    if (!member) throw new Error('Member not found');

    // Verify ownership
    if (member.companyOwnerId !== identity.subject) {
      throw new Error('Unauthorized');
    }

    await ctx.db.patch(args.memberId, {
      updatedAt: Date.now()
    });

    // Create audit log
    await ctx.db.insert('auditLog', {
      userId: identity.subject,
      action: 'invitation.resent',
      entityType: 'companyMember',
      entityId: args.memberId,
      changes: {
        email: member.email
      },
      createdAt: Date.now()
    });
  }
});

// Get company member count
export const getCompanyMemberCount = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const members = await ctx.db
      .query('companyMembers')
      .withIndex('by_company', (q) => q.eq('companyOwnerId', identity.subject))
      .collect();

    return {
      total: members.length,
      active: members.filter((m) => m.status === 'accepted').length,
      pending: members.filter((m) => m.status === 'invited').length,
      removed: members.filter((m) => m.status === 'removed').length
    };
  }
});
