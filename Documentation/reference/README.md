# Reference Documentation

**Complete Technical Reference for Developers and Architects**

This folder contains authoritative technical documentation for the Invento system.

---

## 📚 Core Reference Guides

### Architecture & Design

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design, data flows, module relationships
  - High-level system overview
  - Component architecture
  - Data flow diagrams
  - Integration points
  
- **[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)** - Project stack, tenancy model, key patterns
  - Stack overview (Next.js, Convex, React, etc.)
  - Single-tenant tenancy model
  - Key architectural patterns
  - Folder structure
  - Known gaps and limitations

### Implementation Reference

- **[MODULES.md](MODULES.md)** - Module inventory and responsibilities
  - Complete list of all modules
  - Module responsibilities
  - Dependencies between modules
  - Module ownership
  
- **[CODE-PATTERNS.md](CODE-PATTERNS.md)** - Reusable code patterns (copy-paste ready)
  - Common implementation patterns
  - Ready-to-copy code snippets
  - Best practices with examples
  - Anti-patterns to avoid
  
- **[CONVENTIONS.md](CONVENTIONS.md)** - Naming, style, and organization
  - Naming conventions (camelCase, PascalCase, etc.)
  - Code organization principles
  - File structure standards
  - Import organization
  - Comment guidelines

### Technical Specifications

- **[DATABASE-SCHEMA.md](DATABASE-SCHEMA.md)** - Complete database schema reference
  - All table definitions
  - Field types and constraints
  - Index strategies
  - Relationships and foreign keys
  - Soft delete patterns
  
- **[API-GUIDE.md](API-GUIDE.md)** - Convex query/mutation patterns
  - Query patterns and best practices
  - Mutation implementation
  - Authentication patterns
  - Error handling
  - Data fetching strategies

### Comprehensive Documentation

- **[COMPLETE_SYSTEM_DOCUMENTATION.md](COMPLETE_SYSTEM_DOCUMENTATION.md)** - Full system overview
  - Comprehensive system documentation
  - All components and their interactions
  - Full implementation details
  - Reference for complete picture

---

## 🎯 Quick Navigation

### By Role

**Developers**
- Start with: [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)
- Reference: [CODE-PATTERNS.md](CODE-PATTERNS.md) + [CONVENTIONS.md](CONVENTIONS.md)
- Deep dive: [ARCHITECTURE.md](ARCHITECTURE.md)

**Architects**
- Start with: [ARCHITECTURE.md](ARCHITECTURE.md)
- Reference: [MODULES.md](MODULES.md)
- Deep dive: [COMPLETE_SYSTEM_DOCUMENTATION.md](COMPLETE_SYSTEM_DOCUMENTATION.md)

**Backend Developers**
- Start with: [DATABASE-SCHEMA.md](DATABASE-SCHEMA.md)
- Reference: [API-GUIDE.md](API-GUIDE.md)
- Patterns: [CODE-PATTERNS.md](CODE-PATTERNS.md)

**Frontend Developers**
- Start with: [CODE-PATTERNS.md](CODE-PATTERNS.md)
- Reference: [CONVENTIONS.md](CONVENTIONS.md)
- Context: [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)

### By Task

**Understanding the system**
1. [ARCHITECTURE.md](ARCHITECTURE.md) - System overview
2. [MODULES.md](MODULES.md) - Module breakdown
3. [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) - Key patterns

**Writing code**
1. [CONVENTIONS.md](CONVENTIONS.md) - Coding standards
2. [CODE-PATTERNS.md](CODE-PATTERNS.md) - Copy-paste patterns
3. [DATABASE-SCHEMA.md](DATABASE-SCHEMA.md) - Data structures

**Implementing APIs**
1. [API-GUIDE.md](API-GUIDE.md) - API patterns
2. [DATABASE-SCHEMA.md](DATABASE-SCHEMA.md) - Schema reference
3. [CODE-PATTERNS.md](CODE-PATTERNS.md) - Implementation examples

**Design decisions**
1. [ARCHITECTURE.md](ARCHITECTURE.md) - System design
2. [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) - Key decisions
3. [COMPLETE_SYSTEM_DOCUMENTATION.md](COMPLETE_SYSTEM_DOCUMENTATION.md) - Full context

---

## 📋 Documentation Map

```
reference/
├── README.md                         ← YOU ARE HERE
├── ARCHITECTURE.md                   → System design (START HERE for architects)
├── PROJECT_CONTEXT.md               → Stack & patterns (START HERE for devs)
├── MODULES.md                        → Module inventory
├── CODE-PATTERNS.md                 → Reusable code (copy-paste ready)
├── CONVENTIONS.md                   → Naming & style standards
├── DATABASE-SCHEMA.md               → Database schema reference
├── API-GUIDE.md                     → Convex API patterns
└── COMPLETE_SYSTEM_DOCUMENTATION.md → Full system overview
```

---

## 💡 Key Concepts

### Tenancy Model
- Single-tenant per Clerk user
- Most tables use `userId: string` = Clerk `identity.subject`
- See [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md#tenancy-model)

### Soft Deletes
- Use `isDeleted: boolean = false` on tables
- Add indexes for efficient querying
- See [DATABASE-SCHEMA.md](DATABASE-SCHEMA.md#soft-deletes)

### Module Organization
- 8 core modules (AUTH, PRODUCTS, SUPPLIERS, SALES, LEDGER, BILLING, ORGANIZATIONS, ADMIN)
- Each module has queries, mutations, and components
- See [MODULES.md](MODULES.md)

### Code Organization
- Components in `src/components/`
- Features in `src/features/`
- Backend in `convex/`
- See [CONVENTIONS.md](CONVENTIONS.md#file-organization)

---

## 🔄 Updates & Maintenance

| File | Update Frequency | Owner |
|------|------------------|-------|
| ARCHITECTURE.md | Per major feature | Tech Lead |
| MODULES.md | Per sprint | Module Owners |
| CODE-PATTERNS.md | Per review cycle | Dev Team |
| CONVENTIONS.md | Quarterly | Tech Lead |
| DATABASE-SCHEMA.md | Per schema change | Backend Lead |
| API-GUIDE.md | Per API change | Backend Lead |
| PROJECT_CONTEXT.md | As needed | Tech Lead |

---

## 🚀 Related Documentation

- **Getting Started**: See [Documentation/getting-started/](../getting-started/)
- **Setup & Deployment**: See [Documentation/setup/](../setup/)
- **Module Guides**: See [Documentation/modules/](../modules/)
- **RBAC Reference**: See [Documentation/rbac/](../rbac/)
- **Enterprise Features**: See [Documentation/enterprise/](../enterprise/)
- **Developer Tools**: See [Documentation/tools/](../tools/)

---

## ✅ Documentation Standards

Each reference document should include:
- [ ] Clear table of contents
- [ ] Code examples for complex concepts
- [ ] Cross-references to related docs
- [ ] Visual diagrams where applicable
- [ ] Regular update date
- [ ] Clear sections with headings

---

**Last Updated**: 2026-05-10  
**Maintained By**: Development Team  
**Related**: [/Documentation/INDEX.md](../INDEX.md)
