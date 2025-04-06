'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/../convex/_generated/api';

import { useMutation } from 'convex/react';
import { useState } from 'react';
import { toast } from 'sonner';
interface AlertModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

type FormValues = {
  name: string; // Firm name
  owner: string; // Owner's name
  address?: string; // Optional firm address
  phone: string;
};

export function AddFirmDialog({
  isOpen,
  onConfirm,
  onCancel
}: AlertModalProps) {
  const createFirm = useMutation(api.ledger.createFirm);
  const addTransaction = useMutation(api.ledger.addTransaction);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState<FormValues>({
    name: '',
    owner: '',
    address: '',
    phone: ''
  });

  async function onSubmit() {
    if (!values.name || !values.owner || !values.phone || !values.address) {
      toast.warning('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const createdFirmId = await createFirm(values);
      await addTransaction({
        firmId: createdFirmId,
        date: new Date().getTime(),
        particular: 'Opening Balance',
        drAmount: 0,
        crAmount: 0,
        balance: 0
      });
      onConfirm();
      toast.success('Firm created successfully');
      setValues({ name: '', owner: '', address: '', phone: '' });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to create firm', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className='sm:max-w-[400px] md:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add New Firm</DialogTitle>
          <DialogDescription>
            Add a new firm to your ledger account.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='name' className='text-right'>
              Firm Name
            </Label>
            <Input
              id='name'
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='username' className='text-right'>
              Firm Owner
            </Label>
            <Input
              id='firmOwner'
              onChange={(e) => setValues({ ...values, owner: e.target.value })}
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='username' className='text-right'>
              Address
            </Label>
            <Input
              id='address'
              onChange={(e) =>
                setValues({ ...values, address: e.target.value })
              }
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='username' className='text-nowrap text-right'>
              Phone Number
            </Label>
            <Input
              id='phone'
              onChange={(e) => setValues({ ...values, phone: e.target.value })}
              className='col-span-3'
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant='secondary' onClick={onCancel} className='m-4 md:m-0'>
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={() => onSubmit()}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
