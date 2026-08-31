import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Extended Schema Additions for Settings System
 * Add these tables to the existing schema.ts
 */

export const settingsSchema = {
  // Organization Settings
  organizationSettings: defineTable({
    userId: v.string(),
    companyName: v.string(),
    businessType: v.string(),
    taxNumber: v.string(),
    businessRegistration: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    postalCode: v.optional(v.string()),
    country: v.string(),
    phone: v.optional(v.string()),
    email: v.string(),
    website: v.optional(v.string()),
    description: v.optional(v.string()),
    logo: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user', ['userId']),

  // Notification Rules
  notificationRules: defineTable({
    userId: v.string(),
    name: v.string(),
    triggers: v.array(v.string()), // e.g., ["stock_low", "invoice_unpaid"]
    channels: v.array(v.string()), // e.g., ["email", "sms"]
    recipients: v.array(v.string()), // Email addresses or phone numbers
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user', ['userId']),

  // API Keys
  apiKeys: defineTable({
    userId: v.string(),
    name: v.string(),
    key: v.string(), // Hashed
    displayKey: v.string(), // Last 8 chars only
    isActive: v.boolean(),
    lastUsedAt: v.optional(v.number()),
    rateLimit: v.optional(v.number()), // Requests per minute
    createdAt: v.number(),
    expiresAt: v.optional(v.number())
  }).index('by_user', ['userId']),

  // Audit Log
  auditLog: defineTable({
    userId: v.string(),
    action: v.string(), // e.g., "settings_updated", "invoice_created"
    entityType: v.string(), // e.g., "product", "invoice", "user"
    entityId: v.string(),
    changes: v.optional(v.any()), // What changed: {old: ..., new: ...}
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number()
  }).index('by_user', ['userId']),

  // Dashboard Configuration - Widget customization per user
  dashboardWidgets: defineTable({
    userId: v.string(),
    widgets: v.array(
      v.object({
        id: v.string(), // Unique widget instance ID
        type: v.string(), // Widget type: revenue_summary, sales_count, etc.
        title: v.string(),
        position: v.number(), // Order position in dashboard
        size: v.string(), // 'small', 'medium', 'large'
        isVisible: v.boolean(),
        isLocked: v.optional(v.boolean()),
        config: v.optional(v.any())
      })
    ),
    layout: v.string(), // 'default' or 'custom'
    theme: v.optional(v.string()), // 'light', 'dark'
    refreshInterval: v.number(), // milliseconds
    isPublic: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user', ['userId']),

  // Dashboard Insights Configuration
  insightSettings: defineTable({
    userId: v.string(),
    enableAnomalyDetection: v.boolean(),
    anomalyThreshold: v.number(), // percentage
    enableTrendAnalysis: v.boolean(),
    enableReorderAlerts: v.boolean(),
    enablePaymentAlerts: v.boolean(),
    lowStockThreshold: v.number(), // percentage
    dismissedInsights: v.array(v.string()), // IDs of dismissed insights
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user', ['userId']),

  // Stored Insights/Alerts
  userInsights: defineTable({
    userId: v.string(),
    type: v.string(), // 'warning', 'opportunity', 'alert', 'info'
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    actionUrl: v.optional(v.string()),
    actionLabel: v.optional(v.string()),
    priority: v.string(), // 'high', 'medium', 'low'
    widgetId: v.optional(v.string()),
    isDismissed: v.boolean(),
    dismissedAt: v.optional(v.number()),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()) // Auto-expire old insights
  }).index('by_user', ['userId']),

  // Dashboard Export History
  dashboardExports: defineTable({
    userId: v.string(),
    exportType: v.string(), // 'pdf', 'excel', 'csv'
    format: v.string(),
    fileName: v.string(),
    fileUrl: v.optional(v.string()),
    includeCharts: v.boolean(),
    dateRange: v.optional(
      v.object({
        startDate: v.number(),
        endDate: v.number()
      })
    ),
    widgetsIncluded: v.array(v.string()),
    status: v.string(), // 'processing', 'completed', 'failed'
    error: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number())
  }).index('by_user', ['userId'])
};
