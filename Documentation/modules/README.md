# Module Guides

**Domain-specific implementation guides for each core module**

Invento is organized into 8 core modules. Each module has its own guide covering architecture, patterns, and implementation details.

---

## 
### 1. **AUTH** - [AUTH.md](AUTH.md)
Authentication, identity management, and user lifecycle.

**Key Features**:
- Clerk integration for user identity
- Session management
- User metadata and profiles
- Permission checking

**Start Here**: [AUTH.md](AUTH.md)

---

### 2. **PRODUCTS** - [PRODUCTS.md](PRODUCTS.md)
Inventory management and product tracking.

**Key Features**:
- Product CRUD operations
- Stock level management
- Product categories and attributes
- Inventory tracking

**Start Here**: [PRODUCTS.md](PRODUCTS.md)

---

### 3. **SUPPLIERS** - [SUPPLIERS.md](SUPPLIERS.md)
Vendor management and procurement.

**Key Features**:
- Supplier database
- Contact management
- Order tracking from suppliers
- Performance metrics

**Start Here**: [SUPPLIERS.md](SUPPLIERS.md)

---

### 4. **SALES** - [SALES.md](SALES.md)
Orders, transactions, and fulfillment tracking.

**Key Features**:
- Order management
- Sales tracking
- Transaction history
- Order fulfillment

**Start Here**: [SALES.md](SALES.md)

---

### 5. **LEDGER** - [LEDGER.md](LEDGER.md)
Financial audit trail and accounting records.

**Key Features**:
- Transaction ledger
- Financial audit trail
- Account entries
- Report generation

**Start Here**: [LEDGER.md](LEDGER.md)

---

### 6. **BILLING** - [BILLING.md](BILLING.md)
Payments, invoicing, and subscriptions.

**Key Features**:
- Payment processing (Razorpay)
- Invoice generation
- Subscription management
- Payment history

**Start Here**: [BILLING.md](BILLING.md)

---

### 7. **ORGANIZATIONS** - [ORGANIZATIONS.md](ORGANIZATIONS.md)
Multi-tenancy, workspace management, and team features.

**Key Features**:
- Organization creation
- Team member management
- Workspace settings
- Multi-tenant isolation

**Start Here**: [ORGANIZATIONS.md](ORGANIZATIONS.md)

---

### 8. **ADMIN** - [ADMIN.md](ADMIN.md)
Admin dashboard, system management, and controls.

**Key Features**:
- Admin dashboard
- System configuration
- User management
- Analytics and reporting

**Start Here**: [ADMIN.md](ADMIN.md)

---

## 
### By Task

**Need to implement a product feature?**
 [PRODUCTS.md](PRODUCTS.md)

**Need to add authentication?**
 [AUTH.md](AUTH.md)

**Need to track financial data?**
 [LEDGER.md](LEDGER.md)

**Need to process payments?**
 [BILLING.md](BILLING.md)

**Need to manage team permissions?**
 [ORGANIZATIONS.md](ORGANIZATIONS.md) + [../rbac/](../rbac/)

**Need to build admin features?**
 [ADMIN.md](ADMIN.md)

### By Layer

**Frontend Components**
- Check module for component patterns
- See [../reference/CODE-PATTERNS.md](../reference/CODE-PATTERNS.md) for component templates

**Backend APIs**
- Check module for Convex query/mutation patterns
- See [../reference/API-GUIDE.md](../reference/API-GUIDE.md) for API patterns

**Database Schema**
- Check module for table definitions
- See [../reference/DATABASE-SCHEMA.md](../reference/DATABASE-SCHEMA.md) for complete schema

---

## 
Each module guide includes:

1. **Overview**
   - What the module does
   - Key concepts
   - Key components

2. **Architecture**
   - Data model/schema
   - Query/mutation structure
   - Component hierarchy

3. **Implementation Guide**
   - Step-by-step implementation
   - Code examples
   - Best practices

4. **API Reference**
   - Query definitions
   - Mutation definitions
   - Expected parameters and returns

5. **Common Patterns**
   - Reusable component patterns
   - Convex patterns
   - Testing patterns

6. **Troubleshooting**
   - Common issues
   - Debug tips
   - Performance considerations

---

## 
```
AUTH
 ORGANIZATIONS (depends on user identity)
 PRODUCTS (depends on user identity)
 SUPPLIERS (depends on user identity)
 SALES (depends on user identity)
 LEDGER (depends on user identity)
 BILLING (depends on user identity)

PRODUCTS
 SUPPLIERS (source of inventory)
 SALES (products are sold)

SALES
 PRODUCTS (items sold)
 LEDGER (financial records)
 BILLING (invoice from sale)

ORGANIZATIONS
 RBAC (permission system)
```

---

## 
### 1. Read the Overview
Start with the module's README to understand what it does.

### 2. Understand the Schema
Read the data model section to understand tables and relationships.

### 3. Study Patterns
Look at the "Common Patterns" section for example code.

### 4. Check Code-Patterns
Reference [../reference/CODE-PATTERNS.md](../reference/CODE-PATTERNS.md) for general patterns.

### 5. Look at Existing Code
Find existing implementation in the codebase and study it.

### 6. Implement
Use the "Implementation Guide" section.

### 7. Test
Write tests following patterns in the module guide.

---

## 
| Need | Go To |
|------|-------|
| General patterns | [../reference/CODE-PATTERNS.md](../reference/CODE-PATTERNS.md) |
| Database schema | [../reference/DATABASE-SCHEMA.md](../reference/DATABASE-SCHEMA.md) |
| API patterns | [../reference/API-GUIDE.md](../reference/API-GUIDE.md) |
| Conventions | [../reference/CONVENTIONS.md](../reference/CONVENTIONS.md) |
| Permissions | [../rbac/](../rbac/) |
| Architecture | [../reference/ARCHITECTURE.md](../reference/ARCHITECTURE.md) |

---

## 
```
modules/
 README. YOU ARE HEREmd              
 User identity & auth
 Inventory management
 Vendor management
 Orders & transactions
 Financial tracking
 Payments & invoices
 Team & multi-tenancy
 Administration
```

---

## 
- **Always check existing implementation** - Look at similar features before coding
- **Use copy-paste patterns** - Don't reinvent, use [../reference/CODE-PATTERNS.md](../reference/CODE-PATTERNS.md)
- **Test as you go** - Include tests with your implementation
- **Document decisions** - Update module guide if adding new patterns
- **Review code** - Check existing PR patterns for your module

---

## 
1. **Check the module guide** - Relevant section might have the answer
2. **Check CODE-PATTERNS.md** - Similar feature might be documented
3. **Look at existing code** - Find similar implementation
4. **Check TROUBLESHOOTING.md** - Common issues documented
5. **Ask your team** - Don't spend too long stuck

---

**Last Updated**: 2026-05-10  
**Maintained By**: Module Owners  
**Related**: [/Documentation/INDEX.md](../INDEX.md)
