import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

/**
 * Create a new feedback entry
 */
export const createFeedback = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    category: v.string(), // e.g., "bug", "feature", "improvement", "other"
    rating: v.number(), // 1-5
    email: v.optional(v.string()),
    attachmentUrl: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let userId = 'anonymous';
    try {
      const caller = await resolveCallerContext(ctx);
      userId = getDataScopeUserId(caller);
    } catch {
      const identity = await ctx.auth.getUserIdentity();
      userId = identity?.subject || 'dev-user';
    }

    const feedbackId = await ctx.db.insert('feedback', {
      userId,
      title: args.title,
      message: args.message,
      category: args.category,
      rating: args.rating,
      email: args.email || 'user@example.com',
      attachmentUrl: args.attachmentUrl,
      isRead: false,
      isResolved: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    return feedbackId;
  }
});

/**
 * Get all feedback (for admin) - paginated
 */
export const getFeedback = query({
  args: {
    sortBy: v.optional(v.string()), // "date", "rating", "category"
    filter: v.optional(v.string()), // "all", "unread", "resolved", "pending"
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let userId = 'anonymous';
    try {
      const caller = await resolveCallerContext(ctx);
      userId = getDataScopeUserId(caller);
    } catch {
      const identity = await ctx.auth.getUserIdentity();
      userId = identity?.subject || 'dev-user';
    }

    const allFeedback = await ctx.db.query('feedback').collect();

    // Filter feedback by current user ID or return all if dev-user/anonymous
    let filtered =
      userId === 'dev-user' || userId === 'anonymous'
        ? allFeedback
        : allFeedback.filter((f) => f.userId === userId || f.email);

    if (args.filter === 'unread') {
      filtered = filtered.filter((f) => !f.isRead);
    } else if (args.filter === 'resolved') {
      filtered = filtered.filter((f) => f.isResolved);
    } else if (args.filter === 'pending') {
      filtered = filtered.filter((f) => !f.isResolved);
    }

    // Sort
    if (args.sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (args.sortBy === 'category') {
      filtered.sort((a, b) => a.category.localeCompare(b.category));
    } else {
      filtered.sort((a, b) => b.createdAt - a.createdAt);
    }

    const limit = args.limit || 50;
    return filtered.slice(0, limit);
  }
});

/**
 * Search feedback
 */
export const searchFeedback = query({
  args: {
    query: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);

    const userId = getDataScopeUserId(caller);

    const userFeedback = await ctx.db
      .query('feedback')
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect();

    let filtered = userFeedback;
    if (args.query) {
      const lowerQuery = args.query.toLowerCase();
      filtered = userFeedback.filter(
        (f) =>
          f.title.toLowerCase().includes(lowerQuery) ||
          f.message.toLowerCase().includes(lowerQuery) ||
          f.category.toLowerCase().includes(lowerQuery)
      );
    }

    const limit = args.limit || 10;
    return filtered.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
  }
});

/**
 * Update feedback status and add response (owner or admin only)
 */
export const respondToFeedback = mutation({
  args: {
    feedbackId: v.id('feedback'),
    response: v.string(),
    isResolved: v.boolean()
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);

    const userId = getDataScopeUserId(caller);

    const feedback = await ctx.db.get(args.feedbackId);
    if (!feedback) {
      throw new Error('Feedback not found');
    }

    if (feedback.userId !== userId) {
      throw new Error(
        'Access denied: can only respond to own organization feedback'
      );
    }

    await ctx.db.patch(args.feedbackId, {
      response: args.response,
      respondedBy: userId,
      respondedAt: Date.now(),
      isResolved: args.isResolved,
      isRead: true,
      updatedAt: Date.now()
    });

    return args.feedbackId;
  }
});

/**
 * Mark feedback as read (own feedback only)
 */
export const markFeedbackAsRead = mutation({
  args: {
    feedbackId: v.id('feedback')
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);

    const userId = getDataScopeUserId(caller);

    const feedback = await ctx.db.get(args.feedbackId);
    if (!feedback) {
      throw new Error('Feedback not found');
    }

    if (feedback.userId !== userId) {
      throw new Error('Access denied: can only mark own feedback as read');
    }

    await ctx.db.patch(args.feedbackId, {
      isRead: true,
      updatedAt: Date.now()
    });

    return args.feedbackId;
  }
});

/**
 * Get feedback statistics (org-scoped)
 */
export const getFeedbackStats = query({
  args: {},
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);

    const userId = getDataScopeUserId(caller);

    const allFeedback = await ctx.db
      .query('feedback')
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect();

    const stats = {
      total: allFeedback.length,
      unread: allFeedback.filter((f) => !f.isRead).length,
      resolved: allFeedback.filter((f) => f.isResolved).length,
      pending: allFeedback.filter((f) => !f.isResolved).length,
      averageRating:
        allFeedback.length > 0
          ? allFeedback.reduce((sum, f) => sum + f.rating, 0) /
            allFeedback.length
          : 0,
      byCategory: allFeedback.reduce(
        (acc, f) => {
          acc[f.category] = (acc[f.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      )
    };

    return stats;
  }
});

/**
 * Delete feedback (own feedback or admin only)
 */
export const deleteFeedback = mutation({
  args: {
    feedbackId: v.id('feedback')
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);

    const userId = getDataScopeUserId(caller);

    const feedback = await ctx.db.get(args.feedbackId);
    if (!feedback) {
      throw new Error('Feedback not found');
    }

    if (feedback.userId !== userId && !caller.isOwner) {
      throw new Error('Access denied: can only delete own feedback');
    }

    await ctx.db.delete(args.feedbackId);
    return true;
  }
});
