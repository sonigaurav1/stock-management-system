'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Shield, Zap, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLES = [
  {
    value: 'manager',
    label: 'Manager',
    icon: Shield,
    description: 'Can edit inventory, create transactions, approve actions'
  },
  {
    value: 'staff',
    label: 'Staff',
    icon: Zap,
    description: 'Can create and edit transactions, view inventory'
  },
  {
    value: 'viewer',
    label: 'Viewer',
    icon: Eye,
    description: 'View-only access to inventory and reports'
  }
];

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('staff');
  const [isLoading, setIsLoading] = useState(false);

  const inviteMember = useMutation(api.companyTeam.inviteCompanyMember);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !role) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Basic email validation
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await inviteMember({
        email,
        role,
        displayName: displayName || email.split('@')[0]
      });

      toast.success(`Invitation sent to ${email}`);

      // Reset form
      setEmail('');
      setDisplayName('');
      setRole('staff');
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to send invitation'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to a team member to join your company
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Email */}
          <div className='space-y-2'>
            <Label htmlFor='email' className='font-medium'>
              Email Address *
            </Label>
            <Input
              id='email'
              type='email'
              placeholder='member@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Display Name */}
          <div className='space-y-2'>
            <Label htmlFor='displayName' className='font-medium'>
              Display Name
            </Label>
            <Input
              id='displayName'
              placeholder='John Doe (optional)'
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isLoading}
            />
            <p className='text-xs text-gray-500'>
              If not provided, will use the part before @ in the email
            </p>
          </div>

          {/* Role Selection */}
          <div className='space-y-3'>
            <Label className='font-medium'>Role *</Label>
            <Select value={role} onValueChange={setRole} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <div className='flex items-center gap-2'>
                      <r.icon className='h-4 w-4' />
                      <span>{r.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Role Description */}
            <div className='rounded-lg bg-blue-50 p-3'>
              {ROLES.find((r) => r.value === role) && (
                <div>
                  <p className='text-sm font-medium text-blue-900'>
                    {ROLES.find((r) => r.value === role)?.label}
                  </p>
                  <p className='mt-1 text-xs text-blue-700'>
                    {ROLES.find((r) => r.value === role)?.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className='flex justify-end gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </Button>
          </div>
        </form>

        {/* Info */}
        <div className='rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600'>
          ℹ️ The team member will receive an invitation email and can accept it
          to join your company workspace
        </div>
      </DialogContent>
    </Dialog>
  );
}
