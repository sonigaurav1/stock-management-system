import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

export const createPayment = mutation({
  args: {
    saleIds: v.array(v.string()),
    customerId: v.id('customers'),
    supplierId: v.optional(v.id('suppliers')),
    isPaymentToSupplier: v.boolean(),
    amountPaid: v.number(),
    outstandingBalance: v.optional(v.number()),
    paymentMode: v.string(),
    paymentReference: v.optional(v.string()),
    notes: v.optional(v.string()),
    paymentStatus: v.optional(
      v.union(
        v.literal('paid'),
        v.literal('unpaid'),
        v.literal('partially_paid')
      )
    ),
    invoiceNumber: v.string(),
    paidAt: v.number(),
    dueDate: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.CREATE_TRANSACTION);
    const userId = getDataScopeUserId(caller);

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
    paymentStatus: v.optional(
      v.union(
        v.literal('paid'),
        v.literal('unpaid'),
        v.literal('partially_paid')
      )
    ),
    invoiceNumber: v.string(),
    paidAt: v.number(),
    dueDate: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.EDIT_TRANSACTION);
    const userId = getDataScopeUserId(caller);

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
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.DELETE_TRANSACTION);
    const userId = getDataScopeUserId(caller);

    return await ctx.db.patch(args.paymentId, {
      isDeleted: true,
      updatedAt: Date.now()
    });
  }
});

export const getPayments = query({
  args: {},
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);

    return await ctx.db
      .query('payments')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();
  }
});

export const getOutstandingBalance = query({
  args: {},
  handler: async (ctx, _) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);

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
