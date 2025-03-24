import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { CustomError } from '@/lib/utils';

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
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

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
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

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
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

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
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

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
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

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
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

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
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

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
