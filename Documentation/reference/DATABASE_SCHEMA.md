# Invento Database Schema Guide

> **Single Source of Truth**: Defined in `convex/schema.ts`  
> **Backend Database**: Convex Serverless Reactive Database  

---

## 1. Primary Tables Overview

### 1.1 `products`
Product catalog items, SKU tracking, pricing, and stock status.

```typescript
{
  _id: Id<"products">,
  _creationTime: number,
  userId: string,                      // Tenant data scoping
  name: string,                        // Product name
  sku: string,                         // Unique SKU
  slug: string,                        // URL slug
  serialNumber?: string,               // Serial number
  barcode?: string,                    // Barcode for scanning
  hsnsacCode?: string,                 // HSN/SAC code for GST compliance
  categoryName: string,
  categoryId: string,
  subcategory?: string,
  description?: string,
  imageUrl?: string,
  brand?: string,
  purchasePrice?: string,              // Purchase cost
  sellingPrice?: number,               // Selling price
  discountPrice?: number,
  stockLevel?: number,                 // Current physical stock
  inStock: boolean,
  reorderLevel?: number,               // Safety stock threshold
  autoReorderEnabled?: boolean,
  stockStatus: "in_stock" | "low_stock" | "out_of_stock",
  supplierName?: string,
  supplierId?: string,
  lastRestockedAt?: number,
  isDeleted: boolean,                  // Soft deletion flag
  createdAt: number,
  updatedAt?: number
}
```
**Indexes**:
- `by_user`: `['userId']`
- `by_user_and_isDeleted`: `['userId', 'isDeleted']`
- `by_user_and_isCategory`: `['categoryId', 'isDeleted']`
- `by_user_and_isSupplier`: `['supplierId', 'isDeleted']`

---

### 1.2 `suppliers` & `productSuppliers`
Supplier directory and multi-vendor product mapping.

- **`suppliers`**:
  ```typescript
  {
    _id: Id<"suppliers">,
    userId: string,
    name: string,
    phone?: string,
    email?: string,
    address?: string,
    imageUrl?: string,
    totalOrders?: number,
    onTimeDeliveries?: number,
    lateDeliveries?: number,
    averageLeadTimeDays?: number,
    isDeleted: boolean,
    createdAt: number
  }
  ```
  **Indexes**: `by_user_and_isDeleted`, `by_user_performance`

- **`productSuppliers`** (Multi-Supplier Mapping):
  ```typescript
  {
    _id: Id<"productSuppliers">,
    userId: string,
    productId: Id<"products">,
    supplierId: Id<"suppliers">,
    costPrice: number,
    supplierSku?: string,
    minOrderQty?: number,
    leadTimeDays?: number,
    isPreferred: boolean,
    createdAt: number
  }
  ```
  **Indexes**: `by_user`, `by_product`

---

### 1.3 `sales` & `stockMovements`
Sales transaction orders and inventory audit logs.

- **`sales`**:
  ```typescript
  {
    _id: Id<"sales">,
    userId: string,
    saleNumber: string,
    items: Array<{ productId: Id<"products">, quantity: number, unitPrice: number, totalPrice: number }>,
    subtotal: number,
    taxAmount: number,
    totalAmount: number,
    paymentStatus: "paid" | "pending" | "partial",
    createdAt: number
  }
  ```
  **Indexes**: `by_user`, `by_user_and_date`

- **`stockMovements`**:
  ```typescript
  {
    _id: Id<"stockMovements">,
    userId: string,
    productId: Id<"products">,
    quantityDelta: number,            // e.g. -5 for sale, +20 for restock
    movementType: "sale" | "purchase" | "adjustment" | "return" | "damage",
    notes?: string,
    createdAt: number
  }
  ```
  **Indexes**: `by_user`, `by_product`

---

### 1.4 `invoices` & `recurringInvoices`
GST tax invoices and recurring customer billing schedules.

- **`invoices`**:
  ```typescript
  {
    _id: Id<"invoices">,
    userId: string,
    invoiceNumber: string,
    customerName: string,
    customerId?: string,
    issueDate: number,
    dueDate: number,
    items: Array<{ description: string, quantity: number, unitPrice: number, taxRate: number, total: number }>,
    subtotal: number,
    taxTotal: number,
    grandTotal: number,
    status: "draft" | "issued" | "paid" | "overdue" | "cancelled",
    createdAt: number
  }
  ```
  **Indexes**: `by_user`, `by_user_and_status`

---

### 1.5 `ledger` & `expenses`
Double-entry financial audit trail and operational expense tracking.

- **`ledger`**:
  ```typescript
  {
    _id: Id<"ledger">,
    userId: string,
    entryNumber: string,
    transactionType: "sale" | "purchase" | "expense" | "payment_received" | "payment_sent" | "adjustment",
    amount: number,
    partyName?: string,
    partyType?: "customer" | "supplier",
    referenceId?: string,
    createdAt: number
  }
  ```
  **Indexes**: `by_user`, `by_user_and_type`

- **`expenses`**:
  ```typescript
  {
    _id: Id<"expenses">,
    userId: string,
    title: string,
    amount: number,
    categoryId: string,
    receiptUrl?: string,             // EdgeStore asset URL
    status: "pending" | "approved" | "rejected",
    expenseDate: number,
    createdAt: number
  }
  ```
  **Indexes**: `by_user`, `by_user_and_category`

---

### 1.6 `auditLog`
Immutable administrative audit log for security and role changes.

```typescript
{
  _id: Id<"auditLog">,
  userId: string,
  action: string,
  performedBy: string,
  details: string,
  timestamp: number
}
```
**Indexes**: `by_user`

---

## 2. Key Data Architecture Principles

1. **User Data Isolation (`userId`)**: Every table MUST include a `userId` field and index. Unscoped queries are strictly prohibited.
2. **Soft Deleting (`isDeleted`)**: Main business entities (products, suppliers, categories) use soft deletion to preserve tax, sales, and accounting audit histories.
3. **No Razorpay / Payments Tables**: Billing handles GST invoice generation and balance records; subscription payment tables are deprecated.

---

## 3. Related Links
- **Master Documentation Index**: [Documentation/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/README.md)
- **Features Index**: [Documentation/features/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/README.md)
