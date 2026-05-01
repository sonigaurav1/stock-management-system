'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
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
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

interface BarGraphProps {
  data?: { date: string; sales: number; orders: number }[];
}

export function BarGraph({ data }: BarGraphProps) {
  // Default to generated data if none provided
  const chartData =
    data ||
    Array.from({ length: 30 }, (_, i) => {
      const date = new Date(2025, 3, i + 1);
      return {
        date: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        sales: Math.floor(Math.random() * 50000) + 10000,
        orders: Math.floor(Math.random() * 150) + 30
      };
    });

  const chartConfig = {
    sales: {
      label: 'Sales (Rs)',
      color: '#3b82f6'
    },
    orders: {
      label: 'Orders',
      color: '#10b981'
    }
  } satisfies ChartConfig;

  const totalSales = chartData.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);
  const avgSales = Math.round(totalSales / chartData.length);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
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
        <CardTitle className='text-lg sm:text-xl'>Sales Performance</CardTitle>
        <CardDescription className='text-xs sm:text-sm'>
          Daily sales volume and order count
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-3 sm:space-y-4'>
        <div className='mb-3 grid grid-cols-3 gap-2 sm:mb-4 sm:gap-3'>
          <div className='rounded-lg bg-blue-50 p-2 sm:p-3'>
            <p className='text-xs text-muted-foreground sm:text-xs'>
              Total Sales
            </p>
            <p className='text-sm font-bold text-blue-600 sm:text-xl'>
              Rs. {(totalSales / 100000).toFixed(1)}L
            </p>
          </div>
          <div className='rounded-lg bg-green-50 p-2 sm:p-3'>
            <p className='text-xs text-muted-foreground sm:text-xs'>
              Total Orders
            </p>
            <p className='text-sm font-bold text-green-600 sm:text-xl'>
              {totalOrders}
            </p>
          </div>
          <div className='rounded-lg bg-purple-50 p-2 sm:p-3'>
            <p className='text-xs text-muted-foreground sm:text-xs'>
              Avg Daily
            </p>
            <p className='text-sm font-bold text-purple-600 sm:text-xl'>
              Rs. {(avgSales / 1000).toFixed(1)}k
            </p>
          </div>
        </div>

        <div className='-mx-4 w-full overflow-x-auto px-2 sm:mx-0 sm:px-0'>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer
              width='100%'
              height={chartHeight}
              minWidth={300}
            >
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='date'
                  tick={{ fontSize: window.innerWidth < 480 ? 10 : 12 }}
                  angle={window.innerWidth < 480 ? -60 : -45}
                  textAnchor='end'
                  height={
                    window.innerWidth < 480
                      ? 60
                      : window.innerWidth < 768
                        ? 70
                        : 80
                  }
                  interval={
                    window.innerWidth < 480
                      ? 2
                      : window.innerWidth < 768
                        ? 1
                        : 0
                  }
                />
                <YAxis
                  yAxisId='left'
                  label={{
                    value: 'Sales (Rs)',
                    angle: -90,
                    position: 'insideLeft'
                  }}
                  tick={{ fontSize: window.innerWidth < 480 ? 10 : 12 }}
                />
                <YAxis
                  yAxisId='right'
                  orientation='right'
                  label={{
                    value: 'Orders',
                    angle: 90,
                    position: 'insideRight'
                  }}
                  tick={{ fontSize: window.innerWidth < 480 ? 10 : 12 }}
                />
                <Tooltip
                  formatter={(value) => {
                    if (typeof value === 'number') {
                      return value > 1000
                        ? `Rs. ${(value / 1000).toFixed(1)}k`
                        : `${value}`;
                    }
                    return value;
                  }}
                  contentStyle={{
                    fontSize: window.innerWidth < 480 ? '11px' : '12px'
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: window.innerWidth < 480 ? '11px' : '12px'
                  }}
                />
                <Bar
                  yAxisId='left'
                  dataKey='sales'
                  fill='#3b82f6'
                  name='Sales (Rs)'
                />
                <Bar
                  yAxisId='right'
                  dataKey='orders'
                  fill='#10b981'
                  name='Orders'
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
