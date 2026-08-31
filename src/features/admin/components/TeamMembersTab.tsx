'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserPlus,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  Shield,
  Eye,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { InviteMemberModal } from './InviteMemberModal';

const ROLE_DEFINITIONS = {
  manager: {
    name: 'Manager',
    icon: Shield,
    color: 'bg-blue-100 text-blue-800',
    permissions: [
      'Edit inventory',
      'Create transactions',
      'View reports',
      'Approve transactions'
    ]
  },
  staff: {
    name: 'Staff',
    icon: Zap,
    color: 'bg-green-100 text-green-800',
    permissions: ['Create transactions', 'Edit inventory']
  },
  viewer: {
    name: 'Viewer',
    icon: Eye,
    color: 'bg-gray-100 text-gray-800',
    permissions: ['View inventory', 'View reports']
  }
};

interface TeamMember {
  _id: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  invitedAt: number;
  roleInfo?: {
    name: string;
    permissions: string[];
  };
}

export function TeamMembersTab() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);

  // Queries
  const members = useQuery(api.companyTeam.listCompanyTeamMembers);
  const memberCount = useQuery(api.companyTeam.getCompanyMemberCount);

  // Mutations
  const removeTeamMember = useMutation(api.companyTeam.removeCompanyMember);
  const updateMemberRole = useMutation(api.companyTeam.updateCompanyMemberRole);
  const resendInvitation = useMutation(api.companyTeam.resendInvitation);

  if (!members) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
      </div>
    );
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeTeamMember({ memberId: memberId as any });
      toast.success('Team member removed successfully');
      setRemovingMemberId(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to remove member'
      );
    }
  };

  const handleRoleChange = async (
    memberId: string,
    newRole: 'manager' | 'staff' | 'viewer'
  ) => {
    try {
      await updateMemberRole({
        memberId: memberId as any,
        role: newRole
      });
      toast.success('Member role updated successfully');
      setEditingRole(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update role'
      );
    }
  };

  const handleResendInvitation = async (memberId: string) => {
    try {
      await resendInvitation({ memberId: memberId as any });
      toast.success('Invitation resent successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to resend invitation'
      );
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'accepted') {
      return (
        <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>
          <CheckCircle2 className='mr-1 h-3 w-3' />
          Active
        </Badge>
      );
    }
    return (
      <Badge className='bg-yellow-100 text-yellow-800 hover:bg-yellow-100'>
        <Clock className='mr-1 h-3 w-3' />
        Pending
      </Badge>
    );
  };

  const getRoleIcon = (role: string) => {
    const roleInfo = ROLE_DEFINITIONS[role as keyof typeof ROLE_DEFINITIONS];
    if (!roleInfo) return null;
    const Icon = roleInfo.icon;
    return <Icon className='h-4 w-4' />;
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Team Members</h2>
          <p className='mt-2 text-sm text-gray-600'>
            Manage your team members and their access levels
          </p>
        </div>
        <Button onClick={() => setIsInviteOpen(true)} className='gap-2'>
          <UserPlus className='h-4 w-4' />
          Invite Member
        </Button>
      </div>

      {/* Stats Cards */}
      {memberCount && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                Total Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold text-gray-900'>
                {memberCount.total}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold text-green-600'>
                {memberCount.active}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-gray-600'>
                Pending Invites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold text-yellow-600'>
                {memberCount.pending}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12'>
              <Users className='mb-4 h-12 w-12 text-gray-300' />
              <p className='text-center text-gray-600'>
                No team members yet. Start by inviting your first team member!
              </p>
              <Button
                onClick={() => setIsInviteOpen(true)}
                variant='outline'
                className='mt-4 gap-2'
              >
                <UserPlus className='h-4 w-4' />
                Invite First Member
              </Button>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name & Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invited At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member: TeamMember) => (
                    <TableRow key={member._id}>
                      {/* Name & Email */}
                      <TableCell>
                        <div>
                          <p className='font-medium text-gray-900'>
                            {member.displayName}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {member.email}
                          </p>
                        </div>
                      </TableCell>

                      {/* Role */}
                      <TableCell>
                        <Select
                          value={member.role}
                          onValueChange={(newRole) =>
                            handleRoleChange(
                              member._id,
                              newRole as 'manager' | 'staff' | 'viewer'
                            )
                          }
                        >
                          <SelectTrigger className='w-40'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='manager'>
                              <span className='flex items-center gap-2'>
                                <Shield className='h-4 w-4' />
                                Manager
                              </span>
                            </SelectItem>
                            <SelectItem value='staff'>
                              <span className='flex items-center gap-2'>
                                <Zap className='h-4 w-4' />
                                Staff
                              </span>
                            </SelectItem>
                            <SelectItem value='viewer'>
                              <span className='flex items-center gap-2'>
                                <Eye className='h-4 w-4' />
                                Viewer
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Status */}
                      <TableCell>{getStatusBadge(member.status)}</TableCell>

                      {/* Invited At */}
                      <TableCell className='text-sm text-gray-600'>
                        {new Date(member.invitedAt).toLocaleDateString()}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className='flex gap-2'>
                          {member.status === 'invited' && (
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleResendInvitation(member._id)}
                            >
                              Resend
                            </Button>
                          )}
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setRemovingMemberId(member._id)}
                            className='text-red-600 hover:text-red-700'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Permissions Reference */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {Object.entries(ROLE_DEFINITIONS).map(([roleKey, roleInfo]) => (
              <div key={roleKey} className='rounded-lg border p-4'>
                <div className='mb-3 flex items-center gap-2'>
                  <roleInfo.icon className='h-5 w-5' />
                  <h3 className='font-semibold text-gray-900'>
                    {roleInfo.name}
                  </h3>
                </div>
                <ul className='space-y-1 text-sm text-gray-600'>
                  {roleInfo.permissions.map((perm) => (
                    <li key={perm} className='flex items-center gap-2'>
                      <span className='h-1.5 w-1.5 rounded-full bg-gray-400' />
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />

      {/* Remove Confirmation Dialog */}
      <AlertDialog
        open={!!removingMemberId}
        onOpenChange={() => setRemovingMemberId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member? They will lose access
              to the company dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='flex justify-end gap-3'>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                removingMemberId && handleRemoveMember(removingMemberId)
              }
              className='bg-red-600 hover:bg-red-700'
            >
              Remove
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
