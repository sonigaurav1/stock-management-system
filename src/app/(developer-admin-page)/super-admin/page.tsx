/**
 * Super Admin Redirect
 * Deprecated: Use /platform instead
 * This page redirects to the new /platform admin page
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperAdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new /platform route
    router.replace('/platform');
  }, [router]);

  return (
    <div className='flex h-screen items-center justify-center'>
      <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary'></div>
    </div>
  );
}
