'use client';

import React from 'react';
import { Widget } from '@/types/dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { RevenueWidget } from './IntelligentWidgets/RevenueWidget';
import { TopProductsWidget } from './IntelligentWidgets/TopProductsWidget';
import { InventoryHealthWidget } from './IntelligentWidgets/InventoryHealthWidget';
import { SalesTrendWidget } from './IntelligentWidgets/SalesTrendWidget';
import { CustomerInsightsWidget } from './IntelligentWidgets/CustomerInsightsWidget';
import { CashFlowWidget } from './IntelligentWidgets/CashFlowWidget';
import { ProfitabilityWidget } from './IntelligentWidgets/ProfitabilityWidget';
import { BudgetStatusWidget } from './IntelligentWidgets/BudgetStatusWidget';
import { ExpenseTrendWidget } from './IntelligentWidgets/ExpenseTrendWidget';

interface WidgetData {
  revenue?: number;
  revenueChange?: number;
  previousRevenue?: number;
  salesCount?: number;
  salesChange?: number;
  customerCount?: number;
  customerChange?: number;
  outstanding?: number;
  payable?: number;
  topProducts?: any[];
  inventoryStatus?: any;
  salesTrend?: any;
  [key: string]: any;
}

interface DashboardWidgetRendererProps {
  widget: Widget;
  data?: WidgetData;
  isLoading?: boolean;
}

export function DashboardWidgetRenderer({
  widget,
  data = {},
  isLoading = false
}: DashboardWidgetRendererProps) {
  if (isLoading) {
    return <Skeleton className='h-64 w-full' />;
  }

  const renderWidget = () => {
    switch (widget.type) {
      case 'revenue_summary':
        return (
          <RevenueWidget
            revenue={data.revenue || 0}
            change={data.revenueChange || 0}
            previousRevenue={data.previousRevenue || 0}
          />
        );

      case 'top_products':
        return <TopProductsWidget products={data.topProducts || []} />;

      case 'inventory_health':
        return (
          <InventoryHealthWidget
            status={
              data.inventoryStatus || {
                inStock: 0,
                lowStock: 0,
                outOfStock: 0,
                criticalItems: 0
              }
            }
          />
        );

      case 'sales_trend':
        return (
          <SalesTrendWidget
            dailySales={data.salesTrend?.daily || Array(30).fill(0)}
            trend={data.salesTrend?.trend || 'stable'}
            average={data.salesTrend?.average || 0}
          />
        );

      case 'customer_count':
        return (
          <CustomerInsightsWidget
            totalCustomers={data.customerCount || 0}
            newCustomers={data.newCustomers || 0}
            growth={data.customerChange || 0}
            retention={data.retention || 85}
          />
        );

      case 'cash_flow':
        return (
          <CashFlowWidget
            outstanding={data.outstanding || 0}
            payable={data.payable || 0}
            netCashFlow={(data.outstanding || 0) - (data.payable || 0)}
          />
        );

      case 'profitability':
        return <ProfitabilityWidget data={data} />;

      case 'budget_status':
        return <BudgetStatusWidget />;

      case 'expense_trend':
        return <ExpenseTrendWidget data={data} />;

      case 'sales_count':
      case 'profit_margin':
      case 'inventory_turnover':
      case 'supplier_performance':
      case 'payment_status':
      case 'reorder_alerts':
      default:
        return (
          <div className='col-span-1 flex h-48 items-center justify-center rounded-lg border bg-muted/30 md:col-span-2'>
            <div className='text-center'>
              <p className='text-sm font-medium text-muted-foreground'>
                {widget.title}
              </p>
              <p className='mt-1 text-xs text-muted-foreground'>
                {widget.config?.description}
              </p>
            </div>
          </div>
        );
    }
  };

  return renderWidget();
}
