# RBAC Audit Report — Invento
**Date:** June 18, 2026  
**Reviewer:** Static Code Analysis (GPT-4o)  
**Method:** Static code review only. No execution.

---

## Executive Summary

The Invento RBAC system has a **MEDIUM risk level** overall. While the core permission system (authHelper.ts, permissions.ts) is well-designed with proper owner/staff separation, there are several critical gaps:

1. **CRITICAL**: Product mutations (createProduct, updateProduct, deleteProduct) missing permission checks - any authenticated user can modify products
2. **CRITICAL**: No middleware.ts file found - route protection is unclear and may be client-side only (Completed ✅, middleware is updated to proxy, source nextjs documentation)
3. **HIGH**: Tenant isolation vulnerability in payments.ts - userId taken from args instead of ctx.auth
4. **HIGH**: Inconsistent auth patterns (tokenIdentifier vs subject) causing auth bypasses

---

## Critical Vulnerabilities (Severity: CRITICAL)

| # | Location | Issue | Impact | Fix |
|---|----------|-------|--------|-----|
| 1 | convex/products.ts:207-238 (createProduct) | Uses `ctx.auth.getUserIdentity()` directly instead of `resolveCallerContext()`. Staff members creating products get their OWN userId as userId, not the owner's. Products are created in staff's namespace, not visible to owner. | Staff cannot create products in owner's inventory; products created but invisible to team | Replace identity.subject with `getDataScopeUserId(caller)` after adding `resolveCallerContext` call |
| 2 | convex/products.ts:275-299 (updateProduct) | No permission check. Only verifies product.userId === userId from auth. No role/permission validation. | Any authenticated user can update any product they know the ID of | Add `requirePermission(caller, PERMISSIONS.EDIT_PRODUCT)` after resolveCallerContext |
| 3 | convex/products.ts:302-319 (deleteProduct) | No permission check. Only verifies product.userId === userId. Per matrix, delete should be owner/admin only. | Staff can delete products; violates role matrix | Add `requirePermission(caller, PERMISSIONS.DELETE_PRODUCT)` and restrict to owner/admin |
| 4 | convex/products.ts:447-480 (bulkRestockProducts) | No permission check. Only checks product ownership, not role. | Any team member can bulk restock products | Add `requirePermission(caller, PERMISSIONS.MANAGE_STOCK)` |
| 5 | No middleware.ts found | Cannot verify route protection. Without middleware, all route auth is client-side only. | Users can bypass UI gates via direct API calls | Create middleware.ts with proper route protection map |
| 6 | convex/expenses.ts:deleteExpense (line ~120) | Uses `tokenIdentifier` from Clerk instead of `subject`. This returns email in some Clerk configs, causing ID mismatch with other tables using subject. | Auth inconsistency breaks expense deletions, potential cross-user access | Replace tokenIdentifier with `identity.subject` consistently |

---

## High Severity Issues

| # | Location | Issue | Impact | Fix |
|---|----------|-------|--------|-----|
| 1 | convex/payments.ts:57-77 (getPayments query) | Takes userId as **arg from client**, not from ctx.auth. Any user can query any other user's payments by passing their userId. | **IDOR vulnerability** - cross-tenant data leak | Remove userId arg, use `getDataScopeUserId(caller)` from resolved context |
| 2 | convex/accountStatus.ts (entire file) | createAccountStatus has NO authentication check. Anyone can create account status for any userId. | Users can potentially manipulate their own account status | Add `ctx.auth.getUserIdentity()` check at start |
| 3 | convex/admin.ts:14-21 (checkAdminAccess) | Admin check uses single ADMIN_USER_ID env var. All admin functions check this one ID. No role hierarchy. | Single point of failure; can't have multiple admins | Implement proper super-admin role in customRoles or use env var list |
| 4 | convex/companies.ts:updateVerificationStatus | Any caller with MANAGE_ORGANIZATION can set isVerified=true for any user. | Non-admin can mark their company as verified to bypass compliance | Restrict to owner only, verify against super-admin list |
| 5 | convex/verification.ts:54-75 (verifyOtp) | Updates companyDetails.isVerified without verifying caller is owner or admin. Any authenticated user can verify themselves via OTP logic. | Self-verification bypass | Require caller.identity === args.userId or check owner |
| 6 | convex/billing.ts:77-98 (createInvoice) | Takes userId from args.invoiceData.userId, not from auth. Invoice creator can attribute to any user. | Invoice spoofing - attribute sales to other users | Use `getDataScopeUserId(caller)` instead of args.userId |
| 7 | convex/expenses.ts (multiple mutations) | Uses `(await ctx.auth.getUserIdentity())?.tokenIdentifier` - inconsistent with resolveCallerContext pattern used elsewhere | Auth works but bypasses RBAC helper | Refactor all to use resolveCallerContext + requirePermission |

---

## Medium Severity Issues

| # | Location | Issue | Impact | Fix |
|---|----------|-------|--------|-----|
| 1 | convex/companies.ts, companyDetails.ts, organizationSettings.ts | All three tables exist and actively written to. Schema comment says companies "replaces" others but all still used. | Data inconsistency; VAT verification can be bypassed by updating wrong table | Deprecate old tables, migrate to single source |
| 2 | convex/invoices.isAdmin field | Not enforced server-side. Client can set isAdmin=true to generate admin invoices. | Invoice impersonation | Remove from args or validate against caller.isOwner |
| 3 | convex/teamManagement.ts:getUserPermissions | Uses default permissions when role not found. Staff with invalid custom roles get default admin perms by default. | Privilege escalation via bad role names | Throw error instead of defaulting to admin |
| 4 | convex/companyTeam.ts:inviteCompanyMember | No check that caller is owner. Only checks authenticated. A staff member could invite more staff. | Team proliferation by non-owners | Add `if (!caller.isOwner) throw Error` |
| 5 | convex/teamManagement.ts:actorPermissions | When actorKey matches tenantId (owner check), always returns isOwner=true even if not the real owner. | Impersonation if userId collision | Verify ownerId against organizationMembers first |
| 6 | src/hooks/useUserRole.ts | Hook fetches from useQuery(api.companyAccess.getCallerContext). If Convex query fails or loads slowly, permissions array is empty. | Permission checks fail OPEN during load | Add loading guards; default to deny |
| 7 | convex/sales.ts:getRecentSales | No pagination on query. Could dump entire sales history. | DoS risk on large tenants | Add date limit + pagination |
| 8 | convex/companies.ts:resolveEffectiveUserId | Returns original userId if no company AND no team membership. Allows users without companies to have data orphaned. | Data becomes unreachable | Throw error or create default company |

---

## Low / Advisory

| # | Location | Issue | Impact | Fix |
|---|----------|-------|--------|-----|
| 1 | Permission strings defined as const object but some code uses string literals | Typos in string literals silently fail (no permission) or grant (wrong). Hard to audit usage. | Use constants throughout | Audit all string literals, add runtime validation |
| 2 | Role stored as string, case-sensitive comparison | If role = "Owner" vs "owner", permission resolution fails. | Silent permission denial | Normalize to lowercase or use enum |
| 3 | convex/products.ts:stockStatus | Uses v.union() correctly. But invoices.unit uses v.string() free-form. | Inconsistent; unit field accepts any string | Use v.union() for unit types |
| 4 | No isDeleted filter on invoices query | getAllInvoices doesn't filter isDeleted by default. | Potentially shows deleted invoices | Add `.filter(q => q.eq(q.field('isDeleted'), false))` |
| 5 | No soft-delete enforcement at schema level | isDeleted fields exist but aren't enforced. Developers must remember to filter. | Accidental data exposure | Add index with filter or modify query helper |
| 6 | src/app/(dev-tools)/database route | Database browser potentially accessible in production. No env check in route. | Data exfiltration in prod | Add `process.env.NODE_ENV === 'development'` gate |

---

## Unexpected Value Risks

| Field | Table | Current Type | Risk | Recommended Fix |
|-------|-------|-------------|------|----------------|
| status | accountStatus | v.string() | Accepts any value: "pending", "approved", "blocked", "Suspended", "APPROVED" | Use v.union(v.literal('pending'), v.literal('approved'), ...) |
| status | organizations | v.string() | Should be 'active', 'archived', 'deleted' - typos grant wrong access | Use v.union() |
| status | expenses | v.string() | "pending", "approved", "rejected" - case variations break logic | Use v.union(), normalize on read |
| status | approvalRequests | v.string() | "pending", "approved", "rejected", "cancelled" | Use v.union() |
| paymentStatus | sales, payments | v.string() | "paid", "unpaid", "partially_paid" - case sensitivity | Use v.union() |
| stockStatus | products | v.string() (also v.union in schema) | Inconsistency between schema and code | Enforce v.union in code |
| role | companyMembers | v.string() | Any string accepted. Should validate against customRoles | Add validation in schema or mutation |
| unit | invoices.items[].unit | v.string() | Free-form, breaks tax logic if unexpected values | Define enum: "pcs", "kg", "liter", etc. |
| organizations.status | organizations | v.string() | Same as accountStatus | v.union() |
| frequency | recurringInvoices, recurringExpenses | v.string() | "daily", "weekly", "monthly", etc - typo breaks automation | v.union() |
| type | companies | v.string() | Should be "company" or "firm" only | v.union() |

---

## Client-Side vs Server-Side Enforcement Gaps

| Feature | UI Gate | Server Check | Risk Level |
|---------|---------|--------------|------------|
| Delete Product | React component hides based on role | **NONE** - convex/products.ts:deleteProduct:304 only checks ownership | CRITICAL |
| Update Product | React component hides edit button | **NONE** - convex/products.ts:updateProduct only checks ownership | CRITICAL |
| Bulk Restock | React shows button for managers+ | **NONE** - no permission check in mutation | HIGH |
| Settings > Organization | UI check for manage_settings | Server has check in companies.ts mutations | LOW (server OK) |
| Settings > Users | UI check for manage_users | Server checks in companyAccess.ts | LOW (server OK) |
| Billing > Payments | Role matrix says viewer=✗ | Server has VIEW_REPORTS check in payments.ts:getPayments | MEDIUM (query exists but arg vulnerable) |
| Reports > Export | View matrix shows viewer can't export | No permission check in exportProducts query | HIGH |
| Delete Payment | UI check | No permission in convex/payments.ts:deletePayment - only checks ownership | HIGH |
| Approve Expense | UI for owner/admin | No permission check in approveExpense mutation | HIGH |
| /admin route | May require owner | Unknown - no middleware found | UNKNOWN |
| /database route | Developer only | Unknown - route access unclear | HIGH |

**Key Finding**: Most product mutations have NO permission checks beyond basic ownership verification. This is the biggest gap - the RBAC system defines permissions but they're not enforced in critical mutations.

---

## Tenant Isolation Findings

| Mutation/Query | userId Source | Risk |
|---------------|--------------|------|
| payments.getPayments | **Args (client-supplied)** | CRITICAL - can query any user's payments |
| billing.createInvoice | **Args (client-supplied)** | HIGH - can attribute invoice to wrong user |
| products.createProduct | identity.subject (not resolveCallerContext) | MEDIUM - creates in wrong namespace |
| products.updateProduct | identity.subject | MEDIUM - can modify own only, but no role check |
| expenses mutations | tokenIdentifier | MEDIUM - inconsistent with others |
| getPayments query | **Args** | Any user can query any other user's payments |

---

## Schema Design Issues Affecting Security

### 1. Triple Company Table Problem
- **Location**: companies, companyDetails, organizationSettings all exist
- **Risk**: A user can update verification status in one table but not others. Invoice generation may read from inconsistent table.
- **Fix**: Deprecate companyDetails and organizationSettings. Migrate to companies table only.

### 2. isVerified Field Not Enforced
- **Location**: companies.isVerified, companyDetails.isVerified
- **Risk**: Any user can call updateVerificationStatus (if they have MANAGE_ORGANIZATION). Should be super-admin only.
- **Fix**: Restrict mutation to super-admin env var list.

### 3. Soft Delete Inconsistency
- **Location**: Some queries filter isDeleted, some don't
- **Risk**: Deleted records may leak to queries
- **Fix**: Standardize on filtered queries or add default filter in lib helper

### 4. Role Field in companyMembers
- **Location**: companyMembers.role is v.string()
- **Risk**: Any string accepted. Can set role="owner" via mutation if IDOR.
- **Fix**: Validate against known roles in mutation before insert/patch.

---

## Compliance Notes

### Nepal VAT/PAN Handling
- **Positive**: taxNumber field exists with isVerified flag
- **Issue**: verification.ts allows self-verification via OTP flow
- **Risk**: Users can mark themselves as verified without admin approval
- **Fix**: Require approvedBy field set by admin only

### Audit Trail
- **Positive**: auditLog table exists and some mutations log actions
- **Gap**: Not all sensitive mutations log (e.g., deleteProduct, updateProduct missing logs)
- **Recommendation**: Add auto-logging in authHelper or middleware layer

### Data Residency
- **Status**: No explicit data residency controls found
- **Note**: All data stored in Convex (US by default). For Nepal compliance, may need region-specific deployment or user consent for cross-border.

---

## Positive Findings

| Area | Finding |
|------|---------|
| Permission Catalog | Well-defined const object in convex/lib/permissions.ts with type safety |
| authHelper | resolveCallerContext properly separates owner vs staff with correct ownerId derivation |
| Tenant Isolation | resolveCallerContext correctly returns ownerId (not callerId) for staff queries |
| Permission Matrix | Documented in task - provides clear role-permission mapping |
| Company Access | companyAccess.ts properly restricts invite/remove to owner only |
| Custom Roles | teamManagement.ts supports custom roles with perms array |
| Soft Delete | isDeleted field present in most tables |
| Schema Indexes | Proper indexes for userId + isDeleted for efficient queries |

---

## Recommended Fix Priority (Ordered)

1. **IMMEDIATE**: Add permission checks to product mutations (create, update, delete, bulkRestock)
   - Add `requirePermission(caller, PERMISSIONS.EDIT_PRODUCT)` etc.
   - Use `resolveCallerContext()` + `getDataScopeUserId()` instead of direct identity

2. **IMMEDIATE**: Fix IDOR in payments.getPayments - remove userId arg, use resolved context

3. **HIGH**: Create middleware.ts with route protection map (Completed ✅, middleware is updated to proxy, source nextjs documentation)

4. **HIGH**: Add auth to accountStatus.createAccountStatus

5. **HIGH**: Standardize on identity.subject everywhere (not tokenIdentifier)

6. **MEDIUM**: Restrict verification status updates to super-admin only

7. **MEDIUM**: Remove or validate invoices.isAdmin field

8. **MEDIUM**: Add isDeleted filter to all queries (create helper function)

9. **LOW**: Audit all string literals, ensure constants used everywhere

10. **LOW**: Replace v.string() with v.union() for status fields

---

## Files Required for Complete Audit (Not Provided)

- src/app/layout.tsx and nested layouts (for route groups)
- Any middleware.ts or _middleware.ts in src or root
- src/app/(main)/(authenticated)/settings/billing/page.tsx (billing access control)
- src/app/(main)/(authenticated)/dashboard/page.tsx (dashboard protection)
- src/app/(main)/(authenticated)/admin/page.tsx (if exists)
- src/app/api/* route files (API security)

---

*End of Report*
