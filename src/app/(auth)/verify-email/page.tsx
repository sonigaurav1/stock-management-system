'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSignUp } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowRight, Clock } from 'lucide-react';

const verificationSchema = z.object({
  code: z
    .string()
    .min(6, { message: 'Verification code must be 6 characters' })
    .max(6, { message: 'Verification code must be 6 characters' })
    .regex(/^\d+$/, { message: 'Verification code must contain only numbers' })
});

type VerificationFormData = z.infer<typeof verificationSchema>;

export default function VerifyEmailPage() {
  const router = useRouter();
  const { signUp, setActive } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [signUpData, setSignUpData] = useState<any>(null);

  useEffect(() => {
    // Get the stored sign-up attempt
    const storedSignUpData =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('currentSignUpAttempt')
        : null;

    if (!storedSignUpData) {
      // If no sign-up attempt, redirect to sign-up
      router.push('/sign-up');
      return;
    }

    try {
      const parsed = JSON.parse(storedSignUpData);
      setSignUpData(parsed);
    } catch {
      router.push('/sign-up');
    }
  }, [router]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setTimeout(() => {
      setResendCooldown(resendCooldown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: ''
    }
  });

  const onSubmit = async (data: VerificationFormData) => {
    if (!signUp || !signUpData) {
      toast.error('Sign-up data not found. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting email verification with code:', data.code);

      // Try to verify the email code
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: data.code
      });

      console.log('Email verification attempt result:', {
        status: completeSignUp.status,
        userId: completeSignUp.createdUserId,
        sessionId: completeSignUp.createdSessionId,
        userExists: !!completeSignUp.createdUserId
      });

      if (completeSignUp.status !== 'complete') {
        console.error(
          'Email verification status not complete after attempt:',
          completeSignUp.status
        );
        toast.error(
          'Email verification incomplete. Please contact support if this persists.'
        );
        setIsLoading(false);
        return;
      }

      console.log('Email verification complete. Activating session...');

      // Set the session as active - this is critical for establishing user context
      if (completeSignUp.createdSessionId) {
        try {
          await setActive({ session: completeSignUp.createdSessionId });
          console.log(
            'Session activated successfully with ID:',
            completeSignUp.createdSessionId
          );
        } catch (sessionErr) {
          console.error('Error activating session:', sessionErr);
          toast.error(
            'Session setup failed. Your account was created but you need to sign in manually.'
          );
          // Store the email for sign-in
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('currentSignUpAttempt');
            sessionStorage.setItem('email_for_signin', signUpData.email);
          }
          setIsLoading(false);
          router.push('/sign-in');
          return;
        }
      } else {
        console.error('No session ID available after verification');
        toast.error(
          'Session setup failed. Your account was created but you need to sign in manually.'
        );
        // Store the email for sign-in
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('currentSignUpAttempt');
          sessionStorage.setItem('email_for_signin', signUpData.email);
        }
        setIsLoading(false);
        router.push('/sign-in');
        return;
      }

      toast.success('Email verified successfully!');

      // Clear the stored sign-up data
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('currentSignUpAttempt');
        sessionStorage.removeItem('email_for_signin');
      }

      // Wait a moment for Clerk to fully process the session before redirecting
      // This is important for Server Components to pick up the authenticated session
      console.log(
        'Waiting 500ms for session propagation before redirecting...'
      );
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('Redirecting to company registration...');
      router.push('/company-registration');
    } catch (error: any) {
      console.error('Email verification error caught:', {
        message: error?.message,
        code: error?.code,
        errors: error?.errors,
        status: error?.status,
        type: typeof error,
        keys: error ? Object.keys(error) : []
      });

      let errorMessage = 'Invalid verification code. Please try again.';

      if (error?.errors?.[0]?.message) {
        errorMessage = error.errors[0].message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);

      // Clear invalid code from form
      form.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!signUp || resendCooldown > 0) return;

    setResendLoading(true);

    try {
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code'
      });

      toast.success('Verification code sent! Check your email.');
      setResendCooldown(60); // 60 second cooldown
    } catch (error: any) {
      console.error('Resend error:', error);
      toast.error('Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (!signUpData) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4'>
        <div className='w-full max-w-md text-center'>
          <Loader2 className='mx-auto mb-4 h-8 w-8 animate-spin text-primary' />
          <p className='text-sm text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4'>
      <div className='mx-auto w-full max-w-md'>
        {/* Header */}
        <div className='mb-8 text-center'>
          <div className='mb-4 flex justify-center'>
            <div className='rounded-full bg-primary/10 p-3'>
              <Mail className='h-6 w-6 text-primary' />
            </div>
          </div>
          <h1 className='text-2xl font-bold'>Verify Your Email</h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            We sent a verification code to{' '}
            <span className='font-semibold text-foreground'>
              {signUpData.email}
            </span>
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs font-semibold'>
                    Verification Code
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='000000'
                      {...field}
                      maxLength={6}
                      className='h-10 text-center text-lg tracking-widest'
                      autoComplete='off'
                      inputMode='numeric'
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <Button
              type='submit'
              className='h-10 w-full font-semibold'
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Verifying...
                </>
              ) : (
                <>
                  Continue <ArrowRight className='ml-2 h-4 w-4' />
                </>
              )}
            </Button>
          </form>
        </Form>

        {/* Resend Code */}
        <div className='mt-6 text-center'>
          <p className='text-xs text-muted-foreground'>
            Didn't receive a code?
          </p>
          <button
            onClick={handleResendCode}
            disabled={resendCooldown > 0 || resendLoading}
            className='mt-2 text-xs font-semibold text-primary hover:text-primary/90 disabled:opacity-50'
          >
            {resendLoading ? (
              <>
                <Loader2 className='mr-1 inline h-3 w-3 animate-spin' />
                Sending...
              </>
            ) : resendCooldown > 0 ? (
              <>
                <Clock className='mr-1 inline h-3 w-3' />
                Resend in {resendCooldown}s
              </>
            ) : (
              'Resend Code'
            )}
          </button>
        </div>

        {/* Change Email */}
        <div className='mt-6 border-t border-border pt-6 text-center'>
          <p className='text-xs text-muted-foreground'>
            Wrong email address?{' '}
            <button
              onClick={() => {
                sessionStorage.removeItem('currentSignUpAttempt');
                router.push('/sign-up');
              }}
              className='font-semibold text-primary hover:text-primary/90'
            >
              Go back to sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
