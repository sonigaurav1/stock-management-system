# LEDGER Module

Financial record-keeping and audit trail system.

## Responsibility

- Record all financial transactions
- Maintain audit trail
- Calculate balances
- Generate financial reports
- Ensure financial accuracy
- Track all changes to inventory and money

## Key Files

- **Backend**: `convex/ledger.ts`
- **Frontend**: `src/app/(main)/(authenticated)/ledger/`

## Data Model

```typescript
LedgerEntry {
  _id: Id<"ledger">,
  organization: Id<"organizations">,  // Org isolation
  type: "debit" | "credit",
  category: string,                   // "sale", "purchase", "expense", "adjustment"
  subcategory?: string,               // "inventory", "discount", "tax", "refund"
  amount: number,
  balance?: number,                   // Running balance (optional, calculated)
  relatedEntity: Id,                  // Reference: saleId, productId, paymentId, etc
  relatedEntityType: string,          // "sale", "product", "payment", "invoice"
  description: string,                // "Sold 5x iPhone 15 to John Doe"
  tags?: string[],                    // For filtering: ["high-value", "urgent"]
  metadata?: Record<string, any>,     // Additional data
  createdAt: Date,
  user?: string,                      // Who performed action
}
```

## Key Operations

### Record Transaction
- Validate inputs
- Store with proper type (debit/credit)
- Calculate running balance (optional)
- Return entry ID

### Get Balance
- Sum all credits (income)
- Sum all debits (expenses)
- Calculate net balance
- Optional date range filter

### Generate Report
- Filter by date range
- Group by category
- Calculate totals per category
- Show balance progression

### Query Transactions
- Filter by category
- Filter by date range
- Filter by related entity (trace all changes for one item)
- Support pagination

## Common Patterns

### Record Sale (in sales.ts mutation)
```typescript
// After sale created, record in ledger
await ctx.db.insert("ledger", {
  organization: args.organizationId,
  type: "credit",                    // Money in
  category: "sale",
  amount: total,
  relatedEntity: saleId,
  relatedEntityType: "sale",
  description: `Sale to ${customer}: ${items.length} items`,
  createdAt: new Date(),
});
```

### Record Inventory Change (in products.ts mutation)
```typescript
// When product quantity changes
await ctx.db.insert("ledger", {
  organization: org._id,
  type: "debit",                     // Inventory out
  category: "inventory",
  subcategory: "sale",
  amount: costPrice * quantity,
  relatedEntity: saleId,
  relatedEntityType: "sale",
  description: `Sold ${quantity}x ${product.name}`,
  createdAt: new Date(),
});
```

### Record Payment (in billing.ts mutation)
```typescript
// When payment received
await ctx.db.insert("ledger", {
  organization: org._id,
  type: "credit",
  category: "payment",
  amount: paymentAmount,
  relatedEntity: paymentId,
  relatedEntityType: "payment",
  description: `Payment received for invoice ${invoiceNumber}`,
  createdAt: new Date(),
});
```

### Get Balance
```typescript
const getBalance = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("ledger")
      .withIndex("by_organization", (q) =>
        q.eq("organization", args.organizationId)
      )
      .collect();

    let balance = 0;
    for (const entry of entries.sort((a, b) =>
      a.createdAt.getTime() - b.createdAt.getTime())) {
      if (entry.type === "credit") balance += entry.amount;
      if (entry.type === "debit") balance -= entry.amount;
    }
    return balance;
  },
});
```

## Integration Points

### With Sales
- Auto-create revenue entry on sale
- Auto-create inventory deduction on sale
- Record payment when collected

### With Products
- Record on inventory addition
- Record on inventory deduction
- Record on product deletion

### With Billing
- Record payment received
- Record invoice generation
- Record refunds

### With Admin
- Admin audit reports
- Tax calculations
- Financial statements

## Transaction Categories

| Category | Type | When | Example |
|----------|------|------|---------|
| sale | credit | Order received | Sale to customer: +$500 |
| purchase | debit | Buy from supplier | Purchase inventory: -$200 |
| expense | debit | Operating cost | Monthly rent: -$1000 |
| inventory | debit/credit | Stock adjustment | Stock adjustment: -10 units |
| payment | credit | Payment received | Customer payment: +$500 |
| refund | debit | Money returned | Refund to customer: -$200 |
| adjustment | debit/credit | Manual correction | Correction: +$50 |

## Database Indexes

```typescript
ledger: defineTable({
  // ... fields
})
  .index("by_organization", ["organization"])
  .index("by_organization_date", ["organization", "createdAt"])
  .index("by_category", ["organization", "category"])
  .index("by_related_entity", ["relatedEntity"])
  .index("by_type", ["organization", "type"])
```

## Workflows

### On New Sale
1. Sale created
2. Ledger: Revenue entry (credit)
3. Ledger: Inventory cost (debit)
4. Dashboard updated

### On Payment Received
1. Payment recorded
2. Ledger: Payment entry (credit)
3. Invoice status updated to "paid"
4. Balance updated

### Monthly Reporting
1. Query ledger entries for month
2. Group by category
3. Calculate totals
4. Generate statement

## Testing Considerations

- Verify entries created for all transactions
- Test balance calculation accuracy
- Test date range filtering
- Test report generation
- Verify org isolation
- Test pagination
- Verify audit trail completeness
- Test concurrent transactions

## API Functions (In convex/ledger.ts)

```typescript
export const recordTransaction = mutation({ ... })
export const getBalance = query({ ... })
export const getTransactions = query({ ... })
export const getTransactionsByCategory = query({ ... })
export const getTransactionsByDateRange = query({ ... })
export const getFinancialReport = query({ ... })
export const getAuditTrail = query({ ... })            // For specific entity
export const reconcile = mutation({ ... })            // Manual correction
```

## Financial Reports Possible

- **Income Statement**: Revenue vs expenses for period
- **Balance Sheet**: Assets, liabilities, equity
- **Cash Flow**: Money in/out by category
- **Inventory Report**: Stock movements and values
- **Customer Report**: Sales to each customer
- **Supplier Report**: Purchases from each supplier
- **Tax Report**: Taxable income for period

## Related Documentation

- [SALES.md](SALES.md) - Transactions source
- [PRODUCTS.md](PRODUCTS.md) - Inventory changes
- [BILLING.md](BILLING.md) - Payments and invoices
- [DATABASE-SCHEMA.md](../DATABASE-SCHEMA.md) - Schema details
