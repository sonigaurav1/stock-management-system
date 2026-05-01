'use client';

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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ExpenseTrendWidgetProps {
  data?: any;
}

export function ExpenseTrendWidget({ data }: ExpenseTrendWidgetProps) {
  // Mock 30-day trend data
  const trendData = [
    { date: 'Day 1', expenses: 450, budget: 800, avg: 500 },
    { date: 'Day 4', expenses: 320, budget: 800, avg: 500 },
    { date: 'Day 7', expenses: 680, budget: 800, avg: 500 },
    { date: 'Day 10', expenses: 520, budget: 800, avg: 500 },
    { date: 'Day 13', expenses: 750, budget: 800, avg: 500 },
    { date: 'Day 16', expenses: 410, budget: 800, avg: 500 },
    { date: 'Day 19', expenses: 890, budget: 800, avg: 500 },
    { date: 'Day 22', expenses: 620, budget: 800, avg: 500 },
    { date: 'Day 25', expenses: 530, budget: 800, avg: 500 },
    { date: 'Day 28', expenses: 480, budget: 800, avg: 500 }
  ];

  // Calculate statistics
  const totalExpenses = trendData.reduce((sum, d) => sum + d.expenses, 0);
  const avgDailyExpense = totalExpenses / trendData.length;
  const maxExpense = Math.max(...trendData.map((d) => d.expenses));
  const minExpense = Math.min(...trendData.map((d) => d.expenses));

  // Calculate trend
  const firstHalfAvg =
    trendData
      .slice(0, Math.ceil(trendData.length / 2))
      .reduce((sum, d) => sum + d.expenses, 0) /
    Math.ceil(trendData.length / 2);
  const secondHalfAvg =
    trendData
      .slice(Math.ceil(trendData.length / 2))
      .reduce((sum, d) => sum + d.expenses, 0) /
    Math.floor(trendData.length / 2);
  const trend = secondHalfAvg - firstHalfAvg;
  const trendPercent = ((trend / firstHalfAvg) * 100).toFixed(1);

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div>
            <CardTitle className='text-base'>Expense Trend</CardTitle>
            <CardDescription className='text-xs'>
              Last 30 days spending pattern
            </CardDescription>
          </div>
          <div className='flex items-center gap-1'>
            {trend > 0 ? (
              <>
                <TrendingUp className='h-4 w-4 text-red-500' />
                <span className='text-xs font-bold text-red-600'>
                  +{trendPercent}%
                </span>
              </>
            ) : (
              <>
                <TrendingDown className='h-4 w-4 text-green-500' />
                <span className='text-xs font-bold text-green-600'>
                  {trendPercent}%
                </span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Chart */}
        <ResponsiveContainer width='100%' height={240}>
          <LineChart
            data={trendData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id='colorExpenses' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#ef4444' stopOpacity={0.2} />
                <stop offset='95%' stopColor='#ef4444' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
            <XAxis
              dataKey='date'
              stroke='#9ca3af'
              style={{ fontSize: '11px' }}
            />
            <YAxis stroke='#9ca3af' style={{ fontSize: '11px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: any) => formatCurrency(value as number)}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type='monotone'
              dataKey='expenses'
              stroke='#ef4444'
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 4 }}
              name='Daily Expenses'
            />
            <Line
              type='stepAfter'
              dataKey='avg'
              stroke='#6b7280'
              strokeDasharray='5 5'
              strokeWidth={2}
              dot={false}
              name='30-Day Average'
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Stats Grid */}
        <div className='grid grid-cols-2 gap-2'>
          <div className='rounded border bg-gray-50 p-2'>
            <p className='text-xs text-gray-600'>Daily Average</p>
            <p className='text-sm font-bold'>
              {formatCurrency(avgDailyExpense)}
            </p>
          </div>
          <div className='rounded border bg-gray-50 p-2'>
            <p className='text-xs text-gray-600'>Total (30 days)</p>
            <p className='text-sm font-bold'>{formatCurrency(totalExpenses)}</p>
          </div>
          <div className='rounded border bg-gray-50 p-2'>
            <p className='text-xs text-gray-600'>Highest Day</p>
            <p className='text-sm font-bold'>{formatCurrency(maxExpense)}</p>
          </div>
          <div className='rounded border bg-gray-50 p-2'>
            <p className='text-xs text-gray-600'>Lowest Day</p>
            <p className='text-sm font-bold'>{formatCurrency(minExpense)}</p>
          </div>
        </div>

        {/* Insight */}
        <div
          className={`rounded border p-2 text-xs ${
            trend > 0
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-green-200 bg-green-50 text-green-700'
          }`}
        >
          {trend > 0
            ? `Spending is increasing. Your daily average went from ${formatCurrency(firstHalfAvg)} to ${formatCurrency(secondHalfAvg)}.`
            : `Great! Spending is decreasing. Your daily average went from ${formatCurrency(firstHalfAvg)} to ${formatCurrency(secondHalfAvg)}.`}
        </div>
      </CardContent>
    </Card>
  );
}
