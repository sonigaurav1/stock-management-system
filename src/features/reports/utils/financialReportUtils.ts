export interface SalesTransaction {
  _id: string;
  productId?: string;
  userId: string;
  quantitySold: number;
  sellingPrice: number;
  totalAmount: number;
  customerName: string;
  paymentStatus?: string;
  soldAt: number;
  isDeleted: boolean;
}

export interface ProductData {
  _id: string;
  name: string;
  purchasePrice?: string;
  sellingPrice?: number;
  stockLevel?: number;
  createdAt: number;
}

export interface ProfitAndLoss {
  totalRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossMarginPercent: number;
  operatingExpenses: number;
  operatingProfit: number;
  operatingMarginPercent: number;
  netProfit: number;
  netMarginPercent: number;
  period: string;
}

export interface CashFlow {
  period: string;
  inflows: number;
  outflows: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
}

export interface ProfitabilityMetrics {
  grossMargin: number;
  netMargin: number;
  operatingMargin: number;
  returnOnSales: number;
  assetTurnover: number;
  profitPerTransaction: number;
  averageTransactionValue: number;
  costOfSalesPercent: number;
}

/**
 * Calculate P&L Statement
 */
export const calculateProfitAndLoss = (
  sales: SalesTransaction[],
  products: ProductData[]
): ProfitAndLoss => {
  // Calculate total revenue
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  // Calculate COGS
  const productMap = new Map<string, ProductData>();
  products.forEach((p) => productMap.set(p._id, p));

  const totalCogs = sales.reduce((sum, sale) => {
    if (sale.productId) {
      const product = productMap.get(sale.productId);
      if (product && product.purchasePrice) {
        const cost = parseFloat(product.purchasePrice) * sale.quantitySold;
        return sum + cost;
      }
    }
    // If no cost info, estimate 60% of selling price
    return sum + sale.totalAmount * 0.4; // 40% gross margin estimate
  }, 0);

  const grossProfit = totalRevenue - totalCogs;
  const grossMarginPercent =
    totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // Estimate operating expenses (typically 15-25% of revenue)
  const operatingExpenses = totalRevenue * 0.18;

  const operatingProfit = grossProfit - operatingExpenses;
  const operatingMarginPercent =
    totalRevenue > 0 ? (operatingProfit / totalRevenue) * 100 : 0;

  // Estimate taxes (assume 18% GST on profit)
  const taxes = operatingProfit > 0 ? operatingProfit * 0.18 : 0;
  const netProfit = operatingProfit - taxes;
  const netMarginPercent =
    totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    costOfGoodsSold: totalCogs,
    grossProfit,
    grossMarginPercent: Math.round(grossMarginPercent * 100) / 100,
    operatingExpenses,
    operatingProfit,
    operatingMarginPercent: Math.round(operatingMarginPercent * 100) / 100,
    netProfit,
    netMarginPercent: Math.round(netMarginPercent * 100) / 100,
    period: 'Current Period'
  };
};

/**
 * Calculate Cash Flow by month
 */
export const calculateMonthlyCashFlow = (
  sales: SalesTransaction[]
): CashFlow[] => {
  const monthlyData = new Map<string, { inflows: number; outflows: number }>();
  const now = Date.now();

  sales.forEach((sale) => {
    const date = new Date(sale.soldAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { inflows: 0, outflows: 0 });
    }

    const current = monthlyData.get(monthKey)!;

    // Only count paid or partially paid as inflows
    if (
      sale.paymentStatus === 'paid' ||
      sale.paymentStatus === 'partially_paid'
    ) {
      current.inflows += sale.totalAmount;
    }

    // Estimate 40% as COGS outflow
    current.outflows += sale.totalAmount * 0.4;
  });

  const lastSixMonths = Array.from(monthlyData.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6);

  let cumulativeCashFlow = 0;
  return lastSixMonths.map(([month, data]) => {
    const netCashFlow = data.inflows - data.outflows;
    cumulativeCashFlow += netCashFlow;

    return {
      period: month,
      inflows: data.inflows,
      outflows: data.outflows,
      netCashFlow,
      cumulativeCashFlow
    };
  });
};

/**
 * Calculate key profitability metrics
 */
export const calculateProfitabilityMetrics = (
  pnl: ProfitAndLoss,
  salesCount: number,
  totalInventoryValue: number
): ProfitabilityMetrics => {
  return {
    grossMargin: pnl.grossMarginPercent,
    netMargin: pnl.netMarginPercent,
    operatingMargin: pnl.operatingMarginPercent,
    returnOnSales: pnl.netMarginPercent,
    assetTurnover:
      totalInventoryValue > 0 ? pnl.totalRevenue / totalInventoryValue : 0,
    profitPerTransaction: salesCount > 0 ? pnl.netProfit / salesCount : 0,
    averageTransactionValue: salesCount > 0 ? pnl.totalRevenue / salesCount : 0,
    costOfSalesPercent:
      pnl.totalRevenue > 0 ? (pnl.costOfGoodsSold / pnl.totalRevenue) * 100 : 0
  };
};

/**
 * Get quarterly performance
 */
export const getQuarterlyPerformance = (
  sales: SalesTransaction[]
): Array<{
  quarter: string;
  revenue: number;
  profit: number;
  margin: number;
}> => {
  const quarterlyData = new Map<
    string,
    { revenue: number; cost: number; count: number }
  >();

  sales.forEach((sale) => {
    const date = new Date(sale.soldAt);
    const quarter = `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;

    if (!quarterlyData.has(quarter)) {
      quarterlyData.set(quarter, { revenue: 0, cost: 0, count: 0 });
    }

    const current = quarterlyData.get(quarter)!;
    current.revenue += sale.totalAmount;
    current.cost += sale.totalAmount * 0.4;
    current.count += 1;
  });

  return Array.from(quarterlyData.entries())
    .map(([quarter, data]) => ({
      quarter,
      revenue: data.revenue,
      profit: data.revenue - data.cost,
      margin:
        data.revenue > 0 ? ((data.revenue - data.cost) / data.revenue) * 100 : 0
    }))
    .sort((a, b) => a.quarter.localeCompare(b.quarter))
    .slice(-4); // Last 4 quarters
};

/**
 * Export financial data to CSV
 */
export const exportFinancialToCSV = (
  pnl: ProfitAndLoss,
  metrics: ProfitabilityMetrics,
  filename: string = 'financial-report.csv'
) => {
  const content = `
Financial Report - ${new Date().toLocaleDateString()}

PROFIT & LOSS STATEMENT
Total Revenue,${pnl.totalRevenue.toFixed(2)}
Cost of Goods Sold,${pnl.costOfGoodsSold.toFixed(2)}
Gross Profit,${pnl.grossProfit.toFixed(2)}
Gross Margin %,${pnl.grossMarginPercent}%

Operating Expenses,${pnl.operatingExpenses.toFixed(2)}
Operating Profit,${pnl.operatingProfit.toFixed(2)}
Operating Margin %,${pnl.operatingMarginPercent}%

Net Profit,${pnl.netProfit.toFixed(2)}
Net Margin %,${pnl.netMarginPercent}%

KEY METRICS
Gross Margin,${metrics.grossMargin.toFixed(2)}%
Net Margin,${metrics.netMargin.toFixed(2)}%
Operating Margin,${metrics.operatingMargin.toFixed(2)}%
Return on Sales,${metrics.returnOnSales.toFixed(2)}%
Asset Turnover,${metrics.assetTurnover.toFixed(2)}x
Average Transaction Value,${metrics.averageTransactionValue.toFixed(2)}
Profit Per Transaction,${metrics.profitPerTransaction.toFixed(2)}
Cost of Sales %,${metrics.costOfSalesPercent.toFixed(2)}%
  `.trim();

  const blob = new Blob([content], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
