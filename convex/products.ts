import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { CustomError } from '@/lib/utils';
import { LogActivityContext, LogActivityData } from './types';
import { Id } from './_generated/dataModel';

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

    if (filters?.category && typeof filters.category === 'string') {
      productsQuery = productsQuery.filter((q) =>
        q.eq(q.field('categoryId'), filters.category?.toLowerCase() ?? '')
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
      totalPages: Math.ceil(filteredProducts?.length ?? 0 / pageSize),
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
    purchasePrice: v.optional(v.string()), // Kept as string for privacy
    sellingPrice: v.optional(v.number()),
    stockLevel: v.optional(v.number()),
    inStock: v.optional(v.boolean()),
    stockStatus: v.union(
      v.literal('in_stock'),
      v.literal('low_stock'),
      v.literal('out_of_stock')
    ),
    reorderLevel: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    supplierName: v.optional(v.string()),
    supplierId: v.optional(v.string()),
    lastRestockedAt: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // Authentication check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }
    const userId = identity.subject;

    // Validate business rules
    if (args.stockLevel !== undefined && args.stockLevel < 0) {
      throw new CustomError('Stock level cannot be negative', 400);
    }

    if (args.reorderLevel !== undefined && args.reorderLevel < 0) {
      throw new CustomError('Reorder level cannot be negative', 400);
    }

    // if (
    //   args.purchasePrice !== undefined &&
    //   args.sellingPrice !== undefined &&
    //   parseFloat(args.purchasePrice) > args.sellingPrice
    // ) {
    //   throw new CustomError('Purchase price cannot exceed selling price', 400);
    // }

    // Compute stock status

    try {
      // Create product with computed and metadata fields
      const productId = await ctx.db.insert('products', {
        ...args,
        inStock: args.inStock ?? false, // Ensure inStock is explicitly set to a boolean
        userId,
        isDeleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // Log activity for audit trail
      await logActivity(
        ctx as unknown as LogActivityContext,
        'product_created',
        {
          productId: productId as Id<'products'>,
          userId,
          productName: args.name
        }
      );

      return productId;
    } catch (error) {
      if ((error as { code?: string }).code === 'DUPLICATE_KEY') {
        throw new CustomError(
          'A product with this SKU or slug already exists',
          409
        );
      }

      // eslint-disable-next-line no-console
      console.error('Error while creating product:', error);
      throw new CustomError('Failed to create product', 500);
    }
  }
});

/**
 * Logs activity for audit purposes
 * @param {Object} ctx - Database context
 * @param {string} action - Activity type
 * @param {Object} data - Activity data
 */
async function logActivity(
  ctx: LogActivityContext,
  action: string,
  data: LogActivityData
): Promise<void> {
  try {
    await ctx.db.insert('activity_logs', {
      action,
      data,
      timestamp: Date.now()
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to log activity:', error);
  }
}

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
      inStock: v.optional(v.boolean()), // Added inStock property
      reorderLevel: v.optional(v.number()),
      stockStatus: v.optional(
        v.union(
          v.literal('in_stock'),
          v.literal('low_stock'),
          v.literal('out_of_stock')
        )
      ), // Added stockStatus property
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

    let updates = { ...args.updates };

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
