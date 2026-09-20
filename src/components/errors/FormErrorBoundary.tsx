'use client';

import React, { ReactNode, ReactElement } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatErrorForDisplay } from '@/lib/error-tracking';

interface FormErrorBoundaryProps {
  children: ReactNode;
  featureName: string;
  actionName?: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary for Forms
 *
 * Catches errors within form components.
 * Shows validation errors and submission failures.
 *
 * Usage:
 * <FormErrorBoundary featureName="products" actionName="create_product">
 *   <ProductForm />
 * </FormErrorBoundary>
 */
export class FormErrorBoundary extends React.Component<
  FormErrorBoundaryProps,
  State
> {
  constructor(props: FormErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    formatErrorForDisplay(error, {
      category: 'VALIDATION_ERROR',
      feature: this.props.featureName,
      action: this.props.actionName || 'form_operation',
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
        category: 'VALIDATION_ERROR',
        feature: this.props.featureName,
        action: this.props.actionName || 'form_operation'
      });

      return (
        <Alert variant='destructive' className='mb-4'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>{formattedError.title}</AlertTitle>
          <AlertDescription className='mt-2'>
            <p className='mb-3'>
              An error occurred while processing your form. Please check your
              inputs and try again.
            </p>
            <p className='mb-3 text-xs text-gray-600 dark:text-gray-400'>
              {formattedError.message}
            </p>
            <p className='mb-3 break-all text-xs text-gray-600 dark:text-gray-400'>
              Error ID:{' '}
              <code className='font-mono'>{formattedError.errorId}</code>
            </p>
            {formattedError.isRecoverable && (
              <Button onClick={this.handleRetry} variant='outline' size='sm'>
                Try Again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children as ReactElement;
  }
}
