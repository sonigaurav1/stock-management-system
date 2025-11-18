'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import Link from 'next/link';
import UserAuthForm from './UserAuthForm';
import { Github, Instagram } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignInViewPage() {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/examples/authentication'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-4 top-4 hidden md:right-8 md:top-8'
        )}
      >
        Login
      </Link>
      <div className='relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex'>
        <div className='absolute inset-0 bg-zinc-900' />
        {/* <Image
          src='/signin/signin-2.webp'
          alt='Sign In Image'
          className='absolute inset-0 h-full w-full object-cover'
          width={500}
          height={500}
        /> */}
        <div className='relative z-20 flex items-center text-4xl font-bold'>
          Digital Dukan
        </div>
        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;Welcome back to the Inventory Management System.
              Effortlessly manage your business inventory with our intuitive and
              powerful tools.&rdquo;
            </p>
            <footer className='flex gap-2 text-sm'>
              - Gaurav Soni
              <span className='flex gap-2'>
                <Github
                  className='cursor-pointer'
                  onClick={() =>
                    window.open('https://github.com/sonigaurav1', '_blank')
                  }
                />
                <Instagram
                  className='cursor-pointer'
                  onClick={() =>
                    window.open('https://instagram.com/notgauravlol', '_blank')
                  }
                />
                <FaWhatsapp
                  size={27}
                  className='cursor-pointer'
                  onClick={() =>
                    window.open('https://wa.me/+9779746887763', '_blank')
                  }
                />
              </span>
            </footer>
          </blockquote>
        </div>
      </div>
      <div className='flex h-full items-center p-4 lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
          <div className='flex flex-col space-y-2 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>
              Sign in to your account
            </h1>
            <p className='text-sm text-muted-foreground'>
              Enter your email and password to sign in
            </p>
          </div>
          <UserAuthForm />
          <p className='px-8 text-center text-sm text-muted-foreground'>
            By signing in, you agree to our{' '}
            <Link
              href='/terms'
              className='underline underline-offset-4 hover:text-primary'
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy'
              className='underline underline-offset-4 hover:text-primary'
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
