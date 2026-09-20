# Invento Central Documentation Suite

Welcome to the **Invento Central Documentation Suite**. This directory is the single source of truth for technical architecture, feature guides, page routes, database schema references, and developer guidelines.

---

## 📁 Documentation Folder Structure (6 Core Folders)

```
Documentation/
├── README.md                  # Master Documentation Sitemap & Index (This File)
├── INDEX.md                   # Task-and-Domain Quick Lookup Table
├── RULES.md                   # Documentation Governance & Maintenance Rules
│
├── features/                  # 12 Technical Feature & Troubleshooting Guides
├── pages/                     # App Router Page Maps & Route Matrices
├── reference/                 # System Architecture, Database Schema & Conventions
├── setup/                     # Local Quick Start & Environment Variables
├── templates/                 # Architecture & Feature Templates
└── _archive/                  # Preserved Historical & Obsolete Documentation
```

---

## 📜 Documentation Governance Rules
- ⚖️ **[Documentation Rules (RULES.md)](file:///Users/gaurav/Desktop/Invento/Documentation/RULES.md)** — Mandatory directives for AI agents and developers to maintain, structure, update, and archive documentation in the future.

---

## 🧭 Master Sitemap & Navigation Index

### 📦 1. Feature Technical Guides (`Documentation/features/`)
Deep dives into business logic, database collections, and backend functions:
- 🔐 **[AUTH.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/AUTH.md)** — User authentication, JWT session tokens, and `userId` database data isolation.
- 📦 **[PRODUCTS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PRODUCTS.md)** — Product catalog, SKUs, barcodes, HSN/SAC codes, stock level status, auto-reorder alerts, and soft deletes.
- 🚚 **[SUPPLIERS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SUPPLIERS.md)** — Supplier directory, multi-supplier mapping (`productSuppliers`), lead times, and vendor metrics.
- 🛒 **[SALES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SALES.md)** — Sales order processing, inventory decrementing, and `stockMovements` audit log.
- 📄 **[BILLING.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/BILLING.md)** — GST Tax Invoice generation (`jsPDF`), downloadable PDF invoices, and recurring customer billing schedules.
- 📒 **[LEDGER.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/LEDGER.md)** — Double-entry financial audit trail, customer receivables, supplier payables, and account balance sheets.
- 💵 **[EXPENSES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/EXPENSES.md)** — Expense tracking, receipt image uploads via EdgeStore, and category budget approvals.
- 📦 **[PROCUREMENT.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PROCUREMENT.md)** — Purchase orders (POs), restock mutations, supplier receiving, and inventory reconciliations.
- 🔍 **[INVENTORY_AUDIT.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/INVENTORY_AUDIT.md)** — Physical stock count audits and discrepancy logging.
- 🛡️ **[ADMIN_RBAC.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/ADMIN_RBAC.md)** — System administration, role hierarchy (`admin` role top-level), and security audit logs.
- 🛠️ **[TROUBLESHOOTING.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/TROUBLESHOOTING.md)** — Step-by-step solutions for development, Convex type generation, and auth issues.

### 🌐 2. App Routes & Page Mapping (`Documentation/pages/`)
- 🗺️ **[APP_ROUTES.md](file:///Users/gaurav/Desktop/Invento/Documentation/pages/APP_ROUTES.md)** — Route index map of all 75+ Next.js 16 App Router pages and API endpoints.
- ⚡ **[PAGE_CONTEXT.md](file:///Users/gaurav/Desktop/Invento/Documentation/pages/PAGE_CONTEXT.md)** — Page context map linking routes to UI components and Convex hooks.

### 🏛️ 3. Core System References (`Documentation/reference/`)
- 📐 **[ARCHITECTURE.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/ARCHITECTURE.md)** — High-level system design, subsystem flow diagrams, and tech stack matrix.
- 🗄️ **[DATABASE_SCHEMA.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/DATABASE_SCHEMA.md)** — Convex database schema definitions, collection structures, and index rules.
- 🧩 **[CODE-PATTERNS.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/CODE-PATTERNS.md)** — Reusable code patterns for React UI forms, Shadcn UI data tables, and Convex mutations.
- 📏 **[CONVENTIONS.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/CONVENTIONS.md)** — File naming rules, TypeScript standards, and Tailwind CSS design tokens.
- ⚡ **[API-GUIDE.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/API-GUIDE.md)** — Convex API query/mutation patterns, backend argument validation, and auth guards.
- 📦 **[MODULES.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/MODULES.md)** — Technical module descriptions and responsibilities overview.
- 🛡️ **[RBAC.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/RBAC.md)** — System role hierarchy, permission catalog, and code permission guards.

### ⚙️ 4. Setup & Environment (`Documentation/setup/`)
- 🚀 **[QUICK_START.md](file:///Users/gaurav/Desktop/Invento/Documentation/setup/QUICK_START.md)** — Local environment installation and development setup instructions.
- 🔑 **[ENV-VARS.md](file:///Users/gaurav/Desktop/Invento/Documentation/setup/ENV-VARS.md)** — Environment variable configuration for Clerk, Convex, EdgeStore, and SendGrid.

---

## 📌 Root Governance Documents
- 📋 **[Project Requirement Document.md](file:///Users/gaurav/Desktop/Invento/Project%20Requirement%20Document.md)** — Product specifications.
- 🏗️ **[Architecture.md](file:///Users/gaurav/Desktop/Invento/Architecture.md)** — App flow & high-level design specification.
- 🛡️ **[Rules.md](file:///Users/gaurav/Desktop/Invento/Rules.md)** — Mandatory AI directives, prohibitions, and guardrails.
- 🎨 **[Design.md](file:///Users/gaurav/Desktop/Invento/Design.md)** — Design system tokens, OLED theme variables, and typography scale.
- 🧠 **[Memory.md](file:///Users/gaurav/Desktop/Invento/Memory.md)** — Feature completion status and architectural decisions log.
- 🤖 **[AI_INSTRUCTIONS.md](file:///Users/gaurav/Desktop/Invento/AI_INSTRUCTIONS.md)** — AI assistant workflow guide.
