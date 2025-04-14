/* eslint-disable import/no-unresolved */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Globe,
  Receipt,
  Package,
  ReceiptText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FormData {
  companyName: string;
  companyAddress: string;
  phone: string[];
  email: string;
  vatNumber: string;
  processedBy?: string; // User who generated the invoice
  urls: { id: number; value: string }[];
}

export default function CompanyDetailsForm() {
  const router = useRouter();
  const { user } = useUser();

  const createCompanyDetails = useMutation(
    api.companyDetails.createCompanyDetails
  );
  const companyDetails = useQuery(api.companyDetails.getCompanyDetails, {
    userId: user?.id ?? ''
  });

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    companyAddress: '',
    phone: [''],
    email: '',
    vatNumber: '',
    processedBy: '', // User who generated the invoice
    urls: [{ id: 1, value: '' }]
  });

  // Populate form with existing data when available
  useEffect(() => {
    if (companyDetails) {
      setFormData({
        companyName: companyDetails.companyName,
        companyAddress: companyDetails.companyAddress,
        phone: companyDetails.phone,
        email: companyDetails.email,
        vatNumber: companyDetails.vatNumber,
        processedBy: companyDetails.processedBy,
        urls: companyDetails.urls
      });
    }
  }, [companyDetails]);

  const handlePhoneChange = (index: any, value: any) => {
    const newPhone = [...formData.phone];
    newPhone[index] = value;
    setFormData({ ...formData, phone: newPhone });
  };

  const addPhoneField = () => {
    setFormData({ ...formData, phone: [...formData.phone, ''] });
  };

  const handleUrlChange = (index: any, value: any) => {
    const newUrls = [...formData.urls];
    newUrls[index].value = value;
    setFormData({ ...formData, urls: newUrls });
  };

  const addUrlField = () => {
    const newUrls = [...formData.urls];
    newUrls.push({ id: newUrls.length + 1, value: '' });
    setFormData({ ...formData, urls: newUrls });
  };

  interface UpdateClerkMetadataPayload {
    userId: string | undefined;
    isVerified: boolean;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateClerkMetadata = async (
        payload: UpdateClerkMetadataPayload
      ) => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/verify`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
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

      await createCompanyDetails({
        ...formData,
        isDeleted: false,
        createdAt: Date.now()
      });

      await updateClerkMetadata({
        userId: user?.id,
        isVerified: false
      });
      router.push('/verify');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating company details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollArea className='h-screen w-full'>
      <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-12 pt-6 dark:from-slate-950 dark:to-slate-900'>
        {/* Brand header */}
        <div className='pb-4 text-center'>
          <div className='mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
            <Package className='h-8 w-8 text-primary' />
          </div>
          <h1 className='text-2xl font-bold'>Inventory Management System</h1>
          <p className='text-sm text-muted-foreground'>
            Effortlessly manage your business inventory
          </p>
        </div>

        <div className='px-6 pb-4 text-center'>
          <p className='text-sm italic text-muted-foreground'>
            Note: Your company details can be edited anytime through the
            settings page after registration.
          </p>
        </div>

        <Card className='mx-auto max-w-4xl shadow-lg'>
          <CardHeader className='space-y-1 border-b pb-6'>
            <CardTitle className='flex items-center gap-2 text-2xl font-bold'>
              <Building2 className='h-6 w-6 text-primary' />
              Company Details
            </CardTitle>
            <CardDescription>
              Please provide your company information for billing and invoice
              purposes to continue.
            </CardDescription>
          </CardHeader>

          <CardContent className='pt-6'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='companyName'
                    className='flex items-center gap-2'
                  >
                    <Building2 className='h-4 w-4 text-muted-foreground' />
                    Company Name
                  </Label>
                  <Input
                    id='companyName'
                    type='text'
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companyName: e.target.value.toUpperCase()
                      })
                    }
                    className='w-full uppercase'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email' className='flex items-center gap-2'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                    Company Email
                  </Label>
                  <Input
                    id='email'
                    type='email'
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className='w-full'
                    required
                  />
                </div>

                <div className='space-y-2 md:col-span-2'>
                  <Label
                    htmlFor='companyAddress'
                    className='flex items-center gap-2'
                  >
                    <MapPin className='h-4 w-4 text-muted-foreground' />
                    Company Address
                  </Label>
                  <Textarea
                    id='companyAddress'
                    value={formData.companyAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companyAddress: e.target.value
                      })
                    }
                    className='min-h-[100px] w-full'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='vatNumber'
                    className='flex items-center gap-2'
                  >
                    <Receipt className='h-4 w-4 text-muted-foreground' />
                    VAT Number
                  </Label>
                  <Input
                    id='vatNumber'
                    type='text'
                    value={formData.vatNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, vatNumber: e.target.value })
                    }
                    className='w-full'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='processedBy'
                    className='flex items-center gap-2'
                  >
                    <ReceiptText className='h-4 w-4 text-muted-foreground' />
                    Invoice Process By
                  </Label>
                  <Input
                    id='processedBy'
                    type='text'
                    value={formData.processedBy || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, processedBy: e.target.value })
                    }
                    className='w-full'
                  />
                </div>

                <div className='space-y-2 md:col-span-2'>
                  <Label className='flex items-center gap-2'>
                    <Phone className='h-4 w-4 text-muted-foreground' />
                    Phone Numbers
                  </Label>
                  {formData.phone.map((phone, index) => (
                    <div key={index} className='flex gap-2'>
                      <Input
                        type='tel'
                        value={phone}
                        onChange={(e) =>
                          handlePhoneChange(index, e.target.value)
                        }
                        className='w-full'
                        placeholder=''
                        required={index === 0}
                      />
                      {index === formData.phone.length - 1 && (
                        <Button
                          type='button'
                          onClick={addPhoneField}
                          variant='outline'
                          size='icon'
                          className='shrink-0'
                        >
                          +
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className='space-y-2 md:col-span-2'>
                  <Label className='flex items-center gap-2'>
                    <Globe className='h-4 w-4 text-muted-foreground' />
                    Website URLs
                  </Label>
                  {formData.urls.map((url, index) => (
                    <div key={url.id} className='flex gap-2'>
                      <Input
                        disabled
                        type='url'
                        value={url.value}
                        onChange={(e) => handleUrlChange(index, e.target.value)}
                        className='w-full'
                        placeholder='https://example.com'
                      />
                      {index === formData.urls.length - 1 && (
                        <Button
                          type='button'
                          onClick={addUrlField}
                          variant='outline'
                          size='icon'
                          className='shrink-0'
                        >
                          +
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className='flex justify-end pt-4'>
                <Button
                  type='submit'
                  className='w-full sm:w-auto'
                  size='lg'
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save and Continue'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
