'use client';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { CellAction } from './cell-action';
import { Category, SkeletonCategory } from '../../../types/category.types';
import { Skeleton } from '@/components/ui/skeleton';

const placeholderImageUrl = '/assets/images/product-placeholder.png';

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: 'imageUrl',
    header: 'IMAGE',
    cell: ({ row }) => {
      const imageUrl = row.getValue('imageUrl') as string | undefined;
      return (
        <div className='relative aspect-square max-h-16'>
          <Image
            src={imageUrl || placeholderImageUrl}
            alt={row.getValue('name')}
            fill
            sizes='100%'
            className='rounded-lg'
          />
        </div>
      );
    }
  },
  {
    accessorKey: 'name',
    header: 'NAME'
  },
  {
    accessorKey: 'description',
    header: 'DESCRIPTION'
  },
  {
    id: 'actions',
    header: 'ACTIONS',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

export const skeletonColumns: ColumnDef<SkeletonCategory>[] = [
  {
    id: 'imageUrl',
    header: 'IMAGE',
    accessorFn: () => null,
    cell: () => <Skeleton className='h-10 w-10 rounded-full' />
  },
  {
    accessorKey: 'name',
    header: 'NAME',
    cell: () => <Skeleton className='h-5 w-24' />
  },

  {
    accessorKey: 'description',
    header: 'DESCRIPTION',
    cell: () => <Skeleton className='h-5 w-36' />
  },
  {
    id: 'actions',
    header: 'ACTIONS',
    cell: () => <Skeleton className='h-4 w-8' />
  }
];
