# RBAC & Multi-Tenant Documentation Index

Quick navigation guide for all RBAC/multi-tenant related documentation.

## 
### 1. **RBAC_MULTITENANT_FILES. START HEREmd** 
**What:** Complete reference of all 70+ files using RBAC/multi-tenant patterns
**Size:** 1,014 lines | 31 KB
**Best for:** Understanding project structure, finding files, code examples
**Sections:**
- Overview with statistics
- Core infrastructure (authHelper, permissions)
- All 45+ frontend files catalogued
- All 29 backend Convex files catalogued
- Copy-paste code patterns
- Quick reference tables
- Alphabetical file index

### 2. **rbac-audit-report.md**
**What:** Security audit findings and vulnerabilities
**Size:** 221 lines | 15 KB
**Best for:** Security review, understanding known issues, compliance
**Key findings:**
- Critical vulnerabilities (4)
- High severity issues (7)
- Medium severity issues (8)
- Positive findings
- Fix priority recommendations

### 3. **RBAC_AND_MULTITENANT_ANALYSIS.md**
**What:** Deep technical analysis of RBAC implementation
**Location:** ~/.copilot/session-state/.../files/
**Size:** 41 KB
**Best for:** In-depth understanding, architecture review

---

## 
### "I need to understand RBAC in Invento"
 Overview section
 Patterns & Examples
 Quick Reference
 Implementation Checklist

### "I need to implement a new feature with RBAC"
 Backend Convex Files (your domain)
 Patterns & Examples (matching pattern)
 Files Index (similar implementations)
 Security Notes (checklist)

### "I need to find a specific file"
 Files Index (A-Z)
2. Search: Ctrl+F for filename
3. Jump: To section with detailed info

### "I need to understand a permission"
 Quick Reference
2. Find: Permission Quick Access section
3. Search: RBAC_MULTITENANT_FILES.md for uses of that permission

### "I need to review security"
1. Read: rbac-audit-report.md (all issues)
 Security Notes
3. Verify: Implementation checklist

### "I'm doing a code review"
 Files Index
2. Check: Against patterns in Patterns & Examples
3. Verify: Implementation checklist
4. Compare: Against rbac-audit-report.md known issues

### "I'm new to the project"
 Overview
 Core Infrastructure
 Patterns & Examples
4. Reference: PROJECT_CONTEXT.md for full architecture

---

## 
### Multi-Tenancy
- Each user account = separate tenant
- Data isolated by `userId`
- Staff members access owner's data via `companyMembers` table

### RBAC
- 4 role presets: Owner, Manager, Staff, Viewer
- 22 permissions defined
- Custom roles per owner

### Core Functions
- `resolveCallerContext()` - Main RBAC resolver
- `requirePermission()` - Permission enforcement
- `getDataScopeUserId()` - Get tenant ID

---

## 
| Type | Count |
|------|-------|
| Total RBAC/Multi-tenant Files | 70+ |
| Frontend Files | 45+ |
| Backend Convex Files | 29 |
| Permissions | 22 |
| Role Presets | 4 |
| Core Infrastructure Files | 2 |

---

## 
### RBAC_MULTITENANT_FILES.md

| Section | Use Case |
|---------|----------|
| Overview | Understand project scope |
| Core Infrastructure | Learn authHelper & permissions |
| Frontend Files | Find UI components |
| Backend Convex Files | Find business logic |
| Patterns & Examples | Copy-paste code |
| Quick Reference | Quick lookups |
| Security Notes | Security checklist |
| Files Index | Search for files |

### rbac-audit-report.md

| Section | Use Case |
|---------|----------|
| Executive Summary | Quick overview |
| Critical Vulnerabilities | Must-fix items |
| High Severity Issues | Important fixes |
| Positive Findings | What's working well |
| Recommended Fix Priority | Implementation order |

---

## 
Use Ctrl+F to search in RBAC_MULTITENANT_FILES.md:

```
Search For              Find In

resolveCallerContext    Core Infrastructure section
requirePermission       Core Infrastructure section
VIEW_INVENTORY          Quick Reference section
companyAccess           Backend Convex Files section
useUserRole             Frontend Files > Hooks
AccessControl           Frontend Files > UI Components
EDIT_PRODUCT            Quick Reference section
@/convex/              Backend Convex Files section
src/hooks/             Frontend Files > Hooks section
```

---

##  Implementation Checklist

Before implementing new RBAC features:

- [ ] Read RBAC_MULTITENANT_FILES.md overview
- [ ] Study relevant pattern in Patterns & Examples
- [ ] Find similar file in Files Index
- [ ] Use `resolveCallerContext()` at start
- [ ] Call `requirePermission()` for checks
- [ ] Use `getDataScopeUserId()` for queries
- [ ] Add `userId` to new tables
- [ ] Add proper indexes
- [ ] Log audit events
- [ ] Run through Security Notes checklist

---

## 
**Where is X file?**
 Files Index

**How do I do Y?**
 Patterns & Examples

**What's the security issue?**
 rbac-audit-report.md

**How does RBAC work?**
 Core Infrastructure

**What permissions exist?**
 Quick Reference

**What's my implementation checklist?**
 Security Notes

---

## 
- **PROJECT_CONTEXT.md** - Overall project architecture
- **ENTERPRISE_ARCHITECTURE.md** - System design
- **modules/** - Domain-specific documentation
- **rbac-audit-report.md** - Security findings

---

**Last Updated:** May 7, 2026  
**Total Documentation:** 3 files + this index  
**Coverage:** 70+ files, complete RBAC system
