import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, AlertCircle, Info } from 'lucide-react';
import { HelpTooltip } from './HelpTooltip';

type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * ProfitAndLossReport Component
 * Displays comprehensive profit and loss analysis for business owners
 * Shows revenue, costs, margins, and trends in plain English
 */
export const ProfitAndLossReport = () => {
  const [period, setPeriod] = useState<ReportPeriod>('monthly');

  // Fetch P&L data
  const plReport = useQuery(api.profitAndLoss.getProfitLossReport, { period });
  const productProfits = useQuery(api.profitAndLoss.getProductProfitability, {
    period,
    limit: 5
  });
  const categoryMargins = useQuery(api.profitAndLoss.getCategoryMargins, {
    period
  });
  const lowMarginProducts = useQuery(api.profitAndLoss.getLowMarginProducts, {
    minMarginPercentage: 15
  });
  const profitTrend = useQuery(api.profitAndLoss.getProfitTrend, { months: 3 });

  if (!plReport)
    return <div className='py-8 text-center'>Loading P&L data...</div>;

  const isPositive = plReport.profitMetrics.netProfit >= 0;

  return (
    <div className='space-y-6'>
      {/* Main P&L Summary */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Profit & Loss Summary</CardTitle>
              <CardDescription>
                Complete breakdown of revenue, costs, and profit
              </CardDescription>
            </div>
            <div className='flex gap-2'>
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`rounded px-3 py-1 text-sm ${
                    period === p
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-3'>
            {/* Revenue Box */}
            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
              <div className='mb-2 flex items-center justify-between'>
                <span className='font-semibold text-gray-700'>Revenue</span>
                <HelpTooltip
                  title='Revenue'
                  content='Total money your business received from selling products'
                />
              </div>
              <div className='text-3xl font-bold text-blue-600'>
                ₹
                {plReport.revenue.total.toLocaleString('en-IN', {
                  maximumFractionDigits: 2
                })}
              </div>
              <div className='mt-2 text-sm text-gray-600'>
                {plReport.revenue.transactionCount} transactions • Avg: ₹
                {plReport.revenue.averagePerTransaction.toLocaleString(
                  'en-IN',
                  {
                    maximumFractionDigits: 2
                  }
                )}
              </div>
            </div>

            {/* COGS Box */}
            <div className='rounded-lg border border-amber-200 bg-amber-50 p-4'>
              <div className='mb-2 flex items-center justify-between'>
                <span className='font-semibold text-gray-700'>
                  Cost of Goods
                </span>
                <HelpTooltip
                  title='Cost of Goods Sold (COGS)'
                  content='How much you spent buying the products you sold'
                />
              </div>
              <div className='text-3xl font-bold text-amber-600'>
                ₹
                {plReport.costs.cogs.toLocaleString('en-IN', {
                  maximumFractionDigits: 2
                })}
              </div>
              <div className='mt-2 text-sm text-gray-600'>
                {Math.round(
                  (plReport.costs.cogs / Math.max(plReport.revenue.total, 1)) *
                    100
                )}
                % of revenue
              </div>
            </div>

            {/* Profit Box */}
            <div
              className={`rounded-lg border-2 p-4 ${
                isPositive
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className='mb-2 flex items-center justify-between'>
                <span className='font-semibold text-gray-700'>
                  Gross Profit
                </span>
                <HelpTooltip
                  title='Gross Profit'
                  content='Revenue minus cost of goods sold - shows how much money is left before operating expenses'
                />
              </div>
              <div
                className={`text-3xl font-bold ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isPositive ? '+' : ''}₹
                {plReport.profitMetrics.netProfit.toLocaleString('en-IN', {
                  maximumFractionDigits: 2
                })}
              </div>
              <div
                className={`mt-2 text-sm font-semibold ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isPositive ? '↑' : '↓'}{' '}
                {Math.abs(plReport.profitMetrics.grossProfitMargin)}% margin
              </div>
            </div>
          </div>

          {/* Business Interpretation */}
          <div className='mb-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4'>
            <div className='flex gap-2'>
              <Info className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600' />
              <div>
                <p className='mb-1 font-semibold text-gray-900'>
                  What This Means for Your Business
                </p>
                <p className='text-gray-700'>
                  For every ₹100 in sales, you're making ₹
                  {Math.round(plReport.profitMetrics.grossProfitMargin)} gross
                  profit.
                  {plReport.profitMetrics.grossProfitMargin < 20 && (
                    <span className='mt-2 block font-semibold text-amber-700'>
                      💡 Your margins are below industry average (20-30%).
                      Consider raising prices or reducing costs.
                    </span>
                  )}
                  {plReport.profitMetrics.grossProfitMargin >= 30 && (
                    <span className='mt-2 block font-semibold text-green-700'>
                      ✓ Your margins are healthy and above average.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profitability Details */}
      <Tabs defaultValue='products' className='w-full'>
        <TabsList>
          <TabsTrigger value='products'>Product Profits</TabsTrigger>
          <TabsTrigger value='categories'>By Category</TabsTrigger>
          <TabsTrigger value='trends'>3-Month Trend</TabsTrigger>
          <TabsTrigger value='warning'>⚠️ Low Margin</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value='products'>
          <Card>
            <CardHeader>
              <CardTitle>Top Products by Profit</CardTitle>
              <CardDescription>
                Which products are making you the most money
              </CardDescription>
            </CardHeader>
            <CardContent>
              {productProfits && productProfits.length > 0 ? (
                <div className='space-y-3'>
                  {productProfits.map((product, idx) => (
                    <div
                      key={product.productId}
                      className='rounded-lg bg-gray-50 p-3 hover:bg-gray-100'
                    >
                      <div className='mb-2 flex items-center justify-between'>
                        <div>
                          <p className='font-semibold text-gray-900'>
                            {idx + 1}. {product.productName}
                          </p>
                          <p className='text-sm text-gray-600'>
                            {product.quantitySold} units sold
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='text-lg font-bold text-green-600'>
                            ₹
                            {product.profit.toLocaleString('en-IN', {
                              maximumFractionDigits: 2
                            })}
                          </p>
                          <p className='text-sm font-semibold text-green-600'>
                            {Math.round(product.margin)}% margin
                          </p>
                        </div>
                      </div>
                      <div className='h-2 w-full rounded-full bg-gray-200'>
                        <div
                          className='h-2 rounded-full bg-green-500'
                          style={{ width: `${Math.min(product.margin, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-gray-600'>No sales data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value='categories'>
          <Card>
            <CardHeader>
              <CardTitle>Profit Margin by Category</CardTitle>
              <CardDescription>
                Which product categories are most profitable
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoryMargins && categoryMargins.length > 0 ? (
                <div className='space-y-4'>
                  {categoryMargins.map((category) => (
                    <div key={category.categoryName}>
                      <div className='mb-2 flex items-center justify-between'>
                        <p className='font-semibold'>{category.categoryName}</p>
                        <p className='text-lg font-bold text-green-600'>
                          {Math.round(category.marginPercentage)}%
                        </p>
                      </div>
                      <div className='h-3 w-full rounded-full bg-gray-200'>
                        <div
                          className='h-3 rounded-full bg-green-500'
                          style={{
                            width: `${Math.min(category.marginPercentage, 100)}%`
                          }}
                        ></div>
                      </div>
                      <div className='mt-1 flex justify-between text-xs text-gray-600'>
                        <span>
                          Revenue: ₹{Math.round(category.totalRevenue)}
                        </span>
                        <span>Profit: ₹{Math.round(category.totalProfit)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-gray-600'>No category data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value='trends'>
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend (Last 3 Months)</CardTitle>
              <CardDescription>How your sales are trending</CardDescription>
            </CardHeader>
            <CardContent>
              {profitTrend && profitTrend.length > 0 ? (
                <div className='space-y-4'>
                  {profitTrend.map((month, idx) => (
                    <div key={idx}>
                      <div className='mb-2 flex items-center justify-between'>
                        <p className='font-semibold'>{month.month}</p>
                        <p className='text-lg font-bold text-blue-600'>
                          ₹
                          {month.revenue.toLocaleString('en-IN', {
                            maximumFractionDigits: 2
                          })}
                        </p>
                      </div>
                      <div className='h-3 w-full rounded-full bg-gray-200'>
                        <div
                          className='h-3 rounded-full bg-blue-500'
                          style={{
                            width: `${Math.min((month.revenue / 100000) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                      <p className='mt-1 text-xs text-gray-600'>
                        {month.transactionCount} transactions
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-gray-600'>No trend data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Low Margin Warning Tab */}
        <TabsContent value='warning'>
          <Card className='border-amber-200 bg-amber-50'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-amber-900'>
                <AlertCircle className='h-5 w-5' />
                Products Losing Money
              </CardTitle>
              <CardDescription>
                Products with margins below 15% need attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowMarginProducts && lowMarginProducts.length > 0 ? (
                <div className='space-y-3'>
                  {lowMarginProducts.map((product) => (
                    <div
                      key={product.productId}
                      className='rounded-lg border-l-4 border-amber-500 bg-white p-3'
                    >
                      <div className='mb-2 flex items-start justify-between'>
                        <div>
                          <p className='font-semibold text-gray-900'>
                            {product.productName}
                          </p>
                          <p className='text-sm text-gray-600'>
                            {product.unitsSold} units sold
                          </p>
                        </div>
                        <div className='text-right'>
                          <p
                            className={`text-lg font-bold ${
                              product.marginPercentage < 0
                                ? 'text-red-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {product.marginPercentage}% margin
                          </p>
                        </div>
                      </div>
                      <p className='mb-2 text-sm font-semibold text-amber-900'>
                        {product.recommendation}
                      </p>
                      <div className='flex gap-2 text-xs text-gray-600'>
                        <span>Selling: ₹{product.sellingPrice.toFixed(2)}</span>
                        <span>•</span>
                        <span>Cost: ₹{product.costPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='rounded-lg border border-green-200 bg-green-50 p-4'>
                  <p className='font-semibold text-green-800'>
                    ✓ All your products have healthy margins!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
