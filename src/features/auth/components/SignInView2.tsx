'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className='flex min-h-screen bg-background'>
      {/* Left side - Hero Image */}
      <div className='relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-[#0F4C75] to-[#1B5E9B] lg:flex lg:w-1/2'>
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute left-0 top-0 h-96 w-96 rounded-full bg-white mix-blend-multiply blur-3xl filter'></div>
          <div className='absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#FF9F43] mix-blend-multiply blur-3xl filter'></div>
        </div>

        <div className='relative z-10 px-8 text-center'>
          <div className='mb-8'>
            <div className='inline-block rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm'>
              <svg
                className='h-24 w-24 text-white'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
              >
                <rect x='3' y='3' width='18' height='18' rx='2' />
                <path d='M7 8h10M7 12h10M7 16h10' strokeLinecap='round' />
              </svg>
            </div>
          </div>
          <h2 className='mb-4 text-pretty text-4xl font-bold text-white'>
            Digital Dukan
          </h2>
          <p className='mb-2 text-lg leading-relaxed text-white/80'>
            Intelligent Inventory Management
          </p>
          <p className='text-sm text-white/70'>
            Streamline your warehouse operations with real-time insights
          </p>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className='flex w-full items-center justify-center p-4 sm:p-8 lg:w-1/2'>
        <div className='w-full max-w-md'>
          {/* Mobile Logo */}
          <div className='mb-8 text-center lg:hidden'>
            <h1 className='text-3xl font-bold text-foreground'>
              Digital Dukan
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Inventory Management
            </p>
          </div>

          {/* Sign In Header */}
          <div className='mb-8'>
            <h2 className='mb-2 text-balance text-3xl font-bold text-foreground'>
              Welcome back
            </h2>
            <p className='text-muted-foreground'>
              Sign in to access your inventory dashboard
            </p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* Email Field */}
            <div>
              <label
                htmlFor='email'
                className='mb-2 block text-sm font-medium text-foreground'
              >
                Email address
              </label>
              <input
                id='email'
                type='email'
                placeholder='you@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground transition-all placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FF9F43]'
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <div className='mb-2 flex items-center justify-between'>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-foreground'
                >
                  Password
                </label>
                <a
                  href='#'
                  className='text-sm text-[#FF9F43] transition-colors hover:text-[#FF8C1A]'
                >
                  Forgot password?
                </a>
              </div>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground transition-all placeholder:text-muted-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#FF9F43]'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground'
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type='submit'
              disabled={isLoading}
              className='mt-6 w-full rounded-lg bg-[#FF9F43] py-3 font-semibold text-white transition-colors duration-200 hover:bg-[#FF8C1A] disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className='relative my-8'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-input'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='bg-background px-2 text-muted-foreground'>
                New to Digital Dukan?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <button
            type='button'
            className='w-full rounded-lg border border-input py-3 font-semibold text-foreground transition-colors duration-200 hover:bg-muted'
          >
            Create an account
          </button>

          {/* Footer Links */}
          <p className='mt-8 text-center text-xs text-muted-foreground'>
            By signing in, you agree to our{' '}
            <a href='#' className='text-[#FF9F43] hover:underline'>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href='#' className='text-[#FF9F43] hover:underline'>
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
