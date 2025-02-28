'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SignInViewPage from '@/features/auth/components/SignInView';
import { PATH } from '@/constants/PATH';
import { useUser } from '@clerk/clerk-react';
import { Spinner } from '@/components/Spinner';

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useUser();
  const isLoading = !isLoaded;

  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push(PATH.OVERVIEW);
    }
  }, [isSignedIn, isLoaded, router]);

  if (!isLoaded || isSignedIn) {
    return null;
  }

  if (isLoading) {
    return (
      <div className='flex h-screen w-full flex-col items-center justify-center space-y-2'>
        <Spinner size='xl2' />
      </div>
    );
  }

  return <SignInViewPage />;
}
