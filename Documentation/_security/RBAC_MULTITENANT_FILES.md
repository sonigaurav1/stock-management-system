# RBAC & Multi-Tenant Files - Complete Reference

**Last Updated:** May 7, 2026  
**Total Files:** 70+  
**Scope:** All files implementing RBAC/multi-tenant patterns in Invento

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Core Infrastructure](#core-infrastructure)
3. [Frontend Files](#frontend-files)
4. [Backend Convex Files](#backend-convex-files)
5. [Patterns & Examples](#patterns--examples)
6. [Quick Reference](#quick-reference)

---

## Overview

The Invento codebase implements a comprehensive **Role-Based Access Control (RBAC)** and **multi-tenant** system across 70+ files. This document provides a complete reference of all files involved, their purposes, and the patterns they implement.

### Key Statistics

| Metric | Count |
|--------|-------|
| **Total RBAC/Multi-tenant Files** | 70+ |
| **Frontend Files** | 45+ |
| **Backend Convex Files** | 29 |
| **Permissions Defined** | 22 |
| **Role Presets** | 4 (Owner, Manager, Staff, Viewer) |
| **Multi-tenant Tables** | 15+ |

### Core Concepts

**Multi-Tenancy:** Each user account is a separate tenant. All data is isolated by `userId`.

**RBAC:** Users have roles (Owner, Manager, Staff, Viewer) with specific permissions.

**Staff Access:** Staff members can be invited to view/manage an owner's account via `companyMembers` table.

**Data Isolation:** All queries use `resolveCallerContext()` → `getDataScopeUserId()` to ensure correct tenant access.

---

## Core Infrastructure

### 1. **convex/lib/authHelper.ts**

**Purpose:** Main RBAC resolver and permission enforcement

**Key Functions:**
- `resolveCallerContext(ctx)` → Returns `MemberContext` with caller info
  - Determines if user is owner or staff member
  - Resolves correct role and permissions
  - Returns `ownerId` (tenant identifier)
- `requirePermission(ctx, permission)` → Enforces permission or throws error
- `requireAnyPermission(ctx, permissions[])` → Check multiple permissions
- `getDataScopeUserId(ctx)` → Returns `ownerId` for queries
- `getOrganizationMembers(ctx, caller)` → List team members (owner only)

**MemberContext Type:**
```typescript
type MemberContext = {
  callerId: string;        // Logged-in user's Clerk ID
  ownerId: string;         // Tenant/owner ID (same as callerId for owners)
  role: string;            // "owner", "staff", "manager", "viewer"
  permissions: string[];   // Array of permission strings
  isOwner: boolean;        // Is this the account owner?
  membershipId?: string;   // ID of companyMembers record (if staff)
};
```

**Usage Pattern:**
```typescript
const caller = await resolveCallerContext(ctx);
requirePermission(caller, PERMISSIONS.EDIT_PRODUCT);
const userId = getDataScopeUserId(caller);
// Now query/mutate with userId
```

---

### 2. **convex/lib/permissions.ts**

**Purpose:** Permission and role definitions

**Key Exports:**
- `PERMISSIONS` object with 22 permission strings
- `ROLE_PRESETS` with 4 preset roles
- `hasPermission(permissions[], permission)` → Boolean
- `hasAnyPermission(permissions[], permissions[])` → Boolean
- `hasAllPermissions(permissions[], permissions[])` → Boolean
- `getPresetPermissions(roleName)` → String array

**Permissions (22 total):**
```typescript
VIEW_INVENTORY, CREATE_PRODUCT, EDIT_PRODUCT, DELETE_PRODUCT,
MANAGE_STOCK, CREATE_TRANSACTION, EDIT_TRANSACTION,
DELETE_TRANSACTION, APPROVE_TRANSACTION, VIEW_REPORTS,
EXPORT_DATA, VIEW_LEDGER, MANAGE_EXPENSES,
VIEW_FINANCIAL_REPORTS, MANAGE_SUPPLIERS, MANAGE_USERS,
MANAGE_ROLES, MANAGE_SETTINGS, VIEW_ORGANIZATION,
MANAGE_ORGANIZATION, VIEW_AUDIT_LOGS, VIEW_COMPLIANCE
```

**Role Presets:**
- **Owner:** 22 permissions (full access)
- **Manager:** 15 permissions (most operations)
- **Staff:** 5 permissions (create/view only)
- **Viewer:** 3 permissions (view only)

---

## Frontend Files

### Hooks (7 files)

#### 1. **src/hooks/useUserRole.ts**
- **Purpose:** Get current user's role and permissions
- **Pattern:** Calls `api.companyAccess.getCallerContext()` query
- **Returns:** `{ role, permissions, isOwner, ownerId }`
- **Usage:** Gate UI components based on user role

#### 2. **src/hooks/useAuth.ts**
- **Location:** `src/features/auth/hooks/useAuth.ts`
- **Purpose:** Get current user authentication context
- **Pattern:** Integrates with Clerk auth
- **Returns:** User identity and auth state

#### 3. **src/hooks/useAdminDashboard.ts**
- **Purpose:** Gate admin dashboard access
- **Pattern:** Checks user role is owner
- **Returns:** Admin access flag

#### 4. **src/hooks/usePendingRoleSync.ts**
- **Purpose:** Track pending role synchronization from Clerk
- **Pattern:** Manages role sync state
- **Returns:** Sync status and error info

#### 5. **src/hooks/useSidebarNav.ts**
- **Purpose:** Get navigation items by user role
- **Pattern:** Filters nav items based on permissions
- **Returns:** Role-filtered navigation

#### 6. **src/components/dashboard/compliance.hooks.ts**
- **Purpose:** Compliance feature hooks
- **Pattern:** Role-based compliance features
- **Returns:** Compliance state

#### 7. **src/app/api/\*.ts** (Implicit hooks)
- Various API routes that handle auth

---

### UI Components (12 files)

#### 1. **src/components/RoleSyncProvider.tsx**
- **Purpose:** Provide role context to app
- **Pattern:** React Context Provider for role state
- **Usage:** Wraps entire app to share role data

#### 2. **src/components/RoleSyncStatus.tsx**
- **Purpose:** Display role synchronization status
- **Pattern:** Shows sync in progress/error
- **Usage:** Status indicator component

#### 3. **src/features/teams/components/RoleSyncStatus.tsx**
- **Purpose:** Team-specific role sync display
- **Pattern:** Team role management UI
- **Usage:** Team management page

#### 4. **src/components/dashboard/AccessControl.tsx**
- **Purpose:** Gate UI components by permission
- **Pattern:** Conditional rendering based on `permissions` array
- **Usage:** `<AccessControl permission="manage_users"><UserForm/></AccessControl>`

#### 5. **src/components/layout/AppSidebar.tsx**
- **Purpose:** Main sidebar navigation
- **Pattern:** Filters nav items by role
- **Usage:** Dynamic navigation based on user role

#### 6. **src/components/AppHead.tsx**
- **Purpose:** App header with user info
- **Pattern:** Displays current role/org
- **Usage:** Header component

#### 7. **src/features/teams/components/UsersPermissionsPage.tsx**
- **Purpose:** User and permission management UI
- **Pattern:** CRUD operations on roles and permissions
- **Usage:** Settings > Users page

#### 8. **src/features/admin/components/TeamMembersTab.tsx**
- **Purpose:** Admin view of team members
- **Pattern:** List and manage team
- **Usage:** Admin dashboard

#### 9. **src/features/admin/components/EnterpriseTeamManagement.tsx**
- **Purpose:** Enterprise team features
- **Pattern:** Advanced team management
- **Usage:** Admin dashboard

#### 10. **src/features/admin/components/EnterpriseSystemSettings.tsx**
- **Purpose:** System-level admin settings
- **Pattern:** Admin-only settings
- **Usage:** Admin panel

#### 11. **src/config/role-nav-config.ts**
- **Purpose:** Navigation configuration by role
- **Pattern:** Maps roles to allowed routes
- **Usage:** Route filtering/generation

#### 12. **src/components/features/team/InviteMemberDialog.tsx**
- **Purpose:** Invite team members dialog
- **Pattern:** Form with role selection
- **Usage:** Add team member modal

---

### Permission & Configuration Files (3 files)

#### 1. **src/features/teams/permissionCatalog.ts**
- **Purpose:** Frontend permission constants
- **Exports:** `PERMISSION_OPTIONS`, `TRANSACTION_TYPE_OPTIONS`
- **Pattern:** Matches `convex/lib/permissions.ts`
- **Usage:** Form options, permission lists

```typescript
export const PERMISSION_OPTIONS = [
  { id: 'view_inventory', label: 'View inventory' },
  { id: 'create_transaction', label: 'Create transactions' },
  // ... 20 more
];
```

#### 2. **src/types/settings.ts**
- **Purpose:** TypeScript types for settings
- **Pattern:** Type definitions for settings UI
- **Usage:** Form validation

#### 3. **src/constants/data.ts**
- **Purpose:** App constants and navigation config
- **Pattern:** NavItems array filtered by role
- **Usage:** Sidebar generation

---

### Authentication Pages (5 files)

#### 1. **src/features/auth/components/SignUpForm.tsx**
- **Purpose:** User registration form
- **Pattern:** Captures email, password, org name
- **RBAC Usage:** Creates user with "owner" role

#### 2. **src/features/auth/components/SignUpView.tsx**
- **Purpose:** Sign up flow wrapper
- **Pattern:** Orchestrates sign up
- **RBAC Usage:** Creates initial org and role

#### 3. **src/features/auth/BusinessRegistrationForm.tsx**
- **Purpose:** Business information form
- **Pattern:** Captures business details
- **RBAC Usage:** Sets org context

#### 4. **src/app/(auth)/company-registration/page.tsx**
- **Purpose:** Company registration page
- **Pattern:** Multi-step company setup
- **RBAC Usage:** Creates company record

#### 5. **src/features/auth/components/PhoneInputWithCountry.tsx**
- **Purpose:** Phone input component
- **Pattern:** Reusable form component
- **Usage:** Auth forms

---

### Settings Pages (7 files)

#### 1. **src/features/settings/organization/components/OrganizationSettings.tsx**
- **Purpose:** Edit organization details
- **RBAC:** Owner only (checks via mutation)
- **Pattern:** Calls `companies.updateCompany()` mutation

#### 2. **src/features/settings/profile/components/ProfilePage.tsx**
- **Purpose:** Edit user profile
- **RBAC:** User's own profile
- **Pattern:** Calls `users.updateProfile()` mutation

#### 3. **src/features/settings/notifications/components/NotificationSettings.tsx**
- **Purpose:** Notification preferences
- **RBAC:** User's own preferences
- **Pattern:** Calls `notificationPreferences.*()` mutations

#### 4. **src/features/settings/integrations/components/IntegrationSettings.tsx**
- **Purpose:** Integration configuration
- **RBAC:** Owner/admin only
- **Pattern:** Advanced settings

#### 5. **src/app/(main)/(authenticated)/settings/users/page.tsx**
- **Purpose:** Users & teams page
- **RBAC:** `manage_users` permission
- **Pattern:** Renders `UsersPermissionsPage` component

#### 6. **src/app/(main)/(authenticated)/settings/organization/page.tsx**
- **Purpose:** Organization settings page
- **RBAC:** `manage_organization` permission
- **Pattern:** Renders `OrganizationSettings` component

#### 7. **src/app/(main)/(authenticated)/settings/layout.tsx**
- **Purpose:** Settings layout wrapper
- **Pattern:** Nested route layout
- **RBAC Usage:** Filters sidebar nav items

---

### Other Pages & Routes (10+ files)

#### 1. **src/app/(main)/(authenticated)/organization/page.tsx**
- **Purpose:** Organization overview
- **RBAC:** `view_organization` permission

#### 2. **src/app/(auth)/accept-invite/page.tsx**
- **Purpose:** Accept team invite
- **RBAC Usage:** Handles `companyMembers` invite acceptance

#### 3. **src/app/(main)/(authenticated)/billing/BillingAccessGuard.tsx**
- **Purpose:** Gate billing access
- **RBAC:** Checks owner status

#### 4. **src/app/api/roles/route.ts**
- **Purpose:** Get user roles API
- **Endpoint:** GET /api/roles
- **Returns:** User's roles array

#### 5. **src/app/api/change-role/route.ts**
- **Purpose:** Change user role API
- **Endpoint:** POST /api/change-role
- **RBAC:** Updates Clerk metadata

#### 6. **src/app/api/user-metadata/route.ts**
- **Purpose:** Get user metadata API
- **Endpoint:** GET /api/user-metadata
- **Returns:** User info from Clerk

#### 7. **src/app/api/staff-metadata/route.ts**
- **Purpose:** Get staff member metadata API
- **Endpoint:** GET /api/staff-metadata
- **Returns:** Team member info

#### 8. **src/app/api/settings/route.ts**
- **Purpose:** Settings API
- **Endpoint:** GET/POST /api/settings

#### 9. **src/features/overview/components/IntelligentDashboard.tsx**
- **Purpose:** Main dashboard
- **RBAC:** Role-based layout

#### 10. **src/features/help/components/HelpCenter.tsx**
- **Purpose:** Help center
- **RBAC:** Shows role-specific help

#### 11. **src/features/billing/components/ShareButtons.tsx**
- **Purpose:** Billing share buttons
- **RBAC:** Owner only

#### 12. **src/proxy.ts**
- **Purpose:** Middleware/auth proxy
- **Pattern:** Request routing and auth

---

### Other Frontend Files (10+ files)

| File | Purpose |
|------|---------|
| `src/lib/design-tokens.ts` | Design system with role-based theming |
| `src/app/(marketing)/(landing-page)/page.tsx` | Landing page (public) |
| `src/app/(marketing)/terms/page.tsx` | Terms page (public) |
| `src/components/ui/alert.tsx` | Shadcn UI alert component |
| `src/components/ui/table.tsx` | Shadcn UI table component |
| `src/components/ui/breadcrumb.tsx` | Shadcn UI breadcrumb |
| `src/app/globals.css` | Global CSS |
| `src/app/layout.tsx` | Root layout |

---

## Backend Convex Files

### Core RBAC Infrastructure (2 files)

#### 1. **convex/lib/authHelper.ts** ⭐
- **Status:** Core infrastructure
- **Functions:**
  - `resolveCallerContext(ctx)` - Main resolver
  - `requirePermission(ctx, permission)` - Enforce permission
  - `requireAnyPermission(ctx, permissions[])` - Multiple perms
  - `getDataScopeUserId(ctx)` - Get tenant ID
  - `getOrganizationMembers(ctx, caller)` - List team
- **Usage:** All mutations/queries must call this

#### 2. **convex/lib/permissions.ts** ⭐
- **Status:** Core infrastructure
- **Exports:**
  - `PERMISSIONS` object (22 constants)
  - `ROLE_PRESETS` (4 roles)
  - Helper functions (hasPermission, etc.)
- **Usage:** Import and use in all RBAC checks

---

### Team & Access Management (4 files)

#### 1. **convex/teamManagement.ts**
- **Functions:**
  - `ensureTeamDefaults()` - Create preset roles
  - `getUserPermissions()` - Get user's permissions
  - `createCustomRole()` - Add custom role
  - `updateCustomRole()` - Edit custom role
  - `deleteCustomRole()` - Remove custom role
  - `getUserRoles()` - List all roles
  - `changeUserRole()` - Assign role to user
  - `removeUserFromTeam()` - Remove team member
- **RBAC Pattern:** Uses `resolveCallerContext()` + `requirePermission()`
- **Multi-tenant:** Filters by `userId` (owner)

#### 2. **convex/companyAccess.ts**
- **Functions:**
  - `inviteMember(email, displayName, role)` - Send invite
  - `acceptInvite(token)` - Accept team invite
  - `getCallerContext()` - Get caller's context
  - `getTeamMembers()` - List team members
  - `removeTeamMember()` - Remove member
  - `updateMemberRole()` - Change member role
- **RBAC Pattern:** Owner-only guards, staff access patterns
- **Multi-tenant:** Uses `companyMembers` table with owner ID

#### 3. **convex/companyTeam.ts**
- **Functions:** Team member CRUD operations
- **RBAC Pattern:** Uses `resolveCallerContext()`
- **Multi-tenant:** Filters by owner

#### 4. **convex/users.ts**
- **Functions:** User management and queries
- **RBAC Pattern:** User-scoped queries
- **Multi-tenant:** Uses `userId` for isolation

---

### Inventory & Products (6 files)

All use the pattern: `resolveCallerContext()` → `requirePermission()` → `getDataScopeUserId()`

#### 1. **convex/products.ts**
- **Queries:**
  - `getProducts()` - List products
  - `getProduct(id)` - Get single product
  - `searchProducts(query)` - Search products
- **Mutations:**
  - `createProduct(name, sku, ...)` - Create product
  - `updateProduct(id, updates)` - Edit product
  - `deleteProduct(id)` - Delete product
  - `bulkRestockProducts(updates)` - Bulk restock
- **RBAC:** Permissions checked (or should be)
- **Multi-tenant:** All use `getDataScopeUserId()`

#### 2. **convex/suppliers.ts**
- **Functions:** Supplier CRUD
- **RBAC:** `manage_suppliers` permission
- **Multi-tenant:** Filtered by user ID

#### 3. **convex/categories.ts**
- **Functions:** Product category management
- **RBAC:** `manage_stock` or owner
- **Multi-tenant:** User-scoped

#### 4. **convex/productSuppliers.ts**
- **Functions:** Product-supplier relationship
- **RBAC:** Associated with product permissions
- **Multi-tenant:** User-scoped

#### 5. **convex/stockTransfers.ts**
- **Functions:** Stock transfer operations
- **RBAC:** `manage_stock` permission
- **Multi-tenant:** User-scoped

#### 6. **convex/locations.ts**
- **Functions:** Location management
- **RBAC:** Owner/manager
- **Multi-tenant:** User-scoped

---

### Sales & Transactions (3 files)

All use the pattern: `resolveCallerContext()` → `requirePermission()` → `getDataScopeUserId()`

#### 1. **convex/sales.ts**
- **Functions:** Sale transactions
  - `getSales()` - Query sales
  - `createSale()` - Create sale
  - `updateSale()` - Edit sale
- **RBAC:** `create_transaction`, `edit_transaction`
- **Multi-tenant:** User-scoped

#### 2. **convex/payments.ts**
- **Functions:** Payment management
  - `getPayments()` - Query payments ⚠️ **IDOR vulnerability**
  - `createPayment()` - Create payment
  - `deletePayment()` - Delete payment
- **RBAC:** `view_reports` permission
- **Multi-tenant:** ⚠️ Takes userId from args (should use resolved context)

#### 3. **convex/invoiceScheduler.ts**
- **Functions:** Recurring invoice scheduling
- **RBAC:** `manage_settings` or owner
- **Multi-tenant:** User-scoped

---

### Finance & Ledger (4 files)

All use the pattern: `resolveCallerContext()` → `requirePermission()` → `getDataScopeUserId()`

#### 1. **convex/ledger.ts**
- **Functions:** Ledger entries
  - `getLedgerEntries()` - Query ledger
  - `createLedgerEntry()` - Add entry
- **RBAC:** `view_ledger` permission
- **Multi-tenant:** User-scoped

#### 2. **convex/expenses.ts**
- **Functions:** Expense management
  - `getExpenses()` - Query expenses
  - `createExpense()` - Create expense
  - `updateExpense()` - Edit expense
  - `approveExpense()` - Approve expense
  - `deleteExpense()` - Delete expense
- **RBAC:** `manage_expenses` permission
- **Multi-tenant:** User-scoped
- **Note:** ⚠️ Uses `tokenIdentifier` (should use `subject`)

#### 3. **convex/billing.ts**
- **Functions:** Invoice generation
  - `createInvoice()` - Create invoice
  - `getInvoices()` - Query invoices
  - `updateInvoice()` - Edit invoice
- **RBAC:** Owner/manager
- **Multi-tenant:** ⚠️ Takes userId from args (should use resolved context)

#### 4. **convex/accountStatus.ts**
- **Functions:** Account status tracking
  - `createAccountStatus()` - Create status
  - `getAccountStatus()` - Get status
  - `updateAccountStatus()` - Update status
- **RBAC:** ⚠️ No authentication check
- **Multi-tenant:** User-scoped

---

### Organization & Settings (5 files)

All use the pattern: `resolveCallerContext()` → `requirePermission()` → `getDataScopeUserId()`

#### 1. **convex/companies.ts**
- **Functions:** Company/org management
  - `getCompanies()` - List companies
  - `createCompany()` - Create company
  - `updateCompany()` - Edit company
  - `updateVerificationStatus()` - Update VAT/PAN status
  - `getCompanyById()` - Get company
- **RBAC:** `manage_organization` permission
- **Multi-tenant:** Owner-scoped

#### 2. **convex/organizations.ts**
- **Functions:** Organization settings
  - `getOrganization()` - Get org info
  - `updateOrganization()` - Update settings
- **RBAC:** Owner-only
- **Multi-tenant:** User-scoped

#### 3. **convex/settings.ts**
- **Functions:** User settings
  - Various settings CRUD
- **RBAC:** User's own settings
- **Multi-tenant:** User-scoped

#### 4. **convex/notificationPreferences.ts**
- **Functions:** Notification preferences
  - Get/update preferences
- **RBAC:** User's own preferences
- **Multi-tenant:** User-scoped

#### 5. **convex/companyAccessActions.ts**
- **Functions:** Company access control actions
- **RBAC:** Owner-only
- **Multi-tenant:** Owner-scoped

---

### Admin & Compliance (3 files)

#### 1. **convex/admin.ts**
- **Functions:**
  - `checkAdminAccess()` - Verify admin status
- **RBAC:** ⚠️ Uses single ADMIN_USER_ID env var
- **Note:** No multi-admin support

#### 2. **convex/logs.ts**
- **Functions:** Audit logging
  - `createLog()` - Create audit log
  - `getLogs()` - Query logs
  - `clearLogs()` - Clear logs
- **RBAC:** `view_audit_logs` permission
- **Multi-tenant:** User-scoped

#### 3. **convex/notifications.ts**
- **Functions:** Notification system
  - Send notifications
  - Get notifications
- **RBAC:** User-scoped
- **Multi-tenant:** User-scoped

---

### Analytics & Intelligence (5 files)

All use the pattern: `resolveCallerContext()` → `getDataScopeUserId()`

#### 1. **convex/dashboard.ts**
- **Functions:** Dashboard data queries
- **RBAC:** `view_reports` permission
- **Multi-tenant:** User-scoped

#### 2. **convex/dashboardConfig.ts**
- **Functions:** Dashboard configuration
- **RBAC:** User-owned config
- **Multi-tenant:** User-scoped

#### 3. **convex/dashboardExport.ts**
- **Functions:** Data export
- **RBAC:** `export_data` permission
- **Multi-tenant:** User-scoped

#### 4. **convex/analytics.ts**
- **Functions:** Analytics queries
- **RBAC:** `view_reports` permission
- **Multi-tenant:** User-scoped

#### 5. **convex/customerIntelligence.ts**
- **Functions:** Customer analysis
- **RBAC:** `view_reports` permission
- **Multi-tenant:** User-scoped

#### 6. **convex/inventoryOptimization.ts**
- **Functions:** Inventory recommendations
- **RBAC:** Owner/manager
- **Multi-tenant:** User-scoped

---

### Database & Schema (3 files)

#### 1. **convex/schema.ts**
- **Purpose:** Database schema definitions
- **RBAC Usage:** All tables include `userId` field
- **Multi-tenant:** Defines schema with tenant isolation
- **Example:**
  ```typescript
  products: defineTable({
    userId: v.string(),      // ← Tenant identifier
    name: v.string(),
    // ... other fields
  })
    .index('by_user', ['userId'])
    .index('by_user_and_isDeleted', ['userId', 'isDeleted'])
  ```

#### 2. **convex/schema.additions.ts**
- **Purpose:** Schema extensions
- **RBAC Usage:** Additional table definitions
- **Multi-tenant:** Follows same pattern

#### 3. **convex/tests.ts**
- **Purpose:** Test utilities
- **Usage:** Testing helpers

---

### Auto-Generated Files (1 file)

#### 1. **convex/_generated/api.d.ts**
- **Purpose:** Auto-generated Convex API types
- **Note:** Generated by `npx convex codegen`
- **Usage:** Import for type-safe API calls

---

## Patterns & Examples

### Pattern 1: Basic Query with RBAC

```typescript
// convex/products.ts
import { query } from './_generated/server';
import { resolveCallerContext, getDataScopeUserId } from './lib/authHelper';

export const getProducts = query({
  args: {},
  async handler(ctx) {
    const caller = await resolveCallerContext(ctx);
    const userId = getDataScopeUserId(caller);
    
    return await ctx.db
      .query('products')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
  }
});
```

### Pattern 2: Mutation with Permission Check

```typescript
// convex/products.ts
import { mutation } from './_generated/server';
import { resolveCallerContext, requirePermission, getDataScopeUserId } from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

export const createProduct = mutation({
  args: { name: v.string() },
  async handler(ctx, args) {
    // 1. Resolve caller context
    const caller = await resolveCallerContext(ctx);
    
    // 2. Check permission
    requirePermission(caller, PERMISSIONS.CREATE_PRODUCT);
    
    // 3. Get tenant ID
    const userId = getDataScopeUserId(caller);
    
    // 4. Create with userId
    return await ctx.db.insert('products', {
      userId,
      name: args.name,
      createdAt: Date.now(),
      // ... other fields
    });
  }
});
```

### Pattern 3: Frontend Permission Gate

```typescript
// src/components/dashboard/AccessControl.tsx
import { useUserRole } from '@/hooks/useUserRole';

export function AccessControl({ permission, children }) {
  const { permissions } = useUserRole();
  
  if (!permissions.includes(permission)) {
    return null;
  }
  
  return <>{children}</>;
}

// Usage
<AccessControl permission="manage_users">
  <UserManagementForm />
</AccessControl>
```

### Pattern 4: Team Member Query

```typescript
// convex/users.ts - Staff member gets owner's data

const caller = await resolveCallerContext(ctx);
// If staff member: caller.ownerId = owner's ID, caller.callerId = staff's ID
// If owner: caller.ownerId = owner's ID, caller.callerId = owner's ID

const userId = getDataScopeUserId(caller); // Returns caller.ownerId

// Both owner and staff query the SAME data (owner's data)
const items = await ctx.db
  .query('products')
  .withIndex('by_user', (q) => q.eq('userId', userId))
  .collect();
```

---

## Quick Reference

### File Categories

| Category | Files | Purpose |
|----------|-------|---------|
| **Core RBAC** | 2 | Permission system & auth resolver |
| **Team Management** | 4 | Invites, roles, members |
| **Inventory** | 6 | Products, suppliers, categories |
| **Sales/Transactions** | 3 | Sales, payments, invoicing |
| **Finance/Ledger** | 4 | Ledger, expenses, billing |
| **Organization** | 5 | Company, org, settings |
| **Admin/Compliance** | 3 | Admin access, logs, notifications |
| **Analytics** | 5+ | Dashboard, export, analytics |
| **Frontend Hooks** | 7 | Auth & role hooks |
| **Frontend Components** | 12 | UI components with RBAC |
| **Frontend Settings** | 7 | Settings pages |
| **Frontend Auth** | 5 | Sign up, invite flow |
| **Frontend Other** | 10+ | Other pages & routes |

### Key Functions

| Function | File | Purpose |
|----------|------|---------|
| `resolveCallerContext()` | authHelper.ts | Main RBAC resolver |
| `requirePermission()` | authHelper.ts | Enforce permission |
| `getDataScopeUserId()` | authHelper.ts | Get tenant ID |
| `inviteMember()` | companyAccess.ts | Invite team member |
| `acceptInvite()` | companyAccess.ts | Accept invite |
| `getCallerContext()` | companyAccess.ts | Get caller info (frontend) |
| `useUserRole()` | hooks/useUserRole.ts | Get user role (frontend) |

### Key Tables

| Table | Tenant Field | Purpose |
|-------|-------------|---------|
| `products` | userId | User's inventory |
| `suppliers` | userId | User's suppliers |
| `sales` | userId | User's sales |
| `expenses` | userId | User's expenses |
| `payments` | userId | User's payments |
| `ledger` | userId | User's ledger |
| `companyMembers` | companyOwnerId | Team membership |
| `customRoles` | userId | Custom roles per owner |

### Permission Quick Access

**Inventory Permissions:**
```
VIEW_INVENTORY, CREATE_PRODUCT, EDIT_PRODUCT, DELETE_PRODUCT, MANAGE_STOCK
```

**Transaction Permissions:**
```
CREATE_TRANSACTION, EDIT_TRANSACTION, DELETE_TRANSACTION, APPROVE_TRANSACTION
```

**Report Permissions:**
```
VIEW_REPORTS, EXPORT_DATA
```

**Admin Permissions:**
```
MANAGE_USERS, MANAGE_ROLES, MANAGE_SETTINGS, MANAGE_ORGANIZATION, VIEW_AUDIT_LOGS
```

---

## Security Notes

### ✅ Properly Implemented

- Permission catalog with constants
- Role presets (Owner, Manager, Staff, Viewer)
- `resolveCallerContext()` for safe auth
- Multi-tenant isolation via `userId` filtering
- Staff member access via `companyMembers` table

### ⚠️ Known Issues

- **Product mutations:** Missing EDIT/DELETE permission checks
- **IDOR in payments:** `getPayments()` takes userId from args
- **Auth inconsistency:** Some files use `tokenIdentifier` vs `subject`
- **accountStatus:** No authentication check
- **Admin access:** Single env var (no multi-admin)

### 🔧 Implementation Checklist

When adding new features:

- [ ] Use `resolveCallerContext()` at start of mutation/query
- [ ] Check permissions with `requirePermission()`
- [ ] Use `getDataScopeUserId()` for all data queries
- [ ] Add `userId` field to new tables
- [ ] Add indexes like `by_user`, `by_user_and_isDeleted`
- [ ] Log audit events for sensitive operations
- [ ] Filter soft deletes with `isDeleted: false`
- [ ] Test with staff member accounts

---

## Files Index (Alphabetical)

### Frontend (A-Z)

```
src/app/(auth)/accept-invite/page.tsx
src/app/(auth)/company-registration/page.tsx
src/app/(main)/(authenticated)/billing/BillingAccessGuard.tsx
src/app/(main)/(authenticated)/organization/page.tsx
src/app/(main)/(authenticated)/settings/layout.tsx
src/app/(main)/(authenticated)/settings/organization/page.tsx
src/app/(main)/(authenticated)/settings/users/page.tsx
src/app/api/change-role/route.ts
src/app/api/roles/route.ts
src/app/api/settings/route.ts
src/app/api/staff-metadata/route.ts
src/app/api/user-metadata/route.ts
src/app/(marketing)/(landing-page)/page.tsx
src/app/(marketing)/terms/page.tsx
src/app/globals.css
src/app/layout.tsx
src/components/AppHead.tsx
src/components/RoleSyncProvider.tsx
src/components/RoleSyncStatus.tsx
src/components/dashboard/AccessControl.tsx
src/components/dashboard/compliance.hooks.ts
src/components/dashboard/INTEGRATION_EXAMPLES.ts
src/components/features/team/InviteMemberDialog.tsx
src/components/layout/AppSidebar.tsx
src/components/ui/alert.tsx
src/components/ui/breadcrumb.tsx
src/components/ui/table.tsx
src/config/role-nav-config.ts
src/constants/data.ts
src/features/admin/components/EnterpriseSystemSettings.tsx
src/features/admin/components/EnterpriseTeamManagement.tsx
src/features/admin/components/TeamMembersTab.tsx
src/features/auth/BusinessRegistrationForm.tsx
src/features/auth/components/PhoneInputWithCountry.tsx
src/features/auth/components/SignUpForm.tsx
src/features/auth/components/SignUpView.tsx
src/features/auth/hooks/useAuth.ts
src/features/billing/components/ShareButtons.tsx
src/features/help/components/HelpCenter.tsx
src/features/overview/components/IntelligentDashboard.tsx
src/features/settings/integrations/components/IntegrationSettings.tsx
src/features/settings/notifications/components/NotificationSettings.tsx
src/features/settings/organization/components/OrganizationSettings.tsx
src/features/settings/profile/components/ProfilePage.tsx
src/features/teams/components/RoleSyncStatus.tsx
src/features/teams/components/UsersPermissionsPage.tsx
src/features/teams/permissionCatalog.ts
src/hooks/useAdminDashboard.ts
src/hooks/usePendingRoleSync.ts
src/hooks/useSidebarNav.ts
src/hooks/useUserRole.ts
src/lib/design-tokens.ts
src/proxy.ts
src/types/settings.ts
```

### Backend Convex (A-Z)

```
convex/accountStatus.ts
convex/admin.ts
convex/analytics.ts
convex/billing.ts
convex/categories.ts
convex/companies.ts
convex/companyAccess.ts
convex/companyAccessActions.ts
convex/companyTeam.ts
convex/customerIntelligence.ts
convex/dashboard.ts
convex/dashboardConfig.ts
convex/dashboardExport.ts
convex/expenses.ts
convex/inventoryOptimization.ts
convex/invoiceScheduler.ts
convex/ledger.ts
convex/lib/authHelper.ts ⭐
convex/lib/permissions.ts ⭐
convex/locations.ts
convex/logs.ts
convex/notifications.ts
convex/notificationPreferences.ts
convex/organizations.ts
convex/payments.ts
convex/products.ts
convex/productSuppliers.ts
convex/sales.ts
convex/schema.ts
convex/schema.additions.ts
convex/settings.ts
convex/stockTransfers.ts
convex/suppliers.ts
convex/tasks.ts
convex/teamManagement.ts
convex/tests.ts
convex/users.ts
convex/_generated/api.d.ts
```

---

## Related Documentation

- **RBAC Audit Report:** `rbac-audit-report.md` - Security analysis and findings
- **Project Context:** `PROJECT_CONTEXT.md` - System architecture overview
- **Architecture:** `Documentation/ENTERPRISE_ARCHITECTURE.md` - Enterprise design
- **Permissions:** `src/features/teams/permissionCatalog.ts` - Permission constants

---

**Last Updated:** May 7, 2026  
**Maintained By:** Development Team  
**Status:** Comprehensive Reference ✅
