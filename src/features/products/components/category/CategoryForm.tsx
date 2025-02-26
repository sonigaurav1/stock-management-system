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
import { Textarea } from '@/components/ui/textarea';
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
import { Category } from '../../types/category.types';
import { formSchema } from '../../schema/CategorySchema';
import { generateSlug } from '@/lib/utils';

export default function CategoryForm({
  initialData,
  pageTitle
}: {
  initialData: Category | null;
  pageTitle: string;
}) {
  const createCategory = useMutation(api.documents.createCategory);
  const updateCategory = useMutation(api.documents.updateCategory);

  const [progress, setProgress] = useState<number>(0);

  const { edgestore } = useEdgeStore();

  const defaultValues = {
    name: initialData?.name || '',
    description: initialData?.description || '',
    image: null,
    isDeleted: false
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (initialData === null) {
      const file = values?.image;

      let res = null;

      if (file) {
        res = await edgestore.publicFiles.upload({
          file,
          onProgressChange: (progress) => {
            setProgress(progress);
          }
        });
      }

      try {
        const promise = createCategory({
          name: values.name,
          slug: generateSlug(values.name),
          description: values.description,
          imageUrl: res?.url ?? undefined
        });

        toast.promise(promise, {
          loading: 'Uploading details...',
          success: 'Details uploaded!',
          error: 'Failed to upload details.'
        });

        await promise; // Ensure the promise is awaited before redirecting

        redirect('/dashboard/product/category');
      } catch (error) {
        toast.warning('You have reached the maximum category creation limit.');

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

      const promise = updateCategory({
        id: initialData?._id as Id<'category'>,
        updates: {
          name: values.name,
          slug: generateSlug(values.name),
          description: values.description,
          imageUrl
        }
      });

      toast.promise(promise, {
        loading: 'Updating product details...',
        success: 'Updated product details!',
        error: 'Failed to update product details.'
      });

      redirect('/dashboard/product/category');
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
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter product name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter product description'
                        className='resize-none'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {progress > 0 && <p>Uploading: {progress}%</p>}
            {initialData === null ? (
              <Button type='submit'>Add Category</Button>
            ) : (
              <Button type='submit'>Edit Category</Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
