# Invento - Project Requirement Document (PRD)

> **Document Type**: System Specification & Requirements Document  
> **Target Audience**: AI Development Agents, Software Engineers, System Architects  
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

## 1. Executive Summary & Core Objective

**Invento** is an enterprise-grade inventory control, supplier management, sales transaction tracking, financial ledger, GST tax invoicing, expense tracking, and procurement management application.

### Primary Purpose for AI Agents
When reading this document, AI agents must understand that **Invento** is built around real-time reactivity (via Convex), strict user-level data isolation (via Clerk user identity and `userId` database indexing), and Role-Based Access Control (RBAC). All newly added features, schema changes, or API endpoints must adhere to these foundational constraints.

---

## 2. Targeted Users & Persona Roles

The application supports hierarchical access controls. The `super-admin` role is replaced by `admin`:

| Persona / Role | Primary Responsibilities & Access Scope | Feature Guide |
| :--- | :--- | :--- |
| **Admin** | Full system and business administration, business configuration (GST/HSN), team member management, RBAC permission setup, system logs, and overall data governance (`/admin`, `/company-admin`, `/settings`). | [ADMIN_RBAC.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/ADMIN_RBAC.md) |
| **Inventory / Warehouse Manager** | Product creation/edits, SKU & barcode management, stock audits, reorder level adjustments, supplier sourcing, and stock movement logs (`/dashboard/product`, `/inventory-audit`, `/restock`). | [PRODUCTS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PRODUCTS.md) |
| **Sales & Billing Staff** | Creating sales orders, generating tax invoices, tracking customer payments, and issuing credit notes (`/billing`, `/invoice-generation`, `/ledger`). | [SALES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SALES.md) |
| **Finance / Accountant** | Ledger reconciliation, expense entry, budget approvals, financial reporting, and tax audits (`/ledger`, `/expenses`, `/reports/financial`). | [LEDGER.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/LEDGER.md) |

---

## 3. Architecture & Tech Stack Specifications

- **Frontend Framework**: Next.js 16 (App Router with Turbopack), React 19, TypeScript
- **Styling & UI**: Tailwind CSS, Radix UI primitives, Shadcn UI component design, Lucide icons (See [Design.md](file:///Users/gaurav/Desktop/Invento/Design.md))
- **State Management**: React State, Zustand, Convex real-time hooks (`useQuery`, `useMutation`)
- **Backend & Database**: Convex (Real-time reactivity, schema validation via Convex `v`, server functions)
- **Authentication**: Clerk (User identity and account metadata; **Note**: Clerk Organizations are NOT used—data isolation is enforced by `userId`. See [AUTH.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/AUTH.md))
- **File Storage**: EdgeStore (Product images, invoice attachments, receipt uploads)
- **Notifications & Communication**: SendGrid (Email notifications; **Note**: Twilio SMS and Slack webhooks are removed)
- **Export & Utilities**: jsPDF / jsPDF-AutoTable (PDF Generation), Bikram Sambat JS (BS calendar integration), Recharts (Analytics visualizations)

---

## 4. Core Modules & Functional Requirements

### 4.1 Product & Stock Management (`PRODUCTS`)
- See technical details in **[PRODUCTS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PRODUCTS.md)**.
- **Product Metadata**: Name, SKU (unique), Slug, Barcode, Serial Number, HSN/SAC code (for tax compliance), Brand, Category, Subcategory, Description, Image URL.
- **Pricing**: Purchase price (cost), Selling price, Discount price.
- **Stock Tracking**: Real-time stock level, `inStock` flag, reorder level threshold, stock status (`in_stock`, `low_stock`, `out_of_stock`).
- **Auto-Reorder**: Configurable auto-reorder trigger when stock falls below specified reorder thresholds.
- **Stock Movements**: Record every purchase, sale, damage, adjustment, or return with timestamp and user ID.

### 4.2 Supplier & Vendor Management (`SUPPLIERS`)
- See technical details in **[SUPPLIERS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SUPPLIERS.md)**.
- **Supplier Profile**: Name, contact details (phone, email, address), image.
- **Multi-Supplier Mapping**: Map multiple suppliers to a single product (`productSuppliers`) with vendor-specific cost prices, vendor SKUs, minimum order quantities (MOQ), lead times (days), and preferred vendor flags.
- **Performance Metrics**: Automated tracking of total orders placed, on-time delivery rate, late deliveries, and average lead times.

### 4.3 Sales, Invoicing & Customers (`SALES` & `BILLING`)
- See technical details in **[SALES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SALES.md)** and **[BILLING.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/BILLING.md)**.
- **Sales Transactions**: Track line items, total amount, payment status (paid, pending, partial), discount applied, and tax breakdown.
- **Tax Invoice Generation**: Generate print-ready/downloadable PDF tax invoices compliant with business tax rules.
- **Recurring Invoices**: Schedule recurring customer invoices (weekly, monthly, annually).
- **Customer Profiles**: Customer directory linked with customer balance, contact details, and transaction history.

### 4.4 Financial Ledger & Expense Management (`LEDGER` & `EXPENSES`)
- See technical details in **[LEDGER.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/LEDGER.md)** and **[EXPENSES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/EXPENSES.md)**.
- **Ledger System**: Double-entry financial audit trail tracking supplier payables, customer receivables, and cash flow balance.
- **Expense Tracking**: Expense categorization, receipt uploads via EdgeStore, recurring expense creation.
- **Budget Approvals**: Budget setting per category and multi-tier approval workflow for business expenses.

### 4.5 Procurement & Stock Reconciliation (`PROCUREMENT`)
- See technical details in **[PROCUREMENT.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PROCUREMENT.md)** and **[INVENTORY_AUDIT.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/INVENTORY_AUDIT.md)**.
- **Purchase Orders (POs)**: Generate and issue purchase orders to suppliers, track fulfillment status.
- **Stock Audits & Reconciliations**: Tools to match physical stock counts against database records and create reconciliation entries.
- **Bulk Operations**: Bulk product import, CSV processing, price change request workflows.

### 4.6 User Access & System Admin (`RBAC` & `ADMIN`)
- See technical details in **[ADMIN_RBAC.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/ADMIN_RBAC.md)**.
- **Role-Based Access**: Pre-defined roles (Admin, Manager, Staff, Accountant) + custom permission overrides. No `super-admin` role exists.
- **Data Isolation**: Every database record is scoped by `userId`. Convex queries must ALWAYS index and filter by `userId` (no global un-scoped database scans).
- **System Audit Logs**: Capture administrative actions, role modifications, schema updates, and security logs.

---

## 5. Non-Functional Requirements (NFRs) & Constraints

1. **Strict User-Level Data Isolation**: Zero cross-user data leakage. No Convex query or mutation may omit user filtering (`q.eq("userId", userId)`).
2. **Real-time Reactivity**: UI updates automatically via Convex subscriptions without requiring hard page refreshes.
3. **Data Integrity & Soft Deletion**: Entities (products, categories, suppliers) use soft delete (`isDeleted: boolean`) to preserve historical transaction integrity.
4. **Sub-Second PDF Generation**: PDF invoice & ledger generation must complete dynamically on the server or client without browser freezing.
5. **Code Style & Conventions**:
   - PascalCase for React components (`ProductForm.tsx`).
   - camelCase for utility functions and Convex fields (`sellingPrice`).
   - Strong TypeScript typing (`any` is strictly prohibited).
   - Error handling via UI toasts (`toast.error`, `toast.success`) paired with full console logs.

---

## 6. AI Agent Guidelines for Codebase Modifications

When AI agents work on this repository:
1. **Always Check Documentation First**: Consult [Documentation/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/README.md) and [AI_INSTRUCTIONS.md](file:///Users/gaurav/Desktop/Invento/AI_INSTRUCTIONS.md) before making structural code changes.
2. **Preserve API Contracts**: Update all caller sites when function signatures are modified.
3. **Verify Build & Types**: Run build checks (`pnpm run build` or `pnpm run lint`) to confirm zero compilation errors.
4. **Never Guess Schema**: Refer directly to `convex/schema.ts` for database fields and index definitions.
