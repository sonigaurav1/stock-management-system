'use client';

import { PATH } from '@/constants/PATH';
import { Spinner } from '@/components/Spinner';
import { useAuthRedirect } from '@/features/auth/hooks/useAuthRedirect';
// import useVerifiedUser from '@/features/auth/hooks/useVerifiedUser';

export default function AuthenticatedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useAuthRedirect(PATH.SIGNIN);
  // const companyDetails = useVerifiedUser(); // Check company details and verification status

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

  return <>{children}</>;
}
