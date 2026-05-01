'use client';

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';

export const ReorderRecommendations = () => {
  const [filterPriority, setFilterPriority] = useState<
    'all' | 'urgent' | 'high'
  >('urgent');

  const data = useQuery(api.inventoryOptimization.getReorderRecommendations);

  if (!data) {
    return <div className='py-8 text-center'>Loading reorder data...</div>;
  }

  const filtered =
    filterPriority === 'all'
      ? data.recommendations
      : data.recommendations.filter((r: any) => r.priority === filterPriority);

  const getPriorityColor = (priority: string) => {
    if (priority === 'urgent') return 'bg-red-50 border-red-200';
    if (priority === 'high') return 'bg-orange-50 border-orange-200';
    if (priority === 'medium') return 'bg-yellow-50 border-yellow-200';
    return 'bg-blue-50 border-blue-200';
  };

  const getPriorityBadgeColor = (priority: string) => {
    if (priority === 'urgent') return 'bg-red-100 text-red-800';
    if (priority === 'high') return 'bg-orange-100 text-orange-800';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing')
      return <TrendingUp className='h-4 w-4 text-green-600' />;
    if (trend === 'declining')
      return <TrendingDown className='h-4 w-4 text-orange-600' />;
    return <div className='h-4 w-4' />;
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-2xl font-bold'>Reorder Recommendations</h2>
        <p className='text-sm text-gray-600'>
          Smart suggestions for what to order, when, and how much
        </p>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <span className='text-sm font-semibold text-gray-600'>
                Total Recommendations
              </span>
              <p className='text-3xl font-bold text-blue-600'>
                {data.summary.totalRecommendations}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-red-600'>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <span className='text-sm font-semibold text-gray-600'>
                Urgent Orders
              </span>
              <p className='text-3xl font-bold text-red-600'>
                {data.summary.urgentCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <span className='text-sm font-semibold text-gray-600'>
                Total Reorder Cost
              </span>
              <p className='text-2xl font-bold text-green-600'>
                ₹{data.summary.totalReorderCost.toLocaleString('en-IN')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <span className='text-sm font-semibold text-gray-600'>
                Inventory Cost
              </span>
              <p className='text-2xl font-bold text-orange-600'>
                ₹{data.summary.estimatedInventoryCost.toLocaleString('en-IN')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Filter */}
      <div className='flex gap-2'>
        {['all', 'urgent', 'high'].map((priority) => (
          <button
            key={priority}
            onClick={() => setFilterPriority(priority as any)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              filterPriority === priority
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            {priority === 'all'
              ? 'All'
              : priority === 'urgent'
                ? '🚨 Urgent'
                : '⚠️ High'}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className='space-y-3'>
        {filtered.slice(0, 30).map((rec: any, idx: number) => (
          <div
            key={idx}
            className={`rounded-lg border-l-4 p-4 ${getPriorityColor(rec.priority)}`}
          >
            <div className='mb-3 flex items-start justify-between'>
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <p className='font-bold text-gray-900'>{rec.productName}</p>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${getPriorityBadgeColor(rec.priority)}`}
                  >
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
                <p className='mt-1 text-xs text-gray-600'>{rec.supplier}</p>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                {getTrendIcon(rec.trend)}
                <span className='text-xs text-gray-600'>{rec.trend}</span>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-6'>
              <div>
                <p className='text-gray-600'>Current Stock</p>
                <p className='font-bold text-gray-900'>{rec.currentStock}</p>
              </div>
              <div>
                <p className='text-gray-600'>Daily Usage</p>
                <p className='font-bold text-gray-900'>{rec.dailyUsage}</p>
              </div>
              <div>
                <p className='text-gray-600'>Reorder Point</p>
                <p className='font-bold text-red-600'>{rec.reorderPoint}</p>
              </div>
              <div>
                <p className='text-gray-600'>Recommended Qty</p>
                <p className='font-bold text-green-600'>{rec.recommendedQty}</p>
              </div>
              <div>
                <p className='text-gray-600'>Lead Time</p>
                <p className='font-bold text-blue-600'>
                  {rec.leadTimeDays} days
                </p>
              </div>
              <div>
                <p className='text-gray-600'>Days Until Stockout</p>
                <p
                  className={`font-bold ${rec.daysUntilStockout < 7 ? 'text-red-600' : 'text-orange-600'}`}
                >
                  {rec.daysUntilStockout} days
                </p>
              </div>
            </div>

            <div className='mt-3 flex items-center justify-between border-t border-gray-200 pt-3'>
              <p className='text-xs text-gray-600'>
                Total Cost:{' '}
                <span className='font-bold'>
                  ₹{rec.totalReorderCost.toLocaleString('en-IN')}
                </span>
              </p>
              <button className='rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700'>
                Create PO
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <Card>
            <CardContent className='py-8 text-center'>
              <p className='text-gray-600'>
                No {filterPriority} priority reorders at this time
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
