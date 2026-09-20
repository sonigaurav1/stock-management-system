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
 * Billing error boundary
 *
 * Catches errors in billing/payments features.
 * Critical for payment processing - logs all failures.
 */
export default function BillingError({ error, reset }: ErrorProps) {
  const { userId, orgId } = useAuth();

  useEffect(() => {
    // Billing errors are critical
    const formattedError = formatErrorForDisplay(error, {
      category: 'CONVEX_ERROR',
      userId: userId || undefined,
      organizationId: orgId || undefined,
      feature: 'billing',
      action: 'load_billing',
      metadata: {
        digest: error.digest,
        priority: 'CRITICAL'
      }
    });
  }, [error, userId, orgId]);

  const formattedError = formatErrorForDisplay(error, {
    category: 'CONVEX_ERROR',
    userId: userId || undefined,
    organizationId: orgId || undefined,
    feature: 'billing',
    action: 'load_billing',
    metadata: {
      digest: error.digest,
      priority: 'CRITICAL'
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
