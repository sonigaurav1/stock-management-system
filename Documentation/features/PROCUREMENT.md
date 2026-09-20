# Procurement & Restock Operations Feature Guide

> **Module**: `PROCUREMENT`  
> **Primary Responsibility**: Purchase order (PO) generation, supplier fulfillment tracking, receiving goods, and stock level increments.

---

## 1. Executive Summary

The **PROCUREMENT** feature automates reordering stock from vendors. When inventory levels drop below safety thresholds, purchase orders are issued to suppliers, tracked through fulfillment, and reconciled into inventory stock.

---

## 2. Procurement Lifecycle Flow

```
1. Low Stock Trigger (Product stockLevel < reorderLevel)
   │
   ▼
2. Generate Purchase Order (`convex/purchaseOrders.ts:createPO`)
   │
   ▼
3. Issue PO to Supplier & Track Delivery Status ('draft' -> 'issued' -> 'shipped')
   │
   ▼
4. Receive Goods Mutation:
   ├─► Increment product `stockLevel`
   ├─► Mark PO status as 'fulfilled'
   ├─► Update supplier `averageLeadTimeDays` performance rating
   └─► Record financial payable entry in `ledger`
```

---

## 3. Data Schema Summary (`purchaseOrders`)

- `poNumber`: Purchase order identifier (e.g. `PO-2026-0104`).
- `supplierId`, `supplierName`: Supplier reference.
- `items`: Line items array (`productId`, `quantityOrdered`, `unitCost`).
- `status`: `'draft' | 'issued' | 'shipped' | 'fulfilled' | 'cancelled'`.
- `expectedDeliveryDate`: Delivery target timestamp.
- `userId`: Tenant scoping identifier.

---

## 4. Key Files & Components

- `convex/purchaseOrders.ts`: PO creation, tracking, and receiving mutations.
- `src/app/(main)/procurement/`: Purchase order creation and restock management dashboard.
- `src/app/(main)/restock/`: Quick restock action interface.

---

## 5. Related Links
- **Supplier Directory**: [SUPPLIERS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SUPPLIERS.md)
- **Product Catalog**: [PRODUCTS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PRODUCTS.md)
