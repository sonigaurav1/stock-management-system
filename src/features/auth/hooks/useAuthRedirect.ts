// hooks/useAuthRedirect.ts
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PATH } from '@/constants/PATH';
import { useUser } from '@clerk/nextjs';

export function useAuthRedirect(
  redirectTo: string,
  requireAuth: boolean = true
) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    // If auth is required and user is not signed in, redirect to sign-in
    if (requireAuth && !isSignedIn) {
      router.push(PATH.SIGNIN);
    }

    // If auth is not required (auth pages) and user is signed in, redirect to dashboard
    if (!requireAuth && isSignedIn) {
      router.push(redirectTo);
    }
  }, [isSignedIn, isLoaded, router, redirectTo, requireAuth]);

  return { isSignedIn, isLoaded };
}
