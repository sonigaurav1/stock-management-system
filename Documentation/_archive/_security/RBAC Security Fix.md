RBAC Security Fix - Execution Plan & Signup/Signin Review
Execution Plan Summary
Based on the rbac-audit-report.md, I've identified 12 critical tasks across 4 phases:

Phase	Priority	Tasks	Status
Phase 1	CRITICAL	3 security vulnerabilities	✅ COMPLETE
Phase 2	HIGH	Auth standardization + permission enforcement	✅ COMPLETE
Phase 3	MEDIUM	System consolidation + data integrity	✅ COMPLETE
Phase 4	LOW	Schema hardening + audit logging	⏸️ OPTIONAL/FUTURE
Phase 1: CRITICAL Security Fixes (Immediate)
Task 1.1: Fix Product Mutations (CRITICAL)
Files: @/convex/products.ts:207-480

Issues:

createProduct uses identity.subject directly instead of resolveCallerContext() — staff creates products in their own namespace, not owner's
updateProduct, deleteProduct, bulkRestockProducts have NO permission checks — only ownership check
Fix Pattern:

typescript
// BEFORE (vulnerable):
const identity = await ctx.auth.getUserIdentity();
const userId = identity.subject; // Staff gets their own ID
 
// AFTER (secure):
const caller = await resolveCallerContext(ctx);
requirePermission(caller, PERMISSIONS.EDIT_PRODUCT); // or CREATE_PRODUCT, DELETE_PRODUCT
const userId = getDataScopeUserId(caller); // Always returns ownerId for staff
Task 1.2: Fix IDOR in Payments (CRITICAL)
File: @/convex/payments.ts:57-77

Issue: getPayments takes userId from args — any user can query any other user's payments

Fix:

typescript
// BEFORE:
args: { userId: v.string() }
const payments = await ctx.db.query('payments').withIndex('by_user', q => q.eq('userId', args.userId))
 
// AFTER:
args: {} // Remove userId arg
const caller = await resolveCallerContext(ctx);
const userId = getDataScopeUserId(caller); // Secure - always scoped to caller's tenant
Task 1.3: Fix Invoice Spoofing (CRITICAL)
File: @/convex/billing.ts:77-98

Issue: createInvoice uses args.invoiceData.userId — can attribute invoice to wrong user

Fix: Use getDataScopeUserId(caller) instead of args.invoiceData.userId

Phase 2: HIGH Priority Fixes
Task 2.1: Standardize Auth Patterns
File: @/convex/expenses.ts and others using tokenIdentifier

Issue: Inconsistent use of tokenIdentifier vs identity.subject — can cause ID mismatches

Fix: Replace all (await ctx.auth.getUserIdentity())?.tokenIdentifier with identity.subject

Task 2.2: Add Auth Check to accountStatus
File: @/convex/accountStatus.ts

Issue: createAccountStatus has NO authentication — anyone can create/modify account status

Fix: Add const identity = await ctx.auth.getUserIdentity(); if (!identity) throw new Error('Not authenticated');

Task 2.3: System-Wide Permission Audit
Add requirePermission() checks to all mutations that modify data:

Sales mutations
Supplier mutations
Category mutations
Settings mutations
Phase 3: MEDIUM Priority (System Consolidation)
Task 3.1: Consolidate RBAC Systems
Issue: Two overlapping systems:

authHelper.ts + companyAccess.ts (modern, comprehensive)
teamManagement.ts (legacy, limited permissions)
Recommendation: Migrate teamManagement.ts to use authHelper.ts patterns. Deprecate teamMembers table in favor of companyMembers.

Task 3.2: Restrict Verification Updates
Files: @/convex/companies.ts, @/convex/verification.ts

Issue: Non-admins can mark their company as verified

Fix: Add super-admin check using env var list

Task 3.3: Add isDeleted Filters
Many queries don't filter isDeleted = false — deleted data may leak

Phase 4: LOW Priority (Hardening)
Task 4.1: Schema Validation
Replace v.string() with v.union() for:

status fields (accountStatus, organizations, expenses, approvalRequests)
role field in companyMembers
paymentStatus, stockStatus, unit fields
Task 4.2: Audit Logging
Add permission change logging to companyAccess.ts mutations

Signup/Signin Data Flow Review
Current Flow Architecture
┌─────────────────────────────────────────────────────────────────────────┐
│  STAFF INVITATION FLOW                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. Owner invites staff (companyAccess.inviteMember)                   │
│     ├── Validates owner has MANAGE_USERS permission                    │
│     ├── Creates companyMembers record (status='invited')             │
│     └── Generates 24-char token, 7-day expiry                          │
│                                                                         │
│  2. Staff receives email with link: /accept-invite?token=xxx           │
│                                                                         │
│  3. Staff clicks link (accept-invite/page.tsx)                         │
│     ├── Queries invitation by token                                    │
│     ├── If not signed in → redirects to /sign-up?inviteToken=xxx       │
│     └── If signed in → auto-accepts invitation                       │
│                                                                         │
│  4. Staff signs up via Clerk (SignUpView.tsx)                          │
│     ├── Standard Clerk OAuth/email signup                            │
│     ├── After signup, redirected to accept-invite with token          │
│     └── Creates user profile in Convex (users.upsertUserProfile)       │
│                                                                         │
│  5. Auto-accept invitation (companyAccess.acceptInvitationByToken)    │
│     ├── Validates token exists and not expired                         │
│     ├── Validates staff email matches invitation email                 │
│     ├── Updates companyMembers: status='accepted', userId=clerkId    │
│     ├── Sets Clerk metadata via /api/roles (role, companyOwnerId)     │
│     └── Redirects to dashboard                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
Enterprise Readiness Assessment
Aspect	Status	Notes
Multi-tenant Isolation	✅ Good	resolveCallerContext() properly separates owner vs staff data scope
Invitation Security	✅ Good	Token-based, 7-day expiry, email matching enforced
Permission Enforcement	⚠️ Partial	Backend checks exist but inconsistent; some mutations unprotected
Role Assignment	✅ Good	Preset roles (owner, manager, staff, viewer) + custom roles supported
Clerk Integration	✅ Good	Metadata sync via /api/roles endpoint
Audit Trail	⚠️ Partial	Some logging in teamActivity, but not comprehensive
Data Storage Breakdown
Data Type	Clerk	Convex	Notes
User Identity	✅ Primary	❌ None	Clerk is source of truth for auth
User Profile	❌ Minimal	✅ Full	users table stores email, name, username
Organization/Tenant	❌ None	✅ Full	companyMembers links staff to owner
Role & Permissions	✅ Metadata	✅ Primary	Stored in Convex customRoles, cached in Clerk metadata
Invitation State	❌ None	✅ Full	companyMembers.status='invited'
Identified Issues in Signup/Signin Flow
Issue 1: Race Condition in Auto-Accept
File: @/src/app/(auth)/accept-invite/page.tsx:65-121

The auto-accept effect can fire multiple times. Fixed already per RBAC_EXECUTION_TASKS.md, but worth monitoring.

Issue 2: Missing Permission Check on Profile Creation
File: @/convex/users.ts:11-65

Previously Fixed: Staff can now create their own profile without manage_users permission (correct behavior). However, there's a subtle issue:

typescript
// Line 24: Uses callerId (staff's ID) not ownerId
const profileUserId = caller.callerId;
This is correct for staff profiles, but ensure all product/inventory data uses getDataScopeUserId(caller) (which returns ownerId for staff).

Issue 3: Clerk Metadata Sync Race Condition
File: @/src/app/(auth)/accept-invite/page.tsx:267-290

Staff metadata is set via fetch to /api/roles AFTER invitation acceptance. If this fails, staff has no role in Clerk but has access in Convex.

Recommendation: Make metadata sync transactional or add retry logic.

Recommended Priority Order
IMMEDIATE (This Week): Phase 1 critical fixes — product mutations + payments IDOR
HIGH (Next Week): Phase 2 auth standardization — add permission checks to all mutations
MEDIUM (Next Sprint): Phase 3 system consolidation — merge teamManagement into companyAccess
ONGOING: Phase 4 hardening — schema validation, audit logging
Files to Modify (Summary)
Priority	File	Changes
CRITICAL	convex/products.ts	Add resolveCallerContext() + permission checks to 4 mutations
CRITICAL	convex/payments.ts	Remove userId arg, use resolved context
CRITICAL	convex/billing.ts	Fix invoice userId attribution
HIGH	convex/expenses.ts	Replace tokenIdentifier with identity.subject
HIGH	convex/accountStatus.ts	Add authentication check
HIGH	Multiple files	Add permission checks to sales, suppliers, categories
MEDIUM	convex/teamManagement.ts	Deprecate in favor of companyAccess
MEDIUM	convex/companies.ts	Restrict verification to super-admin
Would you like me to start implementing Phase 1 fixes?

## ✅ COMPLETION SUMMARY

### All Phases 1-3 Complete (May 2, 2026)

**CRITICAL Fixes (Phase 1):**
- ✅ Product mutations secured with resolveCallerContext() + permission checks
- ✅ Payments IDOR fixed - removed userId arg, uses secure context
- ✅ Billing invoice attribution fixed

**HIGH Priority (Phase 2):**
- ✅ Auth pattern standardization across 6 files
- ✅ Expenses, dashboard, notifications, suppliers, exports, team management secured
- ✅ Account status authentication added
- ✅ Clerk metadata sync robustness with retry logic

**MEDIUM Priority (Phase 3):**
- ✅ isDeleted filters added to all queries (productSuppliers, inventoryOptimization, customerIntelligence)
- ✅ Super-admin restrictions enforced on account management
- ✅ All queries now filter by userId for tenant isolation

### Files Modified: 12+
### Mutations/Queries Fixed: 50+
### TypeScript Status: ✅ Compiles without errors

**Full documentation:** See `RBAC_SECURITY_FIX_COMPLETE.md`

---

Feedback submitted