import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

// ==================== AUDIT TRAIL ====================
export const getAuditLog = query({
  args: {
    limit: v.optional(v.number()),
    entityType: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // FIX: Use proper RBAC for multi-tenant isolation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_AUDIT_LOGS);

    // Use ownerId for data scope (staff sees owner's audit logs)
    const userId = getDataScopeUserId(caller);

    let query = ctx.db
      .query('auditLog')
      .filter((q) => q.eq(q.field('userId'), userId))
      .order('desc');

    if (args.entityType) {
      query = query.filter((q) => q.eq(q.field('entityType'), args.entityType));
    }

    const logs = await query.take(args.limit || 100);

    return logs.map((log: any) => ({
      id: log._id,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action,
      changedBy: log.changedBy,
      timestamp: log.timestamp,
      oldValue: log.oldValue,
      newValue: log.newValue,
      details: log.details
    }));
  }
});

export const logAuditEvent = mutation({
  args: {
    entityType: v.string(),
    entityId: v.string(),
    action: v.string(),
    changedBy: v.string(),
    oldValue: v.optional(v.any()),
    newValue: v.optional(v.any()),
    details: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // FIX: Use proper RBAC for multi-tenant isolation
    const caller = await resolveCallerContext(ctx);

    // Use ownerId for data scope (staff actions are logged under owner's organization)
    const userId = getDataScopeUserId(caller);

    const logId = await ctx.db.insert('auditLog', {
      userId,
      entityType: args.entityType,
      entityId: args.entityId,
      action: args.action,
      changes: {
        changedBy: args.changedBy || caller.callerId, // Record actual user who made the change
        oldValue: args.oldValue,
        newValue: args.newValue,
        details: args.details
      },
      createdAt: Date.now()
    });

    return { success: true, logId, message: 'Audit event logged' };
  }
});

// ==================== PHYSICAL INVENTORY RECONCILIATION ====================
export const getInventoryReconciliations = query({
  args: {
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // FIX: Use proper RBAC for multi-tenant isolation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_STOCK);

    // Use ownerId for data scope (staff sees owner's reconciliations)
    const userId = getDataScopeUserId(caller);

    const reconciliations = await ctx.db
      .query('inventoryReconciliations')
      .filter((q) => q.eq(q.field('userId'), userId))
      .order('desc')
      .take(args.limit || 50);

    return {
      reconciliations,
      summary: {
        total: reconciliations.length,
        flagged: reconciliations.filter((r: any) => r.status === 'flagged')
          .length,
        reconciled: reconciliations.filter(
          (r: any) => r.status === 'reconciled'
        ).length,
        averageVariance:
          reconciliations.length > 0
            ? Math.abs(
                reconciliations.reduce(
                  (sum: number, r: any) => sum + (r.variancePercent || 0),
                  0
                ) / reconciliations.length
              )
            : 0
      }
    };
  }
});

export const recordInventoryReconciliation = mutation({
  args: {
    productId: v.string(),
    productName: v.string(),
    systemQuantity: v.number(),
    physicalQuantity: v.number(),
    location: v.optional(v.string()),
    notes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // FIX: Use proper RBAC for multi-tenant isolation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_STOCK);

    // Use ownerId for data scope (staff records reconciliations in owner's data)
    const userId = getDataScopeUserId(caller);

    const variance = args.physicalQuantity - args.systemQuantity;
    const variancePercent =
      args.systemQuantity > 0 ? (variance / args.systemQuantity) * 100 : 0;

    const reconciliationId = await ctx.db.insert('inventoryReconciliations', {
      userId,
      productId: args.productId,
      productName: args.productName,
      systemQuantity: args.systemQuantity,
      physicalQuantity: args.physicalQuantity,
      variance,
      variancePercent,
      status: Math.abs(variancePercent) > 5 ? 'flagged' : 'reconciled',
      location: args.location || 'Default',
      notes: args.notes,
      reconciliationDate: Date.now(),
      createdAt: Date.now()
    });

    // Log audit event
    await ctx.db.insert('auditLog', {
      userId,
      entityType: 'inventoryReconciliation',
      entityId: reconciliationId,
      action: 'create',
      changes: {
        changedBy: caller.callerId, // Record actual user who made the change
        oldValue: { quantity: args.systemQuantity },
        newValue: { quantity: args.physicalQuantity, variance }
      },
      createdAt: Date.now()
    });

    return {
      success: true,
      reconciliationId,
      variance,
      variancePercent,
      status:
        Math.abs(variancePercent) > 5
          ? 'Flagged - Review required'
          : 'Reconciled'
    };
  }
});

// ==================== PRICE CHANGE APPROVALS ====================
export const getPriceChangeRequests = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // FIX: Use proper RBAC for multi-tenant isolation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);

    // Use ownerId for data scope (staff sees owner's price change requests)
    const userId = getDataScopeUserId(caller);

    let query_obj = ctx.db
      .query('priceChangeRequests')
      .filter((q) => q.eq(q.field('userId'), userId));

    if (args.status) {
      query_obj = query_obj.filter((q) =>
        q.eq(q.field('approvalStatus'), args.status)
      );
    }

    const requests = await query_obj.order('desc').take(args.limit || 50);

    return {
      requests,
      summary: {
        total: requests.length,
        pending: requests.filter((r: any) => r.approvalStatus === 'pending')
          .length,
        approved: requests.filter((r: any) => r.approvalStatus === 'approved')
          .length,
        rejected: requests.filter((r: any) => r.approvalStatus === 'rejected')
          .length,
        avgPriceChange:
          requests.length > 0
            ? Math.abs(
                requests.reduce(
                  (sum: number, r: any) => sum + (r.priceChangePercent || 0),
                  0
                ) / requests.length
              )
            : 0
      }
    };
  }
});

export const requestPriceChange = mutation({
  args: {
    productId: v.string(),
    productName: v.string(),
    oldPrice: v.number(),
    newPrice: v.number(),
    reason: v.optional(v.string()),
    requestedBy: v.string()
  },
  handler: async (ctx, args) => {
    // FIX: Use proper RBAC for multi-tenant isolation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.EDIT_PRODUCT);

    // Use ownerId for data scope (staff requests price changes in owner's data)
    const userId = getDataScopeUserId(caller);

    const priceChangePercent =
      ((args.newPrice - args.oldPrice) / args.oldPrice) * 100;
    const requiresApproval = Math.abs(priceChangePercent) > 10;

    const requestId = await ctx.db.insert('priceChangeRequests', {
      userId,
      productId: args.productId,
      productName: args.productName,
      oldPrice: args.oldPrice,
      newPrice: args.newPrice,
      priceChangePercent,
      reason: args.reason || 'No reason provided',
      requestedBy: caller.callerId, // Record actual user who made the request
      requiresApproval,
      approvalStatus: requiresApproval ? 'pending' : 'auto_approved',
      createdAt: Date.now()
    });

    // Log audit
    await ctx.db.insert('auditLog', {
      userId,
      entityType: 'priceChange',
      entityId: requestId,
      action: 'create',
      changes: {
        changedBy: caller.callerId, // Record actual user who made the request
        oldValue: { price: args.oldPrice },
        newValue: { price: args.newPrice }
      },
      createdAt: Date.now()
    });

    return {
      success: true,
      requestId,
      priceChangePercent,
      requiresApproval,
      message: requiresApproval
        ? 'Awaiting approval'
        : 'Price change applied automatically'
    };
  }
});

export const approvePriceChange = mutation({
  args: {
    requestId: v.string(),
    approvedBy: v.string(),
    notes: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // FIX: Use proper RBAC for multi-tenant isolation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.APPROVE_TRANSACTION);

    // Use ownerId for data scope
    const userId = getDataScopeUserId(caller);

    // Update the price change request
    await ctx.db.patch(args.requestId as any, {
      approvalStatus: 'approved',
      approvedBy: caller.callerId, // Record actual user who approved
      approvalNotes: args.notes,
      approvalDate: Date.now()
    });

    // Log audit
    await ctx.db.insert('auditLog', {
      userId,
      entityType: 'priceChangeApproval',
      entityId: args.requestId,
      action: 'approve',
      changes: {
        changedBy: caller.callerId, // Record actual user who approved
        status: 'approved',
        notes: args.notes
      },
      createdAt: Date.now()
    });

    return { success: true, message: 'Price change approved' };
  }
});

export const rejectPriceChange = mutation({
  args: {
    requestId: v.string(),
    rejectedBy: v.string(),
    reason: v.string()
  },
  handler: async (ctx, args) => {
    // FIX: Use proper RBAC for multi-tenant isolation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.APPROVE_TRANSACTION);

    // Use ownerId for data scope
    const userId = getDataScopeUserId(caller);

    // Update the price change request
    await ctx.db.patch(args.requestId as any, {
      approvalStatus: 'rejected',
      rejectedBy: caller.callerId, // Record actual user who rejected
      rejectionReason: args.reason,
      rejectionDate: Date.now()
    });

    // Log audit
    await ctx.db.insert('auditLog', {
      userId,
      entityType: 'priceChangeApproval',
      entityId: args.requestId,
      action: 'reject',
      changes: {
        changedBy: caller.callerId, // Record actual user who rejected
        status: 'rejected',
        reason: args.reason
      },
      createdAt: Date.now()
    });

    return { success: true, message: 'Price change rejected' };
  }
});

// ==================== DISCOUNT AUDIT ====================
export const getDiscountAudit = query({
  args: {
    limit: v.optional(v.number()),
    minAmount: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // FIX: Use proper RBAC for multi-tenant isolation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_AUDIT_LOGS);

    // Use ownerId for data scope (staff sees owner's discount audit)
    const userId = getDataScopeUserId(caller);

    const discounts = await ctx.db
      .query('discountAudit')
      .filter((q) => q.eq(q.field('userId'), userId))
      .order('desc')
      .take(args.limit || 100);

    const filtered =
      args.minAmount != null
        ? discounts.filter((d: any) => d.amount >= (args.minAmount ?? 0))
        : discounts;

    return {
      discounts: filtered,
      summary: {
        total: filtered.length,
        totalAmount: filtered.reduce(
          (sum: number, d: any) => sum + d.amount,
          0
        ),
        averageDiscount:
          filtered.length > 0
            ? filtered.reduce((sum: number, d: any) => sum + d.amount, 0) /
              filtered.length
            : 0,
        highValue: filtered.filter((d: any) => d.amount > 500).length,
        byType: {
          percentage: filtered.filter(
            (d: any) => d.discountType === 'percentage'
          ).length,
          fixed: filtered.filter((d: any) => d.discountType === 'fixed').length,
          loyalty: filtered.filter((d: any) => d.discountType === 'loyalty')
            .length
        }
      }
    };
  }
});

export const recordDiscount = mutation({
  args: {
    transactionId: v.string(),
    amount: v.number(),
    discountType: v.string(), // "percentage", "fixed", "loyalty"
    appliedBy: v.string(),
    reason: v.optional(v.string()),
    customerName: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const discountId = await ctx.db.insert('discountAudit', {
      userId: identity.subject,
      transactionId: args.transactionId,
      amount: args.amount,
      discountType: args.discountType,
      appliedBy: args.appliedBy,
      reason: args.reason || 'Not specified',
      customerName: args.customerName,
      requiresApproval: args.amount > 500,
      approvalStatus: args.amount > 500 ? 'pending' : 'approved',
      createdAt: Date.now()
    });

    // Log audit
    await ctx.db.insert('auditLog', {
      userId: identity.subject,
      entityType: 'discount',
      entityId: discountId,
      action: 'create',
      changes: {
        changedBy: args.appliedBy,
        amount: args.amount,
        type: args.discountType
      },
      createdAt: Date.now()
    });

    return {
      success: true,
      discountId,
      requiresApproval: args.amount > 500,
      message: `Discount of ₹${args.amount} recorded (${args.discountType})`
    };
  }
});

// ==================== TAX COMPLIANCE REPORTS ====================
export const getTaxComplianceStatus = query({
  args: {
    period: v.optional(v.string()), // "monthly", "quarterly", "annual"
    year: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const now = new Date();
    const year = args.year || now.getFullYear();
    const month = now.getMonth() + 1;

    // Get transactions for tax calculation
    const transactions = await ctx.db
      .query('transactions')
      .filter((q) => q.eq(q.field('userId'), identity.subject))
      .take(1000);

    const totalSales = transactions.reduce(
      (sum: number, t: any) => sum + (t.amount || 0),
      0
    );
    const totalTax = totalSales * 0.16; // 16% GST for Nepal(Should Be Country Specific)

    return {
      period: args.period || 'monthly',
      year,
      month,
      totalSales,
      totalTax,
      taxRate: 0.16,
      taxPaymentStatus: 'due',
      dueDate: new Date(year, month, 20).getTime(),
      filingDeadline: new Date(year, month + 1, 15).getTime(),
      compliance: {
        invoicesIssued: transactions.length,
        invoicesRecorded: transactions.filter((t: any) => t.details).length,
        documentsUpload: 'active',
        lastFiled: Date.now() - 30 * 24 * 60 * 60 * 1000
      },
      summary: {
        invoiceValue: totalSales,
        taxableAmount: totalSales,
        totalTaxDue: totalTax,
        penalties: 0,
        previousBalance: 0,
        totalAmount: totalTax
      }
    };
  }
});

export const generateTaxReport = mutation({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    reportType: v.string() // "monthly", "quarterly", "annual"
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const startDate = new Date(args.startDate);
    const endDate = new Date(args.endDate);
    const daysInPeriod =
      (args.endDate - args.startDate) / (1000 * 60 * 60 * 24);

    // Get transactions in period
    const transactions = await ctx.db
      .query('transactions')
      .filter((q) => q.eq(q.field('userId'), identity.subject))
      .take(5000);

    const inPeriod = transactions.filter(
      (t: any) => t.createdAt >= args.startDate && t.createdAt <= args.endDate
    );

    const totalSalesValue = inPeriod.reduce(
      (sum: number, t: any) => sum + (t.amount || 0),
      0
    );
    const totalTaxCollected = totalSalesValue * 0.16;

    const reportId = await ctx.db.insert('taxReports', {
      userId: identity.subject,
      reportType: args.reportType,
      startDate: args.startDate,
      endDate: args.endDate,
      totalTransactions: inPeriod.length,
      totalSalesValue,
      totalTaxCollected,
      averageTaxRate: 0.16,
      summary: {
        grossRevenue: totalSalesValue,
        taxableIncome: totalSalesValue,
        taxableTax: totalTaxCollected,
        penalties: 0,
        totalTaxDue: totalTaxCollected
      },
      status: 'generated',
      createdAt: Date.now()
    });

    // Log audit
    await ctx.db.insert('auditLog', {
      userId: identity.subject,
      entityType: 'taxReport',
      entityId: reportId,
      action: 'create',
      changes: {
        reportType: args.reportType,
        totalTaxDue: totalTaxCollected,
        transactionCount: inPeriod.length
      },
      createdAt: Date.now()
    });

    return {
      success: true,
      reportId,
      period: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      totalTransactions: inPeriod.length,
      totalSalesValue,
      totalTaxCollected,
      message: 'Tax report generated successfully'
    };
  }
});

export const recordTaxPayment = mutation({
  args: {
    amount: v.number(),
    paymentDate: v.number(),
    period: v.string(),
    referenceNumber: v.string(),
    paymentMethod: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const paymentId = await ctx.db.insert('taxPayments', {
      userId: identity.subject,
      amount: args.amount,
      paymentDate: args.paymentDate,
      period: args.period,
      referenceNumber: args.referenceNumber,
      paymentMethod: args.paymentMethod,
      status: 'confirmed',
      receiptUrl: `/receipts/tax-${args.referenceNumber}.pdf`,
      createdAt: Date.now()
    });

    // Log audit
    await ctx.db.insert('auditLog', {
      userId: identity.subject,
      entityType: 'taxPayment',
      entityId: paymentId,
      action: 'create',
      changes: {
        amount: args.amount,
        period: args.period,
        referenceNumber: args.referenceNumber
      },
      createdAt: Date.now()
    });

    return {
      success: true,
      paymentId,
      message: `Tax payment of ₹${args.amount} recorded for ${args.period}`
    };
  }
});
