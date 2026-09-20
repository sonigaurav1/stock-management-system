# Documentation Organization Guide

Complete guide to the reorganized documentation system.

---

## 📂 New Organized Structure

```
/documentation/
│
├── 📄 Core Files (Entry Points)
│   ├── INDEX.md ......................... Main navigation (start here!)
│   ├── QUICK_START.md .................. 5-minute orientation
│   ├── SETUP.md ........................ Environment setup
│   ├── AI_WORKFLOW.md .................. AI development approach
│   ├── ORGANIZATION_GUIDE.md ........... This file!
│   └── README.md ....................... (Legacy, kept for compatibility)
│
├── 📚 Core References (Read Before Coding)
│   ├── ARCHITECTURE.md ................. System design & data flow
│   ├── MODULES.md ...................... Module overview
│   ├── CONVENTIONS.md .................. Code style & naming
│   ├── API_GUIDE.md .................... Convex patterns
│   ├── CODE_PATTERNS.md ................ 40+ code examples
│   ├── DATABASE_SCHEMA.md .............. Schema reference
│   └── TROUBLESHOOTING.md .............. Issues & solutions
│
├── 📦 modules/ (8 Complete Module Guides)
│   ├── AUTH.md ......................... Authentication & organizations
│   ├── ORGANIZATIONS.md ............... Multi-tenant support
│   ├── PRODUCTS.md .................... Inventory management
│   ├── SUPPLIERS.md ................... Vendor management
│   ├── SALES.md ....................... Order tracking
│   ├── LEDGER.md ...................... Financial records
│   ├── BILLING.md ..................... Payments & invoicing
│   └── ADMIN.md ....................... Admin functions
│
├── 🛠️ setup/ (Configuration & Setup)
│   ├── ONBOARDING.md .................. Developer setup (complete)
│   ├── ENV_VARS.md .................... Environment variables
│   └── DEPLOYMENT.md .................. Production deployment
│
├── ⚙️ config/ (AI & Tool Configuration)
│   ├── PROJECT_GRAPH.md ............... Auto-load graph (~500 tokens)
│   ├── AUTO_LOAD_SETUP.md ............. Configuration methods
│   └── SYSTEM_WORKFLOW.md ............. Workflow definition
│
├── 🎨 templates/ (Documentation Templates)
│   ├── FEATURE_TEMPLATE.md ............ For new features
│   ├── ADR_TEMPLATE.md ................ For architecture decisions
│   ├── MODULE_TEMPLATE.md ............ For new modules
│   └── API_ENDPOINT_TEMPLATE.md ....... For new API endpoints
│
├── 📝 features/ (Feature Documentation)
│   ├── FEATURES_INDEX.md .............. Feature registry
│   ├── feature-name/
│   │   ├── SPEC.md .................... Feature specification
│   │   ├── IMPLEMENTATION.md .......... Implementation guide
│   │   ├── EXAMPLES.md ................ Usage examples
│   │   └── TESTING.md ................. Test strategy
│   └── (Add new feature directories as needed)
│
├── 📊 decisions/ (Architecture Decision Records)
│   ├── ADR_INDEX.md ................... ADR registry
│   ├── ADR-001-auth.md ................ Existing decision
│   └── ADR-XXX-*.md ................... New decisions
│
├── 📖 guides/ (How-to Guides)
│   ├── GUIDES_INDEX.md ................ Guide registry
│   ├── getting-started.md ............. First steps
│   └── (Add new guides as needed)
│
└── 📦 archive/ (Old/Deprecated Docs)
    ├── README.md ...................... Archive index
    ├── Phase1_1/ ...................... Old phases
    ├── Phase1_2/ ...................... Old phases
    └── Archive/ ....................... Legacy docs
```

---

## 🎯 How Everything Connects

### For New Users
```
Start: QUICK_START.md
  ↓
Read: SETUP.md (if setting up)
  ↓
Read: ARCHITECTURE.md
  ↓
Read: modules/PRODUCT.md (for your module)
  ↓
Reference: CODE_PATTERNS.md
  ↓
Follow: CONVENTIONS.md while coding
```

### For AI Assistants
```
Load: config/PROJECT_GRAPH.md (~500 tokens)
  ↓
Check: MODULES.md for context
  ↓
Read: modules/{MODULE}.md for details
  ↓
Use: CODE_PATTERNS.md for examples
  ↓
Follow: CONVENTIONS.md for style
```

### For New Features
```
Create: features/{feature-name}/
  ↓
Copy: templates/FEATURE_TEMPLATE.md
  ↓
Write: SPEC.md, IMPLEMENTATION.md, EXAMPLES.md
  ↓
Update: features/FEATURES_INDEX.md
  ↓
Link from: Relevant module guide
```

### For Architectural Decisions
```
Create: decisions/ADR-{number}-topic.md
  ↓
Copy: templates/ADR_TEMPLATE.md
  ↓
Fill in: Status, Context, Decision, Consequences
  ↓
Update: decisions/ADR_INDEX.md
```

---

## 📊 Documentation Organization Rules

### Where Documentation Lives

| Type | Location | Example |
|------|----------|---------|
| Getting started | /documentation/ | QUICK_START.md |
| Setup info | /documentation/setup/ | ONBOARDING.md |
| Reference docs | /documentation/ | ARCHITECTURE.md |
| Module docs | /documentation/modules/ | PRODUCTS.md |
| Feature docs | /documentation/features/ | features/bulk-upload/ |
| Architecture decisions | /documentation/decisions/ | ADR-001-auth.md |
| How-to guides | /documentation/guides/ | guides/deploy.md |
| Templates | /documentation/templates/ | templates/FEATURE_TEMPLATE.md |
| AI configuration | /documentation/config/ | config/PROJECT_GRAPH.md |
| Old docs | /documentation/archive/ | Keep for reference |

### File Naming

```
Main documents: UPPERCASE.md
  ARCHITECTURE.md
  MODULES.md
  QUICK_START.md

Sub-documents: lowercase.md or lowercase-with-dashes.md
  quick_start.md
  how-to-add-module.md

Directories: lowercase or lowercase-with-dashes
  modules/
  features/
  my-feature/

ADRs: ADR-{number}-{description}.md
  ADR-001-auth.md
  ADR-002-convex.md
```

### Front Matter (Add to Every Doc)

```markdown
---
title: Document Title
description: One-line description
category: Core / Module / Feature / Setup / Guide / Decision
updated: 2024-04-22
author: Author Name
---
```

---

## 🚀 Adding New Documentation

### Adding a New Feature

```bash
# 1. Create directory
mkdir -p documentation/features/my-feature

# 2. Copy template
cp documentation/templates/FEATURE_TEMPLATE.md \
   documentation/features/my-feature/SPEC.md

# 3. Create implementation guide
cp documentation/templates/FEATURE_TEMPLATE.md \
   documentation/features/my-feature/IMPLEMENTATION.md

# 4. Create examples
touch documentation/features/my-feature/EXAMPLES.md

# 5. Update features index
# Add entry to: documentation/features/FEATURES_INDEX.md

# 6. Link from module
# Add reference to: documentation/modules/{MODULE}.md
```

### Adding a New Module

Use template: `templates/MODULE_TEMPLATE.md`

Create file: `modules/NEW_MODULE.md`

Then update:
- INDEX.md (add link)
- MODULES.md (add to module list)
- config/PROJECT_GRAPH.md (update module table)

### Adding an ADR

```bash
# Create file
touch documentation/decisions/ADR-{next-number}-{topic}.md

# Copy template
cp documentation/templates/ADR_TEMPLATE.md \
   documentation/decisions/ADR-{number}-{topic}.md

# Update index
# Add entry to: documentation/decisions/ADR_INDEX.md
```

---

## 🔄 Maintenance Tasks

### Weekly
- Check if any docs need updates (code changed)
- Fix broken links
- Verify examples still work

### Per Release
- Update API_GUIDE.md if API changes
- Update DATABASE_SCHEMA.md if schema changes
- Create ADR for major decisions
- Update feature documentation

### Monthly
- Review docs for accuracy
- Update timestamps
- Clean up archive
- Check all links valid

---

## 📞 Common Questions

**Where do I document a new feature?**
→ `features/{feature-name}/` (see FEATURES_INDEX.md)

**Where do I document a new module?**
→ `modules/NEW_MODULE.md` (then update INDEX.md)

**Where do I document a design decision?**
→ `decisions/ADR-XXX-topic.md` (then update ADR_INDEX.md)

**Where do I find code examples?**
→ `CODE_PATTERNS.md`

**Where do I find setup instructions?**
→ `setup/ONBOARDING.md` or `SETUP.md`

**Where do I document a bug fix/troubleshooting?**
→ `TROUBLESHOOTING.md`

---

## ✨ Best Practices

### DO ✅
- Keep docs with code (in /documentation/)
- Update docs when code changes
- Link between docs (don't duplicate)
- Use consistent formatting
- Add examples
- Use front matter on every doc
- Update INDEX.md when adding docs

### DON'T ❌
- Store docs outside /documentation/
- Leave outdated docs
- Duplicate content (link instead)
- Create non-standard file names
- Forget timestamps
- Assume readers know context
- Skip examples

---

## 📖 Navigation Map

**Starting point**: INDEX.md
↓
**Getting oriented**: QUICK_START.md
↓
**Setting up**: setup/ONBOARDING.md
↓
**Learning system**: ARCHITECTURE.md
↓
**Understanding modules**: modules/{MODULE}.md
↓
**Implementing**: CODE_PATTERNS.md + CONVENTIONS.md
↓
**Debugging**: TROUBLESHOOTING.md

---

## 🎯 Success Criteria

- ✅ All documentation in /documentation/
- ✅ Clear organization by category
- ✅ Every doc has INDEX entry
- ✅ Links between related docs
- ✅ Templates for new content
- ✅ Feature docs follow pattern
- ✅ Archive for old docs
- ✅ Easy to find anything

---

**Created**: 2024-04-22
**Version**: 1.0
**Status**: Active & Maintained

This is the source of truth for documentation organization on Invento.
