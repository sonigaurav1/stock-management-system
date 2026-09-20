'use client';

import React, { ReactNode, ReactElement } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatErrorForDisplay } from '@/lib/error-tracking';

interface DataTableErrorBoundaryProps {
  children: ReactNode;
  featureName: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary for Data Tables
 *
 * Catches errors within data table components.
 * Shows inline error alert with retry option.
 *
 * Usage:
 * <DataTableErrorBoundary featureName="products" onRetry={handleRetry}>
 *   <ProductsTable />
 * </DataTableErrorBoundary>
 */
export class DataTableErrorBoundary extends React.Component<
  DataTableErrorBoundaryProps,
  State
> {
  constructor(props: DataTableErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    formatErrorForDisplay(error, {
      category: 'CONVEX_ERROR',
      feature: this.props.featureName,
      action: 'render_data_table',
      metadata: {
        componentStack: errorInfo.componentStack
      }
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render(): ReactElement {
    if (this.state.hasError && this.state.error) {
      const formattedError = formatErrorForDisplay(this.state.error, {
        category: 'CONVEX_ERROR',
        feature: this.props.featureName,
        action: 'render_data_table'
      });

      return (
        <Alert variant='destructive' className='mb-4'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>{formattedError.title}</AlertTitle>
          <AlertDescription className='mt-2'>
            <p className='mb-3'>Failed to load {this.props.featureName} data</p>
            <p className='mb-3 text-xs text-gray-600 dark:text-gray-400'>
              Error ID:{' '}
              <code className='font-mono'>{formattedError.errorId}</code>
            </p>
            <Button onClick={this.handleRetry} variant='outline' size='sm'>
              <RefreshCw className='mr-2 h-3 w-3' />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children as ReactElement;
  }
}
