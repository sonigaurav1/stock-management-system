'use client';

import { useState } from 'react';
import { useClerk, useSignIn, useSignUp } from '@clerk/nextjs';
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
  ): Promise<{ success: boolean; error?: string }> => {
    if (!signIn) {
      return { success: false, error: 'Sign-in is not available.' };
    }
    setLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password
      });

      console.log('Sign-in attempt status:', signInAttempt.status);

      if (signInAttempt.status === 'complete') {
        toast.success('Signed In Successfully!');
        await setActive({ session: signInAttempt.createdSessionId });
        router.push(callbackUrl);
        return { success: true };
      } else if (signInAttempt.status === 'needs_first_factor') {
        // MFA or 2FA required
        console.warn(
          'Sign-in needs additional verification:',
          signInAttempt.status
        );
        const error =
          'Sign-in requires additional verification. Please try again.';
        return { success: false, error };
      } else {
        // Handle any other unexpected statuses
        console.warn('Unexpected sign-in status:', signInAttempt.status);
        const error = `Sign-in failed with status: ${signInAttempt.status}. Please try again.`;
        return { success: false, error };
      }
    } catch (error: any) {
      // Log as debug since wrong credentials are expected user behavior
      console.log('Sign-in attempt failed:', error?.message);

      // Extract the core error message from Clerk
      const errorMessage =
        error?.message || 'An error occurred during sign-in.';

      // Extract only the first sentence (before period) or use the full message
      const coreError = errorMessage.split('.')[0] + '.';

      return { success: false, error: coreError };
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username: string,
    defaultRole: string = 'User'
  ): Promise<{ success: boolean; userId?: string }> => {
    if (!signUp) {
      toast.error('Sign-up is not available.');
      return { success: false };
    }
    setLoading(true);

    try {
      console.log('Starting sign-up with email:', email);

      const signUpAttempt = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
        username
      });

      console.log('Sign-up attempt created(Clerk):', {
        id: signUpAttempt.id,
        status: signUpAttempt.status,
        userId: signUpAttempt.createdUserId,
        sessionId: signUpAttempt.createdSessionId
      });

      // DEBUG: Handle missing_requirements (email verification needed)
      // if (signUpAttempt.status === 'missing_requirements') {
      //   console.log('Status is missing_requirements - preparing email verification');

      //   // For development: prepare email verification
      //   try {
      //     await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      //     console.log('Email verification prepared');

      //     // In development, we can attempt with a test code to bypass verification
      //     // This only works with test emails in Clerk development mode
      //     try {
      //       const verifyResult = await signUp.attemptEmailAddressVerification({ code: '000000' });
      //       console.log('Verification attempt result:', verifyResult);
      //       if (verifyResult.status === 'complete') {
      //         console.log('Email verification succeeded with test code!');
      //         signUpAttempt.status = 'complete';
      //         signUpAttempt.createdUserId = verifyResult.createdUserId;
      //         signUpAttempt.createdSessionId = verifyResult.createdSessionId;
      //       }
      //     } catch (verifyErr) {
      //       console.warn('Test verification failed, email verification required:', verifyErr);
      //       toast.error('Please check your email to verify your account. (Check spam folder)');
      //       setLoading(false);
      //       return { success: false };
      //     }
      //   } catch (prepErr) {
      //     console.error('Error preparing email verification:', prepErr);
      //     toast.error('Sign-up requires email verification. Please try again.');
      //     setLoading(false);
      //     return { success: false };
      //   }
      // }

      // For this app, we skip email verification
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('userJustSignedUp', 'true');
      }

      // Set active session (user will complete setup on company-registration page)
      if (setActive && signUpAttempt.createdSessionId) {
        try {
          await setActive({ session: signUpAttempt.createdSessionId });
          console.log('Session activated for newly signed-up user');
        } catch (sessionErr) {
          console.error('Error activating session:', sessionErr);
          // Try again or fallback
        }
      }

      // For any other status, still return success with userId
      // We're skipping email verification for this flow
      console.log('Sign-up processed');
      toast.success('Account created! Complete your business profile.');

      // Ensure session is active before returning
      if (setActive && signUpAttempt.createdSessionId) {
        try {
          await setActive({ session: signUpAttempt.createdSessionId });
          console.log('Session activated for non-complete signup');
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (sessionErr) {
          console.error('Error activating session:', sessionErr);
          toast.error('Session setup failed. Please sign in manually.');
          setLoading(false);
          return { success: false };
        }
      }

      // Return success with userId - let caller (Google OAuth or form-based) handle redirect
      return {
        success: true,
        userId: signUpAttempt.createdUserId || undefined
      };
    } catch (error: any) {
      // Helper function to safely serialize error for logging
      const serializeError = (err: any): string => {
        try {
          if (err instanceof Error) {
            return err.message;
          }
          if (typeof err === 'string') {
            return err;
          }
          // Try to safely extract properties from error object
          const errorInfo: any = {};
          if (err?.message) errorInfo.message = err.message;
          if (err?.code) errorInfo.code = err.code;
          if (err?.status) errorInfo.status = err.status;
          if (err?.errors) {
            errorInfo.errors = Array.isArray(err.errors)
              ? err.errors.map((e: any) => ({
                  message: e?.message || e?.longMessage || String(e),
                  code: e?.code
                }))
              : err.errors;
          }
          return Object.keys(errorInfo).length > 0
            ? JSON.stringify(errorInfo)
            : String(err);
        } catch {
          return String(err);
        }
      };

      // Check if we have an actual error (not just an empty object)
      const isRealError =
        error instanceof Error ||
        error?.message ||
        error?.code ||
        error?.errors?.[0] ||
        error?.status ||
        (typeof error === 'string' && error.length > 0);

      if (!isRealError) {
        // Empty error object - likely a race condition or cleanup issue
        console.log('Empty error object caught - operation may have completed');
        setLoading(false);
        return { success: false };
      }

      console.error('Sign-up error caught:', serializeError(error));

      // Extract error message with priority order
      let errorMessage = '';

      // Try Clerk-specific error paths first
      if (
        error?.errors &&
        Array.isArray(error.errors) &&
        error.errors.length > 0
      ) {
        // Clerk returns errors as an array
        const firstError = error.errors[0];
        errorMessage = firstError?.message || firstError?.longMessage || '';
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string' && error.length > 0) {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Fallback if we couldn't extract a message
      if (!errorMessage) {
        errorMessage = 'An error occurred during sign-up. Please try again.';
      }

      // Always show the error toast to the user
      toast.error(errorMessage);

      // Clear the signup flag if it was set
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('userJustSignedUp');
      }

      setLoading(false);
      return { success: false };
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
