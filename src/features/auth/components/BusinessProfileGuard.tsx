'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

interface BusinessProfileGuardProps {
  children: React.ReactNode;
}

export function BusinessProfileGuard({ children }: BusinessProfileGuardProps) {
  const { user, isLoaded } = useUser();

  const isProfileComplete = useQuery(
    api.companies.isBusinessProfileComplete,
    user ? { userId: user.id } : 'skip'
  );

  // Show loading state while checking
  if (!isLoaded || isProfileComplete === undefined) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  // If profile is not complete, show loading
  // Middleware will handle the redirect before this component loads
  // This is just a fallback check
  if (!isProfileComplete) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  // Profile is complete, render children
  return <>{children}</>;
}
