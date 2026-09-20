# Page Context & Data Hook Mapping

> **Purpose**: Technical context map linking Next.js pages to their underlying Convex hooks, UI components, and feature modules.

---

## 1. Page Context Matrix

| Page Route | Primary UI Components | Convex Data Hooks | Feature Module |
| :--- | :--- | :--- | :--- |
| `/dashboard/overview` | `MetricsCards`, `RechartsSalesChart`, `LowStockWidget` | `useQuery(api.products.getProducts)` | [PRODUCTS](file:///Users/gaurav/Desktop/Invento/Documentation/features/PRODUCTS.md) |
| `/dashboard/product` | `ProductTable`, `ProductFormModal`, `StockBadge` | `useQuery(api.products.getProducts)` | [PRODUCTS](file:///Users/gaurav/Desktop/Invento/Documentation/features/PRODUCTS.md) |
| `/dashboard/product/supplier` | `SupplierTable`, `SupplierFormModal` | `useQuery(api.suppliers.getSuppliers)` | [SUPPLIERS](file:///Users/gaurav/Desktop/Invento/Documentation/features/SUPPLIERS.md) |
| `/billing` | `InvoiceTable`, `TaxInvoiceGenerator` | `useQuery(api.invoices.getInvoices)` | [BILLING](file:///Users/gaurav/Desktop/Invento/Documentation/features/BILLING.md) |
| `/ledger` | `LedgerTable`, `BalanceSummaryCard` | `useQuery(api.ledger.getLedgerEntries)` | [LEDGER](file:///Users/gaurav/Desktop/Invento/Documentation/features/LEDGER.md) |
| `/expenses` | `ExpenseTable`, `ReceiptModal`, `BudgetBar` | `useQuery(api.expenses.getExpenses)` | [EXPENSES](file:///Users/gaurav/Desktop/Invento/Documentation/features/EXPENSES.md) |
| `/procurement` | `POTable`, `PurchaseOrderModal` | `useQuery(api.purchaseOrders.getPOs)` | [PROCUREMENT](file:///Users/gaurav/Desktop/Invento/Documentation/features/PROCUREMENT.md) |
| `/company-admin` | `UserRoleTable`, `RoleAssignmentModal` | `useQuery(api.admin.getUsers)` | [ADMIN_RBAC](file:///Users/gaurav/Desktop/Invento/Documentation/features/ADMIN_RBAC.md) |

---

## 2. Related Links
- **Route Index Map**: [APP_ROUTES.md](file:///Users/gaurav/Desktop/Invento/Documentation/pages/APP_ROUTES.md)
- **Code Patterns**: [Documentation/reference/CODE_PATTERNS.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/CODE_PATTERNS.md)
