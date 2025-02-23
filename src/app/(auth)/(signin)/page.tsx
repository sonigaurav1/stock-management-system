'use client';

import { useUser } from '@clerk/clerk-react';
import { redirect } from 'next/navigation';
import SignInViewPage from '@/features/auth/components/SignInView';
import { PATH } from '@/constants/PATH';

export default function Page() {
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    redirect(PATH.OVERVIEW);
  }

  return <SignInViewPage />;
}
