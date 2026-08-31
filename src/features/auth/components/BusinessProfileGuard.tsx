'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

interface BusinessProfileGuardProps {
  children: React.ReactNode;
}

export function BusinessProfileGuard({ children }: BusinessProfileGuardProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const isProfileComplete = useQuery(
    api.companies.isBusinessProfileComplete,
    user ? { userId: user.id } : 'skip'
  );

  useEffect(() => {
    if (!isLoaded || !user) return;

    // If profile is not complete, redirect to company registration
    if (isProfileComplete === false) {
      router.push('/company-registration');
    }
  }, [isLoaded, user, isProfileComplete, router]);

  // Show loading state while checking
  if (!isLoaded || isProfileComplete === undefined) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  // If profile is not complete, show loading while redirecting
  if (isProfileComplete === false) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  // Profile is complete, render children
  return <>{children}</>;
}
