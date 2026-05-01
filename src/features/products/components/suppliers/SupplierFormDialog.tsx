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
import SupplierForm from './SupplierForm';

interface SupplierFormDialogProps {
  className?: string;
  onSupplierAdded?: () => void;
  triggerIcon?: boolean;
  hideTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function SupplierFormDialog({
  className,
  onSupplierAdded,
  triggerIcon = false,
  hideTrigger = false,
  open: externalOpen,
  onOpenChange: externalOnOpenChange
}: SupplierFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = externalOpen !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen;
  const setIsOpen = isControlled ? externalOnOpenChange : setInternalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen?.(newOpen);
  };

  const handleSupplierAdded = () => {
    handleOpenChange(false);
    onSupplierAdded?.();
  };

  // When controlled externally and hideTrigger is true, just render the dialog content without trigger
  if (hideTrigger) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className='max-h-[90vh] w-full max-w-4xl overflow-y-auto'>
          <DialogHeader className='mb-4'>
            <DialogTitle>Create New Supplier</DialogTitle>
            <DialogDescription>
              Fill in the supplier details below to add a new supplier to your
              inventory.
            </DialogDescription>
          </DialogHeader>
          <div className='px-2'>
            <SupplierForm
              initialData={null}
              pageTitle='Create New Supplier'
              onSuccess={handleSupplierAdded}
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
        <DialogContent className='max-h-[90vh] w-full max-w-4xl overflow-y-auto'>
          <DialogHeader className='mb-4'>
            <DialogTitle>Create New Supplier</DialogTitle>
            <DialogDescription>
              Fill in the supplier details below to add a new supplier to your
              inventory.
            </DialogDescription>
          </DialogHeader>
          <div className='px-2'>
            <SupplierForm
              initialData={null}
              pageTitle='Create New Supplier'
              onSuccess={handleSupplierAdded}
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
          <Plus className='mr-2 h-4 w-4' /> Add New Supplier
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] w-full max-w-4xl overflow-y-auto'>
        <DialogHeader className='mb-4'>
          <DialogTitle>Create New Supplier</DialogTitle>
          <DialogDescription>
            Fill in the supplier details below to add a new supplier to your
            inventory.
          </DialogDescription>
        </DialogHeader>
        <div className='px-2'>
          <SupplierForm
            initialData={null}
            pageTitle='Create New Supplier'
            onSuccess={handleSupplierAdded}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
