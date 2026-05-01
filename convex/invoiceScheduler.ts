import { internalMutation, query, mutation } from './_generated/server';
import { v } from 'convex/values';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

/**
 * STEP 7.1 & 7.5: Recurring Invoices & Payment Reminders
 *
 * These functions can be triggered via API endpoints:
 * - POST /api/cron/invoices (generate due invoices)
 * - POST /api/cron/reminders (send payment reminders)
 *
 * Set up Vercel Cron to call these daily.
 */

// ============ RECURRING INVOICES ============

// Mutation to create a recurring invoice template
export const createRecurringInvoice = mutation({
  args: {
    name: v.string(),
    customerName: v.string(),
    customerAddress: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    customerPan: v.optional(v.string()),
    items: v.array(
      v.object({
        sn: v.number(),
        hsCode: v.string(),
        description: v.string(),
        quantity: v.number(),
        unit: v.string(),
        rate: v.number(),
        amount: v.number()
      })
    ),
    totalAmount: v.number(),
    taxableAmount: v.optional(v.number()),
    vatAmount: v.optional(v.number()),
    discount: v.optional(v.number()),
    amountInWords: v.optional(v.string()),
    frequency: v.string(), // daily, weekly, biweekly, monthly, quarterly, yearly
    startDate: v.number(),
    defaultPaymentMode: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.CREATE_TRANSACTION);
    const userId = getDataScopeUserId(caller);

    const now = Date.now();
    const nextDueDate = calculateNextDueDate(args.frequency, args.startDate);

    const templateId = await ctx.db.insert('recurringInvoices', {
      userId,
      name: args.name,
      customerName: args.customerName,
      customerAddress: args.customerAddress,
      customerPhone: args.customerPhone,
      customerPan: args.customerPan,
      items: args.items,
      totalAmount: args.totalAmount,
      taxableAmount: args.taxableAmount,
      vatAmount: args.vatAmount,
      discount: args.discount,
      amountInWords: args.amountInWords,
      frequency: args.frequency,
      startDate: args.startDate,
      nextDueDate,
      defaultPaymentMode: args.defaultPaymentMode || 'credit',
      isActive: true,
      isDeleted: false,
      lastGeneratedAt: undefined,
      createdAt: now,
      updatedAt: now
    });

    return templateId;
  }
});

// Public query to get recurring invoice templates
export const getRecurringInvoices = query({
  args: {},
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);

    return await ctx.db
      .query('recurringInvoices')
      .collect()
      .then((ts) => ts.filter((t) => t.userId === userId && !t.isDeleted));
  }
});

// Mutation to pause/resume a recurring invoice
export const toggleRecurringInvoice = mutation({
  args: {
    templateId: v.id('recurringInvoices'),
    isActive: v.boolean()
  },
  handler: async (ctx, { templateId, isActive }) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.EDIT_TRANSACTION);
    const userId = getDataScopeUserId(caller);

    const template = await ctx.db.get(templateId);
    if (!template || template.userId !== userId) {
      throw new Error('Template not found');
    }

    await ctx.db.patch(templateId, {
      isActive,
      updatedAt: Date.now()
    });
  }
});

// Mutation to delete a recurring invoice template
export const deleteRecurringInvoice = mutation({
  args: {
    templateId: v.id('recurringInvoices')
  },
  handler: async (ctx, { templateId }) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.DELETE_TRANSACTION);
    const userId = getDataScopeUserId(caller);

    const template = await ctx.db.get(templateId);
    if (!template || template.userId !== userId) {
      throw new Error('Template not found');
    }

    await ctx.db.patch(templateId, {
      isDeleted: true,
      isActive: false,
      updatedAt: Date.now()
    });
  }
});

// Query to get upcoming due invoices
export const getUpcomingInvoices = query({
  args: {},
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);

    const now = Date.now();
    const nextWeek = now + 7 * 24 * 60 * 60 * 1000;

    return await ctx.db
      .query('recurringInvoices')
      .collect()
      .then((templates) =>
        templates.filter(
          (t) =>
            t.userId === userId &&
            t.isActive &&
            !t.isDeleted &&
            t.nextDueDate &&
            t.nextDueDate <= nextWeek
        )
      );
  }
});

// ============ CRON JOBS (Call these via API endpoints) ============

// NOTE: These are made public mutations (not internal) so they can be called
// from API routes. In production, add API key validation for security.

// Public mutation to generate invoices that are due (call via API)
export const generateDueInvoices = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get ALL active recurring invoice templates (system-wide)
    const templates = await ctx.db
      .query('recurringInvoices')
      .collect()
      .then((ts) => ts.filter((t) => t.isActive && !t.isDeleted));

    let generatedCount = 0;

    for (const template of templates) {
      // Skip if not due yet
      if (template.nextDueDate && template.nextDueDate > now) {
        continue;
      }

      // Generate invoice from template
      const invoiceNumber = `REC-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      await ctx.db.insert('invoices', {
        userId: template.userId,
        transactionDate: new Date().toISOString().split('T')[0],
        invoiceNumber,
        date: new Date().toISOString().split('T')[0],
        miti: new Date().toISOString().split('T')[0],
        paymentMode: template.defaultPaymentMode || 'credit',
        buyerName: template.customerName,
        buyerAddress: template.customerAddress || '',
        buyerPhone: template.customerPhone,
        buyerPan: template.customerPan,
        items: template.items,
        value: template.totalAmount,
        discount: template.discount,
        taxableAmount: template.taxableAmount,
        vatAmount: template.vatAmount,
        totalAmount: template.totalAmount,
        amountInWords: template.amountInWords,
        printDate: new Date().toISOString(),
        printTime: new Date().toLocaleTimeString(),
        remarks: `Recurring invoice generated from template: ${template.name}`,
        isRecurring: true,
        recurringTemplateId: template._id,
        isDeleted: false,
        createdAt: now,
        updatedAt: now
      });

      // Update next due date
      const nextDue = calculateNextDueDate(
        template.frequency,
        template.nextDueDate || now
      );
      await ctx.db.patch(template._id, {
        lastGeneratedAt: now,
        nextDueDate: nextDue
      });

      generatedCount++;
    }

    return { generatedCount };
  }
});

// Public mutation to send payment reminders (call via API)
export const sendPaymentReminders = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const reminderStats = {
      sent: 0,
      failed: 0
    };

    // Get all credit invoices that are past due
    const invoices = await ctx.db
      .query('invoices')
      .collect()
      .then((inv) =>
        inv.filter(
          (inv) =>
            !inv.isDeleted &&
            inv.paymentMode === 'credit' &&
            inv.dueDate &&
            inv.dueDate < now
        )
      );

    for (const invoice of invoices) {
      try {
        // Calculate days overdue
        const daysOverdue = Math.floor(
          (now - (invoice.dueDate || now)) / (1000 * 60 * 60 * 24)
        );

        // Only send reminder if at least 1 day overdue
        if (daysOverdue < 1) continue;

        // Check if we already sent a reminder recently (within last 3 days)
        if (invoice.lastReminderSent) {
          const daysSinceReminder = Math.floor(
            (now - invoice.lastReminderSent) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceReminder < 3) continue; // Don't spam
        }

        // Update reminder tracking
        await ctx.db.patch(invoice._id, {
          lastReminderSent: now,
          reminderCount: (invoice.reminderCount || 0) + 1
        });

        // TODO: Integrate with notification system (email/SMS)
        reminderStats.sent++;
      } catch (error) {
        reminderStats.failed++;
      }
    }

    return reminderStats;
  }
});

// Calculate next due date based on frequency
function calculateNextDueDate(frequency: string, lastDate: number): number {
  const date = new Date(lastDate);

  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }

  return date.getTime();
}
