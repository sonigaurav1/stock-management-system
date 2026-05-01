# BILLING Module

Payment processing, invoicing, and subscription management.

## Responsibility

- Invoice generation and tracking
- Payment processing (Razorpay integration)
- Subscription management
- Payment status tracking
- Refund handling
- Invoice delivery

## Key Files

- **Backend**: `convex/billing.ts`
- **Frontend**: `src/app/(main)/(authenticated)/billing/`

## Data Model

### Invoice
```typescript
Invoice {
  _id: Id<"invoices">,
  organization: Id<"organizations">,
  saleId: Id<"sales">,                // Link to originating sale
  invoiceNumber: string,              // Unique per org: "INV-2024-001"
  customerName: string,
  customerEmail: string,
  customerPhone?: string,
  items: Array<{
    description: string,
    quantity: number,
    unitPrice: number,
    discount?: number,
    total: number,
  }>,
  subtotal: number,
  tax: number,                        // Tax amount
  taxRate: number,                    // Tax percentage (e.g., 18 for GST)
  total: number,
  amountPaid: number,                 // Cumulative payments
  amountDue: number,                  // Remaining balance
  status: "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled",
  dueDate: Date,
  issuedDate: Date,
  paidDate?: Date,
  notes?: string,
  paymentTerms: string,               // "Due on receipt", "Net 30", etc
  createdAt: Date,
  updatedAt: Date,
}
```

### Payment
```typescript
Payment {
  _id: Id<"payments">,
  organization: Id<"organizations">,
  invoiceId: Id<"invoices">,
  saleId: Id<"sales">,
  razorpayPaymentId: string,         // Razorpay transaction ID
  razorpayOrderId: string,           // Razorpay order ID
  amount: number,
  currency: string,                  // "INR", "USD"
  status: "pending" | "captured" | "failed" | "refunded",
  method: string,                    // "card", "upi", "netbanking"
  receipt: string,                   // Payment receipt number
  notes?: string,
  errorMessage?: string,             // If failed
  refundedAmount?: number,
  createdAt: Date,
  completedAt?: Date,
}
```

## Key Operations

### Generate Invoice
- From sale: extract items, customer, amount
- Auto-generate invoice number (INV-ORG-001)
- Set due date (based on payment terms)
- Create invoice document
- Link to sale
- Optionally email to customer

### Process Payment (Razorpay Integration)
1. Create Razorpay order with amount
2. Return order ID to frontend
3. Frontend opens Razorpay payment form
4. Customer completes payment
5. Razorpay webhook confirms payment
6. Record payment in system
7. Update invoice status
8. Record in ledger
9. Send confirmation email

### Track Payment Status
- Pending: Awaiting payment
- Captured: Payment received
- Failed: Payment declined
- Refunded: Money returned
- Partial: Part of invoice paid

### Send Invoice
- Email invoice to customer
- Update status to "sent"
- Track open rates
- Reminder for overdue invoices

### Record Refund
- Mark payment as refunded
- Update invoice status
- Record in ledger
- Send refund confirmation

## Related Modules

- **SALES** - Source of invoices
- **LEDGER** - Payment recording
- **ORGANIZATIONS** - Tax settings, payment terms
- **PRODUCTS** - Invoice item details

## Common Patterns

### Generate Invoice on Sale
```typescript
// After sale created, generate invoice
const invoiceId = await ctx.db.insert("invoices", {
  organization: args.organizationId,
  saleId: saleId,
  invoiceNumber: generateInvoiceNumber(org),
  customerName: args.customer,
  customerEmail: args.customerEmail,
  items: args.items,  // From sale
  subtotal: args.subtotal,
  tax: args.tax,
  total: args.total,
  status: "draft",
  dueDate: calculateDueDate(args.paymentTerms),
  issuedDate: new Date(),
});

// Link invoice to sale
await ctx.db.patch(saleId, { invoiceId });
```

### Create Razorpay Payment
```typescript
const createPayment = mutation({
  args: {
    invoiceId: v.id("invoices"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    // Create order in Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET_KEY,
    });

    const order = await razorpay.orders.create({
      amount: args.amount * 100,  // Amount in paise
      currency: "INR",
      receipt: generateReceipt(),
    });

    // Store in payments table
    const paymentId = await ctx.db.insert("payments", {
      organization: org._id,
      invoiceId: args.invoiceId,
      razorpayOrderId: order.id,
      amount: args.amount,
      status: "pending",
      createdAt: new Date(),
    });

    return { orderId: order.id, paymentId };
  },
});
```

### Handle Razorpay Webhook
```typescript
export const handleRazorpayWebhook = mutation({
  args: {
    event: v.string(),
    payload: v.object({
      payment: v.object({
        entity: v.object({
          id: v.string(),
          status: v.string(),
          amount: v.number(),
        }),
      }),
    }),
  },
  handler: async (ctx, args) => {
    if (args.event === "payment.captured") {
      const razorpayId = args.payload.payment.entity.id;

      // Find payment record
      const payment = await ctx.db
        .query("payments")
        .filter((q) => q.eq(q.field("razorpayPaymentId"), razorpayId))
        .first();

      if (payment) {
        // Update payment status
        await ctx.db.patch(payment._id, { status: "captured" });

        // Update invoice
        const invoice = await ctx.db.get(payment.invoiceId);
        await ctx.db.patch(invoice._id, {
          amountPaid: invoice.amountPaid + payment.amount,
          amountDue: invoice.total - (invoice.amountPaid + payment.amount),
          status: invoice.total === invoice.amountPaid ? "paid" : "partial",
          paidDate: new Date(),
        });

        // Record in ledger
        await ctx.db.insert("ledger", {
          organization: payment.organization,
          type: "credit",
          category: "payment",
          amount: payment.amount,
          relatedEntity: payment._id,
          description: `Payment received for invoice ${invoice.invoiceNumber}`,
          createdAt: new Date(),
        });
      }
    }
  },
});
```

## Workflows

### Invoice + Payment Workflow
1. Sale created
2. Invoice generated (status: draft)
3. Invoice sent to customer (status: sent)
4. Customer opens invoice (status: viewed, optional)
5. Customer clicks "Pay Now"
6. Razorpay payment form opens
7. Customer enters payment details
8. Razorpay processes payment
9. Webhook confirms payment
10. Invoice marked as "paid"
11. Confirmation email sent
12. Ledger updated

### Partial Payment Workflow
1. Invoice amount: $1000
2. First payment: $600
3. Invoice status: "partial" (amountDue: $400)
4. Reminder sent for remaining balance
5. Second payment: $400
6. Invoice marked as "paid"

### Refund Workflow
1. Customer requests refund
2. Admin initiates refund via Razorpay
3. Razorpay processes refund
4. Webhook confirms refund
5. Payment status: "refunded"
6. Ledger: Refund entry (debit)
7. Invoice status: "cancelled"
8. Confirmation email to customer

## Database Indexes

```typescript
invoices: defineTable({ ... })
  .index("by_organization", ["organization"])
  .index("by_sale", ["saleId"])
  .index("by_number", ["organization", "invoiceNumber"])
  .index("by_status", ["organization", "status"])
  .index("by_due_date", ["organization", "dueDate"])

payments: defineTable({ ... })
  .index("by_organization", ["organization"])
  .index("by_invoice", ["invoiceId"])
  .index("by_razorpay_id", ["razorpayPaymentId"])
  .index("by_status", ["organization", "status"])
```

## Testing Considerations

- Verify invoice generation from sale
- Test Razorpay order creation
- Test payment webhook handling
- Test refund processing
- Test partial payments
- Test invoice status transitions
- Test ledger entries
- Test email notifications
- Test date calculations

## API Functions (In convex/billing.ts)

```typescript
export const generateInvoice = mutation({ ... })
export const createRazorpayOrder = mutation({ ... })
export const handleRazorpayWebhook = mutation({ ... })
export const recordManualPayment = mutation({ ... })
export const processRefund = mutation({ ... })
export const getInvoices = query({ ... })
export const getInvoice = query({ ... })
export const getPayments = query({ ... })
export const getOutstandingInvoices = query({ ... })
export const sendInvoiceEmail = mutation({ ... })
export const sendPaymentReminder = mutation({ ... })
```

## Security Considerations

- Never expose Razorpay secret key
- Verify webhook signature from Razorpay
- Validate payment amount matches invoice
- Use HTTPS for all payment requests
- Store payment IDs for audit trail
- Implement retry logic for failed webhooks
- Log all payment attempts

## Related Documentation

- [SALES.md](SALES.md) - Invoice source
- [LEDGER.md](LEDGER.md) - Payment recording
- [DATABASE-SCHEMA.md](../DATABASE-SCHEMA.md) - Schema details
- [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) - Payment issues
