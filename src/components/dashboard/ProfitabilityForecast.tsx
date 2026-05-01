import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export function ProfitabilityForecast() {
  const profitability = useQuery(
    api.financialForecasting.forecastProfitability,
    { quarters: 4 }
  );

  if (profitability === undefined) {
    return (
      <Card className='bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950'>
        <CardHeader>
          <CardTitle>Profitability Forecast</CardTitle>
          <CardDescription>
            Next year quarterly profit projection
          </CardDescription>
        </CardHeader>
        <CardContent className='flex h-[400px] items-center justify-center'>
          <div className='py-8 text-center'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!profitability.summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profitability Forecast</CardTitle>
        </CardHeader>
        <CardContent className='text-center text-muted-foreground'>
          No profitability data available
        </CardContent>
      </Card>
    );
  }

  const trendIcon = profitability.summary.profitTrend.includes('growth') ? (
    <TrendingUp className='h-5 w-5 text-green-600' />
  ) : (
    <TrendingDown className='h-5 w-5 text-red-600' />
  );

  const trendColor = profitability.summary.profitTrend.includes('growth')
    ? 'text-green-600'
    : 'text-red-600';

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950'>
        <CardHeader>
          <CardTitle>Profitability Forecast</CardTitle>
          <CardDescription>
            4-quarter profit projection and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Summary Stats */}
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Latest Quarter</p>
                <p className='text-2xl font-bold'>
                  $
                  {(profitability.summary.latestQuarterlyProfit / 1000).toFixed(
                    1
                  )}
                  K
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>
                  Avg Quarterly Profit
                </p>
                <p className='text-2xl font-bold'>
                  $
                  {(profitability.summary.avgQuarterlyProfit / 1000).toFixed(1)}
                  K
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>
                  Projected Annual
                </p>
                <p className='text-2xl font-bold'>
                  $
                  {(profitability.summary.projectedAnnualProfit / 1000).toFixed(
                    1
                  )}
                  K
                </p>
              </div>
              <div
                className={`rounded-lg border-l-4 bg-white p-4 dark:bg-slate-800 ${
                  profitability.summary.profitTrend.includes('growth')
                    ? 'border-green-500'
                    : 'border-red-500'
                }`}
              >
                <p className='text-sm text-muted-foreground'>Growth Rate</p>
                <p className={`text-2xl font-bold ${trendColor}`}>
                  {profitability.summary.profitGrowthRate > 0 ? '+' : ''}
                  {profitability.summary.profitGrowthRate}%
                </p>
              </div>
            </div>

            {/* Profit Trend Chart */}
            <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
              <h3 className='mb-4 text-sm font-semibold'>
                Quarterly Profit Projection
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={profitability.forecast}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='quarter' />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='projectedProfit'
                    stroke='#10b981'
                    name='Projected Profit'
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Quarterly Breakdown */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>Quarterly Details</h3>
              <div className='space-y-2'>
                {profitability.forecast.map((quarter: any, idx: number) => (
                  <div
                    key={idx}
                    className='flex items-center justify-between rounded-lg bg-white p-4 dark:bg-slate-800'
                  >
                    <div className='flex-1'>
                      <p className='font-medium'>{quarter.quarter}</p>
                      <div className='mt-1 flex items-center gap-2'>
                        {quarter.trend === 'growing' ? (
                          <TrendingUp className='h-4 w-4 text-green-600' />
                        ) : (
                          <TrendingDown className='h-4 w-4 text-red-600' />
                        )}
                        <p className='text-xs capitalize text-muted-foreground'>
                          {quarter.trend}
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-2xl font-bold text-green-600'>
                        ${(quarter.projectedProfit / 1000).toFixed(1)}K
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Margin: {quarter.profitMargin.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Assessment */}
            {profitability.forecast.some(
              (q: any) => q.riskFactors.length > 0
            ) && (
              <div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900'>
                <div className='flex gap-2'>
                  <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-300' />
                  <div>
                    <h4 className='text-sm font-semibold text-red-900 dark:text-red-100'>
                      Risk Factors
                    </h4>
                    <ul className='mt-1 space-y-1 text-sm text-red-800 dark:text-red-200'>
                      {profitability.forecast
                        .filter((q: any) => q.riskFactors.length > 0)
                        .map((q: any, idx: number) => (
                          <li key={idx}>
                            {q.quarter}: {q.riskFactors.join(', ')}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Profitability Driver Analysis */}
            <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
              <h3 className='mb-4 text-sm font-semibold'>
                Profitability Drivers
              </h3>
              <div className='space-y-3'>
                <div className='flex items-center justify-between border-b p-2'>
                  <p className='text-sm'>Profit Trend</p>
                  <div className='flex items-center gap-2'>
                    {trendIcon}
                    <p className='text-sm font-medium capitalize'>
                      {profitability.summary.profitTrend.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className='flex items-center justify-between border-b p-2'>
                  <p className='text-sm'>Growth Rate</p>
                  <p className={`font-semibold ${trendColor}`}>
                    {profitability.summary.profitGrowthRate > 0 ? '+' : ''}
                    {profitability.summary.profitGrowthRate}% per quarter
                  </p>
                </div>
                <div className='flex items-center justify-between p-2'>
                  <p className='text-sm'>Annual Projection</p>
                  <p className='font-semibold'>
                    $
                    {(
                      profitability.summary.projectedAnnualProfit / 1000
                    ).toFixed(1)}
                    K
                  </p>
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900'>
              <h4 className='mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100'>
                Recommendations
              </h4>
              <ul className='space-y-1 text-sm text-blue-800 dark:text-blue-200'>
                {profitability.summary.profitTrend.includes('growth') ? (
                  <>
                    <li>
                      • Profitability is growing - maintain current strategies
                    </li>
                    <li>
                      • Consider reinvesting profits into growth initiatives
                    </li>
                    <li>
                      • Monitor for market changes that could impact trend
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      • Profitability is declining - review cost structure
                    </li>
                    <li>• Identify underperforming products or services</li>
                    <li>
                      • Consider pricing adjustments or efficiency improvements
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
