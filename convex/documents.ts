import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get paginated products
export const getPaginatedProducts = query({
  args: {
    paginationOptions: v.object({
      page: v.number(),
      pageSize: v.number()
    })
  },
  handler: async (ctx, args) => {
    const { page, pageSize } = args.paginationOptions;
    
    const products = await ctx.db
      .query("products")
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
    const { category, paginationOptions } = args;
    const { page, pageSize } = paginationOptions;

    const allProducts = await ctx.db
      .query("products")
      .collect();

    const filteredProducts = allProducts
      .filter(product => product.category === category);

    const startIndex = (page - 1) * pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

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
    const { searchTerm, paginationOptions } = args;
    const { page, pageSize } = paginationOptions;

    const allProducts = await ctx.db.query("products").collect();

    const filteredProducts = allProducts
      .filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const startIndex = (page - 1) * pageSize;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

    return {
      products: paginatedProducts,
      totalPages: Math.ceil(filteredProducts.length / pageSize),
      currentPage: page
    };
  }
});

// Other methods remain the same
export const getProductById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    return product;
  }
});


export const createProduct = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    price: v.number(),
    description: v.string(),
    imageUrl: v.optional(v.string()),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", args);
  }
});

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    updates: v.object({
      name: v.optional(v.string()),
      category: v.optional(v.string()),
      price: v.optional(v.number()),
      description: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      quantity: v.optional(v.number())
    })
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, args.updates);
  }
});

export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  }
});