import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { QueryCtx } from './_generated/server';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

/**
 * STEP 8.1: Product-Supplier Mapping
 * Allow multiple suppliers per product with different cost prices
 */

// Get all suppliers for a product
export const getProductSuppliers = query({
  args: { productId: v.id('products') },
  handler: async (ctx, { productId }) => {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    return await ctx.db
      .query('productSuppliers')
      .withIndex('by_product', (q) => q.eq('productId', productId))
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect();
  }
});

// Get cheapest supplier for a product
export const getCheapestSupplier = query({
  args: { productId: v.id('products') },
  handler: async (ctx, { productId }) => {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    const productSuppliers = await ctx.db
      .query('productSuppliers')
      .withIndex('by_product', (q) => q.eq('productId', productId))
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect();

    if (productSuppliers.length === 0) return null;

    // Sort by cost price and return cheapest
    const sorted = productSuppliers.sort((a, b) => a.costPrice - b.costPrice);
    const cheapest = sorted[0];

    // Get supplier details
    const supplier = await ctx.db.get(cheapest.supplierId);

    return {
      ...cheapest,
      supplierName: supplier?.name || 'Unknown',
      supplierEmail: supplier?.email || ''
    };
  }
});

// Add supplier to a product
export const addProductSupplier = mutation({
  args: {
    productId: v.id('products'),
    supplierId: v.id('suppliers'),
    costPrice: v.number(),
    supplierSku: v.optional(v.string()),
    minOrderQty: v.optional(v.number()),
    leadTimeDays: v.optional(v.number()),
    isPreferred: v.boolean()
  },
  handler: async (ctx, args) => {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SUPPLIERS);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    // If this supplier is preferred, unset other preferred suppliers for this product
    if (args.isPreferred) {
      const existing = await ctx.db
        .query('productSuppliers')
        .withIndex('by_product', (q) => q.eq('productId', args.productId))
        .collect();

      for (const ps of existing) {
        if (ps.isPreferred) {
          await ctx.db.patch(ps._id, { isPreferred: false });
        }
      }
    }

    const now = Date.now();
    const id = await ctx.db.insert('productSuppliers', {
      userId,
      productId: args.productId,
      supplierId: args.supplierId,
      costPrice: args.costPrice,
      supplierSku: args.supplierSku,
      minOrderQty: args.minOrderQty,
      leadTimeDays: args.leadTimeDays,
      isPreferred: args.isPreferred,
      createdAt: now,
      updatedAt: now
    });

    return id;
  }
});

// Update product-supplier mapping
export const updateProductSupplier = mutation({
  args: {
    id: v.id('productSuppliers'),
    costPrice: v.optional(v.number()),
    supplierSku: v.optional(v.string()),
    minOrderQty: v.optional(v.number()),
    leadTimeDays: v.optional(v.number()),
    isPreferred: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SUPPLIERS);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);

    if (!existing || existing.userId !== userId) {
      throw new Error('Product-supplier mapping not found or access denied');
    }

    // If setting as preferred, unset other preferred suppliers
    if (updates.isPreferred) {
      const all = await ctx.db
        .query('productSuppliers')
        .withIndex('by_product', (q) => q.eq('productId', existing.productId))
        .collect();

      for (const ps of all) {
        if (ps.isPreferred && ps._id !== id) {
          await ctx.db.patch(ps._id, { isPreferred: false });
        }
      }
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now()
    });
  }
});

// Remove supplier from product
export const removeProductSupplier = mutation({
  args: { id: v.id('productSuppliers') },
  handler: async (ctx, { id }) => {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SUPPLIERS);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) {
      throw new Error('Product-supplier mapping not found or access denied');
    }

    await ctx.db.delete(id);
  }
});

// Get all products with their cheapest supplier (for comparison)
export const getProductsWithCheapestSupplier = query({
  args: {},
  handler: async (ctx) => {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    const products = await ctx.db
      .query('products')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    const result = [];

    for (const product of products) {
      const productSuppliers = await ctx.db
        .query('productSuppliers')
        .withIndex('by_product', (q) => q.eq('productId', product._id))
        .collect();

      if (productSuppliers.length === 0) {
        result.push({
          product,
          cheapestSupplier: null,
          costPrice: null
        });
        continue;
      }

      // Find cheapest
      const sorted = productSuppliers.sort((a, b) => a.costPrice - b.costPrice);
      const cheapest = sorted[0];
      const supplier = await ctx.db.get(cheapest.supplierId);

      result.push({
        product,
        cheapestSupplier: supplier,
        costPrice: cheapest.costPrice,
        preferredSupplierId: productSuppliers.find((ps) => ps.isPreferred)
          ?.supplierId
      });
    }

    return result;
  }
});

// Get supplier's product list with prices
export const getSupplierProducts = query({
  args: { supplierId: v.id('suppliers') },
  handler: async (ctx, { supplierId }) => {
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

    const productSuppliers = await ctx.db
      .query('productSuppliers')
      .withIndex('by_supplier', (q) => q.eq('supplierId', supplierId))
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect();

    const result = [];
    for (const ps of productSuppliers) {
      const product = await ctx.db.get(ps.productId);
      // Only include non-deleted products
      if (product && !product.isDeleted) {
        result.push({
          ...ps,
          productName: product.name,
          productSku: product.sku
        });
      }
    }

    return result;
  }
});
