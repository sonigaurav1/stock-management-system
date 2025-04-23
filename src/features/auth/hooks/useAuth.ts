'use client';

import { useState } from 'react';
import { useClerk, useSignIn, useSignUp } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { signIn, setActive } = useSignIn();
  const { signOut } = useClerk();
  const { signUp } = useSignUp();

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

  const handleSignUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    defaultRole: string = 'User'
  ) => {
    if (!signUp) {
      toast.error('Sign-up is not available.');
      return;
    }
    setLoading(true);

    try {
      const signUpAttempt = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName
      });

      if (signUpAttempt.status === 'complete') {
        // Set default role in metadata
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: signUpAttempt.createdUserId,
            role: defaultRole
          })
        });

        toast.success('Account created successfully!');
        if (setActive) {
          await setActive({ session: signUpAttempt.createdSessionId });
        } else {
          toast.error('Unable to set active session.');
        }
        router.push('/dashboard/overview');
      }
    } catch (error: any) {
      toast.error(error?.message || 'An error occurred during sign-up');
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
    handleSignUp,
    handleSignOut
  };
};
