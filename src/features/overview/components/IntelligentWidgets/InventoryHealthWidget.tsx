'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InventoryStatus {
  inStock: number;
  lowStock: number;
  outOfStock: number;
  criticalItems: number;
}

interface InventoryHealthWidgetProps {
  status: InventoryStatus;
}

export function InventoryHealthWidget({ status }: InventoryHealthWidgetProps) {
  const total = status.inStock + status.lowStock + status.outOfStock;
  const healthPercentage =
    total > 0 ? ((status.inStock / total) * 100).toFixed(0) : 0;

  return (
    <Card className='col-span-1 md:col-span-2'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Inventory Health</CardTitle>
            <CardDescription>Stock level overview</CardDescription>
          </div>
          <CheckCircle className='h-5 w-5 text-blue-600' />
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <div className='mb-2 flex justify-between text-sm'>
            <span className='font-medium'>Health Score</span>
            <span className='font-bold'>{healthPercentage}%</span>
          </div>
          <div className='h-2 w-full rounded-full bg-gray-200'>
            <div
              className='h-2 rounded-full bg-green-500'
              style={{ width: `${healthPercentage}%` }}
            />
          </div>
        </div>

        <div className='grid grid-cols-3 gap-2 pt-2'>
          <div className='text-center'>
            <Badge variant='outline' className='mb-1 text-xs'>
              <CheckCircle className='mr-1 h-3 w-3' />
              In Stock
            </Badge>
            <p className='text-lg font-bold'>{status.inStock}</p>
          </div>
          <div className='text-center'>
            <Badge variant='outline' className='mb-1 bg-yellow-50 text-xs'>
              <AlertTriangle className='mr-1 h-3 w-3' />
              Low Stock
            </Badge>
            <p className='text-lg font-bold'>{status.lowStock}</p>
          </div>
          <div className='text-center'>
            <Badge variant='outline' className='mb-1 bg-red-50 text-xs'>
              <AlertCircle className='mr-1 h-3 w-3' />
              Out
            </Badge>
            <p className='text-lg font-bold'>{status.outOfStock}</p>
          </div>
        </div>

        {status.criticalItems > 0 && (
          <div className='rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700'>
            🚨 {status.criticalItems} items need immediate attention
          </div>
        )}
      </CardContent>
    </Card>
  );
}
