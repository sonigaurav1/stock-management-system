# Project context (single source)

**Use this file first** in any chat or agent run: `@PROJECT_CONTEXT.md` or paste “Follow `PROJECT_CONTEXT.md`.” It replaces re-explaining stack, layout, and tenancy.

## Product

SaaS **inventory + billing + ledger + reporting** for businesses. Next.js app with Convex backend and Clerk auth. Large surface: dashboards, automation, compliance-style widgets, settings, marketing pages.

## Stack

| Layer | Tech |
|--------|------|
| App | Next.js 15 (App Router), React 19, TypeScript |
| Backend | Convex (queries/mutations, `convex/schema.ts`) |
| Auth | Clerk (`@clerk/nextjs`); `publicMetadata.role` used in places (`useUserRole`: Admin/Editor/User) |
| UI | Tailwind, shadcn/Radix (`src/components/ui/*`), `PageContainer`, `AppSidebar` |
| Data fetching | `convex/react` `useQuery` / `useMutation`; `api` from `convex/_generated/api` |

**Scripts:** `pnpm dev` / `npm run dev` → `next dev --turbopack`; `npm run convex` → `convex dev`; `npm run build`.

## Tenancy & IDs (critical)

- Most business tables use **`userId: string`** = **Clerk `identity.subject`** (signed-in user). Queries filter with `.withIndex('by_user', …)` (or `by_user_and_isDeleted`, etc.).
- **`organizations` / `organizationMembers`** exist (`convex/organizations.ts`) but **core inventory/finance rows are not keyed by `organizationId`**; org features are partial.
- **`teamManagement`** (roles, teams, members, activity, approval workflows) scopes the same way: tenant = `identity.subject`. Permissions are **not yet enforced** on legacy mutations app-wide—gates live in `convex/teamManagement.ts` for approvals/team flows only unless you wire checks elsewhere.

## Repo layout (where to look)

```
src/app/                    # App Router
  (auth)/                   # sign-in, verify, company-details
  (main)/(authenticated)/   # main app: dashboard, inventory, billing, ledger, settings, …
  (marketing)/              # landing, legal
  (developer-admin-page)/   # admin
src/features/               # domain UI (auth, billing, settings, teams, …)
src/components/             # shared UI, layout, dashboard widgets
src/constants/data.ts       # sidebar `navItems` (primary nav)
convex/
  schema.ts                 # all tables (large)
  *.ts                      # one module per domain (see below)
```

## Convex modules ↔ domains (read `convex/<name>.ts`)

| Area | Files (non-exhaustive) |
|------|-------------------------|
| Catalog | `products`, `categories`, `suppliers` |
| Sales & payments | `sales`, `payments`, `billing` |
| Accounting | `ledger`, `expenses`, `profitAndLoss`, `cashFlow`, `budget`, `financialForecasting`, `forecasting` |
| Company | `companyDetails`, `settings`, `integrations`, `notifications`, `dashboardConfig`, `dashboardExport` |
| Ops / automation | `automation`, `inventoryOptimization`, `reporting`, `insights`, `dashboard` |
| Risk / compliance | `compliance`, `auditLog`, `customerIntelligence` |
| Platform | `api`, `admin`, `tests`, `verification`, `auth.config.ts` |
| Multi-location | `locations` (sites, `locationInventory`, dashboard/sync/report queries), `stockTransfers` (inter-site moves + `stockMovements` type `transfer`) |
| Enterprise teams | `teamManagement` (custom roles, teams, members, activity, approval workflows/requests) |
| Org (partial) | `organizations` |

**Schema:** `convex/schema.ts` (single `defineSchema`). `schema.additions.ts` may exist for extensions—confirm before editing if split.

## Frontend routing (high level)

- **Authenticated shell:** `src/app/(main)/(authenticated)/layout.tsx` + sidebar from `navItems` in `src/constants/data.ts`.
- **Settings:** under `/settings/*` (profile, organization, **users** `/settings/users`, security, api, automation, billing, data, …). Nested `settings/layout.tsx` is a **subset** nav (profile/account/appearance…); many links live only in **App sidebar**, not that inner nav.
- **Auth:** Clerk middleware/proxy patterns under `src/proxy.ts` (and related)—check when adding routes.

## Patterns & conventions

- **Soft delete:** common fields `isDeleted`, indexes `by_user_and_isDeleted`.
- **Convex auth:** `const identity = await ctx.auth.getUserIdentity();` then `identity.subject` as `userId` for reads/writes.
- **UI:** match existing shadcn usage; `PageContainer` for page wrappers; toasts: `sonner` (`Toaster` in root layout).
- **Types:** Convex `Id<'tableName'>` from `_generated/dataModel`; `api.teamManagement.*` etc.

## Documentation (organized, Apr 2026)

**Root project files** (essential):
- `PROJECT_CONTEXT.md` — single source of truth (this file)
- `CLAUDE.md` — AI development guidance + MCP tools
- `README.md` — main project readme
- `TODO.md` — active todo list

**`Documentation/` structure** (all other docs):

| Folder | Contents |
|--------|----------|
| `getting-started/` | START_HERE.md, README.md, QUICK_START.md, DEVELOPER_QUICK_REFERENCE.md, INDEX.md, ONBOARDING_SOLUTION.md, AUTO_LOAD_SETUP.md |
| `reference/` | ARCHITECTURE.md, DATABASE-SCHEMA.md, MODULES.md, CONVENTIONS.md, CODE-PATTERNS.md, API-GUIDE.md, IMPLEMENTATION_SUMMARY.md, SYSTEM_SETUP_SUMMARY.md, COMPLETE_SYSTEM_DOCUMENTATION.md, TESTING_VALIDATION_CHECKLIST.md, FINAL_COMPLETE_SUMMARY.md |
| `enterprise/` | ENTERPRISE_ARCHITECTURE.md, ENTERPRISE_FEATURES.md, ENTERPRISE_GUIDE.md, ENTERPRISE_ROADMAP.md, ENTERPRISE_SIGNUP_*.md, ORGANIZATION_*.md |
| `tools/` | AGENT_GUIDE.md, AI_WORKFLOW.md, TROUBLESHOOTING.md, WORKSPACE_INSTRUCTIONS_README.md |
| `features/` | Feature-specific docs: SIGNUP_FLOW_IMPLEMENTATION.md, FORM_VS_OAUTH_PERMANENT_SOLUTION.md, ROLE_BASED_SYSTEM.md, PRODUCTION_SIGNUP_FLOW_V2.md, etc. |
| `setup/` | SETUP_DEPLOYMENT.md (deployment, CI/CD, environments) |
| `guides/` | Various implementation guides (e.g., backup/restore, communication) |
| `modules/` | Per-module deep-dives (one `.md` per domain) |
| `overview/` | System design & high-level architecture |
| `config/` | Configuration & environment documentation |
| `decisions/` | Architecture Decision Records (ADRs) |
| `templates/` | Reusable documentation templates |
| `Phase1_1/`, `Phase1_2/` | Phase-specific roadmaps & delivery specs |
| `Archive/` | Legacy docs (old checklists, old patterns, old implementations) |

**Tip:** Start in `getting-started/` for new developers; reference `ARCHITECT.md` for system design; check `reference/CODE-PATTERNS.md` for copy-paste patterns.

## When implementing features

1. Decide **tenant key** (`userId` vs org)—default today is **per Clerk user**.
2. Add/extend **`convex/schema.ts`** + module in `convex/*.ts`; run **`npx convex codegen`**.
3. Wire UI under **`src/app/(main)/(authenticated)/...`** or `src/features/...`; add **`navItems`** if it should appear in the main sidebar.
4. For **RBAC enforcement**, reuse permission strings from `src/features/teams/permissionCatalog.ts` and centralize checks (mutations or shared helper)—do not duplicate ad hoc strings everywhere.

## Known gaps (do not assume done)

- Clerk **roles metadata** vs Convex **customRoles** are separate; not unified.
- **Cross-user** same-tenant access (member logs in, sees owner’s inventory) needs RLS + session tenant selection—not fully modeled.
- **PriceAudit.tsx** (or similar) may have pre-existing TS/JSX issues—run `tsc` before release.
## Session changes (Apr 22, 2026)

**Documentation reorganization:**
- **Moved 28 root `Documentation/*.md` files** into 5 new organized folders: `getting-started/`, `reference/`, `enterprise/`, `tools/`, `legacy/`
- **Moved 13 project root `.md` files** (e.g., ONBOARDING_SOLUTION.md, IMPLEMENTATION_SUMMARY.md, SIGNUP_FLOW_*) into `Documentation/{getting-started,reference,features}/`
- **Preserved 4 core files in project root:** PROJECT_CONTEXT.md, CLAUDE.md, README.md, TODO.md
- Result: Clean root, organized docs by audience/purpose (getting started → reference → enterprise → tools)
## Token-efficient prompt template

```
Follow PROJECT_CONTEXT.md. Task: <one sentence>.
Constraints: <files/areas to touch or avoid>.
```

Refresh this file when you add major tables, auth changes, or new primary routes.
