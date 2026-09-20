# Sales & Transaction Processing Feature Guide

> **Module**: `SALES`  
> **Primary Responsibility**: Sales order recording, real-time inventory decrementing, customer billing linkage, and stock movement logs.

---

## 1. Executive Summary

The **SALES** feature handles checkout transactions, reduces product stock levels in real time, and logs financial entries to the ledger.

---

## 2. Data Flow & Transaction Lifecycle

```
1. Sales Entry (Sales UI / POS)
   │
   ▼
2. Trigger `convex/sales.ts:createSale` mutation
   │
   ├─► Verify available stock in `products`
   ├─► Decrement stockLevel & recalculate stockStatus
   ├─► Log entry in `sales` table
   ├─► Record movement in `stockMovements` audit table
   └─► Create receivable entry in `ledger` table
   │
   ▼
3. Real-time Convex subscriptions update UI dashboard
```

---

## 3. Data Schema Summary (`sales` & `stockMovements`)

- **`sales` Table**:
  - `saleNumber`: Order identifier string.
  - `items`: Array of line items (`productId`, `quantity`, `unitPrice`, `totalPrice`).
  - `subtotal`, `taxAmount`, `totalAmount`: Pricing calculations.
  - `paymentStatus`: `'paid' | 'pending' | 'partial'`.
  - `userId`: Tenant scoping identifier.

- **`stockMovements` Table**:
  - `productId`: Reference to product.
  - `quantityDelta`: Quantity added or removed (e.g. `-5` for sale, `+20` for restock).
  - `movementType`: `'sale' | 'purchase' | 'adjustment' | 'return' | 'damage'`.

---

## 4. Key Files & Components

- `convex/sales.ts`: Order processing mutations and sales queries.
- `src/app/(main)/billing/`: Sales invoice and checkout view.
- `src/app/(main)/reports/sales/`: Sales analytics dashboard.

---

## 5. Related Links
- **Tax Invoicing**: [BILLING.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/BILLING.md)
- **Financial Ledger**: [LEDGER.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/LEDGER.md)
