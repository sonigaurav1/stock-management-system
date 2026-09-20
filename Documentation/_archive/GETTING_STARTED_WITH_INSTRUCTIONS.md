# Getting Started with Workspace Instructions

**Last Updated**: April 18, 2026

Welcome! This guide helps you quickly understand and use the workspace instructions set up for the Inventory Management System.

---

## 🚀 Quick Start (5 minutes)

### For AI Agents

The workspace instructions are automatically loaded. You'll follow these guidelines without being asked:

- ✅ Tenancy model (per Clerk user)
- ✅ Soft delete patterns
- ✅ Convex authentication flow
- ✅ UI component conventions
- ✅ Folder structure

**Reference**: `.github/copilot-instructions.md`

### For Developers (Your First 15 Minutes)

1. Open `PROJECT_CONTEXT.md` — understand the stack and tenancy model (5 min)
2. Skim `.github/copilot-instructions.md` — know what conventions to follow (5 min)
3. Book the DEVELOPER_QUICK_REFERENCE.md (1-week learning path) for later

---

## 📁 Files Created

### Workspace Instructions Setup

```
.github/
  └─ copilot-instructions.md       ← Main workspace instructions (auto-loaded by agents)

Documentation/
  ├─ AGENT_GUIDE.md                   ← Detailed patterns for developers and agents
  ├─ WORKSPACE_INSTRUCTIONS_README.md  ← Overview of what was created
  └─ README.md                        ← UPDATED: Added developer section
```

### What Each File Contains

| File                                             | Purpose                                                          | Best For                       | Time      |
| ------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------ | --------- |
| `.github/copilot-instructions.md`                | Stack, principles, patterns, commands                            | All developers, agents         | 5 min     |
| `Documentation/AGENT_GUIDE.md`                   | Implementation workflows, domain patterns, checklists, debugging | Building features, code review | 15 min    |
| `Documentation/WORKSPACE_INSTRUCTIONS_README.md` | Overview and how to use workspace instructions                   | Understanding the setup        | 10 min    |
| `PROJECT_CONTEXT.md`                             | Project overview, tenancy model, conventions                     | Every feature request          | 5 min     |
| `Documentation/DEVELOPER_QUICK_REFERENCE.md`     | 1-week onboarding path                                           | New team members               | 3-4 hours |

---

## 🎯 Common Scenarios

### "I'm new to this project. Where do I start?"

✅ **Read in order** (30 minutes total):

1. `PROJECT_CONTEXT.md` (5 min)
2. `.github/copilot-instructions.md` (5 min)
3. `Documentation/AGENT_GUIDE.md` (15 min)
4. Then use `Documentation/DEVELOPER_QUICK_REFERENCE.md` for full onboarding

### "I'm implementing a feature. What should I do?"

✅ **Follow this checklist**:

1. Reference `Documentati/AGENT_GUIDE.md` → "Implementation Workflow" section
2. Choose your domain (catalog, sales, accounting, etc.)
3. Use the 5-step pattern shown
4. Check the code review checklist before shipping

### "I'm debugging a hydration/auth issue"

✅ **Go to**:

- `Documentation/AGENT_GUIDE.md` → "Debugging Common Issues" section
- or user memory `debugging.md`

### "I need to understand the architecture"

✅ **Read**:

- `PROJECT_CONTEXT.md` → "Tenancy & IDs" section
- `Documentation/ENTERPRISE_ARCHITECTURE.md` → for deep dive

### "I'm adding a new feature. Where should I put code?"

✅ **Reference**:

- `.github/copilot-instructions.md` → "Folder Structure & What Lives Where"
- `Documentation/AGENT_GUIDE.md` → "Common Patterns by Domain"

---

## ✨ How Agents Use Workspace Instructions

When you ask an agent (GitHub Copilot, Claude, etc.) to implement something:

1. **Agent loads context** → `.github/copilot-instructions.md` is automatically included
2. **Agent understands conventions** → Knows about tenancy model, soft deletes, Convex patterns
3. **Agent references docs** → Uses linked documentation without duplicating content
4. **Agent follows patterns** → Implements features matching existing style and structure
5. **Agent validates** → Uses checklist from `AGENT_GUIDE.md` before shipping

**You don't need to remind agents about conventions—they follow them automatically.**

---

## 📚 Documentation Hierarchy

```
Quick Questions?
├─ Stack & Tech → PROJECT_CONTEXT.md
├─ Conventions → .github/copilot-instructions.md
├─ How to build → Documentation/AGENT_GUIDE.md
├─ Full details → Documentation/DEVELOPER_QUICK_REFERENCE.md
└─ Architecture → Documentation/ENTERPRISE_ARCHITECTURE.md

Need to implement a feature?
├─ What's the domain? → AGENT_GUIDE.md → "Common Patterns by Domain"
├─ Step-by-step? → AGENT_GUIDE.md → "Implementation Workflow"
├─ Code examples? → AGENT_GUIDE.md → see domain-specific patterns
└─ Code review? → AGENT_GUIDE.md → "Code Review Checklist"

Having trouble?
├─ Hydration mismatch → AGENT_GUIDE.md → "Debugging Common Issues"
├─ Auth failing → AGENT_GUIDE.md → "Not authenticated" error
├─ Schema structure → PROJECT_CONTEXT.md → "Tenancy & IDs"
└─ Can't find pattern → AGENT_GUIDE.md → "Common Patterns by Domain"
```

---

## 🔄 How to Maintain & Update

### When to Update Workspace Instructions

- **New folder structure**: Update `.github/copilot-instructions.md` → "Folder Structure Section"
- **New domain/module**: Update `AGENT_GUIDE.md` → "Common Patterns by Domain"
- **New pattern discovered**: Add to `AGENT_GUIDE.md` → appropriate section
- **Breaking change**: Update `.github/copilot-instructions.md` → "Known Gaps"

### When to Update AGENT_GUIDE

- New debugging pattern discovered
- Common team mistakes identified
- New implementation workflow
- Third-party service integration pattern

### Principle: Link, Don't Duplicate

If content exists in PROJECT_CONTEXT.md, ENTERPRISE_ARCHITECTURE.md, or DEVELOPER_QUICK_REFERENCE.md, **link to it** rather than copying.

---

## ✅ Validation Checklist

All workspace instructions have been:

- ✅ Created and organized in correct locations
- ✅ Formatted with clear headings and sections
- ✅ Linked (no content duplication)
- ✅ Include code examples matching project conventions
- ✅ Include step-by-step workflows
- ✅ Integrated into Documentation/README.md

---

## 🎓 Next Steps

### IMMEDIATE (Do Now)

- [ ] Send this guide to your team
- [ ] Have developers bookmark `.github/copilot-instructions.md`
- [ ] Have agents reference `Documentation/AGENT_GUIDE.md` for patterns

### SHORT TERM (This Week)

- [ ] Developers complete DEVELOPER_QUICK_REFERENCE.md onboarding
- [ ] Run a feature using the AGENT_GUIDE.md workflow
- [ ] Provide feedback on clarity and completeness

### ONGOING

- [ ] Update instructions as new patterns emerge
- [ ] Link to these docs in code review comments
- [ ] Use AGENT_GUIDE.md as reference in team discussions

---

## 📞 Questions?

- **Agent not following guidelines?** → Check if `.github/copilot-instructions.md` exists and is properly formatted
- **Unclear patterns?** → Review examples in `AGENT_GUIDE.md` for your domain
- **Architecture decisions?** → Consult `PROJECT_CONTEXT.md` or `ENTERPRISE_ARCHITECTURE.md`
- **Implementation steps?** → Follow workflow in `AGENT_GUIDE.md` → "Implementation Workflow"

---

## 📋 File Organization Summary

```
Your Monorepo
├─ .github/
│  └─ copilot-instructions.md ─────────── Workspace instructions (auto-loaded)
├─ Documentation/
│  ├─ AGENT_GUIDE.md ───────────────────── Implementation patterns
│  ├─ WORKSPACE_INSTRUCTIONS_README.md ─ Overview of setup
│  ├─ README.md ────────────────────────── UPDATED: Added developer section
│  ├─ DEVELOPER_QUICK_REFERENCE.md ────── 1-week onboarding
│  ├─ ENTERPRISE_ARCHITECTURE.md ──────── System design
│  ├─ ENTERPRISE_ROADMAP.md ──────────── Features & timeline
│  └─ SETUP_DEPLOYMENT.md ───────────── Deployment guide
├─ PROJECT_CONTEXT.md ─────────────────── Project overview (read first!)
├─ src/
├─ convex/
└─ ...
```

---

_Workspace instructions created April 18, 2026. Updates reflected in linked documentation._
