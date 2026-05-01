import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Test Suite for Settings Persistence and Notifications
 * These functions test the core backend functionality
 */

/**
 * TEST 1: Settings Persistence - Create and Read
 */
export const testSettingsCreate = mutation({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { success: false, error: 'Not authenticated' };

    try {
      // Create a test organization settings record
      const settingsId = await ctx.db.insert('organizationSettings', {
        userId: identity.subject,
        companyName: 'Test Company',
        businessType: 'retailer',
        taxNumber: 'TAX123456789',
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        email: 'test@example.com',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // Verify by reading it back
      const settings = await ctx.db.get(settingsId);

      return {
        success: true,
        message: 'Settings created successfully',
        settingsId: settingsId.toString(),
        data: settings
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

/**
 * TEST 2: Settings Persistence - Update
 */
export const testSettingsUpdate = mutation({
  args: {
    companyName: v.string(),
    businessType: v.string()
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { success: false, error: 'Not authenticated' };

    try {
      // Find existing settings
      const existing = await ctx.db
        .query('organizationSettings')
        .withIndex('by_user', (q) => q.eq('userId', identity.subject))
        .first();

      if (!existing) {
        return {
          success: false,
          error: 'Settings not found. Run testSettingsCreate first.'
        };
      }

      // Update the settings
      await ctx.db.patch(existing._id, {
        companyName: args.companyName,
        businessType: args.businessType,
        updatedAt: Date.now()
      });

      // Verify by reading it back
      const updated = await ctx.db.get(existing._id);

      return {
        success: true,
        message: 'Settings updated successfully',
        data: updated
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

/**
 * TEST 3: Notification Rules - Create and Read
 */
export const testNotificationRuleCreate = mutation({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { success: false, error: 'Not authenticated' };

    try {
      // Create a test notification rule
      const ruleId = await ctx.db.insert('notificationRules', {
        userId: identity.subject,
        name: 'Test Low Stock Alert',
        triggers: ['LOW_STOCK'],
        channels: ['email', 'sms'],
        recipients: ['test@example.com'],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // Verify by reading it back
      const rule = await ctx.db.get(ruleId);

      return {
        success: true,
        message: 'Notification rule created successfully',
        ruleId: ruleId.toString(),
        data: rule
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

/**
 * TEST 4: Notification Trigger - Record event
 */
export const testNotificationTrigger = mutation({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { success: false, error: 'Not authenticated' };

    try {
      // Get notification rules for this user
      const rules = await ctx.db
        .query('notificationRules')
        .withIndex('by_user', (q) => q.eq('userId', identity.subject))
        .collect();

      if (rules.length === 0) {
        return {
          success: false,
          error:
            'No notification rules found. Run testNotificationRuleCreate first.'
        };
      }

      const rule = rules[0];

      // Record a webhook execution (simulates notification delivery) - uses systemLog with type='webhook'
      const executionId = await ctx.db.insert('systemLog', {
        userId: identity.subject,
        logType: 'webhook',
        status: 'success',
        webhookId: 'test-webhook',
        event: 'notification.sent',
        url: 'https://example.com/webhook',
        payload: {
          ruleId: rule._id.toString(),
          ruleName: rule.name,
          triggers: rule.triggers,
          channels: rule.channels,
          recipients: rule.recipients
        },
        statusCode: 200,
        response: 'Notification sent successfully',
        retryCount: 0,
        timestamp: Date.now()
      });

      return {
        success: true,
        message: 'Notification triggered and logged successfully',
        executionId: executionId.toString(),
        ruleMatched: rule.name
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

/**
 * TEST 5: Audit Log - Record settings change
 */
export const testAuditLogCreate = mutation({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { success: false, error: 'Not authenticated' };

    try {
      // Record an audit log entry
      const logId = await ctx.db.insert('auditLog', {
        userId: identity.subject,
        action: 'SETTINGS_UPDATED',
        entityType: 'organizationSettings',
        entityId: 'test-resource-id',
        changes: {
          old: { companyName: 'Old Company' },
          new: { companyName: 'New Company' }
        },
        ipAddress: '192.168.1.1',
        userAgent: 'Test Client',
        createdAt: Date.now()
      });

      // Verify by reading it back
      const log = await ctx.db.get(logId);

      return {
        success: true,
        message: 'Audit log created successfully',
        logId: logId.toString(),
        data: log
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

/**
 * TEST 6: Feature Usage - Track feature adoption
 */
export const testFeatureUsageTrack = mutation({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { success: false, error: 'Not authenticated' };

    try {
      // Record feature usage
      const usageId = await ctx.db.insert('featureUsage', {
        userId: identity.subject,
        feature: 'ORGANIZATION_SETTINGS_UPDATED',
        metadata: {
          testRun: true,
          action: 'test_action'
        },
        timestamp: Date.now()
      });

      // Verify by reading it back
      const usage = await ctx.db.get(usageId);

      return {
        success: true,
        message: 'Feature usage tracked successfully',
        usageId: usageId.toString(),
        data: usage
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});

/**
 * TEST 7: Get all test data for verification
 */
export const getAllTestData = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { success: false, error: 'Not authenticated' };

    try {
      const settings = await ctx.db
        .query('organizationSettings')
        .withIndex('by_user', (q) => q.eq('userId', identity.subject))
        .first();

      const rules = await ctx.db
        .query('notificationRules')
        .withIndex('by_user', (q) => q.eq('userId', identity.subject))
        .collect();

      const auditLogs = await ctx.db
        .query('auditLog')
        .withIndex('by_user', (q) => q.eq('userId', identity.subject))
        .collect();

      const usage = await ctx.db
        .query('featureUsage')
        .withIndex('by_user', (q) => q.eq('userId', identity.subject))
        .collect();

      return {
        success: true,
        data: {
          settings: settings || null,
          notificationRules: rules,
          auditLogs: auditLogs,
          featureUsage: usage
        },
        summary: {
          hasSettings: !!settings,
          notificationRuleCount: rules.length,
          auditLogCount: auditLogs.length,
          featureUsageCount: usage.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
});
