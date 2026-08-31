import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';
import { UNIT_VALUES } from './lib/schemaConstants';

export const getCustomerByPanOrPhone = mutation({
  args: {
    pan: v.optional(v.string()),
    phones: v.optional(v.array(v.string())) // Accept an array of phone numbers
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);
    const userId = getDataScopeUserId(caller);

    const customers = await ctx.db
      .query('customers')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    return customers.find(
      (customer) =>
        (args.pan && customer.pan === args.pan) ||
        (Array.isArray(args.phones) &&
          Array.isArray(customer.phone ?? []) &&
          args.phones.some((phone) => (customer.phone ?? []).includes(phone))) // Check if any phone matches
    );
  }
});

export const createCustomer = mutation({
  args: {
    name: v.string(),
    phone: v.optional(v.array(v.string())), // Accept an array of phone numbers
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    pan: v.optional(v.string()),
    createdAt: v.number()
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.CREATE_TRANSACTION);
    const userId = getDataScopeUserId(caller);

    return await ctx.db.insert('customers', {
      ...args,
      userId,
      isDeleted: false
    });
  }
});

export const updateProductStock = mutation({
  args: {
    id: v.id('products'),
    updates: v.object({
      stockLevel: v.number(),
      stockStatus: v.union(
        v.literal('in_stock'),
        v.literal('low_stock'),
        v.literal('out_of_stock')
      )
    })
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.EDIT_TRANSACTION);
    const userId = getDataScopeUserId(caller);

    const product = await ctx.db.get(args.id);

    if (!product || product.userId !== userId) {
      throw new Error('Product not found or access denied');
    }

    return await ctx.db.patch(args.id, {
      ...args.updates,
      updatedAt: Date.now()
    });
  }
});

export const getProductByIdBilling = mutation({
  args: { id: v.id('products') },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_ORGANIZATION);
    const userId = getDataScopeUserId(caller);

    const product = await ctx.db.get(args.id);
    return product?.isDeleted || product?.userId !== userId ? null : product; // Return null if deleted or not owned by user
  }
});

// Invoice Management
export const createInvoice = mutation({
  args: {
    invoiceData: v.object({
      userId: v.string(),
      transactionDate: v.string(),
      invoiceNumber: v.string(),
      date: v.string(),
      miti: v.string(),
      isAdmin: v.boolean(),
      paymentMode: v.string(),
      buyerName: v.string(),
      buyerAddress: v.string(),
      buyerPhone: v.optional(v.string()),
      buyerPan: v.optional(v.string()),
      items: v.array(
        v.object({
          sn: v.number(),
          hsCode: v.string(),
          description: v.string(),
          quantity: v.number(),
          unit: v.union(...UNIT_VALUES.map(v.literal)),
          rate: v.number(),
          amount: v.number()
        })
      ),
      value: v.number(),
      discount: v.number(),
      nonTaxable: v.number(),
      taxableAmount: v.number(),
      vatAmount: v.number(),
      totalAmount: v.number(),
      amountInWords: v.string(),
      printDate: v.string(),
      printTime: v.string(),
      vehicleNo: v.optional(v.string()),
      remarks: v.optional(v.string())
    })
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.CREATE_TRANSACTION);
    const userId = getDataScopeUserId(caller);

    return await ctx.db.insert('invoices', {
      ...args.invoiceData,
      userId,
      isDeleted: false,
      createdAt: Date.now()
    });
  }
});

export const getAllInvoices = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);

    const invoices = await ctx.db
      .query('invoices')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    return invoices.sort((a, b) => b.createdAt - a.createdAt);
  }
});

export const getInvoiceByInvoiceNumber = query({
  args: { invoiceNumber: v.string() },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);

    const invoices = await ctx.db
      .query('invoices')
      .withIndex('by_user_and_invoiceNumber', (q) =>
        q.eq('userId', userId).eq('invoiceNumber', args.invoiceNumber)
      )
      .collect();

    return invoices.length > 0 ? invoices[0] : null;
  }
});

// ==================== Subscription Management ====================

// Get user's current subscription
export const getUserSubscription = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    const userId = getDataScopeUserId(caller);

    const subscription = await ctx.db
      .query('userSubscriptions')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    return subscription;
  }
});

// Create or update user subscription
export const upsertSubscription = mutation({
  args: {
    planType: v.union(v.literal('free'), v.literal('premium')),
    status: v.union(
      v.literal('active'),
      v.literal('trial'),
      v.literal('expired'),
      v.literal('cancelled')
    ),
    period: v.optional(v.union(v.literal('monthly'), v.literal('yearly'))),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    trialEndDate: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    const userId = getDataScopeUserId(caller);

    const existingSubscription = await ctx.db
      .query('userSubscriptions')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    const now = Date.now();
    const subscriptionData = {
      userId,
      planType: args.planType,
      status: args.status,
      startDate: args.startDate || now,
      endDate: args.endDate,
      trialEndDate: args.trialEndDate,
      autoRenew: args.planType === 'premium',
      createdAt: existingSubscription?.createdAt || now,
      updatedAt: now
    };

    if (existingSubscription) {
      await ctx.db.patch(existingSubscription._id, subscriptionData);
      return existingSubscription._id;
    } else {
      return await ctx.db.insert('userSubscriptions', subscriptionData);
    }
  }
});

// Create manual QR payment for subscription
export const createSubscriptionPayment = mutation({
  args: {
    amount: v.number(),
    period: v.union(v.literal('monthly'), v.literal('yearly')),
    paymentMethod: v.union(
      v.literal('fonepay'),
      v.literal('nepalpay'),
      v.literal('esewa'),
      v.literal('imepay'),
      v.literal('khalti'),
      v.literal('other')
    ),
    transactionId: v.optional(v.string()),
    receiptImageUrl: v.optional(v.string()),
    notes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    const userId = getDataScopeUserId(caller);

    // Get or create subscription
    let subscription = await ctx.db
      .query('userSubscriptions')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    let subscriptionId;
    if (!subscription) {
      subscriptionId = await ctx.db.insert('userSubscriptions', {
        userId,
        planType: 'free',
        status: 'trial',
        startDate: Date.now(),
        trialEndDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days trial
        autoRenew: false,
        createdAt: Date.now()
      });
    } else {
      subscriptionId = subscription._id;
    }

    // Create payment record
    const paymentId = await ctx.db.insert('subscriptionPayments', {
      userId,
      subscriptionId,
      amount: args.amount,
      period: args.period,
      paymentMethod: args.paymentMethod,
      paymentStatus: 'pending',
      transactionId: args.transactionId,
      receiptImageUrl: args.receiptImageUrl,
      notes: args.notes,
      createdAt: Date.now()
    });

    return paymentId;
  }
});

// Get user's payment history
export const getUserPaymentHistory = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    const userId = getDataScopeUserId(caller);

    const payments = await ctx.db
      .query('subscriptionPayments')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    return payments.sort((a, b) => b.createdAt - a.createdAt);
  }
});

// Admin: Get all pending payments for verification
export const getPendingPayments = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.ADMIN_MANAGE_USERS);

    const pendingPayments = await ctx.db
      .query('subscriptionPayments')
      .withIndex('by_status', (q) => q.eq('paymentStatus', 'pending'))
      .collect();

    // Fetch user details for each payment
    const paymentsWithUsers = await Promise.all(
      pendingPayments.map(async (payment) => {
        const user = await ctx.db
          .query('userSubscriptions')
          .withIndex('by_user', (q) => q.eq('userId', payment.userId))
          .first();
        return {
          ...payment,
          userEmail: user?.userId // In real app, fetch from Clerk
        };
      })
    );

    return paymentsWithUsers.sort((a, b) => b.createdAt - a.createdAt);
  }
});

// Admin: Verify payment
export const verifyPayment = mutation({
  args: {
    paymentId: v.id('subscriptionPayments'),
    approved: v.boolean(),
    rejectionReason: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.ADMIN_MANAGE_USERS);
    const adminUserId = getDataScopeUserId(caller);

    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    const now = Date.now();

    if (args.approved) {
      // Update payment status
      await ctx.db.patch(args.paymentId, {
        paymentStatus: 'verified',
        verifiedBy: adminUserId,
        verifiedAt: now,
        updatedAt: now
      });

      // Update subscription to premium
      const subscription = await ctx.db.get(payment.subscriptionId);
      if (subscription) {
        const endDate =
          payment.period === 'yearly'
            ? now + 365 * 24 * 60 * 60 * 1000
            : now + 30 * 24 * 60 * 60 * 1000;

        await ctx.db.patch(subscription._id, {
          planType: 'premium',
          status: 'active',
          endDate,
          trialEndDate: undefined, // End trial if upgrading
          updatedAt: now
        });
      }
    } else {
      // Reject payment
      await ctx.db.patch(args.paymentId, {
        paymentStatus: 'rejected',
        rejectionReason: args.rejectionReason,
        rejectedBy: adminUserId,
        rejectedAt: now,
        updatedAt: now
      });
    }

    return { success: true };
  }
});

// Create default free subscription for new users
export const createDefaultSubscription = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const existingSubscription = await ctx.db
      .query('userSubscriptions')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (existingSubscription) {
      return existingSubscription._id; // Already exists
    }

    const subscriptionId = await ctx.db.insert('userSubscriptions', {
      userId,
      planType: 'free',
      status: 'active',
      startDate: Date.now(),
      autoRenew: false,
      createdAt: Date.now()
    });

    return subscriptionId;
  }
});

// Check if user can perform action based on plan limits
export const checkPlanLimits = query({
  args: {
    action: v.union(
      v.literal('create_product'),
      v.literal('add_user'),
      v.literal('add_location')
    )
  },
  handler: async (ctx, { action }) => {
    const caller = await resolveCallerContext(ctx);
    const userId = getDataScopeUserId(caller);

    const subscription = await ctx.db
      .query('userSubscriptions')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (!subscription) {
      // Create default subscription if none exists
      return { allowed: true, reason: 'Creating default subscription' };
    }

    // Check if subscription is active
    if (
      subscription.status === 'cancelled' ||
      subscription.status === 'expired'
    ) {
      return { allowed: false, reason: 'Subscription is not active' };
    }

    // Check trial expiration
    if (subscription.status === 'trial' && subscription.trialEndDate) {
      if (Date.now() > subscription.trialEndDate) {
        return { allowed: false, reason: 'Trial period has expired' };
      }
    }

    // Check plan expiration
    if (subscription.planType === 'premium' && subscription.endDate) {
      if (Date.now() > subscription.endDate) {
        return { allowed: false, reason: 'Premium subscription has expired' };
      }
    }

    // Plan-specific limits
    if (subscription.planType === 'free') {
      switch (action) {
        case 'create_product':
          // Count current products
          const products = await ctx.db
            .query('products')
            .withIndex('by_user_and_isDeleted', (q) =>
              q.eq('userId', userId).eq('isDeleted', false)
            )
            .collect();

          if (products.length >= 50) {
            return {
              allowed: false,
              reason:
                'Free plan limit reached: Maximum 50 products. Upgrade to Premium for unlimited products.',
              currentCount: products.length,
              limit: 50
            };
          }
          break;

        case 'add_user':
          // For free plan, only the owner (1 user)
          return {
            allowed: false,
            reason:
              'Free plan allows only 1 user. Upgrade to Premium for unlimited users.',
            currentCount: 1,
            limit: 1
          };

        case 'add_location':
          // For free plan, only 1 location
          // Note: locations table exists, check if user has more than 1 active location
          // Since we don't have a direct index, we'll check if the table exists first
          try {
            const locations = await ctx.db
              .query('locations')
              .withIndex('by_user', (q) => q.eq('userId', userId))
              .collect();

            if (locations.length >= 1) {
              return {
                allowed: false,
                reason:
                  'Free plan allows only 1 location. Upgrade to Premium for multiple locations.',
                currentCount: locations.length,
                limit: 1
              };
            }
          } catch (error) {
            // If locations table doesn't exist or query fails, allow for now
            console.log('Locations check failed, allowing:', error);
          }
          break;
      }
    }

    // Premium users have no limits
    return { allowed: true };
  }
});

// Get user's current plan details
export const getUserPlanDetails = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    const userId = getDataScopeUserId(caller);

    const subscription = await ctx.db
      .query('userSubscriptions')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (!subscription) {
      return {
        planType: 'free',
        status: 'active',
        limits: {
          products: 50,
          users: 1,
          locations: 1
        },
        canUpgrade: true
      };
    }

    const limits =
      subscription.planType === 'free'
        ? { products: 50, users: 1, locations: 1 }
        : { products: Infinity, users: Infinity, locations: Infinity };

    return {
      planType: subscription.planType,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      trialEndDate: subscription.trialEndDate,
      limits,
      canUpgrade: subscription.planType === 'free'
    };
  }
});
