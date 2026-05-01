import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { CustomError } from '@/lib/utils';
import {
  resolveCallerContext,
  requirePermission,
  getDataScopeUserId
} from './lib/authHelper';
import { PERMISSIONS } from './lib/permissions';

export type SupplierFilters = {
  searchTerm?: string;
};

// Create new supplier
export const createSupplier = mutation({
  args: {
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    imageUrl: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SUPPLIERS);
    const userId = getDataScopeUserId(caller);

    try {
      return await ctx.db.insert('suppliers', {
        ...args,
        userId, // Associate category with user
        isDeleted: false, // New categories start as active
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating suppliers:', error);
      throw new CustomError('Failed to create suppliers', 400);
    }
  }
});

// Update supplier by ID
export const updateSupplier = mutation({
  args: {
    id: v.id('suppliers'),
    updates: v.object({
      name: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      address: v.optional(v.string()),
      imageUrl: v.optional(v.string())
    })
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SUPPLIERS);
    const userId = getDataScopeUserId(caller);

    const existingSupplier = await ctx.db.get(args.id);
    if (!existingSupplier || existingSupplier.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Update the supplier
    await ctx.db.patch(args.id, {
      ...args.updates,
      updatedAt: Date.now()
    });

    // If the supplier name is updated, update the supplierName field in associated products
    if (args.updates.name) {
      const associatedProducts = await ctx.db
        .query('products')
        .withIndex('by_user_and_isSupplier', (q) =>
          q.eq('supplierId', args.id).eq('isDeleted', false)
        )
        .collect();

      for (const product of associatedProducts) {
        await ctx.db.patch(product._id, {
          supplierName: args.updates.name,
          updatedAt: Date.now()
        });
      }
    }

    return await ctx.db.patch(args.id, {
      ...args.updates,
      updatedAt: Date.now()
    });
  }
});

// Soft delete suppliers by setting `isDeleted` to true
export const deleteSupplier = mutation({
  args: { id: v.id('suppliers') },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SUPPLIERS);
    const userId = getDataScopeUserId(caller);

    const existingSupplier = await ctx.db.get(args.id);
    if (!existingSupplier || existingSupplier.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const associatedProducts = await ctx.db
      .query('products')
      .withIndex('by_user_and_isSupplier', (q) =>
        q.eq('supplierId', args.id).eq('isDeleted', false)
      )
      .collect();

    if (associatedProducts.length > 0) {
      throw new CustomError(
        'Cannot delete supplier associated with products',
        400
      );
    }

    return await ctx.db.patch(args.id, {
      isDeleted: true, // Soft delete instead of actual deletion
      updatedAt: Date.now() // Track deletion time
    });
  }
});

// Restore soft-deleted suppliers
export const restoreSupplier = mutation({
  args: { id: v.id('suppliers') },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SUPPLIERS);
    const userId = getDataScopeUserId(caller);

    const existingSupplier = await ctx.db.get(args.id);
    if (!existingSupplier || existingSupplier.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return await ctx.db.patch(args.id, {
      isDeleted: false,
      updatedAt: Date.now()
    });
  }
});

// Get all suppliers
export const getAllSuppliers = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);
    const userId = getDataScopeUserId(caller);

    const suppliers = await ctx.db
      .query('suppliers')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();
    return suppliers;
  }
});

// Get suppliers by ID
export const getSupplierById = query({
  args: { id: v.id('suppliers') },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);
    const userId = getDataScopeUserId(caller);

    const supplier = await ctx.db.get(args.id);
    return supplier?.isDeleted || supplier?.userId !== userId ? null : supplier; // Return null if deleted or not owned by user
  }
});

// getFilteredSupplier
export const getFilteredSupplier = query({
  args: {
    paginationOptions: v.object({
      page: v.number(),
      pageSize: v.number()
    }),
    filters: v.optional(
      v.object({
        searchTerm: v.optional(v.string())
      })
    )
  },
  handler: async (ctx, args) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_INVENTORY);
    const userId = getDataScopeUserId(caller);

    const { page, pageSize } = args.paginationOptions;
    const { filters } = args;

    let supplierQuery = await ctx.db
      .query('suppliers')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    let filteredSuppliers = supplierQuery;

    if (filters?.searchTerm) {
      const searchTerms = filters.searchTerm.toLowerCase().split(' ');
      filteredSuppliers = supplierQuery.filter((supplier: any) => {
        const searchableText =
          `${supplier.name} ${supplier.phone} ${supplier.address}`.toLowerCase();
        return searchTerms.every((term) => searchableText.includes(term));
      });
    }

    const totalCount = filteredSuppliers.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedSuppliers = filteredSuppliers.slice(
      startIndex,
      startIndex + pageSize
    );

    return {
      suppliers: paginatedSuppliers,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      totalItems: totalCount
    };
  }
});

// Get supplier metrics for dashboard
export const getSupplierMetrics = query({
  handler: async (ctx) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);

    const suppliers = await ctx.db
      .query('suppliers')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    // Get all products to calculate supplier usage
    const products = await ctx.db
      .query('products')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    // Count products per supplier
    const supplierProductCount = new Map<string, number>();
    products.forEach((product) => {
      if (product.supplierId) {
        supplierProductCount.set(
          product.supplierId,
          (supplierProductCount.get(product.supplierId) ?? 0) + 1
        );
      }
    });

    // Calculate active suppliers (those with products)
    const activeSuppliersCount = Array.from(
      supplierProductCount.values()
    ).filter((count) => count > 0).length;

    // Get suppliers sorted by usage
    const suppliersByUsage = suppliers
      .map((supplier) => ({
        ...supplier,
        productCount: supplierProductCount.get(supplier._id) ?? 0
      }))
      .sort((a, b) => b.productCount - a.productCount);

    // Top suppliers
    const topSuppliers = suppliersByUsage.slice(0, 3);

    return {
      totalSuppliers: suppliers.length,
      activeSuppliers: activeSuppliersCount,
      topSuppliers,
      suppliersByUsage
    };
  }
});

// STEP 8.3: Get Supplier Performance Metrics
export const getSupplierPerformance = query({
  args: { supplierId: v.id('suppliers') },
  handler: async (ctx, { supplierId }) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.VIEW_REPORTS);
    const userId = getDataScopeUserId(caller);

    const supplier = await ctx.db.get(supplierId);
    if (!supplier || supplier.userId !== userId) {
      throw new Error('Supplier not found');
    }

    const totalOrders = supplier.totalOrders || 0;
    const onTimeDeliveries = supplier.onTimeDeliveries || 0;
    const lateDeliveries = supplier.lateDeliveries || 0;

    // Calculate on-time delivery percentage
    let onTimePercent = 0;
    if (totalOrders > 0) {
      onTimePercent = Math.round((onTimeDeliveries / totalOrders) * 100);
    }

    return {
      supplierId,
      supplierName: supplier.name,
      totalOrders,
      onTimeDeliveries,
      lateDeliveries,
      onTimePercent,
      averageLeadTimeDays: supplier.averageLeadTimeDays || 0,
      lastOrderDate: supplier.lastOrderDate
    };
  }
});

// Update supplier performance metrics after purchase order delivery
export const updateSupplierPerformance = mutation({
  args: {
    supplierId: v.id('suppliers'),
    wasOnTime: v.boolean(),
    leadTimeDays: v.number()
  },
  handler: async (ctx, { supplierId, wasOnTime, leadTimeDays }) => {
    const caller = await resolveCallerContext(ctx);
    requirePermission(caller, PERMISSIONS.MANAGE_SUPPLIERS);
    const userId = getDataScopeUserId(caller);

    const supplier = await ctx.db.get(supplierId);
    if (!supplier || supplier.userId !== userId) {
      throw new Error('Supplier not found');
    }
    const currentTotalOrders = supplier.totalOrders || 0;
    const currentOnTime = supplier.onTimeDeliveries || 0;
    const currentLate = supplier.lateDeliveries || 0;
    const currentAvgLeadTime = supplier.averageLeadTimeDays || 0;

    // Update metrics
    const newTotalOrders = currentTotalOrders + 1;
    const newOnTime = wasOnTime ? currentOnTime + 1 : currentOnTime;
    const newLate = wasOnTime ? currentLate : currentLate + 1;

    // Recalculate average lead time
    const newAvgLeadTime = Math.round(
      (currentAvgLeadTime * currentTotalOrders + leadTimeDays) / newTotalOrders
    );

    await ctx.db.patch(supplierId, {
      totalOrders: newTotalOrders,
      onTimeDeliveries: newOnTime,
      lateDeliveries: newLate,
      averageLeadTimeDays: newAvgLeadTime,
      lastOrderDate: Date.now(),
      updatedAt: Date.now()
    });
  }
});
