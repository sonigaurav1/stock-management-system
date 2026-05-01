/**
 * Analytics & Event Tracking Service
 * Tracks feature usage, user actions, and system events for insights
 */

export interface AnalyticsEvent {
  userId: string;
  feature: string;
  action: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

/**
 * Feature tracking constants
 */
export const TRACKED_FEATURES = {
  // Settings
  ORGANIZATION_SETTINGS_UPDATED: 'organization_settings.updated',
  NOTIFICATION_RULE_CREATED: 'notification_rule.created',
  NOTIFICATION_RULE_DELETED: 'notification_rule.deleted',

  // Integrations
  INTEGRATION_CONNECTED: 'integration.connected',
  INTEGRATION_DISCONNECTED: 'integration.disconnected',
  INTEGRATION_SYNCED: 'integration.synced',

  // Automation
  AUTOMATION_RULE_CREATED: 'automation_rule.created',
  AUTOMATION_RULE_EXECUTED: 'automation_rule.executed',
  AUTOMATION_RULE_DELETED: 'automation_rule.deleted',

  // API & Webhooks
  API_KEY_GENERATED: 'api_key.generated',
  WEBHOOK_CREATED: 'webhook.created',
  WEBHOOK_TRIGGERED: 'webhook.triggered',
  WEBHOOK_FAILED: 'webhook.failed',

  // Products
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  PRODUCT_EXPORTED: 'product.exported',

  // Orders/Sales
  ORDER_CREATED: 'order.created',
  ORDER_COMPLETED: 'order.completed',
  INVOICE_GENERATED: 'invoice.generated',
  PAYMENT_PROCESSED: 'payment.processed'
};

/**
 * Get usage statistics for a date range
 */
export const getUsageStats = async (
  userId: string,
  startDate: number,
  endDate: number
) => {
  // This would query the featureUsage table in Convex
  // Grouping by feature/action to get counts
  const stats = {
    totalEvents: 0,
    byFeature: {} as Record<string, number>,
    byAction: {} as Record<string, number>,
    topFeatures: [] as Array<{ feature: string; count: number }>,
    topActions: [] as Array<{ action: string; count: number }>
  };

  return stats;
};

/**
 * Client-side analytics wrapper
 */
export class AnalyticsClient {
  constructor(private userId: string) {}

  async track(feature: string, action: string, metadata?: Record<string, any>) {
    try {
      const payload = {
        userId: this.userId,
        feature,
        action,
        metadata,
        timestamp: Date.now()
      };

      // Send to analytics service via API endpoint
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }

  // Feature-specific tracking methods
  trackSettingsUpdate = (setting: string, changes: any) =>
    this.track(TRACKED_FEATURES.ORGANIZATION_SETTINGS_UPDATED, 'update', {
      setting,
      changes
    });

  trackIntegrationSync = (integrationName: string, status: string) =>
    this.track(TRACKED_FEATURES.INTEGRATION_SYNCED, 'sync', {
      integrationName,
      status
    });

  trackAutomationExecution = (ruleName: string, result: string) =>
    this.track(TRACKED_FEATURES.AUTOMATION_RULE_EXECUTED, 'execute', {
      ruleName,
      result
    });

  trackWebhookEvent = (event: string, statusCode: number) =>
    this.track(TRACKED_FEATURES.WEBHOOK_TRIGGERED, 'trigger', {
      event,
      statusCode
    });

  trackProductAction = (action: string, productId: string, metadata?: any) =>
    this.track(
      TRACKED_FEATURES.PRODUCT_CREATED, // Replace with actual feature
      action,
      { productId, ...metadata }
    );
}

/**
 * Get feature adoption metrics
 */
export const getAdoptionMetrics = async (userId: string) => {
  return {
    totalUsers: 0,
    activeUsers: 0,
    featureAdoption: {} as Record<string, { users: number; adoption: number }>,
    topFeatures: [] as string[],
    lastUpdated: Date.now()
  };
};

/**
 * Get daily active users
 */
export const getDailyActiveUsers = async (days: number = 30) => {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    activeUsers: 0
  }));
};
