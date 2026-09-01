import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';
import { createRandomSecret, hashApiKey } from './lib/secretStorage';

/**
 * API Keys Management
 * Handles API key generation
 */

// ==================== API Keys ====================

export const getApiKeys = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const keys = await ctx.db
      .query('apiKeys')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .collect();

    // Don't return full keys in lists
    return keys.map((key) => ({
      _id: key._id,
      _creationTime: key._creationTime,
      name: key.name,
      displayKey: key.displayKey,
      revoked: key.revoked,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt
    }));
  }
});

export const createApiKey = mutation({
  args: { name: v.string() },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);

    // 3. Use caller context for data scope
    const dataOwner = getDataScopeUserId(caller);

    const key = `sk_live_${createRandomSecret()}`;
    const displayKey = key.slice(-8);
    const keyHash = await hashApiKey(key);

    const id = await ctx.db.insert('apiKeys', {
      userId: dataOwner,
      name: args.name,
      key: keyHash,
      displayKey,
      revoked: false,
      createdAt: Date.now()
    });

    return { id, key, displayKey };
  }
});

export const deleteApiKey = mutation({
  args: { id: v.id('apiKeys') },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);

    // 3. Validate data access
    const dataOwner = getDataScopeUserId(caller);
    const key = await ctx.db.get(args.id);

    if (!key || key.userId !== dataOwner) {
      throw new Error('API key not found or access denied');
    }

    await ctx.db.delete(args.id);
    return args.id;
  }
});

// ==================== Dashboard Configuration ====================
// Widget management, layout customization, refresh settings

export * from './dashboardConfig';

// ==================== Dashboard Insights ====================
// Anomaly detection, trend analysis, alerts

export * from './insights';

// ==================== Dashboard Exports ====================
// PDF, Excel, CSV export functionality

export * from './dashboardExport';
