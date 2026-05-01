import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Create a new feedback entry
 */
export const createFeedback = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    message: v.string(),
    category: v.string(), // e.g., "bug", "feature", "improvement", "other"
    rating: v.number(), // 1-5
    email: v.optional(v.string()),
    attachmentUrl: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const feedbackId = await ctx.db.insert('feedback', {
      userId: args.userId,
      title: args.title,
      message: args.message,
      category: args.category,
      rating: args.rating,
      email: args.email,
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
 * Get all feedback (for admin)
 */
export const getAllFeedback = query({
  args: {
    sortBy: v.optional(v.string()), // "date", "rating", "category"
    filter: v.optional(v.string()), // "all", "unread", "resolved", "pending"
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query('feedback');

    // Build filtered query
    const allFeedback = await query.collect();

    // Apply filters
    let filtered = allFeedback;
    if (args.filter === 'unread') {
      filtered = allFeedback.filter((f) => !f.isRead);
    } else if (args.filter === 'resolved') {
      filtered = allFeedback.filter((f) => f.isResolved);
    } else if (args.filter === 'pending') {
      filtered = allFeedback.filter((f) => !f.isResolved);
    }

    // Sort
    if (args.sortBy === 'date') {
      filtered.sort((a, b) => b.createdAt - a.createdAt);
    } else if (args.sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (args.sortBy === 'category') {
      filtered.sort((a, b) => a.category.localeCompare(b.category));
    } else {
      // Default: newest first
      filtered.sort((a, b) => b.createdAt - a.createdAt);
    }

    // Apply limit
    const limit = args.limit || 50;
    return filtered.slice(0, limit);
  }
});

/**
 * Get feedback by user
 */
export const getFeedbackByUser = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const userFeedback = await ctx.db
      .query('feedback')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .collect();

    const limit = args.limit || 10;
    return userFeedback
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }
});

/**
 * Update feedback status and add response
 */
export const respondToFeedback = mutation({
  args: {
    feedbackId: v.id('feedback'),
    response: v.string(),
    respondedBy: v.string(),
    isResolved: v.boolean()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.feedbackId, {
      response: args.response,
      respondedBy: args.respondedBy,
      respondedAt: Date.now(),
      isResolved: args.isResolved,
      isRead: true,
      updatedAt: Date.now()
    });

    return args.feedbackId;
  }
});

/**
 * Mark feedback as read
 */
export const markFeedbackAsRead = mutation({
  args: {
    feedbackId: v.id('feedback')
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.feedbackId, {
      isRead: true,
      updatedAt: Date.now()
    });

    return args.feedbackId;
  }
});

/**
 * Get feedback statistics
 */
export const getFeedbackStats = query({
  args: {},
  handler: async (ctx) => {
    const allFeedback = await ctx.db.query('feedback').collect();

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
 * Delete feedback (admin only)
 */
export const deleteFeedback = mutation({
  args: {
    feedbackId: v.id('feedback')
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.feedbackId);
    return true;
  }
});
