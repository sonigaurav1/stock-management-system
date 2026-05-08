'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, Building2 } from 'lucide-react';
import { toast } from 'sonner';

// Retry configuration for Clerk metadata sync
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 5000; // 5 seconds

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay with jitter
 */
const getRetryDelay = (attempt: number): number => {
  const exponentialDelay = Math.min(
    INITIAL_RETRY_DELAY * Math.pow(2, attempt),
    MAX_RETRY_DELAY
  );
  // Add random jitter (±20%) to prevent thundering herd
  const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5);
  return exponentialDelay + jitter;
};

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const token = searchParams.get('token');

  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Query for invitation details by token
  const getInvitationByToken = useQuery(
    api.companyAccess.getInvitationByToken,
    token ? { token } : 'skip'
  );

  // Log query state for debugging
  useEffect(() => {
    console.log('[accept-invite] Token:', token);
    console.log('[accept-invite] Query result:', getInvitationByToken);
  }, [token, getInvitationByToken]);

  const acceptInvitationMutation = useMutation(
    api.companyAccess.acceptInvitationByToken
  );

  // Handle redirect to sign-up when not authenticated
  const handleGoToSignUp = () => {
    if (token) {
      router.push(`/sign-up?inviteToken=${token}`);
    }
  };

  // Debug: Log auth state changes
  useEffect(() => {
    console.log('[accept-invite] Auth state:', {
      isSignedIn,
      isLoaded,
      userEmail: user?.primaryEmailAddress?.emailAddress
    });
    console.log('[accept-invite] Invitation state:', getInvitationByToken);
  }, [isSignedIn, isLoaded, user, getInvitationByToken]);

  // Auto-accept if user is signed in and viewing valid invitation
  useEffect(() => {
    const autoAccept = async () => {
      // Wait for auth to be ready
      if (!isLoaded) return;

      // Check basic conditions
      if (!isSignedIn || !user || !token || success) return;

      // Wait for query to be ready (not loading)
      if (getInvitationByToken === undefined) {
        console.log('[accept-invite] Waiting for invitation query...');
        return;
      }

      // Check if invitation is valid
      if (!getInvitationByToken) {
        console.log('[accept-invite] No valid invitation found');
        return;
      }

      console.log('[accept-invite] Auto-accepting...', {
        userEmail: user.primaryEmailAddress?.emailAddress,
        invitationEmail: getInvitationByToken.email
      });

      try {
        setIsAccepting(true);
        const result = await acceptInvitationMutation({ token });
        console.log('[accept-invite] Mutation result:', result);
        setSuccess(true);
        toast.success('Invitation accepted! Redirecting...');

        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard/overview');
        }, 1500);
      } catch (err: any) {
        console.error('[accept-invite] Error:', err);
        setError(err?.message || 'Failed to accept invitation');
        setIsAccepting(false);
      }
    };

    // Only run after both auth and query are ready
    if (isLoaded && getInvitationByToken !== undefined) {
      autoAccept();
    }
  }, [
    isSignedIn,
    user,
    token,
    success,
    isLoaded,
    getInvitationByToken,
    acceptInvitationMutation,
    router
  ]);

  if (!token) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-red-500' />
              Invalid Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              No invitation token provided. Please check the link and try again.
            </p>
            <Button onClick={() => router.push('/')} className='w-full'>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (getInvitationByToken === undefined) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (!getInvitationByToken) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-red-500' />
              Invitation Expired or Invalid
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              This invitation has expired or is no longer valid. Please ask your
              administrator to send you a new invitation.
            </p>
            <Button onClick={() => router.push('/')} className='w-full'>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-emerald-600'>
              <CheckCircle className='h-5 w-5' />
              Welcome!
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              Your invitation has been accepted. You're now part of the team!
            </p>
            <p className='text-sm font-medium'>Redirecting to dashboard...</p>
            <Loader2 className='h-4 w-4 animate-spin' />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-red-500' />
              Error Accepting Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/')} className='w-full'>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>You've been invited to join a team</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='rounded-lg bg-slate-50 p-4 dark:bg-slate-900'>
            <div className='flex items-start gap-3'>
              <Building2 className='mt-1 h-5 w-5 flex-shrink-0 text-primary' />
              <div>
                <p className='text-sm font-medium'>Team Invitation</p>
                <p className='mt-1 text-sm text-muted-foreground'>
                  You're invited to join as a{' '}
                  <strong>{getInvitationByToken.role}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className='space-y-3'>
            <p className='text-sm text-muted-foreground'>
              Invited by: <strong>{getInvitationByToken.invitedBy}</strong>
            </p>
            <p className='text-sm text-muted-foreground'>
              Email: <strong>{getInvitationByToken.email}</strong>
            </p>
          </div>

          {!isLoaded ? (
            <Button disabled className='w-full' size='lg'>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Loading...
            </Button>
          ) : isSignedIn ? (
            <Button
              onClick={async () => {
                try {
                  setIsAccepting(true);
                  const result = await acceptInvitationMutation({
                    token: token!
                  });

                  // Set staff metadata in Clerk after successful invitation acceptance
                  // This is CRITICAL - without this, staff won't have proper permissions
                  if (result?.ownerId && user?.id) {
                    let metadataSynced = false;
                    let lastError: Error | null = null;

                    // Retry loop with exponential backoff
                    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                      try {
                        console.log(
                          `[accept-invite] Metadata sync attempt ${attempt + 1}/${MAX_RETRIES}`
                        );

                        // Call the roles API to set staff metadata
                        const response = await fetch('/api/roles', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            userId: user.id,
                            role: getInvitationByToken?.role || 'staff',
                            companyOwnerId: result.ownerId,
                            ownerUsername:
                              getInvitationByToken?.invitedBy || 'owner',
                            companyName: getInvitationByToken?.companyName || ''
                          })
                        });

                        if (!response.ok) {
                          const errorData = await response
                            .json()
                            .catch(() => ({}));
                          throw new Error(
                            errorData.error || `HTTP ${response.status}`
                          );
                        }

                        // Verify the metadata was actually set by fetching it back
                        const verifyResponse = await fetch(
                          `/api/roles?userId=${user.id}`,
                          {
                            method: 'GET',
                            headers: { 'Content-Type': 'application/json' }
                          }
                        );

                        if (verifyResponse.ok) {
                          const verifyData = await verifyResponse.json();
                          const metadata = verifyData.publicMetadata;

                          if (
                            metadata?.companyOwnerId === result.ownerId &&
                            metadata?.role
                          ) {
                            console.log(
                              '[accept-invite] Metadata verified successfully:',
                              metadata
                            );
                            metadataSynced = true;
                            break; // Success! Exit retry loop
                          } else {
                            console.warn(
                              '[accept-invite] Metadata verification failed, retrying...',
                              metadata
                            );
                            throw new Error('Metadata verification failed');
                          }
                        } else {
                          throw new Error('Failed to verify metadata');
                        }
                      } catch (metaError) {
                        lastError =
                          metaError instanceof Error
                            ? metaError
                            : new Error(String(metaError));
                        console.error(
                          `[accept-invite] Metadata sync attempt ${attempt + 1} failed:`,
                          lastError.message
                        );

                        // Don't retry on the last attempt
                        if (attempt < MAX_RETRIES - 1) {
                          const delay = getRetryDelay(attempt);
                          console.log(
                            `[accept-invite] Retrying in ${Math.round(delay)}ms...`
                          );
                          await sleep(delay);
                        }
                      }
                    }

                    // Handle final result
                    if (!metadataSynced) {
                      console.error(
                        '[accept-invite] All metadata sync attempts failed'
                      );

                      // Show warning toast but don't block the flow
                      toast.warning(
                        'Invitation accepted, but role sync had issues. Please refresh if you encounter permission errors.',
                        { duration: 6000 }
                      );

                      // Store in localStorage for recovery on next session
                      try {
                        localStorage.setItem(
                          'pendingRoleSync',
                          JSON.stringify({
                            userId: user.id,
                            role: getInvitationByToken?.role || 'staff',
                            companyOwnerId: result.ownerId,
                            ownerUsername:
                              getInvitationByToken?.invitedBy || 'owner',
                            companyName:
                              getInvitationByToken?.companyName || '',
                            timestamp: Date.now()
                          })
                        );
                      } catch (e) {
                        // Ignore localStorage errors
                      }
                    } else {
                      // Clean up any pending sync data
                      try {
                        localStorage.removeItem('pendingRoleSync');
                      } catch (e) {
                        // Ignore
                      }
                    }
                  }

                  setSuccess(true);
                  toast.success('Invitation accepted!');
                  setTimeout(() => {
                    router.push('/dashboard/overview');
                  }, 1000);
                } catch (err: any) {
                  setError(err?.message || 'Failed to accept invitation');
                  setIsAccepting(false);
                }
              }}
              disabled={isAccepting}
              className='w-full'
              size='lg'
            >
              {isAccepting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Accept Invitation
            </Button>
          ) : (
            <Button onClick={handleGoToSignUp} className='w-full' size='lg'>
              Sign Up to Accept
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
