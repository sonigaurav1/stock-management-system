/**
 * Enterprise Admin Queries
 * RBAC-enforced admin data for company/platform admin pages
 * Uses permission system instead of env var auth
 */

import { query } from './_generated/server';
import { resolveCallerContext, requirePermission } from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

// ============ COMPANY ADMIN QUERIES ============

/**
 * Get all members of the organization for admin dashboard
 * Requires: MANAGE_USERS permission
 */
export const getAdminCompanyMembers = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_USERS);

    // Get all members of this organization
    const members = await ctx.db
      .query('companyMembers')
      .withIndex('by_company', (q) => q.eq('companyOwnerId', caller.ownerId))
      .collect();

    return members.map((m) => ({
      id: m._id,
      email: m.email,
      displayName: m.displayName || m.email,
      role: m.role,
      status: m.status,
      joinedAt: m.createdAt,
      lastActive: m.acceptedAt || m.createdAt
    }));
  }
});

/**
 * Get organization statistics for admin dashboard
 * Requires: VIEW_ORGANIZATION or MANAGE_ORGANIZATION permission
 */
export const getAdminOrganizationStats = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);

    // Count active members
    const members = await ctx.db
      .query('companyMembers')
      .withIndex('by_company', (q) => q.eq('companyOwnerId', caller.ownerId))
      .filter((q) => q.eq(q.field('status'), 'accepted'))
      .collect();

    // Count pending invitations
    const pendingInvites = await ctx.db
      .query('companyMembers')
      .withIndex('by_company', (q) => q.eq('companyOwnerId', caller.ownerId))
      .filter((q) => q.eq(q.field('status'), 'invited'))
      .collect();

    // Get organization info
    const org = await ctx.db
      .query('organizations')
      .withIndex('by_owner', (q) => q.eq('ownerId', caller.ownerId))
      .first();

    return {
      activeMembers: members.length,
      pendingInvitations: pendingInvites.length,
      totalMembers: members.length + pendingInvites.length,
      organizationName: org?.name || 'Organization',
      createdAt: org?.createdAt || Date.now()
    };
  }
});

/**
 * Get audit logs for admin dashboard
 * Requires: VIEW_AUDIT_LOGS permission
 */
export const getAdminAuditLogs = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_AUDIT_LOGS);

    // Get recent audit logs for this organization
    const logs = await ctx.db
      .query('auditLog')
      .withIndex('by_user', (q) => q.eq('userId', caller.ownerId))
      .order('desc')
      .take(100);

    return logs.map((log) => ({
      id: log._id,
      action: log.action || 'unknown',
      entity: log.entityType || 'Unknown',
      entityId: log.entityId,
      changes: log.changes || {},
      performer: log.userId || 'System',
      timestamp: log.createdAt || Date.now(),
      ipAddress: log.ipAddress,
      userAgent: log.userAgent
    }));
  }
});

/**
 * Get organization settings for admin
 * Requires: MANAGE_SETTINGS permission
 */
export const getAdminOrganizationSettings = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SETTINGS);

    const org = await ctx.db
      .query('organizations')
      .withIndex('by_owner', (q) => q.eq('ownerId', caller.ownerId))
      .first();

    return {
      id: org?._id,
      name: org?.name || 'Organization',
      email: (org as any)?.email,
      phone: (org as any)?.phone,
      address: (org as any)?.address,
      timezone: (org as any)?.timezone || 'UTC',
      language: (org as any)?.language || 'en',
      currency: (org as any)?.currency || 'USD',
      taxId: (org as any)?.taxId,
      createdAt: org?.createdAt || Date.now(),
      updatedAt: org?.updatedAt || Date.now()
    };
  }
});

/**
 * Get team activity summary
 * Requires: MANAGE_ORGANIZATION permission
 */
export const getAdminTeamActivity = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);

    const members = await ctx.db
      .query('companyMembers')
      .withIndex('by_company', (q) => q.eq('companyOwnerId', caller.ownerId))
      .filter((q) => q.eq(q.field('status'), 'accepted'))
      .collect();

    // Group members by role
    const roleDistribution = members.reduce(
      (acc: Record<string, number>, m) => {
        const role = m.role || 'unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      },
      {}
    );

    return {
      totalMembers: members.length,
      roleDistribution,
      recentActivity: members
        .sort(
          (a, b) =>
            (b.acceptedAt || b.createdAt) - (a.acceptedAt || a.createdAt)
        )
        .slice(0, 10)
        .map((m) => ({
          name: m.displayName || m.email,
          role: m.role,
          lastActive: m.acceptedAt || m.createdAt
        }))
    };
  }
});
