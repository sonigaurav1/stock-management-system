import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

import { AlertCircle, TrendingDown, Activity } from 'lucide-react';

const RISK_COLORS = {
  critical: '#dc2626',
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981'
};

const RISK_DESCRIPTIONS = {
  critical: 'Immediate action required - customer likely to leave',
  high: 'High risk of churn - proactive engagement needed',
  medium: 'Moderate risk - monitor closely and nurture',
  low: 'Low risk - maintain current engagement'
};

export function ChurnRiskScoring() {
  const [threshold, setThreshold] = useState(0.5);
  const churnData = useQuery(api.customerIntelligence.scoreChurnRisk, {
    riskThreshold: threshold
  });

  if (churnData === undefined) {
    return (
      <Card className='bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950'>
        <CardHeader>
          <CardTitle>Churn Risk Scoring</CardTitle>
          <CardDescription>
            Identify customers at risk of leaving
          </CardDescription>
        </CardHeader>
        <CardContent className='flex h-[400px] items-center justify-center'>
          <div className='py-8 text-center'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!churnData.summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Churn Risk Scoring</CardTitle>
        </CardHeader>
        <CardContent className='text-center text-muted-foreground'>
          No customer data available
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    {
      risk: 'Critical',
      count: churnData.summary.critical,
      color: RISK_COLORS.critical
    },
    { risk: 'High', count: churnData.summary.high, color: RISK_COLORS.high },
    {
      risk: 'Medium',
      count: churnData.summary.medium,
      color: RISK_COLORS.medium
    }
  ];

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950'>
        <CardHeader>
          <CardTitle>Churn Risk Scoring</CardTitle>
          <CardDescription>
            Identify and understand customers at risk of leaving
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Risk Summary Stats */}
            <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
              <div className='rounded-lg border-l-4 border-red-600 bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>
                  At-Risk Customers
                </p>
                <p className='text-2xl font-bold'>
                  {churnData.summary.totalAtRisk}
                </p>
              </div>
              <div className='rounded-lg border-l-4 border-red-500 bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>Critical Risk</p>
                <p className='text-2xl font-bold text-red-600'>
                  {churnData.summary.critical}
                </p>
              </div>
              <div className='rounded-lg border-l-4 border-orange-500 bg-white p-4 dark:bg-slate-800'>
                <p className='text-sm text-muted-foreground'>
                  Potential Rev Loss
                </p>
                <p className='text-2xl font-bold'>
                  ${(churnData.summary.potentialRevenueLoss / 1000).toFixed(1)}K
                </p>
              </div>
            </div>

            {/* Risk Breakdown */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>Risk Distribution</h3>
              <div className='grid gap-3'>
                {chartData.map((item) => (
                  <div
                    key={item.risk}
                    className='flex items-center justify-between rounded-lg bg-white p-3 dark:bg-slate-800'
                  >
                    <div className='flex items-center gap-3'>
                      <div
                        className='h-3 w-3 rounded-full'
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <p className='font-medium'>{item.risk} Risk</p>
                        <p className='text-xs text-muted-foreground'>
                          {
                            RISK_DESCRIPTIONS[
                              item.risk.toLowerCase() as keyof typeof RISK_DESCRIPTIONS
                            ]
                          }
                        </p>
                      </div>
                    </div>
                    <p className='font-semibold'>{item.count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* At-Risk Customers List */}
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold'>
                  Critical & High Risk Customers
                </h3>
                <span className='rounded bg-red-100 px-2 py-1 text-xs text-red-700 dark:bg-red-900 dark:text-red-300'>
                  {churnData.atRiskCustomers.length} customers
                </span>
              </div>

              <div className='max-h-[600px] space-y-2 overflow-y-auto'>
                {churnData.atRiskCustomers
                  .slice(0, 20)
                  .map((customer: any, idx: number) => (
                    <div
                      key={customer.customerId}
                      className='rounded-lg border-l-4 bg-white p-3 dark:bg-slate-800'
                      style={{
                        borderLeftColor:
                          RISK_COLORS[
                            customer.riskLevel as keyof typeof RISK_COLORS
                          ]
                      }}
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex-1'>
                          <div className='mb-1 flex items-center gap-2'>
                            <p className='text-sm font-medium'>
                              {customer.customerName}
                            </p>
                            <span
                              className='rounded px-2 py-1 text-xs font-semibold'
                              style={{
                                backgroundColor:
                                  RISK_COLORS[
                                    customer.riskLevel as keyof typeof RISK_COLORS
                                  ] + '20',
                                color:
                                  RISK_COLORS[
                                    customer.riskLevel as keyof typeof RISK_COLORS
                                  ]
                              }}
                            >
                              {customer.riskLevel.toUpperCase()}
                            </span>
                          </div>

                          <div className='mb-2 grid grid-cols-3 gap-2 text-xs'>
                            <div>
                              <p className='text-muted-foreground'>
                                Days Since Purchase
                              </p>
                              <p className='font-semibold'>
                                {customer.daysSincePurchase} days
                              </p>
                            </div>
                            <div>
                              <p className='text-muted-foreground'>
                                Last 30 Days
                              </p>
                              <p className='font-semibold'>
                                {customer.last30DayPurchases} purchases
                              </p>
                            </div>
                            <div>
                              <p className='text-muted-foreground'>
                                Avg Order Value
                              </p>
                              <p className='font-semibold'>
                                ${customer.avgOrderValue}
                              </p>
                            </div>
                          </div>

                          {/* Churn Probability Bar */}
                          <div className='mb-2'>
                            <div className='mb-1 flex items-center justify-between'>
                              <p className='text-xs font-medium'>
                                Churn Probability
                              </p>
                              <p className='text-xs font-bold'>
                                {customer.churnProbability}%
                              </p>
                            </div>
                            <div className='h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
                              <div
                                className='h-2 rounded-full transition-all'
                                style={{
                                  width: `${customer.churnProbability}%`,
                                  backgroundColor:
                                    RISK_COLORS[
                                      customer.riskLevel as keyof typeof RISK_COLORS
                                    ]
                                }}
                              />
                            </div>
                          </div>

                          {/* Retention Actions */}
                          <div className='flex flex-wrap gap-1'>
                            {customer.retentionActions
                              .slice(0, 2)
                              .map((action: string, aIdx: number) => (
                                <span
                                  key={aIdx}
                                  className='rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                >
                                  {action}
                                </span>
                              ))}
                          </div>
                        </div>

                        {/* Trend Indicator */}
                        <div className='flex-shrink-0'>
                          <div className='flex items-center gap-1'>
                            <TrendingDown className='h-4 w-4 text-red-500' />
                            <span className='text-xs font-semibold capitalize'>
                              {customer.engagementTrend}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {churnData.atRiskCustomers.length === 0 && (
                <div className='py-8 text-center'>
                  <Activity className='mx-auto mb-2 h-12 w-12 text-green-500 opacity-50' />
                  <p className='text-muted-foreground'>
                    No at-risk customers - great engagement!
                  </p>
                </div>
              )}
            </div>

            {/* Recommended Actions */}
            <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
              <div className='flex items-start gap-3'>
                <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500' />
                <div>
                  <h4 className='mb-2 text-sm font-semibold'>
                    Recommended Actions
                  </h4>
                  <ul className='space-y-1 text-sm text-muted-foreground'>
                    <li>
                      • Send personalized re-engagement offers to critical risk
                      customers
                    </li>
                    <li>
                      • Conduct satisfaction surveys to understand pain points
                    </li>
                    <li>• Offer loyalty rewards or exclusive discounts</li>
                    <li>
                      • Schedule customer success calls with high-value at-risk
                      customers
                    </li>
                    <li>
                      • Create targeted win-back campaigns for inactive
                      customers
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
