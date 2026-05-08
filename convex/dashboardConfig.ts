import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';
import {
  WIDGET_CONFIGS,
  DEFAULT_LAYOUTS,
  Widget,
  type BusinessType,
  type WidgetType
} from '@/../src/types/dashboard';

// Initialize default dashboard for a user
export const initializeDashboard = mutation({
  args: {
    businessType: v.string()
  },
  handler: async (ctx, args) => {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    // Check if dashboard already exists
    const existing = await ctx.db
      .query('dashboardWidgets')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (existing) {
      return existing;
    }

    // Create default widgets based on business type
    const businessTypeKey = args.businessType.toLowerCase() as BusinessType;
    const defaultWidgetTypes =
      DEFAULT_LAYOUTS[businessTypeKey] || DEFAULT_LAYOUTS.retailer;

    const widgets: Widget[] = defaultWidgetTypes.map((widgetType, index) => {
      const widgetConfig = WIDGET_CONFIGS[widgetType];
      return {
        id: `${widgetType}-${userId}-${Date.now()}`,
        type: widgetType,
        title: widgetConfig.title,
        position: index,
        size: widgetConfig.size,
        isVisible: widgetConfig.isVisible,
        config: {
          description: widgetConfig.config?.description || '',
          icon: widgetConfig.config?.icon || 'BarChart3',
          businessTypes: widgetConfig.config?.businessTypes || [],
          defaultOrder: widgetConfig.config?.defaultOrder || 0
        }
      };
    });

    // Create dashboard entry
    const dashboardId = await ctx.db.insert('dashboardWidgets', {
      userId,
      widgets,
      layout: 'default',
      theme: 'light',
      refreshInterval: 30000, // 30 seconds default
      isPublic: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Initialize insight settings
    await ctx.db.insert('insightSettings', {
      userId,
      enableAnomalyDetection: true,
      anomalyThreshold: 15, // 15% change triggers alert
      enableTrendAnalysis: true,
      enableReorderAlerts: true,
      enablePaymentAlerts: true,
      lowStockThreshold: 25, // 25% of reorder level
      dismissedInsights: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    return dashboardId;
  }
});

// Get user's dashboard configuration
export const getDashboardConfig = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;

    // Resolve effective userId for team members
    const effectiveUserId = await (async () => {
      const company = await ctx.db
        .query('companies')
        .withIndex('by_user_and_isDeleted', (q: any) =>
          q.eq('userId', userId).eq('isDeleted', false)
        )
        .first();

      if (company) return userId;

      const teamMembership = await ctx.db
        .query('teamMembers')
        .withIndex('by_user', (q: any) => q.eq('userId', userId))
        .first();

      return teamMembership ? teamMembership.userId : userId;
    })();

    const dashboard = await ctx.db
      .query('dashboardWidgets')
      .withIndex('by_user', (q) => q.eq('userId', effectiveUserId))
      .first();

    if (!dashboard) {
      return null;
    }

    // Enrich widgets with full configuration data
    const enrichedWidgets = dashboard.widgets.map((widget: any) => {
      const widgetConfig = WIDGET_CONFIGS[widget.type as WidgetType];
      const mergedConfig = { ...widget.config };
      return {
        ...widget,
        config: {
          ...mergedConfig,
          description:
            mergedConfig.description || widgetConfig?.config?.description || '',
          icon: mergedConfig.icon || widgetConfig?.config?.icon || 'BarChart3',
          businessTypes:
            mergedConfig.businessTypes ||
            widgetConfig?.config?.businessTypes ||
            [],
          defaultOrder:
            mergedConfig.defaultOrder ?? widgetConfig?.config?.defaultOrder ?? 0
        }
      };
    });

    return {
      ...dashboard,
      widgets: enrichedWidgets
    };
  }
});

// Update widget visibility
export const updateWidgetVisibility = mutation({
  args: {
    widgetId: v.string(),
    isVisible: v.boolean()
  },
  handler: async (ctx, args) => {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SETTINGS);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    const dashboard = await ctx.db
      .query('dashboardWidgets')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    const updatedWidgets = dashboard.widgets.map((w) =>
      w.id === args.widgetId ? { ...w, isVisible: args.isVisible } : w
    );

    await ctx.db.patch(dashboard._id, {
      widgets: updatedWidgets,
      updatedAt: Date.now()
    });

    return true;
  }
});

// Reorder widgets
export const reorderWidgets = mutation({
  args: {
    widgetOrder: v.array(v.string()) // Array of widget IDs in new order
  },
  handler: async (ctx, args) => {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SETTINGS);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    const dashboard = await ctx.db
      .query('dashboardWidgets')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    // Create a map of widget ID to position
    const positionMap = new Map(
      args.widgetOrder.map((id, index) => [id, index])
    );

    const updatedWidgets = dashboard.widgets
      .map((w) => ({
        ...w,
        position: positionMap.has(w.id)
          ? (positionMap.get(w.id) ?? 0)
          : w.position
      }))
      .sort((a, b) => a.position - b.position);

    await ctx.db.patch(dashboard._id, {
      widgets: updatedWidgets,
      updatedAt: Date.now()
    });

    return true;
  }
});

// Update refresh interval
export const updateRefreshInterval = mutation({
  args: {
    interval: v.number() // milliseconds
  },
  handler: async (ctx, args) => {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SETTINGS);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    const dashboard = await ctx.db
      .query('dashboardWidgets')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    await ctx.db.patch(dashboard._id, {
      refreshInterval: Math.max(args.interval, 5000), // Minimum 5 seconds
      updatedAt: Date.now()
    });

    return true;
  }
});

// Reset dashboard to defaults
export const resetDashboardToDefaults = mutation({
  args: {
    businessType: v.string()
  },
  handler: async (ctx, args) => {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SETTINGS);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    const dashboard = await ctx.db
      .query('dashboardWidgets')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    // Recreate default widgets
    const businessTypeKey = args.businessType.toLowerCase() as BusinessType;
    const defaultWidgetTypes =
      DEFAULT_LAYOUTS[businessTypeKey] || DEFAULT_LAYOUTS.retailer;

    const widgets: Widget[] = defaultWidgetTypes.map((widgetType, index) => {
      const widgetConfig = WIDGET_CONFIGS[widgetType];
      return {
        id: `${widgetType}-${userId}-${Date.now()}-${index}`,
        type: widgetType,
        title: widgetConfig.title,
        position: index,
        size: widgetConfig.size,
        isVisible: widgetConfig.isVisible,
        config: {
          description: widgetConfig.config?.description || '',
          icon: widgetConfig.config?.icon || 'BarChart3',
          businessTypes: widgetConfig.config?.businessTypes || [],
          defaultOrder: widgetConfig.config?.defaultOrder || 0
        }
      };
    });

    await ctx.db.patch(dashboard._id, {
      widgets,
      layout: 'default',
      updatedAt: Date.now()
    });

    return true;
  }
});

// Get insight settings
export const getInsightSettings = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const userId = identity.subject;

    const settings = await ctx.db
      .query('insightSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    return settings || null;
  }
});

// Update insight settings
export const updateInsightSettings = mutation({
  args: {
    enableAnomalyDetection: v.optional(v.boolean()),
    anomalyThreshold: v.optional(v.number()),
    enableTrendAnalysis: v.optional(v.boolean()),
    enableReorderAlerts: v.optional(v.boolean()),
    enablePaymentAlerts: v.optional(v.boolean()),
    lowStockThreshold: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SETTINGS);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    const settings = await ctx.db
      .query('insightSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (!settings) {
      throw new Error('Insight settings not found');
    }

    const updates: any = { updatedAt: Date.now() };

    if (args.enableAnomalyDetection !== undefined) {
      updates.enableAnomalyDetection = args.enableAnomalyDetection;
    }
    if (args.anomalyThreshold !== undefined) {
      updates.anomalyThreshold = Math.max(args.anomalyThreshold, 1); // Min 1%
    }
    if (args.enableTrendAnalysis !== undefined) {
      updates.enableTrendAnalysis = args.enableTrendAnalysis;
    }
    if (args.enableReorderAlerts !== undefined) {
      updates.enableReorderAlerts = args.enableReorderAlerts;
    }
    if (args.enablePaymentAlerts !== undefined) {
      updates.enablePaymentAlerts = args.enablePaymentAlerts;
    }
    if (args.lowStockThreshold !== undefined) {
      updates.lowStockThreshold = Math.max(
        Math.min(args.lowStockThreshold, 100),
        0
      ); // 0-100%
    }

    await ctx.db.patch(settings._id, updates);

    return true;
  }
});
