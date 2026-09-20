# Convex API Guide & Security Rules

Convex API query, mutation, and security patterns for Invento backend operations.

---

## 1. Auth Guarding on API Functions

Every Convex backend mutation and query must verify identity before accessing database collections:

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createProduct = mutation({
  args: {
    name: v.string(),
    sku: v.string(),
    sellingPrice: v.number(),
    categoryId: v.string(),
    categoryName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to createProduct");
    }

    const userId = identity.subject;

    return await ctx.db.insert("products", {
      ...args,
      userId,
      inStock: true,
      stockStatus: "in_stock",
      isDeleted: false,
      createdAt: Date.now(),
    });
  },
});
```

---

## 2. API Security Guidelines

1. **Authentication Check**: Call `await ctx.auth.getUserIdentity()` at the start of every function.
2. **Index Filtering**: Use `.withIndex(...)` with `userId` as the leading index field.
3. **Input Validation**: Use Convex value validators (`v.string()`, `v.number()`, `v.boolean()`, `v.id()`).

---

## 3. Related Links
- **Database Schema**: [DATABASE_SCHEMA.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/DATABASE_SCHEMA.md)
- **Architecture**: [ARCHITECTURE.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/ARCHITECTURE.md)
