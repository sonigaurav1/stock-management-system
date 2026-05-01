'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

export default function PriceChangeApprovalWidget() {
  const priceRequests = useQuery(api.compliance.getPriceChangeRequests, {
    limit: 50,
    status: undefined
  });
  const approvePriceChange = useMutation(api.compliance.approvePriceChange);
  const rejectPriceChange = useMutation(api.compliance.rejectPriceChange);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await approvePriceChange({
        requestId,
        approvedBy: 'Current User',
        notes: 'Approved'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await rejectPriceChange({
        requestId,
        rejectedBy: 'Current User',
        reason: 'Does not meet pricing strategy'
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (priceRequests === undefined) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-orange-600' />
      </div>
    );
  }

  const data = priceRequests as any;
  const requests = data?.requests || [];
  const summary = data?.summary || {};

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-gray-600'>Total Requests</p>
            <p className='mt-1 text-2xl font-bold'>{summary.total}</p>
          </CardContent>
        </Card>
        <Card className='border-yellow-200 bg-yellow-50'>
          <CardContent className='pt-6'>
            <p className='text-sm font-medium text-yellow-700'>Pending</p>
            <p className='mt-1 text-2xl font-bold text-yellow-600'>
              {summary.pending}
            </p>
          </CardContent>
        </Card>
        <Card className='border-green-200 bg-green-50'>
          <CardContent className='pt-6'>
            <p className='text-sm font-medium text-green-700'>Approved</p>
            <p className='mt-1 text-2xl font-bold text-green-600'>
              {summary.approved}
            </p>
          </CardContent>
        </Card>
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='pt-6'>
            <p className='text-sm font-medium text-red-700'>Rejected</p>
            <p className='mt-1 text-2xl font-bold text-red-600'>
              {summary.rejected}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Price Change Requests */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='h-5 w-5' />
            Price Change Requests
          </CardTitle>
          <CardDescription>Review and approve price changes</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className='py-8 text-center text-gray-500'>
              <p>No price change requests</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className='text-right'>Old Price</TableHead>
                    <TableHead className='text-right'>New Price</TableHead>
                    <TableHead className='text-right'>Change %</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.slice(0, 20).map((req: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className='font-medium'>
                        {req.productName}
                      </TableCell>
                      <TableCell className='text-right'>
                        ₹{req.oldPrice}
                      </TableCell>
                      <TableCell className='text-right font-bold'>
                        ₹{req.newPrice}
                      </TableCell>
                      <TableCell className='text-right'>
                        <span
                          className={
                            req.priceChangePercent > 0
                              ? 'text-red-600'
                              : 'text-green-600'
                          }
                        >
                          {req.priceChangePercent > 0 ? '+' : ''}
                          {req.priceChangePercent?.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className='text-sm'>{req.reason}</TableCell>
                      <TableCell className='text-sm'>
                        {req.requestedBy}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            req.approvalStatus === 'pending'
                              ? 'secondary'
                              : req.approvalStatus === 'approved'
                                ? 'default'
                                : req.approvalStatus === 'rejected'
                                  ? 'destructive'
                                  : 'outline'
                          }
                        >
                          {req.approvalStatus === 'pending' && (
                            <Clock className='mr-1 h-3 w-3' />
                          )}
                          {req.approvalStatus === 'approved' && (
                            <CheckCircle2 className='mr-1 h-3 w-3' />
                          )}
                          {req.approvalStatus === 'rejected' && (
                            <XCircle className='mr-1 h-3 w-3' />
                          )}
                          {req.approvalStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {req.approvalStatus === 'pending' && (
                          <div className='flex gap-2'>
                            <Button
                              size='sm'
                              variant='default'
                              onClick={() => handleApprove(req.id)}
                              disabled={processingId === req.id}
                              className='h-7 text-xs'
                            >
                              {processingId === req.id ? (
                                <Loader2 className='h-3 w-3 animate-spin' />
                              ) : (
                                <CheckCircle2 className='h-3 w-3' />
                              )}
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => handleReject(req.id)}
                              disabled={processingId === req.id}
                              className='h-7 text-xs'
                            >
                              {processingId === req.id ? (
                                <Loader2 className='h-3 w-3 animate-spin' />
                              ) : (
                                <XCircle className='h-3 w-3' />
                              )}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
