/* eslint-disable import/no-unresolved */
'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

// Define the Organization type
// type Organization = {
//     _id: string;
//     name: string;
//     role: string; // Role of the user in the organization
//     ownerId: string; // User ID of the owner
//     createdAt: number; // Timestamp of creation
//     updatedAt: number; // Timestamp of last update
// };

export default function OrganizationsPage() {
  const organizations = useQuery(api.organizations.getUserOrganizations) ?? [];
  const createOrg = useMutation(api.organizations.createOrganization);
  const inviteUser = useMutation(api.organizations.inviteUserToOrganization);

  const [newOrgName, setNewOrgName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('staff');
  const [selectedOrg, setSelectedOrg] = useState(null);

  const handleCreateOrg = async () => {
    if (!newOrgName) return;

    try {
      await createOrg({ name: newOrgName });
      setNewOrgName('');
      toast('Organization created', {
        description: `${newOrgName} has been created successfully`
      });
    } catch (err) {
      toast.error('Error', {
        description:
          err instanceof Error ? err.message : 'An unknown error occurred'
      });
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !selectedOrg) return;

    try {
      await inviteUser({
        organizationId: selectedOrg,
        userEmail: inviteEmail,
        role: inviteRole
      });

      setInviteEmail('');
      toast('Invitation sent', {
        description: `${inviteEmail} has been invited to your organization`
      });
    } catch (err) {
      toast.error('Error', {
        description:
          err instanceof Error ? err.message : 'An unknown error occurred'
      });
    }
  };

  return (
    <div className='container mx-auto space-y-6 py-6'>
      <h1 className='text-3xl font-bold'>Organizations</h1>

      {/* Create Organization */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Organization</CardTitle>
          <CardDescription>
            Create a new organization to manage your team
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Input
              placeholder='Organization name'
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateOrg}>Create Organization</Button>
        </CardFooter>
      </Card>

      {/* Organizations List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Organizations</CardTitle>
          <CardDescription>Organizations you belong to</CardDescription>
        </CardHeader>
        <CardContent>
          {organizations?.length ? (
            <div className='space-y-4'>
              {organizations.map((org: any) => (
                <div
                  key={org._id}
                  className='flex items-center justify-between rounded-lg border p-3'
                >
                  <div>
                    <h3 className='font-medium'>{org.name}</h3>
                    <p className='text-sm text-muted-foreground'>
                      Role: {org.role}
                    </p>
                  </div>
                  <Button onClick={() => setSelectedOrg(org._id)}>
                    Manage
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p>You don&apos;t belong to any organizations yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Invite Users (only shown when an org is selected) */}
      {selectedOrg && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Team Members</CardTitle>
            <CardDescription>
              Invite people to your organization
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='mb-1 block text-sm'>Email</label>
              <Input
                placeholder='Email address'
                type='email'
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div>
              <label className='mb-1 block text-sm'>Role</label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue placeholder='Select role' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='admin'>Admin</SelectItem>
                  <SelectItem value='staff'>Staff</SelectItem>
                  <SelectItem value='sales_operator'>Sales Operator</SelectItem>
                  <SelectItem value='supplier_manager'>
                    Supplier Manager
                  </SelectItem>
                  <SelectItem value='restricted'>Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className='flex justify-between'>
            <Button variant='outline' onClick={() => setSelectedOrg(null)}>
              Cancel
            </Button>
            <Button onClick={handleInviteUser}>Send Invitation</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
