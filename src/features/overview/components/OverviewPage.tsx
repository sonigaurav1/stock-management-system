/* eslint-disable import/no-unresolved */
'use client';
import { useUser } from '@clerk/nextjs';
import { api } from '@/../convex/_generated/api';
import { useQuery } from 'convex/react';
import React, { useState, useEffect } from 'react';
import { useAuthenticatedQuery } from '@/features/auth/utils/auth';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { IntelligentDashboard } from './IntelligentDashboard';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

// Widget component for Customer Count
function CustomerCountWidget() {
  const totalCustomers = useAuthenticatedQuery(
    api.analytics.getTotalCustomersWithComparison,
    {}
  );

  if (totalCustomers === undefined) return <Skeleton className='h-24 w-full' />;

  return (
    <div className='space-y-2'>
      <p className='text-4xl font-bold text-green-600'>
        {totalCustomers?.currentMonthCustomerCount || 0}
      </p>
      <p className='text-sm text-muted-foreground'>Active customers</p>
      {totalCustomers?.customerPercentageChange !== null &&
        totalCustomers?.customerPercentageChange !== undefined && (
          <p
            className={`text-xs ${
              totalCustomers.customerPercentageChange >= 0
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {totalCustomers.customerPercentageChange >= 0 ? '+' : ''}
            {totalCustomers.customerPercentageChange.toFixed(1)}% from last
            month
          </p>
        )}
    </div>
  );
}

// Widget component for Revenue Summary
function RevenueSummaryWidget() {
  const revenue = useAuthenticatedQuery(
    api.analytics.getTotalRevenueWithComparison,
    {}
  );

  if (revenue === undefined) return <Skeleton className='h-24 w-full' />;

  return (
    <div className='space-y-2'>
      <p className='text-4xl font-bold text-blue-600'>
        $
        {(revenue?.currentMonthRevenue || 0).toLocaleString('en-US', {
          maximumFractionDigits: 0
        })}
      </p>
      <p className='text-sm text-muted-foreground'>Current period</p>
      {revenue?.revenuePercentageChange !== null &&
        revenue?.revenuePercentageChange !== undefined && (
          <p
            className={`text-xs ${
              revenue.revenuePercentageChange >= 0
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {revenue.revenuePercentageChange >= 0 ? '+' : ''}
            {revenue.revenuePercentageChange.toFixed(1)}% from last month
          </p>
        )}
    </div>
  );
}

// Widget component for Sales Count
function SalesCountWidget() {
  const sales = useAuthenticatedQuery(
    api.analytics.getTotalSalesWithComparison,
    {}
  );

  if (sales === undefined) return <Skeleton className='h-24 w-full' />;

  return (
    <div className='space-y-2'>
      <p className='text-4xl font-bold text-purple-600'>
        {sales?.currentMonthSalesCount || 0}
      </p>
      <p className='text-sm text-muted-foreground'>Sales transactions</p>
      {sales?.salesPercentageChange !== null &&
        sales?.salesPercentageChange !== undefined && (
          <p
            className={`text-xs ${
              sales.salesPercentageChange >= 0
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {sales.salesPercentageChange >= 0 ? '+' : ''}
            {sales.salesPercentageChange.toFixed(1)}% from last month
          </p>
        )}
    </div>
  );
}

// Widget component for Top Products
function TopProductsWidget() {
  const topProducts = useAuthenticatedQuery(
    api.dashboard.getTopSellingProducts,
    {}
  );

  if (topProducts === undefined) return <Skeleton className='h-48 w-full' />;

  const products = (topProducts || []).slice(0, 5);

  if (!products || products.length === 0) {
    return (
      <div className='flex items-center justify-center py-8 text-muted-foreground'>
        <p className='text-sm'>No sales data available</p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <div className='space-y-2'>
        {products.map((product: any, idx: number) => (
          <div key={idx} className='flex items-center justify-between'>
            <div className='flex-1 truncate'>
              <p className='truncate text-sm font-medium'>
                {product.productName || 'Unknown'}
              </p>
            </div>
            <div className='ml-2 flex items-center gap-2'>
              <div className='h-2 w-16 rounded-full bg-muted'>
                <div
                  className='h-full rounded-full bg-green-500'
                  style={{
                    width: `${
                      (product.totalSold /
                        Math.max(
                          ...products.map((p: any) => p.totalSold || 0)
                        )) *
                      100
                    }%`
                  }}
                />
              </div>
              <p className='text-xs font-semibold'>{product.totalSold}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Widget component for Inventory Health
function InventoryHealthWidget() {
  const lowStockProducts = useAuthenticatedQuery(
    api.products.getLowStockProducts,
    {}
  );

  if (lowStockProducts === undefined)
    return <Skeleton className='h-24 w-full' />;

  const products = (lowStockProducts || []).slice(0, 3);
  const totalLowStock = (lowStockProducts || []).length;

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <p className='text-sm font-medium'>Low Stock Items</p>
        <span className='text-2xl font-bold text-orange-600'>
          {totalLowStock}
        </span>
      </div>
      {products.length > 0 ? (
        <div className='space-y-1'>
          {products.slice(0, 3).map((product: any, idx: number) => (
            <div
              key={idx}
              className='flex items-center justify-between text-xs'
            >
              <p className='truncate text-muted-foreground'>
                {product.name || 'Unknown'}
              </p>
              <span className='font-semibold text-red-600'>
                {product.quantity} left
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className='text-xs text-muted-foreground'>All inventory healthy</p>
      )}
    </div>
  );
}

// STEP 1.1: Cash Ledger Widget
function CashLedgerWidget() {
  const cashData = useAuthenticatedQuery(api.ledger.getCashLedgerSummary, {});

  if (cashData === undefined) return <Skeleton className='h-24 w-full' />;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);

  return (
    <div className='space-y-2'>
      <p className='text-4xl font-bold text-green-600'>
        {formatCurrency(cashData?.cash || 0)}
      </p>
      <p className='text-sm text-muted-foreground'>Cash in Hand</p>
      <div className='flex gap-3 text-xs'>
        <span className='text-green-600'>
          +{formatCurrency(cashData?.totalIncome || 0)} income
        </span>
        <span className='text-red-600'>
          -{formatCurrency(cashData?.totalExpenses || 0)} expense
        </span>
      </div>
    </div>
  );
}

// STEP 1.3: Receivables Aging Widget
function ReceivablesAgingWidget() {
  const receivables = useAuthenticatedQuery(api.ledger.getReceivablesAging, {});

  if (receivables === undefined) return <Skeleton className='h-24 w-full' />;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);

  return (
    <div className='space-y-2'>
      <p className='text-2xl font-bold text-orange-600'>
        {formatCurrency(receivables?.total || 0)}
      </p>
      <p className='text-sm text-muted-foreground'>Receivables</p>
      <div className='space-y-1 text-xs'>
        <div className='flex justify-between'>
          <span className='text-muted-foreground'>Current</span>
          <span className='font-semibold'>
            {formatCurrency(receivables?.current || 0)}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='text-muted-foreground'>30+ days</span>
          <span className='font-semibold text-yellow-600'>
            {formatCurrency(receivables?.days30 || 0)}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='text-muted-foreground'>60+ days</span>
          <span className='font-semibold text-orange-600'>
            {formatCurrency(receivables?.days60 || 0)}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='text-muted-foreground'>90+ days</span>
          <span className='font-semibold text-red-600'>
            {formatCurrency(receivables?.days90 || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

// STEP 1.4: Top Vendors by Spend Widget
function TopVendorsWidget() {
  const topVendors = useAuthenticatedQuery(api.ledger.getTopVendorsBySpend, {});

  if (topVendors === undefined) return <Skeleton className='h-48 w-full' />;

  const vendors = (topVendors || []).slice(0, 5);

  if (!vendors || vendors.length === 0) {
    return (
      <div className='flex items-center justify-center py-8 text-muted-foreground'>
        <p className='text-sm'>No vendor data available</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);

  return (
    <div className='space-y-3'>
      <div className='space-y-2'>
        {vendors.map((vendor: any, idx: number) => (
          <div key={idx} className='flex items-center justify-between'>
            <div className='flex-1 truncate'>
              <p className='truncate text-sm font-medium'>
                {vendor.supplierName || 'Unknown'}
              </p>
            </div>
            <div className='ml-2 flex items-center gap-2'>
              <div className='h-2 w-16 rounded-full bg-muted'>
                <div
                  className='h-full rounded-full bg-blue-500'
                  style={{
                    width: `${
                      (vendor.totalSpend /
                        Math.max(
                          ...vendors.map((v: any) => v.totalSpend || 1)
                        )) *
                      100
                    }%`
                  }}
                />
              </div>
              <p className='text-xs font-semibold'>
                {formatCurrency(vendor.totalSpend)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Widget component for Sales Trend
function SalesTrendWidget() {
  const salesData = useAuthenticatedQuery(
    api.analytics.getRecentSalesAndMonthlyTotal,
    {}
  );

  if (salesData === undefined) return <Skeleton className='h-48 w-full' />;

  // Transform data for chart (last 7 days)
  const chartData = (salesData?.recentSales || [])
    .slice(-7)
    .map((sale: any) => ({
      date: new Date(sale.soldAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      amount: sale.totalAmount,
      count: 1
    }))
    .reduce((acc: any[], current: any) => {
      const existing = acc.find((a) => a.date === current.date);
      if (existing) {
        existing.amount += current.amount;
        existing.count += current.count;
      } else {
        acc.push(current);
      }
      return acc;
    }, []);

  return (
    <ResponsiveContainer width='100%' height={200}>
      <LineChart data={chartData || []}>
        <CartesianGrid
          strokeDasharray='3 3'
          stroke='hsl(var(--muted-foreground))'
        />
        <XAxis
          dataKey='date'
          stroke='hsl(var(--muted-foreground))'
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke='hsl(var(--muted-foreground))'
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px'
          }}
          formatter={(value) => `$${Number(value).toLocaleString()}`}
        />
        <Line
          type='monotone'
          dataKey='amount'
          stroke='hsl(34, 97%, 55%)'
          strokeWidth={2}
          dot={{ fill: 'hsl(34, 97%, 55%)', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function OverviewPage({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  const { user } = useUser();
  const router = useRouter();

  // Initialize dashboard config on first load
  const [dashboardInitialized, setDashboardInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const initializeDashboard = useMutation(
    api.dashboardConfig.initializeDashboard
  );

  // Fetch dashboard configuration
  const dashboardConfig = useAuthenticatedQuery(
    api.dashboardConfig.getDashboardConfig,
    {}
  );

  // Get company for business type
  const company = useAuthenticatedQuery(api.companies.getCompany, {
    userId: user?.id || ''
  });

  // Initialize dashboard on mount
  useEffect(() => {
    const initDashboard = async () => {
      try {
        if (company && !dashboardInitialized && user) {
          const businessType = company.businessType || 'retailer';
          await initializeDashboard({
            businessType
          });
          setDashboardInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initDashboard();
  }, [company, dashboardInitialized, user, initializeDashboard]);

  // Widget components mapping for dashboard with real data
  const defaultWidgetComponents: Record<
    string,
    (props: any) => React.ReactNode
  > = {
    customer_count: () => <CustomerCountWidget />,
    revenue_summary: () => <RevenueSummaryWidget />,
    sales_count: () => <SalesCountWidget />,
    top_products: () => <TopProductsWidget />,
    inventory_health: () => <InventoryHealthWidget />,
    sales_trend: () => <SalesTrendWidget />,
    // STEP 1.1: Cash Ledger Widget
    cash_ledger: () => <CashLedgerWidget />,
    // STEP 1.3: Receivables Aging Widget
    receivables_aging: () => <ReceivablesAgingWidget />,
    // STEP 1.4: Top Vendors by Spend
    top_vendors: () => <TopVendorsWidget />
  };

  return (
    <IntelligentDashboard
      showInsights={true}
      showCustomization={true}
      widgetComponents={defaultWidgetComponents}
    />
  );
}
