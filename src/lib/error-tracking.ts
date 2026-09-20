/**
 * Centralized Error Tracking System
 *
 * Handles error logging, categorization, and reporting.
 * Integrates with error reporting services (Sentry, LogRocket, etc.)
 */

export type ErrorCategory =
  | 'CONVEX_ERROR' // Database/API errors
  | 'AUTH_ERROR' // Authentication/authorization
  | 'VALIDATION_ERROR' // Form/data validation
  | 'PERMISSION_ERROR' // Permission denied
  | 'NOT_FOUND' // Resource not found
  | 'NETWORK_ERROR' // Network/connectivity
  | 'UNKNOWN_ERROR'; // Uncategorized

export interface ErrorContext {
  category: ErrorCategory;
  userId?: string;
  organizationId?: string;
  feature?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  category: ErrorCategory;
  message: string;
  stack?: string;
  timestamp: number;
  context: ErrorContext;
  isDev: boolean;
}

/**
 * Categorize error by type and message
 */
export function categorizeError(error: unknown): ErrorCategory {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('permission') || message.includes('forbidden')) {
      return 'PERMISSION_ERROR';
    }
    if (message.includes('not found') || message.includes('404')) {
      return 'NOT_FOUND';
    }
    if (message.includes('unauthorized') || message.includes('auth')) {
      return 'AUTH_ERROR';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('validation') || message.includes('required')) {
      return 'VALIDATION_ERROR';
    }
    if (message.includes('convex')) {
      return 'CONVEX_ERROR';
    }
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Create error report for logging/tracking
 */
export function createErrorReport(
  error: unknown,
  context: ErrorContext,
  isDev: boolean = process.env.NODE_ENV === 'development'
): ErrorReport {
  const isError = error instanceof Error;

  return {
    id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    category: context.category || categorizeError(error),
    message: isError ? error.message : String(error),
    stack: isError ? error.stack : undefined,
    timestamp: Date.now(),
    context: {
      ...context,
      category: context.category || categorizeError(error)
    },
    isDev
  };
}

/**
 * Log error to console and external services
 */
export function logError(
  error: unknown,
  context: ErrorContext,
  isDev: boolean = process.env.NODE_ENV === 'development'
): ErrorReport {
  const report = createErrorReport(error, context, isDev);

  // Log to console in development
  if (isDev) {
    console.error(`[${report.category}] ${report.message}`, {
      errorId: report.id,
      context: report.context,
      stack: report.stack
    });
  } else {
    // Log to console (visible in production logs)
    console.error(`[${report.category}] ${report.message} (ID: ${report.id})`);
  }

  // Send to external error tracking service
  // Example: Sentry.captureException(error, { tags: { category: report.category } })
  // Example: LogRocket.captureException(error)

  return report;
}

/**
 * Get user-friendly error message based on category
 */
export function getUserFriendlyMessage(
  category: ErrorCategory,
  customMessage?: string
): string {
  if (customMessage) return customMessage;

  const messages: Record<ErrorCategory, string> = {
    CONVEX_ERROR: 'Unable to fetch data. Please try again.',
    AUTH_ERROR: 'Authentication failed. Please log in again.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    PERMISSION_ERROR: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    NETWORK_ERROR: 'Network connection error. Please check your connection.',
    UNKNOWN_ERROR: 'Something went wrong. Please try again.'
  };

  return messages[category];
}

/**
 * Determine if error is recoverable (should show retry button)
 */
export function isRecoverableError(category: ErrorCategory): boolean {
  return ['NETWORK_ERROR', 'CONVEX_ERROR', 'UNKNOWN_ERROR'].includes(category);
}

/**
 * Determine if error requires redirecting away
 */
export function shouldRedirectOnError(category: ErrorCategory): boolean {
  return ['AUTH_ERROR', 'PERMISSION_ERROR'].includes(category);
}

/**
 * Format error for display in UI
 */
export interface FormattedError {
  title: string;
  message: string;
  isRecoverable: boolean;
  shouldRedirect: boolean;
  errorId: string;
  category: ErrorCategory;
}

export function formatErrorForDisplay(
  error: unknown,
  context: ErrorContext
): FormattedError {
  const report = logError(error, context);

  const titleMap: Record<ErrorCategory, string> = {
    CONVEX_ERROR: 'Data Error',
    AUTH_ERROR: 'Authentication Error',
    VALIDATION_ERROR: 'Validation Error',
    PERMISSION_ERROR: 'Access Denied',
    NOT_FOUND: 'Not Found',
    NETWORK_ERROR: 'Connection Error',
    UNKNOWN_ERROR: 'Error'
  };

  return {
    title: titleMap[report.category],
    message: getUserFriendlyMessage(report.category),
    isRecoverable: isRecoverableError(report.category),
    shouldRedirect: shouldRedirectOnError(report.category),
    errorId: report.id,
    category: report.category
  };
}
