/**
 * Financial Analytics Tab
 * Cash Flow, P&L, Budget Planning, Variance Analysis
 */

'use client';

import { motion } from 'motion/react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  Target,
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
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
import { CashFlowForecast } from '../CashFlowForecast';
import { BudgetPlanning } from '../BudgetPlanning';
import { VarianceAnalysis } from '../VarianceAnalysis';
import { CashFlowDashboard } from '../CashFlowDashboard';
import { ProfitAndLossReport } from '../ProfitAndLossReport';

export default function FinancialTab() {
  // Real data queries
  const cashData = useQuery(api.ledger.getCashLedgerSummary, {});
  const receivables = useQuery(api.ledger.getReceivablesAging, {});
  const revenue = useQuery(api.analytics.getTotalRevenueWithComparison, {});

  const isLoading =
    cashData === undefined ||
    receivables === undefined ||
    revenue === undefined;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);

  const financialMetrics = [
    {
      title: 'Cash in Hand',
      value: cashData?.cash || 0,
      change: (cashData?.totalIncome || 0) - (cashData?.totalExpenses || 0),
      icon: Wallet,
      trend: 'up'
    },
    {
      title: 'Total Revenue',
      value: revenue?.currentMonthRevenue || 0,
      change: revenue?.revenuePercentageChange || 0,
      icon: DollarSign,
      trend: (revenue?.revenuePercentageChange ?? 0) >= 0 ? 'up' : 'down'
    },
    {
      title: 'Receivables',
      value: receivables?.total || 0,
      change: -5.2,
      icon: TrendingUp,
      trend: 'down',
      warning: (receivables?.days90 || 0) > 10000
    },
    {
      title: 'Monthly Expenses',
      value: cashData?.totalExpenses || 0,
      change: 8.4,
      icon: TrendingDown,
      trend: 'up'
    }
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial='initial'
      animate='animate'
      className='space-y-6'
    >
      {/* Financial Overview Cards */}
      <motion.div
        variants={fadeInUp}
        className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} className='h-32' />
            ))
          : financialMetrics.map((metric, index) => {
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
                            {formatCurrency(metric.value)}
                          </h3>
                        </div>
                        <div
                          className={cn(
                            'rounded-lg p-2',
                            metric.trend === 'up'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'
                          )}
                        >
                          <Icon className='h-5 w-5' />
                        </div>
                      </div>
                      <div className='mt-4 flex items-center gap-2'>
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
                          {metric.change.toFixed(1)}%
                        </Badge>
                        {metric.warning && (
                          <Badge variant='destructive' className='text-xs'>
                            <AlertTriangle className='mr-1 h-3 w-3' />
                            Alert
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
      </motion.div>

      {/* Main Financial Dashboard */}
      <Tabs defaultValue='cashflow' className='w-full'>
        <TabsList className='mb-6 grid w-full grid-cols-2 gap-2 rounded-xl bg-slate-100/50 p-1 dark:bg-slate-800/50 lg:grid-cols-5'>
          <TabsTrigger value='cashflow' className='rounded-lg text-sm'>
            Cash Flow
          </TabsTrigger>
          <TabsTrigger value='pl' className='rounded-lg text-sm'>
            P&L Report
          </TabsTrigger>
          <TabsTrigger value='budget' className='rounded-lg text-sm'>
            Budget
          </TabsTrigger>
          <TabsTrigger value='variance' className='rounded-lg text-sm'>
            Variance
          </TabsTrigger>
          <TabsTrigger value='receivables' className='rounded-lg text-sm'>
            Receivables
          </TabsTrigger>
        </TabsList>

        <TabsContent value='cashflow' className='mt-0'>
          <motion.div variants={fadeInUp}>
            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-lg font-semibold'>
                      Cash Flow Dashboard
                    </CardTitle>
                    <CardDescription>
                      Track your cash inflows and outflows
                    </CardDescription>
                  </div>
                  <Button variant='outline' size='sm'>
                    Export Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CashFlowDashboard />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value='pl' className='mt-0'>
          <motion.div variants={fadeInUp}>
            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <CardTitle className='text-lg font-semibold'>
                  Profit & Loss Report
                </CardTitle>
                <CardDescription>
                  Revenue, expenses, and net profit analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfitAndLossReport />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value='budget' className='mt-0'>
          <motion.div variants={fadeInUp}>
            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <CardTitle className='text-lg font-semibold'>
                  Budget Planning
                </CardTitle>
                <CardDescription>
                  Set and track your financial goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BudgetPlanning />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value='variance' className='mt-0'>
          <motion.div variants={fadeInUp}>
            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <CardTitle className='text-lg font-semibold'>
                  Variance Analysis
                </CardTitle>
                <CardDescription>
                  Compare actual vs budgeted amounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VarianceAnalysis />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value='receivables' className='mt-0'>
          <motion.div variants={fadeInUp} className='grid gap-6 lg:grid-cols-2'>
            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <CardTitle className='text-lg font-semibold'>
                  Aging Summary
                </CardTitle>
                <CardDescription>
                  Outstanding receivables by age
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {isLoading ? (
                  <CardSkeleton className='h-48' />
                ) : (
                  <>
                    <div className='space-y-3'>
                      {[
                        {
                          label: 'Current',
                          amount: receivables?.current || 0,
                          color: 'bg-emerald-500'
                        },
                        {
                          label: '30+ Days',
                          amount: receivables?.days30 || 0,
                          color: 'bg-yellow-500'
                        },
                        {
                          label: '60+ Days',
                          amount: receivables?.days60 || 0,
                          color: 'bg-orange-500'
                        },
                        {
                          label: '90+ Days',
                          amount: receivables?.days90 || 0,
                          color: 'bg-rose-500'
                        }
                      ].map((item) => (
                        <div key={item.label} className='space-y-1'>
                          <div className='flex justify-between text-sm'>
                            <span className='text-slate-600 dark:text-slate-400'>
                              {item.label}
                            </span>
                            <span className='font-mono font-medium'>
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                          <div className='h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800'>
                            <div
                              className={cn('h-full rounded-full', item.color)}
                              style={{
                                width: `${Math.min(100, (item.amount / (receivables?.total || 1)) * 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <CardTitle className='text-lg font-semibold'>
                  Cash Flow Forecast
                </CardTitle>
                <CardDescription>Projected cash position</CardDescription>
              </CardHeader>
              <CardContent>
                <CashFlowForecast />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
