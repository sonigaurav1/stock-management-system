/**
 * Summary Tab Component
 * Main dashboard overview with KPIs and key metrics
 */

'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KPIGlassCard } from '../KPIGlassCard';
import { AnalyticsSection } from '../AnalyticsSection';
// import { SetupGuide } from '../SetupGuide';
import { ActivityFeed } from '../ActivityFeed';
import { CardSkeleton } from '@/components/skeletons';
import { cn } from '@/lib/utils';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { useAuthenticatedQuery } from '@/features/auth/utils/auth';

export default function SummaryTab() {
  const { user, isLoaded: userLoaded } = useUser();

  // Real data queries - only execute when user is authenticated
  const revenue = useAuthenticatedQuery(
    api.analytics.getTotalRevenueWithComparison,
    {}
  );
  const sales = useAuthenticatedQuery(
    api.analytics.getTotalSalesWithComparison,
    {}
  );
  const customers = useAuthenticatedQuery(
    api.analytics.getTotalCustomersWithComparison,
    {}
  );
  const topProducts = useAuthenticatedQuery(
    api.dashboard.getTopSellingProducts,
    {}
  );
  const lowStockProducts = useAuthenticatedQuery(
    api.products.getLowStockProducts,
    {}
  );
  const salesTrend = useAuthenticatedQuery(
    api.analytics.getRecentSalesAndMonthlyTotal,
    {}
  );
  const company = useAuthenticatedQuery(api.companies.getCompany, {
    userId: user?.id || ''
  });
  const context = useAuthenticatedQuery(api.companyAccess.getCallerContext, {});
  const permissions = context?.permissions || [];
  const canViewFinancials = permissions.includes('view_ledger');

  const isLoading =
    !userLoaded ||
    revenue === undefined ||
    sales === undefined ||
    customers === undefined ||
    topProducts === undefined ||
    lowStockProducts === undefined ||
    context === undefined;

  const baseKpiData = [
    {
      title: 'Sales Count',
      value: sales?.currentMonthSalesCount || 0,
      change: sales?.salesPercentageChange || 0,
      sparklineData: [35, 42, 38, 45, 52, 48, 55, 62, 58, 65, 72, 68],
      icon: ShoppingCart
    },
    {
      title: 'Active Customers',
      value: customers?.currentMonthCustomerCount || 0,
      change: customers?.customerPercentageChange || 0,
      sparklineData: [65, 62, 58, 55, 52, 48, 45, 42, 48, 52, 55, 58],
      icon: Users
    },
    {
      title: 'Products Sold',
      value: (topProducts || []).reduce(
        (acc: number, p: any) => acc + (p.totalSold || 0),
        0
      ),
      change: 12.5,
      sparklineData: [40, 45, 52, 58, 65, 72, 78, 82, 88, 92, 95, 98],
      icon: Package
    }
  ];

  const kpiData = canViewFinancials
    ? [
        {
          title: 'Total Revenue',
          value: revenue?.currentMonthRevenue || 0,
          change: revenue?.revenuePercentageChange || 0,
          sparklineData: [45, 52, 48, 63, 58, 72, 68, 75, 82, 78, 85, 88],
          icon: DollarSign,
          isCurrency: true
        },
        ...baseKpiData
      ]
    : baseKpiData;

  const totalProducts = (topProducts || []).length;
  const lowStockCount = (lowStockProducts || []).length;
  const healthyCount = Math.max(0, totalProducts - lowStockCount);

  const salesChartData = (salesTrend?.recentSales || [])
    .slice(-30)
    .map((sale: any) => ({
      day: new Date(sale.soldAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      revenue: sale.totalAmount,
      units:
        sale.items?.reduce(
          (acc: number, item: any) => acc + (item.quantity || 0),
          0
        ) || 1
    }))
    .reduce((acc: any[], current: any) => {
      const existing = acc.find((a) => a.day === current.day);
      if (existing) {
        existing.revenue += current.revenue;
        existing.units += current.units;
      } else {
        acc.push(current);
      }
      return acc;
    }, []);

  const recentActivities = (salesTrend?.recentSales || [])
    .slice(0, 5)
    .map((sale: any, index: number) => ({
      id: sale._id || String(index),
      type: 'sale' as const,
      title: `Sale #${sale.saleNumber || index + 1}`,
      description: `${sale.items?.length || 1} items sold to ${sale.customerName || 'Walk-in'}`,
      timestamp: new Date(sale.soldAt),
      amount: sale.totalAmount,
      status: 'completed' as const,
      user: sale.createdBy || 'System'
    }));

  // Show loading state while auth is being established
  if (!userLoaded) {
    return (
      <div className='flex items-center justify-center py-12'>
        <CardSkeleton className='h-40 w-full' />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial='initial'
      animate='animate'
      className='space-y-8'
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'
      >
        <div>
          <h2 className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
            {company?.name || 'Business'} Overview
          </h2>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
            Real-time insights into your business performance
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <Badge variant='secondary' className='text-xs'>
            <TrendingUp className='mr-1 h-3 w-3' />
            Live Data
          </Badge>
          <Tabs defaultValue='30d'>
            <TabsList className='h-8'>
              <TabsTrigger value='7d' className='text-xs'>
                7D
              </TabsTrigger>
              <TabsTrigger value='30d' className='text-xs'>
                30D
              </TabsTrigger>
              <TabsTrigger value='90d' className='text-xs'>
                90D
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.section variants={fadeInUp}>
        <div
          className={cn(
            'grid gap-6 sm:grid-cols-2',
            kpiData.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
          )}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} className='h-40' />
              ))
            : kpiData.map((kpi, index) => (
                <motion.div
                  key={kpi.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <KPIGlassCard {...kpi} />
                </motion.div>
              ))}
        </div>
      </motion.section>

      {/* Analytics Charts */}
      <motion.section variants={fadeInUp}>
        <AnalyticsSection
          isLoading={isLoading}
          inventoryData={[
            {
              name: 'Healthy',
              value:
                totalProducts > 0
                  ? Math.round((healthyCount / totalProducts) * 100)
                  : 85,
              color: '#10b981',
              status: 'healthy'
            },
            {
              name: 'Low Stock',
              value:
                totalProducts > 0
                  ? Math.round((lowStockCount / totalProducts) * 100)
                  : 10,
              color: '#f59e0b',
              status: 'low'
            },
            { name: 'Out of Stock', value: 5, color: '#f43f5e', status: 'out' }
          ]}
          totalSKUs={totalProducts || 1248}
          salesData={salesChartData.length > 0 ? salesChartData : undefined}
          onInventorySegmentClick={(segment) => {
            console.log('Clicked segment:', segment);
          }}
        />
      </motion.section>

      {/* Bottom Grid */}
      <motion.section variants={fadeInUp}>
        <div className='grid gap-6 lg:grid-cols-5'>
          {/* <div className='lg:col-span-2'>
            <SetupGuide onComplete={() => console.log('Setup complete!')} />
          </div> */}
          <div className='lg:col-span-3'>
            <ActivityFeed activities={recentActivities} />
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
