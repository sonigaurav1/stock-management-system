'use client';

import React from 'react';
import {
  RevenueWidget,
  SalesCountWidget,
  CustomerCountWidget,
  LoadingKPIWidget
} from './KPIWidgets';
import { PieGraph } from '@/features/overview/components/PieGraph';
import { BarGraph } from '@/features/overview/components/BarGraph';
import { AreaGraph } from '@/features/overview/components/AreaGraph';
import { RecentSales } from '@/features/overview/components/RecentSales';
import type { WidgetType } from '@/types/dashboard';

interface WidgetRendererProps {
  widgetType: WidgetType;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function WidgetRenderer({
  widgetType,
  isLoading = false,
  children
}: WidgetRendererProps) {
  // Map widget types to their components
  const widgetMap: Record<string, React.ComponentType<any>> = {
    revenue_summary: RevenueWidget,
    sales_count: SalesCountWidget,
    customer_count: CustomerCountWidget
  };

  const Component = widgetMap[widgetType];

  if (isLoading) {
    return <LoadingKPIWidget />;
  }

  if (Component) {
    return <Component />;
  }

  // For widgets with existing implementations (charts)
  switch (widgetType) {
    case 'top_products':
      return (
        children || (
          <div className='text-sm text-muted-foreground'>
            Top products chart
          </div>
        )
      );

    case 'inventory_health':
      return (
        children || (
          <div className='text-sm text-muted-foreground'>
            Inventory health chart
          </div>
        )
      );

    case 'sales_trend':
      return (
        children || (
          <div className='text-sm text-muted-foreground'>Sales trend chart</div>
        )
      );

    case 'cash_flow':
      return (
        children || (
          <div className='text-sm text-muted-foreground'>Cash flow chart</div>
        )
      );

    case 'profit_margin':
      return (
        children || (
          <div className='text-sm text-muted-foreground'>
            Profit margin analysis
          </div>
        )
      );

    case 'supplier_performance':
      return (
        children || (
          <div className='text-sm text-muted-foreground'>
            Supplier performance chart
          </div>
        )
      );

    case 'inventory_turnover':
      return (
        children || (
          <div className='text-sm text-muted-foreground'>
            Inventory turnover ratio
          </div>
        )
      );

    case 'payment_status':
      return (
        children || (
          <div className='text-sm text-muted-foreground'>
            Payment status overview
          </div>
        )
      );

    case 'reorder_alerts':
      return (
        children || (
          <div className='text-sm text-muted-foreground'>
            Products requiring reorder
          </div>
        )
      );

    default:
      return (
        <div className='text-sm text-muted-foreground'>
          Widget not configured
        </div>
      );
  }
}

// Export widget component factory
export const widgetComponentFactory = {
  revenue_summary: RevenueWidget,
  sales_count: SalesCountWidget,
  customer_count: CustomerCountWidget,
  top_products: () => (
    <div className='text-sm text-muted-foreground'>Top products chart</div>
  ),
  inventory_health: () => (
    <div className='text-sm text-muted-foreground'>Inventory health chart</div>
  ),
  sales_trend: () => (
    <div className='text-sm text-muted-foreground'>Sales trend chart</div>
  ),
  cash_flow: () => (
    <div className='text-sm text-muted-foreground'>Cash flow chart</div>
  ),
  profit_margin: () => (
    <div className='text-sm text-muted-foreground'>Profit margin analysis</div>
  ),
  supplier_performance: () => (
    <div className='text-sm text-muted-foreground'>
      Supplier performance chart
    </div>
  ),
  inventory_turnover: () => (
    <div className='text-sm text-muted-foreground'>
      Inventory turnover ratio
    </div>
  ),
  payment_status: () => (
    <div className='text-sm text-muted-foreground'>Payment status overview</div>
  ),
  reorder_alerts: () => (
    <div className='text-sm text-muted-foreground'>
      Products requiring reorder
    </div>
  )
};
