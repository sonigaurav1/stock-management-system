import { v } from 'convex/values';
import { query } from './_generated/server';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

/**
 * P&L Intelligence Module
 * Provides comprehensive profit and loss analysis for business owners
 */

// Helper to get date range boundaries
const getDateRange = (rangeType: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
  const now = new Date();
  const startDate = new Date();

  switch (rangeType) {
    case 'daily':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      const day = now.getDay();
      startDate.setDate(now.getDate() - day);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'yearly':
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
  }

  return {
    startDate: startDate.getTime(),
    endDate: now.getTime()
  };
};

/**
 * Get automated P&L report for a given period
 */
export const getProfitLossReport = query({
  args: {
    period: v.union(
      v.literal('daily'),
      v.literal('weekly'),
      v.literal('monthly'),
      v.literal('yearly')
    )
  },
  handler: async (ctx, { period }) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_FINANCIAL_REPORTS);
    const userId = getDataScopeUserId(caller);

    const { startDate, endDate } = getDateRange(period);

    // Get all sales in period - collect first, then filter
    const allSales = await ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    const sales = allSales.filter(
      (s) => s.soldAt >= startDate && s.soldAt <= endDate
    );

    // Calculate total revenue
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    // Calculate COGS (Cost of Goods Sold) from stock movements
    const allPurchases = await ctx.db
      .query('stockMovements')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    const purchases = allPurchases.filter(
      (m) =>
        m.type === 'purchase' &&
        m.createdAt >= startDate &&
        m.createdAt <= endDate
    );

    // Get product details for cost calculation
    let totalCOGS = 0;
    for (const purchase of purchases) {
      const product = await ctx.db.get(purchase.productId as any);
      if (product && 'purchasePrice' in product) {
        const cost =
          parseFloat((product.purchasePrice as string) || '0') *
          purchase.quantity;
        totalCOGS += cost;
      }
    }

    // Gross Profit = Revenue - COGS
    const grossProfit = totalRevenue - totalCOGS;
    const grossProfitMargin =
      totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return {
      period,
      dateRange: { startDate, endDate },
      revenue: {
        total: totalRevenue,
        transactionCount: sales.length,
        averagePerTransaction:
          sales.length > 0 ? totalRevenue / sales.length : 0
      },
      costs: {
        cogs: totalCOGS,
        purchaseCount: purchases.length
      },
      profitMetrics: {
        grossProfit,
        grossProfitMargin: Math.round(grossProfitMargin * 100) / 100,
        netProfit: grossProfit // Simplified - actual net profit would subtract operating expenses
      }
    };
  }
});

/**
 * Get product-level profitability analysis
 */
export const getProductProfitability = query({
  args: {
    period: v.union(
      v.literal('daily'),
      v.literal('weekly'),
      v.literal('monthly'),
      v.literal('yearly')
    ),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { period, limit = 10 }) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_FINANCIAL_REPORTS);
    const userId = getDataScopeUserId(caller);

    const { startDate, endDate } = getDateRange(period);

    // Get all sales in period
    const allSales = await ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    const sales = allSales.filter(
      (s) => s.soldAt >= startDate && s.soldAt <= endDate
    );

    // Group by product
    const productProfits: Record<
      string,
      {
        productId: string;
        productName: string;
        quantitySold: number;
        revenue: number;
        cogs: number;
        profit: number;
        margin: number;
      }
    > = {};

    for (const sale of sales) {
      if (!sale.productId) continue;

      const product = await ctx.db.get(sale.productId as any);
      if (!product || !('name' in product) || !('purchasePrice' in product))
        continue;

      const cost = parseFloat((product.purchasePrice as string) || '0');
      const profit = (sale.sellingPrice - cost) * sale.quantitySold;
      const margin =
        sale.sellingPrice > 0
          ? ((sale.sellingPrice - cost) / sale.sellingPrice) * 100
          : 0;

      if (!productProfits[sale.productId]) {
        productProfits[sale.productId] = {
          productId: sale.productId,
          productName: product.name as string,
          quantitySold: 0,
          revenue: 0,
          cogs: 0,
          profit: 0,
          margin: 0
        };
      }

      productProfits[sale.productId].quantitySold += sale.quantitySold;
      productProfits[sale.productId].revenue += sale.totalAmount;
      productProfits[sale.productId].cogs += cost * sale.quantitySold;
      productProfits[sale.productId].profit += profit;
      productProfits[sale.productId].margin =
        productProfits[sale.productId].revenue > 0
          ? (productProfits[sale.productId].profit /
              productProfits[sale.productId].revenue) *
            100
          : 0;
    }

    // Sort by profit and limit
    const sorted = Object.values(productProfits)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, limit);

    return sorted;
  }
});

/**
 * Get category-level profit margins
 */
export const getCategoryMargins = query({
  args: {
    period: v.union(
      v.literal('daily'),
      v.literal('weekly'),
      v.literal('monthly'),
      v.literal('yearly')
    )
  },
  handler: async (ctx, { period }) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_FINANCIAL_REPORTS);
    const userId = getDataScopeUserId(caller);

    const { startDate, endDate } = getDateRange(period);

    // Get all sales
    const allSales = await ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    const sales = allSales.filter(
      (s) => s.soldAt >= startDate && s.soldAt <= endDate
    );

    const categoryMargins: Record<
      string,
      {
        categoryName: string;
        totalRevenue: number;
        totalCOGS: number;
        totalProfit: number;
        marginPercentage: number;
        productCount: number;
      }
    > = {};

    for (const sale of sales) {
      if (!sale.productId) continue;

      const product = await ctx.db.get(sale.productId as any);
      if (
        !product ||
        !('purchasePrice' in product) ||
        !('categoryName' in product)
      )
        continue;

      const cost = parseFloat((product.purchasePrice as string) || '0');
      const profit = (sale.sellingPrice - cost) * sale.quantitySold;
      const categoryName = (product.categoryName as string) || 'Uncategorized';

      if (!categoryMargins[categoryName]) {
        categoryMargins[categoryName] = {
          categoryName,
          totalRevenue: 0,
          totalCOGS: 0,
          totalProfit: 0,
          marginPercentage: 0,
          productCount: 0
        };
      }

      categoryMargins[categoryName].totalRevenue += sale.totalAmount;
      categoryMargins[categoryName].totalCOGS += cost * sale.quantitySold;
      categoryMargins[categoryName].totalProfit += profit;
      categoryMargins[categoryName].productCount += 1;
      categoryMargins[categoryName].marginPercentage =
        categoryMargins[categoryName].totalRevenue > 0
          ? (categoryMargins[categoryName].totalProfit /
              categoryMargins[categoryName].totalRevenue) *
            100
          : 0;
    }

    return Object.values(categoryMargins).sort(
      (a, b) => b.marginPercentage - a.marginPercentage
    );
  }
});

/**
 * Calculate break-even point for a product
 * How many units need to sell to cover fixed and variable costs
 */
export const getBreakEvenAnalysis = query({
  args: {
    productId: v.string(),
    monthlyFixedCosts: v.optional(v.number())
  },
  handler: async (ctx, { productId, monthlyFixedCosts = 0 }) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_FINANCIAL_REPORTS);

    const product = await ctx.db.get(productId as any);
    if (
      !product ||
      !('name' in product) ||
      !('sellingPrice' in product) ||
      !('purchasePrice' in product)
    ) {
      throw new Error('Product not found');
    }

    const sellingPrice = (product.sellingPrice as number) || 0;
    const variableCost = parseFloat((product.purchasePrice as string) || '0');
    const contributionMargin = sellingPrice - variableCost;

    if (contributionMargin <= 0) {
      return {
        productId,
        productName: product.name as string,
        breakEvenUnits: null,
        breakEvenRevenue: null,
        message: 'Product is not profitable - selling price is less than cost'
      };
    }

    const breakEvenUnits = Math.ceil(monthlyFixedCosts / contributionMargin);
    const breakEvenRevenue = breakEvenUnits * sellingPrice;

    return {
      productId,
      productName: product.name as string,
      sellingPrice,
      variableCost,
      contributionMargin: Math.round(contributionMargin * 100) / 100,
      contributionMarginPercentage:
        Math.round((contributionMargin / sellingPrice) * 100 * 100) / 100,
      monthlyFixedCosts,
      breakEvenUnits,
      breakEvenRevenue: Math.round(breakEvenRevenue * 100) / 100
    };
  }
});

/**
 * Get P&L trend analysis comparing multiple periods
 */
export const getProfitTrend = query({
  args: {
    months: v.optional(v.number()) // Compare last N months
  },
  handler: async (ctx, { months = 3 }) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_FINANCIAL_REPORTS);
    const userId = getDataScopeUserId(caller);

    const trends = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate =
        i === 0
          ? now
          : new Date(
              now.getFullYear(),
              now.getMonth() - i + 1,
              0,
              23,
              59,
              59,
              999
            );

      // Get sales for this month
      const allSales = await ctx.db
        .query('sales')
        .withIndex('by_user_and_isDeleted', (q) =>
          q.eq('userId', userId).eq('isDeleted', false)
        )
        .collect();

      const sales = allSales.filter(
        (s) => s.soldAt >= startDate.getTime() && s.soldAt <= endDate.getTime()
      );

      const revenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const transactionCount = sales.length;

      trends.push({
        month: startDate.toLocaleString('default', {
          month: 'short',
          year: 'numeric'
        }),
        revenue,
        transactionCount,
        averagePerTransaction:
          transactionCount > 0 ? revenue / transactionCount : 0
      });
    }

    return trends;
  }
});

/**
 * Get products that are losing money or have low margins
 */
export const getLowMarginProducts = query({
  args: {
    minMarginPercentage: v.optional(v.number())
  },
  handler: async (ctx, { minMarginPercentage = 10 }) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_FINANCIAL_REPORTS);
    const userId = getDataScopeUserId(caller);

    const { startDate, endDate } = getDateRange('monthly');

    const allSales = await ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    const sales = allSales.filter(
      (s) => s.soldAt >= startDate && s.soldAt <= endDate
    );

    const productMargins: Record<
      string,
      {
        productId: string;
        productName: string;
        sellingPrice: number;
        costPrice: number;
        marginPercentage: number;
        unitsSold: number;
        recommendation: string;
      }
    > = {};

    for (const sale of sales) {
      if (!sale.productId) continue;

      const product = await ctx.db.get(sale.productId as any);
      if (
        !product ||
        !('purchasePrice' in product) ||
        !('sellingPrice' in product) ||
        !('name' in product)
      )
        continue;

      const cost = parseFloat((product.purchasePrice as string) || '0');
      const sellingPrice = (product.sellingPrice as number) || 0;
      const marginPercentage =
        sellingPrice && sellingPrice > 0
          ? ((sellingPrice - cost) / sellingPrice) * 100
          : -100;

      if (marginPercentage < minMarginPercentage) {
        if (!productMargins[sale.productId]) {
          productMargins[sale.productId] = {
            productId: sale.productId,
            productName: product.name as string,
            sellingPrice: (product.sellingPrice as number) || 0,
            costPrice: cost,
            marginPercentage: Math.round(marginPercentage * 100) / 100,
            unitsSold: 0,
            recommendation: ''
          };
        }

        productMargins[sale.productId].unitsSold += sale.quantitySold;

        if (marginPercentage < 0) {
          productMargins[sale.productId].recommendation =
            '⚠️ Losing money - increase price or reduce cost';
        } else if (marginPercentage < 10) {
          productMargins[sale.productId].recommendation =
            '📊 Low margin - consider increasing price';
        }
      }
    }

    return Object.values(productMargins).sort(
      (a, b) => a.marginPercentage - b.marginPercentage
    );
  }
});
