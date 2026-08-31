'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboardingState } from '@/features/auth/providers/OnboardingStateProvider';

interface SetupStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
  description: string;
}

export default function OnboardingSetupPage() {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const {
    hasCompletedSetup,
    isVerifying,
    markSetupComplete,
    startVerification,
    endVerification
  } = useOnboardingState();

  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'verify_session',
      label: 'Verifying Your Session',
      status: 'loading',
      description: 'Setting up your account...'
    },
    {
      id: 'create_profile',
      label: 'Creating Your Profile',
      status: 'pending',
      description: 'Creating your user profile...'
    },
    {
      id: 'setup_access',
      label: 'Setting Up Access',
      status: 'pending',
      description: 'Configuring your dashboard access...'
    },
    {
      id: 'initialize_workspace',
      label: 'Initializing Workspace',
      status: 'pending',
      description: 'Preparing your workspace...'
    }
  ]);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const POLL_INTERVAL = 1000; // 1 second

  // Query account status
  const accountStatus = useQuery(
    api.accountStatus.getAccountStatus,
    user?.id ? { userId: user.id } : 'skip'
  );

  // Check if user profile exists
  const userProfile = useQuery(
    api.users.getCurrentUserProfile,
    user?.id ? undefined : 'skip'
  );

  // Check if company exists
  const company = useQuery(
    api.companies.getCompany,
    user?.id ? { userId: user.id } : 'skip'
  );

  // Verify onboarding is complete (uses new query)
  const verificationStatus = useQuery(
    api.accountStatus.verifyOnboardingComplete,
    user?.id && hasCompletedSetup ? { userId: user.id } : 'skip'
  );

  // Main initialization logic
  useEffect(() => {
    if (!userLoaded || !user?.id) return;

    // If already completed setup and verification passed, go to dashboard
    if (hasCompletedSetup && verificationStatus?.isComplete) {
      setIsRedirecting(true);
      setTimeout(() => {
        router.push('/dashboard/overview');
      }, 600); // Allow time for success animation
      return;
    }

    // If setup is complete but verification is still pending, wait
    if (hasCompletedSetup && !verificationStatus?.isComplete) {
      // The verification query will update and trigger the redirect
      return;
    }

    const initializeUser = async () => {
      try {
        // Update step status
        setSteps((prev) =>
          prev.map((step) =>
            step.id === 'verify_session'
              ? { ...step, status: 'complete' }
              : step.id === 'create_profile'
                ? { ...step, status: 'loading' }
                : step
          )
        );

        // Check if basic records exist
        if (!userProfile && !accountStatus) {
          if (retryCount < MAX_RETRIES) {
            // Wait and retry
            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
            setRetryCount((prev) => prev + 1);
            return;
          }
          throw new Error(
            'Account initialization timeout. Please try refreshing the page.'
          );
        }

        // Update profile step
        setSteps((prev) =>
          prev.map((step) =>
            step.id === 'create_profile'
              ? { ...step, status: 'complete' }
              : step.id === 'setup_access'
                ? { ...step, status: 'loading' }
                : step
          )
        );

        // Verify account status is properly set
        if (!accountStatus) {
          throw new Error('Account initialization incomplete');
        }

        // Update access step
        setSteps((prev) =>
          prev.map((step) =>
            step.id === 'setup_access'
              ? { ...step, status: 'complete' }
              : step.id === 'initialize_workspace'
                ? { ...step, status: 'loading' }
                : step
          )
        );

        // Verify company setup from consolidated companies table
        if (!company) {
          throw new Error('Workspace initialization incomplete');
        }

        // Complete all steps
        setSteps((prev) =>
          prev.map((step) =>
            step.status !== 'complete' ? { ...step, status: 'complete' } : step
          )
        );

        // Mark setup as complete - this triggers verification retry logic in guards
        markSetupComplete();

        // Brief pause for visual effect before transition
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Start verification animation
        startVerification();

        // Wait for verification to complete (will be checked in effect above)
        // The verificationStatus query will update and trigger redirect
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Setup failed. Please contact support.';
        setError(errorMessage);

        // Mark errored step
        setSteps((prev) =>
          prev.map((step) =>
            step.status === 'loading' ? { ...step, status: 'error' } : step
          )
        );

        endVerification();
      }
    };

    initializeUser();
  }, [
    userLoaded,
    user?.id,
    userProfile,
    accountStatus,
    company,
    router,
    retryCount,
    hasCompletedSetup,
    verificationStatus,
    markSetupComplete,
    startVerification,
    endVerification
  ]);

  // Loading state
  if (!userLoaded) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900'>
        <div className='text-center'>
          <Loader2 className='mx-auto h-12 w-12 animate-spin text-primary' />
          <p className='mt-4 text-muted-foreground'>
            Initializing your account...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900'>
        <div className='max-w-md rounded-lg border border-border bg-background p-8 shadow-lg'>
          <AlertCircle className='mx-auto h-12 w-12 text-destructive' />
          <h2 className='mt-4 text-center text-xl font-bold text-foreground'>
            Authentication Required
          </h2>
          <p className='mt-2 text-center text-sm text-muted-foreground'>
            Please sign in to continue.
          </p>
          <Button
            onClick={() => router.push('/sign-in')}
            className='mt-6 w-full'
            size='lg'
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 dark:from-slate-950 dark:to-slate-900'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='mb-12 text-center'>
          <div className='mb-4 flex justify-center'>
            <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10'>
              <div className='h-8 w-8 rounded-lg bg-primary' />
            </div>
          </div>
          <h1 className='text-3xl font-bold text-foreground'>Digital Dukan</h1>
          <p className='mt-2 text-muted-foreground'>
            Setting up your account...
          </p>
        </div>

        {/* Setup Steps */}
        <div className='space-y-4 rounded-lg border border-border bg-background p-6 shadow-sm'>
          {steps.map((step) => (
            <div key={step.id} className='flex items-start gap-4'>
              <div className='mt-1 flex-shrink-0'>
                {step.status === 'complete' && (
                  <div className='flex h-6 w-6 items-center justify-center rounded-full bg-green-100 animate-in zoom-in dark:bg-green-900/30'>
                    <CheckCircle2 className='h-5 w-5 text-green-600 dark:text-green-400' />
                  </div>
                )}
                {step.status === 'loading' && (
                  <div className='flex h-6 w-6 items-center justify-center'>
                    <Loader2 className='h-5 w-5 animate-spin text-primary' />
                  </div>
                )}
                {step.status === 'pending' && (
                  <div className='h-6 w-6 rounded-full border-2 border-muted bg-muted/50' />
                )}
                {step.status === 'error' && (
                  <div className='flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
                    <AlertCircle className='h-5 w-5 text-red-600 dark:text-red-400' />
                  </div>
                )}
              </div>

              <div className='flex-1'>
                <p
                  className={`font-medium transition-colors ${
                    step.status === 'complete'
                      ? 'text-green-600 dark:text-green-400'
                      : step.status === 'error'
                        ? 'text-red-600 dark:text-red-400'
                        : step.status === 'loading'
                          ? 'text-primary'
                          : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className='mt-6 rounded-lg border border-red-200 bg-red-50 p-4 animate-in fade-in dark:border-red-900 dark:bg-red-900/20'>
            <p className='text-sm font-medium text-red-900 dark:text-red-100'>
              Setup Error
            </p>
            <p className='mt-1 text-sm text-red-700 dark:text-red-200'>
              {error}
            </p>
            <div className='mt-4 flex gap-2'>
              <Button
                onClick={() => window.location.reload()}
                variant='outline'
                size='sm'
                className='flex-1'
              >
                Retry
              </Button>
              <Button
                onClick={() => router.push('/sign-in')}
                size='sm'
                className='flex-1'
              >
                Sign In Again
              </Button>
            </div>
          </div>
        )}

        {/* Success State with Transition */}
        {isRedirecting && (
          <div className='mt-6 rounded-lg border border-green-200 bg-green-50 p-4 animate-in fade-in slide-in-from-bottom-2 dark:border-green-900 dark:bg-green-900/20'>
            <div className='flex items-center gap-3'>
              <div className='flex h-6 w-6 items-center justify-center'>
                <CheckCircle2 className='h-5 w-5 text-green-600 animate-in zoom-in dark:text-green-400' />
              </div>
              <div className='flex-1'>
                <p className='text-sm font-medium text-green-900 dark:text-green-100'>
                  Setup complete! Redirecting to dashboard...
                </p>
                <div className='mt-2 h-1 w-full overflow-hidden rounded-full bg-green-200 dark:bg-green-900/50'>
                  <div className='h-full w-full animate-pulse bg-gradient-to-r from-green-600 to-green-400' />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        {!error && !isRedirecting && (
          <p className='mt-8 text-center text-xs text-muted-foreground/60'>
            Don't refresh or close this page while setup is in progress
          </p>
        )}
      </div>
    </div>
  );
}
