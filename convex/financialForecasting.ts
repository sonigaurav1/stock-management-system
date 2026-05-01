import { query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Cash Flow Forecast Query
 * Predict cash position for next 3-6 months
 */
export const forecastCashFlow = query({
  args: { months: v.number() },
  async handler(ctx, { months }) {
    const transactions = await ctx.db
      .query('transactions')
      .order('desc')
      .take(10000);
    const now = new Date();

    // Get historical data for the past year
    const pastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const monthlyData: Record<string, any> = {};

    // Initialize months
    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = {
        revenue: 0,
        expenses: 0,
        receivables: 0,
        payables: 0
      };
    }

    // Process transactions
    transactions.forEach((tx: any) => {
      const txDate = new Date(tx.date);
      if (txDate >= pastYear) {
        const key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData[key]) {
          if (tx.type === 'sale') {
            monthlyData[key].revenue += tx.amount || 0;
            monthlyData[key].receivables += tx.amount || 0;
          } else if (tx.type === 'purchase') {
            monthlyData[key].expenses += tx.amount || 0;
            monthlyData[key].payables += tx.amount || 0;
          }
        }
      }
    });

    // Calculate average monthly metrics
    const historicalMonths = Object.entries(monthlyData)
      .slice(0, 12)
      .map(([_, data]) => data);

    const avgRevenue =
      historicalMonths.length > 0
        ? historicalMonths.reduce((sum, m: any) => sum + m.revenue, 0) /
          historicalMonths.length
        : 0;
    const avgExpenses =
      historicalMonths.length > 0
        ? historicalMonths.reduce((sum, m: any) => sum + m.expenses, 0) /
          historicalMonths.length
        : 0;

    // Add growth trend
    const recentAvg =
      historicalMonths
        .slice(-3)
        .reduce((sum: number, m: any) => sum + m.revenue, 0) / 3;
    const olderAvg =
      historicalMonths
        .slice(0, 3)
        .reduce((sum: number, m: any) => sum + m.revenue, 0) / 3;
    const growthRate = olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0.05; // Default 5% growth

    // Generate forecast
    let currentCash =
      historicalMonths.length > 0
        ? historicalMonths[historicalMonths.length - 1].revenue -
          historicalMonths[historicalMonths.length - 1].expenses
        : 0;

    const forecast = monthlyData;
    const forecastedMonths = [];

    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      // Apply growth factor to forecast
      const forecastedRevenue = avgRevenue * (1 + growthRate);
      const forecastedExpenses = avgExpenses * (1 + growthRate * 0.5); // Expenses grow slower
      const netCashFlow = forecastedRevenue - forecastedExpenses;

      currentCash += netCashFlow;

      forecastedMonths.push({
        month: date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        }),
        revenue: Math.round(forecastedRevenue),
        expenses: Math.round(forecastedExpenses),
        netCashFlow: Math.round(netCashFlow),
        cumulativeCash: Math.round(currentCash),
        receivables: Math.round(forecastedRevenue * 0.3), // 30% of revenue outstanding
        payables: Math.round(forecastedExpenses * 0.4) // 40% of expenses outstanding
      });
    }

    return {
      forecast: forecastedMonths,
      summary: {
        currentCash: Math.round(currentCash),
        avgMonthlyNetFlow: Math.round(avgRevenue - avgExpenses),
        projectedCashIn3Months:
          months >= 3
            ? Math.round(forecastedMonths[2].cumulativeCash)
            : Math.round(currentCash),
        projectedCashIn6Months:
          months >= 6
            ? Math.round(forecastedMonths[5].cumulativeCash)
            : Math.round(currentCash),
        growthRate: Math.round(growthRate * 100),
        riskLevel:
          currentCash < 0
            ? 'critical'
            : currentCash < avgExpenses
              ? 'high'
              : 'low'
      }
    };
  }
});

/**
 * Budget Planning Query
 * Auto-generate budget based on historical data
 */
export const generateBudget = query({
  args: { year: v.number() },
  async handler(ctx, { year }) {
    const transactions = await ctx.db.query('transactions').collect();

    // Get last 24 months of data for averaging
    const now = new Date();
    const twoYearsAgo = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);

    const categoryBudget: Record<string, any> = {};
    const categoryHistory: Record<string, number[]> = {};

    // Aggregate by category from transactions
    transactions
      .filter((tx: any) => new Date(tx.date) >= twoYearsAgo)
      .forEach((tx: any) => {
        const cat = tx.category || 'Other';
        if (!categoryHistory[cat]) categoryHistory[cat] = [];
        categoryHistory[cat].push(tx.amount || 0);
      });

    // Calculate budgets with seasonal adjustment
    const monthBudgets: Record<string, any> = {};

    for (let month = 1; month <= 12; month++) {
      let monthTotal = 0;
      let itemCount = 0;

      Object.entries(categoryHistory).forEach(([category, amounts]: any) => {
        if (amounts.length === 0) return;

        const avgAmount =
          amounts.reduce((a: number, b: number) => a + b, 0) / amounts.length;

        // Seasonal adjustment
        let seasonalFactor = 1;
        if ([11, 12].includes(month)) seasonalFactor = 1.2; // Holiday season
        if ([6, 7, 8].includes(month)) seasonalFactor = 0.9; // Summer dip

        const budgetAmount = Math.round(avgAmount * seasonalFactor);
        monthTotal += budgetAmount;

        if (!categoryBudget[category]) {
          categoryBudget[category] = [];
        }
        categoryBudget[category].push({
          month,
          budget: budgetAmount
        });
      });

      monthBudgets[month] = monthTotal;
    }

    const budget = [];
    for (let month = 1; month <= 12; month++) {
      const monthName = new Date(year, month - 1).toLocaleDateString('en-US', {
        month: 'long'
      });
      budget.push({
        month,
        monthName,
        budget: monthBudgets[month],
        actual: 0, // Will be filled in later with actual data
        variance: 0
      });
    }

    return {
      year,
      monthlyBudget: budget,
      categoryBreakdown: Object.entries(categoryBudget).map(
        ([category, months]: any) => {
          const totalBudget = months.reduce(
            (sum: number, m: any) => sum + m.budget,
            0
          );
          return {
            category,
            totalAnnualBudget: totalBudget,
            avgMonthlyBudget: Math.round(totalBudget / 12),
            monthlyDetails: months
          };
        }
      ),
      summary: {
        totalAnnualBudget: Object.values(monthBudgets).reduce(
          (a: number, b: number) => a + b,
          0
        ),
        avgMonthlyBudget: Math.round(
          Object.values(monthBudgets).reduce(
            (a: number, b: number) => a + b,
            0
          ) / 12
        ),
        categories: Object.keys(categoryBudget).length
      }
    };
  }
});

/**
 * Variance Analysis Query
 * Compare actual vs budget with explanations
 */
export const analyzeVariance = query({
  args: { year: v.number(), month: v.number() },
  async handler(ctx, { year, month }) {
    const transactions = await ctx.db.query('transactions').collect();
    const targetDate = new Date(year, month - 1);

    // Get budget (simplified - in real app would fetch saved budget)
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    const monthTransactions = transactions.filter((tx: any) => {
      const txDate = new Date(tx.date);
      return txDate >= monthStart && txDate <= monthEnd;
    });

    // Calculate totals by category
    const categoryActuals: Record<string, number> = {};
    const categoryTransactionCounts: Record<string, number> = {};

    monthTransactions.forEach((tx: any) => {
      const cat = tx.category || 'Other';
      categoryActuals[cat] = (categoryActuals[cat] || 0) + (tx.amount || 0);
      categoryTransactionCounts[cat] =
        (categoryTransactionCounts[cat] || 0) + 1;
    });

    // Get historical average for budgeting
    const historicalStart = new Date(year, month - 13, 1);
    const historicalEnd = new Date(
      year,
      month - 1,
      new Date(year, month, 0).getDate()
    );

    const historicalTransactions = transactions.filter((tx: any) => {
      const txDate = new Date(tx.date);
      return txDate >= historicalStart && txDate <= historicalEnd;
    });

    const historicalByCategory: Record<string, number[]> = {};
    historicalTransactions.forEach((tx: any) => {
      const cat = tx.category || 'Other';
      if (!historicalByCategory[cat]) historicalByCategory[cat] = [];
      historicalByCategory[cat].push(tx.amount || 0);
    });

    // Calculate variances
    const variances: Array<{
      category: string;
      budget: number;
      actual: number;
      variance: number;
      variancePercent: number;
      transactionCount: number;
      explanation: string;
    }> = [];
    let totalBudget = 0;
    let totalActual = Object.values(categoryActuals).reduce((a, b) => a + b, 0);

    Object.entries(categoryActuals).forEach(([category, actual]) => {
      const historicalAmounts = historicalByCategory[category] || [];
      const avgBudget =
        historicalAmounts.length > 0
          ? historicalAmounts.reduce((a, b) => a + b, 0) /
            historicalAmounts.length
          : 0;

      const variance = actual - avgBudget;
      const variancePercent = avgBudget > 0 ? (variance / avgBudget) * 100 : 0;

      totalBudget += avgBudget;

      let explanation = '';
      if (variancePercent > 20) {
        explanation = `Over budget by ${Math.round(variancePercent)}% - Review spending in this category`;
      } else if (variancePercent < -20) {
        explanation = `Under budget by ${Math.round(Math.abs(variancePercent))}% - Good cost control`;
      } else {
        explanation = `On track - Within 20% of budget`;
      }

      variances.push({
        category,
        budget: Math.round(avgBudget),
        actual: Math.round(actual),
        variance: Math.round(variance),
        variancePercent: Math.round(variancePercent),
        transactionCount: categoryTransactionCounts[category] || 0,
        explanation
      });
    });

    return {
      period: `${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      totalBudget: Math.round(totalBudget),
      totalActual: Math.round(totalActual),
      totalVariance: Math.round(totalActual - totalBudget),
      totalVariancePercent:
        totalBudget > 0
          ? Math.round(((totalActual - totalBudget) / totalBudget) * 100)
          : 0,
      byCategory: variances.sort(
        (a, b) => Math.abs(b.variancePercent) - Math.abs(a.variancePercent)
      ),
      summary: {
        onBudgetCategories: variances.filter(
          (v) => Math.abs(v.variancePercent) <= 20
        ).length,
        overBudgetCategories: variances.filter((v) => v.variancePercent > 20)
          .length,
        underBudgetCategories: variances.filter((v) => v.variancePercent < -20)
          .length
      }
    };
  }
});

/**
 * Profitability Forecast Query
 * Project profit for next quarter
 */
export const forecastProfitability = query({
  args: { quarters: v.number() },
  async handler(ctx, { quarters }) {
    const transactions = await ctx.db.query('transactions').collect();
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    const currentYear = now.getFullYear();

    // Get historical quarterly data
    const quarterlyData: Record<string, any> = {};
    const quarterlyProfit: Record<string, number> = {};

    transactions.forEach((tx: any) => {
      const txDate = new Date(tx.date);
      const txYear = txDate.getFullYear();
      const txQuarter = Math.floor(txDate.getMonth() / 3) + 1;
      const key = `Q${txQuarter}-${txYear}`;

      if (!quarterlyData[key]) {
        quarterlyData[key] = { revenue: 0, expenses: 0, cogs: 0 };
      }

      if (tx.type === 'sale') {
        quarterlyData[key].revenue += tx.amount || 0;
      } else if (tx.type === 'purchase') {
        quarterlyData[key].expenses += tx.amount || 0;
        quarterlyData[key].cogs += tx.amount || 0;
      }
    });

    // Calculate profit by quarter
    Object.entries(quarterlyData).forEach(([key, data]: any) => {
      quarterlyProfit[key] = data.revenue - data.expenses;
    });

    // Get recent 4 quarters for trend analysis
    const recentQuarters = Object.entries(quarterlyProfit)
      .slice(-4)
      .map(([_, profit]) => profit as number);

    const avgProfit =
      recentQuarters.length > 0
        ? recentQuarters.reduce((a, b) => a + b, 0) / recentQuarters.length
        : 0;

    // Calculate growth trend
    const oldestProfit = recentQuarters[0] || avgProfit;
    const latestProfit = recentQuarters[recentQuarters.length - 1] || avgProfit;
    const profitGrowth =
      oldestProfit > 0 ? (latestProfit - oldestProfit) / oldestProfit : 0.1;

    // Generate forecast
    const forecast = [];
    let projectedProfit = latestProfit;

    for (let i = 1; i <= quarters; i++) {
      const forecastQuarter = currentQuarter + i;
      const forecastYear = currentYear + Math.floor((forecastQuarter - 1) / 4);
      const adjustedQuarter = ((forecastQuarter - 1) % 4) + 1;

      // Apply growth with seasonal adjustment
      let seasonalFactor = 1;
      if ([4, 1].includes(adjustedQuarter)) seasonalFactor = 1.15; // Q4, Q1 typically stronger
      if (adjustedQuarter === 3) seasonalFactor = 0.95; // Q3 often slower

      projectedProfit = avgProfit * (1 + profitGrowth) * seasonalFactor;

      const profitMargin =
        latestProfit > 0 ? (projectedProfit / latestProfit) * 100 : 0;

      forecast.push({
        quarter: `Q${adjustedQuarter} ${forecastYear}`,
        projectedProfit: Math.round(projectedProfit),
        profitMargin: Math.round(profitMargin),
        trend: profitGrowth > 0 ? 'growing' : 'declining',
        riskFactors:
          projectedProfit < avgProfit * 0.8
            ? ['Below average profitability']
            : []
      });
    }

    return {
      forecast,
      summary: {
        avgQuarterlyProfit: Math.round(avgProfit),
        latestQuarterlyProfit: Math.round(latestProfit),
        profitTrend:
          profitGrowth > 0.05
            ? 'strong_growth'
            : profitGrowth > 0
              ? 'growing'
              : 'declining',
        projectedAnnualProfit: Math.round(
          forecast.reduce((sum: number, q: any) => sum + q.projectedProfit, 0)
        ),
        profitGrowthRate: Math.round(profitGrowth * 100)
      }
    };
  }
});
