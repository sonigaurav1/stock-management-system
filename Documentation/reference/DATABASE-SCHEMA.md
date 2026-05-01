# Database Schema

Convex schema overview for Invento.

## Schema Definition Location
`convex/schema.ts` - Contains all table and field definitions

## Tables Overview

### organizations
Owner and company details for multi-tenant support.

```typescript
{
  _id: Id<"organizations">,
  _creationTime: number,
  ownerId: string,           // Clerk user ID
  name: string,              // Company name
  description: string,       // Company description
  logo: string,              // Logo URL (EdgeStore)
  address: string,
  city: string,
  country: string,
  phone: string,
  email: string,
  members: Array<{           // Team members with roles
    userId: string,
    role: "owner" | "manager" | "staff",
  }>,
  createdAt: Date,
  deletedAt?: Date,          // Soft delete
}
```

**Indexes**:
- Primary: by `ownerId`
- by `ownerId` + `deletedAt` (soft delete filter)

---

### products
Product catalog with inventory tracking.

```typescript
{
  _id: Id<"products">,
  _creationTime: number,
  organization: Id<"organizations">,  // Multi-tenant isolation
  name: string,                       // Product name
  sku: string,                        // Stock keeping unit (unique per org)
  category: string,                   // Product category
  quantity: number,                   // Current stock level
  price: number,                      // Selling price
  costPrice: number,                  // Cost to acquire
  supplier: Id<"suppliers">,          // Supplier reference
  description: string,                // Product details
  image: string,                      // Image URL (EdgeStore)
  barcode?: string,                   // Optional barcode
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date,                   // Soft delete
}
```

**Indexes**:
- by `organization`
- by `sku` (unique per org)
- by `organization` + `sku`
- by `organization` + `category`
- by `organization` + `deletedAt`

---

### suppliers
Vendor/supplier information.

```typescript
{
  _id: Id<"suppliers">,
  _creationTime: number,
  organization: Id<"organizations">,
  name: string,                      // Company/vendor name
  contactPerson: string,
  email: string,                     // Contact email
  phone: string,                     // Contact phone
  address: string,
  city: string,
  country: string,
  paymentTerms: string,              // "Net 30", "COD", etc
  leadTime: number,                  // Days for delivery
  rating: number,                    // 1-5 star rating
  totalOrders?: number,              // Lifetime orders
  createdAt: Date,
  deletedAt?: Date,
}
```

**Indexes**:
- by `organization`
- by `organization` + `name`

---

### sales
Sales orders and customer transactions.

```typescript
{
  _id: Id<"sales">,
  _creationTime: number,
  organization: Id<"organizations">,
  customer: string,                  // Customer name or ID
  items: Array<{                     // Products sold
    productId: Id<"products">,
    quantity: number,
    price: number,                   // Price at sale time
    discount?: number,               // Percentage or amount
  }>,
  total: number,                     // Total sale amount
  tax: number,                       // Tax amount
  status: "pending" | "delivered" | "cancelled",
  paymentStatus: "unpaid" | "partial" | "paid",
  invoiceGenerated: boolean,
  invoiceId?: Id<"invoices">,       // Link to invoice
  notes?: string,
  createdAt: Date,
  deliveredAt?: Date,
  deletedAt?: Date,
}
```

**Indexes**:
- by `organization`
- by `organization` + `createdAt`
- by `organization` + `status`
- by `organization` + `paymentStatus`

---

### ledger
Financial audit trail and transaction records.

```typescript
{
  _id: Id<"ledger">,
  _creationTime: number,
  organization: Id<"organizations">,
  type: "debit" | "credit",
  category: string,                  // "sale", "purchase", "expense", "adjustment"
  amount: number,
  balance?: number,                  // Running balance (optional)
  relatedEntity: Id,                 // Reference: sales._id, products._id, etc
  description: string,
  tags?: string[],                   // For filtering
  createdAt: Date,
}
```

**Indexes**:
- by `organization`
- by `organization` + `createdAt`
- by `organization` + `category`
- by `relatedEntity` (for audit trails)

---

### invoices
Generated invoices from sales orders.

```typescript
{
  _id: Id<"invoices">,
  _creationTime: number,
  organization: Id<"organizations">,
  saleId: Id<"sales">,              // Link to sale
  invoiceNumber: string,             // Unique per org: "INV-2024-001"
  customerName: string,
  customerEmail: string,
  items: Array<{
    description: string,
    quantity: number,
    unitPrice: number,
    total: number,
  }>,
  subtotal: number,
  tax: number,
  total: number,
  status: "draft" | "sent" | "paid" | "overdue",
  dueDate: Date,
  paidDate?: Date,
  notes?: string,
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes**:
- by `organization`
- by `saleId`
- by `invoiceNumber` (unique per org)
- by `status`

---

### payments
Payment transactions for invoices.

```typescript
{
  _id: Id<"payments">,
  _creationTime: number,
  organization: Id<"organizations">,
  invoiceId: Id<"invoices">,
  saleId: Id<"sales">,
  razorpayPaymentId: string,        // Razorpay transaction ID
  razorpayOrderId: string,          // Razorpay order ID
  amount: number,
  currency: string,                  // "INR", "USD", etc
  status: "pending" | "captured" | "failed" | "refunded",
  method: string,                    // "card", "upi", "netbanking", etc
  receipt: string,                   // Receipt number
  notes?: string,
  errorMessage?: string,
  createdAt: Date,
  completedAt?: Date,
}
```

**Indexes**:
- by `organization`
- by `invoiceId`
- by `razorpayPaymentId` (unique)
- by `status`

---

### users (Clerk sync)
Note: User data primarily stored in Clerk, minimal sync to Convex.

```typescript
{
  _id: Id<"users">,
  clerkId: string,                   // Unique Clerk user ID
  email: string,
  name: string,
  organizations: Id<"organizations">[],  // Orgs user belongs to
  lastLogin?: Date,
  createdAt: Date,
}
```

---

## Schema Version Control

Schema changes are tracked in `convex/schema.ts`. Key versioning points:

- **v1.0**: Initial schema
- **v1.1**: Added `deletedAt` soft delete fields
- **v1.2**: Added `ledger` for audit trail
- **v1.3**: Added `invoices` and `payments` for billing

When making schema changes:
1. Add field with optional/default value
2. Add migration if needed
3. Update this documentation
4. Test with existing data

## Naming Conventions

- **Field names**: camelCase (not snake_case)
- **Collections**: camelCase, plural (products, not Product)
- **IDs**: `Id<"collectionName">` type from Convex
- **Timestamps**: use `Date` type with `new Date()`
- **Foreign keys**: `collectionId` pattern (e.g., `organizationId`)

## Data Types

Convex types mapping:

| Convex Type | Description | Example |
|------------|-------------|---------|
| `v.string()` | Text | "iPhone 15" |
| `v.number()` | Integer/Float | 29.99 |
| `v.boolean()` | True/False | true |
| `v.id("table")` | Foreign key | Id<"products"> |
| `v.array(v.string())` | Array of type | ["tag1", "tag2"] |
| `v.object({ ... })` | Nested object | { x: 1, y: 2 } |
| `v.optional(...)` | Optional field | undefined allowed |

## Multi-tenancy Pattern

Every table (except organizations, users) includes:
- `organization: Id<"organizations">` - Org context
- **Index on organization** - Fast org-scoped queries
- **All queries filter by org** - Data isolation

This ensures:
- Data isolation between organizations
- Fast org-specific queries
- No accidental cross-org data leaks

## Querying Best Practices

### Always filter by organization
```typescript
// ✓ Good - Org-isolated
const products = await ctx.db
  .query("products")
  .withIndex("by_organization", (q) =>
    q.eq("organization", args.organizationId)
  )
  .collect();

// ✗ Bad - Could leak across orgs
const products = await ctx.db.query("products").collect();
```

### Use soft deletes
```typescript
// ✓ Good - Excludes deleted
.filter((q) => q.neq(q.field("deletedAt"), null))

// ✗ Bad - Includes deleted records
// (no filter)
```

## Related Documentation

- **[MODULES.md](MODULES.md)** - Module-specific schema details
- **[API-GUIDE.md](API-GUIDE.md)** - How to query/mutate
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Data flow and relationships
