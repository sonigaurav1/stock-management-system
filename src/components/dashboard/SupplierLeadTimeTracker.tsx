'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, TrendingUp } from 'lucide-react';

export const SupplierLeadTimeTracker = () => {
  const data = useQuery(api.inventoryOptimization.trackSupplierLeadTimes);

  if (!data) {
    return <div className='py-8 text-center'>Loading supplier data...</div>;
  }

  const getRiskColor = (risk: string) => {
    if (risk === 'high') return 'bg-red-50 border-red-200';
    if (risk === 'medium') return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-2xl font-bold'>Supplier Lead Time Tracking</h2>
        <p className='text-sm text-gray-600'>
          Monitor supplier performance and delivery reliability
        </p>
      </div>

      {/* Summary */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <span className='text-sm font-semibold text-gray-600'>
                Total Suppliers
              </span>
              <p className='text-3xl font-bold text-blue-600'>
                {data.summary.totalSuppliers}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <span className='text-sm font-semibold text-gray-600'>
                Avg Lead Time
              </span>
              <p className='text-3xl font-bold text-blue-600'>
                {data.summary.avgLeadTimeAcross} days
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-red-600'>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <span className='text-sm font-semibold text-gray-600'>
                High Risk
              </span>
              <p className='text-3xl font-bold text-red-600'>
                {data.summary.highRiskSuppliers}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <span className='text-sm font-semibold text-gray-600'>
                Top Performer
              </span>
              <p className='text-sm font-bold text-gray-900'>
                {data.summary.topPerformers[0]?.supplierName || 'N/A'}
              </p>
              <div className='mt-1 flex gap-1'>
                {getRatingStars(
                  parseFloat(data.summary.topPerformers[0]?.rating || '0')
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Grid */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {data.suppliers.map((supplier: any, idx: number) => (
          <Card
            key={idx}
            className={`border-l-4 ${getRiskColor(supplier.riskLevel)}`}
          >
            <CardContent className='pt-6'>
              <div className='space-y-4'>
                {/* Header */}
                <div className='flex items-start justify-between'>
                  <div>
                    <p className='font-bold text-gray-900'>
                      {supplier.supplierName}
                    </p>
                    <div className='mt-1 flex gap-1'>
                      {getRatingStars(parseFloat(supplier.rating))}
                      <span className='ml-2 text-xs font-semibold text-gray-600'>
                        {supplier.rating}/5
                      </span>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      supplier.riskLevel === 'high'
                        ? 'bg-red-100 text-red-800'
                        : supplier.riskLevel === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {supplier.riskLevel.toUpperCase()}
                  </span>
                </div>

                {/* Lead Time Metrics */}
                <div className='space-y-2 border-t pt-3'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-gray-600'>Avg Lead Time:</span>
                    <span className='font-bold text-gray-900'>
                      {supplier.avgLeadTimeDays} days
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-gray-600'>Range:</span>
                    <span className='text-xs text-gray-600'>
                      {supplier.minLeadTimeDays} - {supplier.maxLeadTimeDays}{' '}
                      days
                    </span>
                  </div>
                </div>

                {/* Delivery Performance */}
                <div className='space-y-2 border-t pt-3'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-gray-600'>On-Time %:</span>
                    <span className='font-bold text-green-600'>
                      {supplier.onTimePercentage}%
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-xs text-gray-600'>
                    <span>{supplier.onTimeDeliveries} on-time</span>
                    <span>{supplier.lateDeliveries} late</span>
                    <span>({supplier.totalDeliveries} total)</span>
                  </div>
                </div>

                {/* Order Data */}
                <div className='flex items-center justify-between border-t pt-3 text-sm'>
                  <span className='text-gray-600'>Avg Order:</span>
                  <span className='font-bold text-gray-900'>
                    ₹{supplier.avgOrderValue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights */}
      <Card className='bg-blue-50'>
        <CardHeader>
          <CardTitle className='text-lg'>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm text-gray-700'>
          <p>
            ✓ <strong>Reliable Suppliers:</strong>{' '}
            {data.summary.totalSuppliers - data.summary.highRiskSuppliers}{' '}
            suppliers have consistent delivery
          </p>
          <p>
            ⚠ <strong>Review Needed:</strong> {data.summary.highRiskSuppliers}{' '}
            suppliers require performance review
          </p>
          <p>
            💡 <strong>Recommendation:</strong> Prioritize orders from top
            performers and consider backup suppliers for high-risk vendors
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
