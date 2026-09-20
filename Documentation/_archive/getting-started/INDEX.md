# Invento Documentation Index

Complete navigation and organization system for all project documentation.

---

## 📋 Quick Navigation

### 🚀 **Getting Started** (Start Here!)
- [QUICK_START.md](QUICK_START.md) - 5-minute orientation
- [SETUP.md](SETUP.md) - Environment setup
- [AI_WORKFLOW.md](AI_WORKFLOW.md) - Systematic development workflow

### 📚 **Core Reference** (Before Any Development)
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design & data flow
- [MODULES.md](MODULES.md) - Module overview & responsibilities
- [CONVENTIONS.md](CONVENTIONS.md) - Code style & naming rules
- [API_GUIDE.md](API_GUIDE.md) - Convex patterns & best practices

### 💻 **Implementation Guides**
- [CODE_PATTERNS.md](CODE_PATTERNS.md) - 40+ copy-paste examples
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Complete schema reference
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues & solutions

### 📦 **Module Documentation** (Detailed Per-Module)
- [modules/AUTH.md](modules/AUTH.md) - Authentication system
- [modules/ORGANIZATIONS.md](modules/ORGANIZATIONS.md) - Multi-tenant support
- [modules/PRODUCTS.md](modules/PRODUCTS.md) - Inventory management
- [modules/SUPPLIERS.md](modules/SUPPLIERS.md) - Vendor management
- [modules/SALES.md](modules/SALES.md) - Order tracking
- [modules/LEDGER.md](modules/LEDGER.md) - Financial records
- [modules/BILLING.md](modules/BILLING.md) - Payments & invoicing
- [modules/ADMIN.md](modules/ADMIN.md) - Admin functions

### 🛠️ **Setup & Configuration**
- [setup/ONBOARDING.md](setup/ONBOARDING.md) - Developer setup guide
- [setup/ENV_VARS.md](setup/ENV_VARS.md) - Environment variables
- [setup/DEPLOYMENT.md](setup/DEPLOYMENT.md) - Deployment process

### 📊 **Project Configuration** (AI & Tools)
- [config/PROJECT_GRAPH.md](config/PROJECT_GRAPH.md) - Auto-load graph (~500 tokens)
- [config/AUTO_LOAD_SETUP.md](config/AUTO_LOAD_SETUP.md) - Configuration methods
- [config/SYSTEM_WORKFLOW.md](config/SYSTEM_WORKFLOW.md) - Systematic workflow

### 📝 **Features & Decisions**
- [features/](features/) - Feature documentation (organized by feature)
- [decisions/](decisions/) - Architecture Decision Records (ADRs)
- [templates/](templates/) - Documentation templates

### 📖 **User Guides**
- [guides/](guides/) - How-to guides for features

---

## 📂 Directory Structure

```
documentation/
├── INDEX.md                          ← You are here
├── QUICK_START.md                   ← 5-min start
├── SETUP.md                         ← Environment setup
├── AI_WORKFLOW.md                   ← Development workflow
│
├── Core References
├── ARCHITECTURE.md                  ← System design
├── MODULES.md                       ← Module overview
├── CONVENTIONS.md                   ← Code style
├── API_GUIDE.md                     ← Convex patterns
├── CODE_PATTERNS.md                 ← Examples
├── DATABASE_SCHEMA.md               ← Schema
├── TROUBLESHOOTING.md               ← Issues & fixes
│
├── modules/                         ← 8 detailed module guides
│   ├── AUTH.md
│   ├── ORGANIZATIONS.md
│   ├── PRODUCTS.md
│   ├── SUPPLIERS.md
│   ├── SALES.md
│   ├── LEDGER.md
│   ├── BILLING.md
│   └── ADMIN.md
│
├── setup/                           ← Setup & configuration
│   ├── ONBOARDING.md
│   ├── ENV_VARS.md
│   └── DEPLOYMENT.md
│
├── config/                          ← AI configuration
│   ├── PROJECT_GRAPH.md
│   ├── AUTO_LOAD_SETUP.md
│   └── SYSTEM_WORKFLOW.md
│
├── features/                        ← Feature documentation
│   ├── FEATURES_INDEX.md           ← Feature list
│   ├── feature-name/               ← Per-feature organization
│   │   ├── SPEC.md               ← Feature specification
│   │   ├── IMPLEMENTATION.md      ← Implementation guide
│   │   └── EXAMPLES.md            ← Usage examples
│   └── ...
│
├── decisions/                       ← ADRs & architecture
│   ├── ADR_INDEX.md
│   ├── ADR-001-auth.md
│   ├── ADR-002-convex.md
│   └── ...
│
├── guides/                          ← How-to guides
│   ├── GUIDES_INDEX.md
│   ├── how-to-add-module.md
│   ├── how-to-deploy.md
│   └── ...
│
├── templates/                       ← Documentation templates
│   ├── FEATURE_TEMPLATE.md
│   ├── MODULE_TEMPLATE.md
│   ├── ADR_TEMPLATE.md
│   └── API_ENDPOINT_TEMPLATE.md
│
└── archive/                         ← Old/deprecated docs
    └── README.md
```

---

## 🎯 How to Use This Documentation

### For AI Assistants
1. **New chat starts** → Load PROJECT_GRAPH.md (~500 tokens)
2. **Need feature details** → Check MODULES.md
3. **Before implementing** → Read CODE_PATTERNS.md
4. **Writing code** → Follow CONVENTIONS.md
5. **Debugging** → Check TROUBLESHOOTING.md

### For Developers
1. **First day** → Read QUICK_START.md + ARCHITECTURE.md
2. **Setting up** → Follow setup/ONBOARDING.md
3. **Learning modules** → Read modules/{MODULE}.md
4. **Coding** → Reference CODE_PATTERNS.md + CONVENTIONS.md
5. **Stuck?** → Check TROUBLESHOOTING.md

### For New Features
1. **Document in** → features/{feature-name}/
2. **Use template** → templates/FEATURE_TEMPLATE.md
3. **Structure**: SPEC.md + IMPLEMENTATION.md + EXAMPLES.md
4. **Add to** → features/FEATURES_INDEX.md
5. **Link from** → Relevant module documentation

---

## 📝 Documentation Conventions

### File Naming
- **Main docs**: `UPPERCASE.md` (ARCHITECTURE.md)
- **Sections**: `lowercase.md` (quick_start.md)
- **Features**: `feature-name/` (feature-bulk-upload/)
- **Decisions**: `ADR-{number}-topic.md` (ADR-001-auth.md)

### Front Matter (Every Doc)
```markdown
---
title: Document Title
description: One-line description
category: Core / Module / Feature / Setup
updated: 2024-04-22
author: Creator name
---
```

### Document Structure
1. **Title** - Clear, descriptive
2. **Overview** - What this covers
3. **Key Sections** - Main content
4. **Examples** - Code or usage
5. **Links** - Related documentation
6. **Last Updated** - Date

### Links Between Docs
- Always use relative paths: `[Module Guide](../modules/PRODUCTS.md)`
- Link to specific sections: `[See Architecture](../ARCHITECTURE.md#system-overview)`
- Cross-reference: List related docs at bottom

---

## 📊 Documentation Stats

| Category | Count | Status |
|----------|-------|--------|
| Core References | 8 | ✅ Complete |
| Module Guides | 8 | ✅ Complete |
| Setup Guides | 3 | ✅ Complete |
| Code Examples | 40+ | ✅ Complete |
| API Patterns | 15+ | ✅ Complete |
| ADRs | 0 | ⏳ To Create |
| Feature Docs | 0 | ⏳ To Create |
| How-to Guides | 0 | ⏳ To Create |

---

## 🚀 When Adding New Features

### Step 1: Create Feature Directory
```bash
mkdir -p documentation/features/feature-name
```

### Step 2: Create Documentation Files
```
documentation/features/feature-name/
├── SPEC.md              # What the feature does
├── IMPLEMENTATION.md    # How to build it
├── EXAMPLES.md          # Usage examples
└── TESTING.md           # Test strategy
```

### Step 3: Use Template
Copy from `templates/FEATURE_TEMPLATE.md`

### Step 4: Update Index
Add to `features/FEATURES_INDEX.md`

### Step 5: Link from Module Docs
Add reference in relevant module (e.g., `/modules/PRODUCTS.md`)

---

## 🔗 Quick Links

### For Different Roles

**Frontend Developer**
→ Start: QUICK_START.md
→ Then: modules/PRODUCTS.md, CODE_PATTERNS.md
→ Reference: CONVENTIONS.md, TROUBLESHOOTING.md

**Backend Developer**
→ Start: SETUP.md, ARCHITECTURE.md
→ Then: API_GUIDE.md, DATABASE_SCHEMA.md
→ Modules: Any module in modules/

**DevOps/Deployment**
→ Start: setup/ONBOARDING.md
→ Then: setup/DEPLOYMENT.md, setup/ENV_VARS.md
→ Reference: setup/TROUBLESHOOTING.md

**AI Assistant/Automation**
→ Start: config/PROJECT_GRAPH.md
→ Then: AI_WORKFLOW.md
→ Reference: CODE_PATTERNS.md, CONVENTIONS.md

---

## ✨ Best Practices

### DO ✅
- Keep documentation close to code
- Update docs when implementing features
- Link between related docs
- Use consistent formatting
- Add examples to complex concepts
- Record architectural decisions in ADRs
- Update this INDEX when adding docs

### DON'T ❌
- Store documentation outside /documentation
- Leave docs outdated after code changes
- Duplicate content (link instead)
- Create non-standard file names
- Forget to update INDEX.md
- Skip examples in technical docs
- Assume readers know the context

---

## 📞 Questions?

- **How do I implement X?** → CODE_PATTERNS.md
- **What is module Y?** → modules/Y.md
- **Error Z?** → TROUBLESHOOTING.md
- **How to deploy?** → setup/DEPLOYMENT.md
- **Code style?** → CONVENTIONS.md
- **System design?** → ARCHITECTURE.md

---

## 📈 Maintenance

### Weekly
- Check for outdated links
- Update if code changes

### Monthly
- Review documentation accuracy
- Update statistics in this INDEX

### Per Release
- Update API_GUIDE.md if API changes
- Update DATABASE_SCHEMA.md if schema changes
- Create ADR for major decisions

---

**Last Updated**: 2024-04-22
**Version**: 1.0
**Maintainer**: Development Team + AI Assistants

This INDEX is the source of truth for documentation organization.
