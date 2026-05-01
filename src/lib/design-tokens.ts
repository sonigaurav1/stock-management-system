/**
 * Enterprise Design Tokens
 * Comprehensive design system for the Inventory Management Dashboard
 * Based on WCAG AAA accessibility standards
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const COLORS = {
  // Primary - Dark enterprise slate
  primary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617'
  },

  // Success - Enterprise green for positive indicators
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBFBDC',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Primary CTA
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#145231'
  },

  // Warning - Enterprise orange
  warning: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12'
  },

  // Destructive - Enterprise red
  destructive: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D'
  },

  // Neutral - For text and backgrounds
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712'
  }
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const TYPOGRAPHY = {
  // Font families with fallbacks
  fontFamily: {
    heading: '"Fira Code", "Courier New", monospace',
    body: '"Fira Sans", "Segoe UI", system-ui, -apple-system, sans-serif',
    mono: '"Fira Code", "Monaco", "Courier New", monospace'
  },

  // Font sizes (px) with line heights
  fontSize: {
    xs: { size: '12px', lineHeight: '16px', letterSpacing: '0.4px' },
    sm: { size: '14px', lineHeight: '20px', letterSpacing: '0.25px' },
    base: { size: '16px', lineHeight: '24px', letterSpacing: '0px' },
    lg: { size: '18px', lineHeight: '28px', letterSpacing: '0px' },
    xl: { size: '20px', lineHeight: '28px', letterSpacing: '-0.2px' },
    '2xl': { size: '24px', lineHeight: '32px', letterSpacing: '-0.4px' },
    '3xl': { size: '30px', lineHeight: '36px', letterSpacing: '-0.6px' },
    '4xl': { size: '36px', lineHeight: '44px', letterSpacing: '-0.8px' }
  },

  // Font weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
};

// ============================================================================
// SPACING
// ============================================================================

export const SPACING = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px'
};

// ============================================================================
// SHADOWS & ELEVATION
// ============================================================================

export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',

  // Dark mode shadows (using OLED optimization)
  dark: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.5), 0 1px 2px 0 rgba(0, 0, 0, 0.4)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)'
  }
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const BORDER_RADIUS = {
  none: '0px',
  sm: '2px',
  base: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px'
};

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const Z_INDEX = {
  auto: 'auto',
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 100,
  sticky: 1020,
  fixed: 1030,
  floating: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080
};

// ============================================================================
// TRANSITIONS & ANIMATIONS
// ============================================================================

export const TRANSITIONS = {
  // Duration (milliseconds)
  duration: {
    instant: '50ms',
    fastest: '100ms',
    faster: '150ms',
    fast: '200ms',
    base: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms'
  },

  // Timing functions
  easing: {
    linear: 'linear',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    elasticOut: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  }
};

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

export const COMPONENT_TOKENS = {
  // Button sizes and states
  button: {
    height: {
      sm: '32px',
      base: '40px',
      lg: '48px'
    },
    padding: {
      sm: '8px 12px',
      base: '10px 16px',
      lg: '12px 20px'
    }
  },

  // Input field specifications
  input: {
    height: '40px',
    borderRadius: '6px',
    focusRing: '2px solid rgb(34, 197, 94)', // Success green focus ring
    focusRingOffset: '2px'
  },

  // Card/Panel specifications
  card: {
    borderRadius: '8px',
    padding: '16px',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  }
};

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// ============================================================================
// SEMANTIC COLOR ROLES
// ============================================================================

export const SEMANTIC_COLORS = {
  // Light mode
  light: {
    background: COLORS.neutral[50],
    foreground: COLORS.neutral[950],
    muted: COLORS.neutral[400],
    mutedForeground: COLORS.neutral[600],
    card: COLORS.neutral[0],
    cardForeground: COLORS.neutral[950],
    primary: COLORS.primary[900],
    primaryForeground: COLORS.neutral[0],
    secondary: COLORS.neutral[200],
    secondaryForeground: COLORS.neutral[950],
    accent: COLORS.success[500],
    accentForeground: COLORS.neutral[0],
    success: COLORS.success[500],
    warning: COLORS.warning[500],
    destructive: COLORS.destructive[500],
    border: COLORS.neutral[200]
  },

  // Dark mode
  dark: {
    background: COLORS.primary[950],
    foreground: COLORS.neutral[50],
    muted: COLORS.neutral[700],
    mutedForeground: COLORS.neutral[400],
    card: COLORS.primary[900],
    cardForeground: COLORS.neutral[50],
    primary: COLORS.primary[50],
    primaryForeground: COLORS.primary[950],
    secondary: COLORS.primary[800],
    secondaryForeground: COLORS.neutral[50],
    accent: COLORS.success[400],
    accentForeground: COLORS.primary[950],
    success: COLORS.success[400],
    warning: COLORS.warning[400],
    destructive: COLORS.destructive[400],
    border: COLORS.primary[800]
  }
};

// ============================================================================
// EXPORT DEFAULTS
// ============================================================================

export const DESIGN_TOKENS = {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  SHADOWS,
  BORDER_RADIUS,
  Z_INDEX,
  TRANSITIONS,
  COMPONENT_TOKENS,
  BREAKPOINTS,
  SEMANTIC_COLORS
};

export default DESIGN_TOKENS;
