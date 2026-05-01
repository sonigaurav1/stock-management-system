/**
 * ESLint Configuration for Accessibility (JSX-A11Y)
 *
 * This configuration extends the jsx-a11y plugin to catch
 * accessibility issues during development for the dashboard.
 *
 * Usage:
 * 1. npm install -D eslint-plugin-jsx-a11y
 * 2. Extend this config in your .eslintrc.js or eslint.config.js
 * 3. Run: npm run lint
 *
 * Reference: https://github.com/jsx-eslint/eslint-plugin-jsx-a11y
 */

module.exports = {
  extends: ['plugin:jsx-a11y/recommended'],

  rules: {
    // =========================================================================
    // WCAG AAA Compliance Rules
    // =========================================================================

    // CRITICAL: All interactive elements must have labels
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/aria-label': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',

    // CRITICAL: Keyboard accessibility
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',

    // HIGH: Form field accessibility
    'jsx-a11y/label-has-for': 'off', // Replaced by label-has-associated-control
    'jsx-a11y/no-autofocus': 'warn',

    // HIGH: Alt text for images
    'jsx-a11y/alt-text': 'error',

    // HIGH: HTML standards
    'jsx-a11y/no-redundant-roles': 'warn',
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/anchor-has-content': 'error',

    // MEDIUM: Semantic HTML
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/html-has-lang': 'warn',
    'jsx-a11y/lang': 'warn',

    // MEDIUM: Interactive elements
    'jsx-a11y/no-noninteractive-role-to-interactive-role': 'warn',
    'jsx-a11y/no-noninteractive-tabindex': 'warn',
    'jsx-a11y/scope': 'error',
    'jsx-a11y/iframe-has-title': 'error',

    // LOW: ARIA best practices
    'jsx-a11y/aria-role': 'warn',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-unsupported-elements': 'warn',
    'jsx-a11y/media-has-caption': 'warn'
  },

  settings: {
    // Configure jsx-a11y
    'jsx-a11y': {
      components: {
        // Map custom component names to standard HTML equivalents
        Button: 'button',
        Link: 'a',
        Input: 'input'
      }
    }
  }
};

// ============================================================================
// EXAMPLE VIOLATIONS AND FIXES
// ============================================================================

/**
 * ❌ ERROR: Missing alt text on image
 *
 * <img src='chart.png' />
 *
 * ✅ FIX:
 *
 * <img src='chart.png' alt='Sales chart showing quarterly growth' />
 */

/**
 * ❌ ERROR: Missing label for checkbox
 *
 * <input type='checkbox' />
 *
 * ✅ FIX:
 *
 * <label htmlFor='agree'>
 *   <input id='agree' type='checkbox' />
 *   I agree to terms
 * </label>
 */

/**
 * ❌ ERROR: Div used as button without keyboard support
 *
 * <div onClick={handleClick}>
 *   Delete
 * </div>
 *
 * ✅ FIX:
 *
 * <button onClick={handleClick}>
 *   Delete
 * </button>
 *
 * OR with aria attributes:
 *
 * <div
 *   role='button'
 *   onClick={handleClick}
 *   onKeyDown={handleKeyDown}
 *   tabIndex={0}
 *   aria-label='Delete item'
 * >
 *   Delete
 * </div>
 */

/**
 * ❌ ERROR: Icon button with no label
 *
 * <button>
 *   <TrashIcon />
 * </button>
 *
 * ✅ FIX:
 *
 * <button aria-label='Delete this item'>
 *   <TrashIcon aria-hidden='true' />
 * </button>
 */

/**
 * ❌ ERROR: Click events without keyboard support
 *
 * <div onClick={handleSubmit}>
 *   Submit
 * </div>
 *
 * ✅ FIX:
 *
 * <div
 *   onClick={handleSubmit}
 *   onKeyDown={(e) => {
 *     if (e.key === 'Enter' || e.key === ' ') {
 *       handleSubmit();
 *     }
 *   }}
 *   role='button'
 *   tabIndex={0}
 * >
 *   Submit
 * </div>
 */

/**
 * ❌ ERROR: Heading without content
 *
 * <h1>{title || ''}</h1>
 *
 * ✅ FIX:
 *
 * {title && <h1>{title}</h1>}
 */

/**
 * ❌ ERROR: Form without associated labels
 *
 * <div>
 *   Email:
 *   <input type='email' />
 * </div>
 *
 * ✅ FIX:
 *
 * <div>
 *   <label htmlFor='email'>Email:</label>
 *   <input id='email' type='email' />
 * </div>
 */
