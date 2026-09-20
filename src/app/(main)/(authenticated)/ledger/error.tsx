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
 * Ledger error boundary
 *
 * Catches errors in financial tracking features.
 * Critical for audit trail - logs with high priority.
 */
export default function LedgerError({ error, reset }: ErrorProps) {
  const { userId, orgId } = useAuth();

  useEffect(() => {
    // Ledger errors are critical - log with priority
    const formattedError = formatErrorForDisplay(error, {
      category: 'CONVEX_ERROR',
      userId: userId || undefined,
      organizationId: orgId || undefined,
      feature: 'ledger',
      action: 'load_ledger',
      metadata: {
        digest: error.digest,
        priority: 'HIGH'
      }
    });
  }, [error, userId, orgId]);

  const formattedError = formatErrorForDisplay(error, {
    category: 'CONVEX_ERROR',
    userId: userId || undefined,
    organizationId: orgId || undefined,
    feature: 'ledger',
    action: 'load_ledger',
    metadata: {
      digest: error.digest,
      priority: 'HIGH'
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
