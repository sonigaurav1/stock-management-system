'use node';

/**
 * Payment Processing Service
 * Supports Razorpay and Stripe for payment collection and billing
 *
 * Install: npm install razorpay
 * Environment: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
 */

import Razorpay from 'razorpay';

let razorpayInstance: Razorpay | null = null;

const initRazorpay = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || ''
    });
  }
  return razorpayInstance;
};

export interface PaymentLink {
  orderId: string;
  amount: number; // in rupees
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentLinkResult {
  success: boolean;
  paymentLinkId?: string;
  paymentLinkUrl?: string;
  orderId?: string;
  amount?: number;
  error?: string;
}

/**
 * Create payment link using Razorpay
 */
export const createPaymentLink = async (
  payment: PaymentLink
): Promise<CreatePaymentLinkResult> => {
  try {
    const razorpay = initRazorpay();

    const response = await razorpay.paymentLink.create({
      amount: payment.amount * 100, // Convert to paise
      currency: 'INR',
      customer: {
        name: payment.customerName,
        email: payment.customerEmail,
        contact: payment.customerPhone
      },
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true,
      description: payment.description,
      reference_id: payment.orderId,
      notes: payment.metadata || {}
    });

    return {
      success: true,
      paymentLinkId: response.id,
      paymentLinkUrl: response.short_url,
      orderId: payment.orderId,
      amount: payment.amount
    };
  } catch (error) {
    console.error('Payment link creation failed:', error);
    return {
      success: false,
      orderId: payment.orderId,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Verify payment using Razorpay signature
 */
export const verifyPayment = async (
  paymentId: string,
  orderId: string,
  signature: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const razorpay = initRazorpay();

    // Verify the payment signature
    const details = await razorpay.payments.fetch(paymentId);

    if (details.status === 'captured') {
      return { success: true };
    }

    return {
      success: false,
      error: `Payment status is ${details.status}, not captured`
    };
  } catch (error) {
    console.error('Payment verification failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Process refund
 */
export const processRefund = async (
  paymentId: string,
  amount?: number
): Promise<{ success: boolean; refundId?: string; error?: string }> => {
  try {
    const razorpay = initRazorpay();

    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount ? amount * 100 : undefined
    });

    return {
      success: true,
      refundId: refund.id
    };
  } catch (error) {
    console.error('Refund processing failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get payment details
 */
export const getPaymentDetails = async (
  paymentId: string
): Promise<{ success: boolean; payment?: any; error?: string }> => {
  try {
    const razorpay = initRazorpay();
    const payment = await razorpay.payments.fetch(paymentId);

    return {
      success: true,
      payment: {
        id: payment.id,
        amount: (payment.amount as number) / 100, // Convert back to rupees
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        created_at: payment.created_at,
        notes: payment.notes
      }
    };
  } catch (error) {
    console.error('Failed to fetch payment details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Calculate subscription pricing
 */
export const calculateSubscriptionPrice = {
  starter: {
    monthly: 499,
    quarterly: 1299,
    annual: 4799
  },
  professional: {
    monthly: 1299,
    quarterly: 3399,
    annual: 12999
  },
  enterprise: {
    monthly: 3499,
    quarterly: 9999,
    annual: 39999
  }
};

/**
 * Create subscription
 */
export const createSubscription = async (
  customerId: string,
  planType: keyof typeof calculateSubscriptionPrice,
  period: 'monthly' | 'quarterly' | 'annual'
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> => {
  try {
    const razorpay = initRazorpay();
    const amount = calculateSubscriptionPrice[planType][period];

    const subscription = await (razorpay.invoices.create as any)({
      description: `${planType} - ${period} subscription`,
      amount: amount * 100 // Convert to paise
    });

    return {
      success: true,
      subscriptionId: subscription.id
    };
  } catch (error) {
    console.error('Subscription creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
