# Workspace Instructions for Inventory Management System

**Reference**: Always start with `@PROJECT_CONTEXT.md` when implementing features.

## Stack & Architecture

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/Radix UI (`src/components/ui/*`)
- **Backend**: Convex (queries/mutations in `convex/*.ts`)
- **Authentication**: Clerk (`@clerk/nextjs`); user identity via `identity.subject`
- **Database**: Convex (schema in `convex/schema.ts`)
- **Package Manager**: pnpm (use `pnpm install`, `pnpm run dev`, etc.)

## Key Principles

### 1. Tenancy Model (Critical)
- **Single-tenant per Clerk user**: Most business tables use `userId: string` = Clerk `identity.subject`
- Queries filter with `.withIndex('by_user', ...)` or `.withIndex('by_user_and_isDeleted', ...)`
- Do NOT assume `organizationId` for core inventory/finance rows—org features are partial
- When adding new tables, default to `userId` unless explicitly co-owned

### 2. Soft Deletes
- Use `isDeleted: boolean = false` on tables that need cleanup/reversibility
- Add indexes like `by_user_and_isDeleted` to efficiently query active rows
- Example: `convex/products.ts` uses `.eq('isDeleted', false)` in queries

### 3. Authentication & Permissions
- Get user via `const identity = await ctx.auth.getUserIdentity();`
- Use `identity.subject` as the `userId` for all mutations/queries
- For role-based access: check `identity.publicMetadata.role` (Admin/Editor/User) when needed
- Permission catalog: `src/features/teams/permissionCatalog.ts`—reuse strings, don't duplicate ad hoc values

### 4. UI & Styling Patterns
- **Page Container**: Wrap pages in `<PageContainer>` (standardizes layout)
- **Sidebar Navigation**: Edit `src/constants/data.ts` → add to `navItems` array
- **Settings Layout**: Nested routes under `/settings/*` have their own layout subset (`navitems` only for account/profile/appearance)
- **Toasts**: Use `sonner` package (`Toaster` in root layout, `toast.success()` / `toast.error()` in components)

### 5. Data Fetching & Mutations
- Use `convex/react`: `useQuery(api.module.function, args)`, `useMutation(api.module.mutation)`
- Import types from `convex/_generated/api` and `convex/_generated/dataModel`
- Keep mutation logic in `convex/*.ts`; keep UI in `src/features/*.tsx` or `src/app/**/*.tsx`

## Folder Structure & What Lives Where

```
src/app/                          # App Router pages
  (auth)/                         #   sign-in, verify, company-details
  (main)/(authenticated)/         #   main app: dashboard, inventory, billing, ledger, settings, …
  (marketing)/                    #   landing, legal, docs
  (developer-admin-page)/         #   admin

src/features/                     # Domain-specific features & UI
  auth/                           #   authentication UI & helpers
  billing/                        #   billing & payments UI
  settings/                       #   settings pages & forms
  teams/                          #   team management, roles, activity
  [domain]/                       #   one folder per domain

src/components/                   # Shared, reusable UI
  ui/                             #   shadcn/Radix primitives
  layout/                         #   layout wrappers (PageContainer, AppSidebar, etc.)
  dashboard/                      #   dashboard widgets & charts

src/constants/                    # Config, enums, data
  data.ts                         #   navItems, sidebar config

src/lib/                          # Utility functions, helpers

src/types/                        # Shared TypeScript types

convex/                           # Backend (queries, mutations, schema)
  schema.ts                       #   all table definitions
  auth.config.ts                  #   auth setup
  [domain].ts                     #   one module per domain (see Convex Modules table in PROJECT_CONTEXT.md)
```

## Common Tasks

### Adding a New Feature

1. **Define schema** → Edit `convex/schema.ts` (or new `convex/[feature].ts`)
   - Add new table with `defineTable()` + indexes
   - Run `npx convex codegen` to regenerate TypeScript types

2. **Add mutations & queries** → `convex/[feature].ts`
   - Use `await ctx.auth.getUserIdentity()` for auth
   - Filter by `userId` (or other tenancy key)
   - Export as `mutation`, `query`, `action`

3. **Add UI** → `src/features/[feature]/` or `src/app/(main)/(authenticated)/[feature]/`
   - Import `useQuery` / `useMutation` from `convex/react`
   - Import `api` from `convex/_generated/api`
   - Handle loading/error states with `data`, `isLoading`, `error`

4. **Add navigation** (if top-level page) → `src/constants/data.ts`
   - Add item to `navItems` array with `label`, `icon`, `href`

5. **Test** → Run both dev servers:
   - Terminal 1: `pnpm run convex` (Convex dev server)
   - Terminal 2: `pnpm run dev` (Next.js dev server)

### Styling a Component

- Import Tailwind classes or use shadcn/Radix components from `src/components/ui/`
- For custom components, follow existing shadcn patterns (className + cn utility)
- Check `tailwind.config.js` for theme tokens (colors, spacing, fonts)
- Use dark mode classes (e.g., `dark:bg-slate-900`)

### Modifying Settings or Permissions

- **Roles/Permissions**: Reference `src/features/teams/permissionCatalog.ts`
- **Team Management**: Check `convex/teamManagement.ts` for approval/role workflows
- **User Metadata**: Update Clerk via dashboard or API; sync via `identity.publicMetadata` in mutations

### Debugging Hydration Issues

- **Symptom**: `aria-controls` or `id` values differ between server & client (e.g., `radix-_R_...` mismatch)
- **Cause**: Auth-based conditionals remove/add Radix menu/popover DOM trees between SSR and client render
- **Fix**: Keep stable DOM structure; use guest fallbacks instead of `user && <Menu/>` in server components
- **Reference**: `@userMemory` debugging.md

## Documentation Linked (Don't Duplicate)

- **Project Overview**: Read [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md) — covers stack, tenancy, patterns, known gaps
- **Onboarding Path**: See [`Documentation/DEVELOPER_QUICK_REFERENCE.md`](../Documentation/DEVELOPER_QUICK_REFERENCE.md) — 1-week learning path
- **Architecture Deep-Dive**: [`Documentation/ENTERPRISE_ARCHITECTURE.md`](../Documentation/ENTERPRISE_ARCHITECTURE.md) — system design, data model, API design
- **Enterprise Features**: [`Documentation/ENTERPRISE_FEATURES.md`](../Documentation/ENTERPRISE_FEATURES.md) — feature inventory
- **Setup & Deployment**: [`Documentation/SETUP_DEPLOYMENT.md`](../Documentation/SETUP_DEPLOYMENT.md) — environment, CI/CD, production
- **Roadmap & Phases**: [`Documentation/ENTERPRISE_ROADMAP.md`](../Documentation/ENTERPRISE_ROADMAP.md) — timelines, priorities
- **Phase-Specific Docs**: [`Documentation/Phase1_1/`](../Documentation/Phase1_1/) and [`Documentation/Phase1_2/`](../Documentation/Phase1_2/) — feature specs per phase

## Build & Run Commands

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install dependencies |
| `pnpm run dev` | Start Next.js dev server (port 3000) |
| `pnpm run convex` | Start Convex dev server |
| `pnpm run build` | Build for production |
| `pnpm run lint` | Run ESLint |
| `pnpm run lint:fix` | Fix linting errors |
| `pnpm run format` | Format with Prettier |

## Known Gaps (Do Not Assume Done)

- Clerk **roles metadata** vs Convex **customRoles** are separate (not unified)
- Cross-user same-tenant access (member logs in, sees owner's inventory) needs RLS—not fully modeled
- Org features partially implemented; most rows keyed by `userId` not `organizationId`
- Permission checks not enforced app-wide; live only in `convex/teamManagement.ts` for approval flows

## When Stuck or Uncertain

1. **Architecture question?** → `@PROJECT_CONTEXT.md` (stack, tenancy, modules) or `Documentation/ENTERPRISE_ARCHITECTURE.md`
2. **Feature spec?** → `Documentation/ENTERPRISE_FEATURES.md` or phase-specific docs under `Documentation/Phase1_*/`
3. **Setup/deployment?** → `Documentation/SETUP_DEPLOYMENT.md`
4. **New team member?** → `Documentation/DEVELOPER_QUICK_REFERENCE.md` (1-week learning path)
5. **Convex schema or auth?** → `convex/schema.ts`, existing modules like `convex/products.ts`, `convex/teamManagement.ts`

---

**Last Updated**: April 18, 2026
