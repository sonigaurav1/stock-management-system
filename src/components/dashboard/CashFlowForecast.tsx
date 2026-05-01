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
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export function CashFlowForecast() {
  const cashFlow = useQuery(api.financialForecasting.forecastCashFlow, {
    months: 6
  });

  if (cashFlow === undefined) {
    return (
      <Card className='bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950'>
        <CardHeader>
          <CardTitle>Cash Flow Forecast</CardTitle>
          <CardDescription>6-month cash position projection</CardDescription>
        </CardHeader>
        <CardContent className='flex h-[400px] items-center justify-center'>
          <div className='py-8 text-center'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!cashFlow.summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Forecast</CardTitle>
        </CardHeader>
        <CardContent className='text-center text-muted-foreground'>
          No data available
        </CardContent>
      </Card>
    );
  }

  const riskColor =
    cashFlow.summary.riskLevel === 'critical'
      ? 'text-red-600'
      : cashFlow.summary.riskLevel === 'high'
        ? 'text-orange-600'
        : 'text-green-600';

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950'>
        <CardHeader>
          <CardTitle>Cash Flow Forecast</CardTitle>
          <CardDescription>
            Predict cash position for next 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Summary Stats */}
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Current Cash</p>
                <p className='text-2xl font-bold'>
                  ${(cashFlow.summary.currentCash / 1000).toFixed(1)}K
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>
                  Avg Monthly Flow
                </p>
                <p className='text-2xl font-bold'>
                  ${(cashFlow.summary.avgMonthlyNetFlow / 1000).toFixed(1)}K
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>
                  3-Month Projection
                </p>
                <p className='text-2xl font-bold'>
                  ${(cashFlow.summary.projectedCashIn3Months / 1000).toFixed(1)}
                  K
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Risk Level</p>
                <p className={`text-2xl font-bold ${riskColor}`}>
                  {cashFlow.summary.riskLevel.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Cash Position Chart */}
            <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
              <h3 className='mb-4 text-sm font-semibold'>
                Projected Cash Position
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={cashFlow.forecast}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='cumulativeCash'
                    stroke='#3b82f6'
                    name='Cumulative Cash'
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Breakdown */}
            <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
              <h3 className='mb-4 text-sm font-semibold'>
                Revenue vs Expenses
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={cashFlow.forecast}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey='revenue' fill='#10b981' name='Revenue' />
                  <Bar dataKey='expenses' fill='#ef4444' name='Expenses' />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Monthly Data */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>
                Monthly Forecast Details
              </h3>
              <div className='max-h-[400px] space-y-2 overflow-y-auto'>
                {cashFlow.forecast.map((month: any, idx: number) => (
                  <div
                    key={idx}
                    className='flex items-center justify-between rounded-lg bg-white p-3 text-sm dark:bg-slate-800'
                  >
                    <div>
                      <p className='font-medium'>{month.month}</p>
                      <p className='text-xs text-muted-foreground'>
                        Revenue: ${(month.revenue / 1000).toFixed(1)}K |
                        Expenses: ${(month.expenses / 1000).toFixed(1)}K
                      </p>
                    </div>
                    <div className='text-right'>
                      <p
                        className={`font-semibold ${month.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {month.netCashFlow >= 0 ? '+' : ''}$
                        {(month.netCashFlow / 1000).toFixed(1)}K
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Cash: ${(month.cumulativeCash / 1000).toFixed(1)}K
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Alert */}
            {cashFlow.summary.riskLevel !== 'low' && (
              <div className='flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900'>
                <AlertTriangle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-300' />
                <div>
                  <h4 className='text-sm font-semibold text-red-900 dark:text-red-100'>
                    {cashFlow.summary.riskLevel === 'critical'
                      ? 'Critical Cash Risk'
                      : 'Cash Position Warning'}
                  </h4>
                  <p className='mt-1 text-sm text-red-800 dark:text-red-200'>
                    Your projected cash position may become challenging.
                    Consider reducing expenses or accelerating receivables
                    collection.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
