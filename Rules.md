# Invento - AI Development Rules & Guardrails

> **Document Type**: AI Guidelines & Project Governance Rules  
> **Target Audience**: AI Development Agents, Software Engineers, Code Reviewers  
> **Project Name**: Invento (Inventory & Business Management System)  
> **Repository**: `sonigaurav1/stock-management-system`  

---

## 🧭 Documentation Sitemap & Governance Links
- **Master Documentation Index**: [Documentation/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/README.md)
- **Documentation Governance Rules**: [Documentation/RULES.md](file:///Users/gaurav/Desktop/Invento/Documentation/RULES.md)
- **Features Technical Guides**: [Documentation/features/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/README.md)
- **System Architecture**: [Architecture.md](file:///Users/gaurav/Desktop/Invento/Architecture.md)
- **Project Requirements**: [Project Requirement Document.md](file:///Users/gaurav/Desktop/Invento/Project%20Requirement%20Document.md)

---

## 1. What To Do (Mandatory Directives)

### 1.1 Data Isolation & Scoping
- **ALWAYS scope by `userId`**: Every Convex query and mutation MUST index and filter by `userId`. Zero un-scoped queries (`ctx.db.query(...)`) are permitted. See [AUTH.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/AUTH.md).
- **Index Usage**: Always query using defined Convex indexes (e.g., `.withIndex("by_user_and_isDeleted", q => q.eq("userId", userId)...)`).

### 1.2 Auth & Permission Validation
- **Authenticate Mutations**: Every backend mutation MUST verify authentication at the top of the function:
  ```typescript
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  ```
- **RBAC Role Enforcement**: Validate user role permissions (`admin`, `inventory_manager`, `billing_staff`, `accountant`). Note: `admin` is the highest role level. See [ADMIN_RBAC.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/ADMIN_RBAC.md).

### 1.3 Data Integrity & Soft Deletes
- **Soft Deletion Policy**: Use soft deletion (`isDeleted: true`) for products, categories, suppliers, and customer entities to preserve historical transactions, invoices, and ledger records.
- **Timestamp Tracking**: Set `createdAt` on creation and update `updatedAt: Date.now()` on every patch/update mutation.

### 1.4 User Feedback & Error Handling
- **User-Facing Notifications**: Pair every backend error with user-visible toast notifications (`toast.error(...)` and `toast.success(...)`).
- **Console Error Logging**: Log full diagnostic details (`console.error("Context:", error)`) alongside user messages.

### 1.5 TypeScript & Code Conventions
- **Strict Typing**: Use explicit types or Convex-generated types (`Doc<"products">`, `Id<"products">`).
- **Naming Conventions**:
  - Components: `PascalCase` (e.g., `ProductForm.tsx`).
  - Hooks: `useXxx` camelCase (e.g., `useProducts.ts`).
  - Convex Backend Functions: `getXxx` for queries, `createXxx`, `updateXxx`, `deleteXxx` for mutations.
  - Constants: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_PAGE_SIZE`).

---

## 2. What To Avoid (Forbidden Libraries, Anti-Patterns & Boundaries)

### 2.1 Removed / Forbidden Integrations & Libraries
- ❌ **NO Clerk Organizations**: Do NOT use Clerk Organization components, hooks (`useOrganization`), or organization IDs. All scoping is per `userId`.
- ❌ **NO Super-Admin Role**: The `super-admin` role string is deprecated and removed. Use `admin` for system and business administration.
- ❌ **NO Payment Gateway / Subscription Logic**: Razorpay payments, subscription tiers, and subscription status logic have been removed. Do NOT re-introduce payment SDKs or billing tier gating.
- ❌ **NO Twilio or Slack Webhooks**: Do NOT import or configure Twilio SMS or Slack notification webhooks. Use **SendGrid** for email notifications only.

### 2.2 Forbidden Coding Practices & Anti-Patterns
- ❌ **NO `any` Types**: Never use `any` in TypeScript files.
- ❌ **NO Hard Deletes**: Never call `ctx.db.delete(id)` on transactional domain entities (products, sales, suppliers, invoices).
- ❌ **NO Silent Failure**: Never write empty `catch` blocks or swallow backend errors without alerting the user via toast/logs.
- ❌ **NO Manual Refetch Polling**: Do NOT use `setInterval` or manual polling in React components. Rely on Convex real-time subscription hooks (`useQuery`).
- ❌ **NO Unverified Schema Assumptions**: Never guess table names, field types, or index names without inspecting `convex/schema.ts`.

---

## 3. Workflow Rules for AI Assistants

1. **Check Context Before Editing**:
   - Inspect existing implementation and `convex/schema.ts` before creating or editing Convex backend functions.
2. **Preserve API Contracts**:
   - When modifying a function signature, search for and update all invocation sites across the frontend.
3. **Verify Build & Type Safety**:
   - Run type checking / build verification (`pnpm run build` or `pnpm run lint`) to ensure no breaking compiler errors are introduced.
4. **Follow Project Architecture & Documentation Rules**:
   - Refer to `AI_INSTRUCTIONS.md`, `Project Requirement Document.md`, `Architecture.md`, and [Documentation/RULES.md](file:///Users/gaurav/Desktop/Invento/Documentation/RULES.md) as primary sources of architectural and documentation governance truth.