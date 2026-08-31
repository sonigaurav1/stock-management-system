/**
 * Operations Analytics Tab
 * Auto Reconciliation, Bulk Operations, Duplicate Detection, etc.
 */

'use client';

import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  CheckCircle2,
  AlertCircle,
  Layers,
  RefreshCw,
  Copy,
  FileCheck
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
import { AutoReconciliation } from '../AutoReconciliation';
import { DuplicateDetection } from '../DuplicateDetection';
import { BulkOperations } from '../BulkOperations';
import { StockReconciliation } from '../StockReconciliation';

export default function OperationsTab() {
  // Placeholder data - implement these queries when features are ready
  const pendingTasks = 0;
  const recentErrors = [];

  const isLoading = false;

  const operationsMetrics = [
    {
      title: 'Auto-Reconciled',
      value: '94%',
      change: 3,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10',
      status: 'good'
    },
    {
      title: 'Pending Tasks',
      value: pendingTasks,
      change: -12,
      icon: AlertCircle,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10',
      status: pendingTasks > 10 ? 'warning' : 'good'
    },
    {
      title: 'Duplicates Found',
      value: '3',
      change: 0,
      icon: Copy,
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10',
      status: 'attention'
    },
    {
      title: 'Bulk Ops Run',
      value: '1,247',
      change: 45,
      icon: Layers,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10',
      status: 'good'
    }
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial='initial'
      animate='animate'
      className='space-y-6'
    >
      {/* Operations Overview Cards */}
      <motion.div
        variants={fadeInUp}
        className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} className='h-32' />
            ))
          : operationsMetrics.map((metric, index) => {
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
                      {metric.status === 'warning' && (
                        <Badge variant='destructive' className='mt-4 text-xs'>
                          Action Required
                        </Badge>
                      )}
                      {metric.status === 'attention' && (
                        <Badge
                          variant='secondary'
                          className='mt-4 bg-amber-100 text-xs text-amber-700'
                        >
                          Review Needed
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
      </motion.div>

      {/* Main Operations Tools */}
      <Tabs defaultValue='reconciliation' className='w-full'>
        <TabsList className='mb-6 grid w-full grid-cols-2 gap-2 rounded-xl bg-slate-100/50 p-1 dark:bg-slate-800/50 lg:grid-cols-4'>
          <TabsTrigger value='reconciliation' className='rounded-lg text-sm'>
            Reconciliation
          </TabsTrigger>
          <TabsTrigger value='duplicates' className='rounded-lg text-sm'>
            Duplicates
          </TabsTrigger>
          <TabsTrigger value='bulk' className='rounded-lg text-sm'>
            Bulk Ops
          </TabsTrigger>
          <TabsTrigger value='stock' className='rounded-lg text-sm'>
            Stock Rec
          </TabsTrigger>
        </TabsList>

        <TabsContent value='reconciliation' className='mt-0'>
          <motion.div variants={fadeInUp} className='grid gap-6 lg:grid-cols-2'>
            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-lg font-semibold'>
                      Auto Reconciliation
                    </CardTitle>
                    <CardDescription>
                      Automatically match transactions
                    </CardDescription>
                  </div>
                  <Badge className='bg-emerald-100 text-emerald-700'>
                    <CheckCircle2 className='mr-1 h-3 w-3' />
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <AutoReconciliation />
              </CardContent>
            </Card>

            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <CardTitle className='text-lg font-semibold'>
                  Reconciliation Status
                </CardTitle>
                <CardDescription>Current matching progress</CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-slate-600 dark:text-slate-400'>
                      Matched
                    </span>
                    <span className='font-medium text-emerald-600'>
                      1,245 / 1,320
                    </span>
                  </div>
                  <Progress value={94} className='h-2' />
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-slate-600 dark:text-slate-400'>
                      Pending Review
                    </span>
                    <span className='font-medium text-amber-600'>45</span>
                  </div>
                  <Progress value={45} className='h-2 bg-amber-100' />
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-slate-600 dark:text-slate-400'>
                      Unmatched
                    </span>
                    <span className='font-medium text-rose-600'>30</span>
                  </div>
                  <Progress value={30} className='h-2 bg-rose-100' />
                </div>
                <Button className='w-full'>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Run Reconciliation
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value='duplicates' className='mt-0'>
          <motion.div variants={fadeInUp}>
            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-lg font-semibold'>
                      Duplicate Detection
                    </CardTitle>
                    <CardDescription>
                      Find and merge duplicate records
                    </CardDescription>
                  </div>
                  <Badge variant='secondary' className='gap-1'>
                    <Copy className='h-3 w-3' />3 Found
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <DuplicateDetection />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value='bulk' className='mt-0'>
          <motion.div variants={fadeInUp}>
            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-lg font-semibold'>
                      Bulk Operations
                    </CardTitle>
                    <CardDescription>
                      Perform mass updates efficiently
                    </CardDescription>
                  </div>
                  <Badge className='bg-blue-100 text-blue-700'>
                    <Layers className='mr-1 h-3 w-3' />
                    1,247 Processed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <BulkOperations />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value='stock' className='mt-0'>
          <motion.div variants={fadeInUp}>
            <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='text-lg font-semibold'>
                      Stock Reconciliation
                    </CardTitle>
                    <CardDescription>
                      Match physical and system inventory
                    </CardDescription>
                  </div>
                  <Badge className='bg-emerald-100 text-emerald-700'>
                    <FileCheck className='mr-1 h-3 w-3' />
                    98.5% Match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <StockReconciliation />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
