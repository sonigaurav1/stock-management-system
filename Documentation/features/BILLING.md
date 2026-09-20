# Tax Invoicing & Billing Feature Guide

> **Module**: `BILLING`  
> **Primary Responsibility**: GST Tax Invoice generation, PDF export (`jsPDF`), recurring customer invoices, and customer balance tracking.  
> **Note**: Payment gateway integrations and paid subscription tiers have been removed. Billing focuses strictly on customer invoicing and tax documentation.

---

## 1. Executive Summary

The **BILLING** feature manages GST-compliant tax invoices, recurring customer billing schedules, downloadable PDF documents, and customer invoice payment status tracking.

---

## 2. Tax Invoice PDF Generation Architecture

Invento uses `jsPDF` and `jsPDF-AutoTable` to construct dynamic, print-ready PDF invoices:

- Includes business legal details, HSN/SAC code breakdowns, SGST/CGST/IGST tax breakdowns, customer billing address, and itemized totals.
- Generated via server route `/api/generate-pdf` or client-side PDF utility helpers in `src/lib/`.

---

## 3. Data Schema Summary (`invoices` & `recurringInvoices`)

Defined in `convex/schema.ts`:

- **`invoices` Table**:
  - `invoiceNumber`: Unique invoice code (e.g. `INV-2026-0042`).
  - `customerName`, `customerId`: Customer identification.
  - `issueDate`, `dueDate`: Timestamps.
  - `items`: Itemized line items array.
  - `subtotal`, `taxTotal`, `grandTotal`: Currency calculations.
  - `status`: `'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled'`.
  - `userId`: Tenant scoping identifier.

- **`recurringInvoices` Table**:
  - `frequency`: `'weekly' | 'monthly' | 'annually'`.
  - `nextRunDate`: Epoch timestamp for automated invoice generation.

---

## 4. Key Files & Components

- `convex/invoices.ts`: Invoice CRUD mutations and search queries.
- `src/app/(main)/billing/`: Tax invoicing UI list and invoice generator.
- `src/app/(main)/billing/[invoiceType]/[invoiceNumber]/`: Invoice detail and printable view.
- `src/app/api/generate-pdf/`: Next.js PDF generation route.

---

## 5. Related Links
- **Sales Transactions**: [SALES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SALES.md)
- **Financial Ledger**: [LEDGER.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/LEDGER.md)
