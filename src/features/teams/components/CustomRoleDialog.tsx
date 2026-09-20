'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { PERMISSIONS } from '@/../convex/lib/permissions';

const PERMISSION_GROUPS = [
  {
    title: 'Inventory & Products',
    permissions: [
      {
        id: PERMISSIONS.VIEW_INVENTORY,
        label: 'View Inventory',
        description: 'Can view products and stock levels'
      },
      {
        id: PERMISSIONS.CREATE_PRODUCT,
        label: 'Create Products',
        description: 'Can add new products'
      },
      {
        id: PERMISSIONS.EDIT_PRODUCT,
        label: 'Edit Products',
        description: 'Can modify existing products'
      },
      {
        id: PERMISSIONS.DELETE_PRODUCT,
        label: 'Delete Products',
        description: 'Can remove products'
      },
      {
        id: PERMISSIONS.MANAGE_STOCK,
        label: 'Manage Stock',
        description: 'Can adjust inventory quantities'
      }
    ]
  },
  {
    title: 'Transactions & Sales',
    permissions: [
      {
        id: PERMISSIONS.CREATE_TRANSACTION,
        label: 'Create Transactions',
        description: 'Can process sales and invoices'
      },
      {
        id: PERMISSIONS.EDIT_TRANSACTION,
        label: 'Edit Transactions',
        description: 'Can modify existing transactions'
      },
      {
        id: PERMISSIONS.DELETE_TRANSACTION,
        label: 'Delete Transactions',
        description: 'Can void or delete transactions'
      },
      {
        id: PERMISSIONS.APPROVE_TRANSACTION,
        label: 'Approve Transactions',
        description: 'Can approve workflows'
      }
    ]
  },
  {
    title: 'Finance & Ledger',
    permissions: [
      {
        id: PERMISSIONS.VIEW_LEDGER,
        label: 'View Ledger',
        description: 'Can view financial transactions'
      },
      {
        id: PERMISSIONS.MANAGE_EXPENSES,
        label: 'Manage Expenses',
        description: 'Can log and manage business expenses'
      },
      {
        id: PERMISSIONS.VIEW_FINANCIAL_REPORTS,
        label: 'Financial Reports',
        description: 'Can view P&L and balance sheets'
      }
    ]
  },
  {
    title: 'Reports & Analytics',
    permissions: [
      {
        id: PERMISSIONS.VIEW_REPORTS,
        label: 'View Reports',
        description: 'Can view general reports'
      },
      {
        id: PERMISSIONS.VIEW_ANALYTICS,
        label: 'View Analytics',
        description: 'Can view dashboard analytics'
      },
      {
        id: PERMISSIONS.EXPORT_DATA,
        label: 'Export Data',
        description: 'Can download CSV/PDF reports'
      }
    ]
  },
  {
    title: 'Administration',
    permissions: [
      {
        id: PERMISSIONS.MANAGE_USERS,
        label: 'Manage Users',
        description: 'Can invite and edit team members'
      },
      {
        id: PERMISSIONS.MANAGE_ROLES,
        label: 'Manage Roles',
        description: 'Can create and assign roles'
      },
      {
        id: PERMISSIONS.MANAGE_SETTINGS,
        label: 'Manage Settings',
        description: 'Can modify global settings'
      },
      {
        id: PERMISSIONS.VIEW_AUDIT_LOGS,
        label: 'View Audit Logs',
        description: 'Can view security logs'
      }
    ]
  }
];

interface CustomRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleToEdit?: any;
}

export function CustomRoleDialog({
  open,
  onOpenChange,
  roleToEdit
}: CustomRoleDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createRole = useMutation(api.teamManagement.createCustomRole);
  const updateRole = useMutation(api.teamManagement.updateCustomRole);

  useEffect(() => {
    if (open) {
      if (roleToEdit) {
        setName(roleToEdit.name || '');
        setDescription(roleToEdit.description || '');
        setSelectedPermissions(roleToEdit.permissions || []);
      } else {
        setName('');
        setDescription('');
        setSelectedPermissions([]);
      }
    }
  }, [open, roleToEdit]);

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAllInGroup = (groupPermissions: string[]) => {
    const allSelected = groupPermissions.every((p) =>
      selectedPermissions.includes(p)
    );
    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((p) => !groupPermissions.includes(p))
      );
    } else {
      setSelectedPermissions((prev) => {
        const newSet = new Set([...prev, ...groupPermissions]);
        return Array.from(newSet);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }

    if (selectedPermissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    try {
      setIsSubmitting(true);

      if (roleToEdit) {
        await updateRole({
          roleId: roleToEdit._id,
          name,
          description,
          permissions: selectedPermissions
        });
        toast.success('Role updated successfully');
      } else {
        await createRole({
          name,
          description,
          permissions: selectedPermissions
        });
        toast.success('Role created successfully');
      }

      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditMode = !!roleToEdit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] max-w-2xl flex-col gap-0 p-0'>
        <DialogHeader className='border-b p-6 pb-4'>
          <DialogTitle>
            {isEditMode ? 'Edit Custom Role' : 'Create Custom Role'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Modify the permissions for this custom role.'
              : 'Define a new role with specific granular permissions for your team.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex-1 overflow-y-auto'>
          <div className='space-y-6 p-6'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='role-name'>
                  Role Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='role-name'
                  placeholder='e.g. Senior Billing Staff'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='role-desc'>Description</Label>
                <Input
                  id='role-desc'
                  placeholder='What does this role do?'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label className='text-base'>Permissions</Label>
                <span className='rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700'>
                  {selectedPermissions.length} selected
                </span>
              </div>

              <div className='grid gap-6 sm:grid-cols-2'>
                {PERMISSION_GROUPS.map((group, idx) => {
                  const groupPermIds = group.permissions.map((p) => p.id);
                  const allSelected = groupPermIds.every((p) =>
                    selectedPermissions.includes(p)
                  );
                  const someSelected =
                    groupPermIds.some((p) => selectedPermissions.includes(p)) &&
                    !allSelected;

                  return (
                    <div
                      key={idx}
                      className='rounded-lg border bg-slate-50/50 p-4'
                    >
                      <div className='mb-3 flex items-center justify-between border-b pb-2'>
                        <Label className='font-semibold text-slate-800'>
                          {group.title}
                        </Label>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='h-6 px-2 text-xs'
                          onClick={() => handleSelectAllInGroup(groupPermIds)}
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>
                      <div className='space-y-3'>
                        {group.permissions.map((perm) => (
                          <div
                            key={perm.id}
                            className='flex items-start space-x-2'
                          >
                            <Checkbox
                              id={`perm-${perm.id}`}
                              checked={selectedPermissions.includes(perm.id)}
                              onCheckedChange={() => togglePermission(perm.id)}
                              className='mt-1'
                            />
                            <div className='grid leading-none'>
                              <label
                                htmlFor={`perm-${perm.id}`}
                                className='cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                              >
                                {perm.label}
                              </label>
                              <p className='mt-1.5 text-xs text-muted-foreground'>
                                {perm.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className='sticky bottom-0 border-t bg-white p-6 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='bg-indigo-600 hover:bg-indigo-700'
            >
              {isSubmitting && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              {isEditMode ? 'Save Changes' : 'Create Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
