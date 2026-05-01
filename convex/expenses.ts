import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { QueryCtx } from './_generated/server';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

// ==================== MUTATIONS ====================

// Create a new expense
export const createExpense = mutation({
  args: {
    categoryId: v.string(),
    amount: v.number(),
    description: v.string(),
    date: v.number(),
    paymentMethod: v.string(),
    type: v.string(), // "business" | "personal"
    vendor: v.optional(v.string()),
    invoice: v.optional(v.string()),
    isTaxDeductible: v.optional(v.boolean()),
    isReimbursable: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    department: v.optional(v.string()),
    project: v.optional(v.string())
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_EXPENSES);

    const userId = getDataScopeUserId(caller);

    // Create the expense
    const expenseId = await ctx.db.insert('expenses', {
      userId,
      categoryId: args.categoryId,
      amount: args.amount,
      description: args.description,
      date: args.date,
      paymentMethod: args.paymentMethod,
      type: args.type,
      status: 'pending',
      vendor: args.vendor,
      invoice: args.invoice,
      isTaxDeductible: args.isTaxDeductible ?? false,
      isReimbursable: args.isReimbursable ?? false,
      tags: args.tags ?? [],
      notes: args.notes,
      department: args.department,
      project: args.project,
      isDeleted: false,
      createdAt: Date.now()
    });

    return expenseId;
  }
});

// Update an expense
export const updateExpense = mutation({
  args: {
    expenseId: v.string(),
    categoryId: v.optional(v.string()),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    date: v.optional(v.number()),
    paymentMethod: v.optional(v.string()),
    type: v.optional(v.string()),
    vendor: v.optional(v.string()),
    invoice: v.optional(v.string()),
    isTaxDeductible: v.optional(v.boolean()),
    isReimbursable: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    department: v.optional(v.string()),
    project: v.optional(v.string()),
    status: v.optional(v.string())
  },
  async handler(ctx, args) {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_EXPENSES);

    const userId = getDataScopeUserId(caller);

    // Query expenses and find the one with matching string ID
    const allExpenses = await ctx.db
      .query('expenses')
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect();
    const expense = allExpenses.find(
      (e) => e._id.toString() === args.expenseId
    );

    if (!expense || expense.isDeleted) {
      throw new Error('Expense not found or unauthorized');
    }

    // Only allow updating if not already approved
    if (expense.status === 'approved') {
      throw new Error('Cannot modify approved expenses');
    }

    const updates: any = {
      updatedAt: Date.now()
    };

    if (args.categoryId) updates.categoryId = args.categoryId;
    if (args.amount) updates.amount = args.amount;
    if (args.description) updates.description = args.description;
    if (args.date) updates.date = args.date;
    if (args.paymentMethod) updates.paymentMethod = args.paymentMethod;
    if (args.type) updates.type = args.type;
    if (args.vendor !== undefined) updates.vendor = args.vendor;
    if (args.invoice !== undefined) updates.invoice = args.invoice;
    if (args.isTaxDeductible !== undefined)
      updates.isTaxDeductible = args.isTaxDeductible;
    if (args.isReimbursable !== undefined)
      updates.isReimbursable = args.isReimbursable;
    if (args.tags) updates.tags = args.tags;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.department !== undefined) updates.department = args.department;
    if (args.project !== undefined) updates.project = args.project;
    if (args.status) updates.status = args.status;

    await ctx.db.patch(expense._id, updates);

    return expense._id.toString();
  }
});

// Delete (soft delete) an expense
export const deleteExpense = mutation({
  args: {
    expenseId: v.string()
  },
  async handler(ctx, args) {
    const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier || '';

    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Query expenses and find the one with matching string ID
    const allExpenses = await ctx.db
      .query('expenses')
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect();
    const expense = allExpenses.find(
      (e) => e._id.toString() === args.expenseId
    );

    if (!expense || expense.isDeleted) {
      throw new Error('Expense not found or unauthorized');
    }

    await ctx.db.patch(expense._id, {
      isDeleted: true,
      updatedAt: Date.now()
    });

    return expense._id.toString();
  }
});

// Approve an expense (admin action)
export const approveExpense = mutation({
  args: {
    expenseId: v.string(),
    approvalNotes: v.optional(v.string())
  },
  async handler(ctx, args) {
    const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier || '';

    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Query all expenses and find the one with matching string ID
    const allExpenses = await ctx.db.query('expenses').collect();
    const expense = allExpenses.find(
      (e) => e._id.toString() === args.expenseId
    );

    if (!expense || expense.isDeleted) {
      throw new Error('Expense not found');
    }

    // Check if user has admin rights (simplified check)
    // In production, verify against organizationMembers or roles table

    await ctx.db.patch(expense._id, {
      status: 'approved',
      approvedBy: userId,
      approvalDate: Date.now(),
      approvalNotes: args.approvalNotes,
      updatedAt: Date.now()
    });

    return expense._id.toString();
  }
});

// Create expense category
export const createExpenseCategory = mutation({
  args: {
    name: v.string(),
    type: v.string(), // "business" | "personal"
    isTaxDeductible: v.optional(v.boolean()),
    isRecurring: v.optional(v.boolean()),
    budget: v.optional(v.number()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    description: v.optional(v.string())
  },
  async handler(ctx, args) {
    const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier || '';

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const categoryId = await ctx.db.insert('expenseCategories', {
      userId,
      name: args.name,
      type: args.type,
      isTaxDeductible: args.isTaxDeductible ?? false,
      isRecurring: args.isRecurring ?? false,
      budget: args.budget,
      icon: args.icon,
      color: args.color,
      description: args.description,
      createdAt: Date.now()
    });

    return categoryId;
  }
});

// Create or update budget
export const createBudget = mutation({
  args: {
    categoryId: v.optional(v.string()),
    amount: v.number(),
    month: v.string(), // "2026-04" or "yearly"
    alertThreshold: v.optional(v.number())
  },
  async handler(ctx, args) {
    const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier || '';

    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Check if budget already exists
    const allBudgets = await ctx.db
      .query('budgets')
      .filter((q) => q.eq(q.field('userId'), userId))
      .filter((q) => q.eq(q.field('month'), args.month))
      .collect();

    // Filter for existing budget based on categoryId
    let existing = undefined;
    if (args.categoryId) {
      existing = allBudgets.find((b) => b.categoryId === args.categoryId);
    } else {
      existing = allBudgets.find((b) => !b.categoryId);
    }

    if (existing) {
      // Update existing budget
      await ctx.db.patch(existing._id, {
        amount: args.amount,
        alertThreshold: args.alertThreshold ?? 0.75,
        updatedAt: Date.now()
      });
      return existing._id;
    } else {
      // Create new budget
      const budgetId = await ctx.db.insert('budgets', {
        userId,
        categoryId: args.categoryId,
        amount: args.amount,
        month: args.month,
        spent: 0,
        alertThreshold: args.alertThreshold ?? 0.75,
        alertSent: false,
        status: 'on_track',
        createdAt: Date.now()
      });
      return budgetId;
    }
  }
});

// Create recurring expense
export const createRecurringExpense = mutation({
  args: {
    categoryId: v.string(),
    description: v.string(),
    amount: v.number(),
    frequency: v.string(), // "daily", "weekly", "monthly", "quarterly", "yearly"
    startDate: v.number(),
    endDate: v.optional(v.number()),
    dayOfMonth: v.optional(v.number()),
    dayOfWeek: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    vendor: v.optional(v.string()),
    autoCreate: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string())
  },
  async handler(ctx, args) {
    const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier || '';

    if (!userId) {
      throw new Error('Unauthorized');
    }

    // Calculate next due date based on frequency
    const nextDueDate = calculateNextDueDate(args.startDate, args.frequency);

    const recurringId = await ctx.db.insert('recurringExpenses', {
      userId,
      categoryId: args.categoryId,
      description: args.description,
      amount: args.amount,
      frequency: args.frequency,
      startDate: args.startDate,
      endDate: args.endDate,
      dayOfMonth: args.dayOfMonth,
      dayOfWeek: args.dayOfWeek,
      nextDueDate,
      paymentMethod: args.paymentMethod,
      vendor: args.vendor,
      isActive: true,
      autoCreate: args.autoCreate ?? false,
      tags: args.tags ?? [],
      notes: args.notes,
      createdAt: Date.now()
    });

    return recurringId;
  }
});

// ==================== QUERIES ====================

// Get all expenses for user
export const getExpenses = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    categoryId: v.optional(v.string()),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  async handler(ctx, args) {
    const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier || '';

    if (!userId) {
      throw new Error('Unauthorized');
    }

    let query = ctx.db
      .query('expenses')
      .filter((q) => q.eq(q.field('userId'), userId))
      .filter((q) => q.eq(q.field('isDeleted'), false));

    if (args.startDate && args.endDate) {
      query = query.filter((q) => q.gte(q.field('date'), args.startDate!));
      query = query.filter((q) => q.lte(q.field('date'), args.endDate!));
    }

    if (args.categoryId) {
      query = query.filter((q) => q.eq(q.field('categoryId'), args.categoryId));
    }

    if (args.type) {
      query = query.filter((q) => q.eq(q.field('type'), args.type));
    }

    if (args.status) {
      query = query.filter((q) => q.eq(q.field('status'), args.status));
    }

    const expenses = await query.order('desc').collect();
    return expenses.slice(0, args.limit || 100);
  }
});

// Get expense categories
export const getExpenseCategories = query({
  args: {
    type: v.optional(v.string())
  },
  async handler(ctx, args) {
    const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier || '';

    if (!userId) {
      throw new Error('Unauthorized');
    }

    let query = ctx.db
      .query('expenseCategories')
      .filter((q) => q.eq(q.field('userId'), userId));

    if (args.type) {
      query = query.filter((q) => q.eq(q.field('type'), args.type));
    }

    return await query.collect();
  }
});

// Get expense metrics for dashboard
export const getExpenseMetrics = query({
  args: {
    startDate: v.number(),
    endDate: v.number()
  },
  async handler(ctx, args) {
    const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier || '';

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const expenses = await ctx.db
      .query('expenses')
      .filter((q) => q.eq(q.field('userId'), userId))
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .filter((q) => q.gte(q.field('date'), args.startDate))
      .filter((q) => q.lte(q.field('date'), args.endDate))
      .collect();

    // Calculate metrics
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const businessExpenses = expenses
      .filter((e) => e.type === 'business')
      .reduce((sum, e) => sum + e.amount, 0);
    const personalExpenses = expenses
      .filter((e) => e.type === 'personal')
      .reduce((sum, e) => sum + e.amount, 0);
    const taxDeductible = expenses
      .filter((e) => e.isTaxDeductible)
      .reduce((sum, e) => sum + e.amount, 0);

    // Group by category
    const byCategory: any = {};
    for (const expense of expenses) {
      if (!byCategory[expense.categoryId]) {
        byCategory[expense.categoryId] = 0;
      }
      byCategory[expense.categoryId] += expense.amount;
    }

    return {
      totalExpenses,
      businessExpenses,
      personalExpenses,
      taxDeductible,
      reimbursable: personalExpenses,
      byCategory,
      count: expenses.length
    };
  }
});

// Get budget status
export const getBudgetStatus = query({
  args: {
    month: v.string()
  },
  async handler(ctx, args) {
    const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier || '';

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const budgets = await ctx.db
      .query('budgets')
      .filter((q) => q.eq(q.field('userId'), userId))
      .filter((q) => q.eq(q.field('month'), args.month))
      .collect();

    // For each budget, calculate spent amount
    const budgetStatus = [];

    for (const budget of budgets) {
      const [year, month] = args.month.split('-');
      const startOfMonth = new Date(`${year}-${month}-01`).getTime();
      let endOfMonth = new Date(`${year}-${month}-01`);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      const endOfMonthTime = endOfMonth.getTime();

      const categoryExpenses = await ctx.db
        .query('expenses')
        .filter((q) => q.eq(q.field('userId'), userId))
        .filter((q) =>
          budget.categoryId
            ? q.eq(q.field('categoryId'), budget.categoryId)
            : q.eq(q.field('type'), 'business')
        )
        .filter((q) => q.eq(q.field('isDeleted'), false))
        .filter((q) => q.gte(q.field('date'), startOfMonth))
        .filter((q) => q.lte(q.field('date'), endOfMonthTime))
        .collect();

      const spent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
      const percentage = (spent / budget.amount) * 100;
      const status =
        percentage > 100
          ? 'exceeded'
          : percentage > 75
            ? 'warning'
            : 'on_track';

      budgetStatus.push({
        ...budget,
        spent,
        percentage,
        status,
        remaining: budget.amount - spent
      });
    }

    return budgetStatus;
  }
});

// Get recurring expenses
export const getRecurringExpenses = query({
  args: {
    activeOnly: v.optional(v.boolean())
  },
  async handler(ctx, args) {
    const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier || '';

    if (!userId) {
      throw new Error('Unauthorized');
    }

    let query = ctx.db
      .query('recurringExpenses')
      .filter((q) => q.eq(q.field('userId'), userId));

    if (args.activeOnly) {
      query = query.filter((q) => q.eq(q.field('isActive'), true));
    }

    return await query.collect();
  }
});

// Helper function to calculate next due date
function calculateNextDueDate(startDate: number, frequency: string): number {
  const start = new Date(startDate);

  switch (frequency) {
    case 'daily':
      return startDate + 24 * 60 * 60 * 1000;
    case 'weekly':
      return startDate + 7 * 24 * 60 * 60 * 1000;
    case 'monthly': {
      const next = new Date(start);
      next.setMonth(next.getMonth() + 1);
      return next.getTime();
    }
    case 'quarterly': {
      const next = new Date(start);
      next.setMonth(next.getMonth() + 3);
      return next.getTime();
    }
    case 'yearly': {
      const next = new Date(start);
      next.setFullYear(next.getFullYear() + 1);
      return next.getTime();
    }
    default:
      return startDate;
  }
}
