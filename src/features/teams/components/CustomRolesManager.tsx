'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Shield, Settings2, Trash2 } from 'lucide-react';
import { CustomRoleDialog } from './CustomRoleDialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CustomRolesManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);

  const customRoles = useQuery(api.teamManagement.listCustomRoles);

  if (customRoles === undefined) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  const handleEdit = (role: any) => {
    setEditingRole(role);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingRole(null);
    setIsDialogOpen(true);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-medium'>Custom Roles</h3>
          <p className='text-sm text-muted-foreground'>
            Create granular roles with specific permissions for your team
            members.
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          className='gap-2 bg-indigo-600 text-white hover:bg-indigo-700'
        >
          <Plus className='h-4 w-4' />
          Create Role
        </Button>
      </div>

      {customRoles.length === 0 ? (
        <Card className='border-dashed bg-slate-50/50 dark:bg-slate-900/50'>
          <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
            <Shield className='mb-4 h-12 w-12 text-slate-300 dark:text-slate-700' />
            <h3 className='text-lg font-medium text-slate-900 dark:text-slate-100'>
              No custom roles yet
            </h3>
            <p className='mt-2 max-w-sm text-sm text-slate-500'>
              You haven't created any custom roles. Team members are currently
              using default presets.
            </p>
            <Button onClick={handleAddNew} variant='outline' className='mt-4'>
              Create your first role
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {customRoles.map((role: any) => (
            <Card key={role._id} className='flex flex-col'>
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle className='text-base'>{role.name}</CardTitle>
                    {role.description && (
                      <CardDescription className='mt-1 line-clamp-2'>
                        {role.description}
                      </CardDescription>
                    )}
                  </div>
                  {role.isSystem && <Badge variant='secondary'>System</Badge>}
                </div>
              </CardHeader>
              <CardContent className='flex-1 pb-4'>
                <div className='mb-4 text-sm text-muted-foreground'>
                  <span className='font-medium text-slate-900 dark:text-slate-100'>
                    {role.permissions?.length || 0}
                  </span>{' '}
                  permissions assigned
                </div>
                {!role.isSystem && (
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='w-full gap-2'
                      onClick={() => handleEdit(role)}
                    >
                      <Settings2 className='h-3.5 w-3.5' />
                      Edit Role
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CustomRoleDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        roleToEdit={editingRole}
      />
    </div>
  );
}
