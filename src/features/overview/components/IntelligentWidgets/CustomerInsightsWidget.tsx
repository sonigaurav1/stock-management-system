'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Users, UserPlus, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CustomerInsightsWidgetProps {
  totalCustomers: number;
  newCustomers: number;
  growth: number;
  retention: number;
}

export function CustomerInsightsWidget({
  totalCustomers,
  newCustomers,
  growth,
  retention
}: CustomerInsightsWidgetProps) {
  return (
    <Card className='col-span-1 md:col-span-2'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Customer Insights</CardTitle>
            <CardDescription>Customer base analytics</CardDescription>
          </div>
          <Users className='h-5 w-5 text-purple-600' />
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-3'>
          <div className='rounded-lg bg-blue-50 p-3'>
            <p className='mb-1 text-xs text-muted-foreground'>
              Total Customers
            </p>
            <p className='text-2xl font-bold'>{totalCustomers}</p>
          </div>
          <div className='rounded-lg bg-green-50 p-3'>
            <div className='mb-1 flex items-center justify-between'>
              <p className='text-xs text-muted-foreground'>New This Month</p>
              <UserPlus className='h-3 w-3 text-green-600' />
            </div>
            <p className='text-2xl font-bold text-green-600'>+{newCustomers}</p>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3 border-t pt-2'>
          <div>
            <Badge variant='outline' className='mb-2 text-xs'>
              <TrendingUp className='mr-1 h-3 w-3' />
              Growth Rate
            </Badge>
            <p className='text-xl font-bold text-green-600'>
              {growth.toFixed(1)}%
            </p>
          </div>
          <div>
            <Badge variant='outline' className='mb-2 text-xs'>
              Retention Rate
            </Badge>
            <p className='text-xl font-bold text-blue-600'>
              {retention.toFixed(0)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
