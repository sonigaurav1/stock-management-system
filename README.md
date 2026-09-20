# Invento - Inventory & Business Management System

Effortlessly manage your business inventory, multi-supplier sourcing, sales transactions, GST tax invoicing, financial ledgers, expenses, and procurement with Invento.

---

## 📚 Central Documentation Suite

👉 **[Master Documentation Index (Documentation/README.md)](file:///Users/gaurav/Desktop/Invento/Documentation/README.md)**

### Core System Documents
- 📋 **[Project Requirement Document.md](file:///Users/gaurav/Desktop/Invento/Project%20Requirement%20Document.md)** - System specifications & functional requirements.
- 🏛️ **[Architecture.md](file:///Users/gaurav/Desktop/Invento/Architecture.md)** - System architecture, subsystem data flows & tech stack matrix.
- 🛡️ **[Rules.md](file:///Users/gaurav/Desktop/Invento/Rules.md)** - Mandatory AI directives, prohibitions, and guardrails.
- 🎨 **[Design.md](file:///Users/gaurav/Desktop/Invento/Design.md)** - Design system tokens, OLED dark theme variables, and typography scale.
- 🧠 **[Memory.md](file:///Users/gaurav/Desktop/Invento/Memory.md)** - Feature completion status and architectural decisions log.
- 🤖 **[AI_INSTRUCTIONS.md](file:///Users/gaurav/Desktop/Invento/AI_INSTRUCTIONS.md)** - AI development guide and operating system.

### Feature Technical Documentation (`Documentation/features/`)
- 🔐 **[AUTH.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/AUTH.md)** - Clerk authentication & `userId` data scoping.
- 📦 **[PRODUCTS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PRODUCTS.md)** - Product catalog, SKUs, barcodes, categories, and auto-reorder alerts.
- 🚚 **[SUPPLIERS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SUPPLIERS.md)** - Supplier directory, multi-supplier mapping (`productSuppliers`), and lead times.
- 🛒 **[SALES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/SALES.md)** - Sales transactions, inventory decrementing, and stock movement logs.
- 📄 **[BILLING.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/BILLING.md)** - GST Tax Invoicing, downloadable PDF invoices, and recurring customer billing.
- 📒 **[LEDGER.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/LEDGER.md)** - Double-entry financial audit trail, customer receivables, and supplier payables.
- 💵 **[EXPENSES.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/EXPENSES.md)** - Expense tracking, EdgeStore receipts, and category budgets.
- 📦 **[PROCUREMENT.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PROCUREMENT.md)** - Purchase Orders (POs), restock mutations, and vendor receiving.
- 🔍 **[INVENTORY_AUDIT.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/INVENTORY_AUDIT.md)** - Physical stock count audits and discrepancy reconciliation.
- 🛡️ **[ADMIN_RBAC.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/ADMIN_RBAC.md)** - System administration, role hierarchy (`admin` role top-level), and security audit logs.

### App Pages & Routes (`Documentation/pages/`)
- 🗺️ **[APP_ROUTES.md](file:///Users/gaurav/Desktop/Invento/Documentation/pages/APP_ROUTES.md)** - Map of all 75+ Next.js 16 App Router pages and API endpoints.
- ⚡ **[PAGE_CONTEXT.md](file:///Users/gaurav/Desktop/Invento/Documentation/pages/PAGE_CONTEXT.md)** - Component & Convex data hook dependencies per page route.

---

## 🚀 Technologies Used

- **Frontend**: Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI, Shadcn UI
- **State Management**: Convex Real-Time React Hooks, Zustand
- **Backend & Database**: Convex Server Functions & Reactive Database
- **Authentication**: Clerk (User identity & `userId` database isolation)
- **Asset Storage**: EdgeStore
- **Notifications**: SendGrid (Email)
- **Document Engine**: jsPDF, jsPDF-AutoTable
- **Date Handling**: date-fns, Bikram Sambat JS

---

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sonigaurav1/stock-management-system.git
   cd Invento
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env.local` and set your Clerk, Convex, and EdgeStore API keys.

4. **Start the Convex backend & Next.js development server**:
   ```bash
   pnpm run convex
   pnpm run dev
   ```

---

## 📜 Available Scripts

- `pnpm run dev` - Starts the Next.js local development server.
- `pnpm run build` - Builds the application for production.
- `pnpm run start` - Starts the production server.
- `pnpm run lint` - Runs ESLint code checks.
- `pnpm run format` - Formats code via Prettier.
- `pnpm run convex` - Starts the Convex development environment.
