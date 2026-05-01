import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

/**
 * Notification Rules API
 * Manages notification preferences and alert rules
 */

export const getNotificationRules = query({
  args: {},
  async handler(ctx) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);
    const userId = getDataScopeUserId(caller);

    return await ctx.db
      .query('notificationRules')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
  }
});

export const createNotificationRule = mutation({
  args: {
    name: v.string(),
    triggers: v.array(v.string()),
    channels: v.array(v.string()),
    recipients: v.array(v.string())
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);
    const userId = getDataScopeUserId(caller);

    return await ctx.db.insert('notificationRules', {
      ...args,
      userId,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }
});

export const updateNotificationRule = mutation({
  args: {
    id: v.id('notificationRules'),
    name: v.optional(v.string()),
    triggers: v.optional(v.array(v.string())),
    channels: v.optional(v.array(v.string())),
    recipients: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean())
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);
    const userId = getDataScopeUserId(caller);
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now()
    });
    return id;
  }
});

export const deleteNotificationRule = mutation({
  args: { id: v.id('notificationRules') },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);
    const userId = getDataScopeUserId(caller);
    await ctx.db.delete(args.id);
    return args.id;
  }
});
