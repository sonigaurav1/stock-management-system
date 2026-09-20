/**
 * Inventory Analytics Tab
 * ABC Analysis, Dead Stock, Reorder Recommendations, Stock Levels
 */

'use client';

import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Package,
  AlertTriangle,
  RefreshCw,
  TrendingDown,
  BarChart3,
  Layers,
  Box
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { CardSkeleton } from '@/components/skeletons';
import { useAuthenticatedQuery } from '@/features/auth/utils/auth';

// Import existing components
import { ABCAnalysis } from '../ABCAnalysis';
import { DeadStockIdentification } from '../DeadStockIdentification';
import { ReorderRecommendations } from '../ReorderRecommendations';
import { StockLevelCalculator } from '../StockLevelCalculator';
import { SupplierLeadTimeTracker } from '../SupplierLeadTimeTracker';
// import { AutomaticReorder } from '../AutomaticReorder';

export default function InventoryTab() {
  // Real data queries - only execute when user is authenticated
  const lowStockProducts = useAuthenticatedQuery(
    api.products.getLowStockProducts,
    {}
  );
  const topProducts = useAuthenticatedQuery(
    api.dashboard.getTopSellingProducts,
    {}
  );

  const isLoading = lowStockProducts === undefined || topProducts === undefined;

  const totalProducts = (topProducts || []).length;
  const lowStockCount = (lowStockProducts || []).length;
  const outOfStockCount = (lowStockProducts || []).filter(
    (p: any) => p.quantity === 0
  ).length;

  const inventoryMetrics = [
    {
      title: 'Total SKUs',
      value: totalProducts,
      change: 12,
      icon: Package,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10'
    },
    {
      title: 'Low Stock Items',
      value: lowStockCount,
      change: -5,
      warning: lowStockCount > 10,
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'
    },
    {
      title: 'Out of Stock',
      value: outOfStockCount,
      change: 0,
      warning: outOfStockCount > 0,
      icon: Box,
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'
    },
    {
      title: 'Inventory Value',
      value: '₹12,45,000',
      change: 8.5,
      icon: BarChart3,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
    }
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial='initial'
      animate='animate'
      className='space-y-6'
    >
      {/* Inventory Overview Cards */}
      <motion.div
        variants={fadeInUp}
        className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} className='h-32' />
            ))
          : inventoryMetrics.map((metric, index) => {
              const Icon = metric.icon;

              return (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className='overflow-hidden border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
                    <CardContent className='p-6'>
                      <div className='flex items-start justify-between'>
                        <div>
                          <p className='text-sm font-medium text-slate-500 dark:text-slate-400'>
                            {metric.title}
                          </p>
                          <h3 className='mt-2 font-mono text-2xl font-bold text-slate-900 dark:text-slate-100'>
                            {metric.value}
                          </h3>
                        </div>
                        <div className={cn('rounded-lg p-2', metric.color)}>
                          <Icon className='h-5 w-5' />
                        </div>
                      </div>
                      {metric.warning && (
                        <Badge variant='destructive' className='mt-4 text-xs'>
                          Action Required
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
      </motion.div>

      {/* Main Inventory Analytics */}
      <Tabs defaultValue='abc' className='w-full'>
        <TabsList className='mb-6 grid w-full grid-cols-2 gap-2 rounded-xl bg-slate-100/50 p-1 dark:bg-slate-800/50 lg:grid-cols-5'>
          <TabsTrigger value='abc' className='rounded-lg text-sm'>
            ABC Analysis
          </TabsTrigger>
          <TabsTrigger value='reorder' className='rounded-lg text-sm'>
            Reorder
          </TabsTrigger>
          <TabsTrigger value='deadstock' className='rounded-lg text-sm'>
            Dead Stock
          </TabsTrigger>
          <TabsTrigger value='stocklevels' className='rounded-lg text-sm'>
            Stock Levels
          </TabsTrigger>
          <TabsTrigger value='leadtime' className='rounded-lg text-sm'>
            Lead Times
          </TabsTrigger>
        </TabsList>

        <TabsContent value='abc' className='mt-0'>
          <motion.div variants={fadeInUp}>
            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-lg font-semibold'>
                      ABC Analysis
                    </CardTitle>
                    <CardDescription>
                      Categorize inventory by value contribution
                    </CardDescription>
                  </div>
                  <Badge variant='secondary'>Pareto Principle</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ABCAnalysis />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value='reorder' className='mt-0'>
          <motion.div variants={fadeInUp} className='grid gap-6 lg:grid-cols-2'>
            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <CardTitle className='text-lg font-semibold'>
                  Reorder Recommendations
                </CardTitle>
                <CardDescription>
                  Smart suggestions based on sales velocity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReorderRecommendations />
              </CardContent>
            </Card>

            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <CardTitle className='text-lg font-semibold'>
                  Automatic Reorder
                </CardTitle>
                <CardDescription>
                  Set up automated purchase orders
                </CardDescription>
              </CardHeader>
              <CardContent>{/* <AutomaticReorder /> */}</CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value='deadstock' className='mt-0'>
          <motion.div variants={fadeInUp}>
            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-lg font-semibold'>
                      Dead Stock Identification
                    </CardTitle>
                    <CardDescription>
                      Find slow-moving inventory
                    </CardDescription>
                  </div>
                  <Badge variant='destructive' className='gap-1'>
                    <TrendingDown className='h-3 w-3' />
                    Action Needed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <DeadStockIdentification />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value='stocklevels' className='mt-0'>
          <motion.div variants={fadeInUp}>
            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <CardTitle className='text-lg font-semibold'>
                  Stock Level Calculator
                </CardTitle>
                <CardDescription>
                  Optimize safety stock and reorder points
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StockLevelCalculator />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value='leadtime' className='mt-0'>
          <motion.div variants={fadeInUp}>
            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <CardTitle className='text-lg font-semibold'>
                  Supplier Lead Time Tracker
                </CardTitle>
                <CardDescription>Monitor supplier performance</CardDescription>
              </CardHeader>
              <CardContent>
                <SupplierLeadTimeTracker />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
