import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  products: defineTable({
    name: v.string(),
    userId: v.string(),
    sku: v.string(), // Unique product identifier
    slug: v.string(), // URL-friendly name
    barcode: v.optional(v.string()), // Barcode for scanning
    category: v.string(),
    subcategory: v.optional(v.string()),
    description: v.optional(v.string()),
    brand: v.optional(v.string()),

    purchasePrice: v.number(), // Cost price
    sellingPrice: v.number(), // Selling price
    discountPrice: v.optional(v.number()), // Discounted price

    stockLevel: v.number(), // Current stock quantity
    inStock: v.boolean(), // In stock status
    reorderLevel: v.optional(v.number()), // Minimum stock before reorder alert
    stockStatus: v.string(), // "in_stock", "low_stock", "out_of_stock"

    supplierId: v.optional(v.string()), // Supplier reference
    lastRestockedAt: v.optional(v.number()), // Timestamp of last restock

    isDeleted: v.boolean(), // Soft delete flag (false = active, true = deleted)

    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  })
    .index('by_category', ['category'])
    .index('by_stockLevel', ['stockLevel'])
    .index('by_supplier', ['supplierId'])
    .index('by_purchasePrice', ['purchasePrice'])
    .index('by_inStock', ['inStock'])
    .index('by_stockStatus', ['stockStatus'])
    .index('by_user', ['userId'])
    .index('by_isDeleted', ['isDeleted']), // Index for filtering active products

  category: defineTable({
    name: v.string(),
    userId: v.string(),
    slug: v.string(), // URL-friendly name
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isDeleted: v.boolean(),

    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  }).index('by_user', ['userId']),

  suppliers: defineTable({
    name: v.string(),
    userId: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    imageUrl: v.optional(v.string()),

    isDeleted: v.boolean(), // Soft delete flag (false = active, true = deleted)

    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  })
    .index('by_name', ['name'])
    .index('by_user', ['userId']),

  stockMovements: defineTable({
    productId: v.string(), // Which product's stock changed
    userId: v.string(),
    type: v.string(), // "purchase", "sale", "damage", "return"
    quantity: v.number(), // Amount of stock added/removed
    reason: v.optional(v.string()), // Why stock changed
    referenceId: v.optional(v.string()), // Invoice/Sale ID for tracking

    createdAt: v.number() // Timestamp of the movement
  })
    .index('by_user', ['userId'])
    .index('by_product', ['productId'])
    .index('by_type', ['type']),

  sales: defineTable({
    productId: v.string(),
    userId: v.string(),
    quantitySold: v.number(),
    sellingPrice: v.number(),
    totalAmount: v.number(), // quantitySold * sellingPrice
    customerId: v.optional(v.string()), // Optional customer reference

    soldAt: v.number() // Timestamp of sale
  })
    .index('by_user', ['userId'])
    .index('by_product', ['productId'])
    .index('by_soldAt', ['soldAt']),

  customers: defineTable({
    name: v.string(),
    userId: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),

    createdAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_name', ['name'])
});
