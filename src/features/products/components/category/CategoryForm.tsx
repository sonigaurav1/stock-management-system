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
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/../convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useEdgeStore } from '@/lib/edgestore';
import { useRouter } from 'next/navigation';
import { Id } from 'convex/_generated/dataModel';
import CustomImageUpload from '../CustomImageUpload';
import { useEffect, useState } from 'react';
import { Category } from '../../types/category.types';
import { generateSlug, cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { restrictedUser } from '../../constants/restrictedUserData';
import { Progress } from '@/components/ui/progress';
import { maxSizeInMB } from '../../constants';
import useCompressUploadedImage from '../../hooks/useCompressUploadedImage';
import { formSchema } from '../../schema/category-schema';
import CustomInput from '@/components/form/CustomInput';

export default function CategoryForm({
  initialData,
  pageTitle,
  onSuccess
}: {
  initialData: Category | null;
  pageTitle: string;
  onSuccess?: () => void;
}) {
  const { user } = useUser();
  const router = useRouter();
  const { compressedFile, compressImage } = useCompressUploadedImage();

  const createCategory = useMutation(api.categories.createCategory);
  const updateCategory = useMutation(api.categories.updateCategory);

  // fetch all categories to check if the user has reached the limit
  const allCategories = useQuery(
    api.categories.getAllCategories,
    user?.id === restrictedUser.id ? undefined : 'skip'
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      onProgressChange: (progress: number) => {
        setProgress(progress);
      }
    });
  }

  const handleFileChange = (file: File) => {
    setImageFile(file);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (
      initialData === null &&
      allCategories?.length === restrictedUser.limit
    ) {
      toast.warning('Limitation Error', {
        description: `You have reached the limit of ${restrictedUser.limit} active categories.`,
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

    const categoryData = {
      name: values.name,
      slug: generateSlug(values.name),
      description: values.description,
      imageUrl
    };

    const promise =
      initialData === null
        ? createCategory(categoryData)
        : updateCategory({
            id: initialData._id as Id<'category'>,
            updates: categoryData
          });

    const action =
      initialData === null
        ? 'Uploading details...'
        : 'Updating category details...';
    const successMessage =
      initialData === null
        ? 'Category created successfully!'
        : 'Updated category details!';
    const errorMessage =
      initialData === null
        ? 'Failed to upload details.'
        : 'Failed to update category details.';

    toast.promise(promise, {
      loading: action,
      success: successMessage,
      error: errorMessage
    });

    await promise.then(() => {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/product/category');
      }
    });
    setProgress(0);
    setIsLoading(false);
  }

  const cardClassName = cn('w-full', !onSuccess && 'mx-auto');

  return (
    <Card className={cardClassName}>
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
              <CustomInput
                name='name'
                label='Category Name'
                placeHolder='Enter Category Name'
                required
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter Category Description'
                        className='resize-none'
                        {...field}
                      />
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
                Add Category
              </Button>
            ) : (
              <Button disabled={isLoading} type='submit'>
                Edit Category
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
