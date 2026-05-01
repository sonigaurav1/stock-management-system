'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { TrendingUp, Calendar } from 'lucide-react';

interface SalesTrendWidgetProps {
  dailySales: number[];
  trend: 'up' | 'down' | 'stable';
  average: number;
}

export function SalesTrendWidget({
  dailySales,
  trend,
  average
}: SalesTrendWidgetProps) {
  const max = Math.max(...dailySales, average);
  const chartHeight = 60;

  return (
    <Card className='w-full'>
      <CardHeader className='pb-2 sm:pb-3'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <CardTitle className='text-lg sm:text-xl'>
              30-Day Sales Trend
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              Daily sales performance
            </CardDescription>
          </div>
          <TrendingUp className='h-4 w-4 flex-shrink-0 text-blue-600 sm:h-5 sm:w-5' />
        </div>
      </CardHeader>
      <CardContent className='space-y-3 sm:space-y-4'>
        <div className='flex h-14 items-end gap-0.5 sm:h-16 sm:gap-1'>
          {dailySales.map((sale, idx) => (
            <div key={idx} className='flex flex-1 flex-col items-center'>
              <div
                className='w-full rounded-t-sm bg-blue-500 opacity-75 transition-opacity hover:opacity-100'
                style={{
                  height: `${(sale / max) * chartHeight}px`,
                  minHeight: sale > 0 ? '1px' : '0px'
                }}
                title={`Day ${idx + 1}: Rs. ${(sale / 1000).toFixed(1)}k`}
              />
            </div>
          ))}
        </div>

        <div className='grid grid-cols-3 gap-2 border-t pt-2 sm:gap-4'>
          <div className='min-w-0'>
            <p className='text-xs text-muted-foreground sm:text-xs'>
              Avg Daily
            </p>
            <p className='text-sm font-bold sm:text-base'>
              Rs. {(average / 1000).toFixed(1)}k
            </p>
          </div>
          <div className='min-w-0'>
            <p className='text-xs text-muted-foreground sm:text-xs'>Trend</p>
            <p
              className={`text-sm font-bold sm:text-base ${
                trend === 'up'
                  ? 'text-green-600'
                  : trend === 'down'
                    ? 'text-red-600'
                    : 'text-gray-600'
              }`}
            >
              {trend === 'up'
                ? '📈 Up'
                : trend === 'down'
                  ? '📉 Down'
                  : '➡️ Stable'}
            </p>
          </div>
          <div className='min-w-0'>
            <p className='text-xs text-muted-foreground sm:text-xs'>Period</p>
            <p className='flex items-center gap-1 text-sm font-bold sm:text-base'>
              <Calendar className='h-3 w-3 flex-shrink-0' />{' '}
              <span className='truncate'>30 days</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
