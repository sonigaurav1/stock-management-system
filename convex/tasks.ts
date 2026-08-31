import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';
import { sendMessage } from './messaging';

/**
 * Task Assignment & Management API
 * Handles task creation, assignment, status updates, and comments
 */

// Get tasks assigned to current user
export const getAssignedTasks = query({
  args: {
    status: v.optional(v.string()), // "assigned", "in_progress", "completed"
    sortBy: v.optional(v.string()), // "dueDate", "priority", "createdAt"
    limit: v.optional(v.number())
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);
    const userId = getDataScopeUserId(caller);

    let tasks = await ctx.db
      .query('tasks')
      .withIndex('by_assignee', (q) => q.eq('assigneeId', userId))
      .collect();

    // Filter by status if provided
    if (args.status) {
      tasks = tasks.filter((t) => t.status === args.status);
    }

    // Sort
    if (args.sortBy === 'dueDate') {
      tasks.sort((a, b) => (a.dueDate || Infinity) - (b.dueDate || Infinity));
    } else if (args.sortBy === 'priority') {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      tasks.sort(
        (a, b) =>
          (priorityOrder[a.priority as keyof typeof priorityOrder] || 999) -
          (priorityOrder[b.priority as keyof typeof priorityOrder] || 999)
      );
    } else {
      tasks.sort((a, b) => b.createdAt - a.createdAt);
    }

    if (args.limit) {
      tasks = tasks.slice(0, args.limit);
    }

    return tasks;
  }
});

// Get tasks created by current user
export const getCreatedTasks = query({
  args: {
    limit: v.optional(v.number())
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);
    const userId = getDataScopeUserId(caller);

    let tasks = await ctx.db
      .query('tasks')
      .withIndex('by_assignor', (q) => q.eq('assignorId', userId))
      .collect();

    tasks.sort((a, b) => b.createdAt - a.createdAt);

    if (args?.limit) {
      tasks = tasks.slice(0, args.limit);
    }

    return tasks;
  }
});

// Get single task with all details
export const getTaskDetails = query({
  args: { taskId: v.id('tasks') },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);
    const userId = getDataScopeUserId(caller);

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Get comments
    const comments = await ctx.db
      .query('taskComments')
      .withIndex('by_task', (q) => q.eq('taskId', args.taskId))
      .collect();

    return {
      ...task,
      comments: comments.sort((a, b) => a.createdAt - b.createdAt)
    };
  }
});

// Create and assign a task
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    assigneeId: v.string(),
    priority: v.optional(
      v.union(
        v.literal('low'),
        v.literal('medium'),
        v.literal('high'),
        v.literal('urgent')
      )
    ), // "low", "medium", "high", "urgent"
    dueDate: v.optional(v.number()),
    relatedEntityType: v.optional(v.string()),
    relatedEntityId: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notifyAssignee: v.optional(v.boolean())
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);
    const userId = getDataScopeUserId(caller);

    const priority = args.priority || 'medium';
    const taskId = await ctx.db.insert('tasks', {
      title: args.title,
      description: args.description,
      assigneeId: args.assigneeId,
      assignorId: userId,
      status: 'assigned',
      priority,
      dueDate: args.dueDate,
      relatedEntityType: args.relatedEntityType,
      relatedEntityId: args.relatedEntityId,
      tags: args.tags || [],
      createdAt: Date.now()
    });

    // Send notification message if requested
    if (args.notifyAssignee !== false) {
      const subject = `New Task: ${args.title}`;
      const content = args.description
        ? `${args.description}\n\nPriority: ${priority}${
            args.dueDate
              ? `\nDue: ${new Date(args.dueDate).toLocaleDateString()}`
              : ''
          }`
        : `New ${priority} priority task assigned to you.`;

      // Create in-app notification via message
      await ctx.db.insert('messages', {
        senderId: userId,
        recipientId: args.assigneeId,
        content,
        subject,
        priority: priority === 'urgent' ? 'high' : 'normal',
        isRead: false,
        attachmentIds: [],
        isArchived: false,
        isDeleted: false,
        tags: ['task', 'notification'],
        createdAt: Date.now()
      });
    }

    return taskId;
  }
});

// Update task status
export const updateTaskStatus = mutation({
  args: {
    taskId: v.id('tasks'),
    status: v.union(
      v.literal('assigned'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('cancelled')
    ) // "assigned", "in_progress", "completed", "cancelled"
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.EDIT_TRANSACTION);
    const userId = getDataScopeUserId(caller);

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error('Task not found');

    // Allow status update by assignee or assignor
    if (task.assigneeId !== userId && task.assignorId !== userId) {
      throw new Error('Unauthorized to update task status');
    }

    const completedAt =
      args.status === 'completed' ? Date.now() : task.completedAt;

    await ctx.db.patch(args.taskId, {
      status: args.status,
      completedAt,
      updatedAt: Date.now()
    });

    // Notify assignor if status changed
    if (args.status === 'completed' && task.assignorId !== userId) {
      await ctx.db.insert('messages', {
        senderId: task.assigneeId,
        recipientId: task.assignorId,
        content: `Task "${task.title}" has been completed.`,
        subject: `Task Completed: ${task.title}`,
        priority: 'normal',
        isRead: false,
        attachmentIds: [],
        isArchived: false,
        isDeleted: false,
        tags: ['task', 'notification'],
        createdAt: Date.now()
      });
    }

    return args.taskId;
  }
});

// Update task details
export const updateTask = mutation({
  args: {
    taskId: v.id('tasks'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string()))
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.EDIT_TRANSACTION);
    const userId = getDataScopeUserId(caller);

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error('Task not found');

    if (task.assignorId !== userId) {
      throw new Error('Only task creator can edit task details');
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.dueDate !== undefined) updates.dueDate = args.dueDate;
    if (args.tags !== undefined) updates.tags = args.tags;

    updates.updatedAt = Date.now();

    await ctx.db.patch(args.taskId, updates);
    return args.taskId;
  }
});

// Add comment to task
export const addTaskComment = mutation({
  args: {
    taskId: v.id('tasks'),
    content: v.string()
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.CREATE_TRANSACTION);
    const userId = getDataScopeUserId(caller);

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error('Task not found');

    const commentId = await ctx.db.insert('taskComments', {
      taskId: args.taskId,
      authorId: userId,
      content: args.content,
      attachmentIds: [],
      isEdited: false,
      createdAt: Date.now()
    });

    // Notify other participants
    const otherUserId =
      userId === task.assigneeId ? task.assignorId : task.assigneeId;

    await ctx.db.insert('messages', {
      senderId: userId,
      recipientId: otherUserId,
      content: `New comment on task "${task.title}":\n\n${args.content}`,
      subject: `Comment on: ${task.title}`,
      priority: 'normal',
      isRead: false,
      attachmentIds: [],
      isArchived: false,
      isDeleted: false,
      tags: ['task-comment', 'notification'],
      createdAt: Date.now()
    });

    return commentId;
  }
});

// Delete task (soft delete)
export const deleteTask = mutation({
  args: { taskId: v.id('tasks') },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.DELETE_TRANSACTION);
    const userId = getDataScopeUserId(caller);

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error('Task not found');

    if (task.assignorId !== userId) {
      throw new Error('Only task creator can delete task');
    }

    await ctx.db.delete(args.taskId);

    return args.taskId;
  }
});

// Get task stats for user
export const getTaskStats = query({
  args: {},
  async handler(ctx) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);

    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_assignee', (q) => q.eq('assigneeId', userId))
      .collect();

    const stats = {
      total: tasks.length,
      assigned: tasks.filter((t) => t.status === 'assigned').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      cancelled: tasks.filter((t) => t.status === 'cancelled').length,
      overdue: tasks.filter(
        (t) =>
          t.dueDate &&
          t.dueDate < Date.now() &&
          t.status !== 'completed' &&
          t.status !== 'cancelled'
      ).length,
      high_priority: tasks.filter(
        (t) =>
          (t.priority === 'high' || t.priority === 'urgent') &&
          t.status !== 'completed'
      ).length
    };

    return stats;
  }
});
