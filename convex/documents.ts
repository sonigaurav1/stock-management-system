import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { CustomError } from '@/lib/utils';

// Shared types for better type safety
export type PaginationOptions = {
  page: number;
  pageSize: number;
};

export type ProductFilters = {
  category?: string;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
};

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
        q.eq(q.field('inStock'), filters.inStock)
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

    try {
      return await ctx.db.insert('products', {
        ...args,
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

    return await ctx.db.patch(args.id, {
      ...args.updates,
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

{
  /* ---------------------------------------------------- Category --------------------------------------------------------- */
}
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

{
  /* ---------------------------------------------------- Supplier --------------------------------------------------------- */
}
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
