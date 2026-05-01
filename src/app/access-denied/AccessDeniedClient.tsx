'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function AccessDeniedClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
    }
  }, [user, router]);

  const reason =
    searchParams.get('reason') ||
    'Your account does not have access to this resource';

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4'>
      <div className='w-full max-w-md rounded-lg bg-white p-8 shadow-lg'>
        {/* Icon */}
        <div className='mb-6 flex justify-center'>
          <div className='rounded-full bg-red-100 p-3'>
            <AlertTriangle className='h-8 w-8 text-red-600' />
          </div>
        </div>

        {/* Title */}
        <h1 className='mb-3 text-center text-2xl font-bold text-gray-900'>
          Access Denied
        </h1>

        {/* Reason */}
        <p className='mb-8 text-center text-gray-600'>{reason}</p>

        {/* Info Box */}
        <div className='mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
          <h3 className='mb-2 flex items-center font-semibold text-yellow-900'>
            <span className='mr-2 text-lg'>ℹ️</span> What happened?
          </h3>
          <p className='text-sm text-yellow-800'>
            Your account has been restricted from accessing this resource. This
            may be due to account verification, policy violations, or
            administrative action.
          </p>
        </div>

        {/* Actions */}
        <div className='space-y-3'>
          <Button
            onClick={() => router.push('/')}
            variant='outline'
            size='lg'
            className='w-full'
          >
            Go to Home
          </Button>
          <Button
            onClick={() =>
              (window.location.href = 'mailto:support@example.com')
            }
            size='lg'
            className='w-full'
          >
            Contact Support
          </Button>
          <Button
            onClick={() => signOut()}
            variant='destructive'
            size='lg'
            className='w-full'
          >
            Sign Out
          </Button>
        </div>

        {/* Support Info */}
        <div className='mt-8 border-t pt-6 text-center text-sm text-gray-500'>
          <p>
            Email:{' '}
            <a
              href='mailto:support@example.com'
              className='text-blue-600 hover:underline'
            >
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
