/**
 * Customers Analytics Tab
 * Segmentation, Lifetime Value, Churn Prediction, Purchase Patterns
 */

'use client';

import { motion } from 'motion/react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Users,
  Heart,
  TrendingUp,
  AlertTriangle,
  ShoppingBag,
  Crown,
  UserPlus
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

// Import existing components
import { CustomerSegmentation } from '../CustomerSegmentation';
import { LifetimeValueAnalysis } from '../LifetimeValueAnalysis';
import { ChurnPrediction } from '../ChurnPrediction';
import { PurchasePatterns } from '../PurchasePatterns';
import { ChurnRiskScoring } from '../ChurnRiskScoring';
import { UpsellOpportunities } from '../UpsellOpportunities';

export default function CustomersTab() {
  // Real data queries
  const customers = useQuery(api.analytics.getTotalCustomersWithComparison, {});
  const topProducts = useQuery(api.dashboard.getTopSellingProducts, {});

  const isLoading = customers === undefined;

  const customerMetrics = [
    {
      title: 'Total Customers',
      value: customers?.currentMonthCustomerCount || 0,
      change: customers?.customerPercentageChange || 0,
      icon: Users,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10'
    },
    {
      title: 'Avg Order Value',
      value: '₹2,450',
      change: 5.2,
      icon: ShoppingBag,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
    },
    {
      title: 'Retention Rate',
      value: '68%',
      change: -2.1,
      icon: Heart,
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'
    },
    {
      title: 'VIP Customers',
      value: '24',
      change: 12,
      icon: Crown,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'
    }
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial='initial'
      animate='animate'
      className='space-y-6'
    >
      {/* Customer Overview Cards */}
      <motion.div
        variants={fadeInUp}
        className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} className='h-32' />
            ))
          : customerMetrics.map((metric, index) => {
              const Icon = metric.icon;
              const isPositive = metric.change >= 0;

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
                      <div className='mt-4'>
                        <Badge
                          variant='secondary'
                          className={cn(
                            'text-xs',
                            isPositive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          )}
                        >
                          {isPositive ? '+' : ''}
                          {metric.change}% vs last month
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
      </motion.div>

      {/* Main Customer Analytics */}
      <Tabs defaultValue='segmentation' className='w-full'>
        <TabsList className='mb-6 grid w-full grid-cols-2 gap-2 rounded-xl bg-slate-100/50 p-1 dark:bg-slate-800/50 lg:grid-cols-5'>
          <TabsTrigger value='segmentation' className='rounded-lg text-sm'>
            Segmentation
          </TabsTrigger>
          <TabsTrigger value='ltv' className='rounded-lg text-sm'>
            Lifetime Value
          </TabsTrigger>
          <TabsTrigger value='churn' className='rounded-lg text-sm'>
            Churn Risk
          </TabsTrigger>
          <TabsTrigger value='patterns' className='rounded-lg text-sm'>
            Purchase Patterns
          </TabsTrigger>
          <TabsTrigger value='upsell' className='rounded-lg text-sm'>
            Upsell
          </TabsTrigger>
        </TabsList>

        <TabsContent value='segmentation' className='mt-0'>
          <motion.div variants={fadeInUp}>
            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-lg font-semibold'>
                      Customer Segmentation
                    </CardTitle>
                    <CardDescription>
                      Group customers by behavior and value
                    </CardDescription>
                  </div>
                  <Badge variant='secondary'>RFM Analysis</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CustomerSegmentation />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value='ltv' className='mt-0'>
          <motion.div variants={fadeInUp} className='grid gap-6 lg:grid-cols-2'>
            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <CardTitle className='text-lg font-semibold'>
                  Lifetime Value Analysis
                </CardTitle>
                <CardDescription>
                  Predict future value of customer relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LifetimeValueAnalysis />
              </CardContent>
            </Card>

            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <CardTitle className='text-lg font-semibold'>
                  Top Customers
                </CardTitle>
                <CardDescription>
                  Your most valuable relationships
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {isLoading ? (
                  <CardSkeleton className='h-48' />
                ) : (
                  <div className='space-y-3'>
                    {[
                      {
                        name: 'Rajesh Kumar',
                        value: '₹1,25,000',
                        orders: 45,
                        badge: 'VIP'
                      },
                      {
                        name: 'Priya Sharma',
                        value: '₹98,000',
                        orders: 32,
                        badge: 'Gold'
                      },
                      {
                        name: 'Amit Singh',
                        value: '₹76,500',
                        orders: 28,
                        badge: 'Silver'
                      },
                      {
                        name: 'Sunita Patel',
                        value: '₹65,000',
                        orders: 24,
                        badge: 'Silver'
                      }
                    ].map((customer, idx) => (
                      <div
                        key={idx}
                        className='flex items-center justify-between rounded-lg border border-slate-100 p-3 dark:border-slate-800'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-medium text-white'>
                            {customer.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <p className='font-medium text-slate-900 dark:text-slate-100'>
                              {customer.name}
                            </p>
                            <p className='text-xs text-slate-500'>
                              {customer.orders} orders
                            </p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='font-mono font-medium text-slate-900 dark:text-slate-100'>
                            {customer.value}
                          </p>
                          <Badge variant='secondary' className='text-[10px]'>
                            {customer.badge}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value='churn' className='mt-0'>
          <motion.div variants={fadeInUp} className='grid gap-6 lg:grid-cols-2'>
            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-lg font-semibold'>
                      Churn Prediction
                    </CardTitle>
                    <CardDescription>
                      Identify customers at risk of leaving
                    </CardDescription>
                  </div>
                  <Badge variant='destructive' className='gap-1'>
                    <AlertTriangle className='h-3 w-3' />8 At Risk
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ChurnPrediction />
              </CardContent>
            </Card>

            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <CardTitle className='text-lg font-semibold'>
                  Churn Risk Scoring
                </CardTitle>
                <CardDescription>Detailed risk assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <ChurnRiskScoring />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value='patterns' className='mt-0'>
          <motion.div variants={fadeInUp}>
            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <CardTitle className='text-lg font-semibold'>
                  Purchase Patterns
                </CardTitle>
                <CardDescription>
                  Understand buying behavior and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PurchasePatterns />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value='upsell' className='mt-0'>
          <motion.div variants={fadeInUp}>
            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-lg font-semibold'>
                      Upsell Opportunities
                    </CardTitle>
                    <CardDescription>
                      Smart recommendations for cross-selling
                    </CardDescription>
                  </div>
                  <Badge className='bg-emerald-100 text-emerald-700'>
                    <TrendingUp className='mr-1 h-3 w-3' />
                    +₹45K Potential
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <UpsellOpportunities />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
