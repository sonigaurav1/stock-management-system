import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import type { Insight } from '@/../src/types/dashboard';

// Generate insights based on current metrics
export const generateInsights = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;

    const insights: Insight[] = [];

    // Get insight settings
    const settings = await ctx.db
      .query('insightSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (!settings || settings.dismissedInsights.includes('*')) {
      return [];
    }

    // Get current sales data
    const currentSales = await ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    // Get products
    const products = await ctx.db
      .query('products')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    // ANOMALY DETECTION: Sales comparison
    if (settings.enableAnomalyDetection && currentSales.length > 0) {
      const now = new Date();
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - now.getDay());
      currentWeekStart.setHours(0, 0, 0, 0);

      const lastWeekStart = new Date(currentWeekStart);
      lastWeekStart.setDate(currentWeekStart.getDate() - 7);

      const currentWeekSales = currentSales
        .filter((s) => s.soldAt >= currentWeekStart.getTime())
        .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

      const lastWeekSales = currentSales
        .filter(
          (s) =>
            s.soldAt >= lastWeekStart.getTime() &&
            s.soldAt < currentWeekStart.getTime()
        )
        .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

      if (lastWeekSales > 0) {
        const percentageChange =
          ((currentWeekSales - lastWeekSales) / lastWeekSales) * 100;

        if (Math.abs(percentageChange) >= (settings.anomalyThreshold || 15)) {
          if (percentageChange < 0) {
            insights.push({
              id: `anomaly-sales-${Date.now()}`,
              type: 'warning',
              title: 'Sales Down This Week',
              description: `Your sales are down ${Math.abs(percentageChange).toFixed(1)}% compared to last week. Check competitor activity or seasonal trends.`,
              icon: 'TrendingDown',
              priority: 'high',
              timestamp: Date.now(),
              dismissible: true,
              widgetId: 'revenue_summary',
              actionUrl: '/reports/sales-analysis',
              actionLabel: 'View Analysis'
            });
          } else {
            insights.push({
              id: `opportunity-sales-${Date.now()}`,
              type: 'opportunity',
              title: 'Strong Sales Growth',
              description: `Great news! Sales are up ${percentageChange.toFixed(1)}% this week.`,
              icon: 'TrendingUp',
              priority: 'medium',
              timestamp: Date.now(),
              dismissible: true,
              widgetId: 'revenue_summary'
            });
          }
        }
      }
    }

    // REORDER ALERTS
    if (settings.enableReorderAlerts) {
      const lowStockProducts = products.filter((p) => {
        if (!p.reorderLevel || !p.stockLevel) return false;

        const thresholdLevel =
          p.reorderLevel * (settings.lowStockThreshold / 100);
        return p.stockLevel <= thresholdLevel && p.stockLevel > 0;
      });

      if (lowStockProducts.length > 0) {
        insights.push({
          id: `reorder-alert-${Date.now()}`,
          type: 'alert',
          title: `${lowStockProducts.length} Product(s) Need Reorder`,
          description: `${lowStockProducts
            .slice(0, 3)
            .map((p) => p.name)
            .join(', ')}${
            lowStockProducts.length > 3
              ? ` and ${lowStockProducts.length - 3} more`
              : ''
          } are running low on stock.`,
          icon: 'AlertTriangle',
          priority: 'high',
          timestamp: Date.now(),
          dismissible: true,
          widgetId: 'reorder_alerts',
          actionUrl: '/products?status=low_stock',
          actionLabel: 'View Products'
        });
      }
    }

    // OUT OF STOCK ALERTS
    const outOfStockProducts = products.filter(
      (p) => !p.inStock && p.stockLevel === 0
    );
    if (outOfStockProducts.length > 0) {
      insights.push({
        id: `out-of-stock-${Date.now()}`,
        type: 'alert',
        title: `${outOfStockProducts.length} Product(s) Out of Stock`,
        description: `${outOfStockProducts
          .slice(0, 2)
          .map((p) => p.name)
          .join(', ')}${
          outOfStockProducts.length > 2
            ? ` and ${outOfStockProducts.length - 2} more`
            : ''
        } are currently out of stock.`,
        icon: 'X',
        priority: 'high',
        timestamp: Date.now(),
        dismissible: true,
        widgetId: 'inventory_health',
        actionUrl: '/products?status=out_of_stock',
        actionLabel: 'Check Products'
      });
    }

    // PAYMENT ALERTS
    if (settings.enablePaymentAlerts) {
      const unpaidSales = currentSales.filter(
        (s) => s.paymentStatus === 'unpaid'
      );
      if (unpaidSales.length > 0) {
        const totalUnpaid = unpaidSales.reduce(
          (sum, s) => sum + (s.totalAmount || 0),
          0
        );

        insights.push({
          id: `payment-due-${Date.now()}`,
          type: 'alert',
          title: 'Outstanding Payments',
          description: `You have ${unpaidSales.length} unpaid invoice(s) totaling Rs. ${totalUnpaid.toFixed(2)}.`,
          icon: 'Clock',
          priority: 'medium',
          timestamp: Date.now(),
          dismissible: true,
          widgetId: 'payment_status',
          actionUrl: '/billing/creditors/payments',
          actionLabel: 'View Payments'
        });
      }
    }

    // TOP PRODUCTS INFO
    if (products.length > 0 && currentSales.length > 0) {
      const salesByProduct: Record<string, number> = {};
      currentSales.forEach((sale) => {
        if (sale.productId) {
          salesByProduct[sale.productId] =
            (salesByProduct[sale.productId] || 0) + sale.quantitySold;
        }
      });

      const topProduct = Object.entries(salesByProduct)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 1);

      if (topProduct.length > 0) {
        const product = products.find((p) => p._id === topProduct[0][0]);
        if (product) {
          insights.push({
            id: `top-product-${Date.now()}`,
            type: 'info',
            title: 'Top Selling Product',
            description: `${product.name} is your best seller with ${topProduct[0][1]} units sold.`,
            icon: 'Star',
            priority: 'low',
            timestamp: Date.now(),
            dismissible: true,
            widgetId: 'top_products'
          });
        }
      }
    }

    return insights;
  }
});

// Get non-dismissed insights
export const getActiveInsights = query({
  args: {
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;
    const limit = args.limit ?? 10;
    const now = Date.now();

    const insights = await ctx.db
      .query('userInsights')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('isDismissed'), false),
          q.or(
            q.eq(q.field('expiresAt'), undefined),
            q.gt(q.field('expiresAt'), now)
          )
        )
      )
      .order('desc')
      .take(limit);

    return insights;
  }
});

// Dismiss an insight
export const dismissInsight = mutation({
  args: {
    insightId: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;

    const insight = await ctx.db
      .query('userInsights')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('_id'), args.insightId))
      .first();

    if (!insight) {
      throw new Error('Insight not found');
    }

    await ctx.db.patch(insight._id, {
      isDismissed: true,
      dismissedAt: Date.now()
    });

    return true;
  }
});

// Store a new insight
export const storeInsight = mutation({
  args: {
    type: v.string(),
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    priority: v.string(),
    widgetId: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    actionLabel: v.optional(v.string()),
    expiresAt: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;

    const insightId = await ctx.db.insert('userInsights', {
      userId,
      type: args.type,
      title: args.title,
      description: args.description,
      icon: args.icon,
      priority: args.priority,
      widgetId: args.widgetId,
      actionUrl: args.actionUrl,
      actionLabel: args.actionLabel,
      isDismissed: false,
      createdAt: Date.now(),
      expiresAt: args.expiresAt
    });

    return insightId;
  }
});

// Clear expired insights
export const clearExpiredInsights = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;
    const now = Date.now();

    const expiredInsights = await ctx.db
      .query('userInsights')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('isDismissed'), false),
          q.lt(q.field('expiresAt'), now)
        )
      )
      .collect();

    for (const insight of expiredInsights) {
      await ctx.db.patch(insight._id, { isDismissed: true });
    }

    return expiredInsights.length;
  }
});
