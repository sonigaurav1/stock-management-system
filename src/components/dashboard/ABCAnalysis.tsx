'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle } from 'lucide-react';

export const ABCAnalysis = () => {
  const data = useQuery(api.inventoryOptimization.performABCAnalysis);

  if (!data) {
    return <div className='py-8 text-center'>Loading ABC analysis...</div>;
  }

  const classA = data.abcAnalysis.filter((p: any) => p.classification === 'A');
  const classB = data.abcAnalysis.filter((p: any) => p.classification === 'B');
  const classC = data.abcAnalysis.filter((p: any) => p.classification === 'C');

  const getClassColor = (classification: string) => {
    if (classification === 'A') return 'bg-green-50 border-green-200';
    if (classification === 'B') return 'bg-blue-50 border-blue-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getClassEmoji = (classification: string) => {
    if (classification === 'A') return '🌟';
    if (classification === 'B') return '⭐';
    return '📦';
  };

  const getClassDescription = (classification: string) => {
    if (classification === 'A')
      return 'High-value products - tight inventory control';
    if (classification === 'B')
      return 'Medium-value products - moderate attention';
    return 'Low-value products - consider consolidation';
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-2xl font-bold'>ABC Inventory Analysis</h2>
        <p className='text-sm text-gray-600'>
          Pareto principle: 20% of products generate 80% of revenue
        </p>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Card className='border-l-4 border-l-green-600'>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <p className='text-2xl font-bold'>{getClassEmoji('A')} Class A</p>
              <p className='text-3xl font-bold text-green-600'>
                {data.summary.classA.count}
              </p>
              <p className='text-xs text-gray-600'>products</p>
              <div className='mt-3 space-y-1 border-t pt-3 text-sm'>
                <p>
                  Revenue:{' '}
                  <span className='font-bold'>
                    ₹{data.summary.classA.revenue.toLocaleString('en-IN')}
                  </span>
                </p>
                <p>
                  Inventory:{' '}
                  <span className='font-bold'>
                    ₹
                    {data.summary.classA.inventoryValue.toLocaleString('en-IN')}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-blue-600'>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <p className='text-2xl font-bold'>{getClassEmoji('B')} Class B</p>
              <p className='text-3xl font-bold text-blue-600'>
                {data.summary.classB.count}
              </p>
              <p className='text-xs text-gray-600'>products</p>
              <div className='mt-3 space-y-1 border-t pt-3 text-sm'>
                <p>
                  Revenue:{' '}
                  <span className='font-bold'>
                    ₹{data.summary.classB.revenue.toLocaleString('en-IN')}
                  </span>
                </p>
                <p>
                  Inventory:{' '}
                  <span className='font-bold'>
                    ₹
                    {data.summary.classB.inventoryValue.toLocaleString('en-IN')}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-gray-600'>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <p className='text-2xl font-bold'>{getClassEmoji('C')} Class C</p>
              <p className='text-3xl font-bold text-gray-600'>
                {data.summary.classC.count}
              </p>
              <p className='text-xs text-gray-600'>products</p>
              <div className='mt-3 space-y-1 border-t pt-3 text-sm'>
                <p>
                  Revenue:{' '}
                  <span className='font-bold'>
                    ₹{data.summary.classC.revenue.toLocaleString('en-IN')}
                  </span>
                </p>
                <p>
                  Inventory:{' '}
                  <span className='font-bold'>
                    ₹
                    {data.summary.classC.inventoryValue.toLocaleString('en-IN')}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Details */}
      {[
        { class: 'A', products: classA, color: 'green', maxShow: 15 },
        { class: 'B', products: classB, color: 'blue', maxShow: 15 },
        { class: 'C', products: classC, color: 'gray', maxShow: 15 }
      ].map(({ class: classification, products, color, maxShow }) => (
        <Card key={classification}>
          <CardHeader>
            <CardTitle className='text-lg'>
              {getClassEmoji(classification)} Class {classification} Products
            </CardTitle>
            <p className='text-sm text-gray-600'>
              {getClassDescription(classification)}
            </p>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {products.slice(0, maxShow).map((product: any, idx: number) => (
                <div
                  key={idx}
                  className={`rounded-lg border-l-4 p-3 ${getClassColor(product.classification)}`}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <p className='font-bold text-gray-900'>
                        {product.productName}
                      </p>
                      <p className='text-xs text-gray-600'>
                        {product.transactionCount} transactions
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-xs text-gray-600'>Revenue %</p>
                      <p className='text-lg font-bold text-gray-900'>
                        {product.revenuePercentage}%
                      </p>
                    </div>
                  </div>

                  <div className='mt-2 grid grid-cols-2 gap-2 border-t pt-2 text-xs md:grid-cols-4'>
                    <div>
                      <span className='text-gray-600'>Revenue</span>
                      <p className='font-bold'>
                        ₹{product.revenue180Day.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <span className='text-gray-600'>Stock Value</span>
                      <p className='font-bold'>
                        ₹{product.inventoryValue.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <span className='text-gray-600'>Margin</span>
                      <p className='font-bold text-green-600'>
                        {product.margin}%
                      </p>
                    </div>
                    <div>
                      <span className='text-gray-600'>Cumulative</span>
                      <p className='font-bold'>
                        {product.cumulativePercentage}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {products.length > maxShow && (
                <p className='text-center text-xs text-gray-600'>
                  +{products.length - maxShow} more products
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Strategic Recommendations */}
      <Card className='border-l-4 border-l-blue-600 bg-blue-50'>
        <CardHeader>
          <CardTitle className='text-lg'>Strategic Recommendations</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm text-gray-700'>
          {data.insights.map((insight: string, idx: number) => (
            <p key={idx}>• {insight}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
