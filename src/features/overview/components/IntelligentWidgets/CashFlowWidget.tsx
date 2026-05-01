'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface CashFlowWidgetProps {
  outstanding: number;
  payable: number;
  netCashFlow: number;
}

export function CashFlowWidget({
  outstanding,
  payable,
  netCashFlow
}: CashFlowWidgetProps) {
  const netPositive = netCashFlow >= 0;

  return (
    <Card className='col-span-1 md:col-span-2'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Cash Flow Status</CardTitle>
            <CardDescription>Financial health snapshot</CardDescription>
          </div>
          <Wallet className='h-5 w-5 text-amber-600' />
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='grid grid-cols-2 gap-2'>
          <div className='rounded-lg border bg-green-50 p-3'>
            <div className='mb-1 flex items-center gap-1'>
              <ArrowUpRight className='h-3 w-3 text-green-600' />
              <p className='text-xs text-muted-foreground'>To Receive</p>
            </div>
            <p className='font-bold text-green-700'>
              {formatCurrency(outstanding)}
            </p>
          </div>
          <div className='rounded-lg border bg-red-50 p-3'>
            <div className='mb-1 flex items-center gap-1'>
              <ArrowDownLeft className='h-3 w-3 text-red-600' />
              <p className='text-xs text-muted-foreground'>To Pay</p>
            </div>
            <p className='font-bold text-red-700'>{formatCurrency(payable)}</p>
          </div>
        </div>

        <div
          className={`rounded-lg border-2 p-3 ${netPositive ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
        >
          <p className='mb-1 text-xs text-muted-foreground'>
            Net Cash Position
          </p>
          <div className='flex items-center justify-between'>
            <p
              className={`text-2xl font-bold ${netPositive ? 'text-green-700' : 'text-red-700'}`}
            >
              {formatCurrency(Math.abs(netCashFlow))}
            </p>
            <Badge
              className={
                netPositive
                  ? 'bg-green-200 text-green-800'
                  : 'bg-red-200 text-red-800'
              }
            >
              {netPositive ? '✓ Positive' : '⚠️ Negative'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
