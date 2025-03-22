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
  handler: async ({ db }, { name, owner, address, phone }) => {
    const timestamp = Date.now();

    return await db.insert('firms', {
      name,
      owner,
      address,
      phone,
      createdAt: timestamp,
      updatedAt: undefined,
      isDeleted: false
    });
  }
});

// Mutation to soft delete a firm
export const deleteFirm = mutation({
  args: {
    firmId: v.string()
  },
  handler: async ({ db }, { firmId }) => {
    const normalizedFirmId = db.normalizeId('firms', firmId);
    if (!normalizedFirmId) {
      throw new Error('Invalid firm ID');
    }
    const firm = await db.get(normalizedFirmId);
    if (!firm) {
      throw new Error('Firm not found');
    }
    await db.patch(normalizedFirmId, {
      isDeleted: true,
      updatedAt: Date.now()
    });
  }
});

// Query to get all firms
export const getAllFirms = query({
  args: {},
  handler: async ({ db }) => {
    return await db
      .query('firms')
      .withIndex('by_isDeleted')
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .collect();
  }
});

// Transaction
export const getTransactionsByFirm = query({
  args: {
    firmId: v.string()
  },
  handler: async ({ db }, { firmId }) => {
    return await db
      .query('transactions')
      .filter((q) => q.eq(q.field('firmId'), firmId))
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .collect()
      .then((results) =>
        results.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      ); // Sort by date in descending order
  }
});

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
    { db },
    { firmId, date, particular, drAmount, crAmount, balance }
  ) => {
    await db.insert('transactions', {
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

// Mutation to delete a transaction by ID
export const deleteTransaction = mutation({
  args: {
    transactionId: v.string()
  },
  handler: async ({ db }, { transactionId }) => {
    const normalizedTransactionId = db.normalizeId(
      'transactions',
      transactionId
    );
    if (!normalizedTransactionId) {
      throw new Error('Invalid transaction ID');
    }
    const transaction = await db.get(normalizedTransactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    await db.patch(normalizedTransactionId, {
      isDeleted: true,
      updatedAt: Date.now()
    });
  }
});
