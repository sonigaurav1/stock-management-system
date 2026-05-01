import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * STEP 8.1: Product-Supplier Mapping
 * Allow multiple suppliers per product with different cost prices
 */

// Get all suppliers for a product
export const getProductSuppliers = query({
  args: { productId: v.id('products') },
  handler: async (ctx, { productId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    return await ctx.db
      .query('productSuppliers')
      .withIndex('by_product', (q) => q.eq('productId', productId))
      .collect();
  }
});

// Get cheapest supplier for a product
export const getCheapestSupplier = query({
  args: { productId: v.id('products') },
  handler: async (ctx, { productId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const productSuppliers = await ctx.db
      .query('productSuppliers')
      .withIndex('by_product', (q) => q.eq('productId', productId))
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const userId = identity.subject;

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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);

    if (!existing || existing.userId !== identity.subject) {
      throw new Error('Not found');
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error('Not found');
    }

    await ctx.db.delete(id);
  }
});

// Get all products with their cheapest supplier (for comparison)
export const getProductsWithCheapestSupplier = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const userId = identity.subject;

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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const productSuppliers = await ctx.db
      .query('productSuppliers')
      .withIndex('by_supplier', (q) => q.eq('supplierId', supplierId))
      .collect();

    const result = [];
    for (const ps of productSuppliers) {
      const product = await ctx.db.get(ps.productId);
      if (product) {
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
