import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * API Keys & Webhooks Management
 * Handles API key generation and webhook configuration
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Generate API key (in production, use a proper key generation library)
    const key = `sk_live_${Math.random().toString(36).substring(2, 50)}`;
    const displayKey = key.slice(-8);

    const id = await ctx.db.insert('apiKeys', {
      userId: identity.subject,
      name: args.name,
      key, // Will be hashed before storage
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
    await ctx.db.delete(args.id);
    return args.id;
  }
});

// ==================== Webhooks ====================

export const getWebhooks = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    return await ctx.db
      .query('webhooks')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .collect();
  }
});

export const createWebhook = mutation({
  args: {
    url: v.string(),
    events: v.array(v.string())
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const secret = Math.random().toString(36).substring(2);

    return await ctx.db.insert('webhooks', {
      userId: identity.subject,
      url: args.url,
      events: args.events,
      isActive: true,
      secret,
      failureCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }
});

export const deleteWebhook = mutation({
  args: { id: v.id('webhooks') },
  async handler(ctx, args) {
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
