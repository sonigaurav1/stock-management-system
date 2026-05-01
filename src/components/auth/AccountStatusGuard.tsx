'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEffect, ReactNode, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccountStatusGuardProps {
  children: ReactNode;
}

export function AccountStatusGuard({ children }: AccountStatusGuardProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  const accessCheck = useQuery(
    api.accountStatus.checkUserAccess,
    user ? { userId: user.id } : 'skip'
  );

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Account status check is loading
    if (accessCheck === undefined) {
      return;
    }

    // Only show access denied for actual blocks/suspensions
    // "Account not found" is handled by middleware, not here
    if (!accessCheck.hasAccess && accessCheck.reason !== 'Account not found') {
      setShowAccessDenied(true);
    }
  }, [isLoaded, user, accessCheck]);

  // Still loading authentication
  if (!isLoaded) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Still checking account status
  if (accessCheck === undefined) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  // User blocked or suspended (but not a "not found" error)
  if (showAccessDenied && !accessCheck.hasAccess) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-red-50 p-4 dark:bg-red-950/10'>
        <div className='w-full max-w-md rounded-lg border border-red-200 bg-white p-8 shadow-lg dark:border-red-800 dark:bg-background'>
          <AlertCircle className='mx-auto mb-4 h-12 w-12 text-red-500' />
          <h1 className='mb-2 text-center text-2xl font-bold text-gray-900 dark:text-foreground'>
            Access Denied
          </h1>
          <p className='mb-6 text-center text-gray-600 dark:text-muted-foreground'>
            {accessCheck.reason}
          </p>
          <p className='mb-6 text-center text-sm text-gray-500 dark:text-muted-foreground'>
            If you believe this is a mistake, please contact our support team.
          </p>
          <Button
            onClick={() => signOut({ redirectUrl: '/' })}
            variant='destructive'
            size='lg'
            className='w-full'
          >
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  // User has access - allow through
  return <>{children}</>;
}
