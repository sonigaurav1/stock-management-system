# Invento - Project Memory & Feature Status

> **Document Type**: Project Memory & Feature Lifecycle Log  
> **Target Audience**: AI Development Agents, Software Engineers, Product Managers  
> **Project Name**: Invento (Inventory & Business Management System)  
> **Repository**: `sonigaurav1/stock-management-system`  

---

## 🧭 Documentation Sitemap Links
- **Master Documentation Index**: [Documentation/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/README.md)
- **Features Technical Guides**: [Documentation/features/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/README.md)
- **App Routes Index**: [Documentation/pages/APP_ROUTES.md](file:///Users/gaurav/Desktop/Invento/Documentation/pages/APP_ROUTES.md)
- **System Architecture**: [Architecture.md](file:///Users/gaurav/Desktop/Invento/Architecture.md)
- **AI Rules & Guardrails**: [Rules.md](file:///Users/gaurav/Desktop/Invento/Rules.md)

---

## 1. What Features Have Been Completed

### 1.1 Core Authentication & Access Control
- ✅ **Clerk Identity Authentication**: User sign-in, sign-up, session handling, and Convex JWT integration (`ctx.auth.getUserIdentity()`). See [AUTH.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/AUTH.md).
- ✅ **User-Scoped Data Isolation**: Complete backend data scoping per `userId` across all Convex queries and mutations.
- ✅ **Role-Based Access Control (RBAC)**: Role assignment (`admin`, `inventory_manager`, `billing_staff`, `accountant`) with route and mutation permission checks. See [ADMIN_RBAC.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/ADMIN_RBAC.md).

### 1.2 Product & Inventory Catalog Management
- ✅ **Product Management**: Full CRUD support for products including SKUs, barcodes, HSN/SAC codes, serial numbers, brand, categories, and subcategories. See [PRODUCTS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PRODUCTS.md).
- ✅ **Stock Level & Status Tracking**: Live calculation of stock levels (`inStock`, `stockStatus`: `in_stock` | `low_stock` | `out_of_stock`).
- ✅ **Auto-Reorder Alerts**: Threshold-based reorder alerts when stock falls below safety levels.
- ✅ **Stock Movement History**: Comprehensive movement logging for purchases, sales, damage, and adjustments (`stockMovements` table).

### 1.3 Supplier & Vendor Management
- ✅ **Supplier Directory**: Vendor profile management (contact details, addresses, phone, email). See [SUPPLIERS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SUPPLIERS.md).
- ✅ **Multi-Supplier Product Mapping**: `productSuppliers` table mapping multiple vendors per product with vendor SKUs, lead times (days), minimum order quantities (MOQ), and cost prices.
- ✅ **Supplier Performance Metrics**: Automated lead time tracking, on-time delivery percentages, and purchase history logs.

### 1.4 Sales, Customers & Tax Invoicing
- ✅ **Sales Order Processing**: Recording sales transactions, decrementing product inventory in real-time, and updating customer ledgers. See [SALES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SALES.md).
- ✅ **GST Tax Invoice Generation**: Server/client rendering of PDF tax invoices using `jsPDF` and `jsPDF-AutoTable`. See [BILLING.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/BILLING.md).
- ✅ **Recurring Invoices**: Scheduled customer invoice generation (`recurringInvoices` table).
- ✅ **Customer Directory**: Customer profiles, contact details, balance history, and purchase records.

### 1.5 Financial Ledger & Expense Tracking
- ✅ **Double-Entry Financial Ledger**: Automated audit trail tracking customer receivables, supplier payables, and cash flow entries. See [LEDGER.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/LEDGER.md).
- ✅ **Expense Management**: Categorized business expense tracking with receipt asset uploads via EdgeStore. See [EXPENSES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/EXPENSES.md).
- ✅ **Budget Approvals**: Expense category budgets and approval status tracking.

### 1.6 Governance & Documentation Infrastructure
- ✅ **Single Source Documentation**: Created `Project Requirement Document.md`, `Architecture.md`, `Rules.md`, `Design.md`, `Memory.md`, `AI_INSTRUCTIONS.md`, and complete `/Documentation/` directory suite.

---

## 2. What Features Are Incompleted / Pending Roadmap

### 2.1 Advanced Inventory Analytics & Forecasting
- ⏳ **AI Demand Forecasting**: Predictive stock forecasting based on historical sales velocity and seasonal trends (`inventory-forecast`).
- ⏳ **Inventory Reconciliation Tooling**: Enhanced physical stock audit comparison screens. See [INVENTORY_AUDIT.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/INVENTORY_AUDIT.md).

### 2.2 Bulk Operations & Hardware Integration
- ⏳ **Bulk Product & Supplier Import/Export**: CSV/Excel bulk upload validation pipelines for products, stock adjustments, and supplier records.
- ⏳ **Mobile Barcode & QR Code Scanning**: Camera-based barcode scanner integration for warehouse mobile browsers.

### 2.3 Procurement Automation
- ⏳ **Multi-Level PO Approval Workflow**: Multi-tier sign-off for purchase orders exceeding configured financial thresholds before issuing to suppliers. See [PROCUREMENT.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PROCUREMENT.md).

---

## 3. Key Architectural Decisions & Retained Decisions

| Decision / Shift | Context & Impact | Document Reference |
| :--- | :--- | :--- |
| **`super-admin` Removed** | The `super-admin` role was replaced by `admin`. `admin` is the top-level administrative role across the system. | [ADMIN_RBAC.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/ADMIN_RBAC.md) |
| **Clerk Organizations Removed** | Multi-tenancy relies directly on `userId` indexing in Convex database schema. Clerk Organizations are NOT used. | [AUTH.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/AUTH.md) |
| **Payments & Subscriptions Removed** | Razorpay payment integration, subscription tiers, and billing status logic were removed from system scope. | [BILLING.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/BILLING.md) |
| **Integrations Streamlined** | Twilio SMS and Slack webhooks were removed. Email via **SendGrid** is the sole active external communication provider. | [Architecture.md](file:///Users/gaurav/Desktop/Invento/Architecture.md) |
| **Soft Deletion Enforced** | All primary domain entities enforce soft deletion (`isDeleted: true`) to preserve transactional, financial, and tax audit records. | [Rules.md](file:///Users/gaurav/Desktop/Invento/Rules.md) |

---

## 4. Recent Bug Resolutions & Session History

### Authentication, Routing, and RBAC Fixes
- ✅ **Company Registration Crash Fix (`src/app/(auth)/company-registration/page.tsx`)**
  - **Why**: Non-invited new users navigating to the page experienced a silent crash and infinite loader because the component didn't return a JSX fallback when invitation data was missing.
  - **How**: Added a terminal `return <NormalCompanyRegistration user={user} isLoaded={isLoaded} />;` for standard users without invites.
- ✅ **Convex Auth Race Condition on Sign-Up (`src/features/auth/components/SignUpForm.tsx`)**
  - **Why**: When users completed the sign-up form, Clerk would set the session, but Convex mutations were fired instantly. Convex's context (`identity`) was still `null`, throwing `"Not authenticated"` and silently failing company creation. This forced the system's global guards to mistakenly route users to the `company-registration` fallback.
  - **How**: Implemented a retry loop mechanism around `createAccountStatus`. It waits up to 15 seconds (1-second intervals) for `ctx.auth.getUserIdentity()` to become valid before proceeding. Users are now properly routed to `/dashboard/overview`.
- ✅ **Billing Access Guard Infinite Loader & Hooks Fix (`src/app/(main)/(authenticated)/billing/BillingAccessGuard.tsx`)**
  - **Why**: Navigating to `/billing` caused an infinite loader. The file was running a deprecated query `api.organizations.getUserOrganizations` which returned `[]` (since Phase 2A refactored this to the `companies` table). The code evaluated `userOrg[0]` as `undefined` and returned `'loading'` infinitely. It also contained a React Rules of Hooks violation by calling `useQuery` after conditional early returns.
  - **How**: Completely removed the deprecated queries and refactored the component to utilize the centralized `usePermission()` context hook (from `PermissionProvider`). It now cleanly checks if the user `isOwner` or has `create_transaction` / `manage_settings` permissions without duplicating network calls or violating React rules.
- **Fixed `/company-registration` Bug for Invited Users**: Identified that the invited user was stuck on the `/company-registration` page because `upsertUserSettings` in `convex/settings.ts` incorrectly required the `MANAGE_ORGANIZATION` permission. When the staff member submitted the sign-up form, the permission error crashed the onboarding process, skipping the automatic `router.push('/dashboard/overview')`. 
- **Fixed `BusinessProfileGuard` logic**: Exempted staff members from being forced to complete the owner's business profile by ensuring `isBusinessProfileComplete` automatically returns `true` for users where `caller.isOwner` is false. Staff now safely inherit their owner's profile settings without being blocked by guard checks.

- **Fixed Unhandled Promise Rejections on Forms**: Resolved an issue in `ProductForm`, `CategoryForm`, and `SupplierForm` where Convex mutation errors (like permission denied for staff members) were causing unhandled promise rejections and full page error screens. Refactored `await promise.then(...)` to a `try/catch` block and passed `err.message` to `toast.promise` so errors are now displayed cleanly as UI toasts.

- **Improved Permission Error UI**: Updated `convex/lib/authHelper.ts` to throw structured `ConvexError` objects with `type: 'PermissionError'` when a user lacks access. Refactored the `ProductForm`, `CategoryForm`, and `SupplierForm` components to catch this specific error type and display a friendly yellow `toast.warning()` instead of a red, generic application error.

- **Role-Based Navigation in Premium Sidebar**: Added dynamic filtering to `PremiumSidebar.tsx` so that navigation items in the sidebar are automatically hidden if the logged-in user lacks the required permissions. Staff members will no longer see "Settings" or "Finance" links, providing a clean, role-tailored interface and reducing clutter.

- **Role-Based Tabs in Dashboard**: Refactored `TabbedDashboard.tsx` to dynamically filter internal tabs (`Financial`, `Operations`, etc.) based on the user's `permissions`. If a user (e.g. staff) enters a restricted tab's URL (like `?tab=financial`), the component automatically redirects them to their first available authorized tab.

- **Role-Based KPI Cards**: Updated `SummaryTab.tsx` so the "Total Revenue" glass card only renders if the user possesses the `view_ledger` permission. Adjusted the Tailwind CSS grid layout dynamically (`lg:grid-cols-3` vs `lg:grid-cols-4`) to ensure the dashboard remains perfectly symmetrical even when financial KPIs are hidden from staff members.

- **Universal Route Guard**: Implemented `RouteGuard.tsx` in the authenticated layout to act as a global page-level RBAC protector. Now, even if a user manually types a URL (like `http://localhost:3000/billing`), they will be denied access if they don't possess the required permission mapping (`manage_settings`, `view_ledger`, etc). This strictly enforces URL access regardless of whether sidebar links are hidden.

- **Custom Roles System**: Implemented dynamic custom RBAC roles.
  - Created `CustomRolesManager.tsx` and `CustomRoleDialog.tsx` under `Settings > Team Members`.
  - Allowed defining completely custom roles with specific granular permissions.
  - Updated `companyMembers` schema to accept arbitrary strings for roles instead of just presets.
  - Integrated custom roles directly into the dropdowns in `InviteMemberDialog.tsx`.
