import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { CustomError } from '@/lib/utils';

export type CategoryFilters = {
  searchTerm?: string;
};

export const createCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    try {
      return await ctx.db.insert('category', {
        ...args,
        userId, // Associate category with user
        isDeleted: false, // New categories start as active
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating category:', error);
      throw new CustomError('Failed to create category', 400);
    }
  }
});

// Update category by ID
export const updateCategory = mutation({
  args: {
    id: v.id('category'),
    updates: v.object({
      name: v.optional(v.string()),
      slug: v.optional(v.string()),
      description: v.optional(v.string()),
      imageUrl: v.optional(v.string())
    })
  },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const existingCategory = await ctx.db.get(args.id);
    if (!existingCategory || existingCategory.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Update the category
    await ctx.db.patch(args.id, {
      ...args.updates,
      updatedAt: Date.now()
    });

    // If the category name is updated, update the categoryName field in associated products
    if (args.updates.name) {
      const associatedProducts = await ctx.db
        .query('products')
        .withIndex('by_user_and_isCategory', (q) =>
          q.eq('categoryId', args.id).eq('isDeleted', false)
        )
        .collect();

      for (const product of associatedProducts) {
        await ctx.db.patch(product._id, {
          categoryName: args.updates.name,
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

// Soft delete category by setting `isDeleted` to true
export const deleteCategory = mutation({
  args: { id: v.id('category') },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const existingCategory = await ctx.db.get(args.id);
    if (!existingCategory || existingCategory.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const associatedProducts = await ctx.db
      .query('products')
      .withIndex('by_user_and_isCategory', (q) =>
        q.eq('categoryId', args.id).eq('isDeleted', false)
      )
      .collect();

    if (associatedProducts.length > 0) {
      throw new CustomError(
        'Cannot delete category associated with products',
        400
      );
    }

    return await ctx.db.patch(args.id, {
      isDeleted: true, // Soft delete instead of actual deletion
      updatedAt: Date.now() // Track deletion time
    });
  }
});

// Restore soft-deleted category
export const restoreCategory = mutation({
  args: { id: v.id('category') },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const existingCategory = await ctx.db.get(args.id);
    if (!existingCategory || existingCategory.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return await ctx.db.patch(args.id, {
      isDeleted: false,
      updatedAt: Date.now()
    });
  }
});

// Get all categories
export const getAllCategories = query({
  handler: async (ctx) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const categories = await ctx.db
      .query('category')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();
    return categories;
  }
});

// Get category by ID
export const getCategoryById = query({
  args: { id: v.id('category') },
  handler: async (ctx, args) => {
    const identify = await ctx.auth.getUserIdentity();
    if (!identify) {
      throw new Error('Not authenticated');
    }
    const userId = identify.subject;

    const category = await ctx.db.get(args.id);
    return category?.isDeleted || category?.userId !== userId ? null : category; // Return null if deleted or not owned by user
  }
});

// getFilteredCategory
export const getFilteredCategory = query({
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

    let categoryQuery = await ctx.db
      .query('category')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    let filteredCategories = categoryQuery;

    if (filters?.searchTerm) {
      const searchTerms = filters.searchTerm.toLowerCase().split(' ');
      filteredCategories = categoryQuery.filter((category: any) => {
        const searchableText =
          `${category.name ?? ''} ${category.description ?? ''}`.toLowerCase();
        return searchTerms.every((term) => searchableText.includes(term));
      });
    }

    const totalCount = filteredCategories.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedCategories = filteredCategories.slice(
      startIndex,
      startIndex + pageSize
    );

    return {
      category: paginatedCategories,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      totalItems: totalCount
    };
  }
});

// searchCategory
export const searchCategory = query({
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

    let categoryQuery = await ctx.db
      .query('category')
      .withIndex('by_user_and_isDeleted', (q) =>
        q.eq('userId', userId).eq('isDeleted', false)
      )
      .collect();

    const filteredCategories = categoryQuery.filter(
      (category: any) =>
        category.name
          .toLowerCase()
          .includes(filters?.searchTerm?.toLowerCase()) ||
        category.description
          .toLowerCase()
          .includes(filters?.searchTerm?.toLowerCase())
    );

    const totalCount = filteredCategories.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedCategories = filteredCategories.slice(
      startIndex,
      startIndex + pageSize
    );

    return {
      category: paginatedCategories,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      totalItems: totalCount
    };
  }
});
