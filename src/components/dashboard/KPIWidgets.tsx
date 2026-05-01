'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';

interface KPIWidgetProps {
  title: string;
  value: string | number;
  unit?: string;
  comparison?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  isVisible?: boolean;
}

export function KPIWidget({
  title,
  value,
  unit = '',
  comparison,
  isVisible = true
}: KPIWidgetProps) {
  if (!isVisible) {
    return null;
  }

  const getTrendIcon = () => {
    if (!comparison) return null;
    switch (comparison.type) {
      case 'increase':
        return <TrendingUp className='h-5 w-5 text-green-500' />;
      case 'decrease':
        return <TrendingDown className='h-5 w-5 text-red-500' />;
      default:
        return <Minus className='h-5 w-5 text-gray-500' />;
    }
  };

  const getTrendColor = () => {
    if (!comparison) return '';
    switch (comparison.type) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className='space-y-2'>
      <div className='flex items-baseline gap-2'>
        <span className='text-3xl font-bold'>{value}</span>
        {unit && <span className='text-sm text-muted-foreground'>{unit}</span>}
      </div>
      {comparison && (
        <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>
            {Math.abs(comparison.value).toFixed(1)}%{' '}
            {comparison.type === 'increase' ? 'increase' : 'decrease'}{' '}
            {comparison.period}
          </span>
        </div>
      )}
    </div>
  );
}

export function RevenueWidget() {
  const data = useQuery(api.analytics.getTotalRevenueWithComparison) ?? {
    currentMonthRevenue: 0,
    revenuePercentageChange: 0
  };

  return (
    <KPIWidget
      title='Total Revenue'
      value={formatCurrency(data.currentMonthRevenue)}
      comparison={{
        value: data.revenuePercentageChange || 0,
        type:
          (data.revenuePercentageChange || 0) >= 0 ? 'increase' : 'decrease',
        period: 'last month'
      }}
    />
  );
}

export function SalesCountWidget() {
  const data = useQuery(api.analytics.getTotalSalesWithComparison) ?? {
    currentMonthSalesCount: 0,
    salesPercentageChange: 0
  };

  return (
    <KPIWidget
      title='Total Sales'
      value={data.currentMonthSalesCount}
      unit='transactions'
      comparison={{
        value: data.salesPercentageChange || 0,
        type: (data.salesPercentageChange || 0) >= 0 ? 'increase' : 'decrease',
        period: 'vs last month'
      }}
    />
  );
}

export function CustomerCountWidget() {
  const data = useQuery(api.analytics.getTotalCustomersWithComparison) ?? {
    currentMonthCustomerCount: 0,
    customerPercentageChange: 0
  };

  return (
    <KPIWidget
      title='Total Customers'
      value={data.currentMonthCustomerCount}
      unit='customers'
      comparison={{
        value: data.customerPercentageChange || 0,
        type:
          (data.customerPercentageChange || 0) >= 0 ? 'increase' : 'decrease',
        period: 'since last month'
      }}
    />
  );
}

export function LoadingKPIWidget() {
  return (
    <div className='animate-pulse space-y-3'>
      <div className='h-10 w-32 rounded bg-muted' />
      <div className='h-4 w-24 rounded bg-muted' />
    </div>
  );
}
