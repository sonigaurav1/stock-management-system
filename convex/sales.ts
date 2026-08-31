import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

export const createSale = mutation({
  args: {
    productId: v.string(),
    customerId: v.id('customers'),
    customerName: v.string(),
    customerPhone: v.array(v.string()),
    quantitySold: v.number(),
    paymentStatus: v.union(
      v.literal('paid'),
      v.literal('unpaid'),
      v.literal('partially_paid')
    ),
    sellingPrice: v.number(),
    totalAmount: v.number(),
    soldAt: v.number(),
    locationId: v.optional(v.id('locations'))
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.CREATE_TRANSACTION);

    const userId = getDataScopeUserId(caller);

    return await ctx.db.insert('sales', {
      ...args,
      userId,
      isDeleted: false
    });
  }
});

// Get recent sales for the user (last 90 days by default)
export const getRecentSales = query({
  args: {
    days: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);

    const userId = getDataScopeUserId(caller);

    const daysBack = args.days ?? 90;
    const cutoffTime = Date.now() - daysBack * 24 * 60 * 60 * 1000;

    const sales = await ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect()
      .then((sales) => sales.filter((s) => s.soldAt >= cutoffTime));

    return sales.sort((a, b) => b.soldAt - a.soldAt);
  }
});

/**
 * STEP 6.5: Stock Turnover Report - calculate inventory velocity
 */
export const getInventoryTurnover = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number())
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);

    const userId = getDataScopeUserId(caller);

    // Default to last 90 days
    const startDate = args.startDate || Date.now() - 90 * 24 * 60 * 60 * 1000;
    const endDate = args.endDate || Date.now();

    // Get all products
    const products = await ctx.db
      .query('products')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    // Get sales in period
    const allSales = await ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect()
      .then((s) =>
        s.filter((sale) => sale.soldAt >= startDate && sale.soldAt <= endDate)
      );

    // Calculate turnover for each product
    const turnoverData = products
      .map((product) => {
        const productSales = allSales.filter(
          (s) => s.productId === product._id
        );
        const totalQtySold = productSales.reduce(
          (sum, s) => sum + (s.quantitySold || 0),
          0
        );
        const avgStock = product.stockLevel || 1;
        const avgDailySales = totalQtySold / 90;
        const turnoverRate = avgStock > 0 ? avgDailySales / avgStock : 0;
        const daysToSell = turnoverRate > 0 ? avgStock / turnoverRate : 999;

        return {
          productId: product._id,
          productName: product.name,
          sku: product.sku,
          category: product.categoryName,
          currentStock: product.stockLevel || 0,
          unitsSold: totalQtySold,
          turnoverRate: Math.round(turnoverRate * 100) / 100,
          daysToSell: Math.round(daysToSell),
          status:
            daysToSell < 30
              ? 'Fast Moving'
              : daysToSell < 90
                ? 'Normal'
                : daysToSell < 180
                  ? 'Slow Moving'
                  : 'Dead Stock'
        };
      })
      .filter((p) => p.unitsSold > 0 || p.currentStock > 0);

    // Sort by turnover rate (highest first)
    turnoverData.sort((a, b) => b.turnoverRate - a.turnoverRate);

    const fastMoving = turnoverData.filter(
      (t) => t.status === 'Fast Moving'
    ).length;
    const normal = turnoverData.filter((t) => t.status === 'Normal').length;
    const slowMoving = turnoverData.filter(
      (t) => t.status === 'Slow Moving'
    ).length;
    const deadStock = turnoverData.filter(
      (t) => t.status === 'Dead Stock'
    ).length;

    return {
      period: { startDate, endDate },
      summary: {
        totalProducts: products.length,
        avgTurnoverRate:
          Math.round(
            (turnoverData.reduce((s, t) => s + t.turnoverRate, 0) /
              turnoverData.length) *
              100
          ) / 100,
        fastMoving,
        normal,
        slowMoving,
        deadStock
      },
      byProduct: turnoverData,
      format: 'Inventory Turnover Report'
    };
  }
});
