'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import ProductForm from './ProductForm';

interface ProductFormDialogProps {
  className?: string;
  onProductAdded?: () => void;
}

export default function ProductFormDialog({
  className,
  onProductAdded
}: ProductFormDialogProps) {
  const [open, setOpen] = useState(false);

  const handleProductAdded = () => {
    setOpen(false);
    onProductAdded?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn('text-xs md:text-sm', className)}>
          <Plus className='mr-2 h-4 w-4' /> Add New Product
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] w-full max-w-4xl overflow-y-auto'>
        <DialogHeader className='mb-4'>
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            Fill in the product details below to add a new product to your
            inventory.
          </DialogDescription>
        </DialogHeader>
        <div className='px-2'>
          <ProductForm
            initialData={null}
            pageTitle='Create New Product'
            onSuccess={handleProductAdded}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
