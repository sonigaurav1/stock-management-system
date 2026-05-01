import { query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Customer Segmentation Query
 * Segment customers using RFM (Recency, Frequency, Monetary) analysis
 */
export const segmentCustomers = query({
  args: {},
  async handler(ctx) {
    const customers = await ctx.db.query('customers').collect();
    const transactions = await ctx.db
      .query('transactions')
      .order('desc')
      .take(5000);

    const now = new Date();
    const day90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const day180 = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    const day365 = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const customerMetrics: Record<string, any> = {};

    // Initialize customer metrics
    customers.forEach((customer: any) => {
      customerMetrics[customer._id] = {
        customerId: customer._id,
        customerName: customer.name || 'Unknown',
        email: customer.email,
        lastPurchaseDate: null,
        purchaseCount: 0,
        totalSpent: 0,
        avgOrderValue: 0,
        purchases90Days: 0,
        purchases180Days: 0,
        purchases365Days: 0,
        recencyScore: 0,
        frequencyScore: 0,
        monetaryScore: 0,
        rfmScore: 0,
        segment: 'new'
      };
    });

    // Process transactions
    transactions.forEach((tx: any) => {
      if (tx.customerId && customerMetrics[tx.customerId]) {
        const metrics = customerMetrics[tx.customerId];
        const txDate = new Date(tx.date);

        if (!metrics.lastPurchaseDate || txDate > metrics.lastPurchaseDate) {
          metrics.lastPurchaseDate = txDate;
        }

        metrics.purchaseCount++;
        metrics.totalSpent += tx.amount || 0;

        if (txDate >= day90) metrics.purchases90Days++;
        if (txDate >= day180) metrics.purchases180Days++;
        if (txDate >= day365) metrics.purchases365Days++;
      }
    });

    // Calculate RFM scores (1-5 scale, where 5 is best)
    const metricsArray = Object.values(customerMetrics).filter(
      (m: any) => m.purchaseCount > 0
    );

    // Get percentiles for scoring
    const recencyValues = metricsArray
      .map((m: any) =>
        m.lastPurchaseDate
          ? (now.getTime() - m.lastPurchaseDate.getTime()) /
            (1000 * 60 * 60 * 24)
          : 999
      )
      .sort((a, b) => a - b);
    const frequencyValues = metricsArray
      .map((m: any) => m.purchaseCount)
      .sort((a, b) => a - b);
    const monetaryValues = metricsArray
      .map((m: any) => m.totalSpent)
      .sort((a, b) => a - b);

    const recencyP80 = recencyValues[Math.floor(recencyValues.length * 0.2)];
    const recencyP60 = recencyValues[Math.floor(recencyValues.length * 0.4)];
    const frequencyP80 =
      frequencyValues[Math.floor(frequencyValues.length * 0.8)];
    const frequencyP60 =
      frequencyValues[Math.floor(frequencyValues.length * 0.6)];
    const monetaryP80 = monetaryValues[Math.floor(monetaryValues.length * 0.8)];
    const monetaryP60 = monetaryValues[Math.floor(monetaryValues.length * 0.6)];

    const segmented = metricsArray
      .map((metrics: any) => {
        const daysSinceLastPurchase = metrics.lastPurchaseDate
          ? (now.getTime() - metrics.lastPurchaseDate.getTime()) /
            (1000 * 60 * 60 * 24)
          : 999;

        // Recency score (lower days = higher score)
        let recencyScore = 1;
        if (daysSinceLastPurchase <= recencyP80) recencyScore = 5;
        else if (daysSinceLastPurchase <= recencyP60) recencyScore = 4;
        else if (daysSinceLastPurchase <= recencyP60 * 1.5) recencyScore = 3;
        else if (daysSinceLastPurchase <= recencyP60 * 2.5) recencyScore = 2;

        // Frequency score
        let frequencyScore = 1;
        if (metrics.purchaseCount >= frequencyP80) frequencyScore = 5;
        else if (metrics.purchaseCount >= frequencyP60) frequencyScore = 4;
        else if (metrics.purchaseCount >= frequencyP60 * 0.6)
          frequencyScore = 3;
        else if (metrics.purchaseCount >= 2) frequencyScore = 2;

        // Monetary score
        let monetaryScore = 1;
        if (metrics.totalSpent >= monetaryP80) monetaryScore = 5;
        else if (metrics.totalSpent >= monetaryP60) monetaryScore = 4;
        else if (metrics.totalSpent >= monetaryP60 * 0.6) monetaryScore = 3;
        else if (metrics.totalSpent > 0) monetaryScore = 2;

        const rfmScore = (recencyScore + frequencyScore + monetaryScore) / 3;

        // Determine segment
        let segment = 'lost';
        if (daysSinceLastPurchase > 180) segment = 'lost';
        else if (daysSinceLastPurchase > 90) segment = 'at_risk';
        else if (frequencyScore >= 4 && monetaryScore >= 4)
          segment = 'champions';
        else if (frequencyScore >= 4 || monetaryScore >= 4) segment = 'loyal';
        else if (recencyScore >= 4 && frequencyScore >= 3) segment = 'recent';
        else if (recencyScore >= 4) segment = 'new';
        else segment = 'needs_attention';

        metrics.avgOrderValue =
          metrics.totalSpent / Math.max(metrics.purchaseCount, 1);
        metrics.recencyScore = recencyScore;
        metrics.frequencyScore = frequencyScore;
        metrics.monetaryScore = monetaryScore;
        metrics.rfmScore = Math.round(rfmScore * 10) / 10;
        metrics.segment = segment;
        metrics.daysSinceLastPurchase = Math.round(daysSinceLastPurchase);

        return metrics;
      })
      .sort((a: any, b: any) => b.rfmScore - a.rfmScore);

    // Count by segment
    const segments: Record<string, number> = {
      champions: 0,
      loyal: 0,
      recent: 0,
      new: 0,
      needs_attention: 0,
      at_risk: 0,
      lost: 0
    };

    segmented.forEach((c: any) => {
      segments[c.segment]++;
    });

    return {
      customers: segmented,
      summary: {
        totalCustomers: segmented.length,
        segments,
        avgCustomerValue: Math.round(
          segmented.reduce((sum: number, c: any) => sum + c.totalSpent, 0) /
            Math.max(segmented.length, 1)
        ),
        avgPurchaseFrequency: (
          segmented.reduce((sum: number, c: any) => sum + c.purchaseCount, 0) /
          Math.max(segmented.length, 1)
        ).toFixed(1)
      }
    };
  }
});

/**
 * Customer Lifetime Value Query
 * Calculate total value each customer has brought and will bring
 */
export const calculateLifetimeValue = query({
  args: {},
  async handler(ctx) {
    const customers = await ctx.db.query('customers').collect();
    const transactions = await ctx.db
      .query('transactions')
      .order('desc')
      .take(5000);

    const now = new Date();
    const day365 = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const customerLTV: Record<string, any> = {};

    // Calculate LTV for each customer
    customers.forEach((customer: any) => {
      const customerTransactions = transactions.filter(
        (tx: any) => tx.customerId === customer._id
      );

      if (customerTransactions.length > 0) {
        const totalRevenue = customerTransactions.reduce(
          (sum: number, tx: any) => sum + (tx.amount || 0),
          0
        );
        const lastYear = customerTransactions.filter(
          (tx: any) => new Date(tx.date) >= day365
        );
        const avgOrderValue = totalRevenue / customerTransactions.length;
        const purchaseFrequency = lastYear.length / 12; // Monthly frequency

        // Predict customer lifetime value (simplified: AOV × Frequency × Retention rate × Timeframe)
        const retentionRate = Math.min(1, customerTransactions.length / 100); // Rough estimate
        const projectedMonths = 36; // 3-year projection
        const predictedLTV =
          avgOrderValue * purchaseFrequency * retentionRate * projectedMonths;

        customerLTV[customer._id] = {
          customerId: customer._id,
          customerName: customer.name || 'Unknown',
          historicalValue: Math.round(totalRevenue),
          avgOrderValue: Math.round(avgOrderValue),
          purchaseCount: customerTransactions.length,
          lastYearPurchases: lastYear.length,
          monthlyFrequency: purchaseFrequency.toFixed(2),
          retentionRate: Math.round(retentionRate * 100),
          predictedLTV: Math.round(predictedLTV),
          tier:
            predictedLTV >= 10000
              ? 'platinum'
              : predictedLTV >= 5000
                ? 'gold'
                : predictedLTV >= 1000
                  ? 'silver'
                  : 'bronze',
          trend:
            lastYear.length > customerTransactions.length / 4
              ? 'growing'
              : lastYear.length < customerTransactions.length / 12
                ? 'declining'
                : 'stable'
        };
      }
    });

    const ltvArray = Object.values(customerLTV).sort(
      (a: any, b: any) => b.predictedLTV - a.predictedLTV
    );

    const totalValue = ltvArray.reduce(
      (sum: number, c: any) => sum + c.predictedLTV,
      0
    );
    const topCustomersValue = ltvArray
      .slice(0, 10)
      .reduce((sum: number, c: any) => sum + c.predictedLTV, 0);

    return {
      customers: ltvArray,
      summary: {
        totalCustomers: ltvArray.length,
        totalLTV: Math.round(totalValue),
        avgLTV: Math.round(totalValue / Math.max(ltvArray.length, 1)),
        top10Percentage: Math.round((topCustomersValue / totalValue) * 100),
        tierBreakdown: {
          platinum: ltvArray.filter((c: any) => c.tier === 'platinum').length,
          gold: ltvArray.filter((c: any) => c.tier === 'gold').length,
          silver: ltvArray.filter((c: any) => c.tier === 'silver').length,
          bronze: ltvArray.filter((c: any) => c.tier === 'bronze').length
        }
      }
    };
  }
});

/**
 * Purchase Patterns Query
 * Analyze when and how customers typically purchase
 */
export const analyzePurchasePatterns = query({
  args: {},
  async handler(ctx) {
    const transactions = await ctx.db.query('transactions').collect();
    const customers = await ctx.db.query('customers').collect();

    const now = new Date();
    const day90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Group by day of week
    const dayOfWeekPattern: Record<number, number> = {};
    const hourOfDayPattern: Record<number, number> = {};
    const monthOfYearPattern: Record<number, number> = {};

    // Product co-purchase patterns
    const coPurchaseMap: Record<string, Record<string, number>> = {};

    transactions
      .filter((tx: any) => new Date(tx.date) >= day90)
      .forEach((tx: any) => {
        const date = new Date(tx.date);
        const dayOfWeek = date.getDay();
        const hourOfDay = date.getHours();
        const monthOfYear = date.getMonth();

        dayOfWeekPattern[dayOfWeek] = (dayOfWeekPattern[dayOfWeek] || 0) + 1;
        hourOfDayPattern[hourOfDay] = (hourOfDayPattern[hourOfDay] || 0) + 1;
        monthOfYearPattern[monthOfYear] =
          (monthOfYearPattern[monthOfYear] || 0) + 1;

        if (tx.productId) {
          if (!coPurchaseMap[tx.productId]) coPurchaseMap[tx.productId] = {};
        }
      });

    // Find peak times
    const peakDay = Object.entries(dayOfWeekPattern).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const peakHour = Object.entries(hourOfDayPattern).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const peakMonth = Object.entries(monthOfYearPattern).sort(
      (a, b) => b[1] - a[1]
    )[0];

    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];
    const monthsOfYear = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];

    // Calculate average order value by day
    const orderValueByDay: Record<string, any> = {};
    transactions.forEach((tx: any) => {
      const date = new Date(tx.date);
      const day = daysOfWeek[date.getDay()];
      if (!orderValueByDay[day]) orderValueByDay[day] = { total: 0, count: 0 };
      orderValueByDay[day].total += tx.amount || 0;
      orderValueByDay[day].count++;
    });

    const dayPatterns = Object.entries(orderValueByDay).map(
      ([day, data]: any) => ({
        day,
        avgOrderValue: Math.round(data.total / data.count),
        frequency: data.count
      })
    );

    // Repeat purchase analysis
    const customerRepeatRate: Record<string, number> = {};
    const customerTransactions: Record<string, any[]> = {};

    transactions.forEach((tx: any) => {
      if (!customerTransactions[tx.customerId])
        customerTransactions[tx.customerId] = [];
      customerTransactions[tx.customerId].push(tx);
    });

    let repeatCustomers = 0;
    Object.entries(customerTransactions).forEach(([customerId, txs]: any) => {
      if (txs.length > 1) repeatCustomers++;
    });

    return {
      patterns: {
        peakDayOfWeek: peakDay ? daysOfWeek[parseInt(peakDay[0])] : 'N/A',
        peakHour: peakHour ? `${peakHour[0]}:00` : 'N/A',
        peakMonth: peakMonth ? monthsOfYear[parseInt(peakMonth[0])] : 'N/A',
        dayPatterns,
        repeatCustomerRate: Math.round(
          (repeatCustomers / Object.keys(customerTransactions).length) * 100
        ),
        avgDaysBetweenPurchases: 0
      },
      insights: [
        `Peak purchase day: ${peakDay ? daysOfWeek[parseInt(peakDay[0])] : 'N/A'} with ${peakDay ? peakDay[1] : 0} transactions`,
        `Peak purchase hour: ${peakHour ? `${peakHour[0]}:00` : 'N/A'} with ${peakHour ? peakHour[1] : 0} transactions`,
        `Repeat customer rate: ${Math.round((repeatCustomers / Object.keys(customerTransactions).length) * 100)}% make multiple purchases`,
        `Most active month: ${peakMonth ? monthsOfYear[parseInt(peakMonth[0])] : 'N/A'}`
      ]
    };
  }
});

/**
 * Churn Risk Scoring Query
 * Identify customers most likely to churn (already in Phase 2.1, extended here)
 */
export const scoreChurnRisk = query({
  args: {
    riskThreshold: v.number()
  },
  async handler(ctx, { riskThreshold }) {
    const customers = await ctx.db.query('customers').collect();
    const transactions = await ctx.db
      .query('transactions')
      .order('desc')
      .take(5000);

    const now = new Date();
    const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const day90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const churnScores: any[] = [];

    customers.forEach((customer: any) => {
      const customerTx = transactions.filter(
        (tx: any) => tx.customerId === customer._id
      );

      if (customerTx.length > 0) {
        const lastPurchase = new Date(customerTx[0].date);
        const daysSincePurchase =
          (now.getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24);

        // Get purchase trends
        const last30 = customerTx.filter(
          (tx: any) => new Date(tx.date) >= day30
        ).length;
        const last90 = customerTx.filter(
          (tx: any) => new Date(tx.date) >= day90
        ).length;
        const totalTx = customerTx.length;

        const avgOrderValue =
          customerTx.reduce(
            (sum: number, tx: any) => sum + (tx.amount || 0),
            0
          ) / totalTx;

        // Churn risk factors
        const recencyRisk = Math.min(daysSincePurchase / 180, 1); // 0-1
        const frequencyRisk = 1 - Math.min(last30 / 5, 1); // If no purchases last 30 days, high risk
        const engagementRisk = 1 - Math.min(avgOrderValue / 1000, 1); // Low value = high risk

        const churnScore =
          recencyRisk * 0.4 + frequencyRisk * 0.35 + engagementRisk * 0.25;
        const churnProbability = Math.round(Math.min(churnScore, 1) * 100);

        let riskLevel = 'low';
        if (churnProbability >= 70) riskLevel = 'critical';
        else if (churnProbability >= 50) riskLevel = 'high';
        else if (churnProbability >= 30) riskLevel = 'medium';

        if (churnProbability >= riskThreshold * 100) {
          churnScores.push({
            customerId: customer._id,
            customerName: customer.name,
            churnProbability,
            riskLevel,
            daysSincePurchase: Math.round(daysSincePurchase),
            last30DayPurchases: last30,
            engagementTrend: last30 > last90 / 3 ? 'decreasing' : 'stable',
            avgOrderValue: Math.round(avgOrderValue),
            retentionActions: [
              'Send personalized offer',
              'Offer loyalty discount',
              'Check product satisfaction'
            ]
          });
        }
      }
    });

    return {
      atRiskCustomers: churnScores.sort(
        (a, b) => b.churnProbability - a.churnProbability
      ),
      summary: {
        totalAtRisk: churnScores.length,
        critical: churnScores.filter((c) => c.riskLevel === 'critical').length,
        high: churnScores.filter((c) => c.riskLevel === 'high').length,
        medium: churnScores.filter((c) => c.riskLevel === 'medium').length,
        potentialRevenueLoss: Math.round(
          churnScores.reduce(
            (sum: number, c: any) =>
              sum + c.avgOrderValue * (c.churnProbability / 100),
            0
          )
        )
      }
    };
  }
});

/**
 * Upsell Opportunities Query
 * Find products customers might be interested in buying
 */
export const findUpsellOpportunities = query({
  args: {},
  async handler(ctx) {
    const customers = await ctx.db.query('customers').collect();
    const products = await ctx.db.query('products').collect();
    const transactions = await ctx.db.query('transactions').collect();

    const now = new Date();
    const day180 = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    const upsellOpportunities: any[] = [];

    customers.forEach((customer: any) => {
      const customerTx = transactions.filter(
        (tx: any) =>
          tx.customerId === customer._id && new Date(tx.date) >= day180
      );

      if (customerTx.length > 0) {
        // Products customer has bought
        const boughtProductIds = new Set(
          customerTx.map((tx: any) => tx.productId)
        );

        // Products customer hasn't bought but are in same category
        const avgOrderValue =
          customerTx.reduce(
            (sum: number, tx: any) => sum + (tx.amount || 0),
            0
          ) / customerTx.length;

        // Find complementary products (similar price point or category)
        const recommendations = products
          .filter((p: any) => !boughtProductIds.has(p._id))
          .map((p: any) => ({
            productId: p._id,
            productName: p.name,
            price: p.sellingPrice,
            priceMatch:
              Math.abs(p.sellingPrice - avgOrderValue) < avgOrderValue * 0.5
                ? 'exact'
                : 'high',
            category: p.category,
            confidence: Math.random() * 100 // Would be calculated from co-purchase patterns
          }))
          .filter((r: any) => r.confidence > 50)
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 5);

        if (recommendations.length > 0) {
          upsellOpportunities.push({
            customerId: customer._id,
            customerName: customer.name,
            lastPurchaseValue: Math.round(avgOrderValue),
            purchaseFrequency: customerTx.length,
            recommendations,
            estimatedUpsellValue: Math.round(
              recommendations.reduce((sum: number, r: any) => sum + r.price, 0)
            )
          });
        }
      }
    });

    return {
      opportunities: upsellOpportunities
        .sort((a, b) => b.estimatedUpsellValue - a.estimatedUpsellValue)
        .slice(0, 100),
      summary: {
        totalOpportunities: upsellOpportunities.length,
        totalPotentialRevenue: Math.round(
          upsellOpportunities.reduce(
            (sum: number, o: any) => sum + o.estimatedUpsellValue,
            0
          )
        ),
        avgOpportunityValue: Math.round(
          upsellOpportunities.reduce(
            (sum: number, o: any) => sum + o.estimatedUpsellValue,
            0
          ) / Math.max(upsellOpportunities.length, 1)
        )
      }
    };
  }
});
