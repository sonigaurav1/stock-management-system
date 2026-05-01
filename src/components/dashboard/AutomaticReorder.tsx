import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  ShoppingCart
} from 'lucide-react';

export function AutomaticReorder() {
  const reorderData = useQuery(api.automation.checkAndCreateReorders);

  if (reorderData === undefined) {
    return (
      <Card className='bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950'>
        <CardHeader>
          <CardTitle>Automatic Reorder</CardTitle>
          <CardDescription>
            Smart stock replenishment automation
          </CardDescription>
        </CardHeader>
        <CardContent className='flex h-[400px] items-center justify-center'>
          <div className='py-8 text-center'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const priorityBreakdown = [
    {
      name: 'Critical',
      value: reorderData.summary?.criticalCount || 0,
      fill: '#dc2626'
    },
    {
      name: 'High',
      value: reorderData.summary?.highCount || 0,
      fill: '#f97316'
    }
  ];

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950'>
        <CardHeader>
          <CardTitle>Automatic Reorder Management</CardTitle>
          <CardDescription>
            Monitor and automate purchase orders based on stock levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Summary Stats */}
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Total Products</p>
                <p className='text-2xl font-bold'>
                  {reorderData.totalProducts}
                </p>
              </div>
              <div className='rounded-lg border-l-4 border-red-500 bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Critical Stock</p>
                <p className='text-2xl font-bold text-red-600'>
                  {reorderData.summary?.criticalCount || 0}
                </p>
              </div>
              <div className='rounded-lg border-l-4 border-orange-500 bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>High Priority</p>
                <p className='text-2xl font-bold text-orange-600'>
                  {reorderData.summary?.highCount || 0}
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Action Required</p>
                <p className='text-2xl font-bold'>
                  {(reorderData.summary?.criticalCount || 0) +
                    (reorderData.summary?.highCount || 0)}
                </p>
              </div>
            </div>

            {/* Priority Breakdown Chart */}
            {priorityBreakdown.some((item) => item.value > 0) && (
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <h3 className='mb-4 text-sm font-semibold'>
                  Reorder Priority Distribution
                </h3>
                <ResponsiveContainer width='100%' height={250}>
                  <BarChart data={priorityBreakdown}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='name' />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey='value' fill='#8884d8' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Reorder Candidates */}
            {reorderData.reorderCandidates &&
              reorderData.reorderCandidates.length > 0 && (
                <div className='space-y-3'>
                  <h3 className='text-sm font-semibold'>
                    Products Needing Reorder
                  </h3>
                  <div className='max-h-[500px] space-y-2 overflow-y-auto'>
                    {reorderData.reorderCandidates.map(
                      (candidate: any, idx: number) => (
                        <div
                          key={idx}
                          className='flex items-center justify-between rounded-lg border-l-4 bg-white p-4 dark:bg-slate-800'
                          style={{
                            borderColor:
                              candidate.priority === 'critical'
                                ? '#dc2626'
                                : '#f97316'
                          }}
                        >
                          <div className='flex-1'>
                            <p className='font-medium'>
                              {candidate.productName}
                            </p>
                            <div className='mt-1 flex gap-4 text-xs text-muted-foreground'>
                              <span>Current: {candidate.currentStock}</span>
                              <span>Min: {candidate.reorderLevel}</span>
                              <span>
                                Order:{' '}
                                {Math.ceil(candidate.recommendedQuantity)} units
                              </span>
                            </div>
                          </div>
                          <div className='text-right'>
                            {candidate.priority === 'critical' ? (
                              <AlertTriangle className='ml-auto h-5 w-5 text-red-600' />
                            ) : (
                              <AlertCircle className='ml-auto h-5 w-5 text-orange-600' />
                            )}
                            <p className='mt-1 text-xs capitalize text-muted-foreground'>
                              {candidate.priority}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {reorderData.reorderCandidates?.length === 0 && (
              <div className='flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900'>
                <CheckCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-300' />
                <div>
                  <h4 className='text-sm font-semibold text-green-900 dark:text-green-100'>
                    All Stock Levels Optimal
                  </h4>
                  <p className='mt-1 text-sm text-green-800 dark:text-green-200'>
                    No immediate reorders needed. All products have sufficient
                    stock.
                  </p>
                </div>
              </div>
            )}

            {/* Automation Rules */}
            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900'>
              <h4 className='mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100'>
                Automation Features
              </h4>
              <ul className='space-y-1 text-sm text-blue-800 dark:text-blue-200'>
                <li>• ✓ Automatic stock level monitoring</li>
                <li>• ✓ Smart reorder quantity calculation (2x min level)</li>
                <li>• ✓ Supplier preference tracking</li>
                <li>• ✓ One-click purchase order generation</li>
                <li>• ✓ Lead time consideration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
