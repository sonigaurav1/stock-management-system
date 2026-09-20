# System Troubleshooting & Diagnostic Guide

Common developer & operational issues and their step-by-step solutions for Invento.

---

## 1. Development & Build Issues

### 1.1 Convex Connection Failed
**Problem**: Client application cannot connect to Convex development server.

**Solution**:
```bash
# 1. Restart Convex dev process
pnpm run convex

# 2. Verify NEXT_PUBLIC_CONVEX_URL in .env.local
cat .env.local | grep CONVEX

# 3. Clear Convex deployment cache if needed
rm -rf .convex/
pnpm run convex
```

---

### 1.2 Type Errors in Convex Functions (`_generated/api.d.ts`)
**Problem**: TypeScript throws missing function property errors on `api.xxx.yyy`.

**Solution**:
```bash
# Force regeneration of Convex API types
rm -f convex/_generated/api.d.ts
pnpm run convex
```

---

### 1.3 Real-time Subscription Not Updating UI
**Problem**: Data modifications do not push live state to React components.

**Solution**:
Ensure components consume `useQuery(api.xxx.yyy)` directly without hardcoding skip logic that freezes subscriptions:
```typescript
// ✓ Correct: Reactively updates when backend changes
const products = useQuery(api.products.getMyProducts);

// ✗ Incorrect: Do NOT pass manual refetch promises
```

---

## 2. Authentication & Data Scoping Issues

### 2.1 Unauthenticated Mutation Error (`"Unauthenticated"`)
**Problem**: Convex backend mutation throws `"Unauthenticated"`.

**Solution**:
Verify that `ConvexProviderWithClerk` wraps the component tree in `src/app/layout.tsx` and that the user's Clerk JWT session token is active.

---

### 2.2 Data Scoping Leakage Prevention
**Problem**: Seeing data from another tenant or seeing empty data.

**Solution**:
Confirm every backend query filters by `userId` index (`by_user_and_isDeleted`). Invento does NOT use Clerk Organizations. All scoping is strictly by `userId`.

---

## 3. Related Links
- **Master Sitemap**: [Documentation/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/README.md)
- **AI Rules & Guardrails**: [Rules.md](file:///Users/gaurav/Desktop/Invento/Rules.md)
