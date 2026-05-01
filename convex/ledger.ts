import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

/**
 * Resolve effective userId for team members.
 * If user is a team member without their own company, returns owner's userId.
 */
async function resolveEffectiveUserId(
  ctx: any,
  userId: string
): Promise<string> {
  // First check if user has their own company
  const company = await ctx.db
    .query('companies')
    .withIndex('by_user_and_isDeleted', (q: any) =>
      q.eq('userId', userId).eq('isDeleted', false)
    )
    .first();

  if (company) {
    return userId;
  }

  // User doesn't have their own company - check if they're a team member
  const teamMembership = await ctx.db
    .query('teamMembers')
    .withIndex('by_user', (q: any) => q.eq('userId', userId))
    .first();

  if (teamMembership) {
    return teamMembership.userId;
  }

  return userId;
}

// Mutation to create a new firm (now uses companies table with type="firm")
export const createFirm = mutation({
  args: {
    name: v.string(),
    owner: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string())
  },
  handler: async (ctx, { name, owner, address, phone }) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);
    const userId = getDataScopeUserId(caller);

    const timestamp = Date.now();
    return await ctx.db.insert('companies', {
      userId,
      type: 'firm',
      name,
      owner,
      businessType: 'firm',
      address: address || '',
      email: '',
      taxNumber: '',
      phone: phone ? (Array.isArray(phone) ? phone : [phone]) : [],
      isVerified: false,
      urls: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      isDeleted: false
    });
  }
});

// Mutation to soft delete a firm (now uses companies table)
export const deleteFirm = mutation({
  args: { firmId: v.string() },
  handler: async (ctx, { firmId }) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_ORGANIZATION);
    const userId = getDataScopeUserId(caller);

    const normalizedFirmId = ctx.db.normalizeId('companies', firmId);
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

// Query to get all firms for the authenticated user (now uses companies table)
export const getAllFirms = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);
    const userId = getDataScopeUserId(caller);

    return await ctx.db
      .query('companies')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .filter((q) => q.eq(q.field('type'), 'firm'))
      .collect();
  }
});

// Query to get transactions by firm for the authenticated user
export const getTransactionsByFirm = query({
  args: { firmId: v.string() },
  handler: async (ctx, { firmId }) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);

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
    balance: v.number(),
    imageUrl: v.optional(v.string())
  },
  handler: async (
    ctx,
    { firmId, date, particular, drAmount, crAmount, balance, imageUrl }
  ) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.CREATE_TRANSACTION);
    const userId = getDataScopeUserId(caller);

    return await ctx.db.insert('transactions', {
      userId,
      firmId,
      date,
      particular,
      drAmount,
      crAmount,
      imageUrl,
      balance,
      createdAt: Date.now(),
      isDeleted: false
    });
  }
});

// Mutation to update a transaction
export const updateTransaction = mutation({
  args: {
    transactionId: v.string(),
    date: v.number(),
    particular: v.string(),
    drAmount: v.number(),
    crAmount: v.number(),
    balance: v.number(),
    imageUrl: v.optional(v.string())
  },
  handler: async (
    ctx,
    { transactionId, date, particular, drAmount, crAmount, balance, imageUrl }
  ) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.EDIT_TRANSACTION);
    const userId = getDataScopeUserId(caller);

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
      date,
      particular,
      drAmount,
      crAmount,
      balance,
      imageUrl,
      updatedAt: Date.now()
    });

    return normalizedTransactionId;
  }
});

// Mutation to soft delete a transaction
export const deleteTransaction = mutation({
  args: { transactionId: v.string() },
  handler: async (ctx, { transactionId }) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.DELETE_TRANSACTION);
    const userId = getDataScopeUserId(caller);

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

// STEP 1.1: Get Cash Ledger Summary (income - expenses)
export const getCashLedgerSummary = query({
  args: {},
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);
    const effectiveUserId = userId;

    // Get all transactions for this user
    // Index requires: userId, firmId, isDeleted in order
    // Since we don't have firmId, just query without index
    const transactions = await ctx.db
      .query('transactions')
      .filter((q) => q.eq(q.field('userId'), effectiveUserId))
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .collect();

    // Calculate total income (crAmount) and expenses (drAmount)
    let totalIncome = 0;
    let totalExpenses = 0;
    let currentBalance = 0;

    transactions.forEach((tx: any) => {
      if (tx.crAmount) {
        totalIncome += tx.crAmount;
      }
      if (tx.drAmount) {
        totalExpenses += tx.drAmount;
      }
      if (tx.balance) {
        currentBalance = tx.balance;
      }
    });

    // Cash = income - expenses (manual ledger)
    const cash = totalIncome - totalExpenses;

    return {
      cash,
      totalIncome,
      totalExpenses,
      currentBalance,
      transactionCount: transactions.length
    };
  }
});

// STEP 1.3: Get Receivables Aging (unpaid invoices by age)
export const getReceivablesAging = query({
  args: {},
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);
    const effectiveUserId = userId;

    // Get unpaid invoices (paymentMode = credit and not fully paid)
    // For now, get all invoices with buyerName (B2B sales)
    const invoices = await ctx.db
      .query('invoices')
      .filter((q) => q.eq(q.field('userId'), effectiveUserId))
      .collect();

    const now = Date.now();
    const aging = {
      current: 0, // 0-30 days
      days30: 0, // 31-60 days
      days60: 0, // 61-90 days
      days90: 0, // 90+ days
      total: 0
    };

    invoices.forEach((inv: any) => {
      if (inv.isDeleted) return;

      const invoiceDate = inv.createdAt || 0;
      const daysOld = Math.floor((now - invoiceDate) / (1000 * 60 * 60 * 24));
      const amount = inv.totalAmount || inv.value || 0;

      // Only count credit sales as receivables
      if (inv.paymentMode === 'credit' && amount > 0) {
        if (daysOld <= 30) {
          aging.current += amount;
        } else if (daysOld <= 60) {
          aging.days30 += amount;
        } else if (daysOld <= 90) {
          aging.days60 += amount;
        } else {
          aging.days90 += amount;
        }
        aging.total += amount;
      }
    });

    return aging;
  }
});

// STEP 1.4: Get Top Vendors by Spend
export const getTopVendorsBySpend = query({
  args: {},
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);
    const effectiveUserId = userId;

    // Get all suppliers
    const suppliers = await ctx.db
      .query('suppliers')
      .filter((q) => q.eq(q.field('userId'), effectiveUserId))
      .collect();

    // For each supplier, get purchase history to calculate spend
    // This is a simplified version - ideally would track purchase orders per supplier
    const vendorSpend: Record<string, number> = {};

    suppliers.forEach((supplier: any) => {
      if (supplier._id && !supplier.isDeleted) {
        // Initialize with 0, would be calculated from purchases
        vendorSpend[supplier._id] = 0;
      }
    });

    // Return top 5 vendors with spend data
    const topVendors = Object.entries(vendorSpend)
      .map(([supplierId, spend]) => {
        const supplier = suppliers.find((s: any) => s._id === supplierId);
        return {
          supplierId,
          supplierName: supplier?.name || 'Unknown',
          supplierEmail: supplier?.email || '',
          totalSpend: spend
        };
      })
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 5);

    return topVendors;
  }
});
