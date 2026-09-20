# Authentication & User Data Scoping Feature Guide

> **Module**: `AUTH`  
> **Primary Responsibility**: User identity verification, authentication sessions, and `userId` data isolation across all database queries.

---

## 1. Executive Summary

The **AUTH** feature manages user identity authentication via **Clerk** and enforces user-level data isolation across the entire Convex backend.

### Key Architectural Directives
- **Authentication**: Managed via Clerk (`@clerk/nextjs`). Clerk handles sign-in, sign-up, session tokens, and user metadata.
- **Convex Auth Context**: Passed to Convex functions via `ConvexProviderWithClerk`.
- **User Data Isolation (`userId`)**: Every database record in Invento is associated with a `userId` string. Clerk Organizations are **NOT** used.
- **Role-Based Access Control**: Users are assigned roles (`admin`, `inventory_manager`, `billing_staff`, `accountant`) stored in user settings or metadata. Note: The `super-admin` role is replaced by `admin`.

---

## 2. Authentication Flow & Data Scoping

```
Client Browser
   │
   ▼
Clerk Identity Provider  ──(JWT Token)──►  ConvexProviderWithClerk
                                                 │
                                                 ▼
                                     Convex Server Context (ctx.auth)
                                                 │
                                                 ▼
                                     const identity = await ctx.auth.getUserIdentity();
                                     const userId = identity.subject;
                                                 │
                                                 ▼
                                     Filter queries using userId index
```

---

## 3. Mandatory Backend Code Pattern

Every Convex query and mutation MUST verify identity and scope database calls using `userId`:

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMyProducts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    return await ctx.db
      .query("products")
      .withIndex("by_user_and_isDeleted", (q) =>
        q.eq("userId", identity.subject).eq("isDeleted", false)
      )
      .collect();
  },
});
```

---

## 4. Key Files & Components

- `src/app/(auth)/sign-in/`: Sign-in page route.
- `src/app/(auth)/sign-up/`: Sign-up page route.
- `src/features/auth/`: Auth hooks and identity wrappers.
- `convex/admin.ts`: User role management and account verification functions.
- `convex/schema.ts`: Database schema definitions with `userId` indexes.

---

## 5. Related Links
- **Product Catalog**: [PRODUCTS.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/PRODUCTS.md)
- **Admin & Access Control**: [ADMIN_RBAC.md](file:///Users/gaurav/Desktop/Invento/Documentation/features/ADMIN_RBAC.md)
- **Project Rules**: [Rules.md](file:///Users/gaurav/Desktop/Invento/Rules.md)
