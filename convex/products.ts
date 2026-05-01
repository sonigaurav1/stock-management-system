import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { CustomError } from '@/lib/utils';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

// Get all products (excluding deleted ones)
// Now with RBAC - staff can only see owner's products
export const getAllProducts = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);

    // Use ownerId instead of callerId - staff sees owner's data
    const userId = getDataScopeUserId(caller);

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
        inStock: v.optional(v.boolean()),
        stockStatus: v.optional(v.array(v.string())),
        brand: v.optional(v.array(v.string()))
      })
    )
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);

    const userId = getDataScopeUserId(caller);
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

    // Post-filter by stock status
    if (filters?.stockStatus && filters.stockStatus.length > 0) {
      products = products.filter((p) =>
        filters.stockStatus!.includes(p.stockStatus)
      );
    }

    // Post-filter by brand
    if (filters?.brand && filters.brand.length > 0) {
      products = products.filter(
        (p) => p.brand && filters.brand!.includes(p.brand)
      );
    }

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

    // STEP 2.2-2.3: Add margin and daysInStock to each product
    // Also STEP 2.1: Get cost code mapping for decoding
    const settings = await ctx.db
      .query('organizationSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();
    const costCodeMapping = settings?.costCodeMapping || [];
    const costCodeEnabled = settings?.costCodeEnabled || false;

    // Helper: decode cost code (same logic as frontend utility)
    function decodeCostCodeValue(encodedCost: string): number {
      if (!costCodeEnabled || costCodeMapping.length === 0) {
        const parsed = parseFloat(encodedCost);
        return isNaN(parsed) ? 0 : parsed;
      }
      const digitChars: string[] = [];
      let remaining = (encodedCost || '').toUpperCase();
      while (remaining.length > 0) {
        let matched = false;
        for (let len = remaining.length; len >= 1; len--) {
          const substr = remaining.substring(0, len);
          const entry = costCodeMapping.find((e: any) =>
            e.codes.some((c: string) => c.toUpperCase() === substr)
          );
          if (entry) {
            digitChars.push(entry.digit);
            remaining = remaining.substring(len);
            matched = true;
            break;
          }
        }
        if (!matched) remaining = remaining.substring(1);
      }
      if (digitChars.length === 0) {
        const parsed = parseFloat(encodedCost);
        return isNaN(parsed) ? 0 : parsed;
      }
      return parseFloat(digitChars.join('')) || 0;
    }

    const enrichedProducts = products.map((product: any) => {
      // STEP 2.1: Decode cost using mapping if enabled
      const costPrice = decodeCostCodeValue(product.purchasePrice);

      const sellingPrice = product.sellingPrice || 0;
      let marginPercent = 0;

      if (sellingPrice > 0 && costPrice > 0) {
        marginPercent = ((sellingPrice - costPrice) / costPrice) * 100;
      } else if (sellingPrice > 0 && costPrice === 0) {
        marginPercent = 100;
      }

      const createdAt = product.createdAt || Date.now();
      const daysInStock = Math.floor(
        (Date.now() - createdAt) / (1000 * 60 * 60 * 24)
      );

      return {
        ...product,
        costPrice,
        marginPercent: Math.round(marginPercent * 100) / 100,
        daysInStock
      };
    });

    const paginatedProducts = enrichedProducts.slice(
      startIndex,
      startIndex + pageSize
    );

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
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);
    const userId = getDataScopeUserId(caller);

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
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);
    const userId = getDataScopeUserId(caller);

    const product = await ctx.db.get(args.id);

    if (!product) {
      return null;
    }

    // Allow access if product belongs to user or team owner
    return product?.isDeleted || product?.userId !== userId ? null : product;
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
    // RBAC: Use resolveCallerContext for proper owner/staff separation
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.CREATE_PRODUCT);

    // Use getDataScopeUserId to get the correct userId (owner's userId for staff)
    const userId = getDataScopeUserId(caller);

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

      const locs = await ctx.db
        .query('locations')
        .withIndex('by_user', (q) => q.eq('userId', userId))
        .collect();
      const active = locs.filter((l) => l.isActive);
      const def =
        active.find((l) => l.isDefault) ??
        active.sort((a, b) => a.sortOrder - b.sortOrder)[0];
      if (def) {
        const ts = Date.now();
        await ctx.db.insert('locationInventory', {
          userId,
          productId: String(productId),
          locationId: def._id,
          quantity: args.stockLevel ?? 0,
          updatedAt: ts
        });
      }

      // Log activity for audit trail
      // await logActivity(
      //   ctx as unknown as LogActivityContext,
      //   'product_created',
      //   {
      //     productId: productId as Id<'products'>,
      //     userId,
      //     productName: args.name
      //   }
      // );

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

// /**
//  * Logs activity for audit purposes
//  * @param {Object} ctx - Database context
//  * @param {string} action - Activity type
//  * @param {Object} data - Activity data
//  */
// async function logActivity(
//   ctx: LogActivityContext,
//   action: string,
//   data: LogActivityData
// ): Promise<void> {
//   try {
//     await ctx.db.insert('activity_logs', {
//       action,
//       data,
//       timestamp: Date.now()
//     });
//   } catch (error) {
//     // eslint-disable-next-line no-console
//     console.warn('Failed to log activity:', error);
//   }
// }

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
      imageUrl: v.optional(v.string()),
      hsnsacCode: v.optional(v.string()) // HSN/SAC code for GST
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

// Bulk create products
export const createProducts = mutation({
  args: {
    products: v.array(
      v.object({
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
        inStock: v.optional(v.boolean()),
        stockStatus: v.optional(
          v.union(
            v.literal('in_stock'),
            v.literal('low_stock'),
            v.literal('out_of_stock')
          )
        ),
        reorderLevel: v.optional(v.number()),
        imageUrl: v.optional(v.string()),
        supplierName: v.optional(v.string()),
        supplierId: v.optional(v.string())
      })
    )
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }
    const userId = identity.subject;

    const results: Array<{
      index: number;
      status: string;
      message?: string;
      id?: string;
      name?: string;
    }> = [];
    let successCount = 0;
    let errorCount = 0;

    // Get user's locations for default inventory
    const locs = await ctx.db
      .query('locations')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    const active = locs.filter((l) => l.isActive);
    const defaultLocation =
      active.find((l) => l.isDefault) ??
      active.sort((a, b) => a.sortOrder - b.sortOrder)[0];

    for (let i = 0; i < args.products.length; i++) {
      const product = args.products[i];
      try {
        // Validate required fields
        if (!product.name || !product.sku || !product.categoryId) {
          throw new Error('Missing required fields: name, sku, categoryId');
        }

        if (product.stockLevel !== undefined && product.stockLevel < 0) {
          throw new Error('Stock level cannot be negative');
        }

        if (product.reorderLevel !== undefined && product.reorderLevel < 0) {
          throw new Error('Reorder level cannot be negative');
        }

        // Compute stock status if not provided
        let stockStatus = product.stockStatus;
        if (!stockStatus && product.stockLevel !== undefined) {
          if (product.stockLevel === 0) {
            stockStatus = 'out_of_stock';
          } else if (
            product.reorderLevel &&
            product.stockLevel < product.reorderLevel
          ) {
            stockStatus = 'low_stock';
          } else {
            stockStatus = 'in_stock';
          }
        }

        const inStock =
          product.inStock ??
          (product.stockLevel !== undefined && product.stockLevel > 0);

        // Create product
        const productId = await ctx.db.insert('products', {
          ...product,
          stockStatus: stockStatus || 'in_stock',
          inStock,
          userId,
          isDeleted: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastRestockedAt: product.stockLevel ? Date.now() : undefined
        });

        // Create location inventory if location exists
        if (defaultLocation && product.stockLevel) {
          await ctx.db.insert('locationInventory', {
            userId,
            productId: String(productId),
            locationId: defaultLocation._id,
            quantity: product.stockLevel,
            updatedAt: Date.now()
          });
        }

        successCount++;
        results.push({
          index: i,
          status: 'success',
          id: String(productId),
          name: product.name
        });
      } catch (error) {
        errorCount++;
        results.push({
          index: i,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
          name: product.name
        });
      }
    }

    return {
      successCount,
      errorCount,
      totalCount: args.products.length,
      results
    };
  }
});

// Export products in various formats
export const exportProducts = query({
  args: {
    format: v.optional(
      v.union(
        v.literal('csv'),
        v.literal('json'),
        v.literal('excel'),
        v.literal('pdf')
      )
    ),
    includeDeleted: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }
    const userId = identity.subject;

    let products = await ctx.db
      .query('products')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    // Filter deleted if needed
    if (!args.includeDeleted) {
      products = products.filter((p) => !p.isDeleted);
    }

    // Return full product data for export
    const exportData = products.map((p) => ({
      id: p._id,
      name: p.name,
      sku: p.sku,
      slug: p.slug,
      barcode: p.barcode,
      serialNumber: p.serialNumber,
      categoryName: p.categoryName,
      categoryId: p.categoryId,
      subcategory: p.subcategory,
      description: p.description,
      brand: p.brand,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      discountPrice: p.discountPrice,
      stockLevel: p.stockLevel,
      inStock: p.inStock,
      reorderLevel: p.reorderLevel,
      stockStatus: p.stockStatus,
      supplierName: p.supplierName,
      supplierId: p.supplierId,
      imageUrl: p.imageUrl,
      isDeleted: p.isDeleted,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

    return {
      format: args.format || 'json',
      totalCount: exportData.length,
      products: exportData,
      exportedAt: Date.now()
    };
  }
});

// Get low stock products (stockLevel < reorderLevel)
export const getLowStockProducts = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);
    const userId = getDataScopeUserId(caller);

    const products = await ctx.db
      .query('products')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    // Filter products where stockLevel < reorderLevel
    const lowStockProducts = products
      .filter(
        (p) =>
          p.reorderLevel &&
          p.stockLevel !== undefined &&
          p.stockLevel < p.reorderLevel
      )
      .sort((a, b) => {
        // Sort by urgency: critical stockouts first, then by stock level
        const aLevel = (a.stockLevel ?? 0) - (a.reorderLevel ?? 0);
        const bLevel = (b.stockLevel ?? 0) - (b.reorderLevel ?? 0);
        return aLevel - bLevel;
      });

    return lowStockProducts;
  }
});

// Get at-risk products with forecast analysis
export const getAtRiskProducts = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);
    const userId = getDataScopeUserId(caller);

    // Get all products
    const products = await ctx.db
      .query('products')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    // Get all sales for this user (last 90 days for demand analysis)
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const recentSales = await ctx.db
      .query('sales')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect()
      .then((sales) => sales.filter((s) => s.soldAt >= ninetyDaysAgo));

    // Calculate demand velocity for each product
    const demandMap = new Map<string, number>();
    recentSales.forEach((sale) => {
      if (sale.productId) {
        demandMap.set(
          sale.productId,
          (demandMap.get(sale.productId) ?? 0) + sale.quantitySold
        );
      }
    });

    // Estimate days until stock runs out (assuming constant velocity)
    const atRiskProducts = products
      .map((product) => {
        const soldLast90Days = demandMap.get(product._id) ?? 0;
        const avgDailyDemand = soldLast90Days > 0 ? soldLast90Days / 90 : 0;
        const daysUntilStockout =
          avgDailyDemand > 0
            ? Math.ceil((product.stockLevel ?? 0) / avgDailyDemand)
            : 999;

        return {
          ...product,
          daysUntilStockout,
          avgDailyDemand,
          soldLast90Days
        };
      })
      .filter(
        (p) =>
          // Include if: near reorder level OR only days worth of stock
          (p.reorderLevel &&
            p.stockLevel !== undefined &&
            p.stockLevel < p.reorderLevel * 1.5) ||
          (p.daysUntilStockout > 0 && p.daysUntilStockout <= 14) ||
          p.stockLevel === 0
      )
      .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);

    return atRiskProducts;
  }
});

// Get audit metrics and flagged products
export const getAuditMetrics = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);
    const userId = getDataScopeUserId(caller);

    // Get all products
    const products = await ctx.db
      .query('products')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    // Get all stock movements (to detect unusual activity)
    const stockMovements = await ctx.db
      .query('stockMovements')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    // Get stock movements from last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentMovements = stockMovements.filter(
      (m) => m.createdAt >= sevenDaysAgo
    );

    // Flag products with unusual stock discrepancies
    // (large movements, or out_of_stock products with recent movements)
    const flaggedProducts = products.filter((product) => {
      const movements = recentMovements.filter(
        (m) => m.productId === product._id
      );
      const hasLargeMovement = movements.some((m) => Math.abs(m.quantity) > 10);
      const isOutOfStockWithMovements =
        (product.stockStatus === 'out_of_stock' ||
          (product.stockLevel ?? 0) === 0) &&
        movements.length > 0;

      return hasLargeMovement || isOutOfStockWithMovements;
    });

    return {
      totalProducts: products.length,
      flaggedProducts: flaggedProducts.length,
      outOfStockCount: products.filter(
        (p) => p.stockStatus === 'out_of_stock' || p.stockLevel === 0
      ).length,
      lowStockCount: products.filter(
        (p) =>
          p.reorderLevel &&
          p.stockLevel !== undefined &&
          p.stockLevel < p.reorderLevel &&
          p.stockLevel !== 0
      ).length,
      accuracy:
        products.length > 0
          ? (
              ((products.length - flaggedProducts.length) / products.length) *
              100
            ).toFixed(1)
          : '100'
    };
  }
});

// Bulk restock: Update stock levels for multiple products at once
export const bulkRestockProducts = mutation({
  args: {
    restockItems: v.array(
      v.object({
        productId: v.string(),
        quantityToAdd: v.number()
      })
    )
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const results = [];

    for (const item of args.restockItems) {
      const product = await ctx.db.get(item.productId as any);

      if (!product) {
        results.push({
          productId: item.productId,
          success: false,
          error: 'Product not found'
        });
        continue;
      }

      if ((product as any).userId !== userId) {
        results.push({
          productId: item.productId,
          success: false,
          error: 'Unauthorized'
        });
        continue;
      }

      const currentStock = (product as any).stockLevel ?? 0;
      const newStock = currentStock + item.quantityToAdd;

      // Determine new stock status
      const newStockStatus =
        newStock === 0
          ? 'out_of_stock'
          : newStock < ((product as any).reorderLevel ?? Number.MAX_VALUE)
            ? 'low_stock'
            : 'in_stock';

      await ctx.db.patch(item.productId as any, {
        stockLevel: newStock,
        inStock: newStock > 0,
        stockStatus: newStockStatus,
        lastRestockedAt: Date.now(),
        updatedAt: Date.now()
      });

      results.push({
        productId: item.productId,
        success: true,
        previousStock: currentStock,
        newStock,
        quantityAdded: item.quantityToAdd,
        productName: (product as any).name
      });
    }

    return {
      totalItems: args.restockItems.length,
      successCount: results.filter((r) => r.success).length,
      failureCount: results.filter((r) => !r.success).length,
      results
    };
  }
});

// STEP 2.2: Get Products with Margin Calculation
export const getProductsWithMargin = query({
  args: {},
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);
    const userId = getDataScopeUserId(caller);

    const products = await ctx.db
      .query('products')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    // Calculate margin for each product
    return products.map((product: any) => {
      // Parse cost price from string (could be "1000" or "HI" for coded)
      let costPrice = 0;
      if (product.purchasePrice) {
        const parsed = parseFloat(product.purchasePrice);
        if (!isNaN(parsed)) {
          costPrice = parsed;
        }
      }

      const sellingPrice = product.sellingPrice || 0;

      // Calculate margin percentage
      let marginPercent = 0;
      let marginAmount = 0;

      if (sellingPrice > 0 && costPrice > 0) {
        marginAmount = sellingPrice - costPrice;
        marginPercent = (marginAmount / costPrice) * 100;
      } else if (sellingPrice > 0 && costPrice === 0) {
        // If no cost, assume 100% margin
        marginPercent = 100;
        marginAmount = sellingPrice;
      }

      // Calculate days in stock
      const createdAt = product.createdAt || Date.now();
      const daysInStock = Math.floor(
        (Date.now() - createdAt) / (1000 * 60 * 60 * 24)
      );

      return {
        ...product,
        costPrice,
        sellingPrice,
        marginPercent: Math.round(marginPercent * 100) / 100,
        marginAmount: Math.round(marginAmount * 100) / 100,
        daysInStock
      };
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
