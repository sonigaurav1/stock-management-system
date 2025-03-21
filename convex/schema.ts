import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  products: defineTable({
    name: v.string(),
    userId: v.string(),
    sku: v.string(), // Unique product identifier
    slug: v.string(), // URL-friendly name
    serialNumber: v.optional(v.string()),
    barcode: v.optional(v.string()), // Barcode for scanning
    categoryName: v.string(),
    categoryId: v.string(),
    subcategory: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    brand: v.optional(v.string()),

    purchasePrice: v.optional(v.string()), // Cost price
    sellingPrice: v.optional(v.number()), // Selling price
    discountPrice: v.optional(v.number()), // Discounted price

    stockLevel: v.optional(v.number()), // Current stock quantity
    inStock: v.boolean(), // In stock status
    reorderLevel: v.optional(v.number()), // Minimum stock before reorder alert
    stockStatus: v.string(), // "in_stock", "low_stock", "out_of_stock"

    supplierName: v.optional(v.string()), // Supplier name
    supplierId: v.optional(v.string()), // Supplier reference
    lastRestockedAt: v.optional(v.number()), // Timestamp of last restock

    isDeleted: v.boolean(), // Soft delete flag (false = active, true = deleted)

    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  })
    .index('by_category', ['categoryId'])
    .index('by_stockLevel', ['stockLevel'])
    .index('by_supplier', ['supplierId'])
    .index('by_purchasePrice', ['purchasePrice'])
    .index('by_inStock', ['inStock'])
    .index('by_stockStatus', ['stockStatus'])
    .index('by_user', ['userId'])
    .index('by_isDeleted', ['isDeleted']) // Index for filtering active products
    .index('by_user_and_isCategory', ['categoryId', 'isDeleted'])
    .index('by_user_and_isSupplier', ['supplierId', 'isDeleted'])
    .index('by_user_and_isDeleted', ['userId', 'isDeleted']),

  category: defineTable({
    name: v.string(),
    userId: v.string(),
    slug: v.string(), // URL-friendly name
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isDeleted: v.boolean(),

    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  })
    .index('by_user', ['userId'])
    .index('by_isDeleted', ['isDeleted']) // Index for filtering active products
    .index('by_user_and_isDeleted', ['userId', 'isDeleted']),

  suppliers: defineTable({
    name: v.string(),
    userId: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    imageUrl: v.optional(v.string()),

    isDeleted: v.boolean(), // Soft delete flag (false = active, true = deleted)

    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  })
    .index('by_name', ['name'])
    .index('by_user', ['userId'])
    .index('by_isDeleted', ['isDeleted']) // Index for filtering active products
    .index('by_user_and_isDeleted', ['userId', 'isDeleted']),

  stockMovements: defineTable({
    productId: v.string(), // Which product's stock changed
    userId: v.string(),
    type: v.string(), // "purchase", "sale", "damage", "return"
    quantity: v.number(), // Amount of stock added/removed
    reason: v.optional(v.string()), // Why stock changed
    referenceId: v.optional(v.string()), // Invoice/Sale ID for tracking

    isDeleted: v.boolean(), // Soft delete flag (false = active, true = deleted)

    createdAt: v.number() // Timestamp of the movement
  })
    .index('by_user', ['userId'])
    .index('by_user_and_isDeleted', ['userId', 'isDeleted'])
    .index('by_product', ['productId'])
    .index('by_type', ['type']),

  sales: defineTable({
    productId: v.string(),
    userId: v.string(),
    quantitySold: v.number(),
    sellingPrice: v.number(),
    totalAmount: v.number(), // quantitySold * sellingPrice
    customerId: v.optional(v.string()), // Optional customer reference
    customerName: v.string(), // Optional customer name
    customerPhone: v.array(v.string()), // Optional customer phone

    isDeleted: v.boolean(), // Soft delete flag (false = active, true = deleted)

    soldAt: v.number() // Timestamp of sale
  })
    .index('by_user', ['userId'])
    .index('by_user_and_isDeleted', ['userId', 'isDeleted'])
    .index('by_customerId', ['customerId'])
    .index('by_product', ['productId'])
    .index('by_soldAt', ['soldAt']),

  customers: defineTable({
    name: v.string(),
    userId: v.string(),
    phone: v.optional(v.array(v.string())),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    pan: v.optional(v.string()),
    dob: v.optional(v.number()),

    isDeleted: v.boolean(), // Soft delete flag (false = active, true = deleted)

    createdAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_user_and_isDeleted', ['userId', 'isDeleted'])
    .index('by_name', ['name']),

  invoices: defineTable({
    userId: v.string(),
    isDeleted: v.boolean(),
    transactionDate: v.string(),
    invoiceNumber: v.string(),
    date: v.string(),
    miti: v.string(),
    paymentMode: v.string(),
    buyerName: v.string(),
    buyerAddress: v.string(),
    buyerPhone: v.optional(v.string()),
    buyerPan: v.optional(v.string()),
    items: v.array(
      v.object({
        sn: v.number(),
        hsCode: v.string(),
        description: v.string(),
        quantity: v.number(),
        unit: v.string(),
        rate: v.number(),
        amount: v.number()
      })
    ),
    value: v.optional(v.number()),
    discount: v.optional(v.number()),
    nonTaxable: v.optional(v.number()),
    taxableAmount: v.optional(v.number()),
    vatAmount: v.optional(v.number()),
    totalAmount: v.optional(v.number()),
    amountInWords: v.optional(v.string()),
    printDate: v.string(),
    printTime: v.string(),
    vehicleNo: v.optional(v.string()),
    remarks: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  })
    .index('by_invoiceNumber', ['invoiceNumber'])
    .index('by_user', ['userId'])
    .index('by_isDeleted', ['isDeleted'])
    .index('by_user_and_invoiceNumber', ['userId', 'invoiceNumber'])
    .index('by_user_and_isDeleted', ['userId', 'isDeleted'])
    .index('by_transactionDate', ['transactionDate'])
});
