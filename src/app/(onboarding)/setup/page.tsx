'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SetupPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleCompleteSetup = async () => {
    setIsLoading(true);
    try {
      // All setup is already done during signup
      // Just transition to dashboard
      toast.success('Welcome to Digital Dukan!');
      router.push('/dashboard/overview');
    } catch (error) {
      console.error('Setup error:', error);
      toast.error('Failed to proceed');
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='mb-8 text-center'>
          <div className='mb-4 flex justify-center'>
            <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-primary'>
              <span className='text-lg font-bold text-white'>📦</span>
            </div>
          </div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900'>All Set!</h1>
          <p className='text-gray-600'>Your workspace is ready to go</p>
        </div>

        {/* Setup Complete Card */}
        <Card className='mb-6 border-green-200 bg-green-50'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-green-900'>
              <CheckCircle2 className='h-5 w-5 text-green-600' />
              Setup Complete
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <CheckCircle2 className='h-5 w-5 flex-shrink-0 text-green-600' />
                <span className='text-sm text-gray-700'>Account created</span>
              </div>
              <div className='flex items-center gap-3'>
                <CheckCircle2 className='h-5 w-5 flex-shrink-0 text-green-600' />
                <span className='text-sm text-gray-700'>
                  Business details saved
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <CheckCircle2 className='h-5 w-5 flex-shrink-0 text-green-600' />
                <span className='text-sm text-gray-700'>Workspace ready</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Info */}
        {user && (
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle className='text-base'>Your Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <p className='text-sm'>
                  <span className='text-gray-600'>Name:</span>
                  <span className='ml-2 font-medium'>
                    {user.firstName} {user.lastName}
                  </span>
                </p>
                <p className='break-all text-sm'>
                  <span className='text-gray-600'>Email:</span>
                  <span className='ml-2 text-xs font-medium'>
                    {user.emailAddresses[0]?.emailAddress}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        <Button
          onClick={handleCompleteSetup}
          disabled={isLoading}
          className='h-11 w-full text-base font-semibold'
        >
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-5 w-5 animate-spin' />
              Starting...
            </>
          ) : (
            <>
              Go to Dashboard
              <ArrowRight className='ml-2 h-5 w-5' />
            </>
          )}
        </Button>

        {/* Footer */}
        <p className='mt-6 text-center text-xs text-gray-500'>
          You can update your settings anytime from the dashboard
        </p>
      </div>
    </div>
  );
}
