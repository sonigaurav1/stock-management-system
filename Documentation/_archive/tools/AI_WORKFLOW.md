# AI Systematic Workflow

How AI should approach developing features for Invento.

## 5-Phase Workflow (Every Feature)

### Phase 1: CONTEXT (Use Graph Tools)
```
→ Load config/PROJECT_GRAPH.md (~500 tokens)
→ Read ARCHITECTURE.md
→ Read MODULES.md
```

### Phase 2: DOCUMENTATION (Before Code)
```
→ Read CODE_PATTERNS.md for examples
→ Read CONVENTIONS.md for style
→ Read API_GUIDE.md for patterns
```

### Phase 3: IMPACT ANALYSIS (Understand Blast Radius)
```
→ Use detect_changes() graph tool
→ Check related modules
→ Identify integration points
```

### Phase 4: IMPLEMENTATION (Write Code)
```
→ Follow patterns from CODE_PATTERNS.md
→ Follow style from CONVENTIONS.md
→ Add tests alongside
```

### Phase 5: REVIEW (Self-Review)
```
→ Use detect_changes() to review
→ Check test coverage
→ Update docs if new pattern
```

## Key Files to Reference

| Need | File |
|------|------|
| Project overview | config/PROJECT_GRAPH.md |
| System design | ARCHITECTURE.md |
| Module details | modules/{MODULE}.md |
| Code examples | CODE_PATTERNS.md |
| Naming rules | CONVENTIONS.md |
| API patterns | API_GUIDE.md |
| Database | DATABASE_SCHEMA.md |
| Errors | TROUBLESHOOTING.md |

## Multi-Tenant Rules

**CRITICAL**: Every query must filter by organization

✅ Correct:
```typescript
const products = await ctx.db
  .query("products")
  .withIndex("by_organization", (q) =>
    q.eq("organization", orgId)
  )
  .collect();
```

❌ Wrong:
```typescript
const products = await ctx.db.query("products").collect();
```

## Common Patterns to Copy

- Form with validation → CODE_PATTERNS.md
- Data table with pagination → CODE_PATTERNS.md
- Modal with form → CODE_PATTERNS.md
- Real-time subscription → CODE_PATTERNS.md
- Convex query with auth → API_GUIDE.md

## Example Feature: Add Product Search

1. **CONTEXT** ✓ Load graph
   → Found: PRODUCTS module at convex/products.ts

2. **DOCUMENTATION** ✓ Read patterns
   → Found: Search pattern in CODE_PATTERNS.md
   → Found: Query pattern in API_GUIDE.md

3. **IMPACT** ✓ Check what breaks
   → Products index needed
   → Ledger entry not needed
   → Dashboard updates on search

4. **IMPLEMENT** ✓ Write code
   → Add searchProducts query
   → Add UI component
   → Add tests

5. **REVIEW** ✓ Self-check
   → Org isolation verified
   → Tests added
   → Documentation updated

**Result**: Search feature complete in 30 minutes

## Token Efficiency

Graph-first saves tokens:
- Without graph: 3000-5000 tokens on docs
- With graph: 500 tokens on docs
- Savings: 2500-4500 tokens = 30-40% reduction

## When Stuck

- **Architecture Q** → ARCHITECTURE.md
- **Module Q** → modules/{MODULE}.md
- **Pattern Q** → CODE_PATTERNS.md
- **Error Q** → TROUBLESHOOTING.md
- **Convention Q** → CONVENTIONS.md

---

**Location**: documentation/AI_WORKFLOW.md
**For**: AI Assistants
