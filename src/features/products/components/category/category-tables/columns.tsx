'use client';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { CellAction } from './CellAction';
import { Category, SkeletonCategory } from '../../../types/category.types';
import { Skeleton } from '@/components/ui/skeleton';
import CustomTooltip from '@/components/ui/custom/CustomTooltip';

const placeholderImageUrl = '/assets/images/product-placeholder.webp';

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
    header: 'NAME',
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      return <div className=''>{name}</div>;
    }
  },
  {
    accessorKey: 'description',
    header: 'DESCRIPTION',
    cell: ({ row }) => {
      const description = row.getValue('description') as string;
      return (
        <div className='max-w-[300px]'>
          <CustomTooltip
            triggerElement={description}
            tooltipContent={description}
            contentClassName='max-w-[500px]'
            delayDuration={0}
            triggerClassName='max-w-[600px] truncate'
          />
        </div>
      );
    }
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
