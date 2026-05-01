'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TrialSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrialSignupModal({ isOpen, onClose }: TrialSignupModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'verification' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    businessName: '',
    phone: ''
  });

  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.businessName.trim()) {
      setError('Business name is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    return true;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Simulate API call to send verification code
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you'd call an API endpoint here:
      // const response = await fetch('/api/auth/send-trial-verification', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // if (!response.ok) throw new Error('Failed to send verification code');

      setVerificationSent(true);
      setStep('verification');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call to verify code and create trial account
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app:
      // const response = await fetch('/api/auth/verify-trial-signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     email: formData.email,
      //     code: verificationCode,
      //     businessName: formData.businessName,
      //     phone: formData.phone
      //   })
      // });
      // if (!response.ok) throw new Error('Verification failed');
      // const data = await response.json();
      // Store token/session if needed

      setStep('success');

      // Redirect after 2 seconds
      setTimeout(() => {
        onClose();
        router.push('/sign-in?trial=activated');
        // Or router.push('/dashboard') if auto-login on trial
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Verification failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('form');
    setVerificationCode('');
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle>Start Your Free Trial</DialogTitle>
              <DialogDescription>
                Get 30 days of unlimited access. No credit card required.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitForm} className='space-y-4'>
              {error && (
                <div className='flex items-start gap-2 rounded-md bg-red-50 p-3 dark:bg-red-950/20'>
                  <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400' />
                  <p className='text-sm text-red-700 dark:text-red-400'>
                    {error}
                  </p>
                </div>
              )}

              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  placeholder='you@example.com'
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='businessName'>Business Name</Label>
                <Input
                  id='businessName'
                  name='businessName'
                  placeholder='Your shop or business name'
                  value={formData.businessName}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone Number</Label>
                <Input
                  id='phone'
                  name='phone'
                  placeholder='+977 98XXXXXXXX'
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
              </div>

              <div className='rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'>
                ✓ 30-day free trial • ✓ Full access • ✓ No credit card needed
              </div>

              <Button
                type='submit'
                className='w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700'
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Processing...
                  </>
                ) : (
                  'Start Free Trial'
                )}
              </Button>

              <p className='text-center text-xs text-slate-500 dark:text-slate-400'>
                By starting a trial, you agree to our{' '}
                <a
                  href='#'
                  className='underline hover:text-slate-900 dark:hover:text-white'
                >
                  Terms of Service
                </a>
              </p>
            </form>
          </>
        )}

        {step === 'verification' && (
          <>
            <DialogHeader>
              <DialogTitle>Verify Your Email</DialogTitle>
              <DialogDescription>
                We sent a verification code to <strong>{formData.email}</strong>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleVerifyCode} className='space-y-4'>
              {error && (
                <div className='flex items-start gap-2 rounded-md bg-red-50 p-3 dark:bg-red-950/20'>
                  <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400' />
                  <p className='text-sm text-red-700 dark:text-red-400'>
                    {error}
                  </p>
                </div>
              )}

              <div className='space-y-2'>
                <Label htmlFor='code'>Verification Code</Label>
                <Input
                  id='code'
                  placeholder='Enter 6-digit code'
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value);
                    setError(null);
                  }}
                  disabled={loading}
                  maxLength={6}
                  autoFocus
                />
              </div>

              <div className='text-sm text-slate-600 dark:text-slate-400'>
                <p className='mb-2'>
                  Check your email for the verification code.
                </p>
                <button
                  type='button'
                  className='text-blue-600 hover:underline dark:text-blue-400'
                  onClick={() => {
                    setError(null);
                    // In real app: resend verification code
                  }}
                >
                  Didn't receive the code? Resend
                </button>
              </div>

              <Button
                type='submit'
                className='w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700'
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Verifying...
                  </>
                ) : (
                  'Verify & Start Trial'
                )}
              </Button>

              <Button
                type='button'
                variant='outline'
                className='w-full'
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </Button>
            </form>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle>Trial Activated! 🎉</DialogTitle>
            </DialogHeader>

            <div className='space-y-4 py-6 text-center'>
              <div className='flex justify-center'>
                <div className='rounded-full bg-emerald-100 p-3 dark:bg-emerald-950/30'>
                  <CheckCircle2 className='h-8 w-8 text-emerald-600 dark:text-emerald-400' />
                </div>
              </div>

              <div>
                <h3 className='mb-2 text-lg font-semibold'>
                  Welcome to DigitalDukan!
                </h3>
                <p className='text-slate-600 dark:text-slate-400'>
                  Your 30-day free trial is now active. Access all features
                  immediately.
                </p>
              </div>

              <div className='space-y-2 rounded-md bg-blue-50 p-4 text-left text-sm dark:bg-blue-950/20'>
                <div className='flex items-start gap-2'>
                  <CheckCircle2 className='mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600' />
                  <span>Unlimited products & users</span>
                </div>
                <div className='flex items-start gap-2'>
                  <CheckCircle2 className='mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600' />
                  <span>Multi-location support</span>
                </div>
                <div className='flex items-start gap-2'>
                  <CheckCircle2 className='mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600' />
                  <span>Tax-compliant invoicing</span>
                </div>
              </div>

              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Redirecting to dashboard...
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
