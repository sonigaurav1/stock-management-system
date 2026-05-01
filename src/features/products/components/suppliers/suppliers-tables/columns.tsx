'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './CellAction';
import {
  SkeletonSupplier,
  Supplier
} from '@/features/products/types/supplier.types';
import { Skeleton } from '@/components/ui/skeleton';
import ImagePreview from '../../common/ImagePreview';

const placeholderImageUrl = '/assets/images/user-placeholder.webp';

export const columns: ColumnDef<Supplier>[] = [
  {
    accessorKey: 'imageUrl',
    header: 'IMAGE',
    cell: ({ row }) => {
      const imageUrl = row.getValue('imageUrl') as string | undefined;
      return (
        <ImagePreview
          src={imageUrl}
          alt={row.getValue('name') as string}
          fallbackSrc={placeholderImageUrl}
        />
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
