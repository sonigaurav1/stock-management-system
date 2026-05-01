'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/../convex/_generated/api';
import { useQuery } from 'convex/react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export function RecentSales() {
  const [page, setPage] = useState(0);
  const [allSales, setAllSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    recentSales = [],
    hasMore = false,
    totalMonthlySales = 0
  } = useQuery(api.analytics.getRecentSalesAndMonthlyTotal, {
    page,
    pageSize: 5
  }) ?? { recentSales: [], hasMore: false, totalMonthlySales: 0 };

  // Update allSales when recentSales changes
  useEffect(() => {
    if (recentSales && recentSales.length > 0) {
      if (page === 0) {
        setAllSales(recentSales);
      } else {
        setAllSales((prev) => [...prev, ...recentSales]);
      }
      setLoading(false);
    }
  }, [recentSales, page]);

  const loadMore = () => {
    if (hasMore) {
      setLoading(true);
      setPage((prevPage) => prevPage + 1);
    }
  };

  const placeholderImageUrl = '/assets/images/user-placeholder.webp';

  return (
    <Card className='h-full w-full'>
      <CardHeader className='px-4 sm:px-6'>
        <CardTitle className='text-lg sm:text-xl'>Recent Sales</CardTitle>
        <CardDescription className='text-sm'>
          You made {totalMonthlySales} sales this month.
        </CardDescription>
      </CardHeader>
      <CardContent className='px-4 pb-0 sm:pl-6'>
        <ScrollArea className='h-[300px] pr-3 sm:h-[350px] md:h-[330px]'>
          <div className='space-y-6'>
            {allSales.map((sale: any) => (
              <div key={sale._id} className='flex items-center gap-2 sm:gap-4'>
                <Avatar className='h-8 w-8 sm:h-9 sm:w-9'>
                  <AvatarImage
                    src={placeholderImageUrl || '/placeholder.svg'}
                    alt='Avatar'
                  />
                  <AvatarFallback>
                    {sale.customerName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='space-y-0.5 sm:space-y-1'>
                  <p className='text-xs font-medium leading-none sm:text-sm'>
                    {sale?.customerName}
                  </p>
                  <p className='max-w-[100px] truncate text-xs text-muted-foreground sm:max-w-full'>
                    {sale?.customerPhone.join(', ')}
                  </p>
                </div>
                <div className='ml-auto text-xs font-medium sm:text-sm'>
                  {formatCurrency(sale.sellingPrice * sale.quantitySold)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        {/* <div>Hi</div> */}
      </CardContent>
      <CardFooter className='flex justify-center p-0 pb-2'>
        {hasMore && (
          <Button
            variant='link'
            size='sm'
            className='text-xs text-blue-500 sm:text-sm'
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className='mr-2 h-3 w-3 animate-spin' /> Loading...
              </>
            ) : (
              'More'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
