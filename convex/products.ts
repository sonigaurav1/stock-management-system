import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { CustomError } from '@/lib/utils';

// Get all products (excluding deleted ones)
export const getAllProducts = query({
  handler: async (ctx) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const products = await ctx.db
      .query('products')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();
    return products;
  }
});

// Main product query with filtering and pagination
export const getFilteredProducts = query({
  args: {
    paginationOptions: v.object({
      page: v.number(),
      pageSize: v.number()
    }),
    filters: v.optional(
      v.object({
        category: v.optional(v.string()),
        searchTerm: v.optional(v.string()),
        minPrice: v.optional(v.number()),
        maxPrice: v.optional(v.number()),
        inStock: v.optional(v.boolean())
      })
    )
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();

    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const { page, pageSize } = args.paginationOptions;
    const { filters } = args;

    let productsQuery = ctx.db
      .query('products')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      );

    if (filters?.category) {
      productsQuery = productsQuery.filter((q) =>
        q.eq(q.field('categoryId'), filters.category?.toLowerCase())
      );
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      (productsQuery as any) = productsQuery.filter((q: any) => {
        let priceQuery = q;
        if (filters.minPrice !== undefined)
          priceQuery = priceQuery.gte(q.field('price'), filters.minPrice);
        if (filters.maxPrice !== undefined)
          priceQuery = priceQuery.lte(q.field('price'), filters.maxPrice);
        return priceQuery;
      });
    }

    if (filters?.inStock !== undefined) {
      productsQuery = productsQuery.filter((q: any) =>
        q.and(
          q.or(q.eq(q.field('inStock'), true), q.eq(q.field('inStock'), false)),
          q.or(
            q.eq(q.field('stockStatus'), 'low_stock'),
            q.eq(q.field('stockStatus'), 'out_of_stock')
          )
        )
      );
    }

    let products = await productsQuery.collect();

    if (filters?.searchTerm) {
      const searchTerms = filters.searchTerm.toLowerCase().split(' ');
      products = products.filter((product) => {
        const searchableText =
          `${product.name} ${product.description} ${product.categoryName}`.toLowerCase();
        return searchTerms.every((term) => searchableText.includes(term));
      });
    }

    const totalCount = products.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedProducts = products.slice(startIndex, startIndex + pageSize);

    return {
      products: paginatedProducts,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      totalItems: totalCount
    };
  }
});

// Get products by category
export const getProductsByCategory = query({
  args: {
    categoryName: v.string(),
    paginationOptions: v.object({
      page: v.number(),
      pageSize: v.number()
    })
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const { categoryName, paginationOptions } = args;
    const { page, pageSize } = paginationOptions;

    const allProducts = await ctx.db
      .query('products')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    const filteredProducts = allProducts.filter(
      (product) =>
        product.categoryName.toLowerCase() === categoryName.toLowerCase()
    );

    const startIndex = (page - 1) * pageSize;
    const paginatedProducts = filteredProducts.slice(
      startIndex,
      startIndex + pageSize
    );

    return {
      products: paginatedProducts,
      totalPages: Math.ceil(filteredProducts.length / pageSize),
      currentPage: page
    };
  }
});

// Get product by ID
export const getProductById = query({
  args: { id: v.id('products') },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const product = await ctx.db.get(args.id);

    if (!product) {
      return null;
    }

    return product?.isDeleted || product?.userId !== userId ? null : product; // Return null if deleted or not owned by user
  }
});

// Create new product
export const createProduct = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    sku: v.string(),
    barcode: v.optional(v.string()),
    categoryName: v.string(),
    categoryId: v.string(),
    subcategory: v.optional(v.string()),
    description: v.optional(v.string()),
    serialNumber: v.optional(v.string()),
    brand: v.optional(v.string()),
    purchasePrice: v.optional(v.string()),
    sellingPrice: v.optional(v.number()),
    stockLevel: v.optional(v.number()),
    inStock: v.boolean(),
    reorderLevel: v.optional(v.number()),
    stockStatus: v.union(
      v.literal('in_stock'),
      v.literal('low_stock'),
      v.literal('out_of_stock')
    ),
    supplierName: v.optional(v.string()),
    supplierId: v.optional(v.string()),
    lastRestockedAt: v.optional(v.number()),
    imageUrl: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    // Automatically set inStock and stockStatus based on stockLevel and reorderLevel
    let inStock = args.inStock;
    let stockStatus = args.stockStatus;

    if (args.stockLevel !== undefined && args.reorderLevel !== undefined) {
      if (args.stockLevel > args.reorderLevel) {
        inStock = true;
        stockStatus = 'in_stock';
      } else if (args.stockLevel === args.reorderLevel) {
        inStock = true;
        stockStatus = 'low_stock';
      }
    }

    try {
      return await ctx.db.insert('products', {
        ...args,
        inStock,
        stockStatus,
        userId, // Associate category with user
        isDeleted: false, // New categories start as active
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error while creating product:', error);
      throw new CustomError('Failed to create product', 400);
    }
  }
});

// Update product by ID
export const updateProduct = mutation({
  args: {
    id: v.id('products'),
    updates: v.object({
      name: v.optional(v.string()),
      slug: v.optional(v.string()),
      sku: v.optional(v.string()),
      barcode: v.optional(v.string()),
      categoryName: v.optional(v.string()),
      categoryId: v.optional(v.string()),
      subcategory: v.optional(v.string()),
      description: v.optional(v.string()),
      serialNumber: v.optional(v.string()),
      brand: v.optional(v.string()),
      purchasePrice: v.optional(v.string()),
      sellingPrice: v.optional(v.number()),
      stockLevel: v.optional(v.number()),
      inStock: v.optional(v.boolean()),
      reorderLevel: v.optional(v.number()),
      stockStatus: v.union(
        v.literal('in_stock'),
        v.literal('low_stock'),
        v.literal('out_of_stock')
      ),
      supplierId: v.optional(v.string()),
      supplierName: v.optional(v.string()),
      lastRestockedAt: v.optional(v.number()),
      imageUrl: v.optional(v.string())
    })
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const existingProduct = await ctx.db.get(args.id);
    if (!existingProduct || existingProduct.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Automatically set inStock and stockStatus based on stockLevel and reorderLevel
    let updates = { ...args.updates };
    if (
      updates.stockLevel !== undefined &&
      updates.reorderLevel !== undefined
    ) {
      if (updates.stockLevel > updates.reorderLevel) {
        updates.inStock = true;
        updates.stockStatus = 'in_stock';
      } else if (updates.stockLevel === updates.reorderLevel) {
        updates.inStock = true;
        updates.stockStatus = 'low_stock';
      } else {
        updates.inStock = false;
        updates.stockStatus = 'out_of_stock';
      }
    }

    return await ctx.db.patch(args.id, {
      ...updates,
      updatedAt: Date.now()
    });
  }
});

// Soft delete product by setting `isDeleted` to true
export const deleteProduct = mutation({
  args: { id: v.id('products') },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const existingProduct = await ctx.db.get(args.id);
    if (!existingProduct || existingProduct.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return await ctx.db.patch(args.id, {
      isDeleted: true, // Soft delete instead of actual deletion
      updatedAt: Date.now() // Track deletion time
    });
  }
});

// Restore soft-deleted product
export const restoreProduct = mutation({
  args: { id: v.id('products') },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const existingProduct = await ctx.db.get(args.id);
    if (!existingProduct || existingProduct.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return await ctx.db.patch(args.id, {
      isDeleted: false,
      updatedAt: Date.now()
    });
  }
});

export default mutation(async ({ db }) => {
  const products = await db.query('products').collect(); // Fetch all products

  for (const product of products) {
    await db.patch(product._id, {
      purchasePrice: undefined,
      discountPrice: undefined,
      barcode: undefined
    }); // Empty the column
  }
});
