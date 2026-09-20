'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ErrorDisplay } from '@/components/errors/ErrorDisplay';
import { formatErrorForDisplay } from '@/lib/error-tracking';
import { PATH } from '@/constants/PATH';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Authenticated layout error boundary
 *
 * Catches errors in authenticated routes.
 * Logs with user context and provides recovery options.
 */
export default function AuthenticatedError({ error, reset }: ErrorProps) {
  const { userId, orgId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Log error with authentication context
    const formattedError = formatErrorForDisplay(error, {
      category: 'UNKNOWN_ERROR',
      userId: userId || undefined,
      organizationId: orgId || undefined,
      feature: 'authenticated_layout',
      metadata: {
        digest: error.digest
      }
    });
  }, [error, userId, orgId]);

  const formattedError = formatErrorForDisplay(error, {
    category: 'UNKNOWN_ERROR',
    userId: userId || undefined,
    organizationId: orgId || undefined,
    feature: 'authenticated_layout',
    metadata: {
      digest: error.digest
    }
  });

  return (
    <div className='flex min-h-screen items-center justify-center px-4'>
      <ErrorDisplay
        error={formattedError}
        onRetry={reset}
        fullPage
        rawError={error}
        showErrorId
      />
    </div>
  );
}
