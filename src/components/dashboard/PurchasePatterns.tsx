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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { Calendar, Clock, TrendingUp } from 'lucide-react';

export function PurchasePatterns() {
  const patterns = useQuery(api.customerIntelligence.analyzePurchasePatterns);

  if (patterns === undefined) {
    return (
      <Card className='bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950'>
        <CardHeader>
          <CardTitle>Purchase Patterns</CardTitle>
          <CardDescription>
            Temporal analysis and purchase trends
          </CardDescription>
        </CardHeader>
        <CardContent className='flex h-[400px] items-center justify-center'>
          <div className='py-8 text-center'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!patterns.patterns) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Purchase Patterns</CardTitle>
        </CardHeader>
        <CardContent className='text-center text-muted-foreground'>
          No transaction data available
        </CardContent>
      </Card>
    );
  }

  const dayPatterns = patterns.patterns.dayPatterns || [];

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950'>
        <CardHeader>
          <CardTitle>Purchase Patterns Analysis</CardTitle>
          <CardDescription>
            Understand when and how customers make purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Key Insights */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div className='rounded-lg border-l-4 border-blue-500 bg-white p-4 dark:bg-slate-800'>
                <div className='mb-2 flex items-center gap-2'>
                  <Calendar className='h-5 w-5 text-blue-500' />
                  <p className='text-sm text-muted-foreground'>
                    Peak Purchase Day
                  </p>
                </div>
                <p className='text-2xl font-bold'>
                  {patterns.patterns.peakDayOfWeek}
                </p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Most active shopping day
                </p>
              </div>

              <div className='rounded-lg border-l-4 border-purple-500 bg-white p-4 dark:bg-slate-800'>
                <div className='mb-2 flex items-center gap-2'>
                  <Clock className='h-5 w-5 text-purple-500' />
                  <p className='text-sm text-muted-foreground'>
                    Peak Purchase Hour
                  </p>
                </div>
                <p className='text-2xl font-bold'>
                  {patterns.patterns.peakHour}
                </p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Busiest shopping time
                </p>
              </div>

              <div className='rounded-lg border-l-4 border-green-500 bg-white p-4 dark:bg-slate-800'>
                <div className='mb-2 flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5 text-green-500' />
                  <p className='text-sm text-muted-foreground'>
                    Repeat Customer Rate
                  </p>
                </div>
                <p className='text-2xl font-bold'>
                  {patterns.patterns.repeatCustomerRate}%
                </p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Multi-purchase rate
                </p>
              </div>
            </div>

            {/* Day of Week Pattern Chart */}
            <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
              <h3 className='mb-4 text-sm font-semibold'>
                Average Order Value by Day of Week
              </h3>
              {dayPatterns.length > 0 ? (
                <ResponsiveContainer width='100%' height={300}>
                  <BarChart data={dayPatterns}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='day' />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                    <Bar
                      dataKey='avgOrderValue'
                      fill='#3b82f6'
                      name='Avg Order Value'
                    />
                    <Bar
                      dataKey='frequency'
                      fill='#f59e0b'
                      name='Transaction Count'
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className='py-8 text-center text-muted-foreground'>
                  No data available
                </p>
              )}
            </div>

            {/* Detailed Day Breakdown */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>
                Purchase Activity by Day
              </h3>
              <div className='grid grid-cols-2 gap-2'>
                {dayPatterns.map((day: any) => (
                  <div
                    key={day.day}
                    className='rounded-lg bg-white p-3 dark:bg-slate-800'
                  >
                    <p className='text-sm font-medium'>{day.day}</p>
                    <div className='mt-2 flex items-end justify-between'>
                      <div>
                        <p className='text-xs text-muted-foreground'>
                          Avg Order
                        </p>
                        <p className='text-lg font-bold text-blue-600'>
                          ${day.avgOrderValue}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-xs text-muted-foreground'>
                          Transactions
                        </p>
                        <p className='text-lg font-bold text-orange-600'>
                          {day.frequency}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights List */}
            <div className='space-y-2'>
              <h3 className='text-sm font-semibold'>Key Insights</h3>
              <div className='space-y-2'>
                {patterns.insights.map((insight: string, idx: number) => (
                  <div
                    key={idx}
                    className='flex gap-3 rounded-lg bg-white p-3 dark:bg-slate-800'
                  >
                    <div className='flex-shrink-0'>
                      <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white'>
                        {idx + 1}
                      </div>
                    </div>
                    <p className='text-sm'>{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase Frequency Distribution */}
            <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
              <h3 className='mb-4 text-sm font-semibold'>
                Customer Engagement Overview
              </h3>
              <div className='space-y-3'>
                <div>
                  <div className='mb-1 flex items-center justify-between'>
                    <p className='text-xs font-medium'>Repeat Customers</p>
                    <p className='text-xs text-muted-foreground'>
                      {patterns.patterns.repeatCustomerRate}%
                    </p>
                  </div>
                  <div className='h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
                    <div
                      className='h-2 rounded-full bg-green-500'
                      style={{
                        width: `${patterns.patterns.repeatCustomerRate}%`
                      }}
                    />
                  </div>
                </div>
                <p className='text-xs text-muted-foreground'>
                  {patterns.patterns.repeatCustomerRate}% of customers make
                  multiple purchases, indicating strong engagement
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
