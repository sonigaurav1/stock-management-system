import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

/**
 * Integrations API
 * Manages third-party integrations and API connections
 */

export const getIntegrations = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    return await ctx.db
      .query('integrations')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .collect();
  }
});

export const getIntegration = query({
  args: { id: v.id('integrations') },
  async handler(ctx, args) {
    return await ctx.db.get(args.id);
  }
});

export const connectIntegration = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    apiKey: v.string(),
    apiSecret: v.optional(v.string()),
    config: v.optional(v.any())
  },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);

    // 3. Use caller context for data scope
    const dataOwner = getDataScopeUserId(caller);

    // In production, encrypt apiKey and apiSecret using a service
    return await ctx.db.insert('integrations', {
      ...args,
      userId: dataOwner,
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }
});

export const disconnectIntegration = mutation({
  args: { id: v.id('integrations') },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);

    // 3. Validate data access
    const dataOwner = getDataScopeUserId(caller);
    const integration = await ctx.db.get(args.id);

    if (!integration || integration.userId !== dataOwner) {
      throw new Error('Integration not found or access denied');
    }

    await ctx.db.delete(args.id);
    return args.id;
  }
});

export const updateIntegrationSync = mutation({
  args: {
    id: v.id('integrations'),
    syncStatus: v.string() // "success", "failed", "in_progress"
  },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);

    // 3. Validate data access
    const dataOwner = getDataScopeUserId(caller);
    const integration = await ctx.db.get(args.id);

    if (!integration || integration.userId !== dataOwner) {
      throw new Error('Integration not found or access denied');
    }

    const { id, syncStatus } = args;
    await ctx.db.patch(id, {
      syncStatus,
      lastSyncAt: Date.now(),
      updatedAt: Date.now()
    });
    return id;
  }
});
