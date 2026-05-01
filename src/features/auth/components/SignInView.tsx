'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import UserAuthForm from './UserAuthForm';
import { Github, Instagram } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';

export default function SignInViewPage() {
  const socialLinks = [
    {
      icon: Github,
      href: 'https://github.com/sonigaurav1',
      label: 'GitHub',
      ariaLabel: 'Visit GitHub profile'
    },
    {
      icon: Instagram,
      href: 'https://instagram.com/notgauravlol',
      label: 'Instagram',
      ariaLabel: 'Visit Instagram profile'
    },
    {
      icon: FaWhatsapp,
      href: 'https://wa.me/+9779746887763',
      label: 'WhatsApp',
      ariaLabel: 'Contact on WhatsApp',
      size: 22
    }
  ];

  return (
    <div className='relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      {/* Left sidebar - Desktop only */}
      <div className='relative hidden h-screen flex-col bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-10 text-white lg:flex'>
        {/* Decorative background elements */}
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl' />
          <div className='absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl' />
        </div>

        <div className='relative z-20'>
          <div className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <div className='h-8 w-8 rounded-lg bg-primary' />
            Digital Dukan
          </div>
        </div>

        <div className='relative z-20 mt-auto space-y-8'>
          <blockquote className='space-y-4 border-l-2 border-primary pl-6'>
            <p className='text-lg font-medium leading-relaxed'>
              &ldquo;Welcome back to your Inventory Management System.
              Effortlessly manage your business inventory with our intuitive and
              powerful tools.&rdquo;
            </p>
            <footer className='text-sm font-medium text-zinc-300'>
              - Gaurav Soni
            </footer>
          </blockquote>

          {/* Social links with improved accessibility */}
          <div className='flex items-center gap-3'>
            <span className='text-xs font-semibold uppercase tracking-wider text-zinc-400'>
              Connect
            </span>
            <div className='flex gap-2'>
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label={link.ariaLabel}
                    className={cn(
                      'inline-flex h-11 w-11 items-center justify-center rounded-lg',
                      'bg-white/10 text-white transition-all duration-200',
                      'hover:bg-primary hover:text-white',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-zinc-900',
                      'active:scale-95'
                    )}
                    title={link.label}
                  >
                    <Icon size={link.size || 20} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign in form */}
      <div className='relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8'>
        <div className='w-full max-w-sm space-y-8'>
          {/* Header */}
          <div className='space-y-3 text-center'>
            {/* Mobile logo - shown only on small screens */}
            <div className='flex items-center justify-center gap-2 lg:hidden'>
              <div className='h-7 w-7 rounded-lg bg-primary' />
              <span className='text-xl font-bold'>Digital Dukan</span>
            </div>
            <div className='space-y-2'>
              <h1 className='text-3xl font-bold tracking-tight'>
                Welcome back
              </h1>
              <p className='text-sm text-muted-foreground'>
                Sign in to your account to continue
              </p>
            </div>
          </div>

          {/* Form */}
          <UserAuthForm />

          {/* Divider */}
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-border' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-background px-2 text-muted-foreground'>
                New to Digital Dukan?
              </span>
            </div>
          </div>

          {/* Sign up link */}
          <div className='text-center text-sm'>
            <span className='text-muted-foreground'>
              Don't have an account?{' '}
            </span>
            <Link
              href='/sign-up'
              className='font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary/90'
            >
              Sign up
            </Link>
          </div>

          {/* Terms */}
          <p className='text-center text-xs leading-relaxed text-muted-foreground'>
            By signing in, you agree to our{' '}
            <Link
              href='/terms'
              className='font-medium underline underline-offset-4 transition-colors hover:text-primary'
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy'
              className='font-medium underline underline-offset-4 transition-colors hover:text-primary'
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
