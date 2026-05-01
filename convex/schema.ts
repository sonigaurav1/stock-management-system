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
    hsnsacCode: v.optional(v.string()), // STEP 5.1: HSN/SAC code for GST
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
    autoReorderEnabled: v.optional(v.boolean()), // STEP 4.2: Auto-reorder when below reorder level
    stockStatus: v.string(), // Should be one of "in_stock", "low_stock", "out_of_stock"

    supplierName: v.optional(v.string()), // Supplier name
    supplierId: v.optional(v.string()), // Supplier reference
    lastRestockedAt: v.optional(v.number()), // Timestamp of last restock

    isDeleted: v.boolean(), // Soft delete flag (false = active, true = deleted)

    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  })
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
  }).index('by_user_and_isDeleted', ['userId', 'isDeleted']),

  suppliers: defineTable({
    name: v.string(),
    userId: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    imageUrl: v.optional(v.string()),

    // STEP 8.3: Supplier Performance Metrics
    totalOrders: v.optional(v.number()), // Total orders placed
    onTimeDeliveries: v.optional(v.number()), // Deliveries on time
    lateDeliveries: v.optional(v.number()), // Late deliveries
    averageLeadTimeDays: v.optional(v.number()), // Average lead time
    lastOrderDate: v.optional(v.number()), // Last order date

    isDeleted: v.boolean(), // Soft delete flag (false = active, true = deleted)

    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  })
    .index('by_user_and_isDeleted', ['userId', 'isDeleted'])
    .index('by_user_performance', ['userId', 'averageLeadTimeDays']),

  // STEP 8.1: Product-Supplier Mapping (Multi-supplier per product)
  productSuppliers: defineTable({
    userId: v.string(),
    productId: v.id('products'),
    supplierId: v.id('suppliers'),
    costPrice: v.number(), // Cost price from this supplier
    supplierSku: v.optional(v.string()), // Supplier's SKU for this product
    minOrderQty: v.optional(v.number()), // Minimum order quantity
    leadTimeDays: v.optional(v.number()), // Delivery lead time
    isPreferred: v.boolean(), // Is this the preferred supplier
    lastPurchasedAt: v.optional(v.number()), // Last purchase date
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  })
    .index('by_product', ['productId'])
    .index('by_supplier', ['supplierId'])
    .index('by_user_product', ['userId', 'productId']),

  stockMovements: defineTable({
    productId: v.string(), // Which product's stock changed
    userId: v.string(),
    type: v.string(), // "purchase", "sale", "damage", "return"
    quantity: v.number(), // Amount of stock added/removed
    reason: v.optional(v.string()), // Why stock changed
    referenceId: v.optional(v.string()), // Invoice/Sale ID for tracking

    locationId: v.optional(v.id('locations')), // optional site for movement

    isDeleted: v.boolean(), // Soft delete flag (false = active, true = deleted)

    createdAt: v.number() // Timestamp of the movement
  }).index('by_user_and_isDeleted', ['userId', 'isDeleted']),

  // Record sales made by selling product from billing page
  sales: defineTable({
    productId: v.optional(v.string()),
    userId: v.string(),
    locationId: v.optional(v.id('locations')),
    quantitySold: v.number(),
    sellingPrice: v.number(),
    totalAmount: v.number(), // quantitySold * sellingPrice
    customerId: v.optional(v.string()), // Customer reference
    customerName: v.string(), // Customer name
    customerPhone: v.array(v.string()), // Customer phone

    paymentStatus: v.optional(v.string()), // "paid", "unpaid", "partially_paid"

    isDeleted: v.boolean(), // Soft delete flag (false = active, true = deleted)
    soldAt: v.number() // Timestamp of sale happened
  }).index('by_user_and_isDeleted', ['userId', 'isDeleted']),

  payments: defineTable({
    userId: v.string(), // User who recorded the payment
    saleIds: v.array(v.string()), // Reference to the sale
    customerId: v.optional(v.string()), // Reference to the customer

    // STEP 8.4: Supplier Payment Tracking
    supplierId: v.optional(v.id('suppliers')), // Reference to supplier (for B2B payments)
    isPaymentToSupplier: v.boolean(), // true if payment is to supplier, false if from customer

    amountPaid: v.number(), // Amount paid in this transaction
    outstandingBalance: v.optional(v.number()), // Remaining balance to pay after taking product in credit
    paymentMode: v.string(), // "cash", "credit", "debit", "bank_transfer", etc.
    paymentReference: v.optional(v.string()), // Reference number, check number, etc.
    notes: v.optional(v.string()), // Any additional information
    paymentStatus: v.optional(v.string()), // "paid", "unpaid", "partially_paid"
    invoiceNumber: v.string(), // Invoice number if applicable
    dueDate: v.optional(v.number()), // Due date for payment

    isDeleted: v.boolean(),

    updatedAt: v.optional(v.number()),
    paidAt: v.number() // Timestamp of when payment was made
  })
    .index('by_user_and_isDeleted', ['userId', 'isDeleted'])
    .index('by_sale', ['saleIds'])
    .index('by_customer', ['customerId'])
    .index('by_paymentDate', ['paidAt']),

  customers: defineTable({
    name: v.string(),
    userId: v.string(),
    phone: v.optional(v.array(v.string())),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    pan: v.optional(v.string()),
    dob: v.optional(v.number()),
    // STEP 7.3: Credit limit for customers
    creditLimit: v.optional(v.number()), // Maximum credit allowed
    creditBalance: v.optional(v.number()), // Current credit used

    isDeleted: v.boolean(), // Soft delete flag (false = active, true = deleted)

    createdAt: v.number()
  }).index('by_user_and_isDeleted', ['userId', 'isDeleted']),

  invoices: defineTable({
    userId: v.string(),
    transactionDate: v.string(),
    invoiceNumber: v.string(),
    date: v.string(),
    miti: v.string(), // nepali date
    paymentMode: v.string(), // "cash", "credit", "debit", "bank_transfer", etc.
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
    isAdmin: v.optional(v.boolean()), // true if the invoice is generated by admin

    // STEP 7.5: Payment Reminders
    dueDate: v.optional(v.number()), // Due date for payment
    lastReminderSent: v.optional(v.number()), // Timestamp of last reminder
    reminderCount: v.optional(v.number()), // Number of reminders sent
    isRecurring: v.optional(v.boolean()), // If created from recurring template
    recurringTemplateId: v.optional(v.string()), // Reference to recurring template

    isDeleted: v.boolean(),

    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  })
    .index('by_user_and_invoiceNumber', ['userId', 'invoiceNumber'])
    .index('by_user_and_isDeleted', ['userId', 'isDeleted']),

  // STEP 7.1: Recurring Invoices Template
  recurringInvoices: defineTable({
    userId: v.string(),
    name: v.string(), // Template name
    customerName: v.string(),
    customerAddress: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    customerPan: v.optional(v.string()),
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
    totalAmount: v.number(),
    taxableAmount: v.optional(v.number()),
    vatAmount: v.optional(v.number()),
    discount: v.optional(v.number()),
    amountInWords: v.optional(v.string()),
    frequency: v.string(), // "daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"
    startDate: v.number(),
    nextDueDate: v.number(),
    lastGeneratedAt: v.optional(v.number()),
    defaultPaymentMode: v.optional(v.string()),
    isActive: v.boolean(),
    isDeleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  })
    .index('by_user', ['userId'])
    .index('by_user_active', ['userId', 'isActive']),

  firms: defineTable({
    userId: v.string(), // Reference to the user
    name: v.string(), // Firm name
    owner: v.string(), // Owner's name
    address: v.optional(v.string()), // Optional firm address
    phone: v.optional(v.string()), // Optional contact number
    createdAt: v.number(), // Timestamp when the firm was created
    updatedAt: v.optional(v.number()), // Timestamp when the firm was last updated
    isDeleted: v.boolean() // Soft delete flag
  }).index('by_user_and_isDeleted', ['userId', 'isDeleted']),

  // ==================== CONSOLIDATED COMPANY TABLE ====================
  // Replaces: firms, companyDetails, organizationSettings (Phase 2A Refactoring)
  // This unified table consolidates company/organization/firm information
  companies: defineTable({
    userId: v.string(), // Tenant: Clerk user ID

    // Basic Info
    name: v.string(), // Company/firm name
    owner: v.optional(v.string()), // Owner's name (from firms)
    businessType: v.string(), // "retailer", "wholesaler", "distributor", etc.
    type: v.string(), // "company" | "firm" (to distinguish if needed during migration)

    // Address
    address: v.string(),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    country: v.optional(v.string()),

    // Contact
    phone: v.array(v.string()), // Support multiple phone numbers
    email: v.string(),
    website: v.optional(v.string()),

    // Tax & Legal
    taxNumber: v.string(), // VAT / PAN number
    businessRegistration: v.optional(v.string()),
    isVerified: v.boolean(), // Tax number verification status

    // Branding
    logo: v.optional(v.string()), // Logo URL
    description: v.optional(v.string()), // Company description

    // URLs (from companyDetails.urls)
    urls: v.array(v.object({ id: v.number(), value: v.string() })),

    // Audit
    processedBy: v.optional(v.string()), // User who created/processed

    // Standard audit fields
    isDeleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  })
    .index('by_user_and_isDeleted', ['userId', 'isDeleted'])
    .index('by_user_and_type', ['userId', 'type'])
    .index('by_user', ['userId']),

  // Transaction with firm
  transactions: defineTable({
    userId: v.string(), // Reference to the user
    firmId: v.string(), // Reference to the firm
    date: v.number(), // Transaction date (timestamp)
    particular: v.string(), // Description of the transaction
    drAmount: v.optional(v.number()), // Debit amount
    crAmount: v.optional(v.number()), // Credit amount
    imageUrl: v.optional(v.string()), // Receipt image URL
    balance: v.number(), // Running balance after the transaction

    isDeleted: v.boolean(), // Soft delete flag

    createdAt: v.number(), // Timestamp when the transaction was created
    updatedAt: v.optional(v.number()) // Timestamp when the transaction was last updated
  }).index('by_user_firm_isDeleted', ['userId', 'firmId', 'isDeleted']),

  companyDetails: defineTable({
    userId: v.string(), // Reference to the user
    companyName: v.string(),
    companyAddress: v.string(),
    phone: v.array(v.string()),
    email: v.string(),
    website: v.optional(v.string()),

    vatNumber: v.string(),
    isVerified: v.boolean(), // VAT number verification status
    urls: v.array(v.object({ id: v.number(), value: v.string() })), // Array of URLs
    processedBy: v.optional(v.string()), // User who generated the invoice

    isDeleted: v.boolean(), // Soft delete flag (false = active, true = deleted)

    createdAt: v.number(), // Timestamp for when the details were created
    updatedAt: v.optional(v.number()) // Optional timestamp for updates
  }).index('by_user_and_isDeleted', ['userId', 'isDeleted']),

  otpVerification: defineTable({
    userId: v.string(), // Reference to the user
    otp: v.number(), // One-time password
    expiresAt: v.number(), // Expiration timestamp for the OTP
    createdAt: v.number(), // Timestamp when the OTP was created
    updatedAt: v.optional(v.number()) // Optional timestamp for updates
  }).index('by_userId', ['userId']),

  userSettings: defineTable({
    userId: v.string(),
    language: v.optional(v.string()),
    currencyCode: v.optional(v.string()),
    dateFormat: v.optional(v.string()),
    timeFormat: v.optional(v.string()),
    timezone: v.optional(v.string()),
    emailNotifications: v.optional(v.boolean()),
    lowStockAlerts: v.optional(v.boolean()),
    theme: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  }).index('by_user', ['userId']),

  // ==================== Multi-Organization Support Tables =====================
  // These tables support multiple organizations per user, with role-based access control and settings isolation
  // Paid feature - only used if user creates or joins multiple organizations
  organizations: defineTable({
    name: v.string(),
    ownerId: v.string(), // User ID of the owner
    status: v.string(), // 'active', 'archived', 'deleted'
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_owner', ['ownerId'])
    .index('by_owner_and_status', ['ownerId', 'status']),

  organizationMembers: defineTable({
    organizationId: v.id('organizations'),
    userId: v.string(),
    role: v.string(), // "admin", "staff", "sales_operator", etc.
    joinedAt: v.number()
  })
    .index('by_organization', ['organizationId'])
    .index('by_user', ['userId'])
    .index('by_org_and_user', ['organizationId', 'userId']),

  // ==================== Enterprise Account Management ====================

  // Account Status - Controls access to dashboard/admin for business owners
  accountStatus: defineTable({
    userId: v.string(), // Clerk user ID
    status: v.string(), // "pending", "approved", "blocked", "suspended"
    businessType: v.string(), // "retailer", "wholesaler", "distributor", "manufacturer", "service_provider", "e_commerce", "corporate", "nonprofit", "other"
    approvedBy: v.optional(v.string()), // Super admin user ID who approved
    approvedAt: v.optional(v.number()),
    blockedBy: v.optional(v.string()), // Super admin user ID who blocked
    blockedAt: v.optional(v.number()),
    blockedReason: v.optional(v.string()), // Reason for blocking
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_status', ['status'])
    .index('by_businessType', ['businessType']),

  // ==================== Company Team Management ====================

  // Company Members - Team members invited to a company (Option A: Single-tenant per owner)
  companyMembers: defineTable({
    companyOwnerId: v.string(), // Company owner's userId (Clerk ID)
    userId: v.optional(v.string()), // Staff member's Clerk ID (populated on acceptance)
    email: v.string(), // Member's email
    displayName: v.string(), // Member's display name
    role: v.string(), // "manager", "staff", "viewer"
    status: v.string(), // "invited", "accepted", "removed"
    invitedAt: v.number(), // When invitation was sent
    invitedBy: v.string(), // Owner's userId who sent invitation
    acceptedAt: v.optional(v.number()), // When member accepted invitation
    token: v.optional(v.string()), // Unique invite token for link sharing
    expiresAt: v.optional(v.number()), // Invitation expiry time (7 days default)
    resendCount: v.optional(v.number()), // Track resend count (default: 0)
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_company', ['companyOwnerId'])
    .index('by_company_and_email', ['companyOwnerId', 'email'])
    .index('by_email', ['email'])
    .index('by_status', ['status'])
    .index('by_token', ['token'])
    .index('by_userId', ['userId'])
    .index('by_company_and_userId', ['companyOwnerId', 'userId']),

  // ==================== Settings System Tables ====================

  // Organization Settings
  organizationSettings: defineTable({
    userId: v.string(),
    companyName: v.string(),
    businessType: v.string(),
    taxNumber: v.string(),
    businessRegistration: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    state: v.string(),
    postalCode: v.optional(v.string()),
    country: v.string(),
    phone: v.optional(v.string()),
    email: v.string(),
    website: v.optional(v.string()),
    description: v.optional(v.string()),
    logo: v.optional(v.string()),
    // STEP 2.1: Cost Code Mapping (digit -> codes, e.g. "0" -> ["A","AB"], "1" -> ["HI","HIX"])
    costCodeMapping: v.optional(
      v.array(
        v.object({
          digit: v.string(),
          codes: v.array(v.string())
        })
      )
    ),
    costCodeEnabled: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user', ['userId']),

  // Notification Rules
  notificationRules: defineTable({
    userId: v.string(),
    name: v.string(),
    triggers: v.array(v.string()),
    channels: v.array(v.string()),
    recipients: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user', ['userId']),

  // Integrations
  integrations: defineTable({
    userId: v.string(),
    name: v.string(),
    category: v.string(),
    enabled: v.boolean(), // Changed from isConnected
    apiKey: v.string(),
    apiSecret: v.optional(v.string()),
    webhookUrl: v.optional(v.string()),
    lastSyncAt: v.optional(v.number()),
    syncStatus: v.optional(v.string()),
    config: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user', ['userId']),

  // API Keys
  apiKeys: defineTable({
    userId: v.string(),
    name: v.string(),
    key: v.string(),
    displayKey: v.string(),
    revoked: v.boolean(), // Changed from isActive
    lastUsedAt: v.optional(v.number()),
    rateLimit: v.optional(v.number()),
    createdAt: v.number(),
    expiresAt: v.optional(v.number())
  }).index('by_user', ['userId']),

  // Webhooks
  webhooks: defineTable({
    userId: v.string(),
    url: v.string(),
    events: v.array(v.string()),
    isActive: v.boolean(),
    secret: v.string(),
    lastTriggeredAt: v.optional(v.number()),
    failureCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user', ['userId']),

  // Automation Rules
  automationRules: defineTable({
    userId: v.string(),
    name: v.string(),
    trigger: v.string(),
    action: v.string(),
    threshold: v.optional(v.string()),
    isActive: v.boolean(),
    lastExecutedAt: v.optional(v.number()),
    executionCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user', ['userId']),

  // Audit Log
  auditLog: defineTable({
    userId: v.string(),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    changes: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number()
  }).index('by_user', ['userId']),

  // Webhook Execution Log
  webhookExecutionLog: defineTable({
    userId: v.string(),
    webhookId: v.string(),
    url: v.string(),
    event: v.string(),
    payload: v.any(),
    statusCode: v.optional(v.number()),
    response: v.optional(v.string()),
    error: v.optional(v.string()),
    retryCount: v.number(),
    executedAt: v.number()
  }).index('by_webhook', ['webhookId']),

  // Feature Usage Analytics
  featureUsage: defineTable({
    userId: v.string(),
    feature: v.string(),
    metadata: v.optional(v.any()),
    timestamp: v.number()
  }).index('by_user', ['userId']),

  // System Event Log (Phase 2B: Consolidates webhookExecutionLog + duplicateDetectionLog)
  // Tracks background jobs, webhooks, duplicate detection, and system-level events
  systemLog: defineTable({
    userId: v.string(),
    logType: v.string(), // "webhook" | "duplicate_detection" | "bulk_operation" | "report"
    status: v.string(), // "success" | "failure" | "pending" | "warning"

    // Webhook-specific fields
    webhookId: v.optional(v.string()),
    url: v.optional(v.string()),
    event: v.optional(v.string()),
    payload: v.optional(v.any()),
    statusCode: v.optional(v.number()),
    response: v.optional(v.string()),
    error: v.optional(v.string()),
    retryCount: v.optional(v.number()),

    // Duplicate detection fields
    entityType: v.optional(v.string()), // "sales", "payments", "transactions"
    record1Id: v.optional(v.string()),
    record2Id: v.optional(v.string()),
    amount: v.optional(v.number()),
    similarityScore: v.optional(v.number()), // 0-100
    timeDifferenceMs: v.optional(v.number()),
    resolutionNotes: v.optional(v.string()),
    resolvedBy: v.optional(v.string()),

    // Common fields for all log types
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
    timestamp: v.number(),
    resolvedAt: v.optional(v.number())
  })
    .index('by_user_and_type', ['userId', 'logType'])
    .index('by_user_and_status', ['userId', 'status'])
    .index('by_user_and_timestamp', ['userId', 'timestamp']),

  // Dashboard Configuration - Widget customization per user
  dashboardWidgets: defineTable({
    userId: v.string(),
    widgets: v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        title: v.string(),
        position: v.number(),
        size: v.string(),
        isVisible: v.boolean(),
        isLocked: v.optional(v.boolean()),
        config: v.optional(v.any())
      })
    ),
    layout: v.string(),
    theme: v.optional(v.string()),
    refreshInterval: v.number(),
    isPublic: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user', ['userId']),

  // Dashboard Insights Configuration
  insightSettings: defineTable({
    userId: v.string(),
    enableAnomalyDetection: v.boolean(),
    anomalyThreshold: v.number(),
    enableTrendAnalysis: v.boolean(),
    enableReorderAlerts: v.boolean(),
    enablePaymentAlerts: v.boolean(),
    lowStockThreshold: v.number(),
    dismissedInsights: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user', ['userId']),

  // Stored Insights/Alerts
  userInsights: defineTable({
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    actionUrl: v.optional(v.string()),
    actionLabel: v.optional(v.string()),
    priority: v.string(),
    widgetId: v.optional(v.string()),
    isDismissed: v.boolean(),
    dismissedAt: v.optional(v.number()),
    createdAt: v.number(),
    expiresAt: v.optional(v.number())
  }).index('by_user', ['userId']),

  // Dashboard Export History
  dashboardExports: defineTable({
    userId: v.string(),
    exportType: v.string(),
    format: v.string(),
    fileName: v.string(),
    fileUrl: v.optional(v.string()),
    includeCharts: v.boolean(),
    dateRange: v.optional(
      v.object({
        startDate: v.number(),
        endDate: v.number()
      })
    ),
    widgetsIncluded: v.array(v.string()),
    status: v.string(),
    error: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number())
  }).index('by_user', ['userId']),

  // ==================== Expense Management System ====================

  // Expense Categories with tax treatment
  expenseCategories: defineTable({
    userId: v.string(),
    name: v.string(), // "Salary", "Utilities", "Marketing", "Travel", "Supplies", etc.
    color: v.optional(v.string()), // Display color in UI
    icon: v.optional(v.string()), // Icon name
    description: v.optional(v.string()),
    isTaxDeductible: v.boolean(), // Can be claimed as business deduction
    isRecurring: v.boolean(), // Common recurring expense
    budget: v.optional(v.number()), // Monthly budget for this category
    type: v.string(), // "business" | "personal"
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  }).index('by_user_and_type', ['userId', 'type']),

  // Main Expense Records
  expenses: defineTable({
    userId: v.string(),
    categoryId: v.string(), // Reference to expenseCategories
    amount: v.number(), // Amount in base currency (Rs)
    currency: v.optional(v.string()), // "INR", "USD", etc. (default to INR)
    description: v.string(), // Brief description
    date: v.number(), // Timestamp of when expense occurred
    paymentMethod: v.string(), // "cash", "credit_card", "bank_transfer", "check", etc.

    // Type and Status
    type: v.string(), // "business" | "personal" (personal expenses can be reimbursed)
    status: v.string(), // "pending", "approved", "rejected", "reimbursed"

    // Approval workflow
    submittedBy: v.optional(v.string()), // User ID who submitted
    approvedBy: v.optional(v.string()), // User ID who approved
    approvalNotes: v.optional(v.string()),
    approvalDate: v.optional(v.number()),

    // Tax and Compliance
    tags: v.array(v.string()), // ["recurring", "tax-deductible", "reimbursable", "urgent", etc.]
    isTaxDeductible: v.boolean(),
    taxCategory: v.optional(v.string()), // "COGS", "OpEx", "Salary", "Travel", etc.
    invoice: v.optional(v.string()), // Invoice or bill number for reference
    vendor: v.optional(v.string()), // Vendor/supplier name

    // Reimbursement tracking
    isReimbursable: v.boolean(),
    reimbursementStatus: v.optional(v.string()), // "pending", "processed", "received"
    reimbursementAmount: v.optional(v.number()),
    reimbursedAt: v.optional(v.number()),

    // Receipt information
    receiptUrl: v.optional(v.string()), // URL to receipt file
    receiptFileName: v.optional(v.string()),
    ocrData: v.optional(
      v.object({
        vendor: v.optional(v.string()),
        date: v.optional(v.string()),
        amount: v.optional(v.number())
      })
    ),

    // Recurring expense reference
    recurringExpenseId: v.optional(v.string()), // If created from recurring template

    // Notes and metadata
    notes: v.optional(v.string()),
    department: v.optional(v.string()), // For cost center allocation
    project: v.optional(v.string()), // Project allocation
    metadata: v.optional(v.any()), // Custom fields

    isDeleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  })
    .index('by_user_and_date', ['userId', 'date'])
    .index('by_user_and_category', ['userId', 'categoryId'])
    .index('by_user_and_status', ['userId', 'status'])
    .index('by_user_and_type', ['userId', 'type'])
    .index('by_user_and_isDeleted', ['userId', 'isDeleted']),

  // Budget Management per category (monthly)
  budgets: defineTable({
    userId: v.string(),
    categoryId: v.optional(v.string()), // null = overall budget, specific = category budget
    amount: v.number(), // Monthly budget limit
    month: v.string(), // "2026-04" format for specific month, "year" for yearly
    spent: v.number(), // Running total of expenses this period (updated in real-time or batch)
    alertThreshold: v.number(), // Alert at 75% (default), customizable
    alertSent: v.boolean(), // Whether alert has been sent (prevent spam)
    status: v.string(), // "on_track", "warning", "exceeded"
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  })
    .index('by_user_and_month', ['userId', 'month'])
    .index('by_user_and_category', ['userId', 'categoryId']),

  // Recurring Expenses Template
  recurringExpenses: defineTable({
    userId: v.string(),
    categoryId: v.string(),
    description: v.string(),
    amount: v.number(),
    frequency: v.string(), // "daily", "weekly", "monthly", "quarterly", "yearly"
    startDate: v.number(), // When the recurring expense starts
    endDate: v.optional(v.number()), // When it ends (null = ongoing)
    dayOfMonth: v.optional(v.number()), // For monthly (1-31)
    dayOfWeek: v.optional(v.string()), // For weekly ("Monday", "Tuesday", etc.)
    lastGeneratedDate: v.optional(v.number()), // Last auto-generated date
    nextDueDate: v.number(), // When next expense should be created
    paymentMethod: v.optional(v.string()),
    vendor: v.optional(v.string()),
    isActive: v.boolean(),
    autoCreate: v.boolean(), // Automatically create expenses on schedule
    tags: v.array(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  }).index('by_user_and_isActive', ['userId', 'isActive']),

  // Expense Approval Workflow
  expenseApprovals: defineTable({
    userId: v.string(),
    expenseId: v.string(), // Reference to expense
    requestedBy: v.string(), // User requesting approval
    approvers: v.array(
      v.object({
        approverUserId: v.string(),
        order: v.number(), // Approval sequence (1 = first, 2 = second, etc.)
        status: v.string(), // "pending", "approved", "rejected"
        approvalDate: v.optional(v.number()),
        comments: v.optional(v.string())
      })
    ),
    currentApprovalLevel: v.number(), // Which approver is reviewing now
    overallStatus: v.string(), // "pending", "approved", "rejected", "cancelled"
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  })
    .index('by_user_and_expenseId', ['userId', 'expenseId'])
    .index('by_user_and_status', ['userId', 'overallStatus']),

  // Receipt File Storage Metadata
  expenseReceipts: defineTable({
    userId: v.string(),
    expenseId: v.optional(v.string()), // Link to specific expense
    fileName: v.string(),
    fileUrl: v.string(), // Stored file URL
    fileSize: v.number(), // In bytes
    mimeType: v.string(), // "image/png", "application/pdf", etc.
    uploadedAt: v.number(),
    ocrStatus: v.optional(v.string()), // "pending", "processing", "completed", "failed"
    extractedData: v.optional(
      v.object({
        vendor: v.optional(v.string()),
        date: v.optional(v.string()),
        amount: v.optional(v.number()),
        description: v.optional(v.string()),
        confidence: v.optional(v.number()) // 0-100 OCR confidence
      })
    ),
    createdAt: v.number()
  }).index('by_user_and_expense', ['userId', 'expenseId']),

  // Expense Reports and Exports
  expenseReports: defineTable({
    userId: v.string(),
    reportType: v.string(), // "monthly_summary", "category_breakdown", "tax_summary", "cash_flow", "p&l"
    format: v.string(), // "pdf", "excel", "csv"
    fileName: v.string(),
    fileUrl: v.optional(v.string()),
    dateRange: v.object({
      startDate: v.number(),
      endDate: v.number()
    }),
    filters: v.optional(
      v.object({
        categories: v.optional(v.array(v.string())),
        type: v.optional(v.string()), // "business" | "personal"
        status: v.optional(v.string())
      })
    ),
    summary: v.optional(
      v.object({
        totalExpenses: v.number(),
        byCategory: v.optional(v.any()),
        taxDeductible: v.number(),
        reimbursable: v.number()
      })
    ),
    generatedAt: v.number(),
    expiresAt: v.optional(v.number()), // Auto-delete after time
    createdAt: v.number()
  }).index('by_user_and_type', ['userId', 'reportType']),

  // Phase 3.2: Advanced Reporting - Custom Report Templates
  customReports: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.string(), // "sales", "inventory", "customer", "financial"
    dataSource: v.string(), // Which data source: "sales", "transactions", "products", "payments"
    columns: v.array(v.string()), // Selected columns
    filters: v.array(
      v.object({
        field: v.string(),
        operator: v.string(), // "equals", "contains", "greater_than", "less_than", "between", "in"
        value: v.any()
      })
    ),
    groupBy: v.array(v.string()), // Fields to group by
    sortBy: v.array(
      v.object({
        field: v.string(),
        direction: v.string() // "asc", "desc"
      })
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  }).index('by_user_and_type', ['userId', 'type']),

  // Phase 3.2: Advanced Reporting - Scheduled Report Automation
  scheduledReports: defineTable({
    userId: v.string(),
    reportId: v.string(), // Reference to custom report
    schedule: v.string(), // "daily", "weekly", "monthly"
    timeOfDay: v.string(), // HH:MM format
    recipients: v.array(v.string()), // Email addresses
    format: v.string(), // "pdf", "excel", "pptx"
    includeCharts: v.boolean(),
    lastExecutionTime: v.optional(v.number()),
    nextExecutionTime: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  }).index('by_user_and_isActive', ['userId', 'isActive']),

  // Phase 3.2: Advanced Reporting - Report Execution History
  reportExecutions: defineTable({
    userId: v.string(),
    reportId: v.string(),
    executionTime: v.number(),
    durationMs: v.number(),
    rowsProcessed: v.number(),
    status: v.string(), // "completed", "failed", "pending"
    errorMessage: v.optional(v.string()),
    scheduledReportId: v.optional(v.string()), // If from automated schedule
    createdAt: v.number()
  }).index('by_user_and_reportId', ['userId', 'reportId']),

  // Phase 3.2: Advanced Reporting - Export Jobs
  reportExports: defineTable({
    userId: v.string(),
    reportId: v.string(),
    filename: v.string(),
    format: v.string(), // "excel", "pdf", "pptx"
    fileSize: v.number(),
    downloadUrl: v.optional(v.string()),
    status: v.string(), // "pending", "completed", "failed"
    includeCharts: v.boolean(),
    createdAt: v.number(),
    expiresAt: v.number() // Auto-cleanup after 7 days
  }).index('by_user_and_status', ['userId', 'status']),

  // ==================== Phase 3.1: Smart Automation ====================

  // Purchase Orders - Auto-generated when stock hits minimum
  purchaseOrders: defineTable({
    userId: v.string(),
    supplierId: v.string(),
    supplierName: v.string(),
    products: v.array(
      v.object({
        productId: v.string(),
        productName: v.string(),
        sku: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        totalAmount: v.number()
      })
    ),
    orderNumber: v.string(), // Auto-generated PO number
    totalAmount: v.number(),
    status: v.string(), // "draft", "sent", "confirmed", "received", "cancelled"
    paymentTerms: v.optional(v.string()), // "net30", "net60", "cash", etc.
    expectedDeliveryDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    isAutomatic: v.boolean(), // true if created by automation rule
    automationRuleId: v.optional(v.string()),
    createdAt: v.number(),
    sentAt: v.optional(v.number()),
    confirmedAt: v.optional(v.number()),
    receivedAt: v.optional(v.number()),
    updatedAt: v.optional(v.number())
  })
    .index('by_user', ['userId'])
    .index('by_supplier', ['supplierId'])
    .index('by_status', ['status'])
    .index('by_user_and_status', ['userId', 'status']),

  // Reconciliation Matching Log - Track matched transactions and invoices
  reconciliationMatches: defineTable({
    userId: v.string(),
    transactionId: v.string(),
    invoiceId: v.optional(v.string()),
    paymentId: v.optional(v.string()),
    transactionAmount: v.number(),
    invoiceAmount: v.number(),
    amountDifference: v.number(),
    matchType: v.string(), // "exact", "close", "manual"
    confidence: v.number(), // 0-100
    status: v.string(), // "pending", "confirmed", "rejected"
    notes: v.optional(v.string()),
    matchedBy: v.optional(v.string()), // User ID if manually matched
    createdAt: v.number(),
    confirmedAt: v.optional(v.number())
  })
    .index('by_user', ['userId'])
    .index('by_transaction', ['transactionId'])
    .index('by_status', ['status']),

  // Duplicate Record Detection Log
  duplicateDetectionLog: defineTable({
    userId: v.string(),
    entityType: v.string(), // "sales", "payments", "transactions"
    record1Id: v.string(),
    record2Id: v.string(),
    amount: v.number(),
    timeDifferenceMs: v.number(),
    similarityScore: v.number(), // 0-100
    status: v.string(), // "pending", "confirmed_duplicate", "false_positive", "merged"
    resolutionNotes: v.optional(v.string()),
    resolvedBy: v.optional(v.string()),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number())
  })
    .index('by_user', ['userId'])
    .index('by_status', ['status']),

  // Transaction Categorization Suggestions
  transactionCategoryMappings: defineTable({
    userId: v.string(),
    transactionId: v.string(),
    suggestedCategory: v.string(),
    confidence: v.number(), // 0-100
    keywords: v.array(v.string()), // Keywords that triggered the suggestion
    appliedCategory: v.optional(v.string()), // Category after user accepts/rejects
    status: v.string(), // "pending", "applied", "rejected"
    appliedAt: v.optional(v.number()),
    createdAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_transaction', ['transactionId'])
    .index('by_status', ['status']),

  // Bulk Operation Jobs
  bulkOperationJobs: defineTable({
    userId: v.string(),
    jobId: v.string(), // Unique job identifier
    entityType: v.string(), // "products", "sales", "transactions"
    operation: v.string(), // "updateStock", "categorize", "updatePrice", etc.
    targetIds: v.array(v.string()), // IDs of items to process
    operationParameters: v.any(), // Parameters for the operation
    status: v.string(), // "pending", "processing", "completed", "failed"
    successCount: v.number(),
    failureCount: v.number(),
    results: v.array(
      v.object({
        id: v.string(),
        status: v.string(),
        message: v.optional(v.string())
      })
    ),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_status', ['status']),

  // Physical Inventory Reconciliation
  inventoryReconciliations: defineTable({
    userId: v.string(),
    productId: v.string(),
    productName: v.string(),
    systemQuantity: v.number(),
    physicalQuantity: v.number(),
    variance: v.number(),
    variancePercent: v.number(),
    status: v.string(), // "flagged", "reconciled"
    location: v.string(),
    notes: v.optional(v.string()),
    reconciliationDate: v.number(),
    createdAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_status', ['status'])
    .index('by_date', ['createdAt']),

  // Price Change Requests
  priceChangeRequests: defineTable({
    userId: v.string(),
    productId: v.string(),
    productName: v.string(),
    oldPrice: v.number(),
    newPrice: v.number(),
    priceChangePercent: v.number(),
    reason: v.string(),
    requestedBy: v.string(),
    requiresApproval: v.boolean(),
    approvalStatus: v.string(), // "pending", "approved", "rejected", "auto_approved"
    approvedBy: v.optional(v.string()),
    approvalNotes: v.optional(v.string()),
    approvalDate: v.optional(v.number()),
    rejectedBy: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
    rejectionDate: v.optional(v.number()),
    createdAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_status', ['approvalStatus'])
    .index('by_date', ['createdAt']),

  // Discount Audit
  discountAudit: defineTable({
    userId: v.string(),
    transactionId: v.string(),
    amount: v.number(),
    discountType: v.string(), // "percentage", "fixed", "loyalty"
    appliedBy: v.string(),
    reason: v.string(),
    customerName: v.optional(v.string()),
    requiresApproval: v.boolean(),
    approvalStatus: v.string(), // "pending", "approved"
    createdAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_status', ['approvalStatus'])
    .index('by_date', ['createdAt']),

  // Tax Reports
  taxReports: defineTable({
    userId: v.string(),
    reportType: v.string(), // "monthly", "quarterly", "annual"
    startDate: v.number(),
    endDate: v.number(),
    totalTransactions: v.number(),
    totalSalesValue: v.number(),
    totalTaxCollected: v.number(),
    averageTaxRate: v.number(),
    summary: v.object({
      grossRevenue: v.number(),
      taxableIncome: v.number(),
      taxableTax: v.number(),
      penalties: v.number(),
      totalTaxDue: v.number()
    }),
    status: v.string(), // "generated", "filed", "paid"
    createdAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_type', ['reportType'])
    .index('by_date', ['createdAt']),

  // Tax Payments
  taxPayments: defineTable({
    userId: v.string(),
    amount: v.number(),
    paymentDate: v.number(),
    period: v.string(),
    referenceNumber: v.string(),
    paymentMethod: v.string(),
    status: v.string(), // "pending", "confirmed", "failed"
    receiptUrl: v.optional(v.string()),
    createdAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_status', ['status'])
    .index('by_date', ['createdAt']),

  // ==================== Enterprise: Multi-Location ====================

  locations: defineTable({
    userId: v.string(),
    name: v.string(),
    code: v.optional(v.string()),
    notes: v.optional(v.string()),
    isActive: v.boolean(),
    isDefault: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user', ['userId']),

  locationInventory: defineTable({
    userId: v.string(),
    productId: v.string(),
    locationId: v.id('locations'),
    quantity: v.number(),
    updatedAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_location', ['locationId'])
    .index('by_user_product', ['userId', 'productId'])
    .index('by_user_product_location', ['userId', 'productId', 'locationId']),

  stockTransfers: defineTable({
    userId: v.string(),
    productId: v.string(),
    productName: v.string(),
    sku: v.optional(v.string()),
    fromLocationId: v.id('locations'),
    toLocationId: v.id('locations'),
    quantity: v.number(),
    status: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_user_from', ['userId', 'fromLocationId'])
    .index('by_user_to', ['userId', 'toLocationId']),

  // ==================== Enterprise: Role-Based Teams ====================

  customRoles: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    permissions: v.array(v.string()),
    isSystem: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user', ['userId']),

  teams: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    locationLabel: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user', ['userId']),

  teamMembers: defineTable({
    userId: v.string(),
    teamId: v.id('teams'),
    memberKey: v.string(),
    displayName: v.string(),
    email: v.optional(v.string()),
    customRoleId: v.optional(v.id('customRoles')),
    createdAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_team', ['teamId'])
    .index('by_team_and_member', ['teamId', 'memberKey'])
    .index('by_user_and_member', ['userId', 'memberKey']),

  teamActivity: defineTable({
    userId: v.string(),
    actorKey: v.string(),
    teamId: v.optional(v.id('teams')),
    action: v.string(),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    details: v.optional(v.string()),
    createdAt: v.number()
  }).index('by_user', ['userId']),

  approvalWorkflows: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    transactionTypes: v.array(v.string()),
    steps: v.array(
      v.object({
        order: v.number(),
        label: v.string(),
        requiredRoleId: v.optional(v.id('customRoles'))
      })
    ),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user', ['userId']),

  approvalRequests: defineTable({
    userId: v.string(),
    workflowId: v.id('approvalWorkflows'),
    title: v.string(),
    resourceType: v.string(),
    resourceId: v.string(),
    amount: v.optional(v.number()),
    metadata: v.optional(v.any()),
    status: v.string(),
    currentStepIndex: v.number(),
    requestedBy: v.string(),
    history: v.array(
      v.object({
        stepIndex: v.number(),
        actorKey: v.string(),
        decision: v.string(),
        note: v.optional(v.string()),
        decidedAt: v.number()
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_user_status', ['userId', 'status']),

  // Communication Hub - In-app messaging
  messages: defineTable({
    senderId: v.string(), // Clerk userId of sender
    recipientId: v.string(), // Clerk userId of recipient
    content: v.string(), // Message body
    subject: v.optional(v.string()), // Optional subject line
    isRead: v.boolean(), // Read status for recipient
    readAt: v.optional(v.number()), // When recipient read the message
    attachmentIds: v.optional(v.array(v.id('messageAttachments'))), // File attachments
    replyToId: v.optional(v.id('messages')), // For message threading
    priority: v.string(), // "low", "normal", "high"
    tags: v.array(v.string()), // For organizing messages
    isArchived: v.boolean(), // User can archive messages
    isDeleted: v.boolean(), // Soft delete
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  })
    .index('by_user', ['recipientId', 'isDeleted'])
    .index('by_sender', ['senderId', 'isDeleted'])
    .index('by_thread', ['replyToId']),

  // File attachments for messages
  messageAttachments: defineTable({
    messageId: v.optional(v.id('messages')), // Parent message
    userId: v.string(), // Owner
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    storageUrl: v.string(), // URL to download the file
    uploadedAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_message', ['messageId']),

  // Task assignment and tracking
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    assigneeId: v.string(), // Clerk userId of person task is assigned to
    assignorId: v.string(), // Clerk userId of person who assigned the task
    status: v.string(), // "assigned", "in_progress", "completed", "cancelled"
    priority: v.string(), // "low", "medium", "high", "urgent"
    dueDate: v.optional(v.number()), // Deadline timestamp
    completedAt: v.optional(v.number()), // When task was completed
    relatedEntityType: v.optional(v.string()), // e.g., "sale", "purchase", "inventory"
    relatedEntityId: v.optional(v.string()), // Reference to related entity
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number())
  })
    .index('by_assignee', ['assigneeId'])
    .index('by_assignor', ['assignorId'])
    .index('by_status', ['assigneeId', 'status']),

  // Comments on tasks
  taskComments: defineTable({
    taskId: v.id('tasks'),
    authorId: v.string(), // Clerk userId
    content: v.string(),
    attachmentIds: v.optional(v.array(v.id('messageAttachments'))),
    isEdited: v.boolean(),
    editedAt: v.optional(v.number()),
    createdAt: v.number()
  }).index('by_task', ['taskId']),

  // User notification channel preferences
  notificationPreferences: defineTable({
    userId: v.string(), // Clerk userId
    emailEnabled: v.boolean(), // Receive email notifications
    smsEnabled: v.boolean(), // Receive SMS alerts
    slackEnabled: v.boolean(), // Receive Slack messages
    inAppEnabled: v.boolean(), // Receive in-app notifications
    notificationTypes: v.object({
      taskAssigned: v.boolean(),
      taskCompleted: v.boolean(),
      messageReceived: v.boolean(),
      lowStock: v.boolean(),
      paymentDue: v.boolean(),
      reportReady: v.boolean(),
      systemAlert: v.boolean()
    }),
    quietHours: v.optional(
      v.object({
        enabled: v.boolean(),
        startTime: v.string(), // "09:00" format
        endTime: v.string(), // "17:00" format
        timezone: v.optional(v.string())
      })
    ),
    slackWorkspaceId: v.optional(v.string()), // For Slack integration
    slackUserId: v.optional(v.string()), // Slack user handle
    phoneNumber: v.optional(v.string()), // For SMS
    updatedAt: v.number(),
    createdAt: v.number()
  }).index('by_user', ['userId']),

  // User feedback
  feedback: defineTable({
    userId: v.string(),
    title: v.string(),
    message: v.string(),
    category: v.string(), // "bug", "feature", "improvement", "other"
    rating: v.number(), // 1-5
    email: v.optional(v.string()),
    attachmentUrl: v.optional(v.string()),
    isRead: v.boolean(),
    isResolved: v.boolean(),
    response: v.optional(v.string()),
    respondedBy: v.optional(v.string()),
    respondedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_isRead', ['isRead'])
    .index('by_isResolved', ['isResolved'])
    .index('by_createdAt', ['createdAt']),

  users: defineTable({
    userId: v.string(), // Clerk user ID (identity.subject)
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    username: v.string(), // For @mentions
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_userId', ['userId'])
    .index('by_username', ['username']),

  // DEPRECATED: Use companyMembers for invitations. Keep this only for public signup links.
  // This table now serves as backup for public ?invite=TOKEN flow
  invitations: defineTable({
    organizationId: v.string(), // Owner/tenant userId
    companyName: v.optional(v.string()), // Pre-filled company context
    companyGST: v.optional(v.string()),
    email: v.string(),
    name: v.string(),
    roleId: v.optional(v.id('customRoles')),
    permissions: v.array(v.string()),
    status: v.union(
      v.literal('pending'),
      v.literal('accepted'),
      v.literal('expired')
    ),
    invitedBy: v.string(), // Clerk user ID who invited
    invitedAt: v.number(),
    acceptedAt: v.optional(v.number()),
    token: v.string(), // Unique invitation token
    expiresAt: v.number()
  })
    .index('by_token', ['token'])
    .index('by_email', ['email'])
    .index('by_organization', ['organizationId'])
});
