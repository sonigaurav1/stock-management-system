'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ErrorDisplay } from '@/components/errors/ErrorDisplay';
import { formatErrorForDisplay } from '@/lib/error-tracking';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Expenses error boundary
 *
 * Catches errors in expense tracking features.
 */
export default function ExpensesError({ error, reset }: ErrorProps) {
  const { userId, orgId } = useAuth();

  useEffect(() => {
    formatErrorForDisplay(error, {
      category: 'CONVEX_ERROR',
      userId: userId || undefined,
      organizationId: orgId || undefined,
      feature: 'expenses',
      action: 'load_expenses',
      metadata: {
        digest: error.digest
      }
    });
  }, [error, userId, orgId]);

  const formattedError = formatErrorForDisplay(error, {
    category: 'CONVEX_ERROR',
    userId: userId || undefined,
    organizationId: orgId || undefined,
    feature: 'expenses',
    action: 'load_expenses',
    metadata: {
      digest: error.digest
    }
  });

  return (
    <div className='space-y-4'>
      <ErrorDisplay
        error={formattedError}
        onRetry={reset}
        fullPage={false}
        rawError={error}
        showErrorId
      />
    </div>
  );
}
