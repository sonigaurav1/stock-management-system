'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RootErrorBoundaryProps {
  children: React.ReactNode;
}

interface RootErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Root Error Boundary
 * Catches top-level errors (e.g., ConvexProvider failures)
 * Shows user-friendly error UI instead of crash
 */
export class RootErrorBoundary extends React.Component<
  RootErrorBoundaryProps,
  RootErrorBoundaryState
> {
  constructor(props: RootErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Root Error Boundary caught:', error);
    console.error('Error info:', errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex h-screen w-full flex-col items-center justify-center bg-background px-4'>
          <div className='max-w-md space-y-6 text-center'>
            <div className='flex justify-center'>
              <div className='rounded-full bg-red-100 p-3 dark:bg-red-900/20'>
                <AlertTriangle className='h-8 w-8 text-red-600 dark:text-red-400' />
              </div>
            </div>

            <div className='space-y-2'>
              <h1 className='text-2xl font-bold text-foreground'>
                Something went wrong
              </h1>
              <p className='text-sm text-muted-foreground'>
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
            </div>

            <div className='space-y-3'>
              <Button onClick={this.handleReset} className='w-full' size='lg'>
                <RotateCcw className='mr-2 h-4 w-4' />
                Reload Page
              </Button>
              <button
                onClick={() => (window.location.href = '/')}
                className='text-sm text-muted-foreground underline hover:text-foreground'
              >
                Go to Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className='mt-6 rounded-md bg-muted p-3 text-left'>
                <p className='break-words font-mono text-xs text-muted-foreground'>
                  {this.state.error?.stack}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
