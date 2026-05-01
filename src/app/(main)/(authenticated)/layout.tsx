'use client';

import { PATH } from '@/constants/PATH';
import { Spinner } from '@/components/Spinner';
import { useAuthRedirect } from '@/features/auth/hooks/useAuthRedirect';
import MobileNavigation from '@/components/MobileNavigation';
import { AccountStatusGuard } from '@/components/auth/AccountStatusGuard';
import { BusinessProfileGuard } from '@/features/auth/components/BusinessProfileGuard';

export default function AuthenticatedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useAuthRedirect(PATH.SIGNIN);

  if (!isLoaded) {
    return (
      <div className='flex h-screen w-full flex-col items-center justify-center space-y-2'>
        <Spinner size='xl2' />
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Redirects handled in hooks
  }

  return (
    <AccountStatusGuard>
      <BusinessProfileGuard>
        {children}
        <MobileNavigation />
      </BusinessProfileGuard>
    </AccountStatusGuard>
  );
}
