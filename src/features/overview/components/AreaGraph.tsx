'use client';

import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface AreaGraphProps {
  data?: { month: string; revenue: number; expenses: number; profit: number }[];
}

export function AreaGraph({ data }: AreaGraphProps) {
  const chartData = data || [
    { month: 'Jan', revenue: 400000, expenses: 240000, profit: 160000 },
    { month: 'Feb', revenue: 450000, expenses: 260000, profit: 190000 },
    { month: 'Mar', revenue: 520000, expenses: 280000, profit: 240000 },
    { month: 'Apr', revenue: 580000, expenses: 300000, profit: 280000 },
    { month: 'May', revenue: 650000, expenses: 320000, profit: 330000 },
    { month: 'Jun', revenue: 720000, expenses: 350000, profit: 370000 }
  ];

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = chartData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = chartData.reduce((sum, item) => sum + item.profit, 0);
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);
  const lastMonth = chartData[chartData.length - 1];
  const prevMonth = chartData[chartData.length - 2];
  const growth = (
    ((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) *
    100
  ).toFixed(1);

  const chartHeight =
    typeof window !== 'undefined'
      ? window.innerWidth < 480
        ? 250
        : window.innerWidth < 768
          ? 280
          : 300
      : 300;

  return (
    <Card className='w-full'>
      <CardHeader className='pb-3 sm:pb-4'>
        <div className='flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-4'>
          <div>
            <CardTitle className='text-lg sm:text-xl'>Revenue Trends</CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              6-month revenue, expenses, and profit analysis
            </CardDescription>
          </div>
          <div className='flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-green-600 sm:text-sm'>
            <TrendingUp className='h-3 w-3 sm:h-4 sm:w-4' />+{growth}% growth
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-3 sm:space-y-4'>
        <div className='mb-3 grid grid-cols-3 gap-2 sm:mb-4 sm:gap-3'>
          <div className='rounded-lg bg-blue-50 p-2 sm:p-3'>
            <p className='text-xs text-muted-foreground sm:text-xs'>
              Total Revenue
            </p>
            <p className='text-sm font-bold text-blue-600 sm:text-xl'>
              Rs. {(totalRevenue / 100000).toFixed(1)}L
            </p>
          </div>
          <div className='rounded-lg bg-orange-50 p-2 sm:p-3'>
            <p className='text-xs text-muted-foreground sm:text-xs'>
              Total Expenses
            </p>
            <p className='text-sm font-bold text-orange-600 sm:text-xl'>
              Rs. {(totalExpenses / 100000).toFixed(1)}L
            </p>
          </div>
          <div className='rounded-lg bg-green-50 p-2 sm:p-3'>
            <p className='text-xs text-muted-foreground sm:text-xs'>
              Profit Margin
            </p>
            <p className='text-sm font-bold text-green-600 sm:text-xl'>
              {profitMargin}%
            </p>
          </div>
        </div>

        <div className='-mx-4 w-full overflow-x-auto px-2 sm:mx-0 sm:px-0'>
          <ResponsiveContainer width='100%' height={chartHeight} minWidth={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id='revenue' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.8} />
                  <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='expenses' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#f97316' stopOpacity={0.8} />
                  <stop offset='95%' stopColor='#f97316' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='profit' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#10b981' stopOpacity={0.8} />
                  <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' />
              <YAxis
                label={{
                  value: 'Amount (Rs)',
                  angle: -90,
                  position: 'insideLeft'
                }}
              />
              <Tooltip
                formatter={(value) =>
                  `Rs. ${((value as number) / 100000).toFixed(1)}L`
                }
                labelFormatter={(label) => `${label}`}
              />
              <Legend />
              <Area
                type='monotone'
                dataKey='revenue'
                stroke='#3b82f6'
                fillOpacity={1}
                fill='url(#revenue)'
                name='Revenue'
              />
              <Area
                type='monotone'
                dataKey='expenses'
                stroke='#f97316'
                fillOpacity={1}
                fill='url(#expenses)'
                name='Expenses'
              />
              <Area
                type='monotone'
                dataKey='profit'
                stroke='#10b981'
                fillOpacity={1}
                fill='url(#profit)'
                name='Profit'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
