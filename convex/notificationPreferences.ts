import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

/**
 * Notification Preferences API
 * Manages user notification channel preferences and settings
 */

// Get user's notification preferences
export const getNotificationPreferences = query({
  args: {},
  async handler(ctx) {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    let prefs = await ctx.db
      .query('notificationPreferences')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .unique();

    return prefs;
  }
});

// Create default notification preferences for a user
export const createDefaultPreferences = mutation({
  args: {},
  async handler(ctx) {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SETTINGS);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    // Check if preferences already exist
    let prefs = await ctx.db
      .query('notificationPreferences')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .unique();

    if (prefs) {
      return prefs;
    }

    // Create default preferences
    const prefsId = await ctx.db.insert('notificationPreferences', {
      userId,
      emailEnabled: true,
      smsEnabled: true,
      inAppEnabled: true,
      notificationTypes: {
        taskAssigned: true,
        taskCompleted: true,
        messageReceived: true,
        lowStock: true,
        paymentDue: true,
        reportReady: true,
        systemAlert: true
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    return await ctx.db.get(prefsId);
  }
});

// Update notification channel preferences
export const updateChannelPreferences = mutation({
  args: {
    emailEnabled: v.optional(v.boolean()),
    smsEnabled: v.optional(v.boolean()),
    inAppEnabled: v.optional(v.boolean())
  },
  async handler(ctx, args) {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SETTINGS);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    let prefs = await ctx.db
      .query('notificationPreferences')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .unique();

    if (!prefs) {
      // Create if doesn't exist
      const prefsId = await ctx.db.insert('notificationPreferences', {
        userId,
        emailEnabled: args.emailEnabled ?? true,
        smsEnabled: args.smsEnabled ?? false,
        inAppEnabled: args.inAppEnabled ?? true,
        notificationTypes: {
          taskAssigned: true,
          taskCompleted: true,
          messageReceived: true,
          lowStock: true,
          paymentDue: true,
          reportReady: true,
          systemAlert: true
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      return prefsId;
    }

    const updates: any = {};
    if (args.emailEnabled !== undefined)
      updates.emailEnabled = args.emailEnabled;
    if (args.smsEnabled !== undefined) updates.smsEnabled = args.smsEnabled;
    if (args.inAppEnabled !== undefined)
      updates.inAppEnabled = args.inAppEnabled;
    updates.updatedAt = Date.now();

    await ctx.db.patch(prefs._id, updates);
    return prefs._id;
  }
});

// Update notification type preferences
export const updateNotificationTypes = mutation({
  args: {
    taskAssigned: v.optional(v.boolean()),
    taskCompleted: v.optional(v.boolean()),
    messageReceived: v.optional(v.boolean()),
    lowStock: v.optional(v.boolean()),
    paymentDue: v.optional(v.boolean()),
    reportReady: v.optional(v.boolean()),
    systemAlert: v.optional(v.boolean())
  },
  async handler(ctx, args) {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SETTINGS);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    let prefs = await ctx.db
      .query('notificationPreferences')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .unique();

    if (!prefs) {
      throw new Error('Notification preferences not found');
    }

    const updatedTypes = { ...prefs.notificationTypes };
    if (args.taskAssigned !== undefined)
      updatedTypes.taskAssigned = args.taskAssigned;
    if (args.taskCompleted !== undefined)
      updatedTypes.taskCompleted = args.taskCompleted;
    if (args.messageReceived !== undefined)
      updatedTypes.messageReceived = args.messageReceived;
    if (args.lowStock !== undefined) updatedTypes.lowStock = args.lowStock;
    if (args.paymentDue !== undefined)
      updatedTypes.paymentDue = args.paymentDue;
    if (args.reportReady !== undefined)
      updatedTypes.reportReady = args.reportReady;
    if (args.systemAlert !== undefined)
      updatedTypes.systemAlert = args.systemAlert;

    await ctx.db.patch(prefs._id, {
      notificationTypes: updatedTypes,
      updatedAt: Date.now()
    });

    return prefs._id;
  }
});

// Set quiet hours for notifications
export const setQuietHours = mutation({
  args: {
    enabled: v.boolean(),
    startTime: v.string(), // "HH:mm" format
    endTime: v.string(), // "HH:mm" format
    timezone: v.optional(v.string())
  },
  async handler(ctx, args) {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SETTINGS);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    let prefs = await ctx.db
      .query('notificationPreferences')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .unique();

    if (!prefs) {
      throw new Error('Notification preferences not found');
    }

    await ctx.db.patch(prefs._id, {
      quietHours: {
        enabled: args.enabled,
        startTime: args.startTime,
        endTime: args.endTime,
        timezone: args.timezone || 'UTC'
      },
      updatedAt: Date.now()
    });

    return prefs._id;
  }
});

// Add SMS phone number
export const addPhoneNumber = mutation({
  args: { phoneNumber: v.string() },
  async handler(ctx, args) {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SETTINGS);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    // Validate phone number format
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    if (!phoneRegex.test(args.phoneNumber)) {
      throw new Error('Invalid phone number format');
    }

    let prefs = await ctx.db
      .query('notificationPreferences')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .unique();

    if (!prefs) {
      throw new Error('Notification preferences not found');
    }

    await ctx.db.patch(prefs._id, {
      phoneNumber: args.phoneNumber,
      updatedAt: Date.now()
    });

    return prefs._id;
  }
});

// Test notification channel (send test message)
export const testNotificationChannel = mutation({
  args: { channel: v.string() }, // "email", "sms", "inApp"
  async handler(ctx, args) {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SETTINGS);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    // In production, this would:
    // - For email: Send test email to user's email
    // - For SMS: Send test SMS to user's phone
    // - For in-app: Create test message in inbox

    if (args.channel === 'inApp') {
      // Create a test message
      await ctx.db.insert('messages', {
        senderId: 'system',
        recipientId: userId,
        content: 'This is a test notification from your communication hub.',
        subject: 'Test In-App Notification',
        priority: 'normal',
        isRead: false,
        attachmentIds: [],
        isArchived: false,
        isDeleted: false,
        tags: ['test', 'notification'],
        createdAt: Date.now()
      });
    }

    // For other channels, you'd call your external services
    // sendEmail(), sendSMS(), etc.

    return { channel: args.channel, status: 'sent' };
  }
});

// Check if user should receive notification based on preferences and quiet hours
export const shouldNotify = query({
  args: {
    notificationType: v.string() // Type of notification
  },
  async handler(ctx, args) {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    let prefs = await ctx.db
      .query('notificationPreferences')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .unique();

    if (!prefs) return { shouldNotify: true };

    // Check if notification type is enabled
    const typeKey =
      args.notificationType as keyof typeof prefs.notificationTypes;
    const typeEnabled = prefs.notificationTypes[typeKey] ?? true;

    if (!typeEnabled) return { shouldNotify: false };

    // Check quiet hours
    if (prefs.quietHours?.enabled) {
      const now = new Date();
      const [startHour, startMin] = prefs.quietHours.startTime
        .split(':')
        .map(Number);
      const [endHour, endMin] = prefs.quietHours.endTime.split(':').map(Number);

      const startTime = new Date();
      startTime.setHours(startHour, startMin, 0);

      const endTime = new Date();
      endTime.setHours(endHour, endMin, 0);

      if (now >= startTime && now <= endTime) {
        return { shouldNotify: false, reason: 'quiet_hours' };
      }
    }

    return { shouldNotify: true };
  }
});
