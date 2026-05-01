import { useState } from 'react';
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

export function VarianceAnalysis() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const variance = useQuery(api.financialForecasting.analyzeVariance, {
    year,
    month
  });

  if (variance === undefined) {
    return (
      <Card className='bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950'>
        <CardHeader>
          <CardTitle>Variance Analysis</CardTitle>
          <CardDescription>Compare actual vs budget</CardDescription>
        </CardHeader>
        <CardContent className='flex h-[400px] items-center justify-center'>
          <div className='py-8 text-center'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = variance.byCategory.map((cat: any) => ({
    name: cat.category,
    budget: cat.budget,
    actual: cat.actual
  }));

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950'>
        <CardHeader>
          <CardTitle>Variance Analysis</CardTitle>
          <CardDescription>Compare actual spending vs budget</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Month/Year Selector */}
            <div className='flex gap-4'>
              <div>
                <label className='text-sm font-medium'>Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className='mt-1 rounded-lg border px-3 py-2 dark:bg-slate-800'
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleDateString('en-US', {
                        month: 'long'
                      })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='text-sm font-medium'>Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className='mt-1 rounded-lg border px-3 py-2 dark:bg-slate-800'
                >
                  {Array.from({ length: 3 }, (_, i) => (
                    <option key={year - 1 + i} value={year - 1 + i}>
                      {year - 1 + i}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary Stats */}
            <div className='grid grid-cols-3 gap-4'>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Total Budget</p>
                <p className='text-2xl font-bold'>
                  ${(variance.totalBudget / 1000).toFixed(1)}K
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Total Actual</p>
                <p className='text-2xl font-bold'>
                  ${(variance.totalActual / 1000).toFixed(1)}K
                </p>
              </div>
              <div
                className={`rounded-lg border-l-4 bg-white p-4 dark:bg-slate-800 ${
                  variance.totalVariance > 0
                    ? 'border-red-500'
                    : 'border-green-500'
                }`}
              >
                <p className='text-sm text-muted-foreground'>Total Variance</p>
                <p
                  className={`text-2xl font-bold ${variance.totalVariance > 0 ? 'text-red-600' : 'text-green-600'}`}
                >
                  {variance.totalVariance > 0 ? '+' : ''}$
                  {(variance.totalVariance / 1000).toFixed(1)}K
                </p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  {variance.totalVariancePercent > 0 ? '+' : ''}
                  {variance.totalVariancePercent}%
                </p>
              </div>
            </div>

            {/* Category Summary */}
            <div className='grid grid-cols-3 gap-4 rounded-lg bg-white p-4 dark:bg-slate-800'>
              <div className='text-center'>
                <p className='text-sm text-muted-foreground'>On Budget</p>
                <p className='text-2xl font-bold text-green-600'>
                  {variance.summary.onBudgetCategories}
                </p>
              </div>
              <div className='border-l border-r text-center'>
                <p className='text-sm text-muted-foreground'>Over Budget</p>
                <p className='text-2xl font-bold text-red-600'>
                  {variance.summary.overBudgetCategories}
                </p>
              </div>
              <div className='text-center'>
                <p className='text-sm text-muted-foreground'>Under Budget</p>
                <p className='text-2xl font-bold text-blue-600'>
                  {variance.summary.underBudgetCategories}
                </p>
              </div>
            </div>

            {/* Variance Chart */}
            <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
              <h3 className='mb-4 text-sm font-semibold'>
                Budget vs Actual by Category
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey='budget' fill='#3b82f6' name='Budget' />
                  <Bar dataKey='actual' fill='#10b981' name='Actual' />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Variance by Category */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>Variance by Category</h3>
              <div className='max-h-[500px] space-y-2 overflow-y-auto'>
                {variance.byCategory.map((cat: any) => (
                  <div
                    key={cat.category}
                    className={`rounded-lg border-l-4 bg-white p-3 dark:bg-slate-800 ${
                      cat.variancePercent > 20
                        ? 'border-red-500'
                        : cat.variancePercent < -20
                          ? 'border-blue-500'
                          : 'border-green-500'
                    }`}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>{cat.category}</p>
                        <p className='mt-1 text-xs text-muted-foreground'>
                          Budget: ${(cat.budget / 1000).toFixed(1)}K | Actual: $
                          {(cat.actual / 1000).toFixed(1)}K | Transactions:{' '}
                          {cat.transactionCount}
                        </p>
                        <p className='mt-2 text-xs'>{cat.explanation}</p>
                      </div>
                      <div className='ml-3 text-right'>
                        <div className='flex items-center gap-1'>
                          {cat.variancePercent > 0 && (
                            <TrendingUp className='h-4 w-4 text-red-600' />
                          )}
                          {cat.variancePercent < 0 && (
                            <TrendingDown className='h-4 w-4 text-blue-600' />
                          )}
                          <p
                            className={`font-semibold ${
                              cat.variancePercent > 0
                                ? 'text-red-600'
                                : cat.variancePercent < 0
                                  ? 'text-blue-600'
                                  : 'text-green-600'
                            }`}
                          >
                            {cat.variancePercent > 0 ? '+' : ''}
                            {cat.variancePercent}%
                          </p>
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          {cat.variancePercent > 0 ? '+' : ''}$
                          {(cat.variance / 1000).toFixed(1)}K
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900'>
              <div className='flex gap-2'>
                <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-300' />
                <div>
                  <h4 className='text-sm font-semibold text-blue-900 dark:text-blue-100'>
                    Variance Insights
                  </h4>
                  <p className='mt-1 text-sm text-blue-800 dark:text-blue-200'>
                    {variance.summary.overBudgetCategories > 0
                      ? `${variance.summary.overBudgetCategories} categories are over budget - review spending priorities`
                      : `All categories are within budget - good cost control`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
