# App Routes & Page Index Map

> **Framework**: Next.js 16 (App Router)  
> **Total Routes**: 75 static and dynamic pages/endpoints

---

## 1. Authentication & Onboarding Routes

- `/sign-in/[[...sign-in]]` - Clerk user sign-in page.
- `/sign-up/[[...sign-up]]` - Clerk user sign-up page.
- `/accept-invite` - User team invitation acceptance page.
- `/access-denied` - RBAC access denial fallback view.
- `/onboarding/setup` - Initial user profile & business onboarding setup.
- `/verify-email` - Email address verification route.

---

## 2. Inventory & Product Management Routes

- `/dashboard/overview` - High-level metrics and inventory overview dashboard.
- `/dashboard/product` - Primary product catalog table view.
- `/dashboard/product/[productId]` - Dynamic product editor.
- `/dashboard/product/view/[productId]` - Read-only product viewer.
- `/dashboard/product/category` - Category management page.
- `/dashboard/product/category/[categoryId]` - Category details and associated products.
- `/dashboard/product/supplier` - Supplier directory page.
- `/dashboard/product/supplier/[supplierId]` - Supplier details and supplied products list.

---

## 3. Sales, Billing & Invoicing Routes

- `/billing` - Tax invoicing list & sales order dashboard.
- `/billing/[invoiceType]/[invoiceNumber]` - Dynamic PDF tax invoice details & printable viewer.
- `/billing/creditors/payments` - Accounts receivable payment tracking.
- `/invoice` - Customer invoice view.
- `/invoice-generation` - Quick tax invoice creation page.
- `/restock` - Quick stock restock and replenishment view.

---

## 4. Ledger & Financial Management Routes

- `/ledger` - Double-entry financial audit trail and balance table.
- `/expenses` - Business expense logging, receipt viewer, and budget status.
- `/reports/financial` - Income statement and financial analytics charts.
- `/reports/sales` - Sales revenue analytics.
- `/reports/stock` - Inventory valuation analytics.

---

## 5. Procurement & Stock Audit Routes

- `/procurement` - Purchase order (PO) generation & supplier tracking.
- `/inventory-audit` - Physical stock count audit tool.
- `/inventory-forecast` - Stock demand forecasting & low stock alerts.

---

## 6. Administration & Settings Routes

- `/admin` - System administration dashboard.
- `/company-admin` - Business configuration and team RBAC role management.
- `/organization` - Workspace settings.
- `/settings` - User settings layout wrapper.
- `/settings/account` - User account details.
- `/settings/api` - Developer API keys.
- `/settings/appearance` - Dark/Light mode visual theme configuration.
- `/settings/notifications` - Email notification preferences.
- `/settings/organization` - Business identity setup.
- `/settings/security` - Security & password management.
- `/settings/users` - Team member directory & role assignments.

---

## 7. Next.js Backend API Routes

- `/api/analytics` - System metrics API.
- `/api/generate-pdf` - PDF invoice document generator.
- `/api/ledger-pdf` - PDF financial ledger report generator.
- `/api/edgestore/[...edgestore]` - EdgeStore file asset uploader.
- `/api/roles` - User role queries.
- `/api/webhooks` - Transaction webhook endpoints.

---

## 8. Related Links
- **Page Context & Dependencies**: [PAGE_CONTEXT.md](file:///Users/gaurav/Desktop/Invento/Documentation/pages/PAGE_CONTEXT.md)
- **Features Index**: [Documentation/features/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/README.md)
