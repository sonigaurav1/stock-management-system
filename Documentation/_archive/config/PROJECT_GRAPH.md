# Project Graph - Compressed Reference

**Optimized project structure for efficient context loading (~500 tokens).**

## 🏗️ System Architecture

```
Frontend (Next.js)  →  Backend (Convex)  →  Database
```

## 📦 8 Core Modules

| Module | Files | Responsibility | Key Operations |
|--------|-------|---|---|
| AUTH | src/features/auth/, convex/admin.ts | Identity, orgs, roles | Sign-up, Sign-in |
| PRODUCTS | convex/products.ts, src/app/.../product/ | Inventory | Create, update, list |
| SUPPLIERS | convex/suppliers.ts, src/app/.../supplier/ | Vendors | CRUD, tracking |
| SALES | convex/sales.ts, src/app/.../restock/ | Orders | Create, track sales |
| LEDGER | convex/ledger.ts, src/app/.../ledger/ | Finances | Record, balance |
| BILLING | convex/billing.ts, src/app/.../billing/ | Payments | Invoice, Razorpay |
| ADMIN | convex/admin.ts, src/app/admin/ | Admin | System control |
| ORGANIZATIONS | convex/organizations.ts | Multi-tenant | Org mgmt |

## 🔗 Module Dependencies
AUTH → ORGANIZATIONS → All other modules

## 📁 File Structure
```
convex/{module}.ts → Backend queries/mutations
src/app/{route}/page.tsx → Frontend pages
src/components/ → React components
src/features/auth/ → Auth logic
```

## 🗂️ Data Models
- **products**: sku, quantity, price
- **sales**: customer, items[], total
- **suppliers**: name, terms, rating
- **invoices**: saleId, amount, status
- **ledger**: type, category, amount
- **payments**: razorpayId, status
- **organizations**: name, members[]

## 🔑 Key Patterns
- ✅ Always filter queries by `organization`
- ✅ Naming: `getXxx`, `createXxx`, `updateXxx`
- ✅ Multi-tenant isolation mandatory
- ✅ Soft deletes with `deletedAt`

## 🚀 Tech Stack
- Frontend: Next.js 16, React 19, TypeScript, Tailwind
- Backend: Convex
- Auth: Clerk
- Payments: Razorpay

## ⚡ 5-Phase Workflow
1. CONTEXT (graph tools)
2. DOCUMENTATION (read guides)
3. IMPACT ANALYSIS (check breaks)
4. IMPLEMENT (code)
5. REVIEW (self-review)

---
**Size**: 4 KB (~500 tokens) | **For**: AI & Dev Context
