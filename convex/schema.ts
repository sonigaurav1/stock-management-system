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
    // .index('by_category', ['categoryId'])
    // .index('by_stockLevel', ['stockLevel'])
    // .index('by_supplier', ['supplierId'])
    // .index('by_purchasePrice', ['purchasePrice'])
    // .index('by_inStock', ['inStock'])
    // .index('by_stockStatus', ['stockStatus'])
    // .index('by_isDeleted', ['isDeleted']) // Index for filtering active products
    .index('by_user', ['userId'])
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
    // .index('by_user', ['userId'])
    // .index('by_isDeleted', ['isDeleted']) // Index for filtering active products
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
    // .index('by_name', ['name'])
    // .index('by_user', ['userId'])
    // .index('by_isDeleted', ['isDeleted']) // Index for filtering active products
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
    // .index('by_user', ['userId'])
    // .index('by_product', ['productId'])
    // .index('by_type', ['type']),
    .index('by_user_and_isDeleted', ['userId', 'isDeleted']),

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
    // .index('by_user', ['userId'])
    // .index('by_customerId', ['customerId'])
    // .index('by_product', ['productId'])
    // .index('by_soldAt', ['soldAt'])
    .index('by_user_and_isDeleted', ['userId', 'isDeleted']),

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
    // .index('by_user', ['userId'])
    // .index('by_name', ['name'])
    .index('by_user_and_isDeleted', ['userId', 'isDeleted']),

  invoices: defineTable({
    userId: v.string(),
    isDeleted: v.boolean(),
    transactionDate: v.string(),
    invoiceNumber: v.string(),
    date: v.string(),
    miti: v.string(),
    isAdmin: v.boolean(),
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
    // .index('by_invoiceNumber', ['invoiceNumber'])
    // .index('by_user', ['userId'])
    // .index('by_isDeleted', ['isDeleted'])
    // .index('by_transactionDate', ['transactionDate']),
    .index('by_user_and_invoiceNumber', ['userId', 'invoiceNumber'])
    .index('by_user_and_isDeleted', ['userId', 'isDeleted']),

  firms: defineTable({
    userId: v.string(), // Reference to the user
    name: v.string(), // Firm name
    owner: v.string(), // Owner's name
    address: v.optional(v.string()), // Optional firm address
    phone: v.optional(v.string()), // Optional contact number
    createdAt: v.number(), // Timestamp when the firm was created
    updatedAt: v.optional(v.number()), // Timestamp when the firm was last updated
    isDeleted: v.boolean() // Soft delete flag
  })
    // .index('by_user', ['userId'])
    // .index('by_owner', ['owner'])
    // .index('by_isDeleted', ['isDeleted'])
    .index('by_user_and_isDeleted', ['userId', 'isDeleted']),

  transactions: defineTable({
    userId: v.string(), // Reference to the user
    firmId: v.string(), // Reference to the firm
    date: v.number(), // Transaction date (timestamp)
    particular: v.string(), // Description of the transaction
    drAmount: v.optional(v.number()), // Debit amount
    crAmount: v.optional(v.number()), // Credit amount
    balance: v.number(), // Running balance after the transaction
    createdAt: v.number(), // Timestamp when the transaction was created
    updatedAt: v.optional(v.number()), // Timestamp when the transaction was last updated
    isDeleted: v.boolean() // Soft delete flag
  })
    // .index('by_user', ['userId'])
    // .index('by_firmId', ['firmId'])
    // .index('by_date', ['date'])
    // .index('by_isDeleted', ['isDeleted'])
    .index('by_user_firm_isDeleted', ['userId', 'firmId', 'isDeleted']),

  companyDetails: defineTable({
    userId: v.string(), // Reference to the user
    companyName: v.string(),
    companyAddress: v.string(),
    phone: v.array(v.string()),
    email: v.string(),
    vatNumber: v.string(),
    isVerified: v.boolean(), // VAT number verification status
    urls: v.array(v.object({ id: v.number(), value: v.string() })), // Array of URLs

    isDeleted: v.boolean(), // Soft delete flag (false = active, true = deleted)

    createdAt: v.number(), // Timestamp for when the details were created
    updatedAt: v.optional(v.number()) // Optional timestamp for updates
  })
    .index('by_user_and_isDeleted', ['userId', 'isDeleted'])
    .index('by_companyName', ['companyName'])
    .index('by_vatNumber', ['vatNumber'])
});
