# Invento - Design System & UI Specifications

> **Document Type**: Design System & UI Token Reference  
> **Target Audience**: AI Development Agents, Frontend Engineers, UI/UX Designers  
> **Project Name**: Invento (Inventory & Business Management System)  
> **Repository**: `sonigaurav1/stock-management-system`  

---

## 🧭 Documentation Sitemap Links
- **Master Documentation Index**: [Documentation/README.md](file:///Users/gaurav/Desktop/Invento/Documentation/README.md)
- **App Routes Index**: [Documentation/pages/APP_ROUTES.md](file:///Users/gaurav/Desktop/Invento/Documentation/pages/APP_ROUTES.md)
- **Page Context Matrix**: [Documentation/pages/PAGE_CONTEXT.md](file:///Users/gaurav/Desktop/Invento/Documentation/pages/PAGE_CONTEXT.md)
- **Code Conventions**: [Documentation/reference/CONVENTIONS.md](file:///Users/gaurav/Desktop/Invento/Documentation/reference/CONVENTIONS.md)

---

## 1. Color System & Theme Tokens

Invento uses an **Enterprise Dark Mode (OLED)** as its default aesthetic, with support for an optional light theme via HSL CSS variables configured in `src/app/globals.css` and `tailwind.config.js`.

### 1.1 Core Brand & Semantic Colors (Dark Mode Default)

| Token Name | CSS Variable | HSL Value | Hex Representation | Usage / Context |
| :--- | :--- | :--- | :--- | :--- |
| **Background** | `--background` | `253 43% 3%` | `#08060d` | Main page background (Deep OLED dark). |
| **Foreground** | `--foreground` | `253 31% 98%` | `#f9f8fc` | High-contrast body text. |
| **Primary** | `--primary` | `272.09 71.67% 47.06%` | `#7e22ce` | Brand purple accent, primary buttons, active tabs. |
| **Primary Foreground**| `--primary-foreground` | `253 43% 3%` | `#08060d` | Text on top of primary buttons. |
| **Card / Surface** | `--card` | `253 43% 4%` | `#0a080f` | Cards, popovers, dropdown containers. |
| **Muted** | `--muted` | `253 13% 13%` | `#1f1c24` | Table headers, muted button backgrounds. |
| **Muted Foreground**| `--muted-foreground` | `253 13% 63%` | `#9792a1` | Helper text, breadcrumbs, placeholder text. |
| **Border / Input** | `--border`, `--input` | `253 13% 20%` | `#302c38` | Subtle card borders and form input outlines. |
| **Destructive** | `--destructive` | `339.2 90.36% 51.18%` | `#e11d48` | Danger alerts, delete actions, stock out warnings. |
| **Accent** | `--accent` | `253 13% 14%` | `#221f28` | Hover state background on list items and menus. |

### 1.2 Chart & Data Visualization Colors (Recharts Palette)

- **Chart 1 (Deep Accent)**: `hsl(20, 48%, 12%)`
- **Chart 2 (Indigo/Purple)**: `hsl(253, 91%, 58%)`
- **Chart 3 (Amber/Orange)**: `hsl(30, 80%, 55%)`
- **Chart 4 (Violet)**: `hsl(280, 65%, 60%)`
- **Chart 5 (Rose Red)**: `hsl(340, 75%, 55%)`

---

## 2. Fonts & Typography System

### 2.1 Font Families

```typescript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace']
}
```

- **Primary Sans-Serif (`Inter`)**: Used for all user interface elements, headings, body text, form labels, and navigation.
- **Monospace (`JetBrains Mono`)**: Mandatory for SKUs, Barcodes, HSN/SAC codes, Serial Numbers, Currency amounts, Stock Quantities, and Financial Ledger entries.

### 2.2 Typography Scale & Line Heights

| Class Name | Font Size | Line Height | Usage |
| :--- | :--- | :--- | :--- |
| `text-xs` | `12px` (`0.75rem`) | `16px` | Badge text, table metadata, micro copy. |
| `text-sm` | `14px` (`0.875rem`) | `20px` | Form input labels, table cell content, button text. |
| `text-base` | `16px` (`1rem`) | `24px` | Standard body text, main descriptions. |
| `text-lg` | `18px` (`1.125rem`) | `28px` | Card titles, section headers. |
| `text-xl` | `20px` (`1.25rem`) | `28px` | Modal dialog titles, minor page headers. |
| `text-2xl` | `24px` (`1.5rem`) | `32px` | Primary page titles (`h1`), KPI stat numbers. |
| `text-3xl` | `30px` (`1.875rem`) | `36px` | Hero headings, large dashboard summary counters. |

---

## 3. UI Tokens, Shadows & Border Radius

### 3.1 Border Radius Tokens
- **Base Radius (`--radius`)**: `0.5rem` (8px).
- **`rounded-lg`**: `0.5rem` (8px) – Used for cards, dialog modals, and containers.
- **`rounded-md`**: `calc(var(--radius) - 2px)` (6px) – Used for form inputs, select dropdowns, and buttons.
- **`rounded-sm`**: `calc(var(--radius) - 4px)` (4px) – Used for badges and small tooltips.

### 3.2 Shadows & Elevation
- **`shadow-card`**: `0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)` – Standard subtle card elevation.
- **`shadow-card-hover`**: `0 20px 25px -5px rgba(0, 0, 0, 0.1)` – Interactive card hover lift.
- **`shadow-glow`**: `0 0 20px rgba(99, 102, 241, 0.3)` – Subtle purple glow for focused active elements.
- **`shadow-glow-lg`**: `0 0 40px rgba(99, 102, 241, 0.4)` – Prominent accent highlight.

---

## 4. UI Components & Layout Guidelines

### 4.1 UI Component Foundation
Invento uses **Shadcn UI** components constructed on top of headless **Radix UI** primitives:
- Buttons (`@/components/ui/button`)
- Dialog Modals (`@/components/ui/dialog`)
- Data Tables (`@/components/ui/table`)
- Form Inputs (`@/components/ui/input`, `@/components/ui/select`, `@/components/ui/textarea`)
- Badges & Tooltips (`@/components/ui/badge`, `@/components/ui/tooltip`)

### 4.2 Keyboard Accessibility Focus Rings
All interactive elements (buttons, inputs, links, tabs) enforce a visible focus ring for keyboard navigation:
```css
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
```

---

## 5. Design Guidelines for AI Assistants

1. **Use Semantic HSL Variables**:
   - Always use Tailwind theme utility classes (`bg-background`, `text-foreground`, `border-border`, `bg-primary`, `text-muted-foreground`).
   - Do NOT hardcode custom hex colors like `#000000` or `#121212` in components.

2. **Format Numeric Data with Monospace Font**:
   - Apply `font-mono` when rendering currency prices (e.g. `$1,250.00`), SKU identifiers, barcode numbers, and serial numbers.

3. **Reuse Shadcn Primitives**:
   - Prefer importing existing components from `@/components/ui/` rather than writing raw HTML elements (`<button>`, `<input>`) from scratch.

4. **Maintain Dark-First Responsive Design**:
   - Ensure components look clean in dark mode by default and support responsive layout classes (`sm:`, `md:`, `lg:`).