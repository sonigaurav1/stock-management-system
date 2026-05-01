'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  calculateProfitAndLoss,
  calculateMonthlyCashFlow,
  calculateProfitabilityMetrics,
  getQuarterlyPerformance,
  exportFinancialToCSV,
  formatCurrency,
  type SalesTransaction,
  type ProductData
} from '../utils/financialReportUtils';

/**
 * FinancialReport Component
 *
 * Provides comprehensive financial analytics including:
 * - Profit & Loss statement
 * - Cash flow analysis
 * - Profitability metrics
 * - Quarterly performance
 * - Key financial indicators
 *
 * Features:
 * - Real-time financial calculations
 * - Revenue and expense tracking
 * - Margin analysis
 * - Cash flow trends
 * - Export capabilities
 */
const FinancialReport = () => {
  const [isExporting, setIsExporting] = useState(false);

  // Fetch data
  const salesData = useQuery(api.sales.getRecentSales, { days: 365 });
  const productsData = useQuery(api.products.getAllProducts);

  // Process data
  const { pnl, cashFlow, metrics, quarterlyPerformance } = useMemo(() => {
    if (!salesData || !productsData) {
      return {
        pnl: null,
        cashFlow: [],
        metrics: null,
        quarterlyPerformance: []
      };
    }

    const pnlData = calculateProfitAndLoss(
      salesData as unknown as SalesTransaction[],
      productsData as unknown as ProductData[]
    );

    const totalInventoryValue = (
      productsData as unknown as ProductData[]
    ).reduce((sum, p) => {
      const price = parseFloat(p.purchasePrice || '0');
      return sum + (p.stockLevel || 0) * price;
    }, 0);

    const metricsData = calculateProfitabilityMetrics(
      pnlData,
      salesData.length,
      totalInventoryValue
    );

    return {
      pnl: pnlData,
      cashFlow: calculateMonthlyCashFlow(
        salesData as unknown as SalesTransaction[]
      ),
      metrics: metricsData,
      quarterlyPerformance: getQuarterlyPerformance(
        salesData as unknown as SalesTransaction[]
      )
    };
  }, [salesData, productsData]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      if (!pnl || !metrics) return;
      exportFinancialToCSV(
        pnl,
        metrics,
        `financial-report-${new Date().toISOString().split('T')[0]}.csv`
      );
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const isLoading = salesData === undefined || productsData === undefined;

  return (
    <div className='space-y-6'>
      {/* Filter and Export Section */}
      <div className='flex justify-end'>
        <Button
          variant='outline'
          size='sm'
          onClick={handleExport}
          disabled={isExporting || isLoading}
        >
          {isExporting ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Download className='mr-2 h-4 w-4' />
          )}
          Export Report
        </Button>
      </div>

      <Tabs defaultValue='overview' className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview' className='gap-2'>
            <BarChart3 className='h-4 w-4' />
            Overview
          </TabsTrigger>
          <TabsTrigger value='pnl' className='gap-2'>
            <DollarSign className='h-4 w-4' />
            P&L
          </TabsTrigger>
          <TabsTrigger value='cashflow' className='gap-2'>
            <TrendingUp className='h-4 w-4' />
            Cash Flow
          </TabsTrigger>
          <TabsTrigger value='quarterly' className='gap-2'>
            <BarChart3 className='h-4 w-4' />
            Quarterly
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-4'>
          {/* Key Metrics */}
          {isLoading ? (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className='pb-3'>
                    <div className='h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700' />
                  </CardHeader>
                  <CardContent>
                    <div className='h-8 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700' />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium'>
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold'>
                    {formatCurrency(pnl?.totalRevenue || 0)}
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>Annual</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium'>
                    Net Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-2xl font-bold ${(pnl?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {formatCurrency(pnl?.netProfit || 0)}
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    {pnl?.netMarginPercent}% margin
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium'>
                    Gross Margin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold'>
                    {pnl?.grossMarginPercent.toFixed(1)}%
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    {formatCurrency(pnl?.grossProfit || 0)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium'>COGS</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-2xl font-bold'>
                    {formatCurrency(pnl?.costOfGoodsSold || 0)}
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    {metrics?.costOfSalesPercent.toFixed(1)}% of revenue
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Revenue vs Profit Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Performance Trend</CardTitle>
              <CardDescription>
                Quarterly revenue and profit comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='h-64 animate-pulse rounded-lg bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800' />
              ) : quarterlyPerformance.length > 0 ? (
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={quarterlyPerformance}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='quarter'
                      style={{ fontSize: '12px' }}
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis
                      style={{ fontSize: '12px' }}
                      tick={{ fill: 'currentColor' }}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey='revenue' fill='#3b82f6' name='Revenue' />
                    <Bar dataKey='profit' fill='#10b981' name='Profit' />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className='flex h-64 items-center justify-center rounded-lg border border-dashed bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
                  <p className='text-sm text-muted-foreground'>
                    No data available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key Metrics Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Key Profitability Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className='animate-pulse rounded bg-slate-100 p-4 dark:bg-slate-800'
                    >
                      <div className='mb-2 h-4 w-32 rounded bg-slate-200 dark:bg-slate-700' />
                      <div className='h-6 w-20 rounded bg-slate-200 dark:bg-slate-700' />
                    </div>
                  ))}
                </div>
              ) : (
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Net Margin</p>
                    <p className='text-2xl font-bold'>
                      {metrics?.netMargin.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Asset Turnover
                    </p>
                    <p className='text-2xl font-bold'>
                      {metrics?.assetTurnover.toFixed(2)}x
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Avg Transaction
                    </p>
                    <p className='text-2xl font-bold'>
                      {formatCurrency(metrics?.averageTransactionValue || 0)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* P&L Tab */}
        <TabsContent value='pnl' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
              <CardDescription>Annual financial overview</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='space-y-4'>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className='flex animate-pulse justify-between rounded bg-slate-100 p-3 dark:bg-slate-800'
                    >
                      <div className='h-4 w-40 rounded bg-slate-200 dark:bg-slate-700' />
                      <div className='h-4 w-24 rounded bg-slate-200 dark:bg-slate-700' />
                    </div>
                  ))}
                </div>
              ) : (
                <div className='space-y-4'>
                  {/* Revenue Section */}
                  <div>
                    <div className='mb-2 flex justify-between'>
                      <p className='font-semibold'>Total Revenue</p>
                      <p className='font-semibold'>
                        {formatCurrency(pnl?.totalRevenue || 0)}
                      </p>
                    </div>

                    {/* COGS Section */}
                    <div className='mb-4 ml-4 space-y-2 border-b pb-4'>
                      <div className='flex justify-between text-sm text-muted-foreground'>
                        <p>Cost of Goods Sold</p>
                        <p>({metrics?.costOfSalesPercent.toFixed(1)}%)</p>
                      </div>
                      <div className='flex justify-between'>
                        <p className='text-sm'>
                          ({formatCurrency(pnl?.costOfGoodsSold || 0)})
                        </p>
                      </div>
                    </div>

                    {/* Gross Profit */}
                    <div className='mb-4 flex justify-between rounded bg-green-50 p-2 dark:bg-green-950'>
                      <p className='font-semibold'>Gross Profit</p>
                      <p className='font-semibold'>
                        {formatCurrency(pnl?.grossProfit || 0)}
                      </p>
                    </div>

                    {/* Operating Expenses */}
                    <div className='mb-4 ml-4 space-y-2 border-b pb-4'>
                      <div className='flex justify-between text-sm'>
                        <p>Operating Expenses</p>
                        <p>{formatCurrency(pnl?.operatingExpenses || 0)}</p>
                      </div>
                    </div>

                    {/* Operating Profit */}
                    <div className='mb-4 flex justify-between rounded bg-blue-50 p-2 dark:bg-blue-950'>
                      <p className='font-semibold'>Operating Profit</p>
                      <p className='font-semibold'>
                        {formatCurrency(pnl?.operatingProfit || 0)}
                      </p>
                    </div>

                    {/* Net Profit */}
                    <div className='flex justify-between rounded-lg bg-gradient-to-r from-green-50 to-green-100 p-3 dark:from-green-950 dark:to-green-900'>
                      <p className='font-bold'>Net Profit (After Tax)</p>
                      <p
                        className={`font-bold ${(pnl?.netProfit || 0) >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
                      >
                        {formatCurrency(pnl?.netProfit || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Margin Summary */}
                  <div className='mt-6 grid grid-cols-3 gap-4 rounded bg-slate-50 p-4 dark:bg-slate-900'>
                    <div>
                      <p className='text-xs text-muted-foreground'>
                        Gross Margin
                      </p>
                      <p className='text-lg font-bold text-green-600'>
                        {pnl?.grossMarginPercent}%
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>
                        Operating Margin
                      </p>
                      <p className='text-lg font-bold text-blue-600'>
                        {pnl?.operatingMarginPercent}%
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>
                        Net Margin
                      </p>
                      <p
                        className={`text-lg font-bold ${(pnl?.netMarginPercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {pnl?.netMarginPercent}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow Tab */}
        <TabsContent value='cashflow' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Analysis</CardTitle>
              <CardDescription>
                Monthly inflows, outflows, and net cash position
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='h-64 animate-pulse rounded-lg bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800' />
              ) : cashFlow.length > 0 ? (
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={cashFlow}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='period'
                      style={{ fontSize: '12px' }}
                      tick={{ fill: 'currentColor' }}
                    />
                    <YAxis
                      style={{ fontSize: '12px' }}
                      tick={{ fill: 'currentColor' }}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='inflows'
                      stroke='#10b981'
                      strokeWidth={2}
                      name='Inflows'
                    />
                    <Line
                      type='monotone'
                      dataKey='outflows'
                      stroke='#ef4444'
                      strokeWidth={2}
                      name='Outflows'
                    />
                    <Line
                      type='monotone'
                      dataKey='netCashFlow'
                      stroke='#3b82f6'
                      strokeWidth={2}
                      name='Net Cash Flow'
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className='flex h-64 items-center justify-center rounded-lg border border-dashed bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
                  <p className='text-sm text-muted-foreground'>
                    No cash flow data
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Details */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Cash Flow Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='space-y-3'>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className='flex animate-pulse items-center justify-between rounded bg-slate-100 p-3 dark:bg-slate-800'
                    >
                      <div className='h-4 w-20 rounded bg-slate-200 dark:bg-slate-700' />
                      <div className='flex gap-4'>
                        {[1, 2, 3].map((j) => (
                          <div
                            key={j}
                            className='h-4 w-24 rounded bg-slate-200 dark:bg-slate-700'
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : cashFlow.length > 0 ? (
                <div className='space-y-3'>
                  {cashFlow.map((month, idx) => (
                    <div
                      key={idx}
                      className='flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-900'
                    >
                      <p className='font-medium'>{month.period}</p>
                      <div className='flex gap-6 text-sm'>
                        <div>
                          <p className='text-muted-foreground'>Inflows</p>
                          <p className='font-semibold text-green-600'>
                            {formatCurrency(month.inflows)}
                          </p>
                        </div>
                        <div>
                          <p className='text-muted-foreground'>Outflows</p>
                          <p className='font-semibold text-red-600'>
                            {formatCurrency(month.outflows)}
                          </p>
                        </div>
                        <div>
                          <p className='text-muted-foreground'>Net</p>
                          <p
                            className={`font-semibold ${
                              month.netCashFlow >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {month.netCashFlow >= 0 ? (
                              <ArrowUpRight className='mr-1 inline h-4 w-4' />
                            ) : (
                              <ArrowDownRight className='mr-1 inline h-4 w-4' />
                            )}
                            {formatCurrency(month.netCashFlow)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='py-8 text-center text-sm text-muted-foreground'>
                  No cash flow data
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quarterly Tab */}
        <TabsContent value='quarterly' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Quarterly Performance</CardTitle>
              <CardDescription>
                Quarterly revenue, profit, and margin trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='space-y-4'>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className='flex animate-pulse items-center justify-between rounded bg-slate-100 p-3 dark:bg-slate-800'
                    >
                      <div className='h-4 w-20 rounded bg-slate-200 dark:bg-slate-700' />
                      <div className='flex gap-4'>
                        {[1, 2, 3].map((j) => (
                          <div
                            key={j}
                            className='h-4 w-24 rounded bg-slate-200 dark:bg-slate-700'
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : quarterlyPerformance.length > 0 ? (
                <div className='space-y-4'>
                  {quarterlyPerformance.map((quarter, idx) => (
                    <div
                      key={idx}
                      className='flex items-center justify-between rounded-lg border bg-gradient-to-r from-slate-50 to-slate-100 p-4 dark:from-slate-900 dark:to-slate-800'
                    >
                      <div>
                        <p className='font-semibold'>{quarter.quarter}</p>
                      </div>
                      <div className='flex gap-8 text-sm'>
                        <div>
                          <p className='text-muted-foreground'>Revenue</p>
                          <p className='font-bold text-blue-600'>
                            {formatCurrency(quarter.revenue)}
                          </p>
                        </div>
                        <div>
                          <p className='text-muted-foreground'>Profit</p>
                          <p className='font-bold text-green-600'>
                            {formatCurrency(quarter.profit)}
                          </p>
                        </div>
                        <div>
                          <p className='text-muted-foreground'>Margin</p>
                          <p className='font-bold'>
                            {quarter.margin.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='py-8 text-center text-sm text-muted-foreground'>
                  No quarterly data
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Financial Tips */}
      <Card className='border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950'>
        <CardHeader>
          <CardTitle className='text-base'>
            💡 Financial Management Tips
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm text-muted-foreground'>
          <ul className='list-inside list-disc space-y-1'>
            <li>
              Monitor net margin monthly to ensure profitability trajectory
            </li>
            <li>
              Maintain healthy cash flow - it's essential for business survival
            </li>
            <li>
              Track COGS closely and negotiate better supplier rates when
              possible
            </li>
            <li>
              Analyze quarterly trends to identify seasonal patterns and plan
              accordingly
            </li>
            <li>
              Compare with industry benchmarks to assess competitive performance
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReport;
