# Getting Started

**Your entry point to understanding and developing Invento**

New to Invento? Start here. This folder guides you through onboarding, setup, and foundational knowledge.

---

## 
### Path 1: I'm a Developer (Fastest)
1. **[QUICK_START.md](QUICK_START.md)** (5 minutes)
   - Get the dev server running
   - Understand folder structure
   
2. **[DEVELOPER_QUICK_REFERENCE.md](DEVELOPER_QUICK_REFERENCE.md)** (20 minutes)
   - 1-week learning path
   - Key concepts you need to know

3. **[Reference Documentation](../reference/)**
   - Deep dive into specific areas as needed

### Path 2: I'm New to the Company (Comprehensive)
1. **[START_HERE.md](START_HERE.md)** (10 minutes)
   - What is Invento?
   - Key concepts
   - First steps
   
2. **[QUICK_START.md](QUICK_START.md)** (5 minutes)
   - Development setup

3. **[DEVELOPER_QUICK_REFERENCE.md](DEVELOPER_QUICK_REFERENCE.md)** (30 minutes)
   - Comprehensive learning path

4. **[ONBOARDING_SOLUTION.md](ONBOARDING_SOLUTION.md)** (60 minutes)
   - Complete onboarding guide
   - Knowledge checks
   - First contribution guide

### Path 3: I'm Implementing a Feature
1. **[QUICK_START.md](QUICK_START.md)** - Get setup
2. **[../reference/MODULES.md](../reference/MODULES.md)** - Find your domain
3. **[../modules/](../modules/){DOMAIN}.md** - Domain guide
4. **[../reference/CODE-PATTERNS.md](../reference/CODE-PATTERNS.md)** - Implementation patterns

---

## 
### Essential (Read First)
- **[START_HERE.md](START_HERE.md)** - Project overview and key concepts
  - What is Invento?
  - Core features
  - Technology stack
  - First steps

- **[QUICK_START.md](QUICK_START.md)** - Set up your dev environment
  - Prerequisites
  - Installation steps
  - Starting dev servers
  - Verification checklist

### Learning Path
- **[DEVELOPER_QUICK_REFERENCE.md](DEVELOPER_QUICK_REFERENCE.md)** - 1-week learning progression
  - Day 1: Architecture overview
  - Day 2: Development environment
  - Day 3: Core patterns
  - Day 4-5: Hands-on development
  - Day 6-7: Advanced topics

- **[ONBOARDING_SOLUTION.md](ONBOARDING_SOLUTION.md)** - Complete onboarding with knowledge checks
  - Understanding Invento
  - Development setup verification
  - Knowledge assessments
  - First contribution guide

### Support
- **[README.md](README.md)** - This folder overview
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick lookup reference

---

## 
### If you're new to development (< 1 year)
1. Read: [START_HERE.md](START_HERE.md)
2. Setup: [QUICK_START.md](QUICK_START.md)
3. Learn: [ONBOARDING_SOLUTION.md](ONBOARDING_SOLUTION.md) - full path
4. Reference: [../reference/CONVENTIONS.md](../reference/CONVENTIONS.md)

### If you're intermediate (1-3 years)
1. Read: [START_HERE.md](START_HERE.md) - 5 min skim
2. Setup: [QUICK_START.md](QUICK_START.md)
3. Learn: [DEVELOPER_QUICK_REFERENCE.md](DEVELOPER_QUICK_REFERENCE.md)
4. Dive deeper: [../reference/ARCHITECTURE.md](../reference/ARCHITECTURE.md)

### If you're experienced (3+ years)
1. Skim: [START_HERE.md](START_HERE.md)
2. Setup: [QUICK_START.md](QUICK_START.md)
3. Reference: [../reference/PROJECT_CONTEXT.md](../reference/PROJECT_CONTEXT.md)
4. Code: Start building

---

## 
```
getting-started/
 README. YOU ARE HEREmd                        
 Read this first (10 min)
 Get dev server running (5 min)
 1-week learning path (30 min)
 Complete onboarding (60 min)
 Quick lookup reference
 Detailed index
```

---

## 
```bash
# 1. Clone and install
git clone <repo>
cd Invento
pnpm install

# 2. Environment setup
cp .env.example .env.local
# Add your credentials

# 3. Start dev servers (in separate terminals)
pnpm run dev         # Next.js dev server (port 3000)
pnpm run convex      # Convex dev server

# 4. Verify
# - Open http://localhost:3000
# - Sign up with test account
# - Check dashboard loads
```

See [QUICK_START.md](QUICK_START.md) for detailed instructions.

---

## 
### Stack
- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Convex (database + API)
- **Auth**: Clerk (identity)
- **UI**: Tailwind CSS + shadcn/ui

### Architecture
- **Modules**: AUTH, PRODUCTS, SUPPLIERS, SALES, LEDGER, BILLING, ORGANIZATIONS, ADMIN
- **Tenancy**: Single-tenant per user
- **Patterns**: Query/mutation, hooks, components

### Key Files
- `src/` - Frontend code
- `convex/` - Backend code
- `Documentation/` - All documentation

See [DEVELOPER_QUICK_REFERENCE.md](DEVELOPER_QUICK_REFERENCE.md) for more.

---

 Common Questions## 

**Q: Where do I start?**
A: [START_HERE.md](START_HERE.md) if you're new, [QUICK_START.md](QUICK_START.md) if you know the basics.

**Q: How do I set up my dev environment?**
A: Follow [QUICK_START.md](QUICK_START.md) - 5 minutes with checklist.

**Q: What should I learn first?**
A: Follow [DEVELOPER_QUICK_REFERENCE.md](DEVELOPER_QUICK_REFERENCE.md) - 1-week path.

**Q: How do I build my first feature?**
 [../reference/CODE-PATTERNS.md](../reference/CODE-PATTERNS.md)

**Q: I'm stuck, where's the help?**
A: Check [../tools/TROUBLESHOOTING.md](../tools/TROUBLESHOOTING.md).

---

## 
After completing this guide:

1. **Pick a Module**: [../reference/MODULES.md](../reference/MODULES.md)
2. **Learn the Patterns**: [../reference/CODE-PATTERNS.md](../reference/CODE-PATTERNS.md)
3. **Build Your Feature**: [../modules/](../modules/){your-domain}.md
4. **Reference Standards**: [../reference/CONVENTIONS.md](../reference/CONVENTIONS.md)

---

## 
- **Use Ctrl+Shift+P** in VS Code for quick navigation
- **Read code** examples in [../reference/CODE-PATTERNS.md](../reference/CODE-PATTERNS.md)
- **Check** [../tools/TROUBLESHOOTING.md](../tools/TROUBLESHOOTING.md) when stuck
- **Ask** in team chat for specific questions
- **Review** existing PRs to see patterns in action

---

## 
| Need | Go To |
|------|-------|
| Setup & Config | [../setup/](../setup/) |
| Reference Docs | [../reference/](../reference/) |
| Module Guides | [../modules/](../modules/) |
| RBAC/Security | [../rbac/](../rbac/) |
| Enterprise | [../enterprise/](../enterprise/) |
| Troubleshooting | [../tools/TROUBLESHOOTING.md](../tools/TROUBLESHOOTING.md) |

---

##  Onboarding Checklist

After completing getting-started:

- [ ] Dev environment is running
- [ ] Can start Next.js and Convex servers
- [ ] Understand module structure
- [ ] Know where to find code patterns
- [ ] Know how to reference conventions
- [ ] Know where to find help
- [ ] Ready to implement first feature

---

**Last Updated**: 2026-05-10  
**Maintained By**: Onboarding Team  
**Related**: [/Documentation/INDEX.md](../INDEX.md)
