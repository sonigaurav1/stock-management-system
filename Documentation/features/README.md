# Invento - Features Documentation Directory

Welcome to the **Features Documentation Directory** for Invento. This directory contains detailed technical documentation, schema references, UI workflows, and business rules for each core module in the system.

---

## 📚 Feature Directory Index

| Feature / Module | Document Link | Description & Key Responsibilities |
| :--- | :--- | :--- |
| **Authentication & Tenancy** | [AUTH.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/AUTH.md) | User identity authentication (Clerk), JWT session tokens, and strict `userId` database data isolation. |
| **Products & Inventory** | [PRODUCTS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PRODUCTS.md) | Product catalog, SKUs, barcodes, categories, subcategories, stock levels, and auto-reorder alerts. |
| **Supplier & Sourcing** | [SUPPLIERS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SUPPLIERS.md) | Supplier directory, multi-supplier mapping per product (`productSuppliers`), lead times, and vendor metrics. |
| **Sales & Transactions** | [SALES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SALES.md) | Sales order creation, customer transactions, stock movement history logging (`stockMovements`), and revenue tracking. |
| **Tax Invoicing & Billing** | [BILLING.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/BILLING.md) | GST tax invoice generation (`jsPDF`), downloadable PDF invoices, recurring customer billing schedules, and balance tracking. |
| **Financial Ledger** | [LEDGER.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/LEDGER.md) | Double-entry financial audit trail tracking supplier payables, customer receivables, and cash flow balance sheets. |
| **Expenses & Receipts** | [EXPENSES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/EXPENSES.md) | Expense categorization, receipt uploads via EdgeStore, recurring expense tracking, and category budget approvals. |
| **Procurement & POs** | [PROCUREMENT.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PROCUREMENT.md) | Purchase order (PO) generation, restock workflows, vendor receiving, and inventory adjustment entries. |
| **Inventory Audit & Count** | [INVENTORY_AUDIT.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/INVENTORY_AUDIT.md) | Physical stock count audits, stock discrepancy logging, and inventory reconciliation tools. |
| **Admin & Access Control** | [ADMIN_RBAC.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/ADMIN_RBAC.md) | System administration, role hierarchy (`admin`, `inventory_manager`, `billing_staff`, `accountant`), RBAC permissions, and system audit logs. |

---

## 🔗 Related Resources
- **Master Documentation Index**: [Documentation/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/README.md)
- **App Routes & Page Index**: [Documentation/pages/APP_ROUTES.md](file:///Users/gaurav/Desktop/Invento/Documentation/pages/APP_ROUTES.md)
- **Database Schema**: [Documentation/reference/DATABASE_SCHEMA.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/DATABASE_SCHEMA.md)
