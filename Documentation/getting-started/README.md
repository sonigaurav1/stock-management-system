# Invento Documentation

Complete reference for building and maintaining Invento inventory management system.

## Quick Start for New Developers

1. **Setup**: Read [setup/ONBOARDING.md](setup/ONBOARDING.md)
2. **Architecture**: Read [ARCHITECTURE.md](ARCHITECTURE.md)
3. **Code Patterns**: Read [CODE-PATTERNS.md](CODE-PATTERNS.md)
4. **Conventions**: Read [CONVENTIONS.md](CONVENTIONS.md)

## Documentation Guide

### Core References
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design, data flow, component interactions
- **[MODULES.md](MODULES.md)** - Module descriptions, responsibilities, key files
- **[DATABASE-SCHEMA.md](DATABASE-SCHEMA.md)** - Convex schema overview
- **[CONVENTIONS.md](CONVENTIONS.md)** - Code style, naming conventions, patterns

### Implementation Guides
- **[CODE-PATTERNS.md](CODE-PATTERNS.md)** - Common patterns: forms, tables, auth, API calls
- **[API-GUIDE.md](API-GUIDE.md)** - Convex query/mutation patterns and best practices
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment process and environments

### Module Guides
Located in `modules/` directory:
- [AUTH.md](modules/AUTH.md) - Authentication with Clerk
- [PRODUCTS.md](modules/PRODUCTS.md) - Product management system
- [SUPPLIERS.md](modules/SUPPLIERS.md) - Supplier management
- [SALES.md](modules/SALES.md) - Sales tracking and orders
- [LEDGER.md](modules/LEDGER.md) - Financial ledger system
- [BILLING.md](modules/BILLING.md) - Billing and payments (Razorpay)
- [ADMIN.md](modules/ADMIN.md) - Admin dashboard and controls
- [ORGANIZATIONS.md](modules/ORGANIZATIONS.md) - Multi-organization support
- [RBAC](rbac/README.md) - Role-Based Access Control (permissions, roles, team management)

### Setup & Development
Located in `setup/` directory:
- [ONBOARDING.md](setup/ONBOARDING.md) - New developer setup
- [ENV-VARS.md](setup/ENV-VARS.md) - Environment variables configuration
- [DEVELOPMENT.md](setup/DEVELOPMENT.md) - Development workflow and commands

### Decisions & Troubleshooting
- **[decisions/](decisions/)** - Architecture Decision Records (ADRs)
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions

## For AI Assistants

Use this documentation system to:
1. **Reduce token consumption** - Reference structured docs instead of reading code
2. **Maintain consistency** - Follow documented patterns
3. **Understand impact** - Check MODULES.md before making changes
4. **Stay aligned** - Follow conventions and API patterns
5. **Track decisions** - Review ADRs for context

## How to Update Documentation

When adding features or making changes:
1. Update relevant module documentation in `modules/`
2. Add patterns to `CODE-PATTERNS.md` if new
3. Update `ARCHITECTURE.md` if changing system design
4. Add troubleshooting notes if discovering solutions
5. Create ADR in `decisions/` for architectural choices

Documentation is code. Keep it current.
