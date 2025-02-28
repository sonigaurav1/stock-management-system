'use client';

import { useState } from 'react';
import { useClerk, useSignIn } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { signIn, setActive } = useSignIn();
  const { signOut } = useClerk();

  const handleSignIn = async (
    email: string,
    password: string,
    callbackUrl: string
  ) => {
    if (!signIn) {
      toast.error('Sign-in is not available.');
      return;
    }
    setLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password
      });

      if (signInAttempt.status === 'complete') {
        toast.success('Signed In Successfully!');
        await setActive({ session: signInAttempt.createdSessionId });
        router.push(callbackUrl);
      }
    } catch (error: any) {
      toast.error(
        error?.message === 'Identifier is invalid.'
          ? 'Email not found.'
          : error?.message || 'An error occurred during sign-in.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      toast.success('Signed Out Successfully!');
    } catch (error) {
      toast.error('An error occurred during sign-out.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSignIn,
    handleSignOut
  };
};
