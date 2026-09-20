# Supplier & Vendor Sourcing Feature Guide

> **Module**: `SUPPLIERS`  
> **Primary Responsibility**: Vendor profiles, multi-supplier product mapping, lead time tracking, and vendor performance analytics.

---

## 1. Executive Summary

The **SUPPLIERS** feature allows business managers to track vendor contact info, map multiple suppliers to a single product (`productSuppliers`), and measure vendor lead time performance.

---

## 2. Data Schema Summary (`suppliers` & `productSuppliers`)

Defined in `convex/schema.ts`:

- **`suppliers` Table**:
  - `name`, `phone`, `email`, `address`, `imageUrl`: Profile details.
  - `totalOrders`, `onTimeDeliveries`, `lateDeliveries`: Delivery performance tracking counters.
  - `averageLeadTimeDays`: Average fulfillment duration in days.
  - `userId`: Tenant scoping identifier.

- **`productSuppliers` Table** (Multi-Supplier Mapping):
  - `productId`: Reference to `products` collection.
  - `supplierId`: Reference to `suppliers` collection.
  - `costPrice`: Supplier's wholesale price.
  - `supplierSku`: Vendor's internal item SKU.
  - `minOrderQty` (MOQ): Minimum purchase quantity.
  - `leadTimeDays`: Estimated delivery time.
  - `isPreferred`: Flag indicating primary preferred vendor.

---

## 3. Key Workflows

1. **Vendor Directory**: Manage vendor profiles via `/dashboard/product/supplier`.
2. **Multi-Sourcing**: Attach multiple suppliers to a single product with custom cost prices and lead times.
3. **Fulfillment Tracking**: Update delivery counts when receiving purchase orders to calculate supplier lead time ratings.

---

## 4. Key Files & Components

- `convex/suppliers.ts`: Supplier queries and performance rating mutations.
- `src/app/(main)/dashboard/product/supplier/`: Supplier list and management UI.
- `src/app/(main)/procurement/`: Purchase order workflow integrated with suppliers.

---

## 5. Related Links
- **Product Catalog**: [PRODUCTS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PRODUCTS.md)
- **Procurement**: [PROCUREMENT.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PROCUREMENT.md)
