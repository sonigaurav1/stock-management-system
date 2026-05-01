'use client';

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { TrendingUp, AlertCircle, Target } from 'lucide-react';

export const StockLevelCalculator = () => {
  const [sortBy, setSortBy] = useState<'usage' | 'status' | 'cost'>('usage');

  const stockData = useQuery(
    api.inventoryOptimization.calculateOptimalStockLevel
  );

  if (!stockData) {
    return (
      <div className='py-8 text-center'>Loading stock calculations...</div>
    );
  }

  const products = [...(stockData.products || [])].sort((a: any, b: any) => {
    if (sortBy === 'usage')
      return parseFloat(b.dailyUsage) - parseFloat(a.dailyUsage);
    if (sortBy === 'cost') return b.costPerUnit - a.costPerUnit;
    return a.status.localeCompare(b.status);
  });

  const getStatusColor = (status: string) => {
    if (status === 'reorder_needed') return 'bg-red-50 border-red-200';
    if (status === 'overstocked') return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getStatusText = (status: string) => {
    if (status === 'reorder_needed') return 'Reorder Needed';
    if (status === 'overstocked') return 'Overstocked';
    return 'Optimal';
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-2xl font-bold'>Stock Level Calculator</h2>
        <p className='text-sm text-gray-600'>
          Optimal stock levels calculated using Economic Order Quantity (EOQ)
          analysis
        </p>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <span className='text-sm font-semibold text-gray-600'>
                Total Products
              </span>
              <p className='text-3xl font-bold text-blue-600'>
                {stockData.summary.totalProducts}
              </p>
              <p className='text-xs text-gray-500'>Analyzed for optimization</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <span className='text-sm font-semibold text-gray-600'>
                Need Reordering
              </span>
              <p className='text-3xl font-bold text-red-600'>
                {stockData.summary.productsToReorder}
              </p>
              <p className='text-xs text-gray-500'>Below reorder point</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <span className='text-sm font-semibold text-gray-600'>
                Overstocked
              </span>
              <p className='text-3xl font-bold text-orange-600'>
                {stockData.summary.overstockedProducts}
              </p>
              <p className='text-xs text-gray-500'>Above optimal levels</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sort Controls */}
      <div className='flex items-center justify-between'>
        <label className='text-sm font-semibold'>Sort by:</label>
        <div className='flex gap-2'>
          {(['usage', 'status', 'cost'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                sortBy === sort
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {sort === 'usage'
                ? 'Daily Usage'
                : sort === 'status'
                  ? 'Status'
                  : 'Unit Cost'}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Optimal Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {products.slice(0, 20).map((product: any, idx: number) => (
              <div
                key={idx}
                className={`rounded-lg border-l-4 p-4 ${getStatusColor(product.status)}`}
              >
                <div className='mb-3 flex items-start justify-between'>
                  <div>
                    <p className='font-semibold text-gray-900'>
                      {product.productName}
                    </p>
                    <p className='text-xs text-gray-600'>
                      Daily Usage: {product.dailyUsage} units
                    </p>
                  </div>
                  <span className='rounded-full bg-white px-2 py-1 text-xs font-semibold'>
                    {getStatusText(product.status)}
                  </span>
                </div>

                <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-5'>
                  <div>
                    <p className='text-gray-600'>Current Stock</p>
                    <p className='font-bold text-gray-900'>
                      {product.currentStock}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-600'>Min Level</p>
                    <p className='font-bold text-gray-900'>
                      {product.minStock}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-600'>Reorder Point</p>
                    <p className='font-bold text-red-600'>
                      {product.reorderPoint}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-600'>Max Level</p>
                    <p className='font-bold text-blue-600'>
                      {product.maxStock}
                    </p>
                  </div>
                  <div>
                    <p className='text-gray-600'>Order Qty</p>
                    <p className='font-bold text-green-600'>
                      {product.optimalOrderQuantity}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
