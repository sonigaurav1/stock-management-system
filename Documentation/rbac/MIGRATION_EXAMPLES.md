# RBAC: Step-by-Step Migration Examples

This document shows exactly how to update each type of query/mutation to work with RBAC.

---

## Example 1: Simple Read Query

### Before (WRONG)
```typescript
export const getSuppliers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    
    return await ctx.db
      .query('suppliers')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', identity.subject)  // ❌ Wrong for staff
           .eq('isDeleted', false)
      )
      .collect();
  }
});
```

### After (CORRECT)
```typescript
import { resolveCallerContext, requirePermission, getDataScopeUserId } from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

export const getSuppliers = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);
    
    const userId = getDataScopeUserId(caller);
    
    return await ctx.db
      .query('suppliers')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId)  // ✅ Correct for both owner and staff
           .eq('isDeleted', false)
      )
      .collect();
  }
});
```

---

## Example 2: Query With Filtering

### Before (WRONG)
```typescript
export const getFilteredSales = query({
  args: {
    status: v.optional(v.string()),
    minAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    
    let query = ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', identity.subject)  // ❌ Wrong
           .eq('isDeleted', false)
      );
    // ... filters
    return await query.collect();
  }
});
```

### After (CORRECT)
```typescript
export const getFilteredSales = query({
  args: {
    status: v.optional(v.string()),
    minAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    
    const userId = getDataScopeUserId(caller);
    
    let query = ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId)  // ✅ Correct
           .eq('isDeleted', false)
      );
    // ... filters
    return await query.collect();
  }
});
```

---

## Example 3: Create Mutation

### Before (WRONG)
```typescript
export const createExpense = mutation({
  args: {
    category: v.string(),
    amount: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    
    const expenseId = await ctx.db.insert('expenses', {
      userId: identity.subject,  // ❌ Should be owner's userId for staff
      category: args.category,
      amount: args.amount,
      description: args.description,
      createdAt: Date.now(),
    });

    return { success: true, expenseId };
  }
});
```

### After (CORRECT)
```typescript
export const createExpense = mutation({
  args: {
    category: v.string(),
    amount: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_EXPENSES);
    
    const userId = getDataScopeUserId(caller);
    
    const expenseId = await ctx.db.insert('expenses', {
      userId: userId,  // ✅ Uses ownerId for staff
      category: args.category,
      amount: args.amount,
      description: args.description,
      createdAt: Date.now(),
    });

    return { success: true, expenseId };
  }
});
```

---

## Example 4: Update Mutation

### Before (WRONG)
```typescript
export const updateProduct = mutation({
  args: {
    productId: v.id('products'),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    
    const product = await ctx.db.get(args.productId);
    if (!product || product.userId !== identity.subject) {
      throw new Error('Product not found');  // ❌ Doesn't check staff
    }

    await ctx.db.patch(args.productId, {
      name: args.name,
      price: args.price,
      updatedAt: Date.now(),
    });

    return { success: true };
  }
});
```

### After (CORRECT)
```typescript
export const updateProduct = mutation({
  args: {
    productId: v.id('products'),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.EDIT_PRODUCT);
    
    const userId = getDataScopeUserId(caller);
    
    const product = await ctx.db.get(args.productId);
    if (!product || product.userId !== userId) {  // ✅ Use userId from caller
      throw new Error('Product not found');
    }

    await ctx.db.patch(args.productId, {
      name: args.name,
      price: args.price,
      updatedAt: Date.now(),
    });

    return { success: true };
  }
});
```

---

## Example 5: Delete Mutation

### Before (WRONG)
```typescript
export const deleteTransaction = mutation({
  args: {
    transactionId: v.id('transactions'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction || transaction.userId !== identity.subject) {
      throw new Error('Not found');
    }

    await ctx.db.patch(args.transactionId, {
      isDeleted: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  }
});
```

### After (CORRECT)
```typescript
export const deleteTransaction = mutation({
  args: {
    transactionId: v.id('transactions'),
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.DELETE_TRANSACTION);
    
    const userId = getDataScopeUserId(caller);
    
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction || transaction.userId !== userId) {
      throw new Error('Not found');
    }

    await ctx.db.patch(args.transactionId, {
      isDeleted: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  }
});
```

---

## Example 6: Query That Needs Higher Permission

### Before (WRONG)
```typescript
export const exportAllData = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    
    // Anyone can export! ❌
    const products = await ctx.db.query('products').collect();
    const sales = await ctx.db.query('sales').collect();
    
    return { products, sales };
  }
});
```

### After (CORRECT)
```typescript
export const exportAllData = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.EXPORT_DATA);
    
    const userId = getDataScopeUserId(caller);
    
    const products = await ctx.db
      .query('products')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();
    
    const sales = await ctx.db
      .query('sales')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    
    return { products, sales };
  }
});
```

---

## Example 7: Mutation With Activity Audit

### Before (WRONG)
```typescript
export const approveLargeTransaction = mutation({
  args: {
    transactionId: v.id('transactions'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    // No audit trail ❌
    await ctx.db.patch(args.transactionId, {
      status: 'approved',
    });
    
    return { success: true };
  }
});
```

### After (CORRECT)
```typescript
export const approveLargeTransaction = mutation({
  args: {
    transactionId: v.id('transactions'),
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.APPROVE_TRANSACTION);
    
    const userId = getDataScopeUserId(caller);
    
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction || transaction.userId !== userId) {
      throw new Error('Not found');
    }
    
    await ctx.db.patch(args.transactionId, {
      status: 'approved',
      approvedBy: caller.callerId,
      approvedAt: Date.now(),
    });
    
    // Log activity
    await ctx.db.insert('teamActivity', {
      userId: userId,
      actorKey: caller.callerId,
      action: 'transaction.approved',
      entityType: 'transaction',
      entityId: args.transactionId.toString(),
      details: `Approved transaction for $${transaction.amount}`,
      createdAt: Date.now(),
    });
    
    return { success: true };
  }
});
```

---

## Quick Checklist

For each query/mutation, ask:

1. ✅ Do I import `resolveCallerContext`, `requirePermission`, etc.?
2. ✅ Do I call `const caller = await resolveCallerContext(ctx)`?
3. ✅ Do I check `requirePermission(caller, PERMISSIONS.YOUR_PERM)`?
4. ✅ Do I use `getDataScopeUserId(caller)` instead of `identity.subject`?
5. ✅ Do I use the correct userId for all database operations?

---

## Common Mistakes

❌ **Mistake 1:** Using `callerId` directly
```typescript
// WRONG
await ctx.db.insert('products', {
  userId: caller.callerId,  // ❌ Staff inserts as themselves
});

// RIGHT
await ctx.db.insert('products', {
  userId: getDataScopeUserId(caller),  // ✅ Inserts as owner
});
```

❌ **Mistake 2:** Not checking permissions
```typescript
// WRONG
export const deleteProduct = mutation({
  handler: async (ctx, args) => {
    // No permission check!
    await ctx.db.delete(args.productId);
  }
});

// RIGHT
export const deleteProduct = mutation({
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.DELETE_PRODUCT);
    await ctx.db.delete(args.productId);
  }
});
```

❌ **Mistake 3:** Checking ownership with wrong userId
```typescript
// WRONG
if (record.userId !== caller.callerId) throw new Error('Not found');

// RIGHT
if (record.userId !== getDataScopeUserId(caller)) throw new Error('Not found');
```

---

## Testing Each Migration

After migrating a query, test:

1. **As Owner:** Can access and modify their own data ✅
2. **As Staff:** Can access owner's data if permission granted ✅
3. **As Staff:** Cannot access if permission denied ❌
4. **Cross-tenant:** Staff cannot see other org's data ❌
5. **Frontend:** UI hides buttons when permission denied ✅

---

## Related Documents

- [PERMISSION_CATALOG.md](./PERMISSION_CATALOG.md) - Complete permission reference
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick reference & FAQ
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Implementation guide
