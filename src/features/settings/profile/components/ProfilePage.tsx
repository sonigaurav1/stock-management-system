'use client';

import React, { useEffect, useState } from 'react';

import { Pencil, X, Save, Plus } from 'lucide-react';

interface UrlItem {
  id: number;
  value: string;
}

import { useMutation, useQuery } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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

  // const handleSelectChange = (value: string) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     email: value
  //   }));
  // };

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

  return (
    <div className='flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8'>
      <div className='max-w-3xl'>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-bold'>Profile</h2>
            <p className='text-sm text-muted-foreground'>
              This is how others will see your company on the site.
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={handleEdit}>
              <Pencil className='mr-2 h-4 w-4' />
              Edit
            </Button>
          ) : (
            <div className='flex space-x-2'>
              <Button variant='outline' onClick={handleCancel}>
                <X className='mr-2 h-4 w-4' />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className='mr-2 h-4 w-4' />
                Save
              </Button>
            </div>
          )}
        </div>

        <div className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='companyName'>Company Name</Label>
            <Input
              id='companyName'
              name='companyName'
              className='uppercase'
              value={formData.companyName}
              onChange={handleChange}
              disabled={!isEditing}
            />
            <p className='text-sm text-muted-foreground'>
              This is your public display name. It can be your real company
              name.
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='companyAddress'>Company Address</Label>
            <Input
              id='companyAddress'
              name='companyAddress'
              value={formData.companyAddress}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='phone'>Phone</Label>
            <Input
              id='phone'
              name='phone'
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

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            {isEditing ? (
              // <Select
              //   value={formData.email}
              //   onValueChange={handleSelectChange}
              //   disabled={!isEditing}
              // >
              //   <SelectTrigger>
              //     <SelectValue placeholder='Select a verified email to display' />
              //   </SelectTrigger>
              //   <SelectContent>
              //     <SelectItem value='hiraelectronicsandmobilepasal@gmail.com'>
              //       hiraelectronicsandmobilepasal@gmail.com
              //     </SelectItem>
              //     <SelectItem value='info@hiraelectronics.com'>
              //       info@hiraelectronics.com
              //     </SelectItem>
              //   </SelectContent>
              // </Select>
              <Input
                id='email'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            ) : (
              <Input
                id='email'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            )}
            <p className='text-sm text-muted-foreground'>
              You can manage verified email addresses in your email settings.
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='bio'>Bio</Label>
            <Textarea
              id='bio'
              name='bio'
              placeholder='Write a short description about your company...'
              className='min-h-[100px]'
              disabled={!isEditing}
            />
            <p className='text-sm text-muted-foreground'>
              You can @mention other users and organizations to link to them.
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='vatNumber'>VAT Number</Label>
            <Input
              id='vatNumber'
              name='vatNumber'
              value={formData.vatNumber}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className='space-y-2'>
            <Label>URLs</Label>
            <p className='text-sm text-muted-foreground'>
              Add links to your website, blog, or social media profiles.
            </p>
            <div className='space-y-3'>
              {urls.map((url) => (
                <Input
                  key={url.id}
                  value={url.value}
                  onChange={(e) => handleUrlChange(url.id, e.target.value)}
                  disabled={!isEditing}
                  placeholder='https://example.com'
                />
              ))}
              {isEditing && (
                <Button
                  variant='outline'
                  size='sm'
                  className='mt-2'
                  onClick={addUrl}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Add URL
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
