'use client';

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Trash2 } from 'lucide-react';

export const DeadStockIdentification = () => {
  const [thresholdDays, setThresholdDays] = useState(90);

  const deadStockData = useQuery(api.inventoryOptimization.identifyDeadStock, {
    minStockDaysThreshold: thresholdDays
  });

  if (!deadStockData) {
    return (
      <div className='py-8 text-center'>Loading dead stock analysis...</div>
    );
  }

  const getCategoryColor = (category: string) => {
    if (category === 'dead') return 'bg-red-50 border-red-200';
    if (category === 'slow_moving') return 'bg-yellow-50 border-yellow-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getRiskBadgeColor = (risk: string) => {
    if (risk === 'critical') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-2xl font-bold'>Dead Stock Identification</h2>
        <p className='text-sm text-gray-600'>
          Find products that are tying up capital without generating revenue
        </p>
      </div>

      {/* Threshold Selector */}
      <div className='rounded-lg bg-blue-50 p-4'>
        <div className='flex items-center justify-between'>
          <label className='font-semibold text-gray-900'>
            Days without sales threshold:
          </label>
          <div className='flex items-center gap-3'>
            <input
              type='range'
              min='30'
              max='180'
              step='30'
              value={thresholdDays}
              onChange={(e) => setThresholdDays(parseInt(e.target.value))}
              className='w-32'
            />
            <span className='inline-block min-w-fit rounded-lg bg-white px-3 py-1 font-bold'>
              {thresholdDays} days
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card className='border-l-4 border-l-red-600'>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <span className='text-sm font-semibold text-gray-600'>
                Dead Stock Items
              </span>
              <p className='text-3xl font-bold text-red-600'>
                {deadStockData.summary.deadCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <span className='text-sm font-semibold text-gray-600'>
                Slow Moving
              </span>
              <p className='text-3xl font-bold text-orange-600'>
                {deadStockData.summary.slowMovingCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <span className='text-sm font-semibold text-gray-600'>
                Capital Tied Up
              </span>
              <p className='text-2xl font-bold text-red-700'>
                ₹{deadStockData.summary.capitalTiedUp.toLocaleString('en-IN')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <span className='text-sm font-semibold text-gray-600'>
                Action Required
              </span>
              <p className='text-xs text-gray-600'>
                {deadStockData.summary.recommendation}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dead Stock Items */}
      <Card>
        <CardHeader>
          <CardTitle>Dead & Slow-Moving Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {deadStockData.deadStockItems
              .slice(0, 50)
              .map((item: any, idx: number) => (
                <div
                  key={idx}
                  className={`rounded-lg border-l-4 p-4 ${getCategoryColor(item.category)}`}
                >
                  <div className='mb-3 flex items-start justify-between'>
                    <div>
                      <p className='font-bold text-gray-900'>
                        {item.productName}
                      </p>
                      <p className='text-xs text-gray-600'>
                        Last sale: {item.daysSinceLastSale} days ago
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${getRiskBadgeColor(item.riskLevel)}`}
                    >
                      {item.riskLevel.toUpperCase()}
                    </span>
                  </div>

                  <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-5'>
                    <div>
                      <p className='text-gray-600'>Current Stock</p>
                      <p className='font-bold text-gray-900'>
                        {item.currentStock}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-600'>Stock Value</p>
                      <p className='font-bold text-red-600'>
                        ₹{item.stockValue.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-600'>Cost/Unit</p>
                      <p className='font-bold text-gray-900'>
                        ₹{item.costPerUnit}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-600'>Category</p>
                      <p className='font-bold text-gray-900'>
                        {item.category === 'dead'
                          ? 'Dead Stock'
                          : 'Slow Moving'}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-600'>Recommendation</p>
                      <p className='text-xs font-semibold text-gray-900'>
                        {item.recommendation}
                      </p>
                    </div>
                  </div>

                  <div className='mt-3 flex gap-2 border-t border-gray-200 pt-3'>
                    <button className='flex items-center gap-1 rounded-lg bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800 hover:bg-orange-200'>
                      <Trash2 className='h-3 w-3' /> Mark for Review
                    </button>
                    <button className='rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-200'>
                      Promote
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className='border-l-4 border-l-blue-600 bg-blue-50'>
        <CardHeader>
          <CardTitle className='text-lg'>Strategic Recommendation</CardTitle>
        </CardHeader>
        <CardContent className='text-sm text-gray-700'>
          <p className='mb-2'>
            💡 <strong>Action Plan:</strong>{' '}
            {deadStockData.summary.recommendation}
          </p>
          <ul className='space-y-1 text-xs'>
            <li>
              • Consider price reductions or bundling for slow-moving products
            </li>
            <li>• Launch targeted marketing campaigns to clear dead stock</li>
            <li>
              • If items are more than 1 year old, consider discontinuation
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
