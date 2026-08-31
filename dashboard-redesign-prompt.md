# Enterprise-Grade Dashboard Redesign AI Prompt

## Context
**Product**: Hira Electronics - Inventory/Stock Management SaaS  
**Current Stack**: Next.js, Convex, Tailwind CSS, shadcn/ui  
**User Roles**: Owner, Manager, Staff, Viewer  

---

## PRIMARY PROMPT

```
Transform this inventory management dashboard into a WORLD-CLASS, enterprise-grade SaaS interface that rivals the best B2B software like Linear, Notion, Stripe, and Vercel.

### VISUAL DESIGN SYSTEM

**Color Palette (Sophisticated & Professional)**
- Primary: Deep indigo/slate (#4F46E5) with electric blue accents
- Secondary: Warm grays (slate-50 to slate-900) - avoid pure black/white
- Semantic Colors:
  - Success: Emerald with subtle glow effects
  - Warning: Amber with soft backgrounds
  - Error: Rose with rounded pill badges
  - Info: Sky blue with glassmorphism
- Dark mode ready: Automatic contrast adjustments

**Typography (Premium Hierarchy)**
- Headings: Inter or Geist (font-weight: 600-700)
- Body: Inter (font-weight: 400-500)
- Mono: JetBrains Mono for numbers/data
- Scale:
  - Page titles: 28px/1.2 (tracking-tight)
  - Section headers: 18px/1.4
  - Body: 14px/1.6
  - Micro labels: 12px/1.5 (uppercase, tracking-wide, text-slate-500)

**Spacing & Layout**
- Base unit: 4px grid system
- Section padding: 24px-32px
- Card gaps: 16px-24px
- Border radius: 12px (cards), 8px (buttons), 9999px (pills)
- Shadows: Multi-layer (0 1px 2px rgba, 0 4px 12px rgba) for depth

---

### COMPONENT REDESIGN SPECIFICATIONS

#### 1. SIDEBAR NAVIGATION (Left Panel)
**Current Issues**: Basic list, no visual hierarchy, cluttered

**Enterprise Improvements**:
- Collapsible sidebar with smooth 300ms transitions
- Active state: Left border accent (3px) + subtle background gradient
- Icon system: Lucide icons with 20px size, consistent stroke width
- Group sections with micro-headers ("MANAGEMENT", "FINANCE", "SYSTEM")
- Hover states: Scale(1.02) + background shift + icon color change
- Badge indicators: Animated pulse for notifications
- Bottom user profile: Avatar + role badge + status dot
- Quick Actions flyout on hover with glassmorphism

**Implementation**:
```
- Glassmorphism backdrop when expanded
- Keyboard shortcuts displayed (⌘+1, ⌘+2)
- Recently accessed items (last 3) at top
- Role-based section collapse (Staff sees simplified menu)
```

#### 2. DASHBOARD HEADER
**Current**: Basic breadcrumb + title
**Premium Version**:
- Breadcrumb with micro-interactions (hover reveals dropdown)
- Real-time sync indicator (last updated: 2s ago)
- Contextual actions that change per page
- Global search: Command+K shortcut, fuzzy search, recent items
- Notification bell with unread count + dropdown panel
- User avatar dropdown with role switcher (if multiple companies)

#### 3. KPI CARDS (Key Metrics)
**Current**: Static cards with basic numbers
**Enterprise Version**:
- **Total Revenue**: 
  - Large typography (36px, font-mono for numbers)
  - Mini sparkline chart (last 7 days)
  - Percentage change pill (green/red with arrow)
  - Comparison tooltip ("vs last month")
  
- **Sales Count**:
  - Counter animation on load (0 → value)
  - Breakdown by channel (small bars)
  - Target progress ring (circular indicator)
  
- **Total Customers**:
  - Growth trend line
  - Segmentation (new vs returning)
  - Quick action: "View all" appears on hover

**Card Design**:
- Subtle gradient background (top-left to bottom-right)
- 1px border with 0.5 opacity
- Hover: translateY(-2px) + shadow increase
- Loading skeleton: Shimmer animation

#### 4. DATA VISUALIZATION
**Charts & Graphs**:
- Use Recharts or Tremor for consistency
- Interactions: Hover shows tooltip with detailed breakdown
- Time range selector (7d, 30d, 90d, 1y) with smooth transitions
- Empty states: Illustration + CTA button ("Add first product")
- Loading: Progressive reveal (animate bars left-to-right)

**Specific Sections**:

**Top Products**:
- Horizontal bar chart with product images
- Rank numbers with medal icons (1st, 2nd, 3rd)
- Revenue contribution percentage
- "View details" on hover

**Inventory Health**:
- Donut chart: Healthy (green) / Low Stock (amber) / Out of Stock (rose)
- Center number: Total SKUs
- Click segments to filter product list
- Alert cards for critical items (below reorder level)

**Sales Trend**:
- Area chart with gradient fill
- Dual axis: Revenue (line) + Units (bars)
- Annotations for significant events
- Export button (CSV, PNG)

**Cash Balance**:
- Big number display with currency symbol
- Mini cashflow timeline
- Upcoming bills indicator
- Quick action: "Record payment" button

**Receivables Aging**:
- Stacked bar by age buckets
- Risk indicator colors
- Drill-down to customer list
- "Send reminder" bulk action

#### 5. SETUP GUIDE (Onboarding)
**Current**: Simple progress bar
**Enterprise SaaS Pattern**:
- Celebratory confetti on completion
- Checklist with satisfying check animations
- Estimated time per task ("2 min")
- Skip option with "Remind me later"
- Contextual tooltips explaining value
- Progress: "Step 3 of 5" with visual connector lines

#### 6. QUICK ACTIONS PANEL
**Current**: Static list
**Improvements**:
- Smart suggestions based on user role and recent activity
- "Create Invoice" highlighted if payments pending
- "Restock Alert" if low inventory detected
- Keyboard shortcuts visible (⌘N for new product)
- Recently used actions at top

#### 7. TABS (Overview, Operations, Analytics, Advanced)
**Premium Tab Design**:
- Pill-shaped container (rounded-full)
- Active tab: Solid background + shadow
- Inactive: Hover shows subtle background
- Smooth slide animation between tabs
- Content fade transition (150ms)
- Mobile: Horizontal scroll with snap points

---

### INTERACTION DESIGN

**Micro-interactions**:
- Buttons: Scale(0.98) on click, ripple effect on hover
- Cards: Subtle lift on hover (translateY + shadow)
- Inputs: Focus ring with gradient border
- Toggles: Smooth 200ms slide with elastic bounce
- Skeletons: Shimmer wave animation (not just pulse)

**Loading States**:
- Progressive loading (show data as it arrives)
- Staggered animations (children fade in 50ms apart)
- Never show blank space - always show skeleton

**Empty States**:
- Custom illustrations (not generic)
- Clear headline: "No sales yet"
- Subtext: "Start by adding your first product"
- Primary CTA button
- Secondary: "Import demo data" for testing

**Error States**:
- Inline validation with shake animation
- Toast notifications with status colors
- Retry buttons with exponential backoff
- Fallback UI ("Unable to load chart - View table instead")

---

### SAAS-SPECIFIC FEATURES

**Role-Based UI**:
- **Owner**: Full dashboard, all metrics, admin settings
- **Manager**: Team metrics, approval workflows, reports
- **Staff**: Simplified view, task-focused, no sensitive data
- **Viewer**: Read-only, summary view, no edit actions

**Data Density Modes**:
- Compact mode: Smaller fonts, tighter spacing (power users)
- Comfortable mode: Default
- Spacious mode: For presentations/training

**Customization**:
- Drag-and-drop dashboard widgets
- Save custom views ("My Morning Dashboard")
- Pin important metrics to top
- Color themes (Indigo, Emerald, Rose, Amber)

**Performance Indicators**:
- Real-time connection status (WebSocket)
- Background sync indicator (spinner when stale)
- "Working offline" mode with queue indicator
- Data freshness timestamp

---

### RESPONSIVE BREAKPOINTS

**Desktop (1280px+)**:
- Full sidebar expanded
- 3-4 column grid for KPIs
- Side-by-side charts

**Tablet (768px-1279px)**:
- Collapsible sidebar (icons only)
- 2 column grid
- Stacked charts

**Mobile (<768px)**:
- Bottom navigation (5 key items)
- Hamburger menu for rest
- Single column, cards stack
- Swipe gestures between tabs
- Floating action button (FAB) for primary action

---

### ACCESSIBILITY (Enterprise Requirement)

- WCAG 2.1 AA compliance
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader optimized (aria-labels, live regions)
- Focus visible indicators
- Color contrast minimum 4.5:1
- Reduced motion support (`prefers-reduced-motion`)

---

### ANIMATION SPECIFICATIONS

**Easing Functions**:
- Standard: `cubic-bezier(0.4, 0, 0.2, 1)` (300ms)
- Enter: `cubic-bezier(0, 0, 0.2, 1)` (200ms)
- Exit: `cubic-bezier(0.4, 0, 1, 1)` (150ms)
- Bounce: `cubic-bezier(0.34, 1.56, 0.64, 1)` (500ms)

**Durations**:
- Micro (hover, focus): 150ms
- Standard (transitions): 300ms
- Complex (page transitions): 500ms
- Emphasis (celebrations): 800ms

---

## OUTPUT REQUIREMENTS

Provide:
1. **Visual Mockup**: Detailed description or wireframe ASCII art
2. **Component Breakdown**: Each section with specific CSS/Tailwind classes
3. **Animation Code**: CSS keyframes or Framer Motion variants
4. **Color Tokens**: Exact hex/rgb values for design system
5. **Interaction Flow**: State diagrams for key user flows
6. **Implementation Priority**: P0 (critical), P1 (important), P2 (nice-to-have)

---

## EXAMPLE SECTION TO REDESIGN

**Current State**: 
```
[Basic Cards]
Total Revenue    |   Sales Count   |   Total Customers
$0               |       0         |         0
```

**Target State**:
```
┌─────────────────────────────────────────────────────────────┐
│  KEY PERFORMANCE INDICATORS                    [Customize ▼]│
├──────────────────┬──────────────────┬───────────────────────┤
│                  │                  │                       │
│  Total Revenue   │  Sales Count     │  Total Customers      │
│  ╔══════════╗   │  ╔══════════╗   │  ╔══════════╗        │
│  ║  $24,592 ║   │  ║   147    ║   │  ║   1,204  ║        │
│  ╚══════════╝   │  ╚══════════╝   │  ╚══════════╝        │
│                  │                  │                       │
│  ▲ 12.5%       │  ▲ 8.2%         │  ▲ 23.1%              │
│  vs last month   │  vs last month   │  vs last month        │
│                  │                  │                       │
│  [Sparkline ▁▂▄]│  [Sparkline ▁▄▆]│  [Sparkline ▃▅▇]      │
│                  │                  │                       │
└──────────────────┴──────────────────┴───────────────────────┘
```

Style: Glassmorphism cards, emerald/slate/rose semantic colors, Inter font, 12px border-radius, subtle shadows that increase on hover.
```

---

## USAGE

Copy the PRIMARY PROMPT section and paste into:
- **Claude** (for detailed design specs)
- **ChatGPT** (for component code)
- **Midjourney/DALL-E** (for visual inspiration)
- **Figma AI** (for design generation)

---

## BONUS: SHADCN/UI COMPONENT LIBRARY

Include these shadcn components for rapid implementation:
- `@radix-ui/react-dialog` - Modals
- `@radix-ui/react-dropdown-menu` - Navigation
- `@radix-ui/react-tabs` - Tab interface
- `@radix-ui/react-tooltip` - Contextual help
- `@radix-ui/react-avatar` - User profiles
- `@radix-ui/react-progress` - Setup guide
- `recharts` - Data visualization
- `framer-motion` - Animations
- `lucide-react` - Icon system

---
