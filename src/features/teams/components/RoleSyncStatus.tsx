/**
 * Role Sync Status Banner
 * Shows when there's a pending Clerk metadata sync that needs recovery
 * Automatically attempts recovery and shows status to user
 */

'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  retryPendingRoleSync,
  clearPendingRoleSync
} from '@/hooks/usePendingRoleSync';

interface PendingRoleSync {
  userId: string;
  role: string;
  companyOwnerId: string;
  ownerUsername: string;
  companyName: string;
  timestamp: number;
}

export function RoleSyncStatus() {
  const { user, isLoaded } = useUser();
  const [pending, setPending] = useState<PendingRoleSync | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      const pendingJson = localStorage.getItem('pendingRoleSync');
      if (pendingJson) {
        const data: PendingRoleSync = JSON.parse(pendingJson);

        // Only show if it's for current user
        if (data.userId === user?.id) {
          // Check if already synced
          const metadata = user?.publicMetadata;
          if (
            metadata?.companyOwnerId === data.companyOwnerId &&
            metadata?.role === data.role
          ) {
            // Already synced, clear it
            localStorage.removeItem('pendingRoleSync');
          } else {
            setPending(data);
          }
        } else {
          // Different user, clear it
          localStorage.removeItem('pendingRoleSync');
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }, [isLoaded, user]);

  const handleRetry = async () => {
    if (!pending) return;

    setIsRetrying(true);
    setStatus('idle');
    setError(null);

    try {
      const result = await retryPendingRoleSync(
        pending.userId,
        pending.role,
        pending.companyOwnerId,
        pending.ownerUsername,
        pending.companyName
      );

      if (result.success) {
        setStatus('success');
        setPending(null);
        // Reload to get updated metadata
        await user?.reload();
      } else {
        setStatus('error');
        setError(result.error || 'Sync failed');
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDismiss = () => {
    clearPendingRoleSync();
    setPending(null);
  };

  if (!pending || status === 'success') return null;

  return (
    <Card className='mb-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50'>
      <CardHeader className='pb-2'>
        <div className='flex items-start gap-3'>
          <AlertCircle className='mt-1 h-5 w-5 flex-shrink-0 text-amber-600' />
          <div className='flex-1'>
            <CardTitle className='text-base text-amber-900 dark:text-amber-100'>
              Role Sync Pending
            </CardTitle>
            <CardDescription className='text-amber-700 dark:text-amber-300'>
              Your team role hasn&apos;t been fully synchronized. You may
              experience permission issues.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex flex-wrap items-center gap-3'>
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            variant='secondary'
            size='sm'
            className='bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 dark:hover:bg-amber-800'
          >
            {isRetrying ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className='mr-2 h-4 w-4' />
                Retry Sync
              </>
            )}
          </Button>
          <Button
            onClick={handleDismiss}
            variant='ghost'
            size='sm'
            disabled={isRetrying}
          >
            Dismiss
          </Button>
        </div>

        {status === 'error' && error && (
          <div className='mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400'>
            <AlertCircle className='h-4 w-4' />
            {error}
          </div>
        )}

        <p className='mt-3 text-xs text-amber-600 dark:text-amber-400'>
          Role: {pending.role} • Team:{' '}
          {pending.companyName || pending.ownerUsername}
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Simple success indicator for successful sync
 */
export function RoleSyncSuccess() {
  return (
    <div className='flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400'>
      <CheckCircle className='h-4 w-4' />
      <span>Role synchronized</span>
    </div>
  );
}
