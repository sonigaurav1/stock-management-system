# Quick Start

Get oriented with Invento in 5 minutes.

## What is Invento?

Inventory Management System (SaaS) - Track products, suppliers, sales, and finances.

**Stack**: Next.js + React 19 + Convex + Clerk Auth + Razorpay Payments

## Key Facts

- **9 Modules**: AUTH, PRODUCTS, SUPPLIERS, SALES, LEDGER, BILLING, ADMIN, ORGANIZATIONS, RBAC
- **Multi-Tenant**: Every organization has isolated data
- **Real-time**: Convex subscriptions keep UI synced
- **API**: Convex queries & mutations (no REST endpoints)

## Where Are Things?

```
Frontend:  src/app/
Backend:   convex/
Styles:    Tailwind CSS
Database:  Convex (hosted)
Auth:      Clerk
```

## Five Core Concepts

1. **Modules**: 8 independent features (Products, Sales, etc.)
2. **Multi-Tenant**: Organization context on every query
3. **Ledger**: Financial audit trail for all changes
4. **Real-time**: Subscriptions update dashboard live
5. **Patterns**: Follow existing patterns, don't invent new ones

## First Things to Read

1. **ARCHITECTURE.md** - How the system works
2. **modules/PRODUCTS.md** - Understanding a module
3. **CODE_PATTERNS.md** - How to implement
4. **CONVENTIONS.md** - Code style

## Common Tasks

### Add a Product
→ See: modules/PRODUCTS.md
→ Pattern: CODE_PATTERNS.md (Create Product section)
→ Style: CONVENTIONS.md

### Record a Sale
→ See: modules/SALES.md
→ Pattern: CODE_PATTERNS.md (Record Sale section)
→ Ledger: Check LEDGER.md for financial entry

### Deploy
→ See: setup/DEPLOYMENT.md

### Debug an Error
→ See: TROUBLESHOOTING.md

## Project Graph (For AI)

AI Assistants: Load `config/PROJECT_GRAPH.md` (~500 tokens)
→ Gives you instant project understanding
→ Don't need to read 50 pages of docs

## Next Steps

- **Setting up?** → setup/ONBOARDING.md
- **Learning codebase?** → ARCHITECTURE.md
- **Building a feature?** → CODE_PATTERNS.md
- **Need reference?** → INDEX.md (this folder)

---

**Location**: documentation/QUICK_START.md
**Updated**: 2024-04-22
