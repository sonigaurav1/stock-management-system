import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';
import { redactSecretLikeValues } from './lib/secretStorage';

/**
 * Unified System Logging Module (Phase 2B)
 *
 * Consolidates:
 * - webhookExecutionLog
 * - duplicateDetectionLog
 *
 * Provides unified API for all system-level event logging
 */

// ==================== WEBHOOK EXECUTION LOGS ====================

export const logWebhookExecution = mutation({
  args: {
    webhookId: v.string(),
    url: v.string(),
    event: v.string(),
    payload: v.any(),
    statusCode: v.optional(v.number()),
    response: v.optional(v.string()),
    error: v.optional(v.string()),
    retryCount: v.number()
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);

    return await ctx.db.insert('systemLog', {
      userId,
      logType: 'webhook',
      status: args.error
        ? 'failure'
        : args.statusCode && args.statusCode >= 200 && args.statusCode < 300
          ? 'success'
          : 'failure',
      webhookId: args.webhookId,
      url: args.url,
      event: args.event,
      payload: redactSecretLikeValues(args.payload),
      statusCode: args.statusCode,
      response: args.response,
      error: args.error,
      retryCount: args.retryCount,
      timestamp: Date.now()
    });
  }
});

export const getWebhookExecutionLogs = query({
  args: {
    webhookId: v.optional(v.string()),
    limit: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);

    let query_obj = ctx.db
      .query('systemLog')
      .withIndex('by_user_and_type', (q) =>
        q.eq('userId', userId).eq('logType', 'webhook')
      );

    if (args.webhookId) {
      query_obj = query_obj.filter((q) =>
        q.eq(q.field('webhookId'), args.webhookId)
      );
    }

    if (args.startDate) {
      query_obj = query_obj.filter((q) =>
        q.gte(q.field('timestamp'), args.startDate!)
      );
    }

    if (args.endDate) {
      query_obj = query_obj.filter((q) =>
        q.lte(q.field('timestamp'), args.endDate!)
      );
    }

    const logs = await query_obj.order('desc').take(args.limit || 100);

    return logs.map((log: any) => ({
      id: log._id,
      webhookId: log.webhookId,
      url: log.url,
      event: log.event,
      statusCode: log.statusCode,
      error: log.error,
      retryCount: log.retryCount,
      timestamp: log.timestamp,
      status: log.status
    }));
  }
});

// ==================== DUPLICATE DETECTION LOGS ====================

export const logDuplicateDetection = mutation({
  args: {
    entityType: v.string(),
    record1Id: v.string(),
    record2Id: v.string(),
    amount: v.number(),
    timeDifferenceMs: v.number(),
    similarityScore: v.number(),
    status: v.string() // "pending", "confirmed_duplicate", "false_positive", "merged"
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);

    return await ctx.db.insert('systemLog', {
      userId,
      logType: 'duplicate_detection',
      status: args.status,
      entityType: args.entityType,
      record1Id: args.record1Id,
      record2Id: args.record2Id,
      amount: args.amount,
      timeDifferenceMs: args.timeDifferenceMs,
      similarityScore: args.similarityScore,
      timestamp: Date.now()
    });
  }
});

export const resolveDuplicateDetection = mutation({
  args: {
    logId: v.id('systemLog'),
    status: v.string(), // "confirmed_duplicate", "false_positive", "merged"
    resolutionNotes: v.optional(v.string()),
    resolvedBy: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.EDIT_TRANSACTION);
    const userId = getDataScopeUserId(caller);

    const log = await ctx.db.get(args.logId);
    if (!log || log.userId !== userId) {
      throw new Error('Log not found or access denied');
    }

    await ctx.db.patch(args.logId, {
      status: args.status,
      resolutionNotes: args.resolutionNotes,
      resolvedBy: args.resolvedBy || userId,
      resolvedAt: Date.now()
    });

    return { success: true, message: 'Duplicate detection resolved' };
  }
});

export const getDuplicateDetectionLogs = query({
  args: {
    entityType: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);

    let query_obj = ctx.db
      .query('systemLog')
      .withIndex('by_user_and_type', (q) =>
        q.eq('userId', userId).eq('logType', 'duplicate_detection')
      );

    if (args.entityType) {
      query_obj = query_obj.filter((q) =>
        q.eq(q.field('entityType'), args.entityType)
      );
    }

    if (args.status) {
      query_obj = query_obj.filter((q) => q.eq(q.field('status'), args.status));
    }

    if (args.startDate) {
      query_obj = query_obj.filter((q) =>
        q.gte(q.field('timestamp'), args.startDate!)
      );
    }

    if (args.endDate) {
      query_obj = query_obj.filter((q) =>
        q.lte(q.field('timestamp'), args.endDate!)
      );
    }

    const logs = await query_obj.order('desc').take(args.limit || 100);

    return logs.map((log: any) => ({
      id: log._id,
      entityType: log.entityType,
      record1Id: log.record1Id,
      record2Id: log.record2Id,
      amount: log.amount,
      similarityScore: log.similarityScore,
      timeDifferenceMs: log.timeDifferenceMs,
      status: log.status,
      timestamp: log.timestamp,
      resolutionNotes: log.resolutionNotes,
      resolvedBy: log.resolvedBy,
      resolvedAt: log.resolvedAt
    }));
  }
});

// ==================== UNIFIED LOG QUERIES ====================

export const getSystemLogs = query({
  args: {
    logType: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);

    let query_obj = ctx.db
      .query('systemLog')
      .withIndex('by_user_and_timestamp', (q) => q.eq('userId', userId));

    if (args.logType) {
      query_obj = query_obj.filter((q) =>
        q.eq(q.field('logType'), args.logType)
      );
    }

    if (args.status) {
      query_obj = query_obj.filter((q) => q.eq(q.field('status'), args.status));
    }

    if (args.startDate) {
      query_obj = query_obj.filter((q) =>
        q.gte(q.field('timestamp'), args.startDate!)
      );
    }

    if (args.endDate) {
      query_obj = query_obj.filter((q) =>
        q.lte(q.field('timestamp'), args.endDate!)
      );
    }

    const logs = await query_obj.order('desc').take(args.limit || 100);

    return logs.map((log: any) => ({
      id: log._id,
      logType: log.logType,
      status: log.status,
      timestamp: log.timestamp,
      description: log.description,
      metadata: redactSecretLikeValues(log.metadata),
      ...(log.logType === 'webhook' && {
        webhookId: log.webhookId,
        event: log.event,
        statusCode: log.statusCode,
        error: log.error
      }),
      ...(log.logType === 'duplicate_detection' && {
        entityType: log.entityType,
        similarityScore: log.similarityScore,
        status: log.status,
        resolutionNotes: log.resolutionNotes
      })
    }));
  }
});

export const getSystemLogStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);

    const logs = await ctx.db
      .query('systemLog')
      .withIndex('by_user_and_status', (q) => q.eq('userId', userId))
      .collect();

    const filtered = logs.filter((log) => {
      if (args.startDate && log.timestamp < args.startDate) return false;
      if (args.endDate && log.timestamp > args.endDate) return false;
      return true;
    });

    const stats = {
      totalLogs: filtered.length,
      byType: {
        webhook: filtered.filter((l) => l.logType === 'webhook').length,
        duplicate_detection: filtered.filter(
          (l) => l.logType === 'duplicate_detection'
        ).length
      },
      byStatus: {
        success: filtered.filter((l) => l.status === 'success').length,
        failure: filtered.filter((l) => l.status === 'failure').length,
        pending: filtered.filter((l) => l.status === 'pending').length,
        warning: filtered.filter((l) => l.status === 'warning').length
      },
      failureRate:
        filtered.length > 0
          ? (
              (filtered.filter((l) => l.status === 'failure').length /
                filtered.length) *
              100
            ).toFixed(2) + '%'
          : '0%'
    };

    return stats;
  }
});
