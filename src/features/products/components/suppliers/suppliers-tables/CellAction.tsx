'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Edit, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { toast } from 'sonner';
import { useEdgeStore } from '@/lib/edgestore';
import { useState } from 'react';
import { Supplier } from '@/features/products/types/supplier.types';

interface CellActionProps {
  data: Supplier;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { edgestore } = useEdgeStore();

  const deleteSupplier = useMutation(api.suppliers.deleteSupplier);

  const onConfirm = async () => {
    setLoading(true); // Set loading state to true

    const promise = deleteSupplier({
      id: data._id as Id<'suppliers'>
    });

    const imageUrl = data?.imageUrl!;

    toast.promise(promise, {
      loading: 'Deleting supplier...',
      success: 'Supplier deleted!'
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
      .catch(() => {
        // not working as expected in production
        // console.error('Error: ', error);
        // if (
        //   error.message.includes(
        //     'Cannot delete supplier associated with products'
        //   )
        // ) {
        //   toast.warning('Cannot delete supplier associated with products');
        // } else {
        //   toast.warning('An error occurred while deleting supplier');
        // }
        toast.warning('Association Error', {
          description: 'Cannot delete supplier that is associated with products'
        });
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
        <Edit
          onClick={() => router.push(`/procurement/suppliers/${data._id}`)}
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
