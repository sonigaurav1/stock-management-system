# Invento Code Patterns & Implementation Catalog

Reusable code patterns for React UI components, Shadcn UI data tables, forms, and Convex backend functions.

---

## 1. Convex Backend Query Pattern with `userId` Scoping

```typescript
import { query } from "./_generated/server";
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

## 2. Convex Backend Mutation Pattern with Auth Guard & Soft Delete

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const softDeleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const product = await ctx.db.get(args.productId);
    if (!product || product.userId !== identity.subject) {
      throw new Error("Unauthorized or product not found");
    }

    await ctx.db.patch(args.productId, {
      isDeleted: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
```

---

## 3. Frontend Form Submission Pattern with Toast Error Handling

```typescript
"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ProductForm() {
  const createProduct = useMutation(api.products.createProduct);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createProduct({
        name: "New Item",
        sku: "SKU-1004",
        categoryName: "Electronics",
        categoryId: "cat-01",
        isDeleted: false,
        createdAt: Date.now(),
      });
      toast.success("Product created successfully!");
    } catch (error) {
      toast.error("Failed to create product. Please try again.");
      console.error("Product Creation Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Product"}
      </Button>
    </form>
  );
}
```

---

## 4. Related Links
- **Code Conventions**: [CONVENTIONS.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/CONVENTIONS.md)
- **API Guide**: [API-GUIDE.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/API-GUIDE.md)
