# Physical Inventory Audit & Reconciliation Feature Guide

> **Module**: `INVENTORY_AUDIT`  
> **Primary Responsibility**: Physical stock count audits, discrepancy detection, and inventory reconciliation entries.

---

## 1. Executive Summary

The **INVENTORY_AUDIT** feature enables warehouse managers to conduct physical stock counts, compare physical counts against Convex database records, and record stock adjustment entries.

---

## 2. Audit Workflow

1. **Initiate Audit Session**: Open physical inventory count audit session in `/inventory-audit`.
2. **Record Physical Counts**: Warehouse staff count physical units per SKU.
3. **Discrepancy Calculation**: Automatically compute variance (`Physical Count - System Count`).
4. **Reconciliation Submission**: Approve stock adjustments (`convex/inventoryReconciliations.ts`), updating `products.stockLevel` and logging entry to `stockMovements`.

---

## 3. Key Files & Components

- `convex/inventoryReconciliations.ts`: Reconciliation creation and adjustment logging functions.
- `src/app/(main)/inventory-audit/`: Physical stock count UI table and audit runner.

---

## 4. Related Links
- **Product Catalog**: [PRODUCTS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PRODUCTS.md)
- **Sales & Stock Movements**: [SALES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SALES.md)
