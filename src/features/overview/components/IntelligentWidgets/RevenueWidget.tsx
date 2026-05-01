'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface RevenueWidgetProps {
  revenue: number;
  change: number;
  previousRevenue: number;
}

export function RevenueWidget({
  revenue,
  change,
  previousRevenue
}: RevenueWidgetProps) {
  const isPositive = change >= 0;

  return (
    <Card className='col-span-1 md:col-span-2'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>Current period performance</CardDescription>
          </div>
          {isPositive ? (
            <TrendingUp className='h-5 w-5 text-green-600' />
          ) : (
            <TrendingDown className='h-5 w-5 text-red-600' />
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-1'>
          <div className='text-4xl font-bold'>{formatCurrency(revenue)}</div>
          <div
            className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}
          >
            {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% vs last
            month
          </div>
        </div>
        <div className='border-t pt-2'>
          <p className='text-xs text-muted-foreground'>Previous Period</p>
          <p className='text-lg font-semibold'>
            {formatCurrency(previousRevenue)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
