'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Pencil,
  X,
  Save,
  Plus,
  Building2,
  Mail,
  Phone,
  Globe,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/../convex/_generated/api';
import { cn } from '@/lib/utils';
import { fadeInUp, easings } from '@/lib/animations';

interface UrlItem {
  id: number;
  value: string;
}

interface CompanyDetailsForm {
  companyName: string;
  companyAddress: string;
  phone: string[];
  email: string;
  vatNumber: string;
  bio: string;
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CompanyDetailsForm>({
    companyName: '',
    companyAddress: '',
    phone: [],
    email: '',
    vatNumber: '',
    bio: ''
  });
  const [urls, setUrls] = useState<UrlItem[]>([{ id: 1, value: '' }]);

  const { user } = useUser();

  const company = useQuery(api.companies.getCompany, {
    userId: user?.id as string
  });

  const createOrUpdateCompany = useMutation(api.companies.createCompany);

  useEffect(() => {
    if (company) {
      setFormData({
        companyName: company.name,
        companyAddress: company.address,
        phone: company.phone,
        email: company.email,
        vatNumber: company.taxNumber,
        bio: company.description || ''
      });

      setUrls(company.urls.length > 0 ? company.urls : [{ id: 1, value: '' }]);
    }
  }, [company]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original company data
    if (company) {
      setFormData({
        companyName: company.name,
        companyAddress: company.address,
        phone: company.phone,
        email: company.email,
        vatNumber: company.taxNumber,
        bio: company.description || ''
      });
      setUrls(company.urls.length > 0 ? company.urls : [{ id: 1, value: '' }]);
    }
  };

  const handleSave = async () => {
    setIsEditing(false);

    // Ensure phone is an array of strings
    const phoneArray = formData.phone;

    const updates = {
      name: formData.companyName.toUpperCase(),
      address: formData.companyAddress,
      phone: phoneArray,
      email: formData.email,
      description: formData.bio,
      type: 'company' as const,
      businessType: 'retailer' as const,
      taxNumber: formData.vatNumber,
      urls
    };

    try {
      await createOrUpdateCompany(updates);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update profile:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // Special handling for phone field - convert comma/slash-separated to array
    if (name === 'phone') {
      const phoneArray = value
        .split(/[\/,]/)
        .map((phone) => phone.trim())
        .filter((phone) => phone !== '');
      setFormData((prev) => ({
        ...prev,
        phone: phoneArray
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUrlChange = (id: number, value: string) => {
    setUrls((prev) =>
      prev.map((url) => (url.id === id ? { ...url, value } : url))
    );
  };

  const addUrl = () => {
    setUrls((prev) => [
      ...prev,
      {
        id: prev.length > 0 ? Math.max(...prev.map((u) => u.id)) + 1 : 1,
        value: ''
      }
    ]);
  };

  const removeUrl = (id: number) => {
    setUrls((prev) => prev.filter((url) => url.id !== id));
  };

  return (
    <div className='flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8'>
      <div className='mx-auto max-w-4xl space-y-6'>
        {/* Header Card */}
        <motion.div
          variants={fadeInUp}
          initial='initial'
          animate='animate'
          className='flex items-center justify-between'
        >
          <div>
            <h2 className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
              Company Profile
            </h2>
            <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
              This is how others will see your company on the site.
            </p>
          </div>
          {!isEditing ? (
            <Button
              onClick={handleEdit}
              className='gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
            >
              <Pencil className='h-4 w-4' />
              Edit Profile
            </Button>
          ) : (
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={handleCancel}
                className='gap-2'
              >
                <X className='h-4 w-4' />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className='gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
              >
                <Save className='h-4 w-4' />
                Save Changes
              </Button>
            </div>
          )}
        </motion.div>

        {/* Main Profile Card */}
        <motion.div
          variants={fadeInUp}
          initial='initial'
          animate='animate'
          transition={{ delay: 0.1 }}
        >
          <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Building2 className='h-5 w-5 text-cyan-600' />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='companyName'>Company Name</Label>
                  <Input
                    id='companyName'
                    name='companyName'
                    className={cn(
                      'border-slate-200/50 bg-slate-50/50 uppercase transition-colors focus:border-cyan-500 dark:border-slate-700/50 dark:bg-slate-800/50',
                      isEditing ? '' : 'cursor-not-allowed opacity-70'
                    )}
                    value={formData.companyName}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  <p className='text-xs text-slate-500 dark:text-slate-400'>
                    This is your public display name.
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='vatNumber'>VAT Number</Label>
                  <Input
                    id='vatNumber'
                    name='vatNumber'
                    className={cn(
                      'border-slate-200/50 bg-slate-50/50 transition-colors focus:border-cyan-500 dark:border-slate-700/50 dark:bg-slate-800/50',
                      isEditing ? '' : 'cursor-not-allowed opacity-70'
                    )}
                    value={formData.vatNumber}
                    placeholder='Enter your VAT number'
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='companyAddress'>Company Address</Label>
                <Input
                  id='companyAddress'
                  name='companyAddress'
                  className={cn(
                    'border-slate-200/50 bg-slate-50/50 transition-colors focus:border-cyan-500 dark:border-slate-700/50 dark:bg-slate-800/50',
                    isEditing ? '' : 'cursor-not-allowed opacity-70'
                  )}
                  value={formData.companyAddress}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='email' className='flex items-center gap-2'>
                    <Mail className='h-4 w-4' />
                    Email
                  </Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    className={cn(
                      'border-slate-200/50 bg-slate-50/50 transition-colors focus:border-cyan-500 dark:border-slate-700/50 dark:bg-slate-800/50',
                      isEditing ? '' : 'cursor-not-allowed opacity-70'
                    )}
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                  <p className='text-xs text-slate-500 dark:text-slate-400'>
                    You can manage verified email addresses in your email
                    settings.
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='phone' className='flex items-center gap-2'>
                    <Phone className='h-4 w-4' />
                    Phone
                  </Label>
                  <Input
                    id='phone'
                    name='phone'
                    className={cn(
                      'border-slate-200/50 bg-slate-50/50 transition-colors focus:border-cyan-500 dark:border-slate-700/50 dark:bg-slate-800/50',
                      isEditing ? '' : 'cursor-not-allowed opacity-70'
                    )}
                    value={
                      Array.isArray(formData.phone)
                        ? formData.phone.join(', ')
                        : formData.phone
                    }
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder='Enter phone numbers separated by commas or slashes'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='bio' className='flex items-center gap-2'>
                  <FileText className='h-4 w-4' />
                  Bio
                </Label>
                <Textarea
                  id='bio'
                  name='bio'
                  placeholder='Write a short description about your company...'
                  className={cn(
                    'min-h-[120px] border-slate-200/50 bg-slate-50/50 transition-colors focus:border-cyan-500 dark:border-slate-700/50 dark:bg-slate-800/50',
                    isEditing ? '' : 'cursor-not-allowed opacity-70'
                  )}
                  value={formData.bio || ''}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                <p className='text-xs text-slate-500 dark:text-slate-400'>
                  You can @mention other users and organizations to link to
                  them.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* URLs Card */}
        <motion.div
          variants={fadeInUp}
          initial='initial'
          animate='animate'
          transition={{ delay: 0.2 }}
        >
          <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Globe className='h-5 w-5 text-cyan-600' />
                Website & Social Links
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-sm text-slate-600 dark:text-slate-400'>
                Add links to your website, blog, or social media profiles.
              </p>
              <div className='space-y-3'>
                {urls.map((url, index) => (
                  <div key={url.id} className='flex gap-2'>
                    <Input
                      value={url.value}
                      onChange={(e) => handleUrlChange(url.id, e.target.value)}
                      disabled={!isEditing}
                      placeholder='https://example.com'
                      className={cn(
                        'border-slate-200/50 bg-slate-50/50 transition-colors focus:border-cyan-500 dark:border-slate-700/50 dark:bg-slate-800/50',
                        isEditing ? '' : 'cursor-not-allowed opacity-70'
                      )}
                    />
                    {isEditing && urls.length > 1 && (
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() => removeUrl(url.id)}
                        className='shrink-0'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <Button
                    variant='outline'
                    size='sm'
                    className='gap-2 border-dashed'
                    onClick={addUrl}
                  >
                    <Plus className='h-4 w-4' />
                    Add URL
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
