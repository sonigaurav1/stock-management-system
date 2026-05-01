# Convex API Guide

Best practices for writing queries and mutations in Invento.

## Basic Query Structure

```typescript
// convex/products.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getProducts = query({
  args: {
    organizationId: v.id("organizations"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    // 2. Authorize
    const org = await ctx.db.get(args.organizationId);
    if (!org) throw new ConvexError("Organization not found");
    // Add role-based checks here if needed

    // 3. Query
    const limit = args.limit ?? 20;
    const products = await ctx.db
      .query("products")
      .withIndex("by_organization", (q) =>
        q.eq("organization", args.organizationId)
      )
      .take(limit);

    // 4. Transform (optional)
    return products.map((p) => ({
      ...p,
      displayPrice: `$${p.price.toFixed(2)}`,
    }));
  },
});
```

## Authentication Pattern

```typescript
// ALWAYS check auth in mutations
export const createProduct = mutation({
  args: { name: v.string(), organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    // Get user identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    // Verify user belongs to org
    const org = await ctx.db.get(args.organizationId);
    if (!org) throw new ConvexError("Organization not found");
    if (org.ownerId !== identity.subject) {
      throw new ConvexError("Access denied");
    }

    // Safe to proceed
    return await ctx.db.insert("products", args);
  },
});
```

## Indexing Pattern

```typescript
// In schema.ts - Always add indexes for frequently queried fields

export default defineSchema({
  products: defineTable({
    organization: v.id("organizations"),
    sku: v.string(),
    name: v.string(),
    price: v.number(),
    // ... more fields
  })
    .index("by_organization", ["organization"])
    .index("by_sku", ["sku"])
    .index("by_organization_sku", ["organization", "sku"]),
});
```

## Filtering Pattern

```typescript
// Collect then filter (small datasets)
const products = await ctx.db
  .query("products")
  .withIndex("by_organization", (q) =>
    q.eq("organization", organizationId)
  )
  .collect();

const filtered = products.filter((p) => p.price > 100);

// OR: Use multiple indexes for complex filters
const products = await ctx.db
  .query("products")
  .withIndex("by_organization_sku", (q) =>
    q.eq("organization", organizationId).eq("sku", searchSku)
  )
  .collect();
```

## Pagination Pattern

```typescript
export const getProductsPaginated = query({
  args: {
    organizationId: v.id("organizations"),
    page: v.number(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const skip = (args.page - 1) * args.limit;

    const products = await ctx.db
      .query("products")
      .withIndex("by_organization", (q) =>
        q.eq("organization", args.organizationId)
      )
      .skip(skip)
      .take(args.limit);

    const total = await ctx.db
      .query("products")
      .withIndex("by_organization", (q) =>
        q.eq("organization", args.organizationId)
      )
      .count();

    return {
      items: products,
      total,
      page: args.page,
      pages: Math.ceil(total / args.limit),
    };
  },
});
```

## Mutation Validation Pattern

```typescript
export const createSale = mutation({
  args: {
    organizationId: v.id("organizations"),
    products: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      })
    ),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    // Input validation
    if (args.products.length === 0) {
      throw new ConvexError("Sale must include at least one product");
    }

    if (args.total <= 0) {
      throw new ConvexError("Total must be greater than zero");
    }

    // Business logic validation
    for (const item of args.products) {
      const product = await ctx.db.get(item.productId);
      if (!product) throw new ConvexError(`Product not found: ${item.productId}`);
      if (product.organization !== args.organizationId) {
        throw new ConvexError("Product not in organization");
      }
      if (product.quantity < item.quantity) {
        throw new ConvexError(`Insufficient stock for ${product.name}`);
      }
    }

    // All validations passed, create sale
    return await ctx.db.insert("sales", {
      organizationId: args.organizationId,
      products: args.products,
      total: args.total,
      status: "pending",
      createdAt: new Date(),
    });
  },
});
```

## Transaction Pattern

```typescript
// Multiple mutations should be atomic
export const updateSaleAndInventory = mutation({
  args: {
    saleId: v.id("sales"),
    products: v.array(v.object({ productId: v.id("products"), quantity: v.number() })),
  },
  handler: async (ctx, args) => {
    // Update sale
    const sale = await ctx.db.get(args.saleId);
    if (!sale) throw new ConvexError("Sale not found");

    await ctx.db.patch(args.saleId, { status: "completed" });

    // Update products atomically
    for (const item of args.products) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        await ctx.db.patch(item.productId, {
          quantity: product.quantity - item.quantity,
        });

        // Record in ledger
        await ctx.db.insert("ledger", {
          organization: product.organization,
          type: "debit",
          category: "sale",
          amount: product.price * item.quantity,
          relatedEntity: args.saleId,
          description: `Sale: ${item.quantity}x ${product.name}`,
          createdAt: new Date(),
        });
      }
    }

    return sale;
  },
});
```

## Real-time Subscription Pattern

```typescript
// Queries auto-subscribe in React components
// No special subscription syntax needed

// In React component:
const products = useQuery(api.products.getProducts, {
  organizationId: orgId,
});

// This automatically:
// 1. Fetches initial data
// 2. Subscribes to real-time updates
// 3. Updates component when data changes
// 4. Unsubscribes on unmount
```

## Error Handling Pattern

```typescript
import { ConvexError } from "convex/server";

export const riskyOperation = mutation({
  args: { data: v.string() },
  handler: async (ctx, args) => {
    try {
      // Validation
      if (!args.data) throw new ConvexError("Data is required");

      // Operation
      const result = await someRiskyOp(args.data);

      // Return result
      return result;
    } catch (error) {
      // Log unexpected errors
      if (!(error instanceof ConvexError)) {
        console.error("Unexpected error in riskyOperation:", error);
      }
      // Convex handles re-throwing
      throw error;
    }
  },
});
```

## Performance Best Practices

### 1. Use Indexes
```typescript
// ✓ Good - Uses index
const products = await ctx.db
  .query("products")
  .withIndex("by_organization", (q) =>
    q.eq("organization", orgId)
  )
  .collect();

// ✗ Bad - Full scan
const products = await ctx.db
  .query("products")
  .filter((q) => q.eq(q.field("organization"), orgId))
  .collect();
```

### 2. Limit Results
```typescript
// ✓ Good - Limited
const recent = await ctx.db
  .query("sales")
  .withIndex("by_organization", (q) =>
    q.eq("organization", orgId)
  )
  .take(10);

// ✗ Bad - Unbounded
const all = await ctx.db
  .query("sales")
  .withIndex("by_organization", (q) =>
    q.eq("organization", orgId)
  )
  .collect();
```

### 3. Avoid N+1 Queries
```typescript
// ✗ Bad - N+1 queries
const products = await ctx.db.query("products").collect();
for (const product of products) {
  const supplier = await ctx.db.get(product.supplierId);
  // N queries!
}

// ✓ Good - Batch load
const products = await ctx.db.query("products").collect();
const suppliers = await Promise.all(
  products.map((p) => ctx.db.get(p.supplierId))
);
```

## Common Patterns

### Get by ID with Auth
```typescript
export const getProduct = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new ConvexError("Not found");

    // Verify org access
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    return product;
  },
});
```

### Search Pattern
```typescript
export const searchProducts = query({
  args: {
    organizationId: v.id("organizations"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_organization", (q) =>
        q.eq("organization", args.organizationId)
      )
      .collect();

    return products.filter((p) =>
      p.name.toLowerCase().includes(args.query.toLowerCase())
    );
  },
});
```

### Soft Delete Pattern
```typescript
// In schema: add deletedAt field
products: defineTable({
  // ... fields
  deletedAt: v.optional(v.float()),
}).index("by_organization", ["organization", "deletedAt"]),

// In query: filter out deleted
const active = await ctx.db
  .query("products")
  .withIndex("by_organization", (q) =>
    q.eq("organization", orgId)
  )
  .filter((q) => q.neq(q.field("deletedAt"), null))
  .collect();

// In mutation: soft delete
export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { deletedAt: Date.now() });
  },
});
```
