# Expense Tracking & Budgeting Feature Guide

> **Module**: `EXPENSES`  
> **Primary Responsibility**: Expense logging, receipt document attachments via EdgeStore, category budget allocations, and approval workflows.

---

## 1. Executive Summary

The **EXPENSES** feature allows business managers and accountants to log operational expenditures, upload physical receipt attachments, allocate category budgets, and approve expense reports.

---

## 2. Data Schema Summary (`expenses`, `expenseCategories`, `budgets`)

Defined in `convex/schema.ts`:

- **`expenses` Table**:
  - `title`, `amount`, `categoryId`: Basic expense metadata.
  - `receiptUrl`: File storage URI (managed by EdgeStore).
  - `status`: `'pending' | 'approved' | 'rejected'`.
  - `expenseDate`: Epoch timestamp.
  - `userId`: Tenant scoping identifier.

- **`expenseCategories` & `budgets` Tables**:
  - `categoryName`: Expense category (e.g. Utilities, Logistics, Rent, Office Supplies).
  - `monthlyLimit`: Maximum budget threshold.
  - `currentSpent`: Aggregated current spend.

---

## 3. Key Workflows

1. **Expense Entry**: Log expenditure, attach receipt image via EdgeStore file uploader.
2. **Budget Threshold Checks**: Alert accountants if an expense exceeds the configured monthly category budget.
3. **Approval Chain**: Admin/Manager review and approval transition (`pending` -> `approved`).

---

## 4. Key Files & Components

- `convex/expenses.ts`: Expense management functions and budget calculators.
- `src/app/(main)/expenses/`: Expense logging UI, receipt viewer, and budget breakdown.
- `src/app/api/edgestore/[...edgestore]/`: EdgeStore API handler route.

---

## 5. Related Links
- **Financial Ledger**: [LEDGER.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/LEDGER.md)
- **Admin & RBAC**: [ADMIN_RBAC.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/ADMIN_RBAC.md)
