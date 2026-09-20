'use client';

import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FormattedError } from '@/lib/error-tracking';

interface ErrorDisplayProps {
  error: FormattedError;
  onRetry?: () => void;
  showErrorId?: boolean;
  isDev?: boolean;
  fullPage?: boolean;
  rawError?: Error;
}

export function ErrorDisplay({
  error,
  onRetry,
  showErrorId = true,
  isDev = process.env.NODE_ENV === 'development',
  fullPage = false,
  rawError
}: ErrorDisplayProps) {
  const router = useRouter();

  if (fullPage) {
    return (
      <div className='flex min-h-screen items-center justify-center px-4'>
        <div className='w-full max-w-md'>
          <div className='flex flex-col items-center text-center'>
            <div className='mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900'>
              <AlertCircle className='h-8 w-8 text-red-600 dark:text-red-400' />
            </div>

            <h1 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white'>
              {error.title}
            </h1>

            <p className='mb-4 text-gray-600 dark:text-gray-400'>
              {error.message}
            </p>

            {showErrorId && (
              <p className='mb-6 break-all text-xs text-gray-500 dark:text-gray-500'>
                Error ID: <code className='font-mono'>{error.errorId}</code>
              </p>
            )}

            {isDev && rawError && (
              <div className='mb-6 w-full rounded-lg bg-gray-100 p-4 text-left dark:bg-gray-800'>
                <p className='mb-2 text-xs font-semibold text-gray-900 dark:text-white'>
                  Debug Info (Dev Only):
                </p>
                <pre className='max-h-48 overflow-auto text-xs text-gray-700 dark:text-gray-300'>
                  {rawError.message}
                  {rawError.stack && `\n\n${rawError.stack}`}
                </pre>
              </div>
            )}

            <div className='flex w-full flex-col gap-3 sm:flex-row'>
              {error.isRecoverable && onRetry && (
                <Button onClick={onRetry} className='flex-1' size='lg'>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Try Again
                </Button>
              )}

              <Button
                onClick={() => router.push('/')}
                variant='outline'
                className='flex-1'
                size='lg'
              >
                <Home className='mr-2 h-4 w-4' />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Alert variant for inline errors
  return (
    <Alert variant='destructive' className='mb-4'>
      <AlertCircle className='h-4 w-4' />
      <AlertTitle>{error.title}</AlertTitle>
      <AlertDescription className='mt-2'>
        <p className='mb-3'>{error.message}</p>

        {showErrorId && (
          <p className='mb-3 break-all text-xs'>
            Error ID: <code className='font-mono'>{error.errorId}</code>
          </p>
        )}

        {isDev && rawError && (
          <details className='mb-3 text-xs'>
            <summary className='mb-2 cursor-pointer font-semibold'>
              Debug Info (Dev Only)
            </summary>
            <pre className='overflow-auto rounded bg-slate-100 p-2 text-xs dark:bg-slate-900'>
              {rawError.message}
              {rawError.stack && `\n\n${rawError.stack}`}
            </pre>
          </details>
        )}

        {(error.isRecoverable || onRetry) && (
          <Button
            onClick={onRetry}
            variant='outline'
            size='sm'
            className='mt-3'
          >
            <RefreshCw className='mr-2 h-3 w-3' />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
