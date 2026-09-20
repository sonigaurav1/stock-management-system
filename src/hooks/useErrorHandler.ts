/**
 * Hook for handling Convex query/mutation errors
 *
 * Provides consistent error handling pattern for async operations.
 * Formats errors and provides user-friendly messages.
 */

import { useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  formatErrorForDisplay,
  categorizeError,
  FormattedError,
  ErrorCategory
} from '@/lib/error-tracking';

export interface UseErrorHandlerOptions {
  feature: string;
  action: string;
  category?: ErrorCategory;
  onError?: (error: FormattedError) => void;
  logToConsole?: boolean;
}

/**
 * Hook to handle and format errors from Convex queries/mutations
 *
 * Usage:
 * const { handleError, formatError } = useErrorHandler({
 *   feature: 'products',
 *   action: 'create_product',
 * });
 *
 * try {
 *   await createProduct(data);
 * } catch (error) {
 *   const formatted = handleError(error);
 *   toast.error(formatted.message);
 * }
 */
export function useErrorHandler(options: UseErrorHandlerOptions) {
  const { userId, orgId } = useAuth();
  const { feature, action, category, onError, logToConsole = true } = options;

  const handleError = useCallback(
    (error: unknown): FormattedError => {
      const formattedError = formatErrorForDisplay(error, {
        category: category || categorizeError(error),
        userId: userId || undefined,
        organizationId: orgId || undefined,
        feature,
        action
      });

      if (logToConsole) {
        console.error(`[${feature}:${action}]`, formattedError);
      }

      onError?.(formattedError);

      return formattedError;
    },
    [feature, action, category, userId, orgId, onError, logToConsole]
  );

  const formatError = useCallback(
    (error: unknown): FormattedError => {
      return formatErrorForDisplay(error, {
        category: category || categorizeError(error),
        userId: userId || undefined,
        organizationId: orgId || undefined,
        feature,
        action
      });
    },
    [feature, action, category, userId, orgId]
  );

  return {
    handleError,
    formatError
  };
}
