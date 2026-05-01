'use client';

import * as React from 'react';
import {
  Pie,
  PieChart,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

interface PieGraphProps {
  data?: { name: string; value: number; percentage: string }[];
}

export function PieGraph({ data }: PieGraphProps) {
  const chartData = data || [
    { name: 'Electronics', value: 350000, percentage: '28%' },
    { name: 'Clothing', value: 280000, percentage: '22%' },
    { name: 'Home & Garden', value: 220000, percentage: '18%' },
    { name: 'Sports', value: 200000, percentage: '16%' },
    { name: 'Books & Media', value: 150000, percentage: '16%' }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  const topCategory = chartData[0];
  const avgValue = Math.round(totalValue / chartData.length);

  const chartHeight =
    typeof window !== 'undefined'
      ? window.innerWidth < 480
        ? 220
        : window.innerWidth < 768
          ? 250
          : 280
      : 280;
  const outerRadius =
    typeof window !== 'undefined'
      ? window.innerWidth < 480
        ? 50
        : window.innerWidth < 768
          ? 70
          : 80
      : 80;

  return (
    <Card className='w-full'>
      <CardHeader className='pb-3 sm:pb-4'>
        <CardTitle className='text-lg sm:text-xl'>Sales by Category</CardTitle>
        <CardDescription className='text-xs sm:text-sm'>
          Distribution across product categories
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-3 sm:space-y-4'>
        <div className='mb-3 grid grid-cols-2 gap-2 sm:mb-4 sm:gap-3'>
          <div className='rounded-lg bg-blue-50 p-2 sm:p-3'>
            <p className='text-xs text-muted-foreground sm:text-xs'>
              Top Category
            </p>
            <p className='truncate text-sm font-bold text-blue-600 sm:text-base'>
              {topCategory.name}
            </p>
            <p className='text-xs text-muted-foreground sm:text-xs'>
              Rs. {(topCategory.value / 100000).toFixed(1)}L
            </p>
          </div>
          <div className='rounded-lg bg-purple-50 p-2 sm:p-3'>
            <p className='text-xs text-muted-foreground sm:text-xs'>
              Total Sales
            </p>
            <p className='text-sm font-bold text-purple-600 sm:text-base'>
              Rs. {(totalValue / 100000).toFixed(1)}L
            </p>
            <p className='text-xs text-muted-foreground sm:text-xs'>
              {chartData.length} categories
            </p>
          </div>
        </div>

        <div className='-mx-4 w-full overflow-x-auto px-2 sm:mx-0 sm:px-0'>
          <ResponsiveContainer width='100%' height={chartHeight} minWidth={280}>
            <PieChart>
              <Pie
                data={chartData}
                cx='50%'
                cy='50%'
                labelLine={false}
                label={({ percentage }) => `${percentage}`}
                outerRadius={outerRadius}
                fill='#8884d8'
                dataKey='value'
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  `Rs. ${((value as number) / 100000).toFixed(1)}L`
                }
              />
              <Legend
                wrapperStyle={{
                  fontSize: window.innerWidth < 480 ? '11px' : '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className='space-y-2 border-t pt-2'>
          <p className='mb-2 text-xs font-semibold sm:text-sm'>
            Category Breakdown
          </p>
          <div className='max-h-40 overflow-y-auto'>
            {chartData.map((item, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between py-1 text-xs sm:text-sm'
              >
                <div className='flex min-w-0 items-center gap-2'>
                  <div
                    className='h-2 w-2 flex-shrink-0 rounded-full sm:h-3 sm:w-3'
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className='truncate text-muted-foreground'>
                    {item.name}
                  </span>
                </div>
                <div className='ml-2 flex flex-shrink-0 items-center gap-1 sm:gap-2'>
                  <span className='whitespace-nowrap font-semibold'>
                    Rs. {(item.value / 100000).toFixed(1)}L
                  </span>
                  <span className='text-muted-foreground'>
                    {item.percentage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
