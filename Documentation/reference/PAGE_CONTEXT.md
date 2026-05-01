# Invento - Page Context Documentation

> Comprehensive documentation for all pages in the Invento inventory management system. This file provides developers with the objective, aim, scope, usage, users, permissions, advanced features, and future roadmap for each page.

---

## Table of Contents

- [Page Overview](#page-overview)
- [Roles & Permissions](#roles--permissions)
- [Page Categories](#page-categories)
- [Auth Pages](#auth-pages)
- [Onboarding Pages](#onboarding-pages)
- [Main Dashboard Pages](#main-dashboard-pages)
- [Product Pages](#product-pages)
- [Billing & Invoice Pages](#billing--invoice-pages)
- [Settings Pages](#settings-pages)
- [Reports Pages](#reports-pages)
- [Communication Pages](#communication-pages)
- [Admin Pages](#admin-pages)
- [Marketing & Public Pages](#marketing--public-pages)
- [Dev Tools Pages](#dev-tools-pages)
- [Future Features](#future-features)

---

## Page Overview

| Page | Route | Objective | Target Users |
|------|-------|-----------|--------------|
| Landing Page | `/` | Marketing & lead capture | Public visitors, potential customers |
| Sign In | `/sign-in` | User authentication | Existing users |
| Sign Up | `/sign-up` | New user registration | New customers |
| Company Registration | `/company-registration` | Company/firm setup | New business owners |
| Email Verification | `/verify-email` | Email verification | New users |
| Onboarding Setup | `/onboarding/setup` | Initial account setup | New users post-signup |
| Business Details Setup | `/business-details-setup` | Business information collection | New business owners |
| Dashboard Overview | `/dashboard/overview` | Main dashboard with KPIs | All authenticated users |
| Products | `/dashboard/product` | Product management | Sales, managers, admins |
| Product Details | `/dashboard/product/[productId]` | Single product view/edit | Sales, managers, admins |
| Categories | `/dashboard/product/category` | Category management | Managers, admins |
| Suppliers | `/dashboard/product/supplier` | Supplier management | Procurement, managers |
| Billing | `/billing` | Invoice/credit management | Finance, sales |
| Creditors Payments | `/billing/creditors/payments` | Payment tracking | Finance, admins |
| Invoice View | `/billing/[invoiceType]/[invoiceNumber]` | Single invoice view | All users |
| Invoice Generation | `/invoice-generation` | Create invoices | Sales, admins |
| Ledger | `/ledger` | Financial transactions | Finance, managers |
| Expenses | `/expenses` | Expense tracking | Finance, all users |
| Restock | `/restock` | Stock replenishment | Procurement, managers |
| Inventory Forecast | `/inventory-forecast` | Stock prediction | Managers, admins |
| Inventory Audit | `/inventory-audit` | Stock verification | Managers, auditors |
| Locations | `/locations` | Warehouse/store management | Managers, admins |
| Supplier Management | `/supplier-management` | Vendor management | Procurement, managers |
| Procurement | `/procurement` | Purchase orders | Procurement, managers |
| Reports - Sales | `/reports/sales` | Sales analytics | Managers, admins |
| Reports - Stock | `/reports/stock` | Stock reports | Managers, admins |
| Reports - Financial | `/reports/financial` | Financial reports | Finance, admins |
| Settings | `/settings` | Main settings hub | All users |
| Settings - Account | `/settings/account` | Account management | All users |
| Settings - Profile | `/settings/profile` | User profile | All users |
| Settings - Organization | `/settings/organization` | Company settings | Admins, owners |
| Settings - Security | `/settings/security` | Security settings | All users |
| Settings - Appearance | `/settings/appearance` | UI preferences | All users |
| Settings - Display | `/settings/display` | Display options | All users |
| Settings - Notifications | `/settings/notifications` | Notification prefs | All users |
| Settings - Integration | `/settings/integrations` | Third-party apps | Admins |
| Settings - API | `/settings/api` | API access | Developers, admins |
| Settings - Automation | `/settings/automation` | Workflow automation | Managers, admins |
| Settings - Data | `/settings/data` | Data management | Admins |
| Settings - Billing | `/settings/billing` | Subscription billing | Owners |
| Settings - Users | `/settings/users` | Team management | Managers, admins |
| Help Center | `/help-center` | Support resources | All users |
| Feedback | `/feedback` | User feedback | All users |
| Company Admin | `/company-admin` | Company management | Company owners |
| Organization | `/organization` | Org switcher | Multi-org users |
| Communication Hub | `/communication` | Team messaging | All users |
| Communication - Tasks | `/communication/tasks` | Task management | Teams |
| Communication - Inbox | `/communication/inbox` | Messages | Teams |
| Communication - Notifications | `/communication/notifications` | Alerts | Teams |
| Admin Dashboard | `/admin` | Developer admin | Developers |
| Super Admin | `/super-admin` | System admin | Super admins |
| Access Denied | `/access-denied` | Permission error | Unauthorized users |
| Cookie Policy | `/cookie-policy` | Legal | Public visitors |
| Terms | `/terms` | Legal | Public visitors |
| Privacy | `/privacy` | Legal | Public visitors |
| Database Browser | `/database` | Dev data browser | Developers |
| Database Table | `/database/[table]` | Table data view | Developers |

---

## Roles & Permissions

### User Roles

| Role | Description | Permission Level |
|------|-------------|-------------------|
| `owner` | Business owner, full access | 100 (highest) |
| `admin` | Admin with management access | 75 |
| `manager` | Department manager | 50 |
| `staff` | Sales/operations staff | 25 |
| `viewer` | Read-only access | 10 (lowest) |

### Permission Categories

The system uses granular permissions from `permissionCatalog.ts`:

```typescript
// Core permissions
- view_inventory        // View products and stock
- create_transaction    // Create sales/payments
- edit_transaction     // Edit existing transactions
- delete_transaction  // Delete transactions
- export_data        // Export data
- view_reports       // View analytics

// Management permissions
- manage_users       // Team management
- view_audit_logs  // Audit log access
- manage_settings  // Settings management

// Compliance & Workflow
- view_compliance    // Compliance reports
- approve_transaction // Workflow approvals
```

### Role-Based Access

| Feature | Owner | Admin | Manager | Staff | Viewer |
|---------|------|-------|--------|-------|-------|
| View Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create Products | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit Products | ✓ | ✓ | ✓ | ✗ | ✗ |
| Delete Products | ✓ | ✓ | ✗ | ✗ | ✗ |
| View Reports | ✓ | ✓ | ✓ | ✓ | ✗ |
| Export Data | ✓ | ✓ | ✓ | ✗ | ✗ |
| Manage Team | ✓ | ✓ | ✗ | ✗ | ✗ |
| Settings | ✓ | ✓ | ✗ | ✗ | ✗ |
| Billing | ✓ | ✓ | ✓ | ✗ | ✗ |
| Audit Logs | ✓ | ✓ | ✓ | ✗ | ✗ |

---

## Page Categories

### Auth Pages

#### Sign In (`/sign-in`)
- **Objective**: Authenticate existing users
- **Aim**: Secure login with Clerk
- **Scope**: Email/password or social login
- **Users**: Existing authenticated users
- **Permissions**: Public (no auth required)
- **Features**:
  - Email/password authentication
  - Social sign-in (Google, etc.)
  - Password reset flow
  - Remember device option
- **Tech Stack**: Clerk `SignIn` component
- **Current Features**: Clerk-managed
- **Future**: Multi-factor authentication

#### Sign Up (`/sign-up`)
- **Objective**: Register new users
- **Aim**: Create Clerk account
- **Scope**: New user registration
- **Users**: Public visitors
- **Permissions**: Public
- **Features**:
  - Email/password signup
  - Social sign-up
  - Business type selection
- **Tech Stack**: Clerk `SignUp` component
- **Current Features**: Clerk-managed
- **Future**: Enhanced onboarding flow

#### Company Registration (`/company-registration`)
- **Objective**: Create company/firm
- **Aim**: Business setup during signup
- **Scope**: Company details collection
- **Users**: New business owners
- **Permissions**: Public (after auth)
- **Features**:
  - Company name input
  - Business type selection
  - Address collection
  - Tax number (VAT/PAN)
- **Tech Stack**: Custom form + Convex
- **Future**: Multi-branch setup, business verification

#### Verify Email (`/verify-email`)
- **Objective**: Verify user email
- **Aim**: OTP verification
- **Scope**: Email validation
- **Users**: New users
- **Permissions**: Authenticated users
- **Features**:
  - OTP generation
  - Email input
  - Resend OTP
- **Tech Stack**: Convex + email service

---

### Onboarding Pages

#### Onboarding Setup (`/onboarding/setup`)
- **Objective**: Complete account setup
- **Aim**: Initial configuration
- **Scope**: First-time setup wizard
- **Users**: New authenticated users
- **Permissions**: Authenticated, pending setup
- **Features**:
  - Company details
  - Business type
  - Tax information
  - Currency selection
  - Timezone setup
- **Redirects to**: `/dashboard/overview` on completion
- **Future**: Skip option, account templates

#### Business Details Setup (`/business-details-setup`)
- **Objective**: Collect business info
- **Aim**: Required for invoice generation
- **Scope**: Business details for legal invoices
- **Users**: Business owners
- **Permissions**: Authenticated users
- **Features**:
  - Company name
  - Address
  - Phone numbers
  - Email
  - VAT/PAN number
  - Logo upload
- **Required for**: Invoice generation (legal requirement)

---

### Main Dashboard Pages

#### Dashboard Overview (`/dashboard/overview`)
- **Objective**: Central KPIs and metrics
- **Aim**: At-a-glance business health
- **Scope**: Today's sales, stock alerts, recent activity
- **Users**: All authenticated users
- **Permissions**: `view_inventory`
- **Features**:
  - Sales stats (today, week, month)
  - Stock alerts (low/out of stock)
  - Recent transactions
  - Top products
  - Revenue charts
  - Area stats (parallel route)
  - Bar stats (parallel route)
  - Pie stats (parallel route)
  - Sales pipeline (parallel route)
- **Parallel Routes**:
  - `@area_stats` - Area chart
  - `@bar_stats` - Bar chart
  - `@pie_stats` - Pie chart
  - `@sales` - Sales pipeline

#### Help Center (`/help-center`)
- **Objective**: Self-service support
- **Aim**: Help articles and guides
- **Scope**: Product documentation
- **Users**: All users
- **Permissions**: Public (after auth)
- **Features**:
  - Searchable help articles
  - Category browsing
  - Video tutorials
  - FAQ section
  - Contact support option

#### Feedback (`/feedback`)
- **Objective**: Collect user feedback
- **Aim**: Product improvement
- **Scope**: Feedback submission
- **Users**: All users
- **Permissions**: Authenticated
- **Features**:
  - Feedback form
  - Bug report
  - Feature request
  - Rating system

---

### Product Pages

#### Products (`/dashboard/product`)
- **Objective**: Product management
- **Aim**: CRUD operations on inventory
- **Scope**: All products
- **Users**: Sales, managers, admins
- **Permissions**: `view_inventory`, `create_transaction`
- **Features**:
  - Product listing (grid/table)
  - Search and filter
  - Category filter
  - Stock status filter
  - Add new product
  - Import products
  - Export products
- **Future**: Barcode scanning, bulk edit

#### Product Details (`/dashboard/product/[productId]`)
- **Objective**: Single product view
- **Aim**: View/edit product details
- **Scope**: Individual product
- **Users**: Sales, managers
- **Permissions**: `view_inventory`
- **Features**:
  - Product info display
  - Stock history
  - Sales history
  - Edit product
  - Delete product
- **Future**: Price history, analytics

#### Product View (`/dashboard/product/(product)/view/[productId]`)
- **Objective**: Alternative product view
- **Aim**: Read-only view
- **Scope**: Single product display
- **Users**: All users
- **Features**: Similar to details but read-only

#### Categories (`/dashboard/product/category`)
- **Objective**: Category management
- **Aim**: Organize products
- **Scope**: Product categories
- **Users**: Managers, admins
- **Permissions**: `manage_settings`
- **Features**:
  - Category listing
  - Add category
  - Edit category
  - Delete category
  - Product count per category

#### Category Details (`/dashboard/product/category/[categoryId]`)
- **Objective**: Single category
- **Aim**: View products in category
- **Scope**: Category + products
- **Users**: All users
- **Features**:
  - Category info
  - Products in category

#### Suppliers (`/dashboard/product/supplier`)
- **Objective**: Supplier management
- **Aim**: Vendor relationships
- **Scope**: All suppliers
- **Users**: Procurement, managers
- **Permissions**: `view_inventory`
- **Features**:
  - Supplier listing
  - Add supplier
  - Edit supplier
  - Delete supplier
  - Products by supplier

#### Supplier Details (`/dashboard/product/supplier/[supplierId]`)
- **Objective**: Single supplier
- **Aim**: View supplier + products
- **Scope**: Individual supplier
- **Users**: Procurement, managers
- **Features**:
  - Supplier info
  - Products from supplier

---

### Billing & Invoice Pages

#### Billing (`/billing`)
- **Objective**: Invoice management
- **Aim**: Track sales invoices
- **Scope**: All invoices
- **Users**: Finance, sales, admins
- **Permissions**: `view_inventory`, `create_transaction`
- **Features**:
  - Invoice listing
  - Create invoice
  - Filter by status
  - Payment tracking
  - Due date management
- **Future**: Recurring invoices

#### Invoice View (`/billing/[invoiceType]/[invoiceNumber]`)
- **Objective**: View single invoice
- **Aim**: Invoice details
- **Scope**: Individual invoice
- **Users**: All users
- **Features**:
  - Invoice items
  - Tax calculations
  - Print invoice
  - Download PDF

#### Invoice Generation (`/invoice-generation`)
- **Objective**: Create new invoice
- **Aim**: Generate legal invoice
- **Scope**: Sales transactions
- **Users**: Sales, admins
- **Permissions**: `create_transaction`
- **Features**:
  - Product selection
  - Quantity input
  - Tax calculation
  - Customer details
  - Save as draft
  - Generate invoice number

#### Creditors Payments (`/billing/creditors/payments`)
- **Objective**: Track creditor payments
- **Aim**: Payment management
- **Scope**: Supplier payments
- **Users**: Finance, admins
- **Permissions**: `create_transaction`
- **Features**:
  - Payment list
  - Record payment
  - Payment history
  - Outstanding balance

---

### Ledger & Finance Pages

#### Ledger (`/ledger`)
- **Objective**: Financial audit trail
- **Aim**: Transaction history
- **Scope**: All financial entries
- **Users**: Finance, managers, admins
- **Permissions**: `view_audit_logs`
- **Features**:
  - Transaction listing
  - Filter by date
  - Filter by type
  - Running balance
  - Export to Excel
- **Future**: Reconciliation tools

#### Expenses (`/expenses`)
- **Objective**: Expense tracking
- **Aim**: Record business expenses
- **Scope**: All expenses
- **Users**: Finance, all users
- **Permissions**: `create_transaction`
- **Features**:
  - Expense list
  - Add expense
  - Category filter
  - Receipt upload
  - Monthly reports

---

### Inventory Pages

#### Restock (`/restock`)
- **Objective**: Stock replenishment
- **Aim**: Reorder products
- **Scope**: Low stock items
- **Users**: Procurement, managers
- **Permissions**: `create_transaction`, `view_inventory`
- **Features**:
  - Low stock alerts
  - One-click reorder
  - Supplier lookup
  - Order history

#### Inventory Forecast (`/inventory-forecast`)
- **Objective**: Demand prediction
- **Aim**: AI-powered forecasting
- **Scope**: Stock predictions
- **Users**: Managers, admins
- **Permissions**: `view_reports`
- **Features**:
  - Demand forecasting
  - Seasonal trends
  - Reorder recommendations
  - Historical analysis
- **Future**: ML-powered predictions

#### Inventory Audit (`/inventory-audit`)
- **Objective**: Stock verification
- **Aim**: Physical count verification
- **Scope**: Stock reconciliation
- **Users**: Managers, auditors
- **Permissions**: `view_audit_logs`
- **Features**:
  - Audit checklists
  - Variance reports
  - Discrepancy tracking

#### Locations (`/locations`)
- **Objective**: Multi-location support
- **Aim**: Warehouse/store management
- **Scope**: All locations
- **Users**: Managers, admins
- **Permissions**: `manage_settings`
- **Features**:
  - Location listing
  - Add location
  - Stock by location
  - Transfer between locations
- **Future**: GPS tracking, bin management

---

### Supplier & Procurement Pages

#### Supplier Management (`/supplier-management`)
- **Objective**: Vendor management
- **Aim**: Complete supplier records
- **Scope**: All vendors
- **Users**: Procurement, managers
- **Permissions**: `view_inventory`
- **Features**:
  - Supplier directory
  - Contact management
  - Order history
  - Performance tracking

#### Procurement (`/procurement`)
- **Objective**: Purchase orders
- **Aim**: PO management
- **Scope**: Purchase workflow
- **Users**: Procurement, managers
- **Permissions**: `create_transaction`
- **Features**:
  - Create PO
  - PO approval workflow
  - Receive goods
  - Vendor comparison

---

### Reports Pages

#### Sales Reports (`/reports/sales`)
- **Objective**: Sales analytics
- **Aim**: Sales performance
- **Scope**: Sales data
- **Users**: Managers, admins
- **Permissions**: `view_reports`
- **Features**:
  - Sales by product
  - Sales by customer
  - Sales by date
  - Profit margins
  - Export reports

#### Stock Reports (`/reports/stock`)
- **Objective**: Stock reports
- **Aim**: Inventory status
- **Scope**: Stock data
- **Users**: Managers, admins
- **Permissions**: `view_reports`
- **Features**:
  - Stock levels
  - Slow-moving items
  - Stock turnover
  - Reorder alerts

#### Financial Reports (`/reports/financial`)
- **Objective**: Financial reports
- **Aim**: Business profitability
- **Scope**: Financial data
- **Users**: Finance, admins
- **Permissions**: `view_reports`
- **Features**:
  - Profit & Loss
  - Cash flow
  - Expense breakdown
  - Tax reports

---

### Settings Pages

#### Main Settings (`/settings`)
- **Objective**: Settings hub
- **Aim**: Central navigation
- **Scope**: All settings
- **Users**: All authenticated users

#### Account Settings (`/settings/account`)
- **Objective**: Account management
- **Aim**: User account
- **Scope**: Personal account
- **Users**: All users
- **Features**:
  - Email change
  - Password change
  - Personal info

#### Profile Settings (`/settings/profile`)
- **Objective**: User profile
- **Aim**: Profile management
- **Scope**: User details
- **Users**: All users
- **Features**:
  - Display name
  - Avatar upload
  - Contact info

#### Organization Settings (`/settings/organization`)
- **Objective**: Company settings
- **Aim**: Business configuration
- **Scope**: Company details
- **Users**: Managers, admins
- **Permissions**: `manage_settings`
- **Features**:
  - Company name
  - Address
  - Logo
  - Business hours

#### Security Settings (`/settings/security`)
- **Objective**: Security management
- **Aim**: Account security
- **Scope**: Security features
- **Users**: All users
- **Features**:
  - Password update
  - Two-factor auth
  - Active sessions
  - Login history

#### Appearance Settings (`/settings/appearance`)
- **Objective**: UI customization
- **Aim**: Theme preferences
- **Scope**: Visual settings
- **Users**: All users
- **Features**:
  - Light/Dark mode
  - Accent color
  - Font size
  - Compact mode

#### Display Settings (`/settings/display`)
- **Objective**: Display options
- **Aim**: UI preferences
- **Scope**: Display config
- **Users**: All users
- **Features**:
  - Dashboard widgets
  - Default views
  - Quick actions

#### Notification Settings (`/settings/notifications`)
- **Objective**: Notification preferences
- **Aim**: Alert customization
- **Scope**: Notification channels
- **Users**: All users
- **Features**:
  - Email notifications
  - In-app notifications
  - Push notifications
  - Low stock alerts

#### Integrations (`/settings/integrations`)
- **Objective**: Third-party apps
- **Aim**: Connect external services
- **Scope**: Available integrations
- **Users**: Admins
- **Permissions**: `manage_settings`
- **Features**:
  - Available integrations
  - Connect apps
  - Manage connections
  - API keys

#### API Settings (`/settings/api`)
- **Objective**: Developer access
- **Aim**: API key management
- **Scope**: API access
- **Users**: Developers, admins
- **Permissions**: `manage_settings`
- **Features**:
  - Generate API keys
  - View API docs
  - Rate limits
  - Usage stats

#### Automation (`/settings/automation`)
- **Objective**: Workflow automation
- **Aim**: Automate processes
- **Scope**: Automation rules
- **Users**: Managers, admins
- **Permissions**: `manage_settings`
- **Features**:
  - Automation triggers
  - Action recipes
  - Scheduled tasks
  - Webhooks

#### Data Management (`/settings/data`)
- **Objective**: Data operations
- **Aim**: Import/export/backup
- **Scope**: User data
- **Users**: Admins
- **Permissions**: `manage_settings`
- **Features**:
  - Import data
  - Export data
  - Backup/restore
  - Data cleanup

#### Billing Settings (`/settings/billing`)
- **Objective**: Subscription management
- **Aim**: Plan and payment
- **Scope**: Billing info
- **Users**: Owners
- **Permissions**: Owner only
- **Features**:
  - Current plan
  - Upgrade/downgrade
  - Payment method
  - Invoice history
  - Cancel subscription

#### Users & Permissions (`/settings/users`)
- **Objective**: Team management
- **Aim**: User roles and access
- **Scope**: Team members
- **Users**: Managers, admins
- **Permissions**: `manage_users`
- **Features**:
  - Team listing
  - Invite members
  - Role assignment
  - Permission management
  - Remove members

---

### Communication Pages

#### Communication Hub (`/communication`)
- **Objective**: Team communication
- **Aim**: Internal messaging
- **Scope**: Team collaboration
- **Users**: All team members
- **Features**:
  - Unified inbox
  - Tasks
  - Notifications
- **Future**: Real-time chat

#### Communication - Tasks (`/communication/tasks`)
- **Objective**: Task management
- **Aim**: Team task coordination
- **Scope**: Task workflow
- **Users**: Team members
- **Features**:
  - Task list
  - Create task
  - Assign tasks
  - Status tracking
  - Due dates

#### Communication - Inbox (`/communication/inbox`)
- **Objective**: Message inbox
- **Aim**: Internal messages
- **Scope**: Direct messages
- **Users**: Team members
- **Features**:
  - Message list
  - Compose message
  - Read message

#### Communication - Notifications (`/communication/notifications`)
- **Objective**: Notification center
- **Aim**: System alerts
- **Scope**: All notifications
- **Users**: All users
- **Features**:
  - Notification list
  - Filter by type
  - Mark as read
  - Clear all

---

### Organization Pages

#### Organization (`/organization`)
- **Objective**: Multi-org switcher
- **Aim**: Switch between organizations
- **Scope**: User organizations
- **Users**: Multi-org users
- **Features**:
  - Organization list
  - Switch org
  - Create org
  - Join org
- **Future**: Organization analytics

#### Company Admin (`/company-admin`)
- **Objective**: Company management
- **Aim**: Company-level admin
- **Scope**: Company settings
- **Users**: Company owners
- **Features**:
  - Company overview
  - Team management
  - Billing overview

---

### Admin Pages

#### Admin Dashboard (`/admin`)
- **Objective**: Developer administration
- **Aim**: System monitoring (dev)
- **Scope**: Development tools
- **Users**: Developers
- **Permissions**: Developer access only
- **Features**:
  - System logs
  - Test endpoints
  - Dev utilities

#### Super Admin (`/super-admin`)
- **Objective**: Super admin panel
- **Aim**: System-wide admin
- **Scope**: All users/organizations
- **Users**: Super admins
- **Permissions**: Super admin only
- **Features**:
  - User management
  - Organization management
  - System health
  - Analytics

#### Access Denied (`/access-denied`)
- **Objective**: Permission error page
- **Aim**: Unauthorized access
- **Scope**: Permission errors
- **Users**: Unauthorized users
- **Features**:
  - Error message
  - Return home link

---

### Marketing & Public Pages

#### Landing Page (`/`)
- **Objective**: Marketing homepage
- **Aim**: Lead capture and conversion
- **Scope**: Public marketing
- **Users**: Public visitors
- **Permissions**: Public
- **Features**:
  - Product features
  - Pricing
  - Testimonials
  - CTA buttons
  - Contact form

#### Terms (`/terms`)
- **Objective**: Terms of service
- **Aim**: Legal compliance
- **Scope**: Terms document
- **Users**: Public visitors
- **Permissions**: Public

#### Privacy (`/privacy`)
- **Objective**: Privacy policy
- **Aim**: Data protection compliance
- **Scope**: Privacy document
- **Users**: Public visitors
- **Permissions**: Public

#### Cookie Policy (`/cookie-policy`)
- **Objective**: Cookie disclosure
- **Aim**: GDPR compliance
- **Scope**: Cookie policy
- **Users**: Public visitors
- **Permissions**: Public

---

### Dev Tools Pages

#### Database Browser (`/database`)
- **Objective**: Data browser
- **Aim**: Development data view
- **Scope**: Dev environment
- **Users**: Developers
- **Permissions**: Developer only
- **Features**:
  - Table list
  - Data view
  - Query builder
- **Tech Stack**: Convex dashboard

#### Database Table (`/database/[table]`)
- **Objective**: Individual table view
- **Aim**: Table data inspection
- **Scope**: Single table
- **Users**: Developers
- **Features**:
  - Row data
  - Add/edit/delete
  - Filter/sort

---

## Future Features

### Phase Roadmap

| Feature | Description | Target Release |
|---------|-------------|----------------|
| **ML Forecasting** | Machine learning demand prediction | Q3 2026 |
| **Multi-warehouse** | Multiple warehouse support | Q3 2026 |
| **POS Integration** | Point of sale hardware | Q4 2026 |
| **Mobile App** | Native mobile applications | Q4 2026 |
| **Advanced Workflows** | Custom approval workflows | Q4 2026 |
| **API v2** | RESTful API for integrations | Q1 2027 |
| **Real-time Collaboration** | Live multiplayer editing | Q1 2027 |
| **Custom Reports** | Report builder | Q2 2027 |
| **Marketplace** | App marketplace | Q2 2027 |
| **AI Assistant** | AI-powered inventory assistant | Q3 2027 |

### Requested Features (User Feedback)

- Barcode scanning with mobile camera
- Voice-enabled product search
- Offline mode for mobile
- Multi-currency support
- Currency: NPR, INR, USD, EUR
- Batch product updates
- Product variants (size, color)
- Serial number tracking
- Expiry date tracking
- QR code generation
- WhatsApp integration
- SMS notifications
- Slack integration
- Excel import/export
- PDF catalog generation

---

## Database Tables Reference

| Table | Description | Key Fields |
|-------|-------------|------------|
| `products` | Product inventory | name, sku, stockLevel, sellingPrice |
| `category` | Product categories | name, slug |
| `suppliers` | Vendor records | name, phone, email |
| `sales` | Sales transactions | productId, quantitySold, totalAmount |
| `payments` | Payment records | saleIds, amountPaid, paymentMode |
| `invoices` | Legal invoices | invoiceNumber, buyerName, items |
| `transactions` | Financial ledger | firmId, drAmount, crAmount, balance |
| `companies` | Business profiles | name, taxNumber, address |
| `companiesDetails` | Company details | companyName, vatNumber |
| `organizations` | Multi-org support | name, ownerId, status |
| `organizationMembers` | Org users | organizationId, userId, role |
| `accountStatus` | Account control | userId, status, businessType |
| `companyMembers` | Team members | email, role, status |
| `locations` | Warehouses | name, address, type |
| `expenses` | Expense records | amount, category, description |
| `stockMovements` | Stock history | productId, type, quantity |
| `userSettings` | User preferences | theme, language, currency |
| `notificationRules` | Alert rules | triggers, channels, recipients |
| `integrations` | Connected apps | name, category, config |

---

## API Patterns

### Query Pattern
```typescript
export const getProducts = query({
  args: { organization: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_organization", (q) =>
        q.eq("organization", args.organization)
      )
      .collect();
  },
});
```

### Mutation Pattern
```typescript
export const createProduct = mutation({
  args: { ... },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    // Validation & creation
  },
});
```

---

## Middleware Routes

### Public Routes (No Auth)
```
/sign-in(.*)
/sign-up(.*)
//
/database(.*)
/api/webhooks(.*)
/api/edgestore(.*)
/public(.*)
/favicon.ico
/sitemap.xml
```

### Protected Routes (Auth Required)
```
/dashboard(.*)
/settings(.*)
/billing(.*)
/ledger(.*)
/restock(.*)
/(authenticated)(.*)
```

### Onboarding Routes
```
/onboarding(.*)
/company-registration(.*)
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Convex (database + API) |
| Auth | Clerk (users, organizations) |
| Payments | Razorpay |
| Email | SendGrid |
| Storage | EdgeStore |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| State | Zustand |

---

## File Structure

```
src/
├── app/                    # Next.js pages
│   ├── (auth)/            # Auth pages
│   ├── (main)/           # Main authenticated pages
│   ├── (marketing)/      # Public pages
│   ├── (developer-admin-page)/ # Dev admin
│   └── (dev-tools)/      # Dev tools
├── components/           # Shared components
│   ├── ui/              # shadcn components
│   └── dashboard/        # Dashboard components
├── features/             # Feature modules
│   ├── products/         # Product feature
│   ├── billing/         # Billing feature
│   ├── settings/        # Settings feature
│   └── teams/           # Team feature
├── hooks/               # Custom hooks
│   └── useUserRole.ts   # Role checking
├── lib/                 # Utilities
└── types/               # TypeScript types

convex/
├── schema.ts            # Database schema
├── products.ts        # Product API
├── billing.ts        # Billing API
├── ...              # Module APIs
└── _generated/     # Auto-generated types
```

---

*Last Updated: April 2026*
*Version: 1.0*