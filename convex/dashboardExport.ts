import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Request dashboard export
export const requestDashboardExport = mutation({
  args: {
    exportType: v.string(), // 'pdf', 'excel', 'csv'
    includeCharts: v.boolean(),
    widgetsIncluded: v.array(v.string()),
    dateRange: v.optional(
      v.object({
        startDate: v.number(),
        endDate: v.number()
      })
    )
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;

    // Create export record
    const exportId = await ctx.db.insert('dashboardExports', {
      userId,
      exportType: args.exportType,
      format: args.exportType.toUpperCase(),
      fileName: `dashboard-export-${Date.now()}.${args.exportType === 'excel' ? 'xlsx' : args.exportType}`,
      includeCharts: args.includeCharts,
      dateRange: args.dateRange,
      widgetsIncluded: args.widgetsIncluded,
      status: 'processing',
      createdAt: Date.now()
    });

    // In production, this would queue a background job
    // For now, we'll use a success status after a simulated delay
    // The actual PDF/Excel generation would be handled by a serverless function

    return {
      exportId,
      status: 'processing',
      message: 'Your export is being prepared. You will receive a link shortly.'
    };
  }
});

// Get export history
export const getExportHistory = query({
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

    const exports = await ctx.db
      .query('dashboardExports')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .take(limit);

    return exports;
  }
});

// Prepare export data (returns data structure for export)
export const prepareExportData = query({
  args: {
    widgetIds: v.array(v.string()),
    dateRange: v.optional(
      v.object({
        startDate: v.number(),
        endDate: v.number()
      })
    )
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;

    // Get company details for header
    const company = await ctx.db
      .query('companyDetails')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .first();

    // Get sales data for the date range
    let sales = await ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    if (args.dateRange) {
      sales = sales.filter(
        (s) =>
          s.soldAt >= args.dateRange!.startDate &&
          s.soldAt <= args.dateRange!.endDate
      );
    }

    // Calculate metrics
    const totalRevenue = sales.reduce(
      (sum, s) => sum + (s.totalAmount || 0),
      0
    );
    const totalSales = sales.length;
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Get products for inventory section
    const products = await ctx.db
      .query('products')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    const totalProducts = products.length;
    const outOfStock = products.filter((p) => !p.inStock).length;
    const totalInventoryValue = products.reduce((sum, p) => {
      const cost =
        typeof p.purchasePrice === 'string' ? parseFloat(p.purchasePrice) : 0;
      return sum + cost * (p.stockLevel || 0);
    }, 0);

    // Get suppliers
    const suppliers = await ctx.db
      .query('suppliers')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    return {
      metadata: {
        exportDate: new Date().toISOString(),
        company: {
          name: company?.companyName || 'Unknown Company',
          email: company?.email || '',
          address: company?.companyAddress || '',
          phone: (company?.phone || [])[0] || ''
        },
        dateRange: args.dateRange || {
          startDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
          endDate: Date.now()
        }
      },
      summary: {
        totalRevenue,
        totalSales,
        avgOrderValue,
        totalProducts,
        outOfStock,
        totalInventoryValue,
        activeSuppliers: suppliers.length
      },
      salesData: sales.slice(0, 100), // Limit to prevent bloat
      productData: products.slice(0, 50),
      supplierData: suppliers.slice(0, 20)
    };
  }
});

// Update export status (called after export is generated)
export const updateExportStatus = mutation({
  args: {
    exportId: v.string(),
    status: v.string(), // 'completed', 'failed'
    fileUrl: v.optional(v.string()),
    error: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;

    const exp = await ctx.db
      .query('dashboardExports')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('_id'), args.exportId))
      .first();

    if (!exp) {
      throw new Error('Export record not found');
    }

    await ctx.db.patch(exp._id, {
      status: args.status,
      fileUrl: args.fileUrl,
      error: args.error,
      completedAt: Date.now()
    });

    return true;
  }
});

// Get metrics summary for export
export const getExportMetricsSummary = query({
  args: {
    timeframe: v.string() // 'week', 'month', 'quarter', 'year'
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;
    const now = new Date();

    let startDate = new Date(now);

    switch (args.timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const sales = await ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .filter((q) => q.gte(q.field('soldAt'), startDate.getTime()))
      .collect();

    const products = await ctx.db
      .query('products')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    // Group sales by product
    const salesByProduct: Record<string, { count: number; revenue: number }> =
      {};
    sales.forEach((sale) => {
      const key = sale.productId || 'unknown';
      if (!salesByProduct[key]) {
        salesByProduct[key] = { count: 0, revenue: 0 };
      }
      salesByProduct[key].count += sale.quantitySold || 0;
      salesByProduct[key].revenue += sale.totalAmount || 0;
    });

    // Match with product names
    const topProducts = Object.entries(salesByProduct)
      .map(([productId, { count, revenue }]) => {
        const product = products.find((p) => p._id === productId);
        return {
          productName: product?.name || 'Unknown',
          quantitySold: count,
          revenue
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      timeframe: args.timeframe,
      period: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      totals: {
        revenue: sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
        transactions: sales.length,
        averageOrderValue:
          sales.length > 0
            ? sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0) /
              sales.length
            : 0
      },
      inventory: {
        totalProducts: products.length,
        inStock: products.filter((p) => p.inStock).length,
        outOfStock: products.filter((p) => !p.inStock).length,
        lowStock: products.filter((p) => {
          if (!p.reorderLevel || !p.stockLevel) return false;
          return p.stockLevel <= p.reorderLevel * 0.25;
        }).length
      },
      topProducts
    };
  }
});
