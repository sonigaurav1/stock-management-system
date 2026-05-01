# Design Tokens Guide

**Enterprise Inventory Management Dashboard**  
**Last Updated:** April 18, 2026

## Overview

This guide documents the enterprise design tokens and how to use them across the application. All components should use these tokens to ensure consistency, accessibility, and maintainability.

---

## Color Palette

### Primary Colors (Dark Mode - OLED Default)

Enterprise-grade dark mode optimized for eye comfort and AMOLED displays.

```
Background:  #020617 (Almost black, OLED optimized)
Foreground:  #F8FAFC (Almost white for text)
Primary:     #22C55E (Enterprise green for CTAs)
Card:        #0F172A (Dark slate for cards/sections)
Border:      #1E293B (Subtle separator)
```

### Semantic Colors

| Use Case    | Light   | Dark    | WCAG Level |
| ----------- | ------- | ------- | ---------- |
| **Success** | #16A34A | #22C55E | AAA ✓      |
| **Warning** | #EA580C | #FB923C | AAA ✓      |
| **Error**   | #DC2626 | #EF4444 | AAA ✓      |
| **Info**    | #2563EB | #3B82F6 | AAA ✓      |

### How to Use Colors

```tsx
// ✅ CORRECT - Using CSS variables
<button className='bg-primary text-primary-foreground'>
  Save
</button>

<div className='border-b border-border bg-card'>
  Card content
</div>

// ✅ CORRECT - Using Tailwind color utilities
<div className='text-success-500 dark:text-success-400'>
  ✓ Success!
</div>

// ❌ INCORRECT - Direct hex values
<button style={{ backgroundColor: '#22C55E' }}>
  Don't do this
</button>

// ❌ INCORRECT - Inconsistent color names
<div className='bg-green-500'>
  Avoid magic colors
</div>
```

---

## Typography

### Font Stack

```css
/* Headings - Fira Code (monospace, technical aesthetic) */
font-family: 'Fira Code', 'Courier New', monospace;

/* Body text - Fira Sans (clean, readable) */
font-family:
  'Fira Sans',
  'Segoe UI',
  system-ui,
  -apple-system,
  sans-serif;

/* Code/Data - Fira Code (monospace) */
font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
```

### Font Sizes & Line Heights

| Size     | Use Case                 | Font Size | Line Height | Letter Spacing |
| -------- | ------------------------ | --------- | ----------- | -------------- |
| **xs**   | Small labels, captions   | 12px      | 16px        | 0.4px          |
| **sm**   | Form labels, helper text | 14px      | 20px        | 0.25px         |
| **base** | Body text, default       | 16px      | 24px        | 0px            |
| **lg**   | Large text, emphasis     | 18px      | 28px        | 0px            |
| **xl**   | Large headings           | 20px      | 28px        | -0.2px         |
| **2xl**  | Section headings         | 24px      | 32px        | -0.4px         |
| **3xl**  | Page headings            | 30px      | 36px        | -0.6px         |

### How to Use Typography

```tsx
// ✅ CORRECT - Using text-* utilities
<h1 className='text-3xl font-bold tracking-tight'>
  Dashboard
</h1>

<p className='text-base leading-relaxed'>
  Body text with proper line height
</p>

<small className='text-xs text-muted-foreground'>
  Caption text
</small>

// ✅ CORRECT - Font family classes
<h2 className='font-heading text-2xl font-semibold'>
  Heading
</h2>

<p className='font-body text-base'>
  Body text
</p>

// ❌ INCORRECT - Direct inline styles
<h1 style={{ fontSize: '30px', fontFamily: 'Arial' }}>
  Don't do this
</h1>

// ❌ INCORRECT - Mixing font stacks
<p className='text-lg font-mono'>
  Avoid mixing font families
</p>
```

---

## Spacing System

Consistent spacing creates visual harmony and improves usability.

```
1  =  4px   (micro spacing)
2  =  8px   (element padding)
3  =  12px  (component internal)
4  =  16px  (standard padding)
6  =  24px  (section spacing)
8  =  32px  (large spacing)
12 =  48px  (page margins)
```

### How to Use Spacing

```tsx
// ✅ CORRECT - Using space-* utilities
<div className='p-4 space-y-6'>
  <button className='px-4 py-2 mx-2'>
    Spaced button
  </button>
</div>

<div className='mt-8 mb-4'>
  Consistent margins
</div>

// ❌ INCORRECT - Magic numbers
<div style={{ padding: '20px', marginBottom: '15px' }}>
  Inconsistent spacing
</div>

// ❌ INCORRECT - Mixed spacing units
<div className='p-4 m-[15px]'>
  Avoid arbitrary values
</div>
```

---

## Accessibility - Focus States

All interactive elements must have visible focus indicators for keyboard navigation (WCAG AAA requirement).

```tsx
// ✅ CORRECT - Automatic focus ring
<button className='focus-visible:ring-2 focus-visible:ring-offset-2'>
  Keyboard accessible
</button>

// ✅ CORRECT - Using global styles
// These are auto-applied via globals.css
<a href='/'>Link with auto focus ring</a>
<input type='text' /> {/* Auto focus ring */}

// ❌ INCORRECT - Removing focus
<button className='outline-none'>
  Don't remove focus indicators!
</button>

// ❌ INCORRECT - Weak focus
<button className='focus:outline-1'>
  Too subtle for accessibility
</button>
```

### Focus Ring Properties

- **Color**: Primary brand color (`--ring`)
- **Width**: 2px (visible and not intrusive)
- **Offset**: 2px (visual separation from element)
- **Timing**: 200ms easing for smooth appearance

---

## Shadows & Elevation

Creates depth hierarchy with consistent shadow patterns.

### Shadow Levels

```
sm  - Subtle shadows for slight elevation
base - Standard cards and small elevation
md  - Medium elevation (dialogs, dropdowns)
lg  - High elevation (modals, popovers)
xl  - Maximum elevation (top-level modals)
```

### How to Use Shadows

```tsx
// ✅ CORRECT - Semantic shadows
<div className='shadow-md'>
  Card with elevation
</div>

// ✅ CORRECT - Dark mode awareness
<div className='shadow-md dark:shadow-lg'>
  Elevated
</div>

// ❌ INCORRECT - Custom shadows
<div style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
  Inconsistent
</div>
```

---

## Border Radius

Consistent rounding for modern appearance.

```
sm  =  2px   (subtle, buttons)
base =  4px  (default)
md  =  6px   (common)
lg  =  8px   (cards, containers)
xl  =  12px  (large surfaces)
```

### How to Use Border Radius

```tsx
// ✅ CORRECT - Semantic radius
<button className='rounded-md'>
  Button
</button>

<Card className='rounded-lg'>
  Card with standard radius
</Card>

// ❌ INCORRECT - Magic numbers
<div style={{ borderRadius: '10px' }}>
  Inconsistent radius
</div>
```

---

## Transitions & Animations

Smooth transitions improve UX and feel natural.

### Duration Guidelines

| Duration | Use Case                        |
| -------- | ------------------------------- |
| 50ms     | Instant feedback (hover states) |
| 150ms    | UI transitions (fade, slide)    |
| 300ms    | Modals, panels open/close       |
| 500ms    | Page transitions                |
| 1000ms   | Slow animations (loading)       |

### How to Use Transitions

```tsx
// ✅ CORRECT - Appropriate timing
<button className='transition-colors duration-200 hover:bg-primary'>
  Hover effect
</button>

<div className='transition-all duration-300 opacity-0 group-hover:opacity-100'>
  Fade in on hover
</div>

// ✅ CORRECT - Respecting reduced motion
<div className='transition-colors duration-300 motion-safe:duration-200'>
  Respects user preferences
</div>

// ❌ INCORRECT - Too slow
<button className='transition-all duration-1000 hover:scale-110'>
  Frustratingly slow
</button>

// ❌ INCORRECT - Creating motion sickness
<div className='animate-bounce'>
  Avoid jarring animations
</div>
```

---

## Z-Index Scale

Consistent layering prevent visual confusion.

```
    -1 = Hide
     0 = Base/Auto
    10 = Docked elements (sticky header)
   100 = Dropdowns, popovers
  1000 = Modals, dialogs
  1050 = Top-level modals
  1080 = Notifications/toasts
```

### How to Use Z-Index

```tsx
// ✅ CORRECT - Using semantic z-index
<div className='sticky top-0 z-docked'>
  Sticky header
</div>

<dialog className='z-modal'>
  Modal dialog
</dialog>

// ❌ INCORRECT - Magic numbers
<div style={{ zIndex: 9999 }}>
  Competing for supremacy
</div>

// ❌ INCORRECT - Incremental numbers
<div className='z-10'>
  Hard to manage
</div>
```

---

## Responsive Design

### Breakpoints

```
xs = 320px   (mobile)
sm = 640px   (small tablet)
md = 768px   (tablet)
lg = 1024px  (desktop)
xl = 1280px  (wide desktop)
```

### How to Use Responsive Classes

```tsx
// ✅ CORRECT - Mobile first
<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
  Responsive grid
</div>

<button className='text-sm md:text-base lg:text-lg'>
  Responsive text
</button>

// ✅ CORRECT - Hide on mobile
<div className='hidden md:block'>
  Desktop only
</div>

// ❌ INCORRECT - Desktop first
<div className='md:grid-cols-3 grid-cols-1'>
  Harder to maintain
</div>

// ❌ INCORRECT - Arbitrary breakpoints
<div className='max-w-[900px]'>
  Use defined breakpoints
</div>
```

---

## Dark Mode

Default is dark mode (OLED optimized). Light mode is opt-in.

### How Dark Mode Works

```tsx
// ✅ CORRECT - Dark mode support
<div className='bg-card dark:bg-card'>
  Auto background
</div>

<p className='text-foreground'>
  Auto text color
</p>

// CSS variables automatically switch based on .dark class
// Add to <html> element: <html class="dark">

// ✅ CORRECT - Emphasizing changes in dark
<div className='bg-background dark:bg-card text-foreground'>
  Different background in dark mode
</div>

// ❌ INCORRECT - Light mode default
<div className='dark:bg-black'>
  Light mode not supported
</div>
```

---

## Best Practices

### ✅ DO

- ✓ Use CSS variables and Tailwind utilities consistently
- ✓ Maintain visual hierarchy with typography scale
- ✓ Test keyboard navigation (Tab, Shift+Tab, Enter)
- ✓ Verify color contrast (4.5:1 minimum for text)
- ✓ Use semantic HTML for accessibility
- ✓ Respect `prefers-reduced-motion` setting
- ✓ Test in both light and dark modes
- ✓ Document custom components with token usage

### ❌ DON'T

- ✗ Use hardcoded hex colors
- ✗ Remove focus indicators
- ✗ Create custom spacing/sizing
- ✗ Mix multiple font families
- ✗ Use too many animations
- ✗ Ignore mobile responsiveness
- ✗ Assume everyone sees colors perfectly
- ✗ Override design tokens unnecessarily

---

## Import Design Tokens in Code

```tsx
import { DESIGN_TOKENS } from '@/lib/design-tokens';

const { COLORS, TYPOGRAPHY, SPACING, SHADOWS, TRANSITIONS } = DESIGN_TOKENS;

// Use in calculations or dynamic styles
const pageMaxWidth = '1280px';
const cardPadding = SPACING[4]; // '16px'
```

---

## Accessibility Checklist

Before submitting components:

- [ ] All interactive elements have visible focus states
- [ ] Color contrast passes WCAG AAA (4.5:1+)
- [ ] Text is resizable (no fixed px heights on containers)
- [ ] Keyboard navigation works (Tab navigation)
- [ ] Screen reader compatible (ARIA labels where needed)
- [ ] Reduced motion is respected
- [ ] Dark mode appearance tested
- [ ] Mobile responsive (tested at 375px width)

---

## Questions or Issues?

- Check [DESIGN_TOKENS.md](./design-tokens.ts) for raw token values
- Review component examples in `/src/components/`
- Test accessibility with [axe DevTools](https://www.deque.com/axe/devtools/)

---

**Enterprise Design System**  
Version 1.0 | For use in Inventory Management System dashboard only
