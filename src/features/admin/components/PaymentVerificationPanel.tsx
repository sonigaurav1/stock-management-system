'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  Smartphone,
  CreditCard,
  AlertCircle,
  Download,
  Search,
  Filter
} from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export const PaymentVerificationPanel = () => {
  const { toast } = useToast();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'verified' | 'rejected'
  >('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Query pending payments
  const pendingPayments = useQuery(api.billing.getPendingPayments);
  // Mutation to verify payment
  const verifyPayment = useMutation(api.billing.verifyPayment);

  const handleVerifyPayment = async (approved: boolean) => {
    if (!selectedPayment) return;

    try {
      await verifyPayment({
        paymentId: selectedPayment._id,
        approved,
        rejectionReason: approved ? undefined : rejectionReason || undefined
      });

      toast({
        title: approved ? 'Payment verified' : 'Payment rejected',
        description: approved
          ? 'User subscription has been upgraded to premium'
          : 'Payment has been rejected and user notified'
      });

      setIsReviewModalOpen(false);
      setSelectedPayment(null);
      setRejectionReason('');
    } catch (error) {
      toast({
        title: 'Action failed',
        description: 'Failed to process payment. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const filteredPayments =
    pendingPayments?.filter((payment) => {
      const matchesStatus =
        filterStatus === 'all' || payment.paymentStatus === filterStatus;
      const matchesSearch =
        searchQuery === '' ||
        payment.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.transactionId
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className='bg-yellow-100 text-yellow-800'>Pending</Badge>;
      case 'verified':
        return <Badge className='bg-green-100 text-green-800'>Verified</Badge>;
      case 'rejected':
        return <Badge className='bg-red-100 text-red-800'>Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Payment Verification</h2>
          <p className='text-muted-foreground'>
            Review and verify manual QR payments for subscription upgrades
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='text-lg'>
            {pendingPayments?.filter((p) => p.paymentStatus === 'pending')
              .length || 0}{' '}
            Pending
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search by user ID or transaction ID...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
            <div className='flex items-center gap-2'>
              <Filter className='h-4 w-4 text-muted-foreground' />
              <Select
                value={filterStatus}
                onValueChange={(value: any) => setFilterStatus(value)}
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='verified'>Verified</SelectItem>
                  <SelectItem value='rejected'>Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment List */}
      <div className='space-y-4'>
        {filteredPayments.length === 0 ? (
          <Card>
            <CardContent className='flex flex-col items-center justify-center p-12'>
              <CreditCard className='mb-4 h-12 w-12 text-muted-foreground' />
              <p className='text-lg font-medium'>No payments found</p>
              <p className='text-sm text-muted-foreground'>
                {filterStatus === 'pending'
                  ? 'No pending payments to review'
                  : 'No payments match your filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPayments.map((payment) => (
            <Card
              key={payment._id}
              className='transition-shadow hover:shadow-md'
            >
              <CardContent className='p-6'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1 space-y-4'>
                    {/* User Info */}
                    <div className='flex items-center gap-3'>
                      <div className='rounded-full bg-blue-100 p-2 dark:bg-blue-950'>
                        <Smartphone className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                      </div>
                      <div>
                        <p className='font-medium'>User ID: {payment.userId}</p>
                        <p className='text-sm text-muted-foreground'>
                          Submitted on{' '}
                          {new Date(payment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                      <div>
                        <p className='text-sm text-muted-foreground'>Amount</p>
                        <p className='font-semibold'>₹{payment.amount}</p>
                      </div>
                      <div>
                        <p className='text-sm text-muted-foreground'>Period</p>
                        <p className='font-semibold capitalize'>
                          {payment.period}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-muted-foreground'>Method</p>
                        <p className='font-semibold capitalize'>
                          {payment.paymentMethod}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-muted-foreground'>Status</p>
                        {getStatusBadge(payment.paymentStatus)}
                      </div>
                    </div>

                    {/* Transaction Info */}
                    {payment.transactionId && (
                      <div>
                        <p className='text-sm text-muted-foreground'>
                          Transaction ID
                        </p>
                        <p className='font-mono text-sm'>
                          {payment.transactionId}
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {payment.notes && (
                      <div>
                        <p className='text-sm text-muted-foreground'>Notes</p>
                        <p className='text-sm'>{payment.notes}</p>
                      </div>
                    )}

                    {/* Receipt */}
                    {payment.receiptImageUrl && (
                      <div>
                        <p className='mb-2 text-sm text-muted-foreground'>
                          Receipt Screenshot
                        </p>
                        <div className='flex items-center gap-2'>
                          <Button variant='outline' size='sm'>
                            <Eye className='mr-2 h-4 w-4' />
                            View Receipt
                          </Button>
                          <Button variant='outline' size='sm'>
                            <Download className='mr-2 h-4 w-4' />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {payment.paymentStatus === 'rejected' &&
                      payment.rejectionReason && (
                        <div className='rounded-lg bg-red-50 p-3 dark:bg-red-950'>
                          <div className='flex items-start gap-2'>
                            <AlertCircle className='mt-0.5 h-4 w-4 text-red-600' />
                            <div>
                              <p className='text-sm font-medium text-red-900 dark:text-red-100'>
                                Rejection Reason
                              </p>
                              <p className='text-sm text-red-700 dark:text-red-300'>
                                {payment.rejectionReason}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Actions */}
                  {payment.paymentStatus === 'pending' && (
                    <div className='flex flex-col gap-2'>
                      <Button
                        className='bg-green-600 hover:bg-green-700'
                        onClick={() => {
                          setSelectedPayment(payment);
                          setIsReviewModalOpen(true);
                        }}
                      >
                        <CheckCircle2 className='mr-2 h-4 w-4' />
                        Verify
                      </Button>
                      <Button
                        variant='destructive'
                        onClick={() => {
                          setSelectedPayment(payment);
                          setIsReviewModalOpen(true);
                        }}
                      >
                        <XCircle className='mr-2 h-4 w-4' />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Payment</DialogTitle>
            <DialogDescription>
              Review the payment details and choose to verify or reject
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className='space-y-4'>
              <Card>
                <CardContent className='space-y-3 p-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p className='text-sm text-muted-foreground'>Amount</p>
                      <p className='font-semibold'>₹{selectedPayment.amount}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Period</p>
                      <p className='font-semibold capitalize'>
                        {selectedPayment.period}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Method</p>
                      <p className='font-semibold capitalize'>
                        {selectedPayment.paymentMethod}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Transaction ID
                      </p>
                      <p className='font-mono text-sm'>
                        {selectedPayment.transactionId || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {selectedPayment.receiptImageUrl && (
                    <div>
                      <p className='mb-2 text-sm text-muted-foreground'>
                        Receipt
                      </p>
                      <div className='rounded-lg border bg-slate-50 p-4 dark:bg-slate-900'>
                        <div className='flex h-32 items-center justify-center rounded bg-slate-100 dark:bg-slate-800'>
                          <Eye className='h-8 w-8 text-slate-400' />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPayment.notes && (
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        User Notes
                      </p>
                      <p className='text-sm'>{selectedPayment.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div>
                <Label>Rejection Reason (if rejecting)</Label>
                <Input
                  placeholder='Enter reason for rejection...'
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              <div className='flex gap-3'>
                <Button
                  className='flex-1 bg-green-600 hover:bg-green-700'
                  onClick={() => handleVerifyPayment(true)}
                >
                  <CheckCircle2 className='mr-2 h-4 w-4' />
                  Verify & Upgrade
                </Button>
                <Button
                  variant='destructive'
                  className='flex-1'
                  onClick={() => handleVerifyPayment(false)}
                  disabled={!rejectionReason}
                >
                  <XCircle className='mr-2 h-4 w-4' />
                  Reject Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
