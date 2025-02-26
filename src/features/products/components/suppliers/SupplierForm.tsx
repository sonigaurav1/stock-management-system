/* eslint-disable no-console */
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
import { useMutation } from 'convex/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useEdgeStore } from '@/lib/edgestore';
import { redirect } from 'next/navigation';
import { Id } from 'convex/_generated/dataModel';
import CustomImageUpload from '../CustomImageUpload';
import { useState } from 'react';
import { Supplier } from '../../types/supplier.types';
import { formSchema } from '../../schema/SupplierSchema';

export default function SupplierForm({
  initialData,
  pageTitle
}: {
  initialData: Supplier | null;
  pageTitle: string;
}) {
  const createSupplier = useMutation(api.documents.createSupplier);
  const updateSupplier = useMutation(api.documents.updateSupplier);

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (initialData === null) {
      let res = null;

      if (values.image) {
        const file = values.image;
        res = await edgestore.publicFiles.upload({
          file,
          onProgressChange: (progress) => {
            setProgress(progress);
          }
        });
      }

      try {
        const promise = createSupplier({
          name: values.name,
          phone: values.phone,
          email: values.email,
          address: values.address,
          imageUrl: res?.url ?? undefined
        });

        toast.promise(promise, {
          loading: 'Uploading supplier details...',
          success: 'Supplier details uploaded!',
          error: 'Failed to upload supplier details.'
        });

        await promise; // Wait for the promise to resolve

        redirect('/dashboard/product/supplier');
      } catch (error) {
        toast.warning('You have reached the maximum supplier creation limit.');

        if (res?.url) {
          await edgestore.publicFiles.delete({
            url: res.url
          });
        }
      }
    } else {
      let imageUrl = initialData?.imageUrl;

      if (values.image) {
        const res = await edgestore.publicFiles.upload({
          file: values.image,
          onProgressChange: (progress) => {
            console.log(progress);
          }
        });
        imageUrl = res.url;
      }

      const promise = updateSupplier({
        id: initialData?._id as Id<'suppliers'>,
        updates: {
          name: values.name,
          phone: values.phone,
          email: values.email,
          address: values.address,
          imageUrl: imageUrl ?? undefined
        }
      });

      toast.promise(promise, {
        loading: 'Updating supplier details...',
        success: 'Updated supplier details!',
        error: 'Failed to update supplier details.'
      });

      redirect('/dashboard/product/supplier');
    }
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
                        onChange={(file) => field.onChange(file || null)}
                        maxSizeInMB={4}
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
                      <Input placeholder='Enter product name' {...field} />
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
            {progress > 0 && <p>Uploading: {progress}%</p>}
            {initialData === null ? (
              <Button type='submit'>Add Supplier</Button>
            ) : (
              <Button type='submit'>Edit Supplier</Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
