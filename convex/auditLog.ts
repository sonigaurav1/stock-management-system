import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Audit Log API
 * Tracks all user actions for compliance and debugging
 */

export const getAuditLog = query({
  args: { limit: v.optional(v.number()) },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const limit = args.limit || 100;

    return await ctx.db
      .query('auditLog')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .order('desc')
      .take(limit);
  }
});

export const logAction = mutation({
  args: {
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    changes: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string())
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    return await ctx.db.insert('auditLog', {
      userId: identity.subject,
      ...args,
      createdAt: Date.now()
    });
  }
});

export const searchAuditLog = query({
  args: {
    action: v.optional(v.string()),
    entityType: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number())
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    let query = ctx.db
      .query('auditLog')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject));

    // Note: Convex doesn't support complex filtering directly
    // You'd need to fetch all and filter in code, or implement a better indexing strategy
    const logs = await query.collect();

    return logs.filter((log) => {
      if (args.action && log.action !== args.action) return false;
      if (args.entityType && log.entityType !== args.entityType) return false;
      if (args.startDate && log.createdAt < args.startDate) return false;
      if (args.endDate && log.createdAt > args.endDate) return false;
      return true;
    });
  }
});
