import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

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

// Get paginated products (excluding deleted ones)
export const getPaginatedProducts = query({
  args: {
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

    const { page, pageSize } = args.paginationOptions;

    const products = await ctx.db
      .query('products')
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .filter((q) => q.eq(q.field('userId'), userId)) // Exclude deleted products and filter by user
      .collect();

    const startIndex = (page - 1) * pageSize;
    const paginatedProducts = products.slice(startIndex, startIndex + pageSize);

    return {
      products: paginatedProducts,
      totalPages: Math.ceil(products.length / pageSize),
      currentPage: page
    };
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
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .filter((q) => q.eq(q.field('userId'), userId)); // Exclude deleted products and filter by user

    if (filters?.category) {
      productsQuery = productsQuery.filter((q) =>
        q.eq(q.field('category'), filters.category?.toLowerCase())
      );
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      (productsQuery as any) = productsQuery.withIndex(
        'by_purchasePrice',
        (q: any) => {
          let priceQuery = q;
          if (filters.minPrice !== undefined)
            priceQuery = priceQuery.gte('price', filters.minPrice);
          if (filters.maxPrice !== undefined)
            priceQuery = priceQuery.lte('price', filters.maxPrice);
          return priceQuery;
        }
      );
    }

    if (filters?.inStock !== undefined) {
      productsQuery = productsQuery.filter((q) =>
        q.eq(q.field('inStock'), filters.inStock)
      );
    }

    let products = await productsQuery.collect();

    if (filters?.searchTerm) {
      const searchTerms = filters.searchTerm.toLowerCase().split(' ');
      products = products.filter((product) => {
        const searchableText =
          `${product.name} ${product.description} ${product.category}`.toLowerCase();
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
    category: v.string(),
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

    const { category, paginationOptions } = args;
    const { page, pageSize } = paginationOptions;

    const allProducts = await ctx.db
      .query('products')
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .filter((q) => q.eq(q.field('userId'), userId)) // Exclude deleted products and filter by user
      .collect();

    const filteredProducts = allProducts.filter(
      (product) => product.category.toLowerCase() === category.toLowerCase()
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

// Search products
export const searchProducts = query({
  args: {
    searchTerm: v.string(),
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

    const { searchTerm, paginationOptions } = args;
    const { page, pageSize } = paginationOptions;

    const allProducts = await ctx.db
      .query('products')
      .filter((q) => q.eq(q.field('isDeleted'), false)) // Exclude deleted products
      .filter((q) => q.eq(q.field('userId'), userId)) // Filter by user
      .collect();

    const filteredProducts = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
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
    category: v.string(),
    subcategory: v.optional(v.string()),
    description: v.optional(v.string()),
    brand: v.optional(v.string()),
    purchasePrice: v.number(),
    sellingPrice: v.number(),
    discountPrice: v.optional(v.number()),
    stockLevel: v.number(),
    inStock: v.boolean(),
    reorderLevel: v.optional(v.number()),
    stockStatus: v.union(
      v.literal('in_stock'),
      v.literal('low_stock'),
      v.literal('out_of_stock')
    ),
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

    // Restrict user with userId 'user_2tY8CVHIeOOfjq4zSkJkPRQ2CXi' to create only 10 products
    if (userId === 'user_2tY8CVHIeOOfjq4zSkJkPRQ2CXi') {
      const userProductsCount = await ctx.db
        .query('products')
        .filter((q) => q.eq(q.field('userId'), userId))
        .collect();
      if (userProductsCount.length >= 10) {
        const errorMessage =
          'You have reached the limit of 10 active products.';
        // eslint-disable-next-line no-console
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    }

    return await ctx.db.insert('products', {
      ...args,
      userId, // Associate product with user
      isDeleted: false, // New products start as active
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
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
      category: v.optional(v.string()),
      subcategory: v.optional(v.string()),
      description: v.optional(v.string()),
      brand: v.optional(v.string()),
      purchasePrice: v.optional(v.number()),
      sellingPrice: v.optional(v.number()),
      discountPrice: v.optional(v.number()),
      stockLevel: v.optional(v.number()),
      inStock: v.optional(v.boolean()),
      reorderLevel: v.optional(v.number()),
      stockStatus: v.union(
        v.literal('in_stock'),
        v.literal('low_stock'),
        v.literal('out_of_stock')
      ),
      supplierId: v.optional(v.string()),
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

// Create new category
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

    // Restrict user with userId 'user_2tY8CVHIeOOfjq4zSkJkPRQ2CXi' to create only 10 active categories
    if (userId === 'user_2tY8CVHIeOOfjq4zSkJkPRQ2CXi') {
      const activeCategoryCount = await ctx.db
        .query('category')
        .filter((q) => q.eq(q.field('userId'), userId))
        .filter((q) => q.eq(q.field('isDeleted'), false))
        .collect();

      if (activeCategoryCount.length >= 10) {
        const errorMessage =
          'You have reached the limit of 10 active categories.';
        // eslint-disable-next-line no-console
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    }

    try {
      return await ctx.db.insert('category', {
        ...args,
        userId, // Associate category with user
        isDeleted: false, // New categories start as active
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    } catch (error) {
      throw error;
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
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .filter((q) => q.eq(q.field('userId'), userId)) // Exclude deleted categories and filter by user
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

    let categoryQuery = ctx.db
      .query('category')
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .filter((q) => q.eq(q.field('userId'), userId)); // Exclude deleted categories and filter by user

    if (filters?.searchTerm) {
      const searchTerms = filters.searchTerm.toLowerCase().split(' ');
      categoryQuery = categoryQuery.filter((category: any) => {
        const searchableText =
          `${category.name} ${category.description}`.toLowerCase();
        return searchTerms.every((term) => searchableText.includes(term));
      });
    }

    const categories = await categoryQuery.collect();

    const totalCount = categories.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedCategories = categories.slice(
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
    phone: v.string(),
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

    // Restrict user with userId 'user_2tY8CVHIeOOfjq4zSkJkPRQ2CXi' to create only 10 active suppliers
    if (userId === 'user_2tY8CVHIeOOfjq4zSkJkPRQ2CXi') {
      const activeSuppliersCount = await ctx.db
        .query('suppliers')
        .filter((q) => q.eq(q.field('userId'), userId))
        .filter((q) => q.eq(q.field('isDeleted'), false))
        .collect();

      if (activeSuppliersCount.length >= 10) {
        const errorMessage =
          'You have reached the limit of 10 active suppliers.';
        // eslint-disable-next-line no-console
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
    }

    return await ctx.db.insert('suppliers', {
      ...args,
      userId, // Associate supplier with user
      isDeleted: false, // New suppliers start as active
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
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
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .filter((q) => q.eq(q.field('userId'), userId)) // Exclude deleted suppliers and filter by user
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

    let supplierQuery = ctx.db
      .query('suppliers')
      .filter((q) => q.eq(q.field('isDeleted'), false))
      .filter((q) => q.eq(q.field('userId'), userId)); // Exclude deleted suppliers and filter by user

    if (filters?.searchTerm) {
      const searchTerms = filters.searchTerm.toLowerCase().split(' ');
      supplierQuery = supplierQuery.filter((supplier: any) => {
        const searchableText =
          `${supplier.name} ${supplier.phone} ${supplier.address}`.toLowerCase();
        return searchTerms.every((term) => searchableText.includes(term));
      });
    }

    const suppliers = await supplierQuery.collect();

    const totalCount = suppliers.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedSuppliers = suppliers.slice(
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
