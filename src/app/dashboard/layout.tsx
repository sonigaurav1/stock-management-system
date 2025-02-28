'use client';

import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/PATH';
import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';

export default function DashboardRootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useUser();

  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn && isLoaded) {
      router.push(PATH.SIGNIN);
    }
  }, [isSignedIn, isLoaded, router]);

  return <>{children}</>;
}
