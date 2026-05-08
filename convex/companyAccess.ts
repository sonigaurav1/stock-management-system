import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS, getPresetPermissions } from './lib/permissions';

// ============ UTILITY FUNCTIONS ============

/**
 * Generate a unique 24-character token for invite links
 */
function generateInviteToken(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Get invite link URL
 */
function getInviteLink(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/accept-invite?token=${token}`;
}

/**
 * Send invitation email via SendGrid (Action - can call external APIs)
 */
/**
 * Invite a new staff member to your organization
 * Only organization owners can invite
 */
export const inviteMember = mutation({
  args: {
    email: v.string(),
    displayName: v.string(),
    role: v.string() // "staff", "manager", "viewer", or custom role name
  },
  handler: async (ctx, args) => {
    try {
      const caller = await resolveCallerContext(ctx);
      requirePermission(caller, PERMISSIONS.MANAGE_USERS);

      // Only owners can manage users (not staff members)
      if (!caller.isOwner) {
        throw new Error('Only organization owners can invite members');
      }

      // Validate email format
      if (!args.email.includes('@')) {
        throw new Error('Invalid email address');
      }

      // Check if role exists (it should if it's a preset, but let's verify custom roles)
      const roleExists =
        Object.keys({
          owner: 'owner',
          manager: 'manager',
          staff: 'staff',
          viewer: 'viewer'
        }).includes(args.role.toLowerCase()) ||
        (await ctx.db
          .query('customRoles')
          .withIndex('by_user', (q) => q.eq('userId', caller.ownerId))
          .filter((q) => q.eq(q.field('name'), args.role))
          .first()) !== null;

      if (!roleExists) {
        throw new Error(`Role "${args.role}" does not exist`);
      }

      // Check if already invited
      const existingInvite = await ctx.db
        .query('companyMembers')
        .withIndex('by_company_and_email', (q) =>
          q.eq('companyOwnerId', caller.ownerId).eq('email', args.email)
        )
        .first();

      if (existingInvite) {
        if (existingInvite.status === 'accepted') {
          throw new Error(
            `${args.email} is already a member of your organization`
          );
        }
        if (existingInvite.status === 'invited') {
          throw new Error(`${args.email} has already been invited`);
        }
      }

      const now = Date.now();
      const token = generateInviteToken();
      const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days
      const inviteLink = getInviteLink(token);

      const membershipId = await ctx.db.insert('companyMembers', {
        companyOwnerId: caller.ownerId,
        email: args.email,
        displayName: args.displayName,
        role: args.role,
        status: 'invited',
        token, // Add unique token
        expiresAt, // Add expiry
        resendCount: 0, // Track resends
        invitedAt: now,
        invitedBy: caller.callerId,
        createdAt: now,
        updatedAt: now
      });

      console.log(
        '[inviteMember] Invitation created with ID:',
        membershipId,
        'token:',
        token
      );

      // Note: Email sending handled by UI calling sendInviteEmail action

      return {
        success: true,
        membershipId,
        email: args.email,
        displayName: args.displayName,
        role: args.role,
        token,
        inviteLink,
        expiresAt,
        message: `Invitation created for ${args.email}. Share the link or email them directly.`
      };
    } catch (error: any) {
      console.error('[inviteMember] Error:', error.message);
      throw error;
    }
  }
});

/**
 * List all invited and accepted members of your organization
 */
export const listOrganizationMembers = query({
  args: {},
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_USERS);

    if (!caller.isOwner) {
      throw new Error('Only organization owners can view members');
    }

    const members = await ctx.db
      .query('companyMembers')
      .withIndex('by_company', (q) => q.eq('companyOwnerId', caller.ownerId))
      .collect();

    return members.map((m) => ({
      _id: m._id,
      email: m.email,
      displayName: m.displayName,
      role: m.role,
      status: m.status,
      invitedAt: m.invitedAt,
      acceptedAt: m.acceptedAt,
      invitedBy: m.invitedBy
    }));
  }
});

/**
 * Remove a member from organization
 */
export const removeMember = mutation({
  args: {
    membershipId: v.id('companyMembers')
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_USERS);

    if (!caller.isOwner) {
      throw new Error('Only organization owners can remove members');
    }

    const membership = await ctx.db.get(args.membershipId);
    if (!membership || membership.companyOwnerId !== caller.ownerId) {
      throw new Error('Member not found');
    }

    // Can't remove the owner
    if (membership.userId === caller.ownerId) {
      throw new Error('Cannot remove the organization owner');
    }

    const removedUserId = membership.userId;
    const removedEmail = membership.email;
    const removedRole = membership.role;

    // FIX: Clear member's Clerk metadata (if user had accepted invitation)
    if (removedUserId) {
      try {
        await fetch(
          `https://api.clerk.com/v1/users/${removedUserId}/metadata`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              public_metadata: {
                role: null,
                companyOwnerId: null,
                membershipId: null,
                removedAt: Date.now()
              }
            })
          }
        );
      } catch (error) {
        console.error('[removeMember] Failed to clear Clerk metadata:', error);
        // Log but don't fail — DB is source of truth
      }
    }

    // FIX: Clear userId link and update status
    await ctx.db.patch(args.membershipId, {
      status: 'removed',
      userId: undefined, // Clear the link to Clerk user
      role: undefined, // Clear role
      updatedAt: Date.now()
    });

    // FIX: Write to audit log
    await ctx.db.insert('auditLog', {
      userId: caller.ownerId,
      action: 'member_removed',
      entityType: 'companyMember',
      entityId: args.membershipId.toString(),
      changes: {
        removedUserId,
        removedEmail,
        removedRole,
        removedBy: caller.callerId,
        removedAt: Date.now()
      },
      ipAddress:
        (ctx as any).request?.headers?.get('x-forwarded-for') || undefined,
      createdAt: Date.now()
    });

    return {
      success: true,
      message: 'Member removed',
      removedUserId,
      auditLogCreated: true
    };
  }
});

/**
 * Update a member's role
 */
export const updateMemberRole = mutation({
  args: {
    membershipId: v.id('companyMembers'),
    role: v.string()
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_USERS);

    if (!caller.isOwner) {
      throw new Error('Only organization owners can update member roles');
    }

    const membership = await ctx.db.get(args.membershipId);
    if (!membership || membership.companyOwnerId !== caller.ownerId) {
      throw new Error('Member not found');
    }

    // Can't change owner's role
    if (membership.userId === caller.ownerId) {
      throw new Error('Cannot change the owner role');
    }

    // Validate role exists
    const roleExists =
      Object.keys({
        manager: 'manager',
        staff: 'staff',
        viewer: 'viewer'
      }).includes(args.role.toLowerCase()) ||
      (await ctx.db
        .query('customRoles')
        .withIndex('by_user', (q) => q.eq('userId', caller.ownerId))
        .filter((q) => q.eq(q.field('name'), args.role))
        .first()) !== null;

    if (!roleExists) {
      throw new Error(`Role "${args.role}" does not exist`);
    }

    await ctx.db.patch(args.membershipId, {
      role: args.role,
      updatedAt: Date.now()
    });

    return { success: true, message: 'Member role updated' };
  }
});

/**
 * Get pending invitations (with tokens and expiry info)
 */
export const getPendingInvitations = query({
  args: {},
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);

    if (!caller.isOwner) {
      throw new Error('Only organization owners can view invitations');
    }

    const invitations = await ctx.db
      .query('companyMembers')
      .withIndex('by_company', (q) => q.eq('companyOwnerId', caller.ownerId))
      .filter((q) => q.eq(q.field('status'), 'invited'))
      .collect();

    return invitations.map((inv) => {
      const now = Date.now();
      const isExpired = inv.expiresAt && now > inv.expiresAt;

      return {
        _id: inv._id,
        email: inv.email,
        displayName: inv.displayName,
        role: inv.role,
        invitedAt: inv.invitedAt,
        invitedBy: inv.invitedBy,
        token: inv.token,
        expiresAt: inv.expiresAt,
        isExpired,
        resendCount: inv.resendCount ?? 0,
        inviteLink: inv.token ? getInviteLink(inv.token) : null
      };
    });
  }
});

/**
 * Resend an invitation email to a pending member
 */
export const resendInvitation = mutation({
  args: {
    membershipId: v.id('companyMembers')
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_USERS);

    if (!caller.isOwner) {
      throw new Error('Only organization owners can resend invitations');
    }

    const membership = await ctx.db.get(args.membershipId);
    if (!membership || membership.companyOwnerId !== caller.ownerId) {
      throw new Error('Member not found');
    }

    if (membership.status !== 'invited') {
      throw new Error('Can only resend pending invitations');
    }

    const now = Date.now();
    let token = membership.token;
    let expiresAt = membership.expiresAt;

    // Regenerate token if expired
    if (!token || (expiresAt && now > expiresAt)) {
      token = generateInviteToken();
      expiresAt = now + 7 * 24 * 60 * 60 * 1000; // Reset to 7 days
    }

    const inviteLink = getInviteLink(token);

    await ctx.db.patch(args.membershipId, {
      token,
      expiresAt,
      resendCount: (membership.resendCount ?? 0) + 1,
      updatedAt: now
    });

    return {
      success: true,
      membershipId: args.membershipId,
      email: membership.email,
      displayName: membership.displayName,
      role: membership.role,
      token,
      inviteLink,
      expiresAt,
      resendCount: (membership.resendCount ?? 0) + 1,
      message: `Invitation resent to ${membership.email}`
    };
  }
});

/**
 * Accept an invitation to join an organization
 * Called after staff member signs up via Clerk
 */
export const acceptInvitation = mutation({
  args: {
    email: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;

    // CRITICAL FIX: Validate that the authenticated user's email matches the invitation email
    // This prevents users from accepting invitations sent to different email addresses
    const identityEmail =
      (identity as any).email || (identity as any).claims?.email;
    if (
      identityEmail &&
      identityEmail.toLowerCase() !== args.email.toLowerCase()
    ) {
      throw new Error(
        'Invitation email does not match your authenticated email address'
      );
    }

    // Find pending invitation for this email
    const invitation = await ctx.db
      .query('companyMembers')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .filter((q) => q.eq(q.field('status'), 'invited'))
      .first();

    if (!invitation) {
      throw new Error('No pending invitation found for this email');
    }

    // Additional check: ensure the invitation email matches what was requested
    if (invitation.email.toLowerCase() !== args.email.toLowerCase()) {
      throw new Error('Invitation email mismatch');
    }

    // Accept invitation by linking the user's Clerk ID
    await ctx.db.patch(invitation._id, {
      userId: userId,
      status: 'accepted',
      acceptedAt: Date.now(),
      updatedAt: Date.now()
    });

    // FIX: Create audit log for invitation acceptance
    await ctx.db.insert('auditLog', {
      userId: invitation.companyOwnerId,
      action: 'invitation_accepted',
      entityType: 'companyMember',
      entityId: invitation._id.toString(),
      changes: {
        acceptedBy: userId,
        acceptedEmail: args.email,
        role: invitation.role,
        acceptedAt: Date.now()
      },
      createdAt: Date.now()
    });

    return {
      success: true,
      ownerId: invitation.companyOwnerId,
      role: invitation.role,
      message: `Welcome to the organization! You are now logged in as ${invitation.role}`
    };
  }
});

/**
 * Get current user's context and permissions
 * Called by frontend to populate useUserRole hook
 */
export const getCallerContext = query({
  args: {},
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    return {
      callerId: caller.callerId,
      ownerId: caller.ownerId,
      role: caller.role,
      permissions: caller.permissions,
      isOwner: caller.isOwner
    };
  }
});

/**
 * Get invitation details by token (for public accept-invite flow)
 */
export const getInvitationByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    try {
      console.log(
        '[getInvitationByToken] Query called with token:',
        args.token
      );

      // Fetch all members to see what's in the database
      const allMembers = await ctx.db.query('companyMembers').collect();
      console.log(
        '[getInvitationByToken] Total members in DB:',
        allMembers.length
      );

      // Log all tokens
      const allTokens = allMembers
        .filter((m: any) => m.token)
        .map((m: any) => ({
          token: m.token,
          email: m.email,
          status: m.status
        }));
      console.log('[getInvitationByToken] All tokens in DB:', allTokens);

      // Find matching token
      const invitation = allMembers.find((m: any) => m.token === args.token);
      console.log('[getInvitationByToken] Match found:', !!invitation);

      if (!invitation) {
        console.log(
          '[getInvitationByToken] No invitation found for token:',
          args.token
        );
        return null;
      }

      if (invitation.status !== 'invited') {
        console.log(
          '[getInvitationByToken] Status is not "invited":',
          invitation.status
        );
        return null;
      }

      const now = Date.now();
      if (invitation.expiresAt && now > invitation.expiresAt) {
        console.log('[getInvitationByToken] Invitation expired');
        return null;
      }

      console.log('[getInvitationByToken] Returning valid invitation');

      // Fetch owner's company details to pre-fill signup form
      // Try companies table first, then fall back to organizationSettings
      let ownerDetails: any = await ctx.db
        .query('companies')
        .withIndex('by_user', (q) => q.eq('userId', invitation.companyOwnerId))
        .first();

      if (!ownerDetails) {
        ownerDetails = await ctx.db
          .query('organizationSettings')
          .withIndex('by_user', (q) =>
            q.eq('userId', invitation.companyOwnerId)
          )
          .first();
      }

      console.log('[getInvitationByToken] Owner details:', ownerDetails);

      return {
        _id: invitation._id,
        email: invitation.email,
        displayName: invitation.displayName,
        role: invitation.role,
        invitedBy: invitation.invitedBy,
        invitedAt: invitation.invitedAt,
        expiresAt: invitation.expiresAt,
        // Owner's company details for pre-filling signup form
        companyName: ownerDetails?.name || ownerDetails?.companyName,
        businessType: ownerDetails?.businessType,
        businessPhone: ownerDetails?.phone?.[0] || ownerDetails?.phone,
        businessAddress: ownerDetails?.address,
        businessCity: ownerDetails?.city,
        businessState: ownerDetails?.state,
        businessCountry: ownerDetails?.country,
        businessPostalCode: ownerDetails?.postalCode,
        companyGST: ownerDetails?.taxNumber
      };
    } catch (error) {
      console.error('[getInvitationByToken] Error:', error);
      throw error;
    }
  }
});

/**
 * Accept invitation by token (used in /accept-invite page)
 */
export const acceptInvitationByToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;

    // Find pending invitation with this token
    const invitation = await ctx.db
      .query('companyMembers')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .filter((q) => q.eq(q.field('status'), 'invited'))
      .first();

    if (!invitation) {
      throw new Error('Invitation not found or already accepted');
    }

    // Check if expired
    const now = Date.now();
    if (invitation.expiresAt && now > invitation.expiresAt) {
      throw new Error('Invitation has expired');
    }

    // Check if email matches current user's email
    const userEmail = identity.email || '';
    if (userEmail.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new Error(
        `This invitation was sent to ${invitation.email}. ` +
          `You signed up with ${userEmail}. Please sign up with the invited email address.`
      );
    }

    // Accept invitation
    await ctx.db.patch(invitation._id, {
      userId: userId,
      status: 'accepted',
      acceptedAt: now,
      updatedAt: now
    });

    return {
      success: true,
      ownerId: invitation.companyOwnerId,
      role: invitation.role,
      message: `Welcome! You're now part of the team as ${invitation.role}`
    };
  }
});
