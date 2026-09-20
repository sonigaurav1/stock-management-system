import { z } from 'zod';

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .refine((password) => /[a-z]/.test(password), {
    message: 'Password must contain at least one lowercase letter'
  })
  .refine((password) => /[A-Z]/.test(password), {
    message: 'Password must contain at least one uppercase letter'
  })
  .refine((password) => /[0-9]/.test(password), {
    message: 'Password must contain at least one number'
  })
  .refine((password) => /[!@#$%^&*]/.test(password), {
    message: 'Password must contain at least one special character (!@#$%^&*)'
  });

export const personalInfoSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: 'First name must be at least 2 characters' }),
    lastName: z
      .string()
      .min(2, { message: 'Last name must be at least 2 characters' }),
    username: z
      .string()
      .min(3, { message: 'Username must be at least 3 characters' })
      .max(30, { message: 'Username must be at most 30 characters' })
      .regex(/^[a-zA-Z0-9_-]+$/, {
        message:
          'Username can only contain letters, numbers, underscores, and hyphens'
      })
      .optional()
      .or(z.literal('')),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export const businessInfoSchema = z.object({
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

export type PersonalFormData = z.infer<typeof personalInfoSchema>;
export type BusinessFormData = z.infer<typeof businessInfoSchema>;
