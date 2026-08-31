import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

/**
 * In-App Messaging API
 * Handles message CRUD, threading, and read status
 */

// Get inbox for current user (received messages)
export const getInbox = query({
  args: {
    filter: v.optional(v.string()), // "unread", "archived", "all"
    searchQuery: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const userId = identity.subject;

    // Query only by recipientId since the deployed index is [recipientId, _creationTime]
    // Filter isDeleted manually
    const baseQuery = ctx.db
      .query('messages')
      .withIndex('by_user', (q) => q.eq('recipientId', userId));

    let messages = await baseQuery.collect();

    // Filter out deleted messages
    messages = messages.filter((m) => !m.isDeleted);

    // Apply filters
    if (args.filter === 'unread') {
      messages = messages.filter((m) => !m.isRead);
    } else if (args.filter === 'archived') {
      messages = messages.filter((m) => m.isArchived);
    }

    // Apply search
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      messages = messages.filter(
        (m) =>
          m.content.toLowerCase().includes(query) ||
          m.subject?.toLowerCase().includes(query)
      );
    }

    // Sort by newest first
    messages.sort((a, b) => b.createdAt - a.createdAt);

    // Limit results
    if (args.limit) {
      messages = messages.slice(0, args.limit);
    }

    return messages;
  }
});

// Get sent messages for current user
export const getSentMessages = query({
  args: {
    limit: v.optional(v.number())
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const userId = identity.subject;

    // Query only by senderId, filter deleted manually
    const allMessages = await ctx.db
      .query('messages')
      .withIndex('by_sender', (q) => q.eq('senderId', userId))
      .collect();

    // Filter out deleted messages
    const messages = allMessages.filter((m) => !m.isDeleted);

    messages.sort((a, b) => b.createdAt - a.createdAt);

    if (args?.limit) {
      return messages.slice(0, args.limit);
    }

    return messages;
  }
});

// Get message thread with replies
export const getMessageThread = query({
  args: { messageId: v.id('messages') },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const rootMessage = await ctx.db.get(args.messageId);
    if (!rootMessage) throw new Error('Message not found');

    if (
      rootMessage.senderId !== identity.subject &&
      rootMessage.recipientId !== identity.subject
    ) {
      throw new Error('Message not found');
    }

    // Get root message and all replies
    const allThreadMessages = await ctx.db
      .query('messages')
      .withIndex('by_thread', (q) => q.eq('replyToId', args.messageId))
      .collect();

    // Filter out deleted messages
    const threadMessages = allThreadMessages.filter((m) => !m.isDeleted);

    return {
      root: rootMessage,
      replies: threadMessages.sort((a, b) => a.createdAt - b.createdAt)
    };
  }
});

// Send a new message
export const sendMessage = mutation({
  args: {
    recipientId: v.string(),
    content: v.string(),
    subject: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal('low'), v.literal('normal'), v.literal('high'))
    ),
    replyToId: v.optional(v.id('messages')),
    tags: v.optional(v.array(v.string()))
  },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);

    // 3. Use caller context for data scope
    const dataOwner = getDataScopeUserId(caller);
    const senderId = caller.callerId;

    if (senderId === args.recipientId) {
      throw new Error('Cannot send message to yourself');
    }

    // CRITICAL: Validate recipient is in same organization (prevent cross-org messaging)
    // For now, we assume all messages within same data owner context are allowed
    // In production, check if recipient belongs to same organization/team

    const messageId = await ctx.db.insert('messages', {
      senderId,
      recipientId: args.recipientId,
      content: args.content,
      subject: args.subject,
      priority: args.priority || 'normal',
      replyToId: args.replyToId,
      tags: args.tags || [],
      isRead: false,
      attachmentIds: [],
      isArchived: false,
      isDeleted: false,
      createdAt: Date.now()
    });

    // Trigger notification if user has preferences
    try {
      const prefs = await ctx.db
        .query('notificationPreferences')
        .withIndex('by_user', (q) => q.eq('userId', args.recipientId))
        .unique();

      if (prefs?.inAppEnabled) {
        // Create in-app notification (can be extended with push notifications)
        // This would typically trigger an event that dispatches through available channels
      }
    } catch (err) {
      // Preferences not found - silently continue
    }

    return messageId;
  }
});

// Mark message as read
export const markAsRead = mutation({
  args: { messageId: v.id('messages') },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);

    // 3. Validate data access
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error('Message not found');

    if (message.recipientId !== caller.callerId) {
      throw new Error("Cannot mark another user's message as read");
    }

    await ctx.db.patch(args.messageId, {
      isRead: true,
      readAt: Date.now()
    });

    return args.messageId;
  }
});

// Mark multiple messages as read
export const markMultipleAsRead = mutation({
  args: { messageIds: v.array(v.id('messages')) },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);

    // 3. Validate data access
    const userId = caller.callerId;
    const now = Date.now();

    for (const messageId of args.messageIds) {
      const message = await ctx.db.get(messageId);
      if (message && message.recipientId === userId) {
        await ctx.db.patch(messageId, {
          isRead: true,
          readAt: now
        });
      }
    }

    return args.messageIds.length;
  }
});

// Archive message
export const archiveMessage = mutation({
  args: { messageId: v.id('messages') },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);

    // 3. Validate data access
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error('Message not found');

    if (message.recipientId !== caller.callerId) {
      throw new Error("Cannot archive another user's message");
    }

    await ctx.db.patch(args.messageId, {
      isArchived: true
    });

    return args.messageId;
  }
});

// Delete (soft delete) message
export const deleteMessage = mutation({
  args: { messageId: v.id('messages') },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);

    // 3. Validate data access
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error('Message not found');

    // Allow deletion by sender or recipient
    if (
      message.senderId !== caller.callerId &&
      message.recipientId !== caller.callerId
    ) {
      throw new Error('Unauthorized');
    }

    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      updatedAt: Date.now()
    });

    return args.messageId;
  }
});

// Add tag to message
export const addMessageTag = mutation({
  args: {
    messageId: v.id('messages'),
    tag: v.string()
  },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);

    // 2. Require permission
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);

    // 3. Validate data access
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error('Message not found');

    if (message.recipientId !== caller.callerId) {
      throw new Error("Cannot tag another user's message");
    }

    const updatedTags = [...new Set([...message.tags, args.tag])];
    await ctx.db.patch(args.messageId, { tags: updatedTags });

    return args.messageId;
  }
});

// Get unread message count
export const getUnreadCount = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_user', (q) => q.eq('recipientId', identity.subject))
      .collect()
      .then((msgs) => msgs.filter((m) => !m.isDeleted));

    return messages.filter((m) => !m.isRead).length;
  }
});
