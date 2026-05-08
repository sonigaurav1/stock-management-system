import { v } from 'convex/values';
import { query } from './_generated/server';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

/**
 * Cash Flow Management Module
 * Provides comprehensive cash flow analysis for business owners
 */

/**
 * Get cash position summary - how much cash on hand vs outstanding receivables
 */
export const getCashPositionSummary = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_FINANCIAL_REPORTS);
    const userId = getDataScopeUserId(caller);

    // Get all payments received (cash on hand indicator)
    const paymentsReceived = await ctx.db
      .query('payments')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    const totalCashReceived = paymentsReceived.reduce(
      (sum, payment) => sum + payment.amountPaid,
      0
    );

    // Get all sales (total revenue)
    const sales = await ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    // Outstanding receivables = Total Revenue - Total Payments
    const outstandingReceivables = totalRevenue - totalCashReceived;

    // Get purchases to understand cash outflows
    const allStockMovements = await ctx.db
      .query('stockMovements')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    const stockMovements = allStockMovements.filter(
      (m) => m.type === 'purchase'
    );

    let totalPurchased = 0;
    for (const movement of stockMovements) {
      const product = await ctx.db.get(movement.productId as any);
      if (product && 'purchasePrice' in product) {
        const cost = parseFloat((product.purchasePrice as string) || '0');
        totalPurchased += cost * movement.quantity;
      }
    }

    // Estimated cash position (simplified)
    const estimatedCashPosition = totalCashReceived - totalPurchased;

    return {
      cashMetrics: {
        totalCashReceived: Math.round(totalCashReceived * 100) / 100,
        totalPurchased: Math.round(totalPurchased * 100) / 100,
        estimatedCashPosition: Math.round(estimatedCashPosition * 100) / 100
      },
      receivables: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        outstandingReceivables: Math.round(outstandingReceivables * 100) / 100,
        percentageOutstanding:
          totalRevenue > 0
            ? Math.round((outstandingReceivables / totalRevenue) * 100 * 100) /
              100
            : 0
      },
      health: getHealthStatus(estimatedCashPosition),
      summary:
        estimatedCashPosition > 0
          ? `Positive cash position: ₹${Math.round(estimatedCashPosition * 100) / 100}`
          : `Warning: Negative cash position: ₹${Math.round(Math.abs(estimatedCashPosition) * 100) / 100}`
    };
  }
});

/**
 * Get payment due alerts - when payments are due to suppliers
 */
export const getPaymentDueAlerts = query({
  args: {
    daysAhead: v.optional(v.number()) // Show payments due in next N days
  },
  handler: async (ctx, { daysAhead = 30 }) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_FINANCIAL_REPORTS);
    const userId = getDataScopeUserId(caller);

    const now = Date.now();
    const futureDate = now + daysAhead * 24 * 60 * 60 * 1000;

    // Get payments with due dates
    const allPayments = await ctx.db
      .query('payments')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    const payments = allPayments.filter(
      (p) =>
        'dueDate' in p &&
        p.dueDate &&
        (p.dueDate as number) > now &&
        (p.dueDate as number) <= futureDate &&
        p.paymentStatus !== 'paid'
    );

    const alerts = payments
      .map((payment) => {
        const dueDate = (payment.dueDate as number) || now;
        const daysUntilDue = Math.ceil((dueDate - now) / (24 * 60 * 60 * 1000));
        let priority = 'normal';
        if (daysUntilDue <= 3) priority = 'urgent';
        else if (daysUntilDue <= 7) priority = 'high';

        return {
          paymentId: payment._id,
          invoiceNumber: payment.invoiceNumber,
          amount: Math.round(payment.amountPaid * 100) / 100,
          dueDate: new Date(dueDate).toLocaleDateString(),
          daysUntilDue,
          priority,
          status: payment.paymentStatus || 'pending'
        };
      })
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    return {
      totalDue:
        Math.round(alerts.reduce((sum, a) => sum + a.amount, 0) * 100) / 100,
      alertCount: alerts.length,
      urgentCount: alerts.filter((a) => a.priority === 'urgent').length,
      alerts
    };
  }
});

/**
 * Get invoice aging analysis - which customers are slow to pay
 */
export const getInvoiceAging = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_FINANCIAL_REPORTS);
    const userId = getDataScopeUserId(caller);

    const now = Date.now();
    const sales = await ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    // Categorize by age
    const ageCategories = {
      current: { label: '0-30 days', amount: 0, count: 0 },
      thirtyPlus: { label: '31-60 days', amount: 0, count: 0 },
      sixtyPlus: { label: '61-90 days', amount: 0, count: 0 },
      ninetyPlus: { label: '90+ days', amount: 0, count: 0 }
    };

    const slowPayers: Record<
      string,
      {
        customerId: string;
        customerName: string;
        totalOutstanding: number;
        daysOverdue: number;
        invoiceCount: number;
      }
    > = {};

    for (const sale of sales) {
      // Assume payment status indicates if still outstanding
      if (sale.paymentStatus === 'paid') continue;

      const ageDays = Math.floor((now - sale.soldAt) / (24 * 60 * 60 * 1000));

      if (ageDays <= 30) {
        ageCategories.current.amount += sale.totalAmount;
        ageCategories.current.count += 1;
      } else if (ageDays <= 60) {
        ageCategories.thirtyPlus.amount += sale.totalAmount;
        ageCategories.thirtyPlus.count += 1;
      } else if (ageDays <= 90) {
        ageCategories.sixtyPlus.amount += sale.totalAmount;
        ageCategories.sixtyPlus.count += 1;
      } else {
        ageCategories.ninetyPlus.amount += sale.totalAmount;
        ageCategories.ninetyPlus.count += 1;
      }

      // Track slow payers
      if (!slowPayers[sale.customerId || 'unknown']) {
        slowPayers[sale.customerId || 'unknown'] = {
          customerId: sale.customerId || 'unknown',
          customerName: sale.customerName,
          totalOutstanding: 0,
          daysOverdue: 0,
          invoiceCount: 0
        };
      }

      slowPayers[sale.customerId || 'unknown'].totalOutstanding +=
        sale.totalAmount;
      slowPayers[sale.customerId || 'unknown'].daysOverdue = Math.max(
        slowPayers[sale.customerId || 'unknown'].daysOverdue,
        ageDays
      );
      slowPayers[sale.customerId || 'unknown'].invoiceCount += 1;
    }

    return {
      ageingBuckets: ageCategories,
      totalOutstanding:
        Math.round(
          (ageCategories.current.amount +
            ageCategories.thirtyPlus.amount +
            ageCategories.sixtyPlus.amount +
            ageCategories.ninetyPlus.amount) *
            100
        ) / 100,
      slowPayers: Object.values(slowPayers)
        .sort((a, b) => b.totalOutstanding - a.totalOutstanding)
        .slice(0, 10)
    };
  }
});

/**
 * Get receivables dashboard - total money owed by customers
 */
export const getReceivablesDashboard = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_FINANCIAL_REPORTS);
    const userId = getDataScopeUserId(caller);

    // Get all customers
    const customers = await ctx.db
      .query('customers')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    let totalReceivables = 0;
    const customerReceivables: Record<
      string,
      {
        customerId: string;
        customerName: string;
        totalAmount: number;
        paidAmount: number;
        outstanding: number;
        transactionCount: number;
      }
    > = {};

    // Get all sales
    const sales = await ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    for (const sale of sales) {
      const customerId = sale.customerId || 'walk_in';

      if (!customerReceivables[customerId]) {
        customerReceivables[customerId] = {
          customerId,
          customerName: sale.customerName,
          totalAmount: 0,
          paidAmount: 0,
          outstanding: 0,
          transactionCount: 0
        };
      }

      customerReceivables[customerId].totalAmount += sale.totalAmount;
      customerReceivables[customerId].transactionCount += 1;

      if (sale.paymentStatus === 'paid') {
        customerReceivables[customerId].paidAmount += sale.totalAmount;
      } else if (sale.paymentStatus === 'partially_paid') {
        // Estimate: assume 50% paid for partially paid
        customerReceivables[customerId].paidAmount += sale.totalAmount * 0.5;
      }
    }

    // Calculate outstanding for each customer
    for (const customer of Object.values(customerReceivables)) {
      customer.outstanding = customer.totalAmount - customer.paidAmount;
      totalReceivables += customer.outstanding;
    }

    return {
      summary: {
        totalCustomers: customers.length,
        customersWithOutstanding: Object.values(customerReceivables).filter(
          (c) => c.outstanding > 0
        ).length,
        totalReceivables: Math.round(totalReceivables * 100) / 100
      },
      topReceivables: Object.values(customerReceivables)
        .filter((c) => c.outstanding > 0)
        .sort((a, b) => b.outstanding - a.outstanding)
        .slice(0, 10),
      allCustomers: Object.values(customerReceivables).sort(
        (a, b) => b.totalAmount - a.totalAmount
      )
    };
  }
});

/**
 * Get payables dashboard - total money owed to suppliers
 */
export const getPayablesDashboard = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_FINANCIAL_REPORTS);
    const userId = getDataScopeUserId(caller);

    // Get all suppliers
    const suppliers = await ctx.db
      .query('suppliers')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    // Get all purchases/stock movements
    const allPurchases = await ctx.db
      .query('stockMovements')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    const purchases = allPurchases.filter((m) => m.type === 'purchase');

    let totalPayables = 0;
    const supplierPayables: Record<
      string,
      {
        supplierId: string;
        supplierName: string;
        totalPurchased: number;
        paidAmount: number;
        outstanding: number;
        purchaseCount: number;
      }
    > = {};

    for (const purchase of purchases) {
      const product = await ctx.db.get(purchase.productId as any);
      if (
        !product ||
        !('supplierId' in product) ||
        !('supplierName' in product) ||
        !('purchasePrice' in product)
      )
        continue;

      const supplierId = (product.supplierId as string) || 'unknown';
      const supplierName =
        (product.supplierName as string) || 'Unknown Supplier';
      const cost = parseFloat((product.purchasePrice as string) || '0');
      const purchaseAmount = cost * purchase.quantity;

      if (!supplierPayables[supplierId]) {
        supplierPayables[supplierId] = {
          supplierId,
          supplierName,
          totalPurchased: 0,
          paidAmount: 0,
          outstanding: 0,
          purchaseCount: 0
        };
      }

      supplierPayables[supplierId].totalPurchased += purchaseAmount;
      supplierPayables[supplierId].purchaseCount += 1;
      // Simplified: assume 70% of purchases are typically paid
      supplierPayables[supplierId].paidAmount += purchaseAmount * 0.7;
    }

    // Calculate outstanding for each supplier
    for (const supplier of Object.values(supplierPayables)) {
      supplier.outstanding = supplier.totalPurchased - supplier.paidAmount;
      totalPayables += supplier.outstanding;
    }

    return {
      summary: {
        totalSuppliers: suppliers.length,
        suppliersWithOutstanding: Object.values(supplierPayables).filter(
          (s) => s.outstanding > 0
        ).length,
        totalPayables: Math.round(totalPayables * 100) / 100
      },
      topPayables: Object.values(supplierPayables)
        .sort((a, b) => b.outstanding - a.outstanding)
        .slice(0, 10),
      allSuppliers: Object.values(supplierPayables).sort(
        (a, b) => b.totalPurchased - a.totalPurchased
      )
    };
  }
});

/**
 * Get cash flow forecast - predict cash position for next 3-6 months
 */
export const getCashFlowForecast = query({
  args: {
    months: v.optional(v.number())
  },
  handler: async (ctx, { months = 3 }) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_FINANCIAL_REPORTS);
    const userId = getDataScopeUserId(caller);

    // Get historical sales and payments for last 12 months
    const now = Date.now();
    const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

    const allHistoricalSales = await ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    const historicalSales = allHistoricalSales.filter(
      (s) => s.soldAt >= oneYearAgo
    );

    // Group by month and calculate average monthly revenue
    const monthlyRevenue: Record<number, number> = {};
    for (const sale of historicalSales) {
      const monthKey = Math.floor(sale.soldAt / (30 * 24 * 60 * 60 * 1000));
      monthlyRevenue[monthKey] =
        (monthlyRevenue[monthKey] || 0) + sale.totalAmount;
    }

    const averageMonthlyRevenue =
      Object.values(monthlyRevenue).reduce((a, b) => a + b, 0) /
      Math.max(Object.keys(monthlyRevenue).length, 1);

    // Project forward
    const forecast = [];
    const currentCash = 50000; // Placeholder - would be calculated from actual data

    for (let i = 1; i <= months; i++) {
      const projectedRevenue = averageMonthlyRevenue;
      const projectedExpenses = averageMonthlyRevenue * 0.6; // Assume 60% cost ratio
      const netCashFlow = projectedRevenue - projectedExpenses;

      forecast.push({
        month: i,
        monthLabel: new Date(now + i * 30 * 24 * 60 * 60 * 1000).toLocaleString(
          'default',
          {
            month: 'short',
            year: 'numeric'
          }
        ),
        projectedRevenue: Math.round(projectedRevenue * 100) / 100,
        projectedExpenses: Math.round(projectedExpenses * 100) / 100,
        netCashFlow: Math.round(netCashFlow * 100) / 100,
        projectedBalance:
          Math.round((currentCash + i * netCashFlow) * 100) / 100
      });
    }

    return {
      historicalAverageMonthlyRevenue:
        Math.round(averageMonthlyRevenue * 100) / 100,
      forecast,
      riskLevel: forecast.some((f) => f.projectedBalance < 0)
        ? 'high'
        : 'normal'
    };
  }
});

// Helper to determine cash health status
function getHealthStatus(
  cashPosition: number
): 'critical' | 'warning' | 'healthy' {
  if (cashPosition < 0) return 'critical';
  if (cashPosition < 10000) return 'warning';
  return 'healthy';
}
