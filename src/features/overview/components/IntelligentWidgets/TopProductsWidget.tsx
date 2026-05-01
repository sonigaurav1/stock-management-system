'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Product {
  name: string;
  sold: number;
  revenue: number;
  growth: number;
}

interface TopProductsWidgetProps {
  products: Product[];
}

export function TopProductsWidget({ products }: TopProductsWidgetProps) {
  return (
    <Card className='col-span-1 md:col-span-3'>
      <CardHeader>
        <CardTitle>Top Performing Products</CardTitle>
        <CardDescription>Best selling products by revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {products.length > 0 ? (
            products.slice(0, 5).map((product, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between border-b pb-2 last:border-b-0'
              >
                <div className='flex-1'>
                  <p className='text-sm font-medium'>{product.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {product.sold} units sold
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='text-right'>
                    <p className='text-sm font-semibold'>
                      Rs. {(product.revenue / 1000).toFixed(1)}k
                    </p>
                    <Badge variant='outline' className='text-xs'>
                      <TrendingUp className='mr-1 h-3 w-3' />
                      {product.growth.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className='py-4 text-center text-sm text-muted-foreground'>
              No product data available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
