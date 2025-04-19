'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { formatIndianCurrency } from '@/lib/utils';
import { api } from '@/../convex/_generated/api';
import { useQuery } from 'convex/react';

export function RecentSales() {
  const { recentSales, totalMonthlySales } = useQuery(
    api.analytics.getRecentSalesAndMonthlyTotal
  ) ?? { recentSales: [], totalMonthlySales: 0 };

  const placeholderImageUrl = '/assets/images/user-placeholder.webp';

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>
          You made {totalMonthlySales} sales this month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {recentSales.map((sale: any) => (
            <div key={sale._id} className='flex items-center'>
              <Avatar className='h-9 w-9'>
                <AvatarImage src={placeholderImageUrl} alt='Avatar' />
                <AvatarFallback>
                  {sale.customerName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='ml-4 space-y-1'>
                <p className='text-sm font-medium leading-none'>
                  {sale?.customerName}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {sale?.customerPhone.join(', ')}
                </p>
              </div>
              <div className='ml-auto font-medium'>
                + Rs.{' '}
                {formatIndianCurrency(sale.sellingPrice * sale.quantitySold)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
