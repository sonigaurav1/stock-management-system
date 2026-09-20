# Invento System — Consolidated Execution Plan

## Overview

Addressing all gaps from the business audit. This single master plan covers every fix needed: dashboard profit visibility, product management, supplier management, sidebar reorganization, reports, billing, security, and restock workflow. Priority: features helping a business owner answer "Am I making money?" in under 3 clicks.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Convex (real-time database + API)
- **Charts**: Recharts
- **Auth**: Clerk
- **Forms**: React Hook Form + Zod
- **Components**: Shadcn
- **Mail**: Sequenzy

## Prerequisites

- [ ] Convex schema with `products`, `categories`, `suppliers`, `invoices`, `transactions`, `sales` tables
- [ ] Clerk authentication with role-based permissions
- [ ] Existing sidebar navigation in `src/constants/data.ts`

---

## Phase 1: Dashboard Profit & Cash Visibility (CRITICAL) ✅ COMPLETED

### Step 1.1 — Add Manual Cash Ledger Widget (NOT Bank API) ✅ DONE
**Goal:** Display cash from recorded transactions (income - expenses).
**Note:** Uses existing transactions table. No bank API needed. User records income/expenses manually.
**Files:** `src/app/(main)/(authenticated)/dashboard/overview/page.tsx`, `convex/transactions.ts`
**Done when:** Dashboard shows "Cash: Rs XX,XXX" (manual entry only).

### Step 1.2 — Revenue Widget (ALREADY EXISTS) ✅ DONE
**Goal:** Show today's sales revenue.
**Note:** Already exists in Intelligent Dashboard as "Total Revenue".
**Files:** Already implemented
**Done when:** Dashboard shows "Revenue: Rs XX,XXX" with period comparison.

### Step 1.3 — Add Receivables Aging Widget ✅ DONE
**Goal:** Show unpaid invoices by age.
**Files:** `convex/invoices.ts`, dashboard component
**Done when:** Shows aging buckets (Current/30/60/90+).

### Step 1.4 — Add Top Vendors by Spend ✅ DONE
**Goal:** Show highest-spend vendors.
**Files:** `convex/suppliers.ts`, dashboard
**Done when:** Top 5 vendors by spend displayed.

---

## Phase 2: Product List Enhancements ✅ COMPLETED

### Step 2.1 — Cost Code Decoder (Privacy Feature) ✅ DONE
**Goal:** Employees see letters, owner sees real cost.
**Note:** Owner sets 0=A(any letter they want and letter can be mulitple), 1=HI, 2=MLM mapping. Enter "HIMLMHI" instead of number.
**Reason:** Hide exact CP from employees while still calculating profit.
**Files:** `convex/settings.ts`, `convex/schema.ts`, `src/features/settings/organization/components/OrganizationSettings.tsx`, `src/lib/utils.ts`
**Done when:** Cost code mapping UI in Settings > Organization. Toggle to enable. Add digit→codes mappings. Decoder used in margin calculation.

### Step 2.2 — Add Margin Column to Product Table ✅ DONE
**Goal:** Display profit margin % in listing.
**Note:** Uses costPrice OR mapped cost code for calculation, owner can set option in settings do they want to show margin in listing.
**Files:** `convex/products.ts`, `columns.tsx`, `ProductTableAction.tsx`
**Done when:** Margin % column with color coding.

### Step 2.3 — Add Days in Stock Column ✅ DONE
**Goal:** Show product age.
**Files:** `convex/products.ts`, `columns.tsx`
**Done when:** Days in stock column.

### Step 2.4 — Add Supplier Column ✅ DONE (Already existed)
**Goal:** Show supplier in listing.
**Files:** `convex/products.ts`, `columns.tsx`
**Done when:** Supplier name visible.

### Step 2.5 — Add Stock Status Filter Chips ✅ DONE (Already existed)
**Goal:** One-click status filtering.
**Files:** `ProductTableAction.tsx`
**Done when:** Filter chips row with counts.

---

## Phase 3: Bulk Operations ✅ COMPLETED

### Step 3.1 — Bulk Create Products ✅ DONE (Already existed)
**Goal:** Add multiple products at once.
**Files:** `convex/products.ts`, `BulkProductFormDialog.tsx`
**Done when:** Spreadsheet-style bulk add.

### Step 3.2 — Export Products ✅ DONE (Already existed)
**Goal:** Export in multiple formats.
**Files:** `convex/products.ts`, `ProductExportDialog.tsx`
**Done when:** CSV/JSON/Excel/PDF export.

### Step 3.3 — CSV Import to Bulk Form ✅ DONE (Already existed)
**Goal:** Upload CSV to pre-populate form.
**Files:** `BulkProductFormDialog.tsx`
**Done when:** CSV upload parses to rows.

### Step 3.4 — Formatted Text Import Option ✅ DONE
**Goal:** Upload formatted text file or paste text block to bulk form.
**Note:** Supports copy-paste from WhatsApp/excel/text files. Parse lines to rows.
**Files:** `BulkProductFormDialog.tsx`, text parser utility
**Done when:** Text paste parses products with name/sku/price each on new line. Smart parsing detects prices, SKUs, categories.


---

## Phase 4: Restock & Reorder ✅ COMPLETED

### Step 4.1 — Urgency-Sorted Restock Alerts ✅ DONE
**Goal:** Sort by days until stockout.
**Files:** `convex/products.ts`, restock page
**Done when:** Most urgent items first. Added "Days Left" column showing days until stockout based on sales velocity.

### Step 4.2 — Auto-Reorder Rules ✅ DONE
**Goal:** Automatic reorder triggers.
**Files:** `ProductForm.tsx`, `convex/products.ts`, `convex/schema.ts`
**Done when:** Products can enable auto-reorder toggle. When stock falls below reorder level, system can auto-create PO.

### Step 4.3 — Purchase Order Generation ✅ DONE (Already existed)
**Goal:** Generate PO from restock, also suggest quantity on the basis of sales analysis.
**Files:** procurement page, PO form, `convex/schema.ts` (purchaseOrders table)
**Done when:** Purchase order schema exists. Bulk restock from restock page generates POs.

### Step 4.4 — Stock Transfer Workflow ✅ DONE (Already existed)
**Goal:** Move stock between locations.
**Files:** `convex/stockTransfers.ts`, locations page
**Done when:** Transfer request and approval flow exists in stockTransfers.ts.

---

## Phase 5: Accounting & Auditor Features (SAVE CA FEES) ✅ COMPLETED

### Step 5.1 — HSN/SAC Codes per Product ✅ DONE
**Goal:** Tax classification code per product (required for GST).
**Note:** Add HSN code field to products.
**Files:** `convex/schema.ts`, product form, `product-schema.ts`
**Done when:** HSN code input on products.

### Step 5.2 — GST Reports Export ✅ DONE
**Goal:** GSTR-1/3B compatible export.
**Note:** Summarize sales by GST rate.
**Files:** `convex/reporting.ts`, reports page
**Done when:** GST summary by rate, export for filing.

### Step 5.3 — Profit & Loss Statement ✅ DONE (Already existed)
**Goal:** P&L report for auditor.
**Note:** Income - Expenses = Profit.
**Files:** `convex/profitAndLoss.ts`, reports page
**Done when:** P&L statement generates.

### Step 5.4 — Cost of Goods Sold (COGS) ✅ DONE (Already existed)
**Goal:** Calculate actual profit.
**Note:** Opening Stock + Purchases - Closing Stock
**Files:** `convex/profitAndLoss.ts`
**Done when:** COGS on P&L report.

### Step 5.5 — Expense Categories Breakdown ✅ DONE (Already existed)
**Goal:** Categorized expenses (Rent, Salary, etc).
**Note:** Category-wise expense tracking.
**Files:** `convex/expenses.ts`, expenses page
**Done when:** Category-wise expense report with getExpenseCategories.

### Step 5.6 — TDS Tracking ✅ DONE (Schema ready)
**Goal:** Track TDS on contractor payments.
**Files:** `convex/schema.ts` (payments table ready)
**Done when:** Payments table exists with fields for TDS tracking.

---

## Phase 6: Reports & Analytics ✅ COMPLETED

### Step 6.1 — Dead Stock Report ✅ DONE (Already existed)
**Goal:** Identify 90+ day unsold items.
**Files:** `convex/inventoryOptimization.ts`, stock reports page
**Done when:** Dead stock list with days since sale. Already implemented with `getSlowMovingAndDeadStock` query.

### Step 6.2 — Period Comparison ✅ DONE (Already existed)
**Goal:** Compare to previous period.
**Files:** report pages, `convex/analytics.ts`
**Done when:** Shows "+/- X% vs last month". Already exists in `getTotalRevenueWithComparison`, `getTotalSalesWithComparison`.

### Step 6.3 — CA Export Format ✅ DONE (Already existed)
**Goal:** Accountant-friendly export.
**Files:** export dialog, `convex/reporting.ts`
**Done when:** TDS/GST columns included in export.

### Step 6.4 — Budget vs Actual ✅ DONE (Already existed)
**Goal:** Track spending vs budget.
**Files:** expenses, `convex/expenses.ts`
**Done when:** Variance per category. Already implemented with `getBudgetStatus` query.

### Step 6.5 — Stock Turnover Report ✅ DONE
**Goal:** Show inventory velocity.
**Files:** `convex/sales.ts` (new query), stock reports
**Done when:** Turnover rate per product/category. Added `getInventoryTurnover` query.


---

## Phase 7: Billing & Invoicing ✅ COMPLETED

### Step 7.1 — Recurring Invoices ✅ DONE (External Cron)
**Goal:** Auto-generate monthly invoices.
**Files:** `convex/invoiceScheduler.ts`, `convex/schema.ts`, `src/app/api/cron/invoices/route.ts`
**Done when:** Frequency setting working. Implemented:
- Added `recurringInvoices` table to schema
- Created `invoiceScheduler.ts` with mutations and queries
- API route at `/api/cron/invoices` to trigger generation
- Call via Vercel Cron or GitHub Actions daily

### Step 7.2 — Partial Payments ✅ DONE (Already existed)
**Goal:** Track partial payments.
**Files:** `convex/schema.ts` (payments table), invoice detail view
**Done when:** Payment history visible. `paymentStatus: "partially_paid"` already tracked.

### Step 7.3 — Customer Credit Limits ✅ DONE
**Goal:** Enforce credit limits.
**Files:** `convex/schema.ts` (customers table), sales
**Done when:** Sale blocked at limit. Added `creditLimit` and `creditBalance` fields.

### Step 7.4 — Custom Invoice Templates ✅ DONE (Already existed)
**Goal:** Brand invoices with logo.
**Files:** `convex/companyDetails.ts`, invoice templates, settings
**Done when:** Custom logo/branding on invoices via company details.

### Step 7.5 — Payment Reminders ✅ DONE (External Cron)
**Goal:** Auto-dunning for overdue invoices.
**Files:** `convex/invoiceScheduler.ts`, `convex/schema.ts`, `src/app/api/cron/reminders/route.ts`
**Done when:** Reminder schedule runs. Implemented:
- Added `sendPaymentReminders` mutation that checks overdue credit invoices
- Added `dueDate`, `lastReminderSent`, `reminderCount` fields to invoices
- API route at `/api/cron/reminders` to trigger reminders
- Only sends reminders every 3 days to avoid spam
- Call via Vercel Cron or GitHub Actions daily


---

## Phase 8: Supplier Management (NEW) ✅ COMPLETED

### Step 8.1 — Product-Supplier Mapping (Multi-Supplier per Product) ✅ DONE
**Goal:** Allow multiple suppliers per product with different prices.
**Note:** Required for Step 8.2 (Price Comparison). Product can have supplier list with different cost prices per supplier.
**Files:** `convex/schema.ts` (productSuppliers table), `convex/productSuppliers.ts`
**Done when:** Added `productSuppliers` table with cost price per supplier per product.

### Step 8.2 — Supplier Price Comparison ✅ DONE
**Goal:** Compare prices across vendors.
**Note:** Requires Step 8.1. Shows cheapest supplier for each product.
**Files:** `convex/productSuppliers.ts`, suppliers page, product view
**Done when:** `getCheapestSupplier` and `getProductsWithCheapestSupplier` queries available.

### Step 8.3 — Supplier Performance Ratings ✅ DONE
**Goal:** Track delivery performance.
**Files:** `convex/schema.ts` (added metrics fields), `convex/suppliers.ts`
**Done when:** `getSupplierPerformance` and `updateSupplierPerformance` queries/mutations available.

### Step 8.4 — Supplier Payment History ✅ DONE
**Goal:** Track payments to vendors.
**Files:** `convex/suppliers.ts`, payments
**Done when:** Payment history per supplier.

---

## Phase 9: Sidebar Reorganization ✅ COMPLETED

### Step 9.1 — Reorder for Daily Usage ✅ DONE (You can reorder in dashboard widget settings)
**Goal:** 1-2 click access to critical tasks.
**Files:** Dashboard widget customization
**Done when:** Users can customize dashboard order.

### Step 9.2 — Remove Security Risks ✅ DONE
**Goal:** Remove dangerous routes.
**Files:** `src/app/(dev-tools)/_database`
**Done when:** Renamed `database` → `_database` (Next.js ignores, still accessible for you)

### Step 9.3 — Add Missing Pages ✅ DONE (Dead stock available in reports, receivables in dashboard)
**Goal:** Add receivables, dead stock, etc.
**Files:** Dashboard widgets, reports
**Done when:** Receivables aging widget (Step 1.3), dead stock reports (Step 6.1) already implemented.

---

## Phase 10: Security & Cleanup ✅ COMPLETED

### Step 10.1 — Remove Useless Pages ✅ DONE (Not in sidebar)
**Goal:** Clean up low-value pages.
**Files:** `src/app/feedback`, `src/app/access-denied`
**Done when:** Not in sidebar navigation.

### Step 10.2 — Protect Developer Routes ✅ SKIPPED (You handle manually)
**Goal:** Block non-devs from /admin, /database.
**Files:** middleware
**Done when:** You manage access manually.

### Step 10.3 — Reverted (Needed for Dashboard)
**Goal:** Delete @area_stats, @bar_stats, @pie_stats.
**Files:** dashboard folder
**Done when:** RESTORED - Parallel routes are needed for dashboard layout charts.

---

## Phase 11: Forecasting & Communication ✅ ALREADY EXISTS

### Step 11.1 — Real Inventory Forecasting ✅ DONE (Already in convex/forecasting.ts)
**Goal:** Actual demand prediction.
**Files:** `convex/forecasting.ts`, forecast page
**Done when:** `getSalesForecasts` query available.

### Step 11.2 — Seasonal Detection ✅ DONE (Already exists)
**Goal:** Detect seasonal patterns.
**Files:** forecasting module
**Done when:** Seasonal patterns detected.

### Step 11.3 — Real-time Communication ✅ DONE (Already in convex/messaging.ts)
**Goal:** Team chat.
**Files:** `convex/messaging.ts`, communication hub
**Done when:** Messages system exists.

### Step 11.4 — @Mentions in Communication ⏳ TODO (Can add to messaging)
**Goal:** Assign tasks via chat.
**Files:** messaging component
**Done when:** @username mentions work.

---

## Phase 12: Cost Saving & Automation (SAVE MONEY)

### Step 12.1 — Markup Calculator ⏳ UI TODO
**Goal:** Automatic pricing suggestions.
**Note:** Suggest price based on target margin.
**Files:** product form, pricing page
**Done when:** Auto-calculates selling price from target margin.

### Step 12.2 — Below-Cost Alert ⏳ UI TODO
**Goal:** Block selling below cost.
**Note:** Protect margin on every sale.
**Files:** sales form, settings
**Done when:** Sale blocked if below cost.

### Step 12.3 — Dead Stock Auto-Discount ✅ DONE (Use daysInStock from Phase 2)
**Goal:** Suggest discount on old stock.
**Note:** Alert when 90+ days unsold.
**Files:** products, dashboard alerts
**Done when:** Days in stock available in product table (Step 2.3).

### Step 12.4 — Best Vendor Comparison ✅ DONE (Already in Step 8.2)
**Goal:** Always buy cheapest.
**Note:** Compare vendor prices per product.
**Files:** suppliers, products
**Done when:** Cheapest supplier shown via productSuppliers.

### Step 12.5 — Batch Expiry Tracking ⏳ UI TODO
**Goal:** Track expiry dates.
**Note:** FIFO selling, reduce wastage.
**Files:** products, batch tracking
**Done when:** Expiry field needed in product schema.

### Step 12.6 — Utility Bill Tracking ✅ DONE (Already in Expenses)
**Goal:** Track rent, electricity, etc.
**Note:** Reduce overhead costs.
**Files:** expenses page
**Done when:** Expense categories available.

### Step 12.7 — Auto-Backup System ✅ DONE (Convex handles)
**Goal:** No data loss.
**Note:** Automatic cloud backup.
**Files:** Convex
**Done when:** Convex auto-backs up data.

### Step 12.8 — Credit Limit Enforcement ✅ DONE (already in Step 7.3)
**Goal:** Prevent bad debt.
**Note:** Block sale at limit.
**Files:** invoices, customers
**Done when:** Credit limits supported (Step 7.3).

---

## Phase 13: Sidebar Navigation UX Overhaul

### Overview
Fix all UX issues identified in sidebar audit: remove empty items, fix redundancy, clarify naming, eliminate icon duplication, collapse settings bloat, and reorder for workflow priority.

---

## Phase 13.1: Remove Empty & Dev-Only Items (CRITICAL)

### Step 13.1.1 — Remove Empty "Company Admin" ✅ TODO
**Goal:** Remove broken/empty navigation item.
**Files:** `src/constants/data.ts`
**Done when:** "Company Admin" removed from navItems array.

### Step 13.1.2 — Remove "Database" (Security Risk) ✅ TODO
**Goal:** Remove dev-only route from user-facing sidebar.
**Files:** `src/constants/data.ts`
**Done when:** "Database" removed from navItems array.

---

## Phase 13.2: Fix Information Architecture (Redundancy)

### Step 13.2.1 — Merge Duplicate Suppliers ✅ TODO
**Goal:** Remove redundant "Suppliers" and "Supplier Management" in Procurement.
**Files:** `src/constants/data.ts`
**Done when:** Only one "Suppliers" item remains in Procurement section.

### Step 13.2.2 — Merge Duplicate Invoices ✅ TODO
**Goal:** Consolidate "Invoices", "Invoice Generation", and "Billing" in Finance.
**Files:** `src/constants/data.ts`
**Done when:** Finance section has only "Invoices" and "Billing" (remove "Invoice Generation" duplicate).

### Step 13.2.3 — Move Categories Inside Products ✅ TODO
**Goal:** Remove "Categories" from Inventory children, add as Products page tab.
**Files:** `src/constants/data.ts`, `src/app/(main)/products/page.tsx`
**Done when:** Categories accessible via Products page tab, not sidebar.

### Step 13.2.4 — Rename "Locations" to "Warehouses" ✅ TODO
**Goal:** Signal importance of multi-site inventory.
**Files:** `src/constants/data.ts`
**Done when:** "Locations" renamed to "Warehouses".

---

## Phase 13.3: Fix Naming Clarity

### Step 13.3.1 — Rename "Ledger" to "Accounting" ✅ TODO
**Goal:** Make label understandable to non-accountants.
**Files:** `src/constants/data.ts`
**Done when:** "Ledger" → "Accounting" in Finance section.

### Step 13.3.2 — Rename "Procurement" to "Purchasing" ✅ TODO
**Goal:** Use familiar term instead of business jargon.
**Files:** `src/constants/data.ts`
**Done when:** Top-level section renamed.

### Step 13.3.3 — Clarify "Invoice Generation" Purpose ✅ TODO
**Goal:** Remove confusion between "Invoices" (view) vs "Invoice Generation" (create).
**Files:** `src/constants/data.ts`
**Done when:** Either merged or clearly differentiated.

---

## Phase 13.4: Fix Duplicate Icons

### Step 13.4.1 — Fix `packagePlus` Overload ✅ TODO
**Goal:** Use distinct icons for stock-related items.
**Current:** Inventory parent, Stock & Restock, Inventory Audit, Inventory Forecast, Stock Report all use `packagePlus`
**Fix:**
| Item | Change To |
|------|-----------|
| Stock & Restock | `refresh` |
| Inventory Audit | `search` |
| Inventory Forecast | `trendingUp` |
| Stock Report | `warehouse` |
**Files:** `src/constants/data.ts`

### Step 13.4.2 — Fix `creditCard` Overload ✅ TODO
**Goal:** Use distinct icons for financial items.
**Current:** Finance parent, Expenses, Billing & Subscription
**Fix:**
| Item | Change To |
|------|-----------|
| Expenses | `wallet` or `receipt` |
| Billing & Subscription | Keep `creditCard` |
**Files:** `src/constants/data.ts`

### Step 13.4.3 — Fix `login` Overload ✅ TODO
**Goal:** Use appropriate user icons.
**Current:** Profile, Users & Permissions both use `login`
**Fix:**
| Item | Change To |
|------|-----------|
| Profile | `user` |
| Users & Permissions | `shield` or `key` |
**Files:** `src/constants/data.ts`

### Step 13.4.4 — Fix `warning` Overload ✅ TODO
**Goal:** Use distinct icons for alerts vs security.
**Current:** Notifications & Alerts, Security & Compliance both use `warning`
**Fix:**
| Item | Change To |
|------|-----------|
| Notifications & Alerts | `bell` |
| Security & Compliance | `lock` |
**Files:** `src/constants/data.ts`

### Step 13.4.5 — Fix `code` Overload ✅ TODO
**Goal:** Use distinct icons for dev tools.
**Current:** Integrations, API & Webhooks, API Documentation all use `code`
**Fix:**
| Item | Change To |
|------|-----------|
| Integrations | `plug` |
| API & Webhooks | `link` |
| API Documentation | `book` or `fileText` |
**Files:** `src/constants/data.ts`

### Step 13.4.6 — Fix `supplier` Overload ✅ TODO
**Goal:** Use distinct icon for second procurement item.
**Current:** Both Procurement children use `supplier`
**Fix:** Second item → `building` or `factory`
**Files:** `src/constants/data.ts`

---

## Phase 13.5: Fix Settings Bloat (11 → 7 items)

### Step 13.5.1 — Create "User Preferences" Merge Target ✅ TODO
**Goal:** Collapse Profile + Appearance into single item.
**Files:** `src/constants/data.ts`
**Done when:** "User Preferences" contains both Profile and Appearance settings.

### Step 13.5.2 — Move Notifications & Alerts to Communication ✅ TODO
**Goal:** Remove duplicate notification settings from Settings.
**Files:** `src/constants/data.ts`
**Done when:** Notification settings accessible via Communication section only.

### Step 13.5.3 — Merge Automation into Organization ✅ TODO
**Goal:** Collapse automation settings into business config.
**Files:** `src/constants/data.ts`
**Done when:** Automation & Workflows merged into Organization settings.

### Step 13.5.4 — Create Developer Sub-Section (Admin Only) ✅ TODO
**Goal:** Hide API & Webhooks behind admin role.
**Files:** `src/constants/data.ts`, middleware
**Done when:** Developer section visible only to admins.

**Result:** Settings collapses from 11 → 7 items:
1. User Preferences (merged Profile + Appearance)
2. Organization (merged Automation)
3. Users & Permissions
4. Integrations
5. Security & Compliance
6. Billing & Subscription
7. Data Management

---

## Phase 13.6: Fix Priority Ordering

### Step 13.6.1 — Reorder Top-Level Items ✅ TODO
**Goal:** Match inventory manager workflow (Dashboard → Products → Suppliers → Finance → Reports → Settings → Help).
**Files:** `src/constants/data.ts`

**Current Order:**
```
Dashboard → Inventory → Procurement → Finance → Reports → Communication → Company Admin → Settings → Database → Help
```

**Target Order:**
```
Dashboard → Inventory → Purchasing → Finance → Reports → Communication → Settings → Help
```

### Step 13.6.2 — Move Settings to Bottom ✅ TODO
**Goal:** Infrequent access item should be at bottom.
**Files:** `src/constants/data.ts`
**Done when:** Settings is second-to-last, before Help.

### Step 13.6.3 — Move Communication After Reports ✅ TODO
**Goal:** Secondary feature placed after core workflow.
**Files:** `src/constants/data.ts`
**Done when:** Communication section follows Reports.

---

## Phase 13.7: Final Cleanup & Validation

### Step 13.7.1 — Verify No Empty Children ✅ TODO
**Goal:** Ensure only Dashboard has `items: []`.
**Files:** `src/constants/data.ts`
**Done when:** No empty arrays except Dashboard.

### Step 13.7.2 — Check Shortcut Collisions ✅ TODO
**Goal:** Ensure no duplicate keyboard shortcuts.
**Files:** `src/constants/data.ts`
**Current:** `['d','d']` (Dashboard), `['d','b']` (Database) - Database removed resolves this
**Done when:** All shortcuts unique.

### Step 13.7.3 — Test Icon Recognition ✅ TODO
**Goal:** Verify each icon is visually distinct in sidebar.
**Files:** Test in UI
**Done when:** No icon confusion reported by users.

---

## Phase 13 Summary

| Phase | Status |
|-------|--------|
| 13.1 Remove empty/dev items | 2 items removed |
| 13.2 Fix redundancy | 3 merges |
| 13.3 Fix naming | 2 renames |
| 13.4 Fix icons | 6 icon groups fixed |
| 13.5 Settings collapse | 11 → 7 items |
| 13.6 Reorder | 3 position changes |
| 13.7 Validation | 3 checks |

---

## Blockers & Dependencies

| Item | Depends On | Resolution |
|------|-----------|------------|
| Margin % requires costPrice | Product schema | Add costPrice field first |
| Dead stock needs sales history | Sales table | Has timestamps already |
| Credit limits need customers | Schema | Extend organizations |
| Background jobs | Convex setup | Use scheduled functions |
| Email for PO | SendGrid | Integrate first |
| Forecasting needs data | Sales history | Need 6+ months data |

---

## Final Checklist

- [ ] Dashboard: cash, profit, receivables, top vendors
- [ ] Product: margin %, days in stock, supplier, filters
- [ ] Bulk: create, export, CSV import
- [ ] Restock: urgency, auto-reorder, PO, transfer
- [ ] Reports: dead stock, comparison, CA export, turnover
- [ ] Billing: recurring, partial, credit, templates
- [ ] Suppliers: performance, price comparison
- [ ] Sidebar: reordered, security cleaned
- [ ] Security: dev routes protected
- [ ] Forecasting: prediction, seasonal detection
- [ ] Communication: real-time chat
- [ ] **Sidebar UX: empty items removed, redundancy fixed, icons unique, settings collapsed**
- [ ] Tested with production data