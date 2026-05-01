'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import * as z from 'zod';
import { PATH } from '@/constants/PATH';
import { useState } from 'react';
import { EyeIcon, EyeOffIcon, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSignIn } from '@clerk/nextjs';
import { toast } from 'sonner';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? PATH.OVERVIEW;
  // For new OAuth users, redirect to company registration instead of dashboard
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const oauthRedirectUrl = `${baseUrl}/company-registration`;
  const { loading, handleSignIn } = useAuth();
  const { signIn, isLoaded } = useSignIn();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Ensure consistent hydration: disable Google button during SSR/initial hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const defaultValues = {
    email: '',
    password: ''
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    setSignInError(null); // Clear previous errors
    const result = await handleSignIn(data.email, data.password, callbackUrl);
    if (!result.success && result.error) {
      setSignInError(result.error);
    }
  };

  // Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn) {
      setSignInError('Sign-in service not available');
      return;
    }

    setSignInError(null); // Clear previous errors
    setIsGoogleLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: oauthRedirectUrl,
        redirectUrlComplete: oauthRedirectUrl
      });
    } catch (err: unknown) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Google sign-in error:', err);
      }
      const errorMessage =
        err instanceof Error ? err.message : 'Google sign-in failed';
      setSignInError(errorMessage);
      setIsGoogleLoading(false);
    }
  };

  const isGoogleAuthEnabled =
    process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === 'true';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-4'>
        {/* Email Field */}
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem className='space-y-2'>
              <FormLabel className='text-sm font-semibold'>
                Email Address
              </FormLabel>
              <FormControl>
                <Input
                  type='email'
                  placeholder='example@gmail.com'
                  disabled={loading}
                  className='h-10 transition-colors focus:ring-2 focus:ring-primary/50'
                  autoComplete='email'
                  {...field}
                />
              </FormControl>
              <FormMessage className='text-xs' />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='space-y-2'>
              <div className='flex items-center justify-between'>
                <FormLabel className='text-sm font-semibold'>
                  Password
                </FormLabel>
                <Link
                  href='/forgot-password'
                  className='text-xs text-primary underline underline-offset-2 transition-colors hover:text-primary/90'
                >
                  Forgot?
                </Link>
              </div>
              <FormControl>
                <div className='relative'>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='*********'
                    disabled={loading}
                    className='h-10 pr-10 transition-colors focus:ring-2 focus:ring-primary/50'
                    autoComplete='current-password'
                    {...field}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className='absolute inset-y-0 right-0 flex items-center justify-center pr-3 text-muted-foreground transition-colors hover:text-foreground focus:outline-none disabled:opacity-50'
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOffIcon className='h-4 w-4' />
                    ) : (
                      <EyeIcon className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage className='text-xs' />
            </FormItem>
          )}
        />

        {/* Error Message */}
        {signInError && (
          <div className='flex items-center gap-2'>
            <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-600' />
            <p className='text-sm text-red-600'>{signInError}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          disabled={loading}
          className='mt-6 h-10 w-full font-semibold transition-all duration-200'
          type='submit'
          size='lg'
        >
          {loading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      {/* Google Sign In - Conditional */}
      {isGoogleAuthEnabled && (
        <>
          {/* Divider */}
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-border' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-background px-2 text-muted-foreground'>
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type='button'
            variant='outline'
            className='h-10 w-full font-medium'
            disabled={!isMounted || !isLoaded || isGoogleLoading}
            onClick={handleGoogleSignIn}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Signing in...
              </>
            ) : (
              <>
                {/* Google Logo */}
                <svg
                  className='mr-2 h-4 w-4'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path
                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    fill='#4285F4'
                  />
                  <path
                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    fill='#34A853'
                  />
                  <path
                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    fill='#FBBC05'
                  />
                  <path
                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    fill='#EA4335'
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </Button>
        </>
      )}
    </Form>
  );
}
