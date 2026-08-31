# VS Code AI Prompt - Enterprise Dashboard Redesign

Use this in VS Code AI Chat (Cmd+Shift+I or Ctrl+Shift+I)

---

## PROMPT 1: Full Dashboard Component

```
Create a premium enterprise dashboard page for a Next.js inventory SaaS using Tailwind CSS, shadcn/ui, and Recharts.

Design specs:
- Color: Indigo primary (#4F46E5), slate grays, emerald success, rose error
- Font: Inter, numbers in JetBrains Mono
- Cards: 12px radius, subtle gradient bg, hover:translateY(-2px)
- Spacing: 24px gaps, 32px section padding

Components needed:
1. KPI cards with animated counters (Total Revenue, Sales Count, Customers) showing percentage change and sparklines
2. Inventory Health donut chart with healthy/low/out-of-stock breakdown
3. Sales Trend area chart with 7/30/90 day toggle
4. Recent Activity feed with timestamps
5. Quick Actions floating panel

Use: Card, Badge, Button, Tabs from shadcn. Animate with Framer Motion. Icons from Lucide.

File: src/app/dashboard/page.tsx
```

---

## PROMPT 2: KPI Card Component

```
Create a reusable KPIGlassCard component in TypeScript/React:

Props:
- title: string
- value: number (format as currency if isCurrency=true)
- change: number (percentage, show + green or - red)
- sparklineData: number[] (7 days)
- icon: LucideIcon
- onClick?: () => void

Visual:
- Glassmorphism: bg-white/80 backdrop-blur, border border-slate-200/50
- Value: text-3xl font-mono font-bold text-slate-900
- Change pill: rounded-full px-2 py-0.5 text-xs font-medium
- Sparkline: 40px height, gradient stroke (indigo to blue)
- Hover: shadow-lg shadow-indigo-500/10, scale-[1.02]

Animation: 
- Number counts up from 0 on mount (duration: 1s)
- Sparkline draws left-to-right (pathLength animation)

File: src/components/dashboard/KPIGlassCard.tsx
```

---

## PROMPT 3: Sidebar Navigation

```
Redesign the sidebar navigation component with:

Structure:
- Collapsible (icons-only mode)
- Sections: Dashboard, Inventory, Finance, Reports, Settings
- Each item: icon (20px), label, optional badge count
- Active state: left 3px indigo border, bg-indigo-50/50

Features:
- Keyboard shortcuts display (⌘+1, ⌘+2)
- Recent items section (last 3 visited)
- Bottom: User avatar + role badge + logout
- Hover tooltips when collapsed

Animation:
- Expand/collapse: 300ms ease-out
- Active indicator: 200ms slide transition

Use: Tooltip, Avatar, Collapsible from shadcn. Icons: LayoutDashboard, Package, Wallet, BarChart3, Settings

File: src/components/layout/Sidebar.tsx
```

---

## PROMPT 4: Data Charts Section

```
Create an AnalyticsSection component with two charts side-by-side:

Chart 1: Inventory Health (Donut)
- Data: { healthy: 85%, low: 10%, outOfStock: 5% }
- Colors: emerald-500, amber-500, rose-500
- Center: Total SKU count
- Interactive: Click segment filters product list

Chart 2: Sales Trend (Area)
- X-axis: Last 30 days
- Y-axis: Revenue (left) + Units sold (right)
- Gradient fill under area (indigo to transparent)
- Toggle: 7D | 30D | 90D | 1Y

Shared:
- Card wrapper with title and "Export" button
- Loading skeleton state
- Empty state: "No data yet" with CTA

Use Recharts. Responsive container.

File: src/components/dashboard/AnalyticsSection.tsx
```

---

## PROMPT 5: Setup Guide Widget

```
Create an OnboardingChecklist component:

Features:
- Progress bar at top: "Step 3 of 5" with visual connector
- Checklist items with icons and estimated time ("2 min")
- Completed items: strikethrough + check animation
- Current item: pulsing border + "Continue" button
- Celebration: Confetti on 100% completion

Items:
1. Complete business profile (2 min)
2. Add first product (3 min)  
3. Create first sale (2 min)
4. Invite team member (1 min)
5. Connect bank account (5 min)

Style:
- Card with soft gradient bg
- Checkboxes: Custom animated svg checkmark
- Buttons: Primary for current step, ghost for others

Animation: Stagger children 100ms apart on mount

File: src/components/dashboard/SetupGuide.tsx
```

---

## PROMPT 6: Quick Actions FAB

```
Create a QuickActions component:

Design:
- Floating button bottom-right, 56px circle
- Opens menu with 4-6 action items in arc pattern
- Items: New Sale, Add Product, Create Invoice, Record Expense

Animation:
- Menu opens: Items scale from 0 to 1 with 50ms stagger
- Icons rotate in from different angles
- Background backdrop blur
- Close: Reverse animation

Each action:
- Icon + label
- Keyboard shortcut badge
- Color-coded (sale=green, product=blue, invoice=purple, expense=orange)

Accessibility: ESC to close, focus trap when open

File: src/components/dashboard/QuickActions.tsx
```

---

## PROMPT 7: Loading States

```
Create skeleton loading components:

1. CardSkeleton:
   - Header: 2 lines (title + subtitle)
   - Content: 3-4 rows of placeholder blocks
   - Shimmer animation (bg-gradient animate-pulse)

2. ChartSkeleton:
   - Rounded rectangle placeholder
   - Animated gradient sweep left-to-right

3. TableSkeleton:
   - Header row
   - 5 data rows with columns

Style:
- Base: bg-slate-200
- Shimmer: bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200
- Rounded: 8px
- Duration: 1.5s infinite

Use Tailwind only, no external libs.

Files:
- src/components/skeletons/CardSkeleton.tsx
- src/components/skeletons/ChartSkeleton.tsx
- src/components/skeletons/TableSkeleton.tsx
```

---

## PROMPT 8: Global Styles + Theme

```
Create global design tokens and CSS variables:

1. Extend tailwind.config.ts:
   - Colors: brand (indigo palette), semantic colors
   - Font: Inter, JetBrains Mono
   - Animation: keyframes for shimmer, count-up, slide-in
   - BoxShadow: card, card-hover, floating

2. Create globals.css additions:
   - CSS variables for theming (--color-primary, --radius-card)
   - Utility classes: .glass (backdrop-blur + bg-white/80)
   - Animation keyframes: shimmer, fade-in-up, scale-in

3. Create theme provider:
   - Light/dark mode toggle
   - Color density: compact/comfortable/spacious
   - Persist to localStorage

Files:
- tailwind.config.ts (extend theme)
- src/app/globals.css (custom CSS)
- src/components/providers/ThemeProvider.tsx
```

---

## PROMPT 9: Role-Based Navigation

```
Update the navigation to show different items based on user role:

Roles:
- Owner: Full menu (Dashboard, Inventory, Finance, Reports, Settings, Team)
- Manager: Dashboard, Inventory, Finance, Reports, Team (simplified)
- Staff: Dashboard, Inventory only (no Finance/Reports/Settings)
- Viewer: Dashboard only (read-only, no actions)

Implementation:
- Add role prop to Sidebar
- Filter nav items array based on role
- Hide restricted sections completely (not disabled)
- Show "Upgrade for more features" teaser for limited roles

Use the existing filterNavByRole utility if available.

File: Update src/components/layout/Sidebar.tsx
```

---

## PROMPT 10: Animation Utilities

```
Create reusable animation variants for Framer Motion:

1. fadeInUp:
   - initial: { opacity: 0, y: 20 }
   - animate: { opacity: 1, y: 0 }
   - transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }

2. staggerContainer:
   - staggerChildren: 0.1
   - delayChildren: 0.2

3. scaleOnHover:
   - whileHover: { scale: 1.02 }
   - whileTap: { scale: 0.98 }

4. countUp:
   - animate number from 0 to target over 1s
   - use spring physics for natural feel

5. pathDraw:
   - For SVG paths (sparklines)
   - initial: { pathLength: 0 }
   - animate: { pathLength: 1 }

Export all from: src/lib/animations.ts

Also create AnimatePresence wrapper for page transitions.
```

---

## SHORTCUT PROMPT (For Quick Changes)

```
Improve this [COMPONENT] with:
- Glassmorphism card design (backdrop-blur, subtle border)
- Hover lift effect (translateY -2px + shadow)
- Smooth transitions (300ms ease-out)
- Better empty state with illustration
- Loading skeleton placeholder

Current code:
[PASTE CODE HERE]
```

---

## USAGE IN VS CODE

1. **Open AI Chat**: `Cmd+Shift+I` (Mac) or `Ctrl+Shift+I` (Windows)
2. **Select file** you want to edit
3. **Paste prompt** from above
4. **Accept suggestions** with `Tab` or click checkmark
5. **Iterate**: Add follow-up requests like "make it more compact" or "add animation"

---

## TIPS FOR BEST RESULTS

- **Be specific**: "12px border-radius" not "rounded corners"
- **Reference files**: "Use the existing Sidebar.tsx as base"
- **Show examples**: Paste current code you want improved
- **Iterate in steps**: Don't ask for everything at once
- **Use @ mentions**: @file Sidebar.tsx to reference context

---

## EXAMPLE CONVERSATION FLOW

**You**: Create KPI card component (Prompt 2 above)

**VS Code AI**: [Generates KPIGlassCard.tsx]

**You**: Now add it to the dashboard page with sample data

**VS Code AI**: [Updates dashboard/page.tsx]

**You**: The numbers should animate on load

**VS Code AI**: [Adds Framer Motion count-up animation]

**You**: Make the card responsive - 3 columns on desktop, 1 on mobile

**VS Code AI**: [Adds grid classes]

---

*Optimized for GitHub Copilot, Cody, or VS Code AI Chat*
