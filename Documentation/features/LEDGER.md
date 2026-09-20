# Financial Ledger Feature Guide

> **Module**: `LEDGER`  
> **Primary Responsibility**: Double-entry financial audit trail, customer receivables, supplier payables, and account balance reconciliation.

---

## 1. Executive Summary

The **LEDGER** feature maintains an immutable financial record of all monetary transactions in Invento, ensuring accurate accounting and cash flow tracking.

---

## 2. Ledger Architecture & Double-Entry Principles

Every financial activity (sales revenue, supplier payouts, customer invoice payments, business expenses) appends a record to the `ledger` collection:

- **Credit Entry**: Increases revenue or cash inflow (e.g. completed sale).
- **Debit Entry**: Increases expenditure or accounts payable (e.g. supplier restock payment or operational expense).
- **Running Balance**: Calculates active cash position and account balances per `userId`.

---

## 3. Data Schema Summary (`ledger` & `transactions`)

- `entryNumber`: Ledger entry identifier string.
- `transactionType`: `'sale' | 'purchase' | 'expense' | 'payment_received' | 'payment_sent' | 'adjustment'`.
- `amount`: Transaction monetary value (monospaced display).
- `partyName`, `partyType`: `'customer' | 'supplier'`.
- `referenceId`: Linked invoice ID, PO ID, or sale ID.
- `userId`: Tenant scoping identifier.

---

## 4. Key Files & Components

- `convex/ledger.ts`: Ledger mutations and financial summary queries.
- `src/app/(main)/ledger/`: Financial ledger UI table and balance summary.
- `src/app/(main)/reports/financial/`: Income statement and balance report visualizations.

---

## 5. Related Links
- **Expenses & Receipts**: [EXPENSES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/EXPENSES.md)
- **Tax Invoicing**: [BILLING.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/BILLING.md)
