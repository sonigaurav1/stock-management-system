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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2, Loader2, Calendar } from 'lucide-react';

interface ScheduleDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScheduleDemoModal({ isOpen, onClose }: ScheduleDemoModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessType: '',
    preferredTime: '',
    questions: ''
  });

  const businessTypes = [
    'Electronics Retailer',
    'General Store',
    'Wholesale Business',
    'Department Store',
    'Pharmacy',
    'Bookstore',
    'Other'
  ];

  const timeSlots = [
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
    '5:00 PM - 6:00 PM'
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.preferredTime.trim()) {
      setError('Please select a preferred time');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Simulate API call to schedule demo
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, you'd call an API endpoint here:
      // const response = await fetch('/api/demo/schedule', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // if (!response.ok) throw new Error('Failed to schedule demo');
      // const data = await response.json();

      setSuccess(true);

      // Close modal and reset after 3 seconds
      setTimeout(() => {
        onClose();
        resetForm();
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to schedule demo. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      businessType: '',
      preferredTime: '',
      questions: ''
    });
    setSuccess(false);
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Demo Scheduled! 🎉</DialogTitle>
          </DialogHeader>

          <div className='space-y-4 py-6 text-center'>
            <div className='flex justify-center'>
              <div className='rounded-full bg-emerald-100 p-3 dark:bg-emerald-950/30'>
                <CheckCircle2 className='h-8 w-8 text-emerald-600 dark:text-emerald-400' />
              </div>
            </div>

            <div>
              <h3 className='mb-2 text-lg font-semibold'>
                Demo Call Confirmed!
              </h3>
              <p className='text-slate-600 dark:text-slate-400'>
                We'll send a confirmation email to{' '}
                <strong>{formData.email}</strong> with the meeting details.
              </p>
            </div>

            <div className='space-y-2 rounded-md bg-blue-50 p-4 text-left text-sm dark:bg-blue-950/20'>
              <div className='flex items-start gap-2'>
                <Calendar className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                <div>
                  <p className='font-semibold text-slate-900 dark:text-white'>
                    Your Demo Call
                  </p>
                  <p className='text-slate-600 dark:text-slate-400'>
                    {formData.preferredTime} (Nepal Time)
                  </p>
                </div>
              </div>
            </div>

            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Our team will reach out shortly. Check your email for the meeting
              link.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Schedule Your Demo</DialogTitle>
          <DialogDescription>
            Let's show you how DigitalDukan works. It takes just 30 minutes!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <div className='flex items-start gap-2 rounded-md bg-red-50 p-3 dark:bg-red-950/20'>
              <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400' />
              <p className='text-sm text-red-700 dark:text-red-400'>{error}</p>
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='name'>Full Name</Label>
            <Input
              id='name'
              name='name'
              placeholder='Your name'
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

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

          <div className='space-y-2'>
            <Label htmlFor='businessType'>Business Type (Optional)</Label>
            <Select
              value={formData.businessType}
              onValueChange={(value) =>
                handleSelectChange('businessType', value)
              }
              disabled={loading}
            >
              <SelectTrigger id='businessType'>
                <SelectValue placeholder='Select your business type' />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='preferredTime'>Preferred Time</Label>
            <Select
              value={formData.preferredTime}
              onValueChange={(value) =>
                handleSelectChange('preferredTime', value)
              }
              disabled={loading}
            >
              <SelectTrigger id='preferredTime'>
                <SelectValue placeholder='Select a time slot' />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='questions'>
              Questions or Specific Features? (Optional)
            </Label>
            <Textarea
              id='questions'
              name='questions'
              placeholder="Tell us what you'd like to see in the demo..."
              value={formData.questions}
              onChange={handleInputChange}
              disabled={loading}
              rows={3}
              className='resize-none'
            />
          </div>

          <div className='rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'>
            ✓ Free 30-minute demo • ✓ No obligations • ✓ You'll learn what works
            for you
          </div>

          <Button
            type='submit'
            className='w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700'
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Scheduling...
              </>
            ) : (
              'Schedule Demo Call'
            )}
          </Button>

          <Button
            type='button'
            variant='outline'
            className='w-full'
            onClick={onClose}
            disabled={loading}
          >
            Maybe Later
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
