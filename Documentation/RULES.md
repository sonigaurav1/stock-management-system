# Invento - Documentation Governance & Organization Rules

> **Document Type**: Project Documentation Standards & Governance  
> **Target Audience**: AI Development Agents, Software Engineers, Technical Writers  
> **Scope**: Governs all files and directories inside `/Documentation/` and project-root markdown files.  

---

## 1. Core Architectural Constraint: The 6-Folder Structure

All files inside `/Documentation/` MUST reside within one of the 6 standardized primary subdirectories. Creating new top-level folders inside `/Documentation/` is strictly prohibited.

```
Documentation/
├── README.md                  # Master Documentation Sitemap & Index
├── INDEX.md                   # Task-and-Domain Quick Lookup Table
├── RULES.md                   # Governance Rules (This Document)
│
├── features/                  # Feature Technical Guides (AUTH, PRODUCTS, SALES, etc.)
├── pages/                     # App Router Page Maps & Route Matrices
├── reference/                 # System Architecture, Database Schema, Conventions, RBAC
├── setup/                     # Local Quick Start, Environment Variables, Onboarding
├── templates/                 # Architecture & Feature Templates
└── _archive/                  # Preserved Historical & Obsolete Documentation
```

---

## 2. Mandatory Documentation Directives ("Must Follow")

### 2.1 Single Source of Truth & Accuracy
- **Reflect Active Realities**: All active documents MUST accurately reflect the current project requirements (`admin` role as top-level, `userId` backend data scoping, SendGrid email, EdgeStore, jsPDF).
- **Zero Obsolete References**: Active documentation (outside `_archive/`) MUST NEVER reference deprecated features (`super-admin`, Clerk Organizations, Razorpay subscription tiers, Twilio SMS, Slack webhooks).

### 2.2 Immediate Archival Policy
- When a feature, architecture pattern, or guide is deprecated, refactored, or superseded, move the old file into `Documentation/_archive/`.
- Never create temporary completion reports (e.g. `SESSION_SUMMARY_X.md`, `PHASE_2A_COMPLETE.md`) in active folders. Session results belong in `Memory.md` or git commit messages.

### 2.3 Mandatory Cross-Linking
- Every newly created file inside `features/`, `pages/`, `reference/`, or `setup/` MUST be registered in:
  1. `Documentation/README.md` (Master Sitemap)
  2. `Documentation/INDEX.md` (Task Lookup Table)
  3. The `README.md` index of its respective subfolder.
- All file references MUST use clickable markdown links with absolute or relative file URIs.

### 2.4 File Naming & Formatting
- **Active Technical Files**: Use UPPERCASE or clear snake_case/kebab-case filenames (e.g. `PRODUCTS.md`, `ADMIN_RBAC.md`, `APP_ROUTES.md`, `DATABASE_SCHEMA.md`).
- **Formatting Standards**: Use standard GitHub-Flavored Markdown, GitHub alerts (`> [!NOTE]`, `> [!IMPORTANT]`, `> [!WARNING]`), clean markdown tables, and fenced code blocks (`typescript`, `bash`, `json`).

---

## 3. Rules for AI Agents & Developers

1. **Update Existing Files First**:
   - Before creating a new `.md` file, check if an existing feature guide (e.g. `features/PRODUCTS.md`) or reference doc (e.g. `reference/ARCHITECTURE.md`) should be updated instead.

2. **Sync Root Governance Documents**:
   - When modifying core project architecture, update the corresponding root document (`PRD.md`, `Architecture.md`, `Rules.md`, `Design.md`, `Memory.md`, `AI_INSTRUCTIONS.md`) alongside the `Documentation/` folder.

3. **Check Archival Before Deleting**:
   - Do not delete historical context permanently—move obsolete documents into `Documentation/_archive/` so project history is preserved without cluttering active contexts.
