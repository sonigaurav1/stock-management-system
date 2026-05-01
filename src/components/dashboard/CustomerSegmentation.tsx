import { useMutation, useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

const SEGMENT_COLORS: Record<string, string> = {
  champions: '#10b981',
  loyal: '#3b82f6',
  recent: '#8b5cf6',
  new: '#f59e0b',
  needs_attention: '#ef4444',
  at_risk: '#dc2626',
  lost: '#6b7280'
};

const SEGMENT_DESCRIPTIONS: Record<string, string> = {
  champions: 'Best customers - high purchase frequency and value',
  loyal: 'Regular customers with good lifetime value',
  recent: 'Recently acquired customers showing good engagement',
  new: 'New customers with early-stage purchases',
  needs_attention: 'Customers who need engagement strategy',
  at_risk: 'Customers showing declining engagement',
  lost: "Customers who haven't purchased in 180+ days"
};

export function CustomerSegmentation() {
  const segmentation = useQuery(api.customerIntelligence.segmentCustomers);

  if (segmentation === undefined) {
    return (
      <Card className='bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950'>
        <CardHeader>
          <CardTitle>Customer Segmentation</CardTitle>
          <CardDescription>RFM-based customer analysis</CardDescription>
        </CardHeader>
        <CardContent className='flex h-[400px] items-center justify-center'>
          <div className='py-8 text-center'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!segmentation.summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Segmentation</CardTitle>
        </CardHeader>
        <CardContent className='text-center text-muted-foreground'>
          No customer data available
        </CardContent>
      </Card>
    );
  }

  const chartData = Object.entries(segmentation.summary.segments).map(
    ([segment, count]) => ({
      name: segment,
      value: count,
      color: SEGMENT_COLORS[segment]
    })
  );

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950'>
        <CardHeader>
          <CardTitle>Customer Segmentation</CardTitle>
          <CardDescription>
            RFM-based customer analysis and segmentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Summary Stats */}
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Total Customers</p>
                <p className='text-2xl font-bold'>
                  {segmentation.summary.totalCustomers}
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>
                  Avg Customer Value
                </p>
                <p className='text-2xl font-bold'>
                  ${segmentation.summary.avgCustomerValue}
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>
                  Avg Purchase Frequency
                </p>
                <p className='text-2xl font-bold'>
                  {segmentation.summary.avgPurchaseFrequency}x
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Champions</p>
                <p className='text-2xl font-bold text-green-600'>
                  {segmentation.summary.segments.champions}
                </p>
              </div>
            </div>

            {/* Pie Chart */}
            <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
              <h3 className='mb-4 text-sm font-semibold'>
                Segment Distribution
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {chartData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Segment Details */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>Segment Breakdown</h3>
              <div className='grid gap-3'>
                {Object.entries(segmentation.summary.segments).map(
                  ([segment, count]) => (
                    <div
                      key={segment}
                      className='flex items-center justify-between rounded-lg bg-white p-3 dark:bg-slate-800'
                    >
                      <div className='flex items-center gap-3'>
                        <div
                          className='h-3 w-3 rounded-full'
                          style={{ backgroundColor: SEGMENT_COLORS[segment] }}
                        />
                        <div>
                          <p className='font-medium capitalize'>
                            {segment.replace('_', ' ')}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {SEGMENT_DESCRIPTIONS[segment]}
                          </p>
                        </div>
                      </div>
                      <p className='font-semibold'>{count}</p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Top Customers by RFM Score */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>
                Top Customers (By RFM Score)
              </h3>
              <div className='max-h-[400px] space-y-2 overflow-y-auto'>
                {segmentation.customers.slice(0, 10).map((customer: any) => (
                  <div
                    key={customer.customerId}
                    className='flex items-center justify-between rounded-lg bg-white p-3 text-sm dark:bg-slate-800'
                  >
                    <div>
                      <p className='font-medium'>{customer.customerName}</p>
                      <p className='text-xs text-muted-foreground'>
                        {customer.purchaseCount} purchases • $
                        {customer.totalSpent}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold'>
                        {customer.rfmScore.toFixed(1)}
                      </p>
                      <p className='text-xs capitalize'>
                        {customer.segment.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
