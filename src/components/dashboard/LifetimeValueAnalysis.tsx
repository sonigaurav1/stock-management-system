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
  ScatterChart,
  Scatter
} from 'recharts';

const TIER_COLORS = {
  platinum: '#10b981',
  gold: '#f59e0b',
  silver: '#8b5cf6',
  bronze: '#6b7280'
};

const TIER_DESCRIPTIONS = {
  platinum: 'Top tier customers - $10k+ LTV',
  gold: 'High value customers - $5k-$10k LTV',
  silver: 'Medium value customers - $1k-$5k LTV',
  bronze: 'Entry level customers - <$1k LTV'
};

export function LifetimeValueAnalysis() {
  const ltv = useQuery(api.customerIntelligence.calculateLifetimeValue);

  if (ltv === undefined) {
    return (
      <Card className='bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950'>
        <CardHeader>
          <CardTitle>Customer Lifetime Value</CardTitle>
          <CardDescription>LTV analysis and customer tiers</CardDescription>
        </CardHeader>
        <CardContent className='flex h-[400px] items-center justify-center'>
          <div className='py-8 text-center'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!ltv.summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Lifetime Value</CardTitle>
        </CardHeader>
        <CardContent className='text-center text-muted-foreground'>
          No customer data available
        </CardContent>
      </Card>
    );
  }

  // Prepare data for tier distribution chart
  const tierData = [
    { tier: 'Platinum', count: ltv.summary.tierBreakdown.platinum, value: 0 },
    { tier: 'Gold', count: ltv.summary.tierBreakdown.gold, value: 0 },
    { tier: 'Silver', count: ltv.summary.tierBreakdown.silver, value: 0 },
    { tier: 'Bronze', count: ltv.summary.tierBreakdown.bronze, value: 0 }
  ];

  // Calculate total LTV by tier
  ltv.customers.forEach((customer: any) => {
    const tierIndex = tierData.findIndex(
      (t) => t.tier.toLowerCase() === customer.tier
    );
    if (tierIndex >= 0) {
      tierData[tierIndex].value += customer.predictedLTV;
    }
  });

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950'>
        <CardHeader>
          <CardTitle>Customer Lifetime Value</CardTitle>
          <CardDescription>
            LTV analysis, customer tiers, and value predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Summary Stats */}
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Total LTV</p>
                <p className='text-2xl font-bold'>
                  ${(ltv.summary.totalLTV / 1000).toFixed(1)}K
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>
                  Avg LTV per Customer
                </p>
                <p className='text-2xl font-bold'>${ltv.summary.avgLTV}</p>
              </div>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>
                  Top 10 Customer %
                </p>
                <p className='text-2xl font-bold'>
                  {ltv.summary.top10Percentage}%
                </p>
              </div>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Total Customers</p>
                <p className='text-2xl font-bold'>
                  {ltv.summary.totalCustomers}
                </p>
              </div>
            </div>

            {/* Tier Distribution Chart */}
            <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
              <h3 className='mb-4 text-sm font-semibold'>
                Customer Tier Distribution
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={tierData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='tier' />
                  <YAxis
                    yAxisId='left'
                    label={{
                      value: 'Count',
                      angle: -90,
                      position: 'insideLeft'
                    }}
                  />
                  <YAxis
                    yAxisId='right'
                    orientation='right'
                    label={{
                      value: 'LTV Value',
                      angle: 90,
                      position: 'insideRight'
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId='left'
                    dataKey='count'
                    fill='#3b82f6'
                    name='Customer Count'
                  />
                  <Bar
                    yAxisId='right'
                    dataKey='value'
                    fill='#10b981'
                    name='Total LTV'
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tier Details */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>Customer Tiers</h3>
              <div className='grid gap-3'>
                {Object.entries(ltv.summary.tierBreakdown).map(
                  ([tier, count]) => (
                    <div
                      key={tier}
                      className='flex items-center justify-between rounded-lg bg-white p-3 dark:bg-slate-800'
                    >
                      <div className='flex items-center gap-3'>
                        <div
                          className='h-3 w-3 rounded-full'
                          style={{
                            backgroundColor:
                              TIER_COLORS[tier as keyof typeof TIER_COLORS]
                          }}
                        />
                        <div>
                          <p className='font-medium capitalize'>{tier}</p>
                          <p className='text-xs text-muted-foreground'>
                            {
                              TIER_DESCRIPTIONS[
                                tier as keyof typeof TIER_DESCRIPTIONS
                              ]
                            }
                          </p>
                        </div>
                      </div>
                      <p className='font-semibold'>{count}</p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Top LTV Customers */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>Top Customers by LTV</h3>
              <div className='max-h-[400px] space-y-2 overflow-y-auto'>
                {ltv.customers
                  .slice(0, 15)
                  .map((customer: any, idx: number) => (
                    <div
                      key={customer.customerId}
                      className='flex items-center justify-between rounded-lg bg-white p-3 text-sm dark:bg-slate-800'
                    >
                      <div>
                        <div className='flex items-center gap-2'>
                          <span className='text-xs font-bold text-muted-foreground'>
                            #{idx + 1}
                          </span>
                          <p className='font-medium'>{customer.customerName}</p>
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          {customer.purchaseCount} purchases • $
                          {customer.avgOrderValue}/order
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='font-semibold text-green-600'>
                          ${customer.predictedLTV}
                        </p>
                        <p className='text-xs capitalize'>{customer.tier}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Trend Indicators */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>Customer Trends</h3>
              <div className='grid grid-cols-3 gap-3'>
                {['growing', 'stable', 'declining'].map((trend) => {
                  const count = ltv.customers.filter(
                    (c: any) => c.trend === trend
                  ).length;
                  const percentage = Math.round(
                    (count / ltv.customers.length) * 100
                  );
                  return (
                    <div
                      key={trend}
                      className='rounded-lg bg-white p-3 text-center dark:bg-slate-800'
                    >
                      <p className='text-xs capitalize text-muted-foreground'>
                        {trend}
                      </p>
                      <p className='text-2xl font-bold'>{percentage}%</p>
                      <p className='text-xs'>{count} customers</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
