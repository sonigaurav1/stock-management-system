'use client';

import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingDown, AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

export default function DiscountAuditWidget() {
  const discountData = useQuery(api.compliance.getDiscountAudit, {
    limit: 100,
    minAmount: undefined
  });

  if (discountData === undefined) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-red-600' />
      </div>
    );
  }

  const data = discountData as any;
  const discounts = data?.discounts || [];
  const summary = data?.summary || {};

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-gray-600'>Total Discounts</p>
            <p className='mt-1 text-2xl font-bold'>{summary.total}</p>
          </CardContent>
        </Card>
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='pt-6'>
            <p className='text-sm font-medium text-red-700'>Total Amount</p>
            <p className='mt-1 text-2xl font-bold text-red-600'>
              ₹{(summary.totalAmount || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-gray-600'>Average Discount</p>
            <p className='mt-1 text-2xl font-bold'>
              ₹{(summary.averageDiscount || 0).toFixed(0)}
            </p>
          </CardContent>
        </Card>
        <Card className='border-orange-200 bg-orange-50'>
          <CardContent className='pt-6'>
            <p className='text-sm font-medium text-orange-700'>High Value</p>
            <p className='mt-1 text-2xl font-bold text-orange-600'>
              {summary.highValue}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex justify-around text-xs font-medium'>
              <div className='text-center'>
                <p className='text-gray-600'>%</p>
                <p>{summary.byType?.percentage || 0}</p>
              </div>
              <div className='text-center'>
                <p className='text-gray-600'>Fixed</p>
                <p>{summary.byType?.fixed || 0}</p>
              </div>
              <div className='text-center'>
                <p className='text-gray-600'>Loyalty</p>
                <p>{summary.byType?.loyalty || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discount Records */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingDown className='h-5 w-5' />
            Discount Audit Log
          </CardTitle>
          <CardDescription>
            All discounts given with approval status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {discounts.length === 0 ? (
            <div className='py-8 text-center text-gray-500'>
              <p>No discounts recorded</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead className='text-right'>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Applied By</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discounts.slice(0, 30).map((discount: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className='font-mono text-sm'>
                        {discount.transactionId?.slice(0, 8)}...
                      </TableCell>
                      <TableCell className='text-right font-bold'>
                        ₹{discount.amount}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>{discount.discountType}</Badge>
                      </TableCell>
                      <TableCell className='text-sm'>
                        {discount.reason}
                      </TableCell>
                      <TableCell className='text-sm'>
                        {discount.appliedBy}
                      </TableCell>
                      <TableCell className='text-sm'>
                        {discount.customerName || '-'}
                      </TableCell>
                      <TableCell>
                        {discount.amount > 500 ? (
                          <Badge
                            variant={
                              discount.approvalStatus === 'pending'
                                ? 'secondary'
                                : discount.approvalStatus === 'approved'
                                  ? 'default'
                                  : 'destructive'
                            }
                            className='flex w-fit items-center gap-1'
                          >
                            {discount.approvalStatus === 'pending' && (
                              <AlertTriangle className='h-3 w-3' />
                            )}
                            {discount.approvalStatus}
                          </Badge>
                        ) : (
                          <Badge variant='outline'>Approved</Badge>
                        )}
                      </TableCell>
                      <TableCell className='text-sm'>
                        {new Date(discount.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* High Value Discounts Warning */}
      <Card className='border-orange-200 bg-orange-50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-orange-900'>
            <AlertTriangle className='h-5 w-5' />
            High Value Discounts Alert
          </CardTitle>
        </CardHeader>
        <CardContent className='text-sm text-orange-800'>
          <p>
            {summary.highValue} discounts over ₹500 recorded this period. These
            require approval for compliance tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
