# Invento Code Conventions & Naming Rules

Code style, naming conventions, design patterns, and file organization rules for Invento.

---

## 1. Naming Conventions

### TypeScript / React
- **React Components**: `PascalCase` (e.g., `ProductForm.tsx`, `SupplierTable.tsx`).
- **Hooks**: `useXxx` camelCase (e.g., `useProducts.ts`).
- **Utility Functions**: `camelCase` (e.g., `formatCurrency`, `calculateTax`).
- **Types / Interfaces**: `PascalCase` (e.g., `Product`, `SaleItem`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_PAGE_SIZE`, `MAX_ITEM_LIMIT`).

### Convex Backend Functions
- **Query Functions**: `getXxx` (e.g. `getProducts`, `getSupplierById`).
- **Mutation Functions**: `createXxx`, `updateXxx`, `deleteXxx` (e.g. `createSale`, `softDeleteProduct`).
- **Collection Names**: camelCase, singular or plural matching `convex/schema.ts` (`products`, `suppliers`, `sales`, `ledger`, `invoices`, `expenses`).
- **Fields**: camelCase (`productName`, `createdAt`, `userId`).

---

## 2. Mandatory Rules

1. **User Data Isolation (`userId`)**: Every Convex query and mutation MUST index and filter by `userId`. Unscoped queries are strictly forbidden.
2. **Soft Deletion**: Use `isDeleted: true` for soft-deleting products, categories, suppliers, and invoices. Do NOT call `ctx.db.delete()`.
3. **No `any` Types**: Always specify TypeScript types or use Convex-generated types (`Doc<"products">`, `Id<"products">`).
4. **Toast Error Handling**: Pair backend error handling with `toast.error(...)` and `console.error(...)`.
5. **No Super-Admin Role**: Use `admin` as the top-level role string (`super-admin` is removed).

---

## 3. Related Links
- **Code Patterns**: [CODE-PATTERNS.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/CODE-PATTERNS.md)
- **Design System**: [Design.md](file:///Users/gaurav/Desktop/Invento/Design.md)
