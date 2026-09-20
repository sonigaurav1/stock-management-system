import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';
import { redactSecretLikeValues } from './lib/redact';

/**
 * Audit Log API
 * Tracks all user actions for compliance and debugging
 */

/**
 * Get audit logs for organization (requires VIEW_AUDIT_LOGS permission)
 */
export const getAuditLogs = query({
  args: { limit: v.optional(v.number()) },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_AUDIT_LOGS);

    const userId = getDataScopeUserId(caller);
    const limit = args.limit || 100;

    const logs = await ctx.db
      .query('auditLog')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .take(limit);

    return logs.map((log) => ({
      ...log,
      changes: redactSecretLikeValues(log.changes)
    }));
  }
});

/**
 * Log audit entry (INTERNAL - system calls only, no permission check needed)
 */
export const logAuditEntry = mutation({
  args: {
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    changes: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string())
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    const userId = getDataScopeUserId(caller);

    return await ctx.db.insert('auditLog', {
      userId,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      changes: redactSecretLikeValues(args.changes),
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      createdAt: Date.now()
    });
  }
});

/**
 * Get audit statistics (owner only)
 */
export const getAuditStats = query({
  args: {
    action: v.optional(v.string()),
    entityType: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number())
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_AUDIT_LOGS);

    const userId = getDataScopeUserId(caller);

    let query = ctx.db
      .query('auditLog')
      .withIndex('by_user', (q) => q.eq('userId', userId));

    const logs = await query.collect();

    const filtered = logs.filter((log) => {
      if (args.action && log.action !== args.action) return false;
      if (args.entityType && log.entityType !== args.entityType) return false;
      if (args.startDate && log.createdAt < args.startDate) return false;
      if (args.endDate && log.createdAt > args.endDate) return false;
      return true;
    });

    return {
      total: filtered.length,
      byAction: filtered.reduce(
        (acc, log) => {
          acc[log.action] = (acc[log.action] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byEntityType: filtered.reduce(
        (acc, log) => {
          acc[log.entityType] = (acc[log.entityType] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      )
    };
  }
});
