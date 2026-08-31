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
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Upload,
  Smartphone,
  Calendar,
  Crown,
  Zap
} from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { usePaymentNotifications } from '@/hooks/usePaymentNotifications';

interface SubscriptionUpgradeProps {
  currentPlan?: 'free' | 'premium';
  onUpgradeComplete?: () => void;
}

export const SubscriptionUpgrade = ({
  currentPlan = 'free',
  onUpgradeComplete
}: SubscriptionUpgradeProps) => {
  const { toast } = useToast();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('fonepay');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [transactionId, setTransactionId] = useState('');
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query user's subscription
  const subscription = useQuery(api.billing.getUserSubscription);
  // Query payment history
  const paymentHistory = useQuery(api.billing.getUserPaymentHistory);
  // Mutation to create payment
  const createPayment = useMutation(api.billing.createSubscriptionPayment);
  // Payment notifications
  const { hasPendingPayments, pendingPaymentCount } = usePaymentNotifications();

  const qrCodeUrl = '/images/payment-qr-placeholder.png'; // Replace with actual QR code image

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file',
          description: 'Please upload an image file',
          variant: 'destructive'
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB',
          variant: 'destructive'
        });
        return;
      }
      setReceiptImage(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!receiptImage) {
      toast({
        title: 'Receipt required',
        description: 'Please upload your payment receipt screenshot',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real implementation, you would upload the image to EdgeStore or similar
      // For now, we'll use a placeholder URL
      const receiptImageUrl = 'https://placeholder.com/receipt.jpg';

      await createPayment({
        amount: period === 'monthly' ? 999 : 9999,
        period,
        paymentMethod: paymentMethod as any,
        transactionId: transactionId || undefined,
        receiptImageUrl,
        notes: notes || undefined
      });

      toast({
        title: 'Payment submitted successfully',
        description: `Your ₹${period === 'monthly' ? '999' : '9,999'} payment is being reviewed. We'll notify you within 24 hours once verified.`,
        duration: 5000
      });

      setIsUpgradeModalOpen(false);
      onUpgradeComplete?.();

      // Reset form
      setTransactionId('');
      setReceiptImage(null);
      setNotes('');
    } catch (error) {
      toast({
        title: 'Payment submission failed',
        description:
          'Failed to submit payment. Please check your connection and try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const planDetails = {
    free: {
      name: 'Free Plan',
      price: '₹0',
      features: ['50 products', '1 user', '1 location', 'Basic invoicing'],
      icon: Smartphone
    },
    premium: {
      name: 'Premium Plan',
      price: period === 'monthly' ? '₹999/month' : '₹9,999/year',
      features: [
        'Unlimited products',
        'Unlimited users',
        'Multi-location',
        'Advanced analytics',
        'Priority support'
      ],
      icon: Crown
    }
  };

  const currentPlanDetails = planDetails[currentPlan];
  const CurrentPlanIcon = currentPlanDetails.icon;

  return (
    <div className='space-y-6'>
      {/* Pending Payment Alert */}
      {hasPendingPayments && (
        <Card className='border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <AlertCircle className='h-5 w-5 text-yellow-600 dark:text-yellow-400' />
              <div className='flex-1'>
                <p className='font-medium text-yellow-900 dark:text-yellow-100'>
                  {pendingPaymentCount} Payment
                  {pendingPaymentCount > 1 ? 's' : ''} Pending Review
                </p>
                <p className='text-sm text-yellow-700 dark:text-yellow-300'>
                  Your payment is being verified. You'll be notified once
                  approved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan Overview */}
      <Card className='border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-950 dark:to-blue-900'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-blue-100 p-2 dark:bg-blue-950'>
                <CurrentPlanIcon className='h-6 w-6 text-blue-600 dark:text-blue-400' />
              </div>
              <div>
                <CardTitle>{currentPlanDetails.name}</CardTitle>
                <CardDescription>
                  {subscription?.status === 'trial' && subscription.trialEndDate
                    ? `Trial ends on ${new Date(subscription.trialEndDate).toLocaleDateString()}`
                    : subscription?.status === 'active' && subscription.endDate
                      ? `Renews on ${new Date(subscription.endDate).toLocaleDateString()}`
                      : 'Your current subscription plan'}
                </CardDescription>
              </div>
            </div>
            <Badge
              className={
                subscription?.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : subscription?.status === 'trial'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 text-slate-800'
              }
            >
              {subscription?.status?.toUpperCase() || 'ACTIVE'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div>
              <p className='text-sm text-muted-foreground'>Plan Cost</p>
              <p className='text-2xl font-bold'>{currentPlanDetails.price}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Products</p>
              <p className='text-2xl font-bold'>
                {currentPlan === 'free' ? '50' : 'Unlimited'}
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Users</p>
              <p className='text-2xl font-bold'>
                {currentPlan === 'free' ? '1' : 'Unlimited'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Button */}
      {currentPlan === 'free' && (
        <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
          <DialogTrigger asChild>
            <Button className='w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700'>
              <Zap className='mr-2 h-4 w-4' />
              Upgrade to Premium
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Upgrade to Premium Plan</DialogTitle>
              <DialogDescription>
                Pay via QR code and get unlimited access to all features
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-6'>
              {/* Plan Selection */}
              <div className='grid grid-cols-2 gap-4'>
                <Card
                  className={`cursor-pointer transition-all ${
                    period === 'monthly'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-slate-200'
                  }`}
                  onClick={() => setPeriod('monthly')}
                >
                  <CardContent className='p-4'>
                    <div className='text-center'>
                      <p className='text-2xl font-bold'>₹999</p>
                      <p className='text-sm text-muted-foreground'>Monthly</p>
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-all ${
                    period === 'yearly'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-slate-200'
                  }`}
                  onClick={() => setPeriod('yearly')}
                >
                  <CardContent className='p-4'>
                    <div className='text-center'>
                      <p className='text-2xl font-bold'>₹9,999</p>
                      <p className='text-sm text-muted-foreground'>
                        Yearly (Save 17%)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* QR Code Display */}
              <Card>
                <CardContent className='p-6'>
                  <div className='flex flex-col items-center space-y-4'>
                    <div className='rounded-lg border-2 border-dashed border-slate-300 p-4 dark:border-slate-600'>
                      {/* Replace with actual QR code image */}
                      <div className='flex h-48 w-48 items-center justify-center bg-slate-100 dark:bg-slate-800'>
                        <Smartphone className='h-16 w-16 text-slate-400' />
                      </div>
                    </div>
                    <div className='text-center'>
                      <p className='font-semibold'>Scan to Pay</p>
                      <p className='text-sm text-muted-foreground'>
                        Use Fonepay, NepalPay, eSewa, or any banking app
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Form */}
              <div className='space-y-4'>
                <div>
                  <Label>Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='fonepay'>Fonepay</SelectItem>
                      <SelectItem value='nepalpay'>NepalPay</SelectItem>
                      <SelectItem value='esewa'>eSewa</SelectItem>
                      <SelectItem value='imepay'>IME Pay</SelectItem>
                      <SelectItem value='khalti'>Khalti</SelectItem>
                      <SelectItem value='other'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Transaction ID (Optional)</Label>
                  <Input
                    placeholder='Enter transaction ID from your payment app'
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Payment Receipt Screenshot *</Label>
                  <div className='mt-2 flex items-center gap-4'>
                    <Input
                      type='file'
                      accept='image/*'
                      onChange={handleFileUpload}
                      className='flex-1'
                    />
                    {receiptImage && (
                      <div className='flex items-center gap-2 text-sm text-green-600'>
                        <CheckCircle2 className='h-4 w-4' />
                        {receiptImage.name}
                      </div>
                    )}
                  </div>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Upload screenshot of your payment confirmation
                  </p>
                </div>

                <div>
                  <Label>Notes (Optional)</Label>
                  <Input
                    placeholder='Any additional information'
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <Button
                className='w-full'
                onClick={handleSubmitPayment}
                disabled={isSubmitting || !receiptImage}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Payment'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Payment History */}
      {paymentHistory && paymentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Your recent subscription payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {paymentHistory.map((payment) => (
                <div
                  key={payment._id}
                  className='flex items-center justify-between rounded-lg border p-4'
                >
                  <div className='flex items-center gap-4'>
                    <div
                      className={`rounded-lg p-2 ${
                        payment.paymentStatus === 'verified'
                          ? 'bg-green-100'
                          : payment.paymentStatus === 'rejected'
                            ? 'bg-red-100'
                            : 'bg-yellow-100'
                      }`}
                    >
                      {payment.paymentStatus === 'verified' ? (
                        <CheckCircle2 className='h-5 w-5 text-green-600' />
                      ) : payment.paymentStatus === 'rejected' ? (
                        <AlertCircle className='h-5 w-5 text-red-600' />
                      ) : (
                        <CreditCard className='h-5 w-5 text-yellow-600' />
                      )}
                    </div>
                    <div>
                      <p className='font-medium'>
                        ₹{payment.amount} - {payment.period}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {new Date(payment.createdAt).toLocaleDateString()} via{' '}
                        {payment.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      payment.paymentStatus === 'verified'
                        ? 'default'
                        : payment.paymentStatus === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {payment.paymentStatus}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
