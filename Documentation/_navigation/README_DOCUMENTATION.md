# Invento - Complete Documentation Guide

**Enterprise-grade inventory management system**

Last Updated: 2026-05-10 | Version: 1.0

---

## 
### New to Invento?
 [Documentation/getting-started/START_HERE.md](Documentation/getting-started/START_HERE.md)

### Want to develop?
 [Documentation/getting-started/QUICK_START.md](Documentation/getting-started/QUICK_START.md)

### Need reference docs?
 [Documentation/INDEX.md](Documentation/INDEX.md)

### Want to understand architecture?
 [Documentation/reference/ARCHITECTURE.md](Documentation/reference/ARCHITECTURE.md)

---

## 
Invento documentation is organized into two main sections:

### 1. Root-Level Documentation
Essential project documentation in the repository root.

| File | Purpose |
|------|---------|
| **[README.md](README.md)** | Project overview and features |
| **[CLAUDE.md](CLAUDE.md)** | AI context and development conventions |
| **RBAC_SECURITY_AUDIT_*.md** | Security audit reports |
| **TODO.md** | Current task list |

### 2. Comprehensive Documentation
Complete structured documentation in `/Documentation/` folder.

 See [Documentation/INDEX.md](Documentation/INDEX.md) for full guide.

---

## 
```
/
 Project overview
 AI conventions
 Complete docs (SEE BELOW)
 Documentation index (START HERE!)
 Onboarding & quick start
 Technical reference
 Domain guides (8 modules)
 Role-based access control
 Enterprise features
 Configuration & deployment
 Developer tools & AI workflows
 Feature implementations
 Phase documentation
 Legacy documentation
 ...other resources   
 ...root config files
```

---

##  Quick Navigation by Role

**Time needed**: 30 minutes### 

1. [Documentation/getting-started/START_HERE.md](Documentation/getting-started/START_HERE.md) - 5 min
2. [Documentation/getting-started/QUICK_START.md](Documentation/getting-started/QUICK_START.md) - 5 min
3. [Documentation/reference/PROJECT_CONTEXT.md](Documentation/reference/PROJECT_CONTEXT.md) - 10 min
4. [Documentation/reference/CODE-PATTERNS.md](Documentation/reference/CODE-PATTERNS.md) - 10 min

Then: Pick a module from [Documentation/modules/](Documentation/modules/)

**Read this immediately**### 

1. [CLAUDE.md](CLAUDE.md) - AI conventions (THIS REPO)
2. [Documentation/reference/PROJECT_CONTEXT.md](Documentation/reference/PROJECT_CONTEXT.md) - Stack & patterns
3. [Documentation/reference/ARCHITECTURE.md](Documentation/reference/ARCHITECTURE.md) - System design
4. [Documentation/reference/MODULES.md](Documentation/reference/MODULES.md) - Module inventory

Then: Use code-review-graph tools for exploration

**For design decisions**### 

1. [Documentation/reference/ARCHITECTURE.md](Documentation/reference/ARCHITECTURE.md)
2. [Documentation/enterprise/ENTERPRISE_ARCHITECTURE.md](Documentation/enterprise/ENTERPRISE_ARCHITECTURE.md)
3. [Documentation/reference/MODULES.md](Documentation/reference/MODULES.md)
4. [Documentation/reference/DATABASE-SCHEMA.md](Documentation/reference/DATABASE-SCHEMA.md)

**For DevOps/deployment**### 

1. [Documentation/setup/DEPLOYMENT.md](Documentation/setup/DEPLOYMENT.md)
2. [Documentation/setup/ENV-VARS.md](Documentation/setup/ENV-VARS.md)
3. [Documentation/setup/SETUP_DEPLOYMENT.md](Documentation/setup/SETUP_DEPLOYMENT.md)

**For security/RBAC**### 

1. [Documentation/rbac/README.md](Documentation/rbac/README.md)
2. [Documentation/rbac/PERMISSION_CATALOG.md](Documentation/rbac/PERMISSION_CATALOG.md)
3. [Documentation/rbac/IMPLEMENTATION_GUIDE.md](Documentation/rbac/IMPLEMENTATION_GUIDE.md)

**For enterprise features**### 

1. [Documentation/enterprise/ENTERPRISE_FEATURES.md](Documentation/enterprise/ENTERPRISE_FEATURES.md)
2. [Documentation/enterprise/ENTERPRISE_ARCHITECTURE.md](Documentation/enterprise/ENTERPRISE_ARCHITECTURE.md)
3. [Documentation/enterprise/ORGANIZATION_GUIDE.md](Documentation/enterprise/ORGANIZATION_GUIDE.md)

---

## 
### Getting Started
Complete onboarding guides for new developers.
- **Location**: [Documentation/getting-started/](Documentation/getting-started/)
- **Time**: 30 minutes to 2 hours
- **For**: New developers, onboarding

### Reference (Technical)
Core technical documentation and reference guides.
- **Location**: [Documentation/reference/](Documentation/reference/)
- **For**: All developers, architects
- **Key files**: ARCHITECTURE.md, MODULES.md, CODE-PATTERNS.md

### Module Guides
Domain-specific implementation guides (8 modules).
- **Location**: [Documentation/modules/](Documentation/modules/)
- **For**: Developers implementing features
- **Modules**: AUTH, PRODUCTS, SUPPLIERS, SALES, LEDGER, BILLING, ORGANIZATIONS, ADMIN

### RBAC (Role-Based Access Control)
Complete permissions and authorization system.
- **Location**: [Documentation/rbac/](Documentation/rbac/)
- **For**: Backend developers, security
- **Key files**: PERMISSION_CATALOG.md, IMPLEMENTATION_GUIDE.md

### Enterprise Features
Enterprise-specific functionality and setup.
- **Location**: [Documentation/enterprise/](Documentation/enterprise/)
- **For**: Product, architects, enterprise customers
- **Key files**: ENTERPRISE_FEATURES.md, ENTERPRISE_ARCHITECTURE.md

### Setup & Configuration
Environment setup, deployment, and configuration.
- **Location**: [Documentation/setup/](Documentation/setup/)
- **For**: DevOps, all developers
- **Key files**: ONBOARDING.md, ENV-VARS.md, DEPLOYMENT.md

### Development Tools
AI workflows, troubleshooting, and tools.
- **Location**: [Documentation/tools/](Documentation/tools/)
- **For**: All developers, AI agents
- **Key files**: AI_WORKFLOW.md, TROUBLESHOOTING.md

---

## 
### I want to...

**Understand the project**
 [Documentation/reference/ARCHITECTURE.md](Documentation/reference/ARCHITECTURE.md)

**Get my dev environment working**
 [Documentation/setup/ONBOARDING.md](Documentation/setup/ONBOARDING.md)

**Learn coding standards**
 [Documentation/reference/CONVENTIONS.md](Documentation/reference/CONVENTIONS.md)

**Find code patterns**
 [Documentation/reference/CODE-PATTERNS.md](Documentation/reference/CODE-PATTERNS.md)

**Implement a feature in [MODULE]**
 [Documentation/modules/](Documentation/modules/) + [Documentation/reference/CODE-PATTERNS.md](Documentation/reference/CODE-PATTERNS.md)

**Understand the database**
 [Documentation/reference/DATABASE-SCHEMA.md](Documentation/reference/DATABASE-SCHEMA.md)

**Learn API patterns**
 [Documentation/reference/API-GUIDE.md](Documentation/reference/API-GUIDE.md)

**Check permissions**
 [Documentation/rbac/PERMISSION_CATALOG.md](Documentation/rbac/PERMISSION_CATALOG.md)

**Implement RBAC**
 [Documentation/rbac/IMPLEMENTATION_GUIDE.md](Documentation/rbac/IMPLEMENTATION_GUIDE.md)

**Deploy to production**
 [Documentation/setup/DEPLOYMENT.md](Documentation/setup/DEPLOYMENT.md)

**Understand enterprise features**
 [Documentation/enterprise/ENTERPRISE_FEATURES.md](Documentation/enterprise/ENTERPRISE_FEATURES.md)

**Debug an issue**
 [Documentation/tools/TROUBLESHOOTING.md](Documentation/tools/TROUBLESHOOTING.md)

**Work effectively with AI**
 [Documentation/tools/AI_WORKFLOW.md](Documentation/tools/AI_WORKFLOW.md)

---

## 
### Technology Stack
- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Convex (database + API layer)
- **Authentication**: Clerk
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Package Manager**: pnpm

### Architecture Patterns
- **Tenancy**: Single-tenant per Clerk user
- **Modules**: 8 core domain modules
- **Data Layer**: Convex queries/mutations
- **UI Components**: React hooks + shadcn/ui
- **Styling**: Tailwind CSS utility classes

### Database Model
- **Convex**: Real-time database
- **Soft Deletes**: For reversibility
- **User Isolation**: `userId` field on tables
- **Indexes**: For performance
- **Schema**: Defined in `convex/schema.ts`

### Permissions (RBAC)
- **Roles**: Owner, Admin, Editor, Viewer, Custom
- **Permissions**: `{resource}.{action}` format
- **Storage**: Clerk user metadata
- **Checking**: Backend validation required

---

## 
### Root-Level Files
```
/
 Project overview
 AI development guide
 RBAC_SECURITY_AUDIT_COMPLETE.md
 RBAC_PHASE1_AUDIT_REPORT.md
 RBAC_PHASE2_AUDIT_REPORT.md
 RBAC Security Fix.md
 Current tasks
 ...config files (.env, next.config.js, etc.)
```

### Documentation Folder
```
Documentation/
 Main documentation index
 Onboarding
 Technical reference
 8 domain modules
 Permissions/authorization
 Enterprise features
 Setup & deployment
 Developer tools
 Feature specs
 Phase documentation
 Legacy docs
 Doc templates
 Architecture decisions
 ...other resources
```

---

## 
### Path A: Fastest (Developer with Experience)
1. Setup: [Documentation/setup/ONBOARDING.md](Documentation/setup/ONBOARDING.md) (10 min)
2. Context: [Documentation/reference/PROJECT_CONTEXT.md](Documentation/reference/PROJECT_CONTEXT.md) (10 min)
3. Code: Start building using [Documentation/reference/CODE-PATTERNS.md](Documentation/reference/CODE-PATTERNS.md)

### Path B: Complete (New Developer)
1. Start: [Documentation/getting-started/START_HERE.md](Documentation/getting-started/START_HERE.md) (10 min)
2. Setup: [Documentation/getting-started/QUICK_START.md](Documentation/getting-started/QUICK_START.md) (5 min)
3. Learn: [Documentation/getting-started/DEVELOPER_QUICK_REFERENCE.md](Documentation/getting-started/DEVELOPER_QUICK_REFERENCE.md) (30 min)
4. Deep: [Documentation/reference/ARCHITECTURE.md](Documentation/reference/ARCHITECTURE.md) (20 min)
5. Code: [Documentation/reference/CODE-PATTERNS.md](Documentation/reference/CODE-PATTERNS.md)

### Path C: AI Agent
1. Context: [CLAUDE.md](CLAUDE.md) (5 min)
2. Stack: [Documentation/reference/PROJECT_CONTEXT.md](Documentation/reference/PROJECT_CONTEXT.md) (10 min)
3. Arch: [Documentation/reference/ARCHITECTURE.md](Documentation/reference/ARCHITECTURE.md) (15 min)
4. Modules: [Documentation/reference/MODULES.md](Documentation/reference/MODULES.md) (10 min)
5. Tools: Use code-review-graph for exploration

---

## 
This documentation follows enterprise standards:

 **What We Do**
- Organize by use case and role
- Provide step-by-step guides
- Include code examples
- Link extensively
- Keep current and tested

 **What We Don't**
- Duplicate information across files
- Assume reader knowledge
- Mix multiple topics
- Leave broken links
- Archive without organization

---

## 
Documentation is maintained as code:
- Updated with features
- Versioned in git
- Reviewed with code
- Organized systematically
- Cross-referenced

**Last Review**: 2026-05-10
**Next Review**: 2026-06-10

---

## 
### If you need help...

**"I don't know where to start"**
 [Documentation/getting-started/START_HERE.md](Documentation/getting-started/START_HERE.md)

**"I need code examples"**
 [Documentation/reference/CODE-PATTERNS.md](Documentation/reference/CODE-PATTERNS.md)

**"I'm stuck on an error"**
 [Documentation/tools/TROUBLESHOOTING.md](Documentation/tools/TROUBLESHOOTING.md)

**"I need to understand [MODULE]"**
 [Documentation/modules/](Documentation/modules/)

**"I need to check permissions"**
 [Documentation/rbac/QUICK_REFERENCE.md](Documentation/rbac/QUICK_REFERENCE.md)

**"How do I deploy?"**
 [Documentation/setup/DEPLOYMENT.md](Documentation/setup/DEPLOYMENT.md)

**"How do I work with AI?"**
 [Documentation/tools/AI_WORKFLOW.md](Documentation/tools/AI_WORKFLOW.md)

---

##  Documentation Checklist for Contributors

When adding new documentation:

- [ ] Place in appropriate folder
- [ ] Add table of contents
- [ ] Include code examples
- [ ] Link to related docs
- [ ] Update folder README
- [ ] Update INDEX.md if new section
- [ ] Test all links
- [ ] Mention in commit message

---

## 
### Quick Start (1 hour)
- [Documentation/getting-started/QUICK_START.md](Documentation/getting-started/QUICK_START.md)
- [Documentation/reference/PROJECT_CONTEXT.md](Documentation/reference/PROJECT_CONTEXT.md)
- [Documentation/reference/CODE-PATTERNS.md](Documentation/reference/CODE-PATTERNS.md)

### Deep Learning (1 week)
- Follow [Documentation/getting-started/DEVELOPER_QUICK_REFERENCE.md](Documentation/getting-started/DEVELOPER_QUICK_REFERENCE.md)
- Study [Documentation/reference/ARCHITECTURE.md](Documentation/reference/ARCHITECTURE.md)
- Review [Documentation/modules/](Documentation/modules/) for your domain
- Practice patterns from [Documentation/reference/CODE-PATTERNS.md](Documentation/reference/CODE-PATTERNS.md)

### Reference (As needed)
- [Documentation/reference/CONVENTIONS.md](Documentation/reference/CONVENTIONS.md) - Coding standards
- [Documentation/reference/DATABASE-SCHEMA.md](Documentation/reference/DATABASE-SCHEMA.md) - Database reference
- [Documentation/reference/API-GUIDE.md](Documentation/reference/API-GUIDE.md) - API patterns
- [Documentation/rbac/PERMISSION_CATALOG.md](Documentation/rbac/PERMISSION_CATALOG.md) - Permissions
- [Documentation/tools/TROUBLESHOOTING.md](Documentation/tools/TROUBLESHOOTING.md) - Debug help

---

## 
1. **Choose your path** above based on your role
2. **Read the first document** for your path
3. **Follow the links** in that document
4. **Bookmark** [Documentation/INDEX.md](Documentation/INDEX.md) for reference
5. **Ask questions** if stuck

---

**Welcome to Invento! 
*For comprehensive documentation, see [Documentation/INDEX.md](Documentation/INDEX.md)*
