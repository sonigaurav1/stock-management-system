'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { BusinessRegistrationForm } from '@/features/auth/BusinessRegistrationForm';
import {
  Loader2,
  BarChart3,
  Zap,
  Lock,
  Lightbulb,
  Users,
  ArrowRight,
  Building2
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function CompanyRegistrationContent() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pendingInvite, setPendingInvite] = useState<any>(null);
  const [checkedInvite, setCheckedInvite] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  // Check for invite token in URL (new unified invite flow)
  useEffect(() => {
    const token = searchParams.get('inviteToken');
    if (token) {
      setInviteToken(token);
    }
  }, [searchParams]);

  // Check for pending invitation on mount (legacy flow)
  useEffect(() => {
    if (typeof window !== 'undefined' && !checkedInvite) {
      const stored = sessionStorage.getItem('pendingInvitation');
      if (stored) {
        try {
          const invite = JSON.parse(stored);
          setPendingInvite(invite);
        } catch (e) {
          console.error('Failed to parse invitation', e);
        }
      }
      setCheckedInvite(true);
    }
  }, [checkedInvite]);

  // If there's an invite token, redirect to accept-invite page (Option A: skip company details)
  if (inviteToken && user && isLoaded) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Building2 className='h-5 w-5 text-primary' />
              Accepting Invitation
            </CardTitle>
            <CardDescription>
              You're joining a team as an invited member
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              You won't need to fill company details since you're joining an
              existing organization. Your team owner's company information will
              be used.
            </p>
            <Button
              onClick={() => router.push(`/accept-invite?token=${inviteToken}`)}
              className='w-full gap-2'
            >
              <ArrowRight className='h-4 w-4' />
              Continue to Accept Invitation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If there's an invitation, show simplified "join" flow (legacy)
  if (pendingInvite && user && isLoaded) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-white p-4'>
        <div className='w-full max-w-lg space-y-6'>
          {/* Header */}
          <div className='text-center'>
            <div className='mb-4 flex justify-center'>
              <div className='flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100'>
                <Building2 className='h-8 w-8 text-emerald-600' />
              </div>
            </div>
            <h1 className='text-2xl font-bold'>
              Join {pendingInvite.companyName}
            </h1>
            <p className='mt-2 text-muted-foreground'>
              You've been invited to join this organization
            </p>
          </div>

          {/* Invitation Details */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Invitation Details</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <p className='text-muted-foreground'>Invited by</p>
                  <p className='font-medium'>
                    {pendingInvite.organizationId.slice(0, 8)}...
                  </p>
                </div>
                <div>
                  <p className='text-muted-foreground'>GST Number</p>
                  <p className='font-medium'>
                    {pendingInvite.companyGST || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <p className='mb-2 text-sm text-muted-foreground'>
                  Your permissions
                </p>
                <div className='flex flex-wrap gap-1'>
                  {pendingInvite.permissions.map((perm: string) => (
                    <Badge key={perm} variant='outline'>
                      {perm.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                className='w-full'
                onClick={() => {
                  // Clear invitation storage
                  sessionStorage.removeItem('pendingInvitation');
                  sessionStorage.setItem('userJustSignedUp', 'true');
                  // Redirect to onboarding setup
                  router.push('/onboarding/setup');
                }}
              >
                <Users className='mr-2 h-4 w-4' />
                Accept & Join
              </Button>

              <p className='text-center text-xs text-muted-foreground'>
                Or{' '}
                <button
                  className='text-primary underline'
                  onClick={() => {
                    sessionStorage.removeItem('pendingInvitation');
                    setPendingInvite(null);
                  }}
                >
                  create a new organization instead
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}

// Normal registration flow component
function NormalCompanyRegistration({
  user,
  isLoaded
}: {
  user: any;
  isLoaded: boolean;
}) {
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectReason, setRedirectReason] = useState<string | null>(null);

  // ... rest of original logic (simplified for brevity)
  if (!isLoaded || !user) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  const userEmail = user.emailAddresses[0]?.emailAddress || '';

  const benefits = [
    {
      icon: <BarChart3 className='h-6 w-6' />,
      title: 'Real-time Analytics',
      description: 'Track inventory metrics in real-time'
    },
    {
      icon: <Zap className='h-6 w-6' />,
      title: 'Automation',
      description: 'Automate routine tasks and workflows'
    },
    {
      icon: <Lock className='h-6 w-6' />,
      title: 'Enterprise Security',
      description: 'Bank-level security for your data'
    },
    {
      icon: <Lightbulb className='h-6 w-6' />,
      title: 'Smart Insights',
      description: 'AI-powered inventory recommendations'
    }
  ];

  return (
    <div className='relative min-h-screen bg-white'>
      {/* Left Sidebar */}
      <div className='fixed left-0 top-0 hidden h-screen w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-b from-teal-600 via-teal-500 to-emerald-600 p-12 lg:flex'>
        <div className='absolute right-0 top-0 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl' />
        <div className='absolute bottom-0 left-1/2 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl' />
        <div className='relative z-10'>
          <div className='text-3xl font-bold text-white'>📦 Digital Dukan</div>
          <p className='mt-2 text-sm text-teal-50/80'>
            Inventory Management System
          </p>
        </div>
        <div className='relative z-10 space-y-6'>
          {benefits.map((benefit, index) => (
            <div key={index} className='flex gap-4'>
              <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/20 text-white'>
                {benefit.icon}
              </div>
              <div>
                <p className='text-sm font-semibold text-white'>
                  {benefit.title}
                </p>
                <p className='text-xs text-teal-50/70'>{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className='relative z-10'>
          <blockquote className='text-sm italic text-teal-50/90'>
            "The best inventory management system for growing businesses."
          </blockquote>
          <p className='mt-2 text-xs font-medium text-teal-50'>
            — Business Owner
          </p>
        </div>
      </div>

      {/* Right Content */}
      <div className='w-full lg:ml-[50%] lg:w-1/2'>
        <div className='flex min-h-screen flex-col justify-center p-4 lg:p-12'>
          <div className='w-full max-w-xl'>
            <div className='rounded-lg bg-white p-6 shadow-lg md:p-10'>
              <div className='mb-8'>
                <h1 className='mb-2 text-3xl font-bold text-gray-900'>
                  Complete Your Business Registration
                </h1>
                <p className='text-gray-600'>
                  Tell us about your business to get started with inventory
                  management
                </p>
              </div>
              <BusinessRegistrationForm
                userId={user.id}
                userEmail={userEmail}
              />
              <div className='mt-8 border-t pt-6 text-center text-sm text-gray-500'>
                <p>
                  By registering, you agree to our{' '}
                  <a href='/terms' className='text-blue-600 hover:underline'>
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href='/privacy' className='text-blue-600 hover:underline'>
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompanyRegistrationPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      }
    >
      <CompanyRegistrationContent />
    </Suspense>
  );
}
