# RBAC Implementation Guide

## Overview

This guide explains how to implement and extend the RBAC system for Invento. The system allows business owners to invite staff members with limited permissions within their organization.

## System Architecture

### Core Concept

- **Owners** access their own data directly
- **Staff** access owner's data through a link in the `companyMembers` table
- All queries/mutations enforce permission checks via `resolveCallerContext`

```
┌─────────────────────────────────────────┐
│  Staff Member (e.g., Staff)          │
│  Clerk ID: user_xyz                     │
└────────────┬────────────────────────────┘
             │
             │ Login
             │
             ▼
┌─────────────────────────────────────────┐
│  companyMembers Record                  │
│  userId: user_xyz                       │
│  companyOwnerId: owner_123              │
│  role: "staff"                       │
└────────────┬────────────────────────────┘
             │
             │ resolveCallerContext()
             │
             ▼
┌─────────────────────────────────────────┐
│  MemberContext                          │
│  callerId: user_xyz                     │
│  ownerId: owner_123 (THE KEY!)          │
│  permissions: [view_inventory, ...]    │
└────────────┬────────────────────────────┘
             │
             │ All queries use ownerId
             │
             ▼
┌─────────────────────────────────────────┐
│  Products Table                         │
│  Filtered by userId = owner_123         │
│  Staff sees owner's products              │
└─────────────────────────────────────────┘
```

---

## Core Files

### 1. Schema Updates 
`convex/schema.ts`

```typescript
companyMembers: defineTable({
  companyOwnerId: v.string(),    // Owner's ID
  userId: v.optional(v.string()), // Staff member's ID (NEW!)
  email: v.string(),
  displayName: v.string(),
  role: v.string(),              // "manager", "staff", "viewer"
  status: v.string(),            // "invited", "accepted", "removed"
  ...
})
  .index('by_userId', ['userId'])
  .index('by_company_and_userId', ['companyOwnerId', 'userId'])
```

### 2. Permission Catalog 
`convex/lib/permissions.ts`

```typescript
export const PERMISSIONS = {
  VIEW_INVENTORY: 'view_inventory',
  CREATE_PRODUCT: 'create_product',
  EDIT_PRODUCT: 'edit_product',
  DELETE_PRODUCT: 'delete_product',
  MANAGE_STOCK: 'manage_stock',
  // ... more permissions
};

export const ROLE_PRESETS = {
  owner: [...ALL_PERMISSIONS],
  manager: [...],
  staff: [...],
  viewer: [...],
};
```

### 3. Auth Helper 
`convex/lib/authHelper.ts`

```typescript
export async function resolveCallerContext(
  ctx: QueryCtx | MutationCtx
): Promise<MemberContext> {
  const identity = await ctx.auth.getUserIdentity();
  
  // Check if staff member
  const membership = await ctx.db
    .query('companyMembers')
    .withIndex('by_userId', (q) => q.eq('userId', identity.subject))
    .filter((q) => q.eq(q.field('status'), 'accepted'))
    .first();

  if (membership) {
    return {
      callerId: identity.subject,
      ownerId: membership.companyOwnerId,  // ← THIS IS THE KEY
      role: membership.role,
      permissions: rolePermissions,
      isOwner: false,
    };
  }

  // Owner - full access
  return {
    callerId: identity.subject,
    ownerId: identity.subject,
    role: 'owner',
    permissions: [...ALL_PERMISSIONS],
    isOwner: true,
  };
}
```

### 4. Invitation System 
`convex/companyAccess.ts`

Key mutations:
- `inviteMember` - Owner invites staff with email, name, role
- `acceptInvitation` - Staff accepts invite (links their userId)
- `listOrganizationMembers` - Owner views all members
- `removeMember` - Owner removes staff member
- `updateMemberRole` - Owner changes staff role
- `getCallerContext` - Query (frontend uses this)

### 5. Frontend Hook 
`src/hooks/useUserRole.ts`

```typescript
export function useUserRole() {
  const context = useQuery(api.companyAccess.getCallerContext);
  
  return {
    callerId,
    ownerId,
    role,
    permissions,
    isOwner,
    isLoading,
    can: (permission) => permissions.includes(permission),
    canAny: (permissions) => ...,
    canAll: (permissions) => ...,
  };
}
```

---

## Updating Queries & Mutations

### Before vs After

**Before (old way):**
```typescript
export const getAllProducts = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity.subject; // ❌ Wrong for staff!
    
    return await ctx.db
      .query('products')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();
  }
});
```

**After (new way with RBAC):**
```typescript
export const getAllProducts = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);
    
    const userId = getDataScopeUserId(caller); // ✅ Returns ownerId
    
    return await ctx.db
      .query('products')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();
  }
});
```

---

## Implementation Checklist

### Phase 1: Backend Setup ✅
- [x] Schema with `userId` field
- [x] Permissions catalog
- [x] Auth helper
- [x] Invitation system

### Phase 2: Wrap Queries & Mutations

For every query/mutation:
```typescript
export const myQuery = query({
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.YOUR_PERMISSION);
    
    const userId = getDataScopeUserId(caller);
    
    // Rest of query
  }
});
```

Priority modules:
1. `convex/products.ts`
2. `convex/sales.ts`
3. `convex/expenses.ts`
4. `convex/ledger.ts`
5. `convex/categories.ts`
6. `convex/suppliers.ts`
7. `convex/dashboard.ts`

### Phase 3: Frontend Integration

Use the `useUserRole` hook:

```tsx
const { can, role, isOwner } = useUserRole();

{can('manage_users') && <InviteButton />}
{can('delete_product') && <DeleteButton />}
{isOwner && <BillingSettings />}
```

---

## Security Principles

### 1. Always Use `ownerId` for Queries
```typescript
// ❌ WRONG
const products = await ctx.db
  .query('products')
  .withIndex('by_user_and_isDeleted', (q) =>
    q.eq('userId', caller.callerId) // Staff sees only themselves!
  );

// ✅ CORRECT
const products = await ctx.db
  .query('products')
  .withIndex('by_user_and_isDeleted', (q) =>
    q.eq('userId', caller.ownerId) // Staff sees owner's data
  );
```

### 2. Always Check Permissions in Backend
```typescript
// ❌ Frontend-only check (INSECURE)
if (can('delete_product')) {
  // Call mutation
}

// ✅ Backend check (SECURE)
export const deleteProduct = mutation({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.DELETE_PRODUCT);
  }
});
```

### 3. Frontend Checks Are UX Only
Use frontend checks to hide/show buttons, but always trust backend.

---

## Testing the System

### Test 1: Owner Can See All Data
1. Login as owner
2. Create a product
3. Invite staff
4. Login as staff
5. ✅ Should see owner's product

### Test 2: Staff Cannot Delete
1. Login as staff
2. Try to delete a product
3. ❌ Should get "Permission denied" error

### Test 3: Permission Enforcement
1. Login as owner
2. Remove 'delete_product' from staff role
3. Login as staff
4. ❌ Delete button should be hidden
5. ❌ Backend should reject if they try via API

### Test 4: Multi-Tenant Isolation
1. Create Owner A
2. Create Owner B
3. Owner A creates "Product A"
4. Invite Staff to Owner A
5. Login as Staff → ✅ See Product A
6. ❌ Should NOT see Owner B's products

---

## Common Patterns

### Pattern: Check Permission Before Rendering
```tsx
function ProductActions({ product }) {
  const { can } = useUserRole();
  
  return (
    <div>
      {can('edit_product') && <EditButton />}
      {can('delete_product') && <DeleteButton />}
      {can('manage_stock') && <AdjustStockButton />}
    </div>
  );
}
```

### Pattern: Require Permission in Mutation
```typescript
export const deleteExpense = mutation({
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.DELETE_TRANSACTION);
    
    // Rest of mutation
  }
});
```

---

## Debugging

### Issue: Staff sees different data than owner
**Cause:** Query uses `callerId` instead of `ownerId`
**Fix:** Use `getDataScopeUserId(caller)`

### Issue: Permission denied but should be allowed
**Cause:** Role permissions not set up correctly
**Check:** Verify `customRoles` table

### Issue: Staff can see owner's data but not create transactions
**Cause:** `create_transaction` permission not in staff role
**Fix:** Add permission to role

---

## Next Steps

1. **Update remaining queries** - Wrap all other queries/mutations
2. **Add invite page** - Create settings/users page with invite UI
3. **Add sign up flow** - Call acceptInvitation after signup
4. **Test thoroughly** - Follow testing checklist
5. **Deploy** - Start with staging environment

---

## Related Documents

- [PERMISSION_CATALOG.md](./PERMISSION_CATALOG.md) - Permission reference
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick reference & FAQ
- [MIGRATION_EXAMPLES.md](./MIGRATION_EXAMPLES.md) - Migration code examples
