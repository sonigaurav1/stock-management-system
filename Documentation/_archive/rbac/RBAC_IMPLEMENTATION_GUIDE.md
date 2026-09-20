# Enterprise Role-Based Access Control (RBAC) Implementation Guide

> **Note**: For the latest RBAC documentation, see [Documentation/rbac/IMPLEMENTATION_GUIDE.md](./Documentation/rbac/IMPLEMENTATION_GUIDE.md)

## 🎯 Overview

This document explains the complete enterprise-level RBAC system that has been implemented for Invento. This system allows business owners to invite staff members with limited permissions for the same organization.

For detailed documentation, see [Documentation/rbac/](./Documentation/rbac/)

## 📊 System Architecture

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
│  permissions: [view_inventory, ...]     │
└────────────┬────────────────────────────┘
             │
             │ All queries use ownerId
             │
             ▼
┌─────────────────────────────────────────┐
│  Products Table                         │
│  Filtered by userId = owner_123         │
│  Staff sees owner's products            │
└─────────────────────────────────────────┘
```

## 🔧 Files Created/Modified

### 1. **Schema Updates** 
📄 `convex/schema.ts`

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

**Why the `userId` field?**
- When staff accepts invitation, their Clerk ID is stored here
- Enables fast lookup: `resolveCallerContext` finds their membership

### 2. **Permission Catalog** 
📄 `convex/lib/permissions.ts`

Defines all permissions in one place. Use these strings everywhere:

```typescript
export const PERMISSIONS = {
  VIEW_INVENTORY: 'view_inventory',
  CREATE_PRODUCT: 'create_product',
  EDIT_PRODUCT: 'edit_product',
  DELETE_PRODUCT: 'delete_product',
  MANAGE_STOCK: 'manage_stock',
  CREATE_TRANSACTION: 'create_transaction',
  EDIT_TRANSACTION: 'edit_transaction',
  DELETE_TRANSACTION: 'delete_transaction',
  APPROVE_TRANSACTION: 'approve_transaction',
  // ... more permissions
};

export const ROLE_PRESETS = {
  owner: [/* all permissions */],
  manager: [/* elevated permissions */],
  staff: [/* limited permissions */],
  viewer: [/* read-only */],
};
```

### 3. **Auth Helper** 
📄 `convex/lib/authHelper.ts`

**Core function:** `resolveCallerContext(ctx)`

This is THE most important piece:

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
    // Return OWNER'S ID, not staff member's ID!
    return {
      callerId: identity.subject,
      ownerId: membership.companyOwnerId,  // ← THIS IS THE KEY
      role: membership.role,
      permissions: rolePermissions,
      isOwner: false,
    };
  }

  // Owner - full access to own data
  return {
    callerId: identity.subject,
    ownerId: identity.subject,  // Same as callerId
    role: 'owner',
    permissions: [...ALL_PERMISSIONS],
    isOwner: true,
  };
}
```

### 4. **Invitation System** 
📄 `convex/companyAccess.ts`

Key mutations:

- `inviteMember` - Owner invites staff with email, name, role
- `acceptInvitation` - Staff accepts invite (links their userId)
- `listOrganizationMembers` - Owner views all members
- `removeMember` - Owner removes staff member
- `updateMemberRole` - Owner changes staff role
- `getCallerContext` - Query (frontend uses this)

### 5. **Updated Queries** 
📄 `convex/products.ts`

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
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY); // ✅ Check permission
    
    const userId = getDataScopeUserId(caller); // ✅ Returns ownerId, not callerId
    
    return await ctx.db
      .query('products')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();
  }
});
```

### 6. **Frontend Hook** 
📄 `src/hooks/useUserRole.ts`

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

**Usage in components:**
```tsx
const { can, role, isOwner } = useUserRole();

{can('manage_users') && <InviteButton />}
{can('delete_product') && <DeleteButton />}
{isOwner && <BillingSettings />}
```

### 7. **UI Components** 
📄 `src/components/features/team/InviteMemberDialog.tsx`

- `<InviteMemberDialog />` - Form to invite new members
- `<TeamMembersList />` - List members, change roles, remove members

## 📋 Implementation Checklist

### Phase 1: Backend Setup ✅ (DONE)
- [x] Update schema with `userId` field
- [x] Create permissions catalog
- [x] Create auth helper
- [x] Create invitation system
- [x] Update sample queries
- [x] Create frontend hook

### Phase 2: Wrap All Queries & Mutations (YOU DO THIS)

Go through every query and mutation:

```typescript
// For every query/mutation:
export const myQuery = query({
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.YOUR_PERMISSION); // ADD THIS
    
    const userId = getDataScopeUserId(caller); // USE THIS
    
    // Rest of your query
  }
});
```

Start with these priority modules:
1. `convex/products.ts` - ✅ Already updated
2. `convex/sales.ts` - Wrap with RBAC
3. `convex/expenses.ts` - Wrap with RBAC
4. `convex/ledger.ts` - Wrap with RBAC
5. `convex/categories.ts` - Wrap with RBAC
6. `convex/suppliers.ts` - Wrap with RBAC
7. `convex/dashboard.ts` - Wrap with RBAC

### Phase 3: Add UI Components (YOU DO THIS)

Add invite UI to your settings/users page:

```tsx
// In your settings/users page
import { InviteMemberDialog, TeamMembersList } from '@/components/features/team/InviteMemberDialog';

export default function UsersPage() {
  return (
    <div>
      <InviteMemberDialog />
      <TeamMembersList />
    </div>
  );
}
```

### Phase 4: Signup Flow Integration (YOU DO THIS)

After staff signs up via Clerk, call `acceptInvitation`:

```tsx
// In your signup confirmation page or onboarding
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';

export function SignupComplete() {
  const { user } = useUser();
  const acceptInvitation = useMutation(api.companyAccess.acceptInvitation);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (user?.emailAddresses[0]?.emailAddress) {
      setIsAccepting(true);
      acceptInvitation({ email: user.emailAddresses[0].emailAddress })
        .then(() => {
          // Redirect to dashboard or show welcome message
        })
        .catch((err) => {
          // No pending invitation - user is self-registered owner
          console.log(err);
        })
        .finally(() => setIsAccepting(false));
    }
  }, [user]);

  return <div>Welcome! Setting up your account...</div>;
}
```

## 🔐 Security Principles

### 1. **Always Use `ownerId` for Queries**
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

### 2. **Always Check Permissions in Backend**
```typescript
// ❌ Frontend-only check (INSECURE - can be bypassed)
if (can('delete_product')) {
  // Call mutation
}

// ✅ Backend check (SECURE - cannot be bypassed)
export const deleteProduct = mutation({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.DELETE_PRODUCT); // ← Backend enforces
  }
});
```

### 3. **Frontend Checks Are UX Only**
Use frontend checks (`useUserRole().can()`) to hide/show buttons, but always trust backend.

## 📝 Permission Reference

### Inventory Permissions
- `view_inventory` - Can see products, stock levels
- `create_product` - Can add new products
- `edit_product` - Can modify product details
- `delete_product` - Can remove products
- `manage_stock` - Can adjust stock levels

### Transaction Permissions
- `create_transaction` - Can create sales/purchases
- `edit_transaction` - Can modify transactions
- `delete_transaction` - Can remove transactions
- `approve_transaction` - Can approve pending transactions

### Report Permissions
- `view_reports` - Can access reports
- `export_data` - Can export data to CSV/Excel
- `view_ledger` - Can view financial ledger
- `manage_expenses` - Can manage expense entries
- `view_financial_reports` - Can see P&L, cash flow

### Admin Permissions
- `manage_users` - Can invite/remove team members
- `manage_roles` - Can create/edit roles
- `manage_settings` - Can change organization settings
- `view_audit_logs` - Can view activity logs
- `view_compliance` - Can access compliance reports

## 🚀 Testing the System

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
3. Logout
4. Login as staff
5. ❌ Delete button should be hidden
6. ❌ Backend should reject if they try via API

### Test 4: Multi-Tenant Isolation
1. Create Owner A
2. Create Owner B
3. Owner A creates product "Product A"
4. Invite Staff to Owner A
5. Login as Staff → ✅ See Product A
6. ❌ Should NOT see Owner B's products
7. Try calling `getProducts` with Owner B's ID → ❌ Should fail permission check

## 📚 Common Patterns

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

### Pattern: Custom Role Validation
```typescript
export async function getCustomRole(ctx, userId, roleName) {
  return await ctx.db
    .query('customRoles')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .filter((q) => q.eq(q.field('name'), roleName))
    .first();
}
```

## 🐛 Debugging

### Issue: Staff sees different data than owner
**Cause:** Query is using `callerId` instead of `ownerId`
**Fix:** Use `getDataScopeUserId(caller)` to get the right userId

### Issue: Permission denied but should be allowed
**Cause:** Role permissions not set up correctly
**Fix:** Check `customRoles` table - verify role has the permission

### Issue: Staff can see owner's data but not create transactions
**Cause:** `create_transaction` permission not in staff role
**Fix:** Add permission to role: `updateMemberRole(membershipId, staff role with create_transaction)`

## 🔄 Next Steps

1. **Update remaining queries** - Wrap all other queries/mutations
2. **Add invite page** - Create `/settings/users` page with invite UI
3. **Add sign up flow** - Call `acceptInvitation` after signup
4. **Test thoroughly** - Follow testing checklist above
5. **Deploy carefully** - Start with staging environment

## 📞 Questions?

Refer back to:
- `resolveCallerContext` in `convex/lib/authHelper.ts` - How auth works
- `PERMISSIONS` in `convex/lib/permissions.ts` - Permission strings
- `InviteMemberDialog` in `src/components/features/team/InviteMemberDialog.tsx` - UI examples
- Existing mutations in `convex/companyAccess.ts` - Implementation examples
