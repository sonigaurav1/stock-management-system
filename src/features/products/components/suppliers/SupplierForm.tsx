'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/../convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useEdgeStore } from '@/lib/edgestore';
import { Id } from 'convex/_generated/dataModel';
import CustomImageUpload from '../CustomImageUpload';
import { useEffect, useState } from 'react';
import { Supplier } from '../../types/supplier.types';
import { formSchema } from '../../schema/supplier-schema';
import { useUser } from '@clerk/clerk-react';
import {
  restrictedUser,
  restrictedUserLimit
} from '../../constants/restrictedUserData';
import { Progress } from '@/components/ui/progress';
import { maxSizeInMB } from '../../constants';
import useCompressUploadedImage from '../../hooks/useCompressUploadedImage';
import { useRouter } from 'next/navigation';

export default function SupplierForm({
  initialData,
  pageTitle
}: {
  initialData: Supplier | null;
  pageTitle: string;
}) {
  const { user } = useUser();
  const router = useRouter();
  const { compressedFile, compressImage } = useCompressUploadedImage();

  const createSupplier = useMutation(api.documents.createSupplier);
  const updateSupplier = useMutation(api.documents.updateSupplier);

  // fetch all categories to check if the user has reached the limit
  const allSuppliers = useQuery(
    api.documents.getAllSuppliers,
    user?.id === restrictedUser ? undefined : 'skip'
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const { edgestore } = useEdgeStore();

  const defaultValues = {
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    image: null as File | null,
    isDeleted: false
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  useEffect(() => {
    if (imageFile) {
      compressImage(imageFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile]);

  async function uploadFile(file: File | null) {
    if (!file) return null;

    return await edgestore.publicFiles.upload({
      file,
      onProgressChange: (progress) => {
        setProgress(progress);
      }
    });
  }

  const handleFileChange = (file: File) => {
    setImageFile(file);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (initialData === null && allSuppliers?.length === restrictedUserLimit) {
      toast.warning('Limitation Error', {
        description: `You have reached the limit of ${restrictedUserLimit} active suppliers.`,
        duration: 5000
      });
      setIsLoading(false);
      return;
    }

    let imageUrl = initialData?.imageUrl;

    if (compressedFile) {
      const res = await uploadFile(compressedFile as File);
      imageUrl = res?.url ?? initialData?.imageUrl ?? '';
    }

    const supplierData = {
      name: values.name,
      phone: values.phone,
      email: values.email,
      address: values.address,
      imageUrl
    };

    const promise =
      initialData === null
        ? createSupplier(supplierData)
        : updateSupplier({
            id: initialData._id as Id<'suppliers'>,
            updates: supplierData
          });

    toast.promise(promise, {
      loading:
        initialData === null
          ? 'Uploading details...'
          : 'Updating supplier details...',
      success:
        initialData === null
          ? 'Supplier created successfully!'
          : 'Updated supplier details!',
      error:
        initialData === null
          ? 'Failed to upload details.'
          : 'Failed to update supplier details.'
    });

    await promise.then(() => {
      router.push('/dashboard/product/supplier');
    });

    setProgress(0);
    setIsLoading(false);
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <FormField
              control={form.control}
              name='image'
              render={({ field }) => (
                <div className='space-y-6'>
                  <FormItem className='h-full w-full'>
                    <FormLabel>Images</FormLabel>
                    <FormControl>
                      <CustomImageUpload
                        value={field.value}
                        onChange={(file) => {
                          handleFileChange(file as any);
                        }}
                        maxSizeInMB={maxSizeInMB}
                        defaultPreview={initialData?.imageUrl || undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter supplier name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter phone number' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Enter supplier email address'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Address</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter supplier address' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {progress > 0 && (
              <div className='flex items-center gap-4'>
                <Progress value={progress} />
                <span className='text-xs font-semibold text-muted-foreground'>
                  {progress}%
                </span>
              </div>
            )}
            {initialData === null ? (
              <Button disabled={isLoading} type='submit'>
                Add Supplier
              </Button>
            ) : (
              <Button disabled={isLoading} type='submit'>
                Edit Supplier
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
