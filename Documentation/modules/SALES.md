# SALES Module

Sales orders and customer transaction tracking.

## Responsibility

- Sales order creation and management
- Customer transaction tracking
- Inventory deduction on sale
- Invoice generation
- Sales status and payment tracking
- Sales analytics and reporting

## Key Files

- **Backend**: `convex/sales.ts`
- **Frontend**: `src/app/(main)/(authenticated)/restock/` (confusing name, actually sales tracking)

## Data Model

```typescript
Sale {
  _id: Id<"sales">,
  organization: Id<"organizations">,  // Org isolation
  customer: string,                   // Customer name or ID
  items: Array<{
    productId: Id<"products">,
    quantity: number,
    price: number,                    // Price at sale time (snapshot)
    discount?: number,                // Discount amount or %
  }>,
  subtotal: number,                   // Before tax and discount
  tax: number,                        // Tax amount
  total: number,                      // Final amount
  status: "pending" | "delivered" | "cancelled",
  paymentStatus: "unpaid" | "partial" | "paid",
  invoiceGenerated: boolean,
  invoiceId?: Id<"invoices">,        // Link to generated invoice
  notes?: string,
  createdAt: Date,
  deliveredAt?: Date,
  deletedAt?: Date,                   // Soft delete
}
```

## Key Operations

### Create Sale (Complex Transaction)
1. Validate products exist and have stock
2. Deduct inventory from products
3. Create sale document
4. Record in ledger (revenue + inventory)
5. Optionally generate invoice
6. Return sale ID

**Atomic**: All steps must succeed or all fail (transaction)

### Update Sale Status
- Pending → Delivered
- Any → Cancelled (refund inventory)
- Update ledger to reflect changes

### Record Payment
- Update paymentStatus
- Track partial payments
- Record in ledger
- Update invoice if needed

### Generate Invoice
- Create invoice from sale
- Store reference in sale
- Calculate totals
- Set due date based on terms

### List Sales
- Filter by org
- Support pagination
- Include filtering by status, date range
- Show customer info

## Related Modules

- **PRODUCTS** - Items in the sale (stock deducted)
- **LEDGER** - Financial records (revenue entry, inventory change)
- **BILLING** - Invoice generation and payments
- **SUPPLIERS** - Indirect (supplier of sold products)

## Common Patterns

### Get Sales
```typescript
const sales = useQuery(api.sales.getSales, {
  organizationId: org._id,
  limit: 20,
  page: 1,
});
```

### Create Sale
```typescript
const sale = useMutation(api.sales.createSale);
await sale({
  customer: "John Doe",
  items: [
    { productId, quantity: 5, price: 100 },
  ],
  tax: 50,
  total: 550,
  organizationId: org._id,
});
```

### Update Sale Status
```typescript
const updateStatus = useMutation(api.sales.updateSaleStatus);
await updateStatus({
  saleId,
  status: "delivered",
  organizationId: org._id,
});
```

### Record Payment
```typescript
const recordPayment = useMutation(api.sales.recordPayment);
await recordPayment({
  saleId,
  amount: 500,
  paymentMethod: "card",
  organizationId: org._id,
});
```

## Integration Points

### With Products
- Deduct inventory on sale creation
- Verify stock available
- Store price snapshot (price may change later)
- Track product via ledger

### With Ledger
- Create revenue entry for sale
- Create inventory deduction for each product
- Track payment entry when paid
- Audit trail for all transactions

### With Billing
- Generate invoice from sale
- Track invoice status (draft, sent, paid, overdue)
- Record payment matching invoice
- Send to customer via email

### With Analytics
- Track total sales revenue
- Customer purchase history
- Product sales frequency
- Payment collection rate

## Database Indexes

```typescript
sales: defineTable({
  // ... fields
})
  .index("by_organization", ["organization"])
  .index("by_customer", ["organization", "customer"])
  .index("by_status", ["organization", "status"])
  .index("by_payment_status", ["organization", "paymentStatus"])
  .index("by_date", ["organization", "createdAt"])
```

## Workflows

### Complete Sale Workflow
1. Customer places order
2. System checks stock for each item
3. If all in stock:
   - Deduct inventory
   - Create sale record
   - Record in ledger
   - Generate invoice
   - Return sale ID
4. If out of stock:
   - Return error, no changes

### Delivery Workflow
1. Sale created (status: pending)
2. Order packed and shipped
3. Admin updates status to "delivered"
4. Customer receives goods
5. Payment collected (full or partial)

### Payment Collection
1. Sale created (paymentStatus: unpaid)
2. Invoice sent to customer
3. Customer makes payment via Razorpay
4. Payment recorded in system
5. If full payment: paymentStatus = "paid"
6. If partial: paymentStatus = "partial"
7. Ledger updated with payment entry

### Sale Cancellation
1. Sale marked as cancelled
2. Inventory restored to products
3. Ledger updated with reversal entries
4. Invoice marked as void
5. Payment refunded if applicable

## Testing Considerations

- Verify inventory deduction on sale
- Test stock validation (insufficient stock)
- Verify ledger entries created correctly
- Test invoice generation
- Test payment recording
- Test sale cancellation (inventory restored)
- Test partial payments
- Test pagination and filtering
- Verify org isolation

## API Functions (In convex/sales.ts)

```typescript
export const createSale = mutation({ ... })           // Complex: inventory + ledger
export const updateSaleStatus = mutation({ ... })
export const recordPayment = mutation({ ... })
export const cancelleSale = mutation({ ... })         // Reverse everything
export const getSales = query({ ... })
export const getSale = query({ ... })
export const getSalesByDateRange = query({ ... })
export const getSalesByCustomer = query({ ... })
export const getSalesReport = query({ ... })          // Analytics
```

## Related Documentation

- [PRODUCTS.md](PRODUCTS.md) - Inventory deduction
- [LEDGER.md](LEDGER.md) - Financial recording
- [BILLING.md](BILLING.md) - Invoice and payment
- [DATABASE-SCHEMA.md](../DATABASE-SCHEMA.md) - Schema details
