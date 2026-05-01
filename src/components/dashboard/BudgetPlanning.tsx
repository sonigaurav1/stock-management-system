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
  Legend,
  Cell
} from 'recharts';
import { TrendingDown } from 'lucide-react';

export function BudgetPlanning() {
  const budget = useQuery(api.financialForecasting.generateBudget, {
    year: new Date().getFullYear()
  });

  if (budget === undefined) {
    return (
      <Card className='bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950'>
        <CardHeader>
          <CardTitle>Budget Planning</CardTitle>
          <CardDescription>Annual budget forecast</CardDescription>
        </CardHeader>
        <CardContent className='flex h-[400px] items-center justify-center'>
          <div className='py-8 text-center'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!budget.summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Planning</CardTitle>
        </CardHeader>
        <CardContent className='text-center text-muted-foreground'>
          No budget data available
        </CardContent>
      </Card>
    );
  }

  const colors = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316'
  ];

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950'>
        <CardHeader>
          <CardTitle>Budget Planning</CardTitle>
          <CardDescription>
            Auto-generated annual budget for {budget.year}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Summary Stats */}
            <div className='grid grid-cols-3 gap-4'>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>
                  Total Annual Budget
                </p>
                <p className='text-2xl font-bold'>
                  ${(budget.summary.totalAnnualBudget / 1000).toFixed(1)}K
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>
                  Avg Monthly Budget
                </p>
                <p className='text-2xl font-bold'>
                  ${(budget.summary.avgMonthlyBudget / 1000).toFixed(1)}K
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Categories</p>
                <p className='text-2xl font-bold'>
                  {budget.summary.categories}
                </p>
              </div>
            </div>

            {/* Monthly Budget Chart */}
            <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
              <h3 className='mb-4 text-sm font-semibold'>
                Monthly Budget Allocation
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={budget.monthlyBudget}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='monthName' />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey='budget' fill='#3b82f6' name='Budgeted Amount' />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>Budget by Category</h3>
              <div className='max-h-[400px] space-y-2 overflow-y-auto'>
                {budget.categoryBreakdown.map((cat: any, idx: number) => (
                  <div
                    key={cat.category}
                    className='flex items-center justify-between rounded-lg bg-white p-3 dark:bg-slate-800'
                  >
                    <div className='flex flex-1 items-center gap-3'>
                      <div
                        className='h-4 w-4 rounded-full'
                        style={{ backgroundColor: colors[idx % colors.length] }}
                      />
                      <div>
                        <p className='text-sm font-medium'>{cat.category}</p>
                        <p className='text-xs text-muted-foreground'>
                          Avg: ${(cat.avgMonthlyBudget / 1000).toFixed(1)}
                          K/month
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold'>
                        ${(cat.totalAnnualBudget / 1000).toFixed(1)}K
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {(
                          (cat.totalAnnualBudget /
                            budget.summary.totalAnnualBudget) *
                          100
                        ).toFixed(0)}
                        %
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly List */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>Monthly Breakdown</h3>
              <div className='grid max-h-[300px] grid-cols-2 gap-2 overflow-y-auto md:grid-cols-4'>
                {budget.monthlyBudget.map((m: any) => (
                  <div
                    key={m.month}
                    className='rounded-lg bg-white p-3 text-center dark:bg-slate-800'
                  >
                    <p className='text-sm font-medium'>{m.monthName}</p>
                    <p className='text-lg font-bold text-blue-600'>
                      ${(m.budget / 1000).toFixed(1)}K
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Tips */}
            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900'>
              <h4 className='mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100'>
                Budget Tips
              </h4>
              <ul className='space-y-1 text-sm text-blue-800 dark:text-blue-200'>
                <li>
                  • Budget includes seasonal adjustments (higher in holidays,
                  lower in summer)
                </li>
                <li>
                  • Base budgets calculated from 24 months of historical data
                </li>
                <li>• Track actual spending against these budgets monthly</li>
                <li>• Review and adjust quarterly based on business changes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
