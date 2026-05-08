import { v } from 'convex/values';
import { mutation, query, internalMutation } from './_generated/server';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

// ==================== BUDGET MANAGEMENT ====================

// Calculate budget status and update spent amount
export const updateBudgetSpent = internalMutation({
  args: {
    userId: v.string(),
    month: v.string(),
    categoryId: v.optional(v.string())
  },
  async handler(ctx, args) {
    const [year, monthStr] = args.month.split('-');
    const startOfMonth = new Date(`${year}-${monthStr}-01`).getTime();
    let endOfMonth = new Date(`${year}-${monthStr}-01`);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    const endOfMonthTime = endOfMonth.getTime();

    // Get expenses for this period
    let expenseQuery = ctx.db
      .query('expenses')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .filter((q) => q.gte(q.field('date'), startOfMonth))
      .filter((q) => q.lte(q.field('date'), endOfMonthTime));

    if (args.categoryId) {
      expenseQuery = expenseQuery.filter((q) =>
        q.eq(q.field('categoryId'), args.categoryId)
      );
    }

    const expenses = await expenseQuery.collect();
    const spent = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Get the budget record
    let budgetQuery = ctx.db
      .query('budgets')
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .filter((q) => q.eq(q.field('month'), args.month));

    if (args.categoryId) {
      budgetQuery = budgetQuery.filter((q) =>
        q.eq(q.field('categoryId'), args.categoryId)
      );
    }

    let budget = await budgetQuery.first();

    // If no categoryId filter requested and nothing found, fetch all budgets for the month
    if (!budget && !args.categoryId) {
      const allBudgets = await ctx.db
        .query('budgets')
        .filter((q) => q.eq(q.field('userId'), args.userId))
        .filter((q) => q.eq(q.field('month'), args.month))
        .collect();
      budget = allBudgets.find((b) => !b.categoryId) || null;
    }

    if (budget) {
      const percentage = (spent / budget.amount) * 100;
      let status = 'on_track';
      if (percentage > 100) status = 'exceeded';
      else if (percentage > budget.alertThreshold * 100) status = 'warning';

      await ctx.db.patch(budget._id, {
        spent,
        status,
        updatedAt: Date.now()
      });
    }
  }
});

// Check and send budget alerts
export const checkBudgetAlerts = mutation({
  args: {
    month: v.string()
  },
  async handler(ctx, args) {
    // FIX: Use proper RBAC for multi-tenant isolation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_EXPENSES);

    // Use ownerId for data scope (staff manages budgets in owner's data)
    const userId = getDataScopeUserId(caller);

    const budgets = await ctx.db
      .query('budgets')
      .filter((q) => q.eq(q.field('userId'), userId))
      .filter((q) => q.eq(q.field('month'), args.month))
      .collect();

    const alerts = [];

    for (const budget of budgets) {
      const percentage = (budget.spent / budget.amount) * 100;

      // Check if alert should be sent
      if (percentage >= budget.alertThreshold * 100 && !budget.alertSent) {
        alerts.push({
          budgetId: budget._id,
          spent: budget.spent,
          limit: budget.amount,
          percentage: Math.round(percentage),
          status: percentage > 100 ? 'exceeded' : 'warning',
          categoryId: budget.categoryId
        });

        // Mark alert as sent
        await ctx.db.patch(budget._id, {
          alertSent: true
        });
      }
    }

    return alerts;
  }
});

// ==================== RECURRING EXPENSE AUTOMATION ====================

// Process recurring expenses and create new expense records
export const processRecurringExpenses = internalMutation({
  async handler(ctx) {
    const now = Date.now();

    // Get all active recurring expenses where nextDueDate <= now
    const recurringExpenses = await ctx.db
      .query('recurringExpenses')
      .filter((q) => q.eq(q.field('isActive'), true))
      .filter((q) => q.lte(q.field('nextDueDate'), now))
      .filter((q) => q.eq(q.field('autoCreate'), true))
      .collect();

    for (const recurring of recurringExpenses) {
      // Check if end date has passed
      if (recurring.endDate && recurring.endDate < now) {
        // Deactivate the recurring expense
        await ctx.db.patch(recurring._id, {
          isActive: false
        });
        continue;
      }

      // Create new expense from template
      const expenseId = await ctx.db.insert('expenses', {
        userId: recurring.userId,
        categoryId: recurring.categoryId,
        amount: recurring.amount,
        description: recurring.description,
        date: now,
        paymentMethod: recurring.paymentMethod || 'auto',
        type: 'business',
        status: 'pending',
        vendor: recurring.vendor,
        isTaxDeductible: false,
        isReimbursable: false,
        tags: recurring.tags,
        notes: `Auto-generated from recurring expense`,
        recurringExpenseId: recurring._id,
        isDeleted: false,
        createdAt: now
      });

      // Calculate next due date
      const nextDueDate = calculateNextDueDate(
        recurring.nextDueDate,
        recurring.frequency,
        recurring.dayOfMonth,
        recurring.dayOfWeek
      );

      // Update recurring expense record
      await ctx.db.patch(recurring._id, {
        lastGeneratedDate: now,
        nextDueDate
      });
    }
  }
});

// Manually create recurring expenses for a date range
export const createRecurringExpensesBatch = mutation({
  args: {
    startDate: v.number(),
    endDate: v.number()
  },
  async handler(ctx, args) {
    // FIX: Use proper RBAC for multi-tenant isolation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_EXPENSES);

    // Use ownerId for data scope (staff manages recurring expenses in owner's data)
    const userId = getDataScopeUserId(caller);

    const recurringExpenses = await ctx.db
      .query('recurringExpenses')
      .filter((q) => q.eq(q.field('userId'), userId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    let createdCount = 0;

    for (const recurring of recurringExpenses) {
      // Skip if already generated in this range
      if (
        recurring.lastGeneratedDate &&
        recurring.lastGeneratedDate >= args.startDate
      ) {
        continue;
      }

      // Calculate all due dates in the range
      let currentDueDate = recurring.nextDueDate;

      while (currentDueDate <= args.endDate) {
        if (currentDueDate >= args.startDate) {
          // Check if not already created
          const existing = await ctx.db
            .query('expenses')
            .filter((q) => q.eq(q.field('userId'), userId))
            .filter((q) => q.eq(q.field('recurringExpenseId'), recurring._id))
            .filter((q) => q.eq(q.field('date'), currentDueDate))
            .first();

          if (!existing) {
            await ctx.db.insert('expenses', {
              userId: recurring.userId,
              categoryId: recurring.categoryId,
              amount: recurring.amount,
              description: recurring.description,
              date: currentDueDate,
              paymentMethod: recurring.paymentMethod || 'auto',
              type: 'business',
              status: 'pending',
              vendor: recurring.vendor,
              isTaxDeductible: false,
              isReimbursable: false,
              tags: recurring.tags,
              notes: `Auto-generated from recurring expense (batch)`,
              recurringExpenseId: recurring._id,
              isDeleted: false,
              createdAt: Date.now()
            });
            createdCount++;
          }
        }

        currentDueDate = calculateNextDueDate(
          currentDueDate,
          recurring.frequency
        );
      }
    }

    return { createdCount };
  }
});

// Get budget forecast
export const getBudgetForecast = query({
  args: {
    month: v.string()
  },
  async handler(ctx, args) {
    // FIX: Use proper RBAC for multi-tenant isolation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_FINANCIAL_REPORTS);

    // Use ownerId for data scope (staff sees owner's budget forecast)
    const userId = getDataScopeUserId(caller);

    const budgets = await ctx.db
      .query('budgets')
      .filter((q) => q.eq(q.field('userId'), userId))
      .filter((q) => q.eq(q.field('month'), args.month))
      .collect();

    // Get recurring expenses for forecast
    const recurringExpenses = await ctx.db
      .query('recurringExpenses')
      .filter((q) => q.eq(q.field('userId'), userId))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    const forecast = budgets.map((budget) => {
      // Calculate projected recurring expenses for this category
      const categoryRecurring = recurringExpenses
        .filter((r) => r.categoryId === budget.categoryId)
        .reduce((sum, r) => sum + r.amount, 0);

      // If monthly frequency, add 1x
      // If weekly, add 4-5x per month
      // etc.

      const projectedRecurring = categoryRecurring;
      const projectedTotal = budget.spent + projectedRecurring;
      const projectedPercentage = (projectedTotal / budget.amount) * 100;

      return {
        ...budget,
        projectedRecurring,
        projectedTotal,
        projectedPercentage,
        forecast: projectedPercentage > 100 ? 'over_budget' : 'on_track'
      };
    });

    return forecast;
  }
});

// ==================== APPROVAL WORKFLOW ====================

// Submit expense for approval
export const submitExpenseForApproval = mutation({
  args: {
    expenseId: v.string(),
    approvers: v.array(v.string()) // User IDs in approval order
  },
  async handler(ctx, args) {
    // FIX: Use proper RBAC for multi-tenant isolation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_EXPENSES);

    // Use ownerId for data scope (staff submits expenses in owner's data)
    const userId = getDataScopeUserId(caller);

    // Query expenses and find the one with matching string ID
    const allExpenses = await ctx.db
      .query('expenses')
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect();
    const expense = allExpenses.find(
      (e) => e._id.toString() === args.expenseId
    );

    if (!expense) {
      throw new Error('Expense not found or unauthorized');
    }

    // Create approval workflow record
    const approvalId = await ctx.db.insert('expenseApprovals', {
      userId: userId,
      expenseId: expense._id.toString(),
      requestedBy: caller.callerId, // Record actual user who submitted
      approvers: args.approvers.map((approverId, index) => ({
        approverUserId: approverId,
        order: index + 1,
        status: 'pending'
      })),
      currentApprovalLevel: 1,
      overallStatus: 'pending',
      createdAt: Date.now()
    });

    // Update expense status
    await ctx.db.patch(expense._id, {
      status: 'pending',
      updatedAt: Date.now()
    });

    return approvalId;
  }
});

// Approve expense at current level
export const approveExpenseAtLevel = mutation({
  args: {
    approvalId: v.string(),
    comments: v.optional(v.string())
  },
  async handler(ctx, args) {
    // FIX: Use proper RBAC for multi-tenant isolation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.APPROVE_TRANSACTION);

    // Query approvals and find the one with matching string ID
    const allApprovals = await ctx.db.query('expenseApprovals').collect();
    const approval = allApprovals.find(
      (a) => a._id.toString() === args.approvalId
    );

    if (!approval) {
      throw new Error('Approval record not found');
    }

    const currentApprover =
      approval.approvers[approval.currentApprovalLevel - 1];

    // FIX: Check if caller is the designated approver (using callerId for identity check)
    if (currentApprover.approverUserId !== caller.callerId) {
      throw new Error('Not authorized to approve at this level');
    }

    // Update current approver status
    const updatedApprovers = [...approval.approvers];
    updatedApprovers[approval.currentApprovalLevel - 1] = {
      ...currentApprover,
      status: 'approved',
      approvalDate: Date.now(),
      comments: args.comments
    };

    let newStatus = 'pending';
    let newLevel = approval.currentApprovalLevel;

    // Check if all approvals complete
    if (approval.currentApprovalLevel === approval.approvers.length) {
      newStatus = 'approved';
    } else {
      newLevel = approval.currentApprovalLevel + 1;
    }

    await ctx.db.patch(approval._id, {
      approvers: updatedApprovers,
      currentApprovalLevel: newLevel,
      overallStatus: newStatus,
      updatedAt: Date.now()
    });

    // If fully approved, update expense
    if (newStatus === 'approved' && approval) {
      // Query all expenses and find the matching one
      const allExpenses = await ctx.db.query('expenses').collect();
      const expense = allExpenses.find(
        (e) => e._id.toString() === approval.expenseId
      );
      if (expense) {
        await ctx.db.patch(expense._id, {
          status: 'approved',
          updatedAt: Date.now()
        });
      }
    }

    return args.approvalId;
  }
});

// Reject expense
export const rejectExpense = mutation({
  args: {
    approvalId: v.string(),
    reason: v.string()
  },
  async handler(ctx, args) {
    // FIX: Use proper RBAC for multi-tenant isolation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.APPROVE_TRANSACTION);

    // Query approvals and find the one with matching string ID
    const allApprovals = await ctx.db.query('expenseApprovals').collect();
    const approval = allApprovals.find(
      (a) => a._id.toString() === args.approvalId
    );

    if (!approval) {
      throw new Error('Approval record not found');
    }

    const currentApprover =
      approval.approvers[approval.currentApprovalLevel - 1];

    // FIX: Check if caller is the designated approver (using callerId for identity check)
    if (currentApprover.approverUserId !== caller.callerId) {
      throw new Error('Not authorized to reject at this level');
    }

    // Update approvers
    const updatedApprovers = [...approval.approvers];
    updatedApprovers[approval.currentApprovalLevel - 1] = {
      ...currentApprover,
      status: 'rejected',
      approvalDate: Date.now(),
      comments: args.reason
    };

    await ctx.db.patch(approval._id, {
      approvers: updatedApprovers,
      overallStatus: 'rejected',
      updatedAt: Date.now()
    });

    // Update expense to rejected
    if (approval) {
      const allExpenses = await ctx.db.query('expenses').collect();
      const expense = allExpenses.find(
        (e) => e._id.toString() === approval.expenseId
      );
      if (expense) {
        await ctx.db.patch(expense._id, {
          status: 'rejected',
          notes: `Rejected: ${args.reason}`,
          updatedAt: Date.now()
        });
      }
    }

    return args.approvalId;
  }
});

// Get pending approvals for current user
export const getPendingApprovals = query({
  async handler(ctx) {
    // FIX: Use proper RBAC for multi-tenant isolation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_FINANCIAL_REPORTS);

    // FIX: Use callerId to check if current user is the designated approver
    const approvals = await ctx.db
      .query('expenseApprovals')
      .filter((q) => q.eq(q.field('overallStatus'), 'pending'))
      .collect();

    // Filter to only approvals where current user is the current approver
    const pending = [];

    for (const approval of approvals) {
      const currentApprover =
        approval.approvers[approval.currentApprovalLevel - 1];
      // FIX: Check if caller is the designated approver
      if (currentApprover.approverUserId === caller.callerId) {
        // Query expenses and find matching one
        const allExpenses = await ctx.db.query('expenses').collect();
        const expense = allExpenses.find(
          (e) => e._id.toString() === approval.expenseId
        );
        pending.push({
          ...approval,
          expense
        });
      }
    }

    return pending;
  }
});

// Helper function
function calculateNextDueDate(
  currentDate: number,
  frequency: string,
  dayOfMonth?: number,
  dayOfWeek?: string
): number {
  const date = new Date(currentDate);

  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      if (dayOfMonth) {
        date.setDate(dayOfMonth);
      }
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date.getTime();
}
