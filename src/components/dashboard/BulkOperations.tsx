import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { CheckCircle, AlertTriangle, Zap, Play, Clock } from 'lucide-react';
import { useState } from 'react';

export function BulkOperations() {
  const bulkHistory = useQuery(api.automation.getBulkOperationJobs, {});
  const [selectedOperation, setSelectedOperation] = useState<string>('');

  if (bulkHistory === undefined) {
    return (
      <Card className='bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950'>
        <CardHeader>
          <CardTitle>Bulk Operations</CardTitle>
          <CardDescription>
            Perform actions on multiple items at once
          </CardDescription>
        </CardHeader>
        <CardContent className='flex h-[400px] items-center justify-center'>
          <div className='py-8 text-center'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const performanceData = (bulkHistory || []).slice(0, 5).map((op: any) => ({
    name: op.entityType ? op.entityType.substring(0, 15) : 'Operation',
    successful: op.successCount || 0,
    failed: op.failureCount || 0
  }));

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950'>
        <CardHeader>
          <CardTitle>Bulk Operations Manager</CardTitle>
          <CardDescription>
            Execute actions on 100+ items simultaneously
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Summary Stats */}
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>
                  Total Operations
                </p>
                <p className='text-2xl font-bold'>
                  {(bulkHistory || []).length}
                </p>
              </div>
              <div className='rounded-lg border-l-4 border-green-500 bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Items Processed</p>
                <p className='text-2xl font-bold text-green-600'>
                  {(bulkHistory || [])
                    .reduce(
                      (sum: number, op: any) => sum + (op.successCount || 0),
                      0
                    )
                    .toLocaleString()}
                </p>
              </div>
              <div className='rounded-lg border-l-4 border-blue-500 bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>
                  Avg Success Rate
                </p>
                <p className='text-2xl font-bold text-blue-600'>
                  {(bulkHistory || []).length > 0
                    ? Math.round(
                        (bulkHistory || []).reduce((sum: number, op: any) => {
                          const total =
                            (op.successCount || 0) + (op.failureCount || 0);
                          return (
                            sum +
                            (total > 0
                              ? ((op.successCount || 0) / total) * 100
                              : 0)
                          );
                        }, 0) / (bulkHistory || []).length
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Time Saved</p>
                <p className='text-2xl font-bold'>
                  {(
                    (bulkHistory || []).reduce(
                      (sum: number, op: any) => sum + (op.successCount || 0),
                      0
                    ) * 0.1
                  ).toFixed(0)}
                  h
                </p>
              </div>
            </div>

            {/* Available Operations */}
            <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
              <h3 className='mb-4 text-sm font-semibold'>
                Available Operations
              </h3>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                <div className='rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-900'>
                  <p className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                    Update Stock Levels
                  </p>
                  <p className='mt-1 text-xs text-blue-800 dark:text-blue-200'>
                    Bulk update inventory across products
                  </p>
                  <Button size='sm' className='mt-2 w-full' variant='outline'>
                    Select
                  </Button>
                </div>
                <div className='rounded-lg border-l-4 border-purple-500 bg-purple-50 p-4 dark:bg-purple-900'>
                  <p className='text-sm font-medium text-purple-900 dark:text-purple-100'>
                    Update Prices
                  </p>
                  <p className='mt-1 text-xs text-purple-800 dark:text-purple-200'>
                    Change selling prices in bulk
                  </p>
                  <Button size='sm' className='mt-2 w-full' variant='outline'>
                    Select
                  </Button>
                </div>
                <div className='rounded-lg border-l-4 border-green-500 bg-green-50 p-4 dark:bg-green-900'>
                  <p className='text-sm font-medium text-green-900 dark:text-green-100'>
                    Apply Discounts
                  </p>
                  <p className='mt-1 text-xs text-green-800 dark:text-green-200'>
                    Bulk discount application
                  </p>
                  <Button size='sm' className='mt-2 w-full' variant='outline'>
                    Select
                  </Button>
                </div>
                <div className='rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4 dark:bg-orange-900'>
                  <p className='text-sm font-medium text-orange-900 dark:text-orange-100'>
                    Update Status
                  </p>
                  <p className='mt-1 text-xs text-orange-800 dark:text-orange-200'>
                    Change transaction/order status
                  </p>
                  <Button size='sm' className='mt-2 w-full' variant='outline'>
                    Select
                  </Button>
                </div>
                <div className='rounded-lg border-l-4 border-pink-500 bg-pink-50 p-4 dark:bg-pink-900'>
                  <p className='text-sm font-medium text-pink-900 dark:text-pink-100'>
                    Categorize Items
                  </p>
                  <p className='mt-1 text-xs text-pink-800 dark:text-pink-200'>
                    Auto-categorize transactions
                  </p>
                  <Button size='sm' className='mt-2 w-full' variant='outline'>
                    Select
                  </Button>
                </div>
                <div className='rounded-lg border-l-4 border-indigo-500 bg-indigo-50 p-4 dark:bg-indigo-900'>
                  <p className='text-sm font-medium text-indigo-900 dark:text-indigo-100'>
                    Archive Records
                  </p>
                  <p className='mt-1 text-xs text-indigo-800 dark:text-indigo-200'>
                    Archive old or inactive items
                  </p>
                  <Button size='sm' className='mt-2 w-full' variant='outline'>
                    Select
                  </Button>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            {performanceData.length > 0 && (
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <h3 className='mb-4 text-sm font-semibold'>
                  Recent Operations Performance
                </h3>
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey='successful'
                      stackId='a'
                      fill='#10b981'
                      name='Successful'
                    />
                    <Bar
                      dataKey='failed'
                      stackId='a'
                      fill='#ef4444'
                      name='Failed'
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent Operations */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>
                Recent Operations History
              </h3>
              <div className='space-y-2'>
                {(bulkHistory || []).slice(0, 5).map((op: any, idx: number) => (
                  <div
                    key={idx}
                    className='flex items-center justify-between rounded-lg border-l-4 border-green-500 bg-white p-4 dark:bg-slate-800'
                  >
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        {op.status === 'completed' ? (
                          <CheckCircle className='h-4 w-4 text-green-600' />
                        ) : (
                          <Clock className='h-4 w-4 text-yellow-600' />
                        )}
                        <p className='text-sm font-medium capitalize'>
                          {op.status || 'pending'}
                        </p>
                        <span className='rounded bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-200'>
                          {op.entityType}
                        </span>
                      </div>
                      <p className='mt-2 text-xs text-muted-foreground'>
                        {op.successCount || 0} successful,{' '}
                        {op.failureCount || 0} failed • {op.totalCount || 0}{' '}
                        items
                      </p>
                    </div>
                    <div className='ml-4 text-right'>
                      <p className='text-sm font-medium text-green-600'>
                        {(op.totalCount || 0) > 0
                          ? (
                              ((op.successCount || 0) / (op.totalCount || 1)) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </p>
                      <p className='mt-1 text-xs text-muted-foreground'>
                        {op.completedAt
                          ? new Date(op.completedAt).toLocaleDateString()
                          : new Date(op.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className='grid grid-cols-3 gap-4'>
              <div className='rounded-lg bg-white p-4 text-center dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Total Operations
                </p>
                <p className='text-2xl font-bold text-green-600'>
                  {(bulkHistory || []).length}
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 text-center dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Success Rate
                </p>
                <p className='text-2xl font-bold text-blue-600'>
                  {(bulkHistory || []).length > 0
                    ? Math.round(
                        (bulkHistory || []).reduce((sum: number, op: any) => {
                          const total =
                            (op.successCount || 0) + (op.failureCount || 0);
                          return (
                            sum +
                            (total > 0
                              ? ((op.successCount || 0) / total) * 100
                              : 0)
                          );
                        }, 0) / (bulkHistory || []).length
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 text-center dark:bg-slate-800'>
                <p className='mb-1 text-xs text-muted-foreground'>
                  Avg Items/Op
                </p>
                <p className='text-2xl font-bold'>
                  {(bulkHistory || []).length > 0
                    ? Math.round(
                        (bulkHistory || []).reduce(
                          (sum: number, op: any) => sum + (op.totalCount || 0),
                          0
                        ) / (bulkHistory || []).length
                      )
                    : 0}
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-900'>
              <h4 className='mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-100'>
                <Zap className='h-4 w-4' />
                Benefits of Bulk Operations
              </h4>
              <ul className='space-y-1 text-sm text-emerald-800 dark:text-emerald-200'>
                <li>• Process 100+ items in seconds instead of hours</li>
                <li>• Reduce manual data entry errors</li>
                <li>• Maintain transactional consistency</li>
                <li>• Track progress and success rates</li>
                <li>• Undo/rollback capabilities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
