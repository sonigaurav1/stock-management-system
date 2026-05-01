import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

import { TrendingUp, ShoppingCart, Target } from 'lucide-react';

export function UpsellOpportunities() {
  const opportunities = useQuery(
    api.customerIntelligence.findUpsellOpportunities
  );

  if (opportunities === undefined) {
    return (
      <Card className='bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950'>
        <CardHeader>
          <CardTitle>Upsell Opportunities</CardTitle>
          <CardDescription>
            Product recommendations for customers
          </CardDescription>
        </CardHeader>
        <CardContent className='flex h-[400px] items-center justify-center'>
          <div className='py-8 text-center'>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!opportunities.summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upsell Opportunities</CardTitle>
        </CardHeader>
        <CardContent className='text-center text-muted-foreground'>
          No opportunity data available
        </CardContent>
      </Card>
    );
  }

  const avgOpportunityScore =
    opportunities.opportunities.length > 0
      ? Math.round(
          opportunities.opportunities.reduce(
            (sum: number, o: any) => sum + o.recommendations.length * 20,
            0
          ) / opportunities.opportunities.length
        )
      : 0;

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950'>
        <CardHeader>
          <CardTitle>Upsell & Cross-sell Opportunities</CardTitle>
          <CardDescription>
            Identify products customers might want to buy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Summary Stats */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <div className='mb-2 flex items-center gap-2'>
                  <Target className='h-5 w-5 text-blue-500' />
                  <p className='text-sm text-muted-foreground'>
                    Total Opportunities
                  </p>
                </div>
                <p className='text-2xl font-bold'>
                  {opportunities.summary.totalOpportunities}
                </p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  customers with recommendations
                </p>
              </div>

              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <div className='mb-2 flex items-center gap-2'>
                  <ShoppingCart className='h-5 w-5 text-green-500' />
                  <p className='text-sm text-muted-foreground'>
                    Total Potential Revenue
                  </p>
                </div>
                <p className='text-2xl font-bold'>
                  $
                  {(opportunities.summary.totalPotentialRevenue / 1000).toFixed(
                    1
                  )}
                  K
                </p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  from all opportunities
                </p>
              </div>

              <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
                <div className='mb-2 flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5 text-orange-500' />
                  <p className='text-sm text-muted-foreground'>
                    Avg Opportunity Value
                  </p>
                </div>
                <p className='text-2xl font-bold'>
                  ${opportunities.summary.avgOpportunityValue}
                </p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  per customer
                </p>
              </div>
            </div>

            {/* Top Opportunities */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>
                Top Upsell Opportunities
              </h3>
              <div className='max-h-[700px] space-y-2 overflow-y-auto'>
                {opportunities.opportunities
                  .slice(0, 25)
                  .map((opportunity: any, idx: number) => (
                    <div
                      key={opportunity.customerId}
                      className='rounded-lg bg-white p-4 dark:bg-slate-800'
                    >
                      {/* Header */}
                      <div className='mb-3 flex items-start justify-between'>
                        <div>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm font-bold text-blue-600'>
                              #{idx + 1}
                            </span>
                            <p className='font-semibold'>
                              {opportunity.customerName}
                            </p>
                          </div>
                          <p className='mt-1 text-xs text-muted-foreground'>
                            Last purchase: ${opportunity.lastPurchaseValue} •
                            Frequency: {opportunity.purchaseFrequency}x
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='text-sm font-bold text-green-600'>
                            ${opportunity.estimatedUpsellValue}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            Potential value
                          </p>
                        </div>
                      </div>

                      {/* Recommendations Grid */}
                      <div className='space-y-2'>
                        <p className='text-xs font-semibold text-muted-foreground'>
                          Recommended Products
                        </p>
                        <div className='grid grid-cols-2 gap-2 md:grid-cols-5'>
                          {opportunity.recommendations.map(
                            (rec: any, rIdx: number) => (
                              <div
                                key={rIdx}
                                className='rounded border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-2 text-center dark:border-blue-700 dark:from-blue-900 dark:to-cyan-900'
                              >
                                <p className='line-clamp-2 text-xs font-medium'>
                                  {rec.productName}
                                </p>
                                <p className='mt-1 text-xs font-semibold text-blue-600 dark:text-blue-300'>
                                  ${rec.price}
                                </p>
                                <p className='text-xs text-muted-foreground'>
                                  {rec.priceMatch === 'exact'
                                    ? '✓ Match'
                                    : 'Similar'}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Confidence Bar */}
                      <div className='mt-3 border-t border-gray-200 pt-3 dark:border-gray-700'>
                        <div className='mb-1 flex items-center justify-between'>
                          <p className='text-xs font-medium'>
                            Recommendation Confidence
                          </p>
                          <p className='text-xs font-bold'>
                            {Math.round(
                              opportunity.recommendations[0]?.confidence || 0
                            )}
                            %
                          </p>
                        </div>
                        <div className='h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
                          <div
                            className='h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500'
                            style={{
                              width: `${Math.round(opportunity.recommendations[0]?.confidence || 0)}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {opportunities.opportunities.length === 0 && (
                <div className='py-8 text-center'>
                  <ShoppingCart className='mx-auto mb-2 h-12 w-12 text-gray-300' />
                  <p className='text-muted-foreground'>
                    No upsell opportunities available
                  </p>
                </div>
              )}
            </div>

            {/* Strategy Section */}
            <div className='rounded-lg bg-white p-4 dark:bg-slate-800'>
              <h3 className='mb-3 text-sm font-semibold'>
                Upsell Strategy Tips
              </h3>
              <div className='space-y-2'>
                <div className='flex gap-2 text-sm'>
                  <span className='font-bold text-blue-600'>1.</span>
                  <p>
                    Target high-frequency customers with premium products in the
                    same category
                  </p>
                </div>
                <div className='flex gap-2 text-sm'>
                  <span className='font-bold text-blue-600'>2.</span>
                  <p>
                    Focus on customers with growing purchase patterns for best
                    conversion
                  </p>
                </div>
                <div className='flex gap-2 text-sm'>
                  <span className='font-bold text-blue-600'>3.</span>
                  <p>
                    Match recommended product prices to customers' average order
                    values
                  </p>
                </div>
                <div className='flex gap-2 text-sm'>
                  <span className='font-bold text-blue-600'>4.</span>
                  <p>
                    Prioritize customers showing stable or growing spending
                    trends
                  </p>
                </div>
                <div className='flex gap-2 text-sm'>
                  <span className='font-bold text-blue-600'>5.</span>
                  <p>
                    Use bundling opportunities to increase average order value
                  </p>
                </div>
              </div>
            </div>

            {/* Revenue Impact */}
            <div className='rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 p-4 dark:from-green-900 dark:to-emerald-900'>
              <h4 className='mb-2 text-sm font-semibold text-green-900 dark:text-green-100'>
                Potential Revenue Impact
              </h4>
              <p className='text-sm text-green-800 dark:text-green-200'>
                If just 25% of these {opportunities.summary.totalOpportunities}{' '}
                customers purchase recommended items, you could generate an
                additional $
                {Math.round(opportunities.summary.totalPotentialRevenue * 0.25)}{' '}
                in revenue.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
