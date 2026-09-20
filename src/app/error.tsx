'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorDisplay } from '@/components/errors/ErrorDisplay';
import { formatErrorForDisplay } from '@/lib/error-tracking';
import { PATH } from '@/constants/PATH';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root error boundary (src/app/error.tsx)
 *
 * Catches errors at the application root level.
 * Displays full-page error UI with error tracking.
 */
export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Format and log error with tracking context
    const formattedError = formatErrorForDisplay(error, {
      category: 'UNKNOWN_ERROR',
      feature: 'root',
      metadata: {
        digest: error.digest
      }
    });
  }, [error]);

  const formattedError = formatErrorForDisplay(error, {
    category: 'UNKNOWN_ERROR',
    feature: 'root',
    metadata: {
      digest: error.digest
    }
  });

  return (
    <ErrorDisplay
      error={formattedError}
      onRetry={reset}
      fullPage
      rawError={error}
      showErrorId
    />
  );
}
