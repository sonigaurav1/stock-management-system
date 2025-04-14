import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createPayment = mutation({
  args: {
    saleIds: v.array(v.string()),
    customerId: v.id('customers'),
    amountPaid: v.number(),
    outstandingBalance: v.optional(v.number()),
    paymentMode: v.string(),
    paymentReference: v.optional(v.string()),
    notes: v.optional(v.string()),
    paymentStatus: v.optional(v.string()), // "paid", "unpaid", "partially_paid"
    invoiceNumber: v.string(),
    paidAt: v.number(),
    dueDate: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();

    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    return await ctx.db.insert('payments', {
      ...args,
      userId,
      paidAt: Date.now(),
      updatedAt: Date.now(),
      isDeleted: false
    });
  }
});

export const updatePayment = mutation({
  args: {
    paymentId: v.id('payments'),
    saleIds: v.array(v.string()),
    customerId: v.id('customers'),
    amountPaid: v.number(),
    outstandingBalance: v.optional(v.number()),
    paymentMode: v.string(),
    paymentReference: v.optional(v.string()),
    notes: v.optional(v.string()),
    paymentStatus: v.optional(v.string()), // "paid", "unpaid", "partially_paid"
    invoiceNumber: v.string(),
    paidAt: v.number(),
    dueDate: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();

    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    return await ctx.db.patch(args.paymentId, {
      ...args,
      userId,
      updatedAt: Date.now()
    });
  }
});

export const deletePayment = mutation({
  args: {
    paymentId: v.id('payments')
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();

    if (!identify) {
      throw new Error('Not authenticated');
    }
    // const userId = identify.subject;

    return await ctx.db.patch(args.paymentId, {
      isDeleted: true,
      updatedAt: Date.now()
    });
  }
});

export const getPayments = mutation({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();

    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    return await ctx.db
      .query('payments')
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect();
  }
});

export const getOutstandingBalance = query({
  args: {},
  handler: async (ctx, _) => {
    const identify = await ctx.auth.getUserIdentity();

    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const payments = await ctx.db
      .query('payments')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .filter((q) =>
        q.or(
          q.eq(q.field('paymentStatus'), 'partially_paid'),
          q.eq(q.field('paymentStatus'), 'unpaid')
        )
      )
      .collect();

    return payments.reduce(
      (sum, payment) => sum + (payment.outstandingBalance || 0),
      0
    );
  }
});
