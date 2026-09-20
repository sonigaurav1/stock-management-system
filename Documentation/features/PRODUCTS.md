# Products & Inventory Management Feature Guide

> **Module**: `PRODUCTS`  
> **Primary Responsibility**: Product catalog management, SKU & barcode tracking, categories, stock level monitoring, and auto-reorder alerts.

---

## 1. Executive Summary

The **PRODUCTS** feature is the core inventory engine of Invento. It handles item metadata, pricing structures, stock level calculations, and reorder alerts.

---

## 2. Data Schema Summary (`products` & `category`)

Defined in `convex/schema.ts`:

- `name`: Product title string.
- `sku`: Unique stock keeping unit identifier (monospaced display).
- `barcode`: Optional barcode string for scanner lookups.
- `serialNumber`: Optional unique item serial number.
- `hsnsacCode`: HSN/SAC tax classification code for GST compliance.
- `categoryId`, `categoryName`, `subcategory`: Product classification tags.
- `purchasePrice`, `sellingPrice`, `discountPrice`: Pricing metadata.
- `stockLevel`: Current physical quantity.
- `reorderLevel`: Safety threshold before reorder notification triggers.
- `stockStatus`: `'in_stock' | 'low_stock' | 'out_of_stock'`.
- `isDeleted`: Soft deletion flag (`true` = deleted, `false` = active).
- `userId`: Tenant scoping identifier.

---

## 3. Core Capabilities & Workflows

### 3.1 Product Lifecycle
1. **Creation**: Form submission via `/dashboard/product` triggers `convex/products.ts:createProduct`.
2. **Stock Adjustment**: Sales or receiving transactions update `stockLevel` and automatically recalculate `stockStatus`.
3. **Soft Deletion**: Calling `deleteProduct` sets `isDeleted: true`, preserving historic invoice and sales records.

### 3.2 Auto-Reorder Alerts
When `stockLevel` drops below `reorderLevel`, the system flags the product as `low_stock` and notifies inventory managers to issue a purchase order to suppliers.

---

## 4. Key Files & Components

- `convex/products.ts`: Backend mutations (`createProduct`, `updateProduct`, `deleteProduct`) and queries (`getProducts`, `getProductBySku`).
- `convex/category.ts`: Category hierarchy management.
- `src/app/(main)/dashboard/product/`: Main product catalog page.
- `src/app/(main)/dashboard/product/[productId]/`: Individual product detail viewer.

---

## 5. Related Links
- **Supplier Sourcing**: [SUPPLIERS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SUPPLIERS.md)
- **Sales Transactions**: [SALES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SALES.md)
- **Procurement**: [PROCUREMENT.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PROCUREMENT.md)
