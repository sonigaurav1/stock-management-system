'use client';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { useUser } from '@clerk/clerk-react';
import { api } from '@/../convex/_generated/api';
import { useQuery } from 'convex/react';
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthenticatedQuery } from '@/features/auth/utils/auth';

export default function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  const { user } = useUser();

  const { currentMonthRevenue, revenuePercentageChange } = useQuery(
    api.analytics.getTotalRevenueWithComparison
  ) ?? {
    currentMonthRevenue: 0,
    revenuePercentageChange: 0
  };
  const {
    currentMonthSalesCount,
    // previousMonthSalesCount,
    salesPercentageChange
  } = useQuery(api.analytics.getTotalSalesWithComparison) ?? {
    currentMonthSalesCount: 0,
    previousMonthSalesCount: 0,
    salesPercentageChange: 0
  };
  const {
    currentMonthCustomerCount,
    // previousMonthCustomerCount,
    customerPercentageChange
  } = useQuery(api.analytics.getTotalCustomersWithComparison) ?? {
    currentMonthCustomerCount: 0,
    previousMonthCustomerCount: 0,
    customerPercentageChange: 0
  };
  const outstandingBalance =
    useAuthenticatedQuery(api.payments.getOutstandingBalance) ?? 0;

  const username = user?.username
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
    : '';

  const [showRevenue, setShowRevenue] = useState(false);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Hi {username}, Welcome back 👋
          </h2>
        </div>
        {/* <div className='flex items-center justify-between space-y-2'>
          <h3 className='text-xl font-semibold'>
            This is Data for Analytics
          </h3>
        </div> */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {/* TODO: split code */}
          <Card className='flex flex-col'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Revenue
              </CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
              </svg>
            </CardHeader>
            <CardContent className='flex flex-col items-start'>
              <div className='flex w-full max-w-full select-none items-center gap-1 text-2xl font-bold transition-all duration-300'>
                <p className='flex h-full items-center justify-center'>
                  Rs.{' '}
                  <span className='flex max-w-full items-center'>
                    {showRevenue ? (
                      formatCurrency(currentMonthRevenue)
                    ) : (
                      <span className='flex max-w-28 items-center'>
                        {Array.from({ length: 7 }).map((_, index) => (
                          <svg
                            key={index}
                            xmlns='http://www.w3.org/2000/svg'
                            width='24'
                            height='24'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className=''
                          >
                            <path d='M12 6v12' />
                            <path d='M17.196 9 6.804 15' />
                            <path d='m6.804 9 10.392 6' />
                          </svg>
                        ))}
                      </span>
                    )}
                  </span>
                </p>
                <span
                  className='cursor-pointer'
                  onClick={() => setShowRevenue((prev) => !prev)}
                >
                  {showRevenue ? (
                    <Eye className='h-4 w-4' />
                  ) : (
                    <EyeOff className='h-4 w-4' />
                  )}
                </span>
              </div>
              <p className='w-full text-left text-xs text-muted-foreground'>
                {revenuePercentageChange?.toFixed(0) ?? 0}% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Customers</CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
              </svg>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                + {formatCurrency(currentMonthCustomerCount)}
              </div>
              <p className='text-xs text-muted-foreground'>
                {customerPercentageChange?.toFixed(0) ?? 0}% since last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Sales</CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <rect width='20' height='14' x='2' y='5' rx='2' />
                <path d='M2 10h20' />
              </svg>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                + {formatCurrency(currentMonthSalesCount)}
              </div>
              <p className='text-xs text-muted-foreground'>
                {salesPercentageChange?.toFixed(0) ?? 0}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>To Receive</CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                <circle cx='9' cy='7' r='4' />
                <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
              </svg>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                +{formatCurrency(outstandingBalance)}
              </div>
              <p className='text-xs text-muted-foreground'>
                Pending amount from customers.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4 md:col-span-3'>
            {/* sales arallel routes */}
            {sales}
          </div>
          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 md:col-span-3'>{pie_stats}</div>
        </div>
      </div>
    </PageContainer>
  );
}
