import { useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to monitor payment status changes and show notifications
 * This should be used in a layout or wrapper component to provide real-time updates
 */
export const usePaymentNotifications = () => {
  const { toast } = useToast();
  const paymentHistory = useQuery(api.billing.getUserPaymentHistory);
  const subscription = useQuery(api.billing.getUserSubscription);

  useEffect(() => {
    if (!paymentHistory || paymentHistory.length === 0) return;

    // Check for recently verified payments
    const recentVerifiedPayments = paymentHistory.filter(
      (payment) =>
        payment.paymentStatus === 'verified' &&
        payment.verifiedAt &&
        Date.now() - payment.verifiedAt < 5000 // Within last 5 seconds
    );

    if (recentVerifiedPayments.length > 0) {
      const latestPayment = recentVerifiedPayments[0];
      toast({
        title: '🎉 Payment Verified!',
        description: `Your ${latestPayment.period} subscription has been activated. Enjoy unlimited access!`,
        duration: 6000
      });
    }

    // Check for recently rejected payments
    const recentRejectedPayments = paymentHistory.filter(
      (payment) =>
        payment.paymentStatus === 'rejected' &&
        payment.rejectedAt &&
        Date.now() - payment.rejectedAt < 5000 // Within last 5 seconds
    );

    if (recentRejectedPayments.length > 0) {
      const latestPayment = recentRejectedPayments[0];
      toast({
        title: 'Payment Rejected',
        description:
          latestPayment.rejectionReason ||
          'Your payment could not be verified. Please try again.',
        variant: 'destructive',
        duration: 6000
      });
    }
  }, [paymentHistory, toast]);

  useEffect(() => {
    if (!subscription) return;

    // Check for trial expiration
    if (
      subscription.status === 'trial' &&
      subscription.trialEndDate &&
      Date.now() > subscription.trialEndDate
    ) {
      toast({
        title: 'Trial Period Ended',
        description:
          'Your 30-day trial has ended. Upgrade to Premium to continue using all features.',
        variant: 'destructive',
        duration: 8000
      });
    }

    // Check for subscription expiration
    if (
      subscription.planType === 'premium' &&
      subscription.status === 'active' &&
      subscription.endDate &&
      Date.now() > subscription.endDate
    ) {
      toast({
        title: 'Subscription Expired',
        description:
          'Your Premium subscription has expired. Please renew to continue using premium features.',
        variant: 'destructive',
        duration: 8000
      });
    }

    // Check for upcoming expiration (3 days warning)
    if (
      subscription.planType === 'premium' &&
      subscription.status === 'active' &&
      subscription.endDate &&
      Date.now() > subscription.endDate - 3 * 24 * 60 * 60 * 1000 &&
      Date.now() < subscription.endDate
    ) {
      const daysRemaining = Math.ceil(
        (subscription.endDate - Date.now()) / (24 * 60 * 60 * 1000)
      );
      toast({
        title: `Subscription Expiring in ${daysRemaining} Days`,
        description:
          'Your Premium subscription will expire soon. Renew to avoid service interruption.',
        variant: 'default',
        duration: 8000
      });
    }
  }, [subscription, toast]);

  return {
    hasPendingPayments:
      paymentHistory?.some((p) => p.paymentStatus === 'pending') || false,
    pendingPaymentCount:
      paymentHistory?.filter((p) => p.paymentStatus === 'pending').length || 0,
    subscriptionStatus: subscription?.status,
    planType: subscription?.planType
  };
};
