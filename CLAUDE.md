# Invento - AI Development Guidance

Complete guide for AI assistants working on the Invento inventory management system.

---

## 🎯 Quick Start for Any AI

You're working on Invento. Follow this order:

1. **Load Project Context** → Read `/documentation/README.md` and this file
2. **Understand Architecture** → Read `/documentation/ARCHITECTURE.md`
3. **Use Graph Tools First** → Before reading code, use code-review-graph MCP tools
4. **Review Existing Patterns** → Check `/documentation/CODE-PATTERNS.md`
5. **Follow Conventions** → Use `/documentation/CONVENTIONS.md`
6. **Implement** → Code following existing patterns
7. **Self-Review** → Use graph tools to review your changes

---

## 📊 Project Overview

**Invento** - Inventory Management System

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Convex (real-time database + API)
- **Auth**: Clerk (users, organizations, roles)
- **Payments**: Razorpay
- **Notifications**: SendGrid, Slack, Twilio
- **Storage**: EdgeStore for files
- **Architecture**: Multi-tenant SaaS

### Core Modules
- **AUTH** - User identity and organizations
- **PRODUCTS** - Inventory tracking
- **SUPPLIERS** - Vendor management
- **SALES** - Order and transaction tracking
- **LEDGER** - Financial audit trail
- **BILLING** - Payments and invoices
- **ADMIN** - System administration
- **RBAC** - Role-Based Access Control (permissions, roles, team management)

---

## 🔄 Using Code-Review-Graph MCP Tools

**IMPORTANT**: Always use these FIRST before reading code.

### When Exploring Code
```
Use: semantic_search_nodes("ProductForm") or query_graph()
Why: Faster, cheaper, gives structural context
Then: Fall back to Read/Grep if needed
```

### When Understanding Impact
```
Use: get_impact_radius(target="createProduct")
Why: Shows all callers and dependents automatically
Prevents: Broken changes and missed integration points
```

### When Reviewing Changes
```
Use: detect_changes() → get_review_context() → get_affected_flows()
Why: Risk-scored analysis, token-efficient
Then: Manual review only where needed
```

### Key Tools Reference
| Task | Tool | Benefit |
|------|------|---------|
| Finding function | semantic_search_nodes | Faster than grep |
| What calls X? | query_graph(pattern="callers_of", target="X") | Complete dependency map |
| What breaks? | get_impact_radius | Blast radius analysis |
| How to refactor? | refactor_tool | Safe renaming, dead code |
| Is X tested? | query_graph(pattern="tests_for", target="X") | Coverage check |
| System overview | get_architecture_overview | High-level structure |
| Code for review | get_review_context | Token-efficient snippets |

---

## 📚 Documentation System

All documentation in `/documentation/`:

### Must Read
- **[ARCHITECTURE.md](documentation/ARCHITECTURE.md)** - System design + data flow
- **[MODULES.md](documentation/MODULES.md)** - Module descriptions + responsibilities
- **[CODE-PATTERNS.md](documentation/CODE-PATTERNS.md)** - Copy-paste patterns
- **[CONVENTIONS.md](documentation/CONVENTIONS.md)** - Code style + naming
- **[API-GUIDE.md](documentation/API-GUIDE.md)** - Convex patterns
- **[DATABASE-SCHEMA.md](documentation/DATABASE-SCHEMA.md)** - Schema overview
- **[RBAC](documentation/rbac/README.md)** - Role-Based Access Control (permissions, roles, team management)

### Reference
- **[setup/ONBOARDING.md](documentation/setup/ONBOARDING.md)** - Dev setup
- **[setup/ENV-VARS.md](documentation/setup/ENV-VARS.md)** - Configuration
- **[modules/](documentation/modules/)** - Per-module guides
- **[TROUBLESHOOTING.md](documentation/TROUBLESHOOTING.md)** - Common issues
- **[RBAC/docs](documentation/rbac/)** - RBAC implementation, permissions, roles

---

## 🧠 AI Memory System

Build memory to avoid re-discovering context each session.

### Loading Memory
```
Start of conversation:
- Check /Users/gaurav/.claude/projects/-Users-gaurav-Desktop-Invento/memory/
- Load project_context.md, conventions.md, recent decisions
```

### Saving Memory
When you discover something important:
```
Save to: /Users/gaurav/.claude/projects/-Users-gaurav-Desktop-Invento/memory/
Types: project_context, feedback_and_rules, architecture, conventions
```

### What to Save
- ✓ Project decisions that affect future work
- ✓ Conventions or patterns the user prefers
- ✓ Mistakes to avoid
- ✓ External system references (Linear, Grafana, etc)

### What NOT to Save
- ✗ Code patterns (in documentation)
- ✗ File paths or structure (reference code instead)
- ✗ Git history or recent changes (use `git log`)
- ✗ Current conversation context

---

## 🔄 Systematic Workflow for ANY Feature

Follow this order every time:

### Phase 1: CONTEXT (First - Always)
```
→ detect_changes() - What changed?
→ get_architecture_overview() - How does it fit?
→ Read /documentation/MODULES.md - What module?
→ Read /documentation/modules/{MODULE}.md - Module details
```

**Why**: Fewer tokens, structural context, understanding

### Phase 2: DOCUMENTATION (Second)
```
→ Check /documentation/CONVENTIONS.md - Code style
→ Check /documentation/CODE-PATTERNS.md - Similar features
→ Check /documentation/API-GUIDE.md - API patterns
→ Check /documentation/modules/{MODULE}.md - Module patterns
```

**Why**: Documentation is source of truth, faster than reading code

### Phase 3: IMPACT ANALYSIS (Before Coding)
```
→ get_impact_radius(target="X") - What breaks?
→ get_affected_flows() - Execution paths?
→ query_graph(pattern="callers_of", target="X") - Who calls X?
→ query_graph(pattern="tests_for", target="X") - Test coverage?
```

**Why**: Prevents surprises, identifies side effects

### Phase 4: IMPLEMENTATION (Code Changes)
```
→ Follow patterns in /documentation/CODE-PATTERNS.md
→ Use existing utilities before creating new ones
→ Add tests alongside implementation
→ Update documentation if new patterns emerge
→ Commit with descriptive message
```

**Why**: Consistency, maintainability, test coverage

### Phase 5: REVIEW (After Coding)
```
→ detect_changes() - Review your changes
→ get_review_context() - Get relevant snippets
→ get_affected_flows() - Check all affected paths
→ query_graph(pattern="tests_for") - Verify coverage
→ Save memory if context is new
```

**Why**: Catch mistakes before commit

---

## ✅ Pre-Implementation Checklist

Before writing any code:

- [ ] Run `detect_changes()` to see existing changes
- [ ] Run `query_graph(pattern="architecture")` for system overview
- [ ] Read `/documentation/MODULES.md` for module list
- [ ] Read relevant module doc in `/documentation/modules/`
- [ ] Read `/documentation/CONVENTIONS.md` for code style
- [ ] Read `/documentation/CODE-PATTERNS.md` for similar features
- [ ] Run `get_impact_radius()` to understand blast radius
- [ ] Identify existing utilities to reuse
- [ ] Plan test strategy

---

## 🎨 Key Conventions

### File Organization
```
src/
├── app/              # Next.js pages
├── components/       # React components
├── features/         # Feature modules
└── lib/              # Utilities

convex/
├── schema.ts         # Database schema
├── products.ts       # Module files (one per module)
└── _generated/       # Auto-generated types
```

### Naming
```typescript
// Components: PascalCase
function ProductForm() {}

// Hooks: useXxx
function useProducts() {}

// Functions: camelCase
function formatPrice() {}

// Constants: UPPER_SNAKE_CASE
const MAX_PRICE = 1000;

// Types: PascalCase
interface Product {}
type SaleStatus = "pending" | "delivered";

// Database fields: camelCase
{ productName: string, createdAt: Date }

// Convex functions: getXxx, createXxx, updateXxx
export const getProducts = query(...);
export const createProduct = mutation(...);
```

### Code Style
```typescript
// Imports: external → internal → utils
import React from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

// Component structure:
// 1. Hooks
// 2. State
// 3. Handlers
// 4. Render

// Error handling: always provide user-friendly messages
try {
  await createProduct(data);
  toast.success("Product created!");
} catch (error) {
  toast.error("Failed to create product");
  console.error(error);
}

// Types over any
function process(product: Product) {} // ✓ Good
function process(product: any) {} // ✗ Bad
```

---

## 📋 Multi-Tenant Data Isolation

**Critical Pattern**: Every table has `organization` field

```typescript
// ✓ ALWAYS filter by org
const products = await ctx.db
  .query("products")
  .withIndex("by_organization", (q) =>
    q.eq("organization", organizationId)
  )
  .collect();

// ✗ NEVER skip org filter
const products = await ctx.db.query("products").collect();
```

---

## 🚀 Common Implementation Patterns

### Form with Validation
See `/documentation/CODE-PATTERNS.md` - Copy-paste ready

### Data Table with Pagination
See `/documentation/CODE-PATTERNS.md` - Complete example

### Modal with Form
See `/documentation/CODE-PATTERNS.md` - Full implementation

### Convex Query with Auth
See `/documentation/API-GUIDE.md` - Security patterns

### Error Handling
See `/documentation/CODE-PATTERNS.md` - Toast + console patterns

---

## 🔍 Finding Things

| Question | Tool | Command |
|----------|------|---------|
| What is function X? | query_graph | `pattern="definition", target="X"` |
| Who calls X? | query_graph | `pattern="callers_of", target="X"` |
| What does X call? | query_graph | `pattern="callees_of", target="X"` |
| Where is ProductForm used? | query_graph | `pattern="callers_of", target="ProductForm"` |
| Is function X tested? | query_graph | `pattern="tests_for", target="X"` |
| Search by keyword | semantic_search_nodes | `"payment processing"` |
| File pattern search | Glob tool | `**/*.tsx` or `convex/**/*.ts` |
| Text search | Grep tool | `pattern="export const"` + specific files |

---

## 🐛 Debugging Strategy

### Frontend Issues
1. Check browser console for errors
2. Check network tab for failed requests
3. Verify auth token exists
4. Check organization context loaded
5. Look at component state in dev tools

### Backend Issues
1. Check Convex dashboard logs
2. Run query in Convex dashboard
3. Check database state in data browser
4. Verify auth identity
5. Check index usage

### Database Issues
1. Open Convex dashboard
2. Browse data in data browser
3. Check schema matches code
4. Verify indexes are used
5. Check org isolation

---

## 📝 Documentation Maintenance

When implementing features:

1. **Add to CODE-PATTERNS.md** if it's a reusable pattern
2. **Update MODULES.md** if changing module responsibilities
3. **Update ARCHITECTURE.md** if changing system design
4. **Add to TROUBLESHOOTING.md** if discovering solutions
5. **Create ADR** in `/documentation/decisions/` for major choices

Documentation as Code → Future AIs understand immediately.

---

## 🎯 Success Criteria

When you're done, verify:

- [ ] Code follows `/documentation/CONVENTIONS.md`
- [ ] Uses patterns from `/documentation/CODE-PATTERNS.md`
- [ ] Follows `/documentation/API-GUIDE.md` for Convex code
- [ ] Data isolation maintained (org filter everywhere)
- [ ] Tests included with implementation
- [ ] Documentation updated if adding new patterns
- [ ] Self-reviewed with `detect_changes()`
- [ ] No console errors or warnings
- [ ] Deployment checklist reviewed

---

## 🔗 Related Documents

- **Graph Tools Guide**: [code-review-graph MCP reference](#using-code-review-graph-mcp-tools)
- **Module Details**: `/documentation/modules/`
- **Code Examples**: `/documentation/CODE-PATTERNS.md`
- **API Patterns**: `/documentation/API-GUIDE.md`
- **Full Docs**: `/documentation/README.md`

---

## 💡 Key Principles

1. **Graph-First**: Use code-review-graph before file exploration
2. **Documentation-Driven**: Check docs before implementing
3. **Multi-Tenant**: Always filter by organization
4. **Pattern-Based**: Copy patterns, don't invent new ones
5. **Test-Included**: Tests with implementation, not after
6. **Token-Efficient**: Use structured docs, not re-reading code
7. **Self-Documenting**: Update docs when adding patterns

---

## 🆘 When Stuck

1. **Architectural questions** → Read `/documentation/ARCHITECTURE.md`
2. **Pattern questions** → Read `/documentation/CODE-PATTERNS.md`
3. **Module questions** → Read `/documentation/modules/{MODULE}.md`
4. **Configuration** → Read `/documentation/setup/ENV-VARS.md`
5. **Common errors** → Check `/documentation/TROUBLESHOOTING.md`
6. **Naming/style** → Check `/documentation/CONVENTIONS.md`
7. **API usage** → Check `/documentation/API-GUIDE.md`
8. **Database schema** → Check `/documentation/DATABASE-SCHEMA.md`

Remember: Documentation is the source of truth. Use code as verification, not discovery.

---

Last Updated: 2024-04-22
Version: 1.0
