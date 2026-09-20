# Invento Modules & Responsibilities Overview

Module descriptions, key responsibilities, and primary files for Invento.

---

## 📚 Module Reference Summary

### 1. AUTH Module
- **Responsibility**: User identity authentication, session management, and `userId` data scoping across Convex.
- **Key Files**: `src/features/auth/`, `convex/admin.ts`, `convex/schema.ts`
- **Documentation**: **[AUTH.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/AUTH.md)**

### 2. PRODUCTS Module
- **Responsibility**: Product catalog management, SKU & barcode tracking, categories, stock level monitoring, and auto-reorder alerts.
- **Key Files**: `convex/products.ts`, `convex/category.ts`, `src/app/(main)/dashboard/product/`
- **Documentation**: **[PRODUCTS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PRODUCTS.md)**

### 3. SUPPLIERS Module
- **Responsibility**: Vendor directory, multi-supplier mapping per product (`productSuppliers`), lead times, MOQ, and vendor performance ratings.
- **Key Files**: `convex/suppliers.ts`, `src/app/(main)/dashboard/product/supplier/`
- **Documentation**: **[SUPPLIERS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SUPPLIERS.md)**

### 4. SALES Module
- **Responsibility**: Sales order checkout, real-time stock decrementing, revenue tracking, and `stockMovements` audit logging.
- **Key Files**: `convex/sales.ts`, `src/app/(main)/billing/`
- **Documentation**: **[SALES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SALES.md)**

### 5. BILLING Module
- **Responsibility**: GST Tax Invoice generation (`jsPDF`), downloadable PDF invoices, recurring customer billing schedules, and balance tracking.
- **Key Files**: `convex/invoices.ts`, `src/app/(main)/billing/`, `src/app/api/generate-pdf/`
- **Documentation**: **[BILLING.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/BILLING.md)**

### 6. LEDGER Module
- **Responsibility**: Double-entry financial audit trail, customer receivables, supplier payables, and account balance reconciliation.
- **Key Files**: `convex/ledger.ts`, `src/app/(main)/ledger/`
- **Documentation**: **[LEDGER.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/LEDGER.md)**

### 7. EXPENSES Module
- **Responsibility**: Categorized expense tracking, EdgeStore receipt uploads, category budget allocations, and expense approvals.
- **Key Files**: `convex/expenses.ts`, `src/app/(main)/expenses/`
- **Documentation**: **[EXPENSES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/EXPENSES.md)**

### 8. PROCUREMENT Module
- **Responsibility**: Purchase order (PO) generation, supplier fulfillment tracking, vendor receiving, and inventory restock entries.
- **Key Files**: `convex/purchaseOrders.ts`, `src/app/(main)/procurement/`
- **Documentation**: **[PROCUREMENT.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PROCUREMENT.md)**

### 9. INVENTORY_AUDIT Module
- **Responsibility**: Physical stock count audits, discrepancy detection, and inventory reconciliation entries.
- **Key Files**: `convex/inventoryReconciliations.ts`, `src/app/(main)/inventory-audit/`
- **Documentation**: **[INVENTORY_AUDIT.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/INVENTORY_AUDIT.md)**

### 10. ADMIN_RBAC Module
- **Responsibility**: System administration, user role management, RBAC permission setup, and security audit logs (`auditLog`). Note: `admin` is the highest role level (`super-admin` is replaced by `admin`).
- **Key Files**: `convex/admin.ts`, `src/app/(developer-admin-page)/admin/`, `src/app/(main)/company-admin/`
- **Documentation**: **[ADMIN_RBAC.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/ADMIN_RBAC.md)**

---

## 🔗 Related Links
- **Features Index**: [Documentation/features/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/README.md)
- **Master Sitemap**: [Documentation/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/README.md)
