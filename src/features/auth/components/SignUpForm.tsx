'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Loader2,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import PhoneInputWithCountry from './PhoneInputWithCountry';
import { useSignIn } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  countryToCurrencyCode,
  setPreferredCurrencyCode
} from '@/lib/currency';

// Password validation schema
const passwordSchema = z
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

const personalInfoSchema = z
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

const businessInfoSchema = z.object({
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

type PersonalFormData = z.infer<typeof personalInfoSchema>;
type BusinessFormData = z.infer<typeof businessInfoSchema>;

// Password strength checker
interface PasswordStrength {
  hasLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

interface InvitationData {
  _id: string;
  email: string;
  displayName: string;
  role: string;
  invitedBy: string;
  invitedAt: number;
  expiresAt?: number;
  // Business details from server (read-only on client)
  companyName?: string;
  companyGST?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessCity?: string;
  businessState?: string;
  businessCountry?: string;
  businessPostalCode?: string;
  businessType?: string;
}

// Helper to check if invitation has complete business data (all required fields filled)
function hasInvitationBusinessData(
  invitation: InvitationData | null | undefined
): boolean {
  if (!invitation) return false;
  return !!(
    invitation.companyName &&
    invitation.businessType &&
    invitation.businessPhone &&
    invitation.businessAddress &&
    invitation.businessCity &&
    invitation.businessState &&
    invitation.businessCountry &&
    invitation.businessPostalCode
  );
}

interface SignUpFormProps {
  invitation?: InvitationData | null;
  companyInvitationId?: string | null;
}

const checkPasswordStrength = (password: string): PasswordStrength => {
  return {
    hasLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password)
  };
};

const getPasswordStrengthLevel = (
  strength: PasswordStrength
): { level: number; label: string; color: string } => {
  const checkedItems = Object.values(strength).filter(Boolean).length;

  if (checkedItems <= 2) {
    return { level: 1, label: 'Weak', color: 'bg-red-500' };
  } else if (checkedItems === 3) {
    return { level: 2, label: 'Fair', color: 'bg-yellow-500' };
  } else if (checkedItems === 4) {
    return { level: 3, label: 'Good', color: 'bg-amber-500' };
  } else {
    return { level: 4, label: 'Strong', color: 'bg-green-500' };
  }
};

const BUSINESS_TYPES = [
  { value: 'retailer', label: 'Retailer' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'service_provider', label: 'Service Provider' },
  { value: 'e_commerce', label: 'E-Commerce' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'nonprofit', label: 'Non-Profit' },
  { value: 'other', label: 'Other' }
];

const COUNTRIES = [
  { value: 'AF', label: 'Afghanistan' },
  { value: 'AL', label: 'Albania' },
  { value: 'DZ', label: 'Algeria' },
  { value: 'AO', label: 'Angola' },
  { value: 'AR', label: 'Argentina' },
  { value: 'AM', label: 'Armenia' },
  { value: 'AU', label: 'Australia' },
  { value: 'AT', label: 'Austria' },
  { value: 'AZ', label: 'Azerbaijan' },
  { value: 'BS', label: 'Bahamas' },
  { value: 'BH', label: 'Bahrain' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'BB', label: 'Barbados' },
  { value: 'BY', label: 'Belarus' },
  { value: 'BE', label: 'Belgium' },
  { value: 'BZ', label: 'Belize' },
  { value: 'BJ', label: 'Benin' },
  { value: 'BT', label: 'Bhutan' },
  { value: 'BO', label: 'Bolivia' },
  { value: 'BA', label: 'Bosnia and Herzegovina' },
  { value: 'BW', label: 'Botswana' },
  { value: 'BR', label: 'Brazil' },
  { value: 'BN', label: 'Brunei' },
  { value: 'BG', label: 'Bulgaria' },
  { value: 'BF', label: 'Burkina Faso' },
  { value: 'BI', label: 'Burundi' },
  { value: 'KH', label: 'Cambodia' },
  { value: 'CM', label: 'Cameroon' },
  { value: 'CA', label: 'Canada' },
  { value: 'CV', label: 'Cape Verde' },
  { value: 'CF', label: 'Central African Republic' },
  { value: 'TD', label: 'Chad' },
  { value: 'CL', label: 'Chile' },
  { value: 'CN', label: 'China' },
  { value: 'CO', label: 'Colombia' },
  { value: 'KM', label: 'Comoros' },
  { value: 'CG', label: 'Congo' },
  { value: 'CD', label: 'Congo (Democratic Republic)' },
  { value: 'CR', label: 'Costa Rica' },
  { value: 'HR', label: 'Croatia' },
  { value: 'CU', label: 'Cuba' },
  { value: 'CY', label: 'Cyprus' },
  { value: 'CZ', label: 'Czech Republic' },
  { value: 'DK', label: 'Denmark' },
  { value: 'DJ', label: 'Djibouti' },
  { value: 'DM', label: 'Dominica' },
  { value: 'DO', label: 'Dominican Republic' },
  { value: 'EC', label: 'Ecuador' },
  { value: 'EG', label: 'Egypt' },
  { value: 'SV', label: 'El Salvador' },
  { value: 'GQ', label: 'Equatorial Guinea' },
  { value: 'ER', label: 'Eritrea' },
  { value: 'EE', label: 'Estonia' },
  { value: 'SZ', label: 'Eswatini' },
  { value: 'ET', label: 'Ethiopia' },
  { value: 'FJ', label: 'Fiji' },
  { value: 'FI', label: 'Finland' },
  { value: 'FR', label: 'France' },
  { value: 'GA', label: 'Gabon' },
  { value: 'GM', label: 'Gambia' },
  { value: 'GE', label: 'Georgia' },
  { value: 'DE', label: 'Germany' },
  { value: 'GH', label: 'Ghana' },
  { value: 'GR', label: 'Greece' },
  { value: 'GT', label: 'Guatemala' },
  { value: 'GN', label: 'Guinea' },
  { value: 'GW', label: 'Guinea-Bissau' },
  { value: 'GY', label: 'Guyana' },
  { value: 'HT', label: 'Haiti' },
  { value: 'HN', label: 'Honduras' },
  { value: 'HU', label: 'Hungary' },
  { value: 'IS', label: 'Iceland' },
  { value: 'IN', label: 'India' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'IR', label: 'Iran' },
  { value: 'IQ', label: 'Iraq' },
  { value: 'IE', label: 'Ireland' },
  { value: 'IL', label: 'Israel' },
  { value: 'IT', label: 'Italy' },
  { value: 'JM', label: 'Jamaica' },
  { value: 'JP', label: 'Japan' },
  { value: 'JO', label: 'Jordan' },
  { value: 'KZ', label: 'Kazakhstan' },
  { value: 'KE', label: 'Kenya' },
  { value: 'KW', label: 'Kuwait' },
  { value: 'KG', label: 'Kyrgyzstan' },
  { value: 'LA', label: 'Laos' },
  { value: 'LV', label: 'Latvia' },
  { value: 'LB', label: 'Lebanon' },
  { value: 'LS', label: 'Lesotho' },
  { value: 'LR', label: 'Liberia' },
  { value: 'LY', label: 'Libya' },
  { value: 'LT', label: 'Lithuania' },
  { value: 'LU', label: 'Luxembourg' },
  { value: 'MG', label: 'Madagascar' },
  { value: 'MW', label: 'Malawi' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'MV', label: 'Maldives' },
  { value: 'ML', label: 'Mali' },
  { value: 'MT', label: 'Malta' },
  { value: 'MR', label: 'Mauritania' },
  { value: 'MU', label: 'Mauritius' },
  { value: 'MX', label: 'Mexico' },
  { value: 'MD', label: 'Moldova' },
  { value: 'MN', label: 'Mongolia' },
  { value: 'ME', label: 'Montenegro' },
  { value: 'MA', label: 'Morocco' },
  { value: 'MZ', label: 'Mozambique' },
  { value: 'MM', label: 'Myanmar' },
  { value: 'NA', label: 'Namibia' },
  { value: 'NP', label: 'Nepal' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'NI', label: 'Nicaragua' },
  { value: 'NE', label: 'Niger' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'KP', label: 'North Korea' },
  { value: 'MK', label: 'North Macedonia' },
  { value: 'NO', label: 'Norway' },
  { value: 'OM', label: 'Oman' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'PS', label: 'Palestine' },
  { value: 'PA', label: 'Panama' },
  { value: 'PG', label: 'Papua New Guinea' },
  { value: 'PY', label: 'Paraguay' },
  { value: 'PE', label: 'Peru' },
  { value: 'PH', label: 'Philippines' },
  { value: 'PL', label: 'Poland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'QA', label: 'Qatar' },
  { value: 'RO', label: 'Romania' },
  { value: 'RU', label: 'Russia' },
  { value: 'RW', label: 'Rwanda' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'SN', label: 'Senegal' },
  { value: 'RS', label: 'Serbia' },
  { value: 'SL', label: 'Sierra Leone' },
  { value: 'SG', label: 'Singapore' },
  { value: 'SK', label: 'Slovakia' },
  { value: 'SI', label: 'Slovenia' },
  { value: 'SO', label: 'Somalia' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'KR', label: 'South Korea' },
  { value: 'SS', label: 'South Sudan' },
  { value: 'ES', label: 'Spain' },
  { value: 'LK', label: 'Sri Lanka' },
  { value: 'SD', label: 'Sudan' },
  { value: 'SR', label: 'Suriname' },
  { value: 'SE', label: 'Sweden' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'SY', label: 'Syria' },
  { value: 'TW', label: 'Taiwan' },
  { value: 'TJ', label: 'Tajikistan' },
  { value: 'TZ', label: 'Tanzania' },
  { value: 'TH', label: 'Thailand' },
  { value: 'TL', label: 'Timor-Leste' },
  { value: 'TG', label: 'Togo' },
  { value: 'TT', label: 'Trinidad and Tobago' },
  { value: 'TN', label: 'Tunisia' },
  { value: 'TR', label: 'Turkey' },
  { value: 'TM', label: 'Turkmenistan' },
  { value: 'UG', label: 'Uganda' },
  { value: 'UA', label: 'Ukraine' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'UZ', label: 'Uzbekistan' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'VN', label: 'Vietnam' },
  { value: 'YE', label: 'Yemen' },
  { value: 'ZM', label: 'Zambia' },
  { value: 'ZW', label: 'Zimbabwe' }
];

// Get user's country - dynamic detection
function getDefaultCountry(): string {
  return 'NP'; // Default to Nepal, user can change in form
}

export default function SignUpForm({
  invitation,
  companyInvitationId
}: SignUpFormProps = {}) {
  const router = useRouter();
  const { handleSignUp } = useAuth();
  const { signIn, isLoaded } = useSignIn();
  const [step, setStep] = useState(invitation ? 1 : 1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [personalData, setPersonalData] = useState<PersonalFormData | null>(
    null
  );
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false
  });

  // Check if Google auth is enabled
  const isGoogleAuthEnabled =
    process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === 'true';

  // Check if invitation exists (any invitation means read-only business details)
  const isInvitedUser = !!invitation;

  // Username validation state
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameValidation, setUsernameValidation] = useState<{
    available: boolean;
    message: string;
    suggestions: string[];
  } | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailValidation, setEmailValidation] = useState<{
    available: boolean;
    message: string;
  } | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Convex mutations for saving business details
  const createAccountStatus = useMutation(
    api.accountStatus.createAccountStatus
  );
  const upsertUserProfile = useMutation(api.users.upsertUserProfile);
  const createCompanyFromRegistration = useMutation(
    api.companies.createCompanyFromRegistration
  );
  const upsertUserSettings = useMutation(api.settings.upsertUserSettings);
  const acceptCompanyInvitation = useMutation(
    api.companyAccess.acceptInvitation
  );

  // Check username availability query
  const checkUsernameAvailability = useQuery(
    api.users.checkUsernameAvailability,
    usernameInput.trim().length >= 3 ? { username: usernameInput } : 'skip'
  );

  const checkEmailAvailability = useQuery(
    (api.users as any).checkEmailAvailability,
    // Skip email check for invited users (email is pre-assigned by owner)
    isInvitedUser || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())
      ? 'skip'
      : { email: emailInput }
  );

  const personalForm = useForm<PersonalFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: invitation?.email || '', // Pre-filled from invitation (owner assigned)
      password: '',
      confirmPassword: ''
    }
  });

  const businessForm = useForm<BusinessFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      companyName: invitation?.companyName || '',
      businessType: (invitation?.businessType as any) || undefined,
      phone: invitation?.businessPhone || '',
      address: invitation?.businessAddress || '',
      city: invitation?.businessCity || '',
      state: invitation?.businessState || '',
      country: invitation?.businessCountry || 'NP',
      postalCode: invitation?.businessPostalCode || '',
      taxNumber: invitation?.companyGST || '',
      website: ''
    }
  });

  // Pre-fill form with server-side business details from invitation
  useEffect(() => {
    if (!invitation) return;
    businessForm.setValue('companyName', invitation.companyName || '');
    if (
      invitation.businessType &&
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
      ].includes(invitation.businessType)
    ) {
      businessForm.setValue('businessType', invitation.businessType as any);
    }
    businessForm.setValue('phone', invitation.businessPhone || '');
    businessForm.setValue('address', invitation.businessAddress || '');
    businessForm.setValue('city', invitation.businessCity || '');
    businessForm.setValue('state', invitation.businessState || '');
    businessForm.setValue('country', invitation.businessCountry || 'NP');
    businessForm.setValue('postalCode', invitation.businessPostalCode || '');
    businessForm.setValue('taxNumber', invitation.companyGST || '');
  }, [invitation, businessForm]);

  // Set mount state and default country on mount
  useEffect(() => {
    setIsMounted(true);
    // Only set default country if there's no invitation (preserve pre-filled data)
    if (!invitation) {
      businessForm.setValue('country', getDefaultCountry());
    }
    setEmailInput(personalForm.getValues('email'));
  }, [businessForm, invitation]);

  // Update username validation when query result changes
  useEffect(() => {
    if (checkUsernameAvailability === undefined) {
      setIsCheckingUsername(true);
    } else if (checkUsernameAvailability) {
      setUsernameValidation(checkUsernameAvailability);
      setIsCheckingUsername(false);
    }
  }, [checkUsernameAvailability]);

  // Update email validation when query result changes
  useEffect(() => {
    const trimmedEmail = emailInput.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    if (!trimmedEmail) {
      setEmailValidation(null);
      setIsCheckingEmail(false);
      return;
    }

    if (!isValidEmail) {
      setEmailValidation(null);
      setIsCheckingEmail(false);
      return;
    }

    if (checkEmailAvailability === undefined) {
      setIsCheckingEmail(true);
      return;
    }

    setEmailValidation(checkEmailAvailability as any);
    setIsCheckingEmail(false);
  }, [checkEmailAvailability, emailInput]);

  const onPersonalSubmit = async (data: PersonalFormData) => {
    // Skip email validation check for invited users (email is pre-assigned by owner)
    if (!isInvitedUser && emailValidation && !emailValidation.available) {
      personalForm.setError('email', {
        type: 'manual',
        message: emailValidation.message
      });
      personalForm.setFocus('email');
      return;
    }

    setPersonalData(data);
    setStep(2);
  };

  // Google OAuth Sign Up - Uses signIn for OAuth (Clerk handles user creation automatically)
  const handleGoogleSignUp = async () => {
    if (!isLoaded || !signIn) {
      toast.error('Sign-up service not available');
      return;
    }

    setIsLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    try {
      // Mark that we're starting OAuth so company-registration page knows to wait
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('isOAuthInProgress', 'true');
      }

      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${baseUrl}/company-registration`,
        redirectUrlComplete: `${baseUrl}/company-registration`
      });
    } catch (err: unknown) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('isOAuthInProgress');
      }
      if (process.env.NODE_ENV !== 'production') {
        console.error('Google sign-up error:', err);
      }
      const errorMessage =
        err instanceof Error ? err.message : 'Google sign-up failed';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const onBusinessSubmit = async (data: BusinessFormData) => {
    if (!personalData) {
      toast.error('Personal data not found. Please go back and try again.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting form-based signup with business details...');

      // handleSignUp now returns the userId along with success status
      const result = await handleSignUp(
        personalData.email,
        personalData.password,
        personalData.firstName,
        personalData.lastName,
        personalData.username ?? '',
        'Owner'
      );

      // If signup failed, don't proceed
      if (!result || !result.success) {
        setIsLoading(false);
        console.warn('Sign-up failed - user will see error toast');
        return;
      }

      if (!result.userId) {
        setIsLoading(false);
        console.warn('Sign-up succeeded but no userId returned');
        toast.error('Account created but user ID is missing');
        return;
      }

      const userId: string = result.userId;
      console.log('Sign-up successful, userId:', userId);
      console.log('Saving business details...');

      // Now save the business details for form-based signup
      try {
        // 1. Create account status
        await createAccountStatus({
          userId,
          businessType: data.businessType
        });

        // 2. Create/update user profile
        await upsertUserProfile({
          email: personalData.email,
          firstName: personalData.firstName,
          lastName: personalData.lastName,
          username:
            personalData.username || personalData.firstName.toLowerCase()
        });

        // For invited users: Accept invitation and join existing organization
        if ((isInvitedUser && invitation) || companyInvitationId) {
          // Accept the invitation using the correct email-based approach
          // (invitation._id is from companyMembers table, not invitations table)
          if (isInvitedUser && invitation) {
            await acceptCompanyInvitation({
              email: invitation.email || personalData.email
            });
          }

          // Accept additional companyAccess invitation if present
          if (companyInvitationId) {
            await acceptCompanyInvitation({
              email: personalData.email
            });
          }

          // Create user profile
          await upsertUserProfile({
            email: personalData.email,
            firstName: personalData.firstName,
            lastName: personalData.lastName,
            username:
              personalData.username || personalData.firstName.toLowerCase()
          });

          // Get default settings currency
          const currencyCode = countryToCurrencyCode(data.country);

          // Create/update user settings
          await upsertUserSettings({
            language: 'en',
            currencyCode,
            dateFormat: 'DD/MM/YYYY',
            theme: 'light',
            emailNotifications: true,
            lowStockAlerts: true
          });

          setPreferredCurrencyCode(currencyCode);

          console.log('Invitation accepted successfully');
          toast.success('Account created! Joining team...');

          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('userJustSignedSignedUp');
            sessionStorage.removeItem('isOAuthInProgress');
            sessionStorage.removeItem('currentSignUpAttempt');
          }

          router.push('/dashboard');
        } else {
          // 3. Create company from registration (for new users signing up)
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
            email: personalData.email,
            taxNumber: data.taxNumber || '',
            website: data.website || ''
          });

          // 4. Create/update user settings
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

          console.log('Business details saved successfully');

          toast.success('Account created! Redirecting to dashboard...');

          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('userJustSignedUp');
            sessionStorage.removeItem('isOAuthInProgress');
            sessionStorage.removeItem('currentSignUpAttempt');
          }

          // Go directly to dashboard - all data has been created
          router.push('/dashboard/overview');
        }
      } catch (businessError) {
        console.error('Error saving business details:', businessError);
        toast.error(
          businessError instanceof Error
            ? businessError.message
            : 'Failed to save business details'
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Unexpected error in onBusinessSubmit:', error);
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className='mx-auto w-full max-w-md'>
      {/* Step Indicator */}
      <div className='mb-8 flex items-center justify-center gap-2'>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-colors ${
            step >= 1
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          1
        </div>
        <div
          className={`h-1 w-12 rounded-full transition-colors ${
            step >= 2 ? 'bg-primary' : 'bg-muted'
          }`}
        />
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-colors ${
            step >= 2
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          2
        </div>
      </div>

      {/* Step Titles */}
      {step === 1 ? (
        <div className='mb-6 text-center'>
          <h2 className='text-2xl font-bold'>Create Your Account</h2>
          <p className='mt-2 text-sm text-muted-foreground'>
            Enter your personal information to get started
          </p>
        </div>
      ) : (
        <div className='mb-6 text-center'>
          <h2 className='text-2xl font-bold'>Business Information</h2>
          <p className='mt-2 text-sm text-muted-foreground'>
            Tell us about your business
          </p>
        </div>
      )}

      {/* Step 1: Personal Information */}
      {step === 1 && (
        <Form {...personalForm}>
          <form
            onSubmit={personalForm.handleSubmit(onPersonalSubmit)}
            className='space-y-4'
          >
            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={personalForm.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs font-semibold after:ml-0.5 after:text-red-500 after:content-["*"]'>
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='John' {...field} className='h-10' />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
              <FormField
                control={personalForm.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs font-semibold after:ml-0.5 after:text-red-500 after:content-["*"]'>
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='Doe' {...field} className='h-10' />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={personalForm.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs font-semibold after:ml-0.5 after:text-red-500 after:content-["*"]'>
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <div className='space-y-2'>
                      <div className='relative'>
                        <Input
                          type='email'
                          placeholder='john@example.com'
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setEmailInput(e.target.value);
                            personalForm.clearErrors('email');
                          }}
                          className='h-10'
                          autoComplete='email'
                          disabled={isInvitedUser}
                          readOnly={isInvitedUser}
                        />

                        {isCheckingEmail && (
                          <Loader2 className='absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground' />
                        )}

                        {!isCheckingEmail && emailValidation && (
                          <div className='absolute right-3 top-2.5'>
                            {emailValidation.available ? (
                              <Check className='h-5 w-5 text-green-500' />
                            ) : (
                              <X className='h-5 w-5 text-red-500' />
                            )}
                          </div>
                        )}
                      </div>

                      {!personalForm.formState.errors.email &&
                        emailValidation && (
                          <div
                            className={`text-xs ${
                              emailValidation.available
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {emailValidation.message}
                          </div>
                        )}
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={personalForm.control}
              name='password'
              render={({ field }) => {
                const strength = checkPasswordStrength(field.value);
                const strengthLevel = getPasswordStrengthLevel(strength);

                return (
                  <FormItem>
                    <FormLabel className='text-xs font-semibold after:ml-0.5 after:text-red-500 after:content-["*"]'>
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className='space-y-2'>
                        <div className='relative'>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder='••••••••'
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setPasswordStrength(
                                checkPasswordStrength(e.target.value)
                              );
                            }}
                            className='h-10 pr-10'
                            autoComplete='new-password'
                          />
                          <button
                            type='button'
                            onClick={() => setShowPassword(!showPassword)}
                            className='absolute inset-y-0 right-0 flex items-center justify-center pr-3 text-muted-foreground hover:text-foreground'
                          >
                            {showPassword ? (
                              <EyeOff className='h-4 w-4' />
                            ) : (
                              <Eye className='h-4 w-4' />
                            )}
                          </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {field.value && (
                          <div className='space-y-2'>
                            {/* Strength Bar */}
                            <div className='flex items-center gap-2'>
                              <div className='flex flex-1 gap-1'>
                                {[1, 2, 3, 4].map((i) => (
                                  <div
                                    key={i}
                                    className={`h-1 flex-1 rounded-full transition-colors ${
                                      i <= strengthLevel.level
                                        ? strengthLevel.color
                                        : 'bg-muted'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span
                                className={`text-xs font-semibold ${
                                  strengthLevel.label === 'Weak'
                                    ? 'text-red-600'
                                    : strengthLevel.label === 'Fair'
                                      ? 'text-yellow-600'
                                      : strengthLevel.label === 'Good'
                                        ? 'text-amber-600'
                                        : 'text-green-600'
                                }`}
                              >
                                {strengthLevel.label}
                              </span>
                            </div>

                            {/* Requirements Checklist */}
                            <div className='space-y-1 text-xs'>
                              <div
                                className={`flex items-center gap-2 ${strength.hasLength ? 'text-green-600' : 'text-muted-foreground'}`}
                              >
                                {strength.hasLength ? (
                                  <Check className='h-3 w-3' />
                                ) : (
                                  <X className='h-3 w-3' />
                                )}
                                <span>At least 8 characters</span>
                              </div>
                              <div
                                className={`flex items-center gap-2 ${strength.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}`}
                              >
                                {strength.hasUppercase ? (
                                  <Check className='h-3 w-3' />
                                ) : (
                                  <X className='h-3 w-3' />
                                )}
                                <span>One uppercase letter (A-Z)</span>
                              </div>
                              <div
                                className={`flex items-center gap-2 ${strength.hasLowercase ? 'text-green-600' : 'text-muted-foreground'}`}
                              >
                                {strength.hasLowercase ? (
                                  <Check className='h-3 w-3' />
                                ) : (
                                  <X className='h-3 w-3' />
                                )}
                                <span>One lowercase letter (a-z)</span>
                              </div>
                              <div
                                className={`flex items-center gap-2 ${strength.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}
                              >
                                {strength.hasNumber ? (
                                  <Check className='h-3 w-3' />
                                ) : (
                                  <X className='h-3 w-3' />
                                )}
                                <span>One number (0-9)</span>
                              </div>
                              <div
                                className={`flex items-center gap-2 ${strength.hasSpecial ? 'text-green-600' : 'text-muted-foreground'}`}
                              >
                                {strength.hasSpecial ? (
                                  <Check className='h-3 w-3' />
                                ) : (
                                  <X className='h-3 w-3' />
                                )}
                                <span>One special character (!@#$%^&*)</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={personalForm.control}
              name='confirmPassword'
              render={({ field }) => {
                const password = personalForm.watch('password');
                const confirmPassword = field.value;
                const passwordsMatch =
                  password && confirmPassword && password === confirmPassword;

                return (
                  <FormItem>
                    <FormLabel className='text-xs font-semibold after:ml-0.5 after:text-red-500 after:content-["*"]'>
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className='space-y-2'>
                        <div className='relative'>
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder='••••••••'
                            {...field}
                            className='h-10 pr-10'
                            autoComplete='new-password'
                          />
                          <button
                            type='button'
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className='absolute inset-y-0 right-0 flex items-center justify-center pr-3 text-muted-foreground hover:text-foreground'
                          >
                            {showConfirmPassword ? (
                              <EyeOff className='h-4 w-4' />
                            ) : (
                              <Eye className='h-4 w-4' />
                            )}
                          </button>
                        </div>
                        {confirmPassword && passwordsMatch && (
                          <div className='flex items-center gap-2 text-xs text-green-600'>
                            <Check className='h-3 w-3' />
                            <span>Passwords match</span>
                          </div>
                        )}
                        {confirmPassword && !passwordsMatch && (
                          <div className='flex items-center gap-2 text-xs text-red-600'>
                            <X className='h-3 w-3' />
                            <span>Passwords do not match</span>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={personalForm.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs font-semibold'>
                    Username{' '}
                    {/* <span className='text-muted-foreground'>
                      (for @mentions)
                    </span> */}
                  </FormLabel>
                  <FormControl>
                    <div className='space-y-2'>
                      <div className='relative'>
                        <Input
                          placeholder='john_doe'
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setUsernameInput(e.target.value);
                          }}
                          className='h-10'
                          autoComplete='username'
                        />
                        {isCheckingUsername && (
                          <Loader2 className='absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground' />
                        )}
                        {!isCheckingUsername && usernameValidation && (
                          <div className='absolute right-3 top-2.5'>
                            {usernameValidation.available ? (
                              <Check className='h-5 w-5 text-green-500' />
                            ) : (
                              <X className='h-5 w-5 text-red-500' />
                            )}
                          </div>
                        )}
                      </div>

                      {usernameValidation && (
                        <div
                          className={`text-xs ${
                            usernameValidation.available
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {usernameValidation.message}
                        </div>
                      )}

                      {usernameValidation &&
                        !usernameValidation.available &&
                        usernameValidation.suggestions.length > 0 && (
                          <div className='space-y-2'>
                            <p className='text-xs font-medium text-muted-foreground'>
                              Try one of these:
                            </p>
                            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                              {usernameValidation.suggestions.map(
                                (suggestion) => (
                                  <button
                                    key={suggestion}
                                    type='button'
                                    onClick={() => {
                                      personalForm.setValue(
                                        'username',
                                        suggestion
                                      );
                                      setUsernameInput(suggestion);
                                    }}
                                    className='truncate rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100'
                                  >
                                    {suggestion}
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      <p className='text-xs text-muted-foreground'>
                        3-30 characters: letters, numbers, underscores, and
                        hyphens
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <Button type='submit' className='mt-6 h-10 w-full font-semibold'>
              Continue <ChevronRight className='ml-2 h-4 w-4' />
            </Button>
          </form>
        </Form>
      )}

      {/* Step 2: Business Information */}
      {step === 2 && (
        <Form {...businessForm}>
          <form
            onSubmit={businessForm.handleSubmit(onBusinessSubmit)}
            className='space-y-4'
          >
            {invitation && (
              <div className='rounded-md border bg-muted/50 p-3 text-sm'>
                <p className='font-medium'>Joining: {invitation.companyName}</p>
                <p className='text-muted-foreground'>
                  Business details are pre-filled and locked for your security.
                </p>
              </div>
            )}
            <FormField
              control={businessForm.control}
              name='companyName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='after:text-md text-xs font-semibold after:ml-0.5 after:text-red-500 after:content-["*"]'>
                    Company Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Your Company Ltd'
                      {...field}
                      className='h-10'
                      disabled={isInvitedUser}
                      readOnly={isInvitedUser}
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={businessForm.control}
              name='businessType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='after:text-md text-xs font-semibold after:ml-0.5 after:text-red-500 after:content-["*"]'>
                    Business Type
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isInvitedUser}
                  >
                    <FormControl>
                      <SelectTrigger className='h-10'>
                        <SelectValue placeholder='Select business type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUSINESS_TYPES.map((type) => (
                        <SelectItem
                          className='cursor-pointer'
                          key={type.value}
                          value={type.value}
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={businessForm.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='after:text-md text-xs font-semibold after:ml-0.5 after:text-red-500 after:content-["*"]'>
                    Phone Number *
                  </FormLabel>
                  <FormControl>
                    <PhoneInputWithCountry
                      value={field.value}
                      onChange={field.onChange}
                      placeholder='Enter your phone number'
                      disabled={isInvitedUser}
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={businessForm.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='after:text-md text-xs font-semibold after:ml-0.5 after:text-red-500 after:content-["*"]'>
                    Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='123 Main Street'
                      {...field}
                      className='h-10'
                      disabled={isInvitedUser}
                      readOnly={isInvitedUser}
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={businessForm.control}
                name='city'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='after:text-md text-xs font-semibold after:ml-0.5 after:text-red-500 after:content-["*"]'>
                      City
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='New York'
                        {...field}
                        className='h-10'
                        disabled={isInvitedUser}
                        readOnly={isInvitedUser}
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
              <FormField
                control={businessForm.control}
                name='state'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='after:text-md text-xs font-semibold after:ml-0.5 after:text-red-500 after:content-["*"]'>
                      State
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='State/Province'
                        {...field}
                        className='h-10'
                        disabled={isInvitedUser}
                        readOnly={isInvitedUser}
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={businessForm.control}
                name='country'
                render={({ field }) => {
                  const selectedCountry = COUNTRIES.find(
                    (c) => c.value === field.value
                  );

                  return (
                    <FormItem>
                      <FormLabel className='after:text-md text-xs font-semibold after:ml-0.5 after:text-red-500 after:content-["*"]'>
                        Country
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            className='h-10 w-full justify-between'
                            disabled={isInvitedUser}
                          >
                            <span className='text-sm'>
                              {selectedCountry?.label || 'Select a country'}
                            </span>
                            <ChevronDown className='h-4 w-4 opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-full p-0'>
                          <Command>
                            <CommandInput
                              placeholder='Search country...'
                              className='h-9'
                            />
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandList>
                              <CommandGroup>
                                {COUNTRIES.map((country) => (
                                  <CommandItem
                                    key={country.value}
                                    value={`${country.label} ${country.value}`}
                                    onSelect={() => {
                                      field.onChange(country.value);
                                    }}
                                  >
                                    {country.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage className='text-xs' />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={businessForm.control}
                name='postalCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='after:text-md text-xs font-semibold after:ml-0.5 after:text-red-500 after:content-["*"]'>
                      Postal Code
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='12345'
                        {...field}
                        className='h-10'
                        disabled={isInvitedUser}
                        readOnly={isInvitedUser}
                      />
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={businessForm.control}
              name='taxNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs font-semibold'>
                    Tax Number (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Tax Number'
                      {...field}
                      className='h-10'
                      disabled={isInvitedUser}
                      readOnly={isInvitedUser}
                    />
                  </FormControl>
                  <FormMessage className='text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={businessForm.control}
              name='website'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-xs font-semibold'>
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

            {/* Clerk Smart CAPTCHA Widget */}
            <div id='clerk-captcha' className='my-4' />

            <div className='flex gap-3 pt-4'>
              <Button
                type='button'
                variant='outline'
                className='h-10 w-full'
                onClick={() => setStep(1)}
              >
                <ChevronLeft className='mr-2 h-4 w-4' /> Back
              </Button>
              <Button
                type='submit'
                disabled={isLoading}
                className='h-10 w-full font-semibold'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />{' '}
                    Creating...
                  </>
                ) : (
                  <>
                    Complete Setup <ChevronRight className='ml-2 h-4 w-4' />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Google Sign-up - Conditional */}
      {isGoogleAuthEnabled && (
        <>
          {/* Divider */}
          <div className='relative my-6'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-border' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-background px-2 text-muted-foreground'>
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type='button'
            variant='outline'
            className='h-10 w-full font-medium'
            disabled={!isMounted || !isLoaded || isLoading}
            onClick={handleGoogleSignUp}
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Signing up...
              </>
            ) : (
              <>
                <svg
                  className='mr-2 h-4 w-4'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                >
                  <path
                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    fill='#4285F4'
                  />
                  <path
                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    fill='#34A853'
                  />
                  <path
                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    fill='#FBBC05'
                  />
                  <path
                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    fill='#EA4335'
                  />
                </svg>
                Sign up with Google
              </>
            )}
          </Button>
        </>
      )}

      {/* Sign In Link */}
      <p className='mt-6 text-center text-sm text-muted-foreground'>
        Already have an account?{' '}
        <a
          href='/sign-in'
          className='font-semibold text-primary underline underline-offset-4 hover:text-primary/90'
        >
          Sign in
        </a>
      </p>
    </div>
  );
}
