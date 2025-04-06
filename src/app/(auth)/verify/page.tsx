'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  CheckCircle,
  RefreshCw,
  Package,
  BarChart3,
  SearchX,
  Mail,
  Phone,
  MessageSquare
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/Spinner';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useUser } from '@clerk/clerk-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function VerificationPage() {
  const router = useRouter();
  const { user } = useUser();

  const userId = user?.id;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const verifyOtp = useMutation(api.verification.verifyOtp);
  const generateNewOtp = useMutation(api.verification.generateOtp);
  const companyDetails = useQuery(api.companyDetails.getCompanyDetails, {
    userId: userId ?? ''
  });

  useEffect(() => {
    // Generate OTP when the page loads if company is not verified
    if (companyDetails && !companyDetails.isVerified) {
      if (userId) {
        generateNewOtp({ userId });
      }
    } else if (companyDetails?.isVerified) {
      // If already verified, redirect to dashboard
      router.push('/dashboard/overview');
    }
  }, [companyDetails, userId, generateNewOtp, router]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^[0-9]$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      if (!userId) {
        setError('User ID is missing. Please try again.');
        setLoading(false);
        return;
      }

      const result = await verifyOtp({ userId, otp: otpString });

      if (result.success) {
        const updateClerkMetadata = async () => {
          try {
            if (!process.env.NEXT_PUBLIC_API_URL) {
              throw new Error('API URL is not defined');
            }

            // Update Clerk metadata to set isVerified to true
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/verify`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  userId: userId,
                  isVerified: true
                })
              }
            );

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(
                errorData.message || 'Failed to update verification status'
              );
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error updating Clerk metadata:', error);
          }
        };
        // Update Clerk metadata to set isVerified to true
        await updateClerkMetadata();

        setSuccess(true);

        router.push('/dashboard/overview');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      // eslint-disable-next-line no-console
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      if (userId) {
        await generateNewOtp({ userId });
      } else {
        setError('User ID is missing. Please try again.');
      }
      setError('');
      // Clear the OTP fields
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (companyDetails === undefined) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Spinner size='xl2' />
      </div>
    );
  }

  if (companyDetails === null) {
    return (
      <div className='flex h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900'>
        <Card className='border-none shadow-lg'>
          <div className='mt-4 flex justify-center'>
            <div className='flex h-32 w-32 items-center justify-center rounded-full bg-muted/10'>
              <SearchX className='h-16 w-16 text-muted' />
            </div>
          </div>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-center text-xl'>
              Company Details Not Found
            </CardTitle>
            <CardDescription className='text-center'>
              Please fill up company details to verify your account.
            </CardDescription>
          </CardHeader>
          <CardFooter className='flex justify-center'>
            <Button onClick={() => router.push('/company-details')}>
              Go to Company Details
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <ScrollArea className='h-screen w-full'>
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900'>
        <div className='w-full max-w-md space-y-4'>
          {/* Brand header */}
          <div className='text-center'>
            <div className='mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
              <Package className='h-8 w-8 text-primary' />
            </div>
            <h1 className='text-2xl font-bold'>Stock Management System</h1>
            <p className='text-sm text-muted-foreground'>
              Effortlessly manage your business inventory
            </p>
          </div>

          <Card className='border-none shadow-lg'>
            <CardHeader className='space-y-1'>
              <div className='flex items-center justify-center gap-2'>
                <BarChart3 className='h-5 w-5 text-primary' />
                <CardTitle className='text-xl'>Account Verification</CardTitle>
              </div>
              <CardDescription className='text-center'>
                Enter your verification code below to access your account.
                <br />
                Contact us to receive your verification code.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <Alert className='border-green-200 bg-green-50 text-green-800'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-5 w-5 text-green-600' />
                    <AlertDescription className='font-medium'>
                      Verification successful! Redirecting to dashboard...
                    </AlertDescription>
                  </div>
                </Alert>
              ) : (
                <>
                  {error && (
                    <Alert className='mb-6 border-destructive/20 bg-destructive/10 text-destructive'>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className='space-y-6'>
                    <div className='flex justify-center gap-2'>
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          id={`otp-${index}`}
                          type='text'
                          inputMode='numeric'
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className='h-14 w-12 text-center text-xl font-semibold'
                          required
                        />
                      ))}
                    </div>

                    <div className='space-y-3'>
                      <Button
                        type='submit'
                        className='w-full'
                        disabled={loading}
                      >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </CardContent>
            {!success && (
              <CardFooter className='flex justify-center border-t p-4'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleResendOtp}
                  disabled={loading}
                  className='flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
                >
                  <RefreshCw className='h-3.5 w-3.5' />
                  Resend OTP
                </Button>
              </CardFooter>
            )}

            {!success && (
              <>
                <Separator />
                <CardFooter className='flex flex-col gap-4 p-4'>
                  <div className='space-y-4'>
                    <h3 className='text-center text-sm font-medium text-muted-foreground'>
                      Contact us for verification
                    </h3>

                    <div className='grid w-full grid-cols-2 gap-3'>
                      <Link
                        href='https://wa.me/+9779704346673'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='w-full'
                      >
                        <Button
                          variant='outline'
                          className='group h-12 w-full transition-all hover:border-green-200 hover:bg-green-50 hover:text-green-600'
                        >
                          <div className='flex items-center justify-center gap-2'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 transition-all group-hover:bg-green-200'>
                              <MessageSquare className='h-4 w-4' />
                            </div>
                            <div className='flex flex-col items-start'>
                              <span className='text-xs text-muted-foreground'>
                                Message on
                              </span>
                              <span className='text-sm font-medium'>
                                WhatsApp
                              </span>
                            </div>
                          </div>
                        </Button>
                      </Link>

                      <Link href='tel:+9779704346673' className='w-full'>
                        <Button
                          variant='outline'
                          className='group h-12 w-full transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'
                        >
                          <div className='flex items-center justify-center gap-2'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-all group-hover:bg-blue-200'>
                              <Phone className='h-4 w-4' />
                            </div>
                            <div className='flex flex-col items-start'>
                              <span className='text-xs text-muted-foreground'>
                                Call us
                              </span>
                              <span className='truncate text-sm font-medium'>
                                +977-9704346673
                              </span>
                            </div>
                          </div>
                        </Button>
                      </Link>

                      <Link
                        href='mailto:gauravsoni7763@gmail.com'
                        className='col-span-2 w-full'
                      >
                        <Button
                          variant='outline'
                          className='group h-12 w-full transition-all hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600'
                        >
                          <div className='flex items-center justify-center gap-2'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 transition-all group-hover:bg-amber-200'>
                              <Mail className='h-4 w-4' />
                            </div>
                            <div className='flex flex-col items-start'>
                              <span className='text-xs text-muted-foreground'>
                                Email us
                              </span>
                              <span className='truncate text-sm font-medium'>
                                gauravsoni7763@gmail.com
                              </span>
                            </div>
                          </div>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardFooter>
              </>
            )}
          </Card>

          {/* Features hint */}
          <div className='text-center text-xs text-muted-foreground'>
            <p>
              Verify to access product management, supplier tracking, and more
            </p>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
