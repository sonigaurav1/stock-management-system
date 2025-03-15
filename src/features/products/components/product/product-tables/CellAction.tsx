'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Edit, Eye, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Product } from '../../../types/product.types';
import { useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { toast } from 'sonner';
import { useEdgeStore } from '@/lib/edgestore';
import { useState } from 'react';

interface CellActionProps {
  data: Product;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { edgestore } = useEdgeStore();

  const deleteProduct = useMutation(api.documents.deleteProduct);

  const onConfirm = async () => {
    setLoading(true); // Set loading state to true
    const promise = deleteProduct({
      id: data._id as Id<'products'>
    });

    const imageUrl = data?.imageUrl!;

    toast.promise(promise, {
      loading: 'Deleting product...',
      success: 'Product deleted!',
      error: 'Failed to delete product.'
    });

    await promise
      .then(async () => {
        // Deleting image from edgeStore
        if (imageUrl) {
          await edgestore.publicFiles.delete({
            url: imageUrl
          });
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error deleting product:', error);
        toast.error('Error deleting product!!!');
      });

    setOpen(false);
    setLoading(false);
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <div className='flex gap-3'>
        <Eye
          onClick={() => router.push(`/dashboard/product/view/${data._id}`)}
          className='mr-2 h-4 w-4 cursor-pointer hover:text-primary-foreground dark:hover:text-primary'
        />
        <Edit
          onClick={() => router.push(`/dashboard/product/${data._id}`)}
          className='mr-2 h-4 w-4 cursor-pointer hover:text-primary-foreground dark:hover:text-primary'
        />
        <Trash
          onClick={() => setOpen(true)}
          className='mr-2 h-4 w-4 cursor-pointer hover:text-destructive-foreground dark:hover:text-destructive'
        />
      </div>
    </>
  );
};
