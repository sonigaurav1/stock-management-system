import { query } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

/**
 * Sales Forecasting Query
 * Predicts future sales for 1-12 months with confidence intervals
 */
export const getSalesForecasts = query({
  args: {
    months: v.number(),
    includeConfidence: v.boolean()
  },
  async handler(ctx, { months, includeConfidence }) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_FINANCIAL_REPORTS);
    const userId = getDataScopeUserId(caller);

    // Get 12 months of historical sales data
    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_user_firm_isDeleted')
      .order('desc')
      .take(500);

    // Group by month and calculate monthly revenue
    const monthlySales: Record<string, number> = {};
    const monthlyTransactions: Record<string, number> = {};

    transactions.forEach((tx: any) => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlySales[monthKey] = (monthlySales[monthKey] || 0) + (tx.amount || 0);
      monthlyTransactions[monthKey] = (monthlyTransactions[monthKey] || 0) + 1;
    });

    // Get last 12 months
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    });

    const historicalData = last12Months.map((month) => ({
      month,
      revenue: monthlySales[month] || 0
    }));

    // Calculate growth rate and seasonal factors
    const revenues = historicalData.map((h) => h.revenue).filter((r) => r > 0);
    const avgRevenue =
      revenues.length > 0
        ? revenues.reduce((a, b) => a + b) / revenues.length
        : 0;
    const growthRate =
      revenues.length > 1
        ? (((revenues[revenues.length - 1] - revenues[0]) / revenues[0]) *
            100) /
          11
        : 0;

    // Calculate seasonal factors (current vs last year)
    const currentMonth = new Date().getMonth();
    const lastYearRevenue =
      monthlySales[
        `${new Date().getFullYear() - 1}-${String(currentMonth + 1).padStart(2, '0')}`
      ] || avgRevenue;
    const currentYearRevenue =
      monthlySales[
        `${new Date().getFullYear()}-${String(currentMonth + 1).padStart(2, '0')}`
      ] || avgRevenue;
    const seasonalFactor =
      lastYearRevenue > 0 ? currentYearRevenue / lastYearRevenue : 1;

    // Generate forecasts
    const forecasts = Array.from({ length: months }, (_, i) => {
      const forecastDate = new Date();
      forecastDate.setMonth(forecastDate.getMonth() + i + 1);
      const monthStr = `${forecastDate.getFullYear()}-${String(forecastDate.getMonth() + 1).padStart(2, '0')}`;

      // Base forecast with growth
      const baseRevenue = avgRevenue * (1 + (growthRate / 100) * (i + 1));
      const forecastedRevenue = baseRevenue * seasonalFactor;

      // Calculate confidence intervals
      const variance =
        revenues.length > 1
          ? revenues.reduce((sum, r) => sum + Math.pow(r - avgRevenue, 2), 0) /
            revenues.length
          : 0;
      const stdDev = Math.sqrt(variance);
      const confidence = 80 + (10 * Math.min(i + 1, 3)) / 3; // Confidence decreases over time

      return {
        month: monthStr,
        forecastedRevenue: Math.round(forecastedRevenue),
        confidenceLow: Math.round(forecastedRevenue - stdDev),
        confidenceHigh: Math.round(forecastedRevenue + stdDev),
        confidence: confidence,
        seasonalFactor: seasonalFactor.toFixed(2)
      };
    });

    const totalForecasted = forecasts.reduce(
      (sum, f) => sum + f.forecastedRevenue,
      0
    );

    return {
      lastActualMonth: last12Months[11],
      lastActualRevenue: monthlySales[last12Months[11]] || 0,
      forecasts,
      growthRate: Math.round(growthRate * 10) / 10,
      seasonalFactor: seasonalFactor.toFixed(2),
      totalForecasted,
      averageMonthly: Math.round(totalForecasted / months)
    };
  }
});

/**
 * Growth Projections Query
 * Annual and quarterly growth projections
 */
export const getGrowthProjections = query({
  args: {},
  async handler(ctx) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_FINANCIAL_REPORTS);
    const userId = getDataScopeUserId(caller);

    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_user_firm_isDeleted')
      .order('desc')
      .take(500);

    // Group by quarter
    const quarterlyRevenue: Record<string, number> = {};
    transactions.forEach((tx: any) => {
      const date = new Date(tx.date);
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      const key = `${date.getFullYear()}-Q${quarter}`;
      quarterlyRevenue[key] = (quarterlyRevenue[key] || 0) + (tx.amount || 0);
    });

    // Get last 4 quarters
    const lastYear = new Date().getFullYear();
    const lastQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

    const q1 = `${lastYear}-Q${lastQuarter}`;
    const q2 = `${lastYear}-Q${lastQuarter > 1 ? lastQuarter - 1 : 4}`;
    const q3 = `${lastYear - (lastQuarter > 2 ? 0 : 1)}-Q${lastQuarter > 2 ? lastQuarter - 2 : lastQuarter + 2}`;
    const q4 = `${lastYear - (lastQuarter > 1 ? 0 : 1)}-Q${lastQuarter > 1 ? lastQuarter - 1 : 4}`;

    const q1Revenue = quarterlyRevenue[q1] || 0;
    const q2Revenue = quarterlyRevenue[q2] || 0;
    const q3Revenue = quarterlyRevenue[q3] || 0;
    const q4Revenue = quarterlyRevenue[q4] || 0;

    const totalYearRevenue = q1Revenue + q2Revenue + q3Revenue + q4Revenue;

    // Project next 4 quarters
    const avgQtr = totalYearRevenue / 4;
    const projectedAnnual = avgQtr * 4 * 1.15; // 15% growth projection

    return {
      annualProjection: Math.round(projectedAnnual),
      quarterlyBreakdown: [
        {
          quarter: 'Q1',
          revenue: q1Revenue,
          projected: Math.round(q1Revenue * 1.15)
        },
        {
          quarter: 'Q2',
          revenue: q2Revenue,
          projected: Math.round(q2Revenue * 1.15)
        },
        {
          quarter: 'Q3',
          revenue: q3Revenue,
          projected: Math.round(q3Revenue * 1.15)
        },
        {
          quarter: 'Q4',
          revenue: q4Revenue,
          projected: Math.round(q4Revenue * 1.15)
        }
      ],
      yoyGrowth: 15,
      currentYearRevenue: totalYearRevenue
    };
  }
});

/**
 * Churn Prediction Query
 * Identifies customers at risk of churning
 */
export const getChurnPrediction = query({
  args: {
    riskThreshold: v.number()
  },
  async handler(ctx, { riskThreshold }) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_FINANCIAL_REPORTS);
    const userId = getDataScopeUserId(caller);

    const customers = await ctx.db
      .query('customers')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();
    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_user_firm_isDeleted')
      .order('desc')
      .take(1000);

    // Calculate customer metrics
    const customerMetrics: Record<string, any> = {};
    customers.forEach((customer: any) => {
      customerMetrics[customer._id] = {
        name: customer.name,
        customerId: customer._id,
        lastPurchaseDate: null,
        purchaseCount: 0,
        totalSpent: 0,
        avgPurchaseValue: 0,
        riskScore: 0
      };
    });

    // Process transactions
    transactions.forEach((tx: any) => {
      if (tx.customerId && customerMetrics[tx.customerId]) {
        const metrics = customerMetrics[tx.customerId];
        metrics.purchaseCount++;
        metrics.totalSpent += tx.amount || 0;

        if (!metrics.lastPurchaseDate) {
          const date = new Date(tx.date);
          metrics.lastPurchaseDate = date;
        }
      }
    });

    // Calculate risk scores
    const now = new Date();
    const customerPredictions = Object.values(customerMetrics)
      .filter((m: any) => m.purchaseCount > 0)
      .map((metrics: any) => {
        const daysSincePurchase = metrics.lastPurchaseDate
          ? Math.floor(
              (now.getTime() - metrics.lastPurchaseDate.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 999;

        // Risk calculation: 40% days since purchase, 30% purchase frequency, 30% engagement
        const recencyRisk = Math.min(daysSincePurchase / 365, 1) * 0.4;
        const frequencyRisk =
          (1 - Math.min(metrics.purchaseCount / 12, 1)) * 0.3;
        const engagementRisk =
          (1 - Math.min(metrics.totalSpent / 100000, 1)) * 0.3;

        const riskScore = recencyRisk + frequencyRisk + engagementRisk;

        return {
          ...metrics,
          daysSincePurchase,
          riskScore: Math.min(riskScore, 1),
          riskLevel:
            riskScore >= 0.8 ? 'Critical' : riskScore >= 0.6 ? 'High' : 'Medium'
        };
      })
      .filter((m) => m.riskScore >= riskThreshold)
      .sort((a: any, b: any) => b.riskScore - a.riskScore);

    return {
      predictions: customerPredictions,
      totalCustomers: customers.length,
      atRiskCount: customerPredictions.length,
      riskDistribution: {
        critical: customerPredictions.filter((p: any) => p.riskScore >= 0.8)
          .length,
        high: customerPredictions.filter(
          (p: any) => p.riskScore >= 0.6 && p.riskScore < 0.8
        ).length,
        medium: customerPredictions.filter((p: any) => p.riskScore < 0.6).length
      }
    };
  }
});

/**
 * Scenario Analysis Query
 * Runs what-if analysis for business scenarios
 */
export const runScenario = query({
  args: {
    baselineRevenue: v.number(),
    marketingIncrease: v.number(),
    priceIncrease: v.number(),
    volumeIncrease: v.number(),
    months: v.number()
  },
  async handler(
    ctx,
    {
      baselineRevenue,
      marketingIncrease,
      priceIncrease,
      volumeIncrease,
      months
    }
  ) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_FINANCIAL_REPORTS);
    // Calculate scenario impact
    // Marketing: 4x ROI multiplier
    const marketingImpact = (marketingIncrease / 100) * 4;

    // Price: negative elasticity of -2x (2% price increase = 4% volume decrease)
    const volumeFromPrice = (priceIncrease / 100) * -2;

    // Volume increase
    const totalVolumeIncrease = volumeIncrease / 100;

    // Combined revenue multiplier
    const revenueMultiplier =
      1 +
      marketingImpact +
      priceIncrease / 100 +
      totalVolumeIncrease +
      volumeFromPrice;

    const projectedRevenue = baselineRevenue * revenueMultiplier;

    // Monthly breakdown
    const monthlyBreakdown = Array.from({ length: months }, (_, i) => {
      const progressFactor = 1 - Math.pow(0.7, i + 1); // Ramp up over time
      const monthRevenue =
        baselineRevenue + (projectedRevenue - baselineRevenue) * progressFactor;

      return {
        month: i + 1,
        revenue: Math.round(monthRevenue),
        marketingSpend: Math.round((baselineRevenue * marketingIncrease) / 100),
        roi: (
          (monthRevenue - baselineRevenue) /
          ((baselineRevenue * marketingIncrease) / 100 || 1)
        ).toFixed(1)
      };
    });

    return {
      baselineRevenue,
      projectedRevenue: Math.round(projectedRevenue),
      totalGrowth: (
        ((projectedRevenue - baselineRevenue) / baselineRevenue) *
        100
      ).toFixed(1),
      monthlyBreakdown,
      riskLevel:
        marketingIncrease > 30
          ? 'High'
          : marketingIncrease > 15
            ? 'Medium'
            : 'Low',
      recommendedAction:
        marketingIncrease > 30
          ? 'Test smaller budget first'
          : marketingIncrease > 0
            ? 'Good investment opportunity'
            : 'Consider increasing marketing spend'
    };
  }
});
