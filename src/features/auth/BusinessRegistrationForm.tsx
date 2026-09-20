'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PhoneInputWithCountry from './components/PhoneInputWithCountry';
import {
  countryToCurrencyCode,
  setPreferredCurrencyCode
} from '@/lib/currency';
import { BUSINESS_TYPES } from '@/constants/data';

const businessFormSchema = z.object({
  companyName: z
    .string()
    .min(2, { message: 'Company name must be at least 2 characters' }),
  businessType: z.enum(
    [
      'retailer',
      'wholesaler',
      'manufacturer',
      'distributor',
      'service_provider',
      'e_commerce',
      'corporate',
      'nonprofit',
      'other'
    ],
    { message: 'Please select a business type' }
  ),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  address: z.string().min(5, { message: 'Please enter a valid address' }),
  city: z.string().min(2, { message: 'Please enter a city' }),
  state: z.string().min(2, { message: 'Please enter a state/province' }),
  country: z.string().min(2, { message: 'Please select a country' }),
  postalCode: z.string().min(2, { message: 'Please enter a postal code' }),
  taxNumber: z.string().optional(),
  website: z.string().url().optional().or(z.literal(''))
});

type BusinessFormData = z.infer<typeof businessFormSchema>;

interface BusinessRegistrationFormProps {
  userId: string;
  userEmail: string;
}

export function BusinessRegistrationForm({
  userId,
  userEmail
}: BusinessRegistrationFormProps) {
  const router = useRouter();
  const { user } = useUser(); // Get user data from Clerk
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const createAccountStatus = useMutation(
    api.accountStatus.createAccountStatus
  );
  const upsertUserProfile = useMutation(api.users.upsertUserProfile);
  const createCompanyFromRegistration = useMutation(
    api.companies.createCompanyFromRegistration
  );
  const upsertUserSettings = useMutation(api.settings.upsertUserSettings);

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      companyName: '',
      businessType: undefined,
      phone: '',
      address: '',
      city: '',
      state: '',
      country: 'IN',
      postalCode: '',
      taxNumber: '',
      website: ''
    }
  });

  // Load data from sessionStorage on mount
  useEffect(() => {
    const pendingDetails = sessionStorage.getItem('pendingBusinessDetails');
    if (pendingDetails) {
      try {
        const details = JSON.parse(pendingDetails);
        form.reset(details);
        sessionStorage.removeItem('pendingBusinessDetails');
      } catch (e) {
        console.error('Failed to load business details from storage', e);
      }
    }
  }, [form]);

  const handleSubmit = async (data: BusinessFormData) => {
    setIsLoading(true);
    try {
      // 1. Create account status - with business type provided by user
      await createAccountStatus({
        userId,
        businessType: data.businessType
      });

      // 2. Create/update user profile (firstName, lastName, username from Clerk)
      if (user?.firstName && user?.lastName) {
        await upsertUserProfile({
          email: userEmail,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username || user.firstName.toLowerCase()
        });
      }

      // Username is already stored in Convex via upsertUserProfile
      // No need to store in Clerk metadata

      // 3. Create company details entry (replaces organizationSettings)
      await createCompanyFromRegistration({
        userId,
        name: data.companyName,
        businessType: data.businessType,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        email: userEmail,
        taxNumber: data.taxNumber || '',
        website: data.website || ''
      });

      // 4. Create/update user settings (with defaults)
      const currencyCode = countryToCurrencyCode(data.country);

      await upsertUserSettings({
        language: 'en',
        currencyCode,
        dateFormat: 'DD/MM/YYYY',
        theme: 'light',
        emailNotifications: true,
        lowStockAlerts: true
      });

      setPreferredCurrencyCode(currencyCode);

      toast.success('Business registered successfully!');
      // Clear any registration markers from sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('isOAuthInProgress');
        sessionStorage.removeItem('currentSignUpAttempt');
      }

      setStep(2);
      // Go directly to dashboard - all data has been created
      router.push('/dashboard/overview');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Registration failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className='space-y-6 text-center'>
        <div className='flex justify-center'>
          <div className='rounded-full bg-green-100 p-4'>
            <CheckCircle2 className='h-12 w-12 text-green-600' />
          </div>
        </div>
        <div className='space-y-2'>
          <h2 className='text-2xl font-bold text-gray-900'>Setup Complete!</h2>
          <p className='text-gray-600'>
            Your business account has been successfully created. Get ready to
            manage your inventory like a pro!
          </p>
        </div>
        <div className='space-y-3 pt-4'>
          <Button
            onClick={() => router.push('/dashboard/overview')}
            size='lg'
            className='w-full'
          >
            Go to Dashboard <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        {/* Basic Info Section */}
        <div className='space-y-4'>
          <h3 className='font-semibold text-gray-900'>Basic Information</h3>

          <FormField
            control={form.control}
            name='companyName'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium'>
                  Company Name *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter your company name'
                    {...field}
                    className='h-10'
                  />
                </FormControl>
                <FormMessage className='text-xs' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='businessType'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium'>
                  Business Type *
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className='h-10'>
                      <SelectValue placeholder='Select business type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className='text-xs' />
              </FormItem>
            )}
          />
        </div>

        {/* Tax Information Section */}
        <div className='space-y-4'>
          <h3 className='font-semibold text-gray-900'>Tax Information</h3>

          <FormField
            control={form.control}
            name='taxNumber'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium'>
                  Tax Number
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='e.g., GST123456789'
                    {...field}
                    className='h-10'
                  />
                </FormControl>
                <FormMessage className='text-xs' />
              </FormItem>
            )}
          />
        </div>

        {/* Address Section */}
        <div className='space-y-4'>
          <h3 className='font-semibold text-gray-900'>Address</h3>

          <FormField
            control={form.control}
            name='address'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-medium'>
                  Street Address *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='123 Business Street'
                    {...field}
                    className='h-10'
                  />
                </FormControl>
                <FormMessage className='text-xs' />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='city'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium'>City *</FormLabel>
                  <FormControl>
                    <Input placeholder='Mumbai' {...field} className='h-10' />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='state'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium'>
                    State/Province *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Maharashtra'
                      {...field}
                      className='h-10'
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='country'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium'>
                    Country/Region *
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='h-10'>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='IN'>India</SelectItem>
                      <SelectItem value='US'>United States</SelectItem>
                      <SelectItem value='UK'>United Kingdom</SelectItem>
                      <SelectItem value='CA'>Canada</SelectItem>
                      <SelectItem value='AU'>Australia</SelectItem>
                      <SelectItem value='SG'>Singapore</SelectItem>
                      <SelectItem value='NZ'>New Zealand</SelectItem>
                      <SelectItem value='OTHER'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='postalCode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium'>
                    Postal Code *
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='400001' {...field} className='h-10' />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Contact Section */}
        <div className='space-y-4'>
          <h3 className='font-semibold text-gray-900'>Contact Information</h3>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium'>
                    Phone Number *
                  </FormLabel>
                  <FormControl>
                    <PhoneInputWithCountry
                      value={field.value}
                      onChange={field.onChange}
                      placeholder='Enter your phone number'
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='website'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-sm font-medium'>
                    Website (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='url'
                      placeholder='https://example.com'
                      {...field}
                      className='h-10'
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type='submit'
          disabled={isLoading}
          size='lg'
          className='mt-8 h-11 w-full font-semibold'
        >
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Setting up your business...
            </>
          ) : (
            <>
              Complete Registration <ArrowRight className='ml-2 h-4 w-4' />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
