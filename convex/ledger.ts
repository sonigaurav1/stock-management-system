import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Mutation to create a new firm
export const createFirm = mutation({
  args: {
    name: v.string(),
    owner: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string())
  },
  handler: async (ctx, { name, owner, address, phone }) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const timestamp = Date.now();
    return await ctx.db.insert('firms', {
      userId,
      name,
      owner,
      address,
      phone,
      createdAt: timestamp,
      updatedAt: timestamp,
      isDeleted: false
    });
  }
});

// Mutation to soft delete a firm
export const deleteFirm = mutation({
  args: { firmId: v.string() },
  handler: async (ctx, { firmId }) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const normalizedFirmId = ctx.db.normalizeId('firms', firmId);
    if (!normalizedFirmId) {
      throw new Error('Invalid firm ID');
    }

    const firm = await ctx.db.get(normalizedFirmId);
    if (!firm || firm.userId !== userId) {
      throw new Error('Firm not found or access denied');
    }

    await ctx.db.patch(normalizedFirmId, {
      isDeleted: true,
      updatedAt: Date.now()
    });
  }
});

// Query to get all firms for the authenticated user
export const getAllFirms = query({
  handler: async (ctx) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    return await ctx.db
      .query('firms')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();
  }
});

// Query to get transactions by firm for the authenticated user
export const getTransactionsByFirm = query({
  args: { firmId: v.string() },
  handler: async (ctx, { firmId }) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    return await ctx.db
      .query('transactions')
      .withIndex('by_user_firm_isDeleted', (q) =>
        q.eq('userId', userId).eq('firmId', firmId).eq('isDeleted', false)
      )
      .order('desc') // If transactions have a `date` field, sort in DB instead
      .collect();
  }
});

// Mutation to add a transaction
export const addTransaction = mutation({
  args: {
    firmId: v.string(),
    date: v.number(),
    particular: v.string(),
    drAmount: v.number(),
    crAmount: v.number(),
    balance: v.number()
  },
  handler: async (
    ctx,
    { firmId, date, particular, drAmount, crAmount, balance }
  ) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    return await ctx.db.insert('transactions', {
      userId,
      firmId,
      date,
      particular,
      drAmount,
      crAmount,
      balance,
      createdAt: Date.now(),
      isDeleted: false
    });
  }
});

// Mutation to soft delete a transaction
export const deleteTransaction = mutation({
  args: { transactionId: v.string() },
  handler: async (ctx, { transactionId }) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const normalizedTransactionId = ctx.db.normalizeId(
      'transactions',
      transactionId
    );
    if (!normalizedTransactionId) {
      throw new Error('Invalid transaction ID');
    }

    const transaction = await ctx.db.get(normalizedTransactionId);
    if (!transaction || transaction.userId !== userId) {
      throw new Error('Transaction not found or access denied');
    }

    await ctx.db.patch(normalizedTransactionId, {
      isDeleted: true,
      updatedAt: Date.now()
    });
  }
});
