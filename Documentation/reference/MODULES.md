# Invento Modules

Module descriptions, responsibilities, and key files.

## Module Reference

### AUTH Module
**File**: `src/features/auth/`

**Responsibility**: 
- User authentication and registration
- Organization creation and management
- User role and permission handling
- Session management

**Key Files**:
- `hooks/useAuth.ts` - Auth state hook
- `hooks/useAuthRedirect.ts` - Redirect logic
- `components/SignInView.tsx` - Login UI
- `components/SignUpView.tsx` - Signup UI
- `components/UserAuthForm.tsx` - Form handling
- `providers/ConvexProvider.tsx` - Auth context provider

**Dependencies**:
- `@clerk/clerk-react` - User identity
- `@clerk/nextjs` - Server-side auth
- Convex - Session storage

**Integration Points**:
- All authenticated routes require ConvexProvider
- Organization context available after auth
- Admin role enables access to admin features

---

### PRODUCTS Module
**Files**: 
- `convex/products.ts` - Backend
- `src/app/(main)/(authenticated)/dashboard/product/`

**Responsibility**:
- Product lifecycle management (CRUD)
- Inventory tracking
- Product search and filtering
- Stock level management

**Key Convex Functions**:
- `createProduct()` - Add new product
- `updateProduct()` - Modify product details
- `deleteProduct()` - Remove product
- `getProducts()` - Fetch product list (paginated)
- `getProduct()` - Fetch single product
- `searchProducts()` - Search functionality

**Data Model**:
```
Product {
  _id: Id
  organization: Id      // Org context
  name: string          // Product name
  sku: string          // Unique identifier
  category: string     // Product category
  quantity: number     // Current stock
  price: number        // Selling price
  costPrice: number    // Cost per unit
  supplier: Id         // Link to supplier
  description: string
  image: string        // Image URL (EdgeStore)
  createdAt: Date
  updatedAt: Date
}
```

**Related Modules**:
- SUPPLIERS - Source of products
- SALES - Product consumption
- LEDGER - Inventory changes

---

### SUPPLIERS Module
**Files**:
- `convex/suppliers.ts` - Backend
- `src/app/(main)/(authenticated)/dashboard/product/supplier/`

**Responsibility**:
- Vendor/supplier management
- Supplier contact information
- Supply history and relationships
- Purchase order tracking

**Key Convex Functions**:
- `createSupplier()` - Add supplier
- `updateSupplier()` - Modify supplier
- `deleteSupplier()` - Remove supplier
- `getSuppliers()` - List all suppliers
- `getSupplier()` - Fetch single supplier

**Data Model**:
```
Supplier {
  _id: Id
  organization: Id      // Org context
  name: string          // Company name
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  paymentTerms: string  // Agreed terms
  products: Id[]        // List of product IDs
  createdAt: Date
}
```

**Related Modules**:
- PRODUCTS - Products supplied
- SALES - Order history
- LEDGER - Payment records

---

### SALES Module
**Files**:
- `convex/sales.ts` - Backend
- `src/app/(main)/(authenticated)/restock/` (confusing: actually sales tracking)

**Responsibility**:
- Sales order creation and management
- Customer transaction tracking
- Invoice generation
- Sales analytics

**Key Convex Functions**:
- `createSale()` - Record new sale
- `getSales()` - Fetch sales list
- `getSale()` - Fetch single sale
- `updateSaleStatus()` - Update delivery status
- `generateInvoice()` - Create invoice

**Data Model**:
```
Sale {
  _id: Id
  organization: Id
  customer: string       // Customer name
  products: [{
    productId: Id
    quantity: number
    price: number        // Price at sale time
  }]
  total: number         // Total amount
  status: "pending" | "delivered" | "cancelled"
  paymentStatus: "unpaid" | "partial" | "paid"
  invoiceGenerated: boolean
  createdAt: Date
  deliveredAt: Date
}
```

**Related Modules**:
- PRODUCTS - Stock deduction
- BILLING - Payment processing
- LEDGER - Revenue recording

---

### LEDGER Module
**Files**:
- `convex/ledger.ts` - Backend
- `src/app/(main)/(authenticated)/ledger/`

**Responsibility**:
- Financial record-keeping
- Audit trail for all operations
- Balance tracking
- Report generation

**Key Convex Functions**:
- `recordTransaction()` - Add ledger entry
- `getTransactions()` - Fetch transactions
- `getBalance()` - Calculate current balance
- `getReport()` - Generate financial report

**Data Model**:
```
LedgerEntry {
  _id: Id
  organization: Id
  type: "debit" | "credit"
  category: string       // "sale", "purchase", "expense"
  amount: number
  relatedEntity: Id      // Reference to source
  description: string
  createdAt: Date
}
```

**Related Modules**:
- SALES - Revenue entries
- PRODUCTS - Inventory adjustments
- BILLING - Payment records

---

### BILLING Module
**Files**:
- `convex/billing.ts` - Backend
- `src/app/(main)/(authenticated)/billing/`

**Responsibility**:
- Payment processing
- Invoice management
- Subscription handling
- Razorpay integration

**Key Convex Functions**:
- `createInvoice()` - Generate invoice
- `processPayment()` - Handle payment
- `getInvoices()` - List invoices
- `updateSubscription()` - Change plan

**Data Model**:
```
Invoice {
  _id: Id
  organization: Id
  saleId: Id            // Link to sale
  invoiceNumber: string // Unique per org
  amount: number
  status: "draft" | "sent" | "paid" | "overdue"
  dueDate: Date
  createdAt: Date
}

Payment {
  _id: Id
  organization: Id
  invoiceId: Id
  razorpayId: string    // Razorpay payment ID
  amount: number
  status: "success" | "failed"
  createdAt: Date
}
```

**Related Modules**:
- SALES - Invoice source
- LEDGER - Payment recording

---

### ORGANIZATIONS Module
**Files**:
- `convex/organizations.ts` - Backend
- `src/app/(auth)/company-details/` - Company setup

**Responsibility**:
- Multi-tenant support
- Organization creation and settings
- User invitations
- Company metadata

**Key Convex Functions**:
- `createOrganization()` - Create new org
- `getOrganization()` - Fetch org details
- `updateOrganization()` - Modify settings
- `inviteUser()` - Add user to org

**Data Model**:
```
Organization {
  _id: Id
  ownerId: Id           // Owner user ID (Clerk)
  name: string
  description: string
  logo: string          // URL to company logo
  address: string
  city: string
  country: string
  phone: string
  email: string
  members: [{
    userId: Id
    role: "owner" | "manager" | "staff"
  }]
  createdAt: Date
}
```

**Related Modules**:
- AUTH - User role management
- All modules - Data isolation context

---

### ADMIN Module
**Files**:
- `convex/admin.ts` - Backend
- `src/app/(developer-admin-page)/admin/` - Admin UI

**Responsibility**:
- System administration
- Developer controls
- Data inspection and manipulation
- User management

**Access Level**: Admin role only

**Key Convex Functions**:
- `getAllUsers()` - System-wide user list
- `getSystemStats()` - Usage statistics
- `deleteOrganization()` - Remove org (dangerous)
- `inspectData()` - Debug data access

---

## Module Dependencies

```
AUTH (Foundation)
  ├─ ORGANIZATIONS
  │  └─ All other modules
  ├─ PRODUCTS
  │  ├─ SUPPLIERS
  │  ├─ SALES
  │  └─ LEDGER
  ├─ BILLING
  │  ├─ SALES
  │  └─ LEDGER
  └─ ADMIN
     └─ System-wide access
```

## Integration Checklist

When building a new feature:

1. **Organization Context**: Ensure org isolation
2. **Authentication**: Verify user auth state
3. **Permissions**: Check user role
4. **Transactions**: Use Convex mutations atomically
5. **Ledger**: Record in ledger if financial
6. **Real-time**: Add subscriptions if dashboard data
7. **Testing**: Unit test each module independently
8. **Documentation**: Update this file

