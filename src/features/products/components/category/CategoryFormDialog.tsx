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
import CategoryForm from './CategoryForm';

interface CategoryFormDialogProps {
  className?: string;
  onCategoryAdded?: () => void;
  triggerIcon?: boolean;
  hideTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CategoryFormDialog({
  className,
  onCategoryAdded,
  triggerIcon = false,
  hideTrigger = false,
  open: externalOpen,
  onOpenChange: externalOnOpenChange
}: CategoryFormDialogProps) {
  const internalOpen = useState(false);
  const isControlled = externalOpen !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen[0];
  const setIsOpen = isControlled ? externalOnOpenChange : internalOpen[1];

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen?.(newOpen);
  };

  const handleCategoryAdded = () => {
    handleOpenChange(false);
    onCategoryAdded?.();
  };

  // When controlled externally and hideTrigger is true, just render the dialog content without trigger
  if (isControlled && hideTrigger) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className='max-h-[90vh] w-full max-w-2xl overflow-y-auto'>
          <DialogHeader className='mb-4'>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new product category to your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className='px-2'>
            <CategoryForm
              initialData={null}
              pageTitle='Create New Category'
              onSuccess={handleCategoryAdded}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (triggerIcon) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className={cn('h-8 w-8 p-0', className)}
          >
            <Plus className='h-4 w-4' />
          </Button>
        </DialogTrigger>
        <DialogContent className='max-h-[90vh] w-full max-w-2xl overflow-y-auto'>
          <DialogHeader className='mb-4'>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new product category to your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className='px-2'>
            <CategoryForm
              initialData={null}
              pageTitle='Create New Category'
              onSuccess={handleCategoryAdded}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className={cn('text-xs md:text-sm', className)}>
          <Plus className='mr-2 h-4 w-4' /> Add New Category
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] w-full max-w-2xl overflow-y-auto'>
        <DialogHeader className='mb-4'>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Add a new product category to your inventory.
          </DialogDescription>
        </DialogHeader>
        <div className='px-2'>
          <CategoryForm
            initialData={null}
            pageTitle='Create New Category'
            onSuccess={handleCategoryAdded}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
