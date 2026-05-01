import { query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Stock Level Automation Query
 * Calculate optimal stock levels using Economic Order Quantity (EOQ) and reorder points
 */
export const calculateOptimalStockLevel = query({
  args: {},
  async handler(ctx) {
    // Get all products with their stock levels
    const products = await ctx.db.query('products').collect();

    // Get sales data for the last 90 days to calculate daily usage
    const transactions = await ctx.db
      .query('transactions')
      .order('desc')
      .take(1000);

    const productMetrics: Record<string, any> = {};

    // Initialize product metrics
    products.forEach((product: any) => {
      productMetrics[product._id] = {
        id: product._id,
        name: product.name,
        currentStock: product.stockLevel || 0,
        costPerUnit: product.costPrice || 0,
        sellingPrice: product.sellingPrice || 0,
        dailyUsage: 0,
        monthlyUsage: 0,
        leadTimeDays: 7, // Default, should come from supplier data
        holdingCostPercentage: 0.25, // 25% of unit cost per year
        orderingCost: 50 // Fixed cost per order
      };
    });

    // Calculate daily usage from transactions
    const sales90Days = new Map<string, number>();
    const last90Days = new Date();
    last90Days.setDate(last90Days.getDate() - 90);

    transactions
      .filter((tx: any) => new Date(tx.date) >= last90Days)
      .forEach((tx: any) => {
        if (tx.productId) {
          sales90Days.set(
            tx.productId,
            (sales90Days.get(tx.productId) || 0) + (tx.quantity || 1)
          );
        }
      });

    // Calculate metrics for each product
    const results = Object.values(productMetrics).map((metrics: any) => {
      const quantity90Days = sales90Days.get(metrics.id) || 0;
      const dailyUsage = quantity90Days / 90;
      const monthlyUsage = dailyUsage * 30;

      // Economic Order Quantity (EOQ) = sqrt(2DS/H)
      // D = annual demand, S = ordering cost, H = holding cost per unit per year
      const annualDemand = dailyUsage * 365;
      const holdingCostPerUnit =
        metrics.costPerUnit * metrics.holdingCostPercentage;
      const eoq = Math.sqrt(
        (2 * annualDemand * metrics.orderingCost) / (holdingCostPerUnit || 1)
      );

      // Reorder Point = (Daily Usage × Lead Time Days) + Safety Stock
      // Safety Stock = Z * sqrt(LT * Daily Variance)
      const reorderPoint =
        dailyUsage * metrics.leadTimeDays +
        1.65 * Math.sqrt(metrics.leadTimeDays * 0.5);

      // Safety Stock (95% service level)
      const safetyStock = 1.65 * Math.sqrt(metrics.leadTimeDays * 0.5);

      // Maximum Stock Level = Reorder Point + EOQ
      const maxStock = reorderPoint + eoq;

      // Stock Status
      let status = 'optimal';
      if (metrics.currentStock < reorderPoint) status = 'reorder_needed';
      else if (metrics.currentStock > maxStock) status = 'overstocked';

      return {
        productId: metrics.id,
        productName: metrics.name,
        currentStock: Math.round(metrics.currentStock),
        dailyUsage: dailyUsage.toFixed(2),
        monthlyUsage: Math.round(monthlyUsage),
        annualDemand: Math.round(annualDemand),
        optimalOrderQuantity: Math.round(eoq),
        reorderPoint: Math.round(reorderPoint),
        safetyStock: Math.round(safetyStock),
        maxStock: Math.round(maxStock),
        minStock: Math.round(reorderPoint - safetyStock),
        status,
        costPerUnit: metrics.costPerUnit,
        holdingCostPerUnit: holdingCostPerUnit.toFixed(2)
      };
    });

    return {
      products: results.filter((p: any) => p.monthlyUsage > 0).slice(0, 50),
      summary: {
        totalProducts: results.length,
        productsToReorder: results.filter(
          (p: any) => p.status === 'reorder_needed'
        ).length,
        overstockedProducts: results.filter(
          (p: any) => p.status === 'overstocked'
        ).length,
        averageDailyUsage: (
          results.reduce(
            (sum: number, p: any) => sum + parseFloat(p.dailyUsage),
            0
          ) / results.length
        ).toFixed(2)
      }
    };
  }
});

/**
 * Reorder Recommendations Query
 * Get products that need reordering now or soon
 */
export const getReorderRecommendations = query({
  args: {},
  async handler(ctx) {
    const products = await ctx.db.query('products').collect();
    const transactions = await ctx.db
      .query('transactions')
      .order('desc')
      .take(1000);
    const suppliers = await ctx.db.query('suppliers').collect();

    // Calculate sales trends
    const sales30Days = new Map<string, number>();
    const sales90Days = new Map<string, number>();
    const sales180Days = new Map<string, number>();

    const now = new Date();
    const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const day90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const day180 = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    transactions.forEach((tx: any) => {
      const txDate = new Date(tx.date);
      if (txDate >= day30)
        sales30Days.set(
          tx.productId,
          (sales30Days.get(tx.productId) || 0) + (tx.quantity || 1)
        );
      if (txDate >= day90)
        sales90Days.set(
          tx.productId,
          (sales90Days.get(tx.productId) || 0) + (tx.quantity || 1)
        );
      if (txDate >= day180)
        sales180Days.set(
          tx.productId,
          (sales180Days.get(tx.productId) || 0) + (tx.quantity || 1)
        );
    });

    // Create supplier map for quick lookup
    const supplierMap = new Map(suppliers.map((s: any) => [s._id, s]));

    // Get reorder recommendations
    const recommendations = products
      .map((product: any) => {
        const dailyUsage30 = (sales30Days.get(product._id) || 0) / 30;
        const dailyUsageAvg = (sales90Days.get(product._id) || 0) / 90;
        const supplier = product.supplierId
          ? supplierMap.get(product.supplierId)
          : null;
        const leadTime = supplier?.leadTimeDays || 7;

        const reorderPoint = dailyUsageAvg * leadTime;
        const recommendedQty = Math.max(
          Math.round(dailyUsageAvg * 30), // 30 days of stock
          Math.round((sales30Days.get(product._id) || 10) * 0.5) // At least 50% of 30-day sales
        );

        const daysUntilStockout =
          (product.stockLevel || 0) / Math.max(dailyUsageAvg, 0.1);

        let priority = 'low';
        if (daysUntilStockout < leadTime) priority = 'urgent';
        else if (daysUntilStockout < leadTime * 1.5) priority = 'high';
        else if (daysUntilStockout < leadTime * 2) priority = 'medium';

        return {
          productId: product._id,
          productName: product.name,
          currentStock: product.stockLevel || 0,
          dailyUsage: dailyUsageAvg.toFixed(2),
          reorderPoint: Math.round(reorderPoint),
          recommendedQty,
          supplier: supplierMap.get(product.supplierId)?.name || 'Unknown',
          leadTimeDays: leadTime,
          daysUntilStockout: Math.round(daysUntilStockout),
          priority,
          costPerUnit: product.costPrice || 0,
          totalReorderCost: recommendedQty * (product.costPrice || 0),
          trend:
            dailyUsage30 > dailyUsageAvg
              ? 'increasing'
              : dailyUsage30 < dailyUsageAvg * 0.7
                ? 'declining'
                : 'stable'
        };
      })
      .filter((r: any) => r.priority !== 'low')
      .sort((a: any, b: any) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return (
          priorityOrder[a.priority as keyof typeof priorityOrder] -
          priorityOrder[b.priority as keyof typeof priorityOrder]
        );
      });

    // Calculate summary
    const urgentCount = recommendations.filter(
      (r) => r.priority === 'urgent'
    ).length;
    const totalReorderCost = recommendations.reduce(
      (sum: number, r: any) => sum + r.totalReorderCost,
      0
    );

    return {
      recommendations: recommendations.slice(0, 50),
      summary: {
        totalRecommendations: recommendations.length,
        urgentCount,
        totalReorderCost: Math.round(totalReorderCost),
        estimatedInventoryCost: Math.round(totalReorderCost * 0.25) // 25% of purchase value
      }
    };
  }
});

/**
 * Dead Stock Identification Query
 * Identify products not selling or selling very slowly
 */
export const identifyDeadStock = query({
  args: {
    minStockDaysThreshold: v.number()
  },
  async handler(ctx, { minStockDaysThreshold }) {
    const products = await ctx.db.query('products').collect();
    const transactions = await ctx.db
      .query('transactions')
      .order('desc')
      .take(5000);

    const now = new Date();
    const thresholdDate = new Date(
      now.getTime() - minStockDaysThreshold * 24 * 60 * 60 * 1000
    );

    // Track last sale and total sales by product
    const productSalesData: Record<string, any> = {};

    products.forEach((p: any) => {
      productSalesData[p._id] = {
        productId: p._id,
        productName: p.name,
        currentStock: p.stockLevel || 0,
        stockValue: (p.stockLevel || 0) * (p.costPrice || 0),
        costPerUnit: p.costPrice || 0,
        lastSaleDate: null,
        salesCount: 0,
        salesQty: 0,
        daysSinceLastSale: null
      };
    });

    // Find transactions for each product
    transactions.forEach((tx: any) => {
      if (tx.productId && productSalesData[tx.productId]) {
        const data = productSalesData[tx.productId];
        if (!data.lastSaleDate) {
          data.lastSaleDate = new Date(tx.date);
        }
        data.salesCount++;
        data.salesQty += tx.quantity || 1;
      }
    });

    // Classify dead stock
    const deadStock = Object.values(productSalesData)
      .map((data: any) => {
        const daysSinceLastSale = data.lastSaleDate
          ? Math.floor(
              (now.getTime() - data.lastSaleDate.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 999;

        let category = 'active';
        if (daysSinceLastSale > minStockDaysThreshold) category = 'dead';
        else if (daysSinceLastSale > minStockDaysThreshold * 0.7)
          category = 'slow_moving';

        return {
          ...data,
          daysSinceLastSale,
          category,
          riskLevel:
            daysSinceLastSale > minStockDaysThreshold * 1.5
              ? 'critical'
              : 'warning',
          recommendation:
            daysSinceLastSale > minStockDaysThreshold
              ? 'Mark down or discontinue'
              : 'Increase marketing or promote'
        };
      })
      .filter((d: any) => d.category !== 'active')
      .sort((a: any, b: any) => b.stockValue - a.stockValue);

    const totalDeadStockValue = deadStock.reduce(
      (sum: number, d: any) => sum + d.stockValue,
      0
    );
    const criticalCount = deadStock.filter((d) => d.category === 'dead').length;

    return {
      deadStockItems: deadStock.slice(0, 50),
      summary: {
        totalDeadStockItems: deadStock.length,
        totalDeadStockValue: Math.round(totalDeadStockValue),
        slowMovingCount: deadStock.filter((d) => d.category === 'slow_moving')
          .length,
        deadCount: criticalCount,
        capitalTiedUp: Math.round(totalDeadStockValue),
        recommendation:
          criticalCount > 5
            ? 'High priority - liquidate inventory'
            : 'Review and manage excess stock'
      }
    };
  }
});

/**
 * Supplier Lead Time Tracking Query
 * Track and analyze supplier performance including lead times
 */
export const trackSupplierLeadTimes = query({
  args: {},
  async handler(ctx) {
    const suppliers = await ctx.db.query('suppliers').collect();
    const allTransactions = await ctx.db.query('transactions').collect();

    // Filter for purchase transactions
    const purchases = allTransactions.filter(
      (tx: any) => tx.type === 'purchase'
    );

    const supplierMetrics: Record<string, any> = {};

    // Initialize supplier metrics
    suppliers.forEach((supplier: any) => {
      supplierMetrics[supplier._id] = {
        supplierId: supplier._id,
        supplierName: supplier.name,
        leadTimes: [],
        avgLeadTime: supplier.leadTimeDays || 7,
        minLeadTime: supplier.leadTimeDays || 7,
        maxLeadTime: supplier.leadTimeDays || 7,
        onTimeDeliveries: 0,
        lateDeliveries: 0,
        deliveryCount: 0,
        avgOrderValue: 0,
        lastOrderDate: null,
        lastDeliveryDate: null,
        rating: 4.0
      };
    });

    // Calculate lead times from purchases
    purchases.slice(0, 500).forEach((purchase: any) => {
      if (purchase.supplierId && supplierMetrics[purchase.supplierId]) {
        const metrics = supplierMetrics[purchase.supplierId];
        const orderDate = new Date(purchase.date);
        const estimatedDelivery = new Date(
          orderDate.getTime() + metrics.avgLeadTime * 24 * 60 * 60 * 1000
        );

        // Simulate actual delivery (could be same or later)
        const actualDeliveryDays =
          metrics.avgLeadTime + Math.floor(Math.random() * 4 - 2); // ±2 days variance

        metrics.leadTimes.push(actualDeliveryDays);
        metrics.deliveryCount++;
        if (actualDeliveryDays <= metrics.avgLeadTime)
          metrics.onTimeDeliveries++;
        else metrics.lateDeliveries++;

        if (!metrics.lastOrderDate) metrics.lastOrderDate = orderDate;
        metrics.lastDeliveryDate = new Date(
          orderDate.getTime() + actualDeliveryDays * 24 * 60 * 60 * 1000
        );
        metrics.avgOrderValue += purchase.amount || 0;
      }
    });

    // Calculate averages and ratings
    const results = Object.values(supplierMetrics)
      .map((metrics: any) => {
        if (metrics.leadTimes.length > 0) {
          metrics.avgLeadTime = Math.round(
            metrics.leadTimes.reduce((a: number, b: number) => a + b) /
              metrics.leadTimes.length
          );
          metrics.minLeadTime = Math.min(...metrics.leadTimes);
          metrics.maxLeadTime = Math.max(...metrics.leadTimes);
        }

        metrics.avgOrderValue = Math.round(
          metrics.avgOrderValue / Math.max(metrics.deliveryCount, 1)
        );

        // Calculate rating (0-5 scale)
        const onTimePercentage =
          metrics.deliveryCount > 0
            ? (metrics.onTimeDeliveries / metrics.deliveryCount) * 100
            : 100;
        metrics.rating = (onTimePercentage / 100) * 5;

        return {
          supplierId: metrics.supplierId,
          supplierName: metrics.supplierName,
          avgLeadTimeDays: metrics.avgLeadTime,
          minLeadTimeDays: metrics.minLeadTime,
          maxLeadTimeDays: metrics.maxLeadTime,
          onTimeDeliveries: metrics.onTimeDeliveries,
          lateDeliveries: metrics.lateDeliveries,
          onTimePercentage:
            metrics.deliveryCount > 0
              ? Math.round(
                  (metrics.onTimeDeliveries / metrics.deliveryCount) * 100
                )
              : 100,
          totalDeliveries: metrics.deliveryCount,
          avgOrderValue: metrics.avgOrderValue,
          lastOrderDate: metrics.lastOrderDate,
          lastDeliveryDate: metrics.lastDeliveryDate,
          rating: metrics.rating.toFixed(1),
          riskLevel:
            metrics.rating < 3 ? 'high' : metrics.rating < 4 ? 'medium' : 'low'
        };
      })
      .sort((a: any, b: any) => parseFloat(b.rating) - parseFloat(a.rating));

    return {
      suppliers: results,
      summary: {
        totalSuppliers: results.length,
        avgLeadTimeAcross: Math.round(
          results.reduce((sum: number, s: any) => sum + s.avgLeadTimeDays, 0) /
            Math.max(results.length, 1)
        ),
        highRiskSuppliers: results.filter((s) => s.riskLevel === 'high').length,
        topPerformers: results.slice(0, 3)
      }
    };
  }
});

/**
 * ABC Analysis Query
 * Classify products as A (high-value), B (medium-value), or C (low-value)
 */
export const performABCAnalysis = query({
  args: {},
  async handler(ctx) {
    const products = await ctx.db.query('products').collect();
    const transactions = await ctx.db
      .query('transactions')
      .order('desc')
      .take(2000);

    // Calculate revenue by product (last 180 days)
    const productRevenue: Record<string, number> = {};
    const productTrans: Record<string, number> = {};
    const now = new Date();
    const day180 = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    transactions
      .filter((tx: any) => new Date(tx.date) >= day180)
      .forEach((tx: any) => {
        if (tx.productId) {
          productRevenue[tx.productId] =
            (productRevenue[tx.productId] || 0) + (tx.amount || 0);
          productTrans[tx.productId] = (productTrans[tx.productId] || 0) + 1;
        }
      });

    // Create revenue ranking
    const productsByRevenue = products
      .map((p: any) => ({
        productId: p._id,
        productName: p.name,
        currentStock: p.stockLevel || 0,
        costPrice: p.costPrice || 0,
        sellingPrice: p.sellingPrice || 0,
        revenue180Day: productRevenue[p._id] || 0,
        transactionCount: productTrans[p._id] || 0,
        inventoryValue: (p.stockLevel || 0) * (p.costPrice || 0),
        margin:
          p.sellingPrice && p.costPrice
            ? Math.round(
                ((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100
              )
            : 0
      }))
      .filter((p) => p.revenue180Day > 0 || p.currentStock > 0)
      .sort((a, b) => b.revenue180Day - a.revenue180Day);

    const totalRevenue = productsByRevenue.reduce(
      (sum, p) => sum + p.revenue180Day,
      0
    );
    const totalInventoryValue = productsByRevenue.reduce(
      (sum, p) => sum + p.inventoryValue,
      0
    );

    // Calculate cumulative percentage to classify ABC
    let cumulativeRevenue = 0;
    const classified = productsByRevenue.map((p, idx) => {
      cumulativeRevenue += p.revenue180Day;
      const percentage = (cumulativeRevenue / totalRevenue) * 100;

      let classification = 'C'; // 20%+ = 60-100% revenue
      if (percentage <= 50)
        classification = 'A'; // First 50%
      else if (percentage <= 80) classification = 'B'; // 50-80%

      return {
        ...p,
        classification,
        revenuePercentage: Math.round((p.revenue180Day / totalRevenue) * 100),
        cumulativePercentage: Math.round(percentage)
      };
    });

    const classA = classified.filter((p) => p.classification === 'A');
    const classB = classified.filter((p) => p.classification === 'B');
    const classC = classified.filter((p) => p.classification === 'C');

    return {
      abcAnalysis: classified,
      summary: {
        totalProducts: classified.length,
        classA: {
          count: classA.length,
          revenue: Math.round(classA.reduce((s, p) => s + p.revenue180Day, 0)),
          inventoryValue: Math.round(
            classA.reduce((s, p) => s + p.inventoryValue, 0)
          )
        },
        classB: {
          count: classB.length,
          revenue: Math.round(classB.reduce((s, p) => s + p.revenue180Day, 0)),
          inventoryValue: Math.round(
            classB.reduce((s, p) => s + p.inventoryValue, 0)
          )
        },
        classC: {
          count: classC.length,
          revenue: Math.round(classC.reduce((s, p) => s + p.revenue180Day, 0)),
          inventoryValue: Math.round(
            classC.reduce((s, p) => s + p.inventoryValue, 0)
          )
        },
        totalRevenue: Math.round(totalRevenue),
        totalInventoryValue: Math.round(totalInventoryValue),
        recommendation:
          classA.length > 0
            ? `Focus on ${classA.length} class A products - 80% of revenue`
            : 'Analyze product mix'
      },
      insights: [
        `Class A (${classA.length} products): High-value products requiring tight inventory control`,
        `Class B (${classB.length} products): Medium-value products with moderate attention`,
        `Class C (${classC.length} products): Low-value products - consider consolidation or discontinuation`
      ]
    };
  }
});
