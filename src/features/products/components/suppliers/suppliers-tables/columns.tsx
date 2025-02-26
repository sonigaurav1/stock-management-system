'use client';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { CellAction } from './cell-action';
import {
  SkeletonSupplier,
  Supplier
} from '@/features/products/types/supplier.types';
import { Skeleton } from '@/components/ui/skeleton';

const placeholderImageUrl = '/assets/images/user-placeholder.png';

export const columns: ColumnDef<Supplier>[] = [
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
    accessorKey: 'phone',
    header: 'PHONE'
  },
  {
    accessorKey: 'email',
    header: 'EMAIL'
  },
  {
    accessorKey: 'address',
    header: 'ADDRESS'
  },
  {
    id: 'actions',
    header: 'ACTIONS',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

export const skeletonColumns: ColumnDef<SkeletonSupplier>[] = [
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
    accessorKey: 'phone',
    header: 'PHONE',
    cell: () => <Skeleton className='h-5 w-24' />
  },
  {
    accessorKey: 'email',
    header: 'EMAIL',
    cell: () => <Skeleton className='h-5 w-24' />
  },
  {
    accessorKey: 'address',
    header: 'ADDRESS',
    cell: () => <Skeleton className='h-5 w-24' />
  },
  {
    id: 'actions',
    header: 'ACTIONS',
    cell: () => <Skeleton className='h-4 w-8' />
  }
];
