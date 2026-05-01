'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import SignUpForm from './SignUpForm';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function SignUpViewPage() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('inviteToken'); // Changed from 'invite' to 'inviteToken'
  const companyInvitationId = searchParams.get('invitationId');
  const [loading, setLoading] = useState(false);

  // Check invitation if token present - directly use query result
  const invitation = useQuery(
    api.companyAccess.getInvitationByToken, // Changed from teamManagement to companyAccess
    inviteToken ? { token: inviteToken } : 'skip'
  );

  console.log('Invitation query result:', {
    invitation,
    loading,
    companyInvitationId
  });

  // Show loading while checking invitation
  if (inviteToken && invitation === undefined && !loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  // If invalid invitation
  if (inviteToken && invitation === null) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-white p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='text-center text-destructive'>
              Invalid Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className='text-center'>
            <p className='mb-4 text-muted-foreground'>
              This invitation link is invalid or has expired.
            </p>
            <Link href='/sign-up' className='text-primary hover:underline'>
              Sign up for a new account
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className='relative min-h-screen bg-white'>
      {/* Left Fixed Sidebar */}
      <div className='fixed left-0 top-0 hidden h-screen w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-b from-emerald-600 via-emerald-500 to-teal-600 p-12 lg:flex'>
        {/* Decorative background */}
        <div className='absolute inset-0 overflow-hidden opacity-20'>
          <div className='absolute -right-40 -top-40 h-80 w-80 rounded-full bg-white blur-3xl' />
          <div className='absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-emerald-300 blur-3xl' />
        </div>

        <div className='relative z-20 space-y-12'>
          {/* Logo & Branding */}
          <div className='space-y-3'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm'>
                <span className='text-lg font-bold'>📦</span>
              </div>
              <h1 className='text-2xl font-bold tracking-tight text-white'>
                Digital Dukan
              </h1>
            </div>
          </div>

          {/* Benefits Section */}
          <div className='space-y-6'>
            <h2 className='text-2xl font-semibold leading-tight text-white'>
              Grow Your Business with Our Inventory Management System
            </h2>
            <ul className='space-y-4'>
              <li className='flex gap-3'>
                <span className='flex-shrink-0 text-xl'>✨</span>
                <div>
                  <p className='font-semibold text-white'>
                    Real-time Inventory Tracking
                  </p>
                  <p className='text-sm text-white/80'>
                    Monitor stock levels across multiple locations instantly
                  </p>
                </div>
              </li>
              <li className='flex gap-3'>
                <span className='flex-shrink-0 text-xl'>📊</span>
                <div>
                  <p className='font-semibold text-white'>Advanced Analytics</p>
                  <p className='text-sm text-white/80'>
                    Get actionable insights to optimize your inventory
                  </p>
                </div>
              </li>
              <li className='flex gap-3'>
                <span className='flex-shrink-0 text-xl'>⚙️</span>
                <div>
                  <p className='font-semibold text-white'>Automation</p>
                  <p className='text-sm text-white/80'>
                    Automate order management and stock replenishment
                  </p>
                </div>
              </li>
              <li className='flex gap-3'>
                <span className='flex-shrink-0 text-xl'>🔒</span>
                <div>
                  <p className='font-semibold text-white'>
                    Enterprise Security
                  </p>
                  <p className='text-sm text-white/80'>
                    Bank-level encryption and compliance standards
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className='relative z-20 pt-8'>
          <p className='text-sm text-white/80'>
            Join thousands of successful businesses using Digital Dukan
          </p>
        </div>
      </div>

      {/* Right Scrollable Content */}
      <div className='w-full lg:ml-[50%] lg:w-1/2'>
        <div className='flex min-h-screen flex-col justify-center p-4 lg:p-12'>
          <div className='mx-auto w-full max-w-xl'>
            {/* Mobile header */}
            <div className='mb-8 flex items-center justify-center gap-2 lg:hidden'>
              <span className='text-lg font-bold'>📦 Digital Dukan</span>
            </div>

            {/* Invitation banner */}
            {invitation && (
              <div className='mb-6 rounded-lg border bg-emerald-50 p-4 dark:bg-emerald-950'>
                <p className='font-medium text-emerald-700 dark:text-emerald-300'>
                  You've been invited to join{' '}
                  {invitation.companyName ? (
                    <span className='font-semibold'>
                      {invitation.companyName}
                    </span>
                  ) : (
                    <span className='italic text-emerald-600 dark:text-emerald-400'>
                      a company
                    </span>
                  )}
                </p>
                {invitation.companyGST && (
                  <p className='mt-1 text-sm text-muted-foreground'>
                    GST: {invitation.companyGST}
                  </p>
                )}
                <p className='mt-2 text-sm text-muted-foreground'>
                  After signing up, you'll become a team member with assigned
                  permissions.
                </p>
              </div>
            )}

            {/* Sign up form */}
            <SignUpForm
              invitation={invitation}
              companyInvitationId={companyInvitationId}
            />

            {/* Terms */}
            <p className='mt-8 text-center text-xs leading-relaxed text-muted-foreground'>
              By signing up, you agree to our{' '}
              <Link
                href='/terms'
                className='font-medium underline underline-offset-2 transition-colors hover:text-primary'
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href='/privacy'
                className='font-medium underline underline-offset-2 transition-colors hover:text-primary'
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Logo and Info */}
      <div className='fixed left-4 top-4 z-50 lg:hidden'>
        <div className='text-2xl font-bold text-gray-900'>📦</div>
      </div>
    </div>
  );
}
