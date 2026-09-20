'use client';

import { useState } from 'react';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';
import { useUser } from '@clerk/clerk-react';
import { Loader2, Plus, Trash2, Copy, Mail, CheckCircle } from 'lucide-react';

interface InviteResult {
  success: boolean;
  membershipId: string;
  email: string;
  displayName: string;
  role: string;
  token: string;
  inviteLink: string;
  expiresAt: number;
}

/**
 * Component to invite new team members with email and link sharing
 * Only shown to organization owners
 */
export function InviteMemberDialog() {
  const { can, isOwner, isLoading } = useUserRole();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('staff');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);
  const [isEmailSending, setIsEmailSending] = useState(false);

  const customRoles = useQuery(api.teamManagement.listCustomRoles) || [];
  const inviteMember = useMutation(api.companyAccess.inviteMember);
  const sendInviteEmail = useAction(api.companyAccessActions.sendInviteEmail);

  const handleInvite = async () => {
    console.log('[InviteMemberDialog] handleInvite called with:', {
      email,
      displayName,
      role
    });

    if (!email || !displayName) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('[InviteMemberDialog] Calling inviteMember mutation...');
      const result = await inviteMember({
        email,
        displayName,
        role
      });
      console.log('[InviteMemberDialog] Mutation result:', result);
      setInviteResult(result as InviteResult);
    } catch (error: any) {
      console.error('[InviteMemberDialog] Error:', error);
      toast.error(error?.message || 'Failed to create invitation');
      setIsSubmitting(false);
    }
  };

  const handleSendEmail = async () => {
    if (!inviteResult) return;

    try {
      setIsEmailSending(true);
      await sendInviteEmail({
        to: inviteResult.email,
        displayName: inviteResult.displayName,
        inviteLink: inviteResult.inviteLink,
        ownerName: user?.firstName || 'Your Administrator',
        companyName: 'Digital Dukan',
        role: inviteResult.role
      });
      toast.success(`Invitation email sent to ${inviteResult.email}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send email');
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleCopyLink = () => {
    if (!inviteResult || !inviteResult.inviteLink) {
      toast.error('Invite link not available');
      return;
    }
    navigator.clipboard.writeText(inviteResult.inviteLink);
    toast.success('Invite link copied to clipboard');
  };

  const handleClose = () => {
    setOpen(false);
    setInviteResult(null);
    setEmail('');
    setDisplayName('');
    setRole('staff');
    setIsSubmitting(false);
  };

  if (isLoading || !isOwner || !can('manage_users')) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='gap-2'>
          <Plus className='h-4 w-4' />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            {!inviteResult
              ? 'Create an invitation for a new team member'
              : 'Choose how to share the invitation'}
          </DialogDescription>
        </DialogHeader>

        {!inviteResult ? (
          <div className='space-y-4'>
            <div>
              <Label htmlFor='email'>Email Address</Label>
              <Input
                id='email'
                type='email'
                placeholder='member@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor='displayName'>Display Name</Label>
              <Input
                id='displayName'
                placeholder='John Doe'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor='role'>Role</Label>
              <Select
                value={role}
                onValueChange={setRole}
                disabled={isSubmitting}
              >
                <SelectTrigger id='role'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='manager'>Manager - Full Access</SelectItem>
                  <SelectItem value='staff'>Staff - Limited Access</SelectItem>
                  <SelectItem value='viewer'>Viewer - Read Only</SelectItem>
                  {customRoles.length > 0 && (
                    <>
                      <div className='px-2 py-1.5 text-xs font-semibold text-muted-foreground'>
                        Custom Roles
                      </div>
                      {customRoles.map((cr: any) => (
                        <SelectItem key={cr._id} value={cr.name}>
                          {cr.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              <p className='mt-2 text-xs text-muted-foreground'>
                The selected role determines what features this team member can
                access.
              </p>
            </div>
            <Button
              onClick={handleInvite}
              disabled={isSubmitting}
              className='w-full'
            >
              {isSubmitting && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              Create Invitation
            </Button>
          </div>
        ) : (
          <div className='space-y-4'>
            <Alert className='border-emerald-200 bg-emerald-50'>
              <CheckCircle className='h-4 w-4 text-emerald-600' />
              <AlertDescription className='text-emerald-800'>
                Invitation created for <strong>{inviteResult.email}</strong> as{' '}
                <strong>{inviteResult.role}</strong>
              </AlertDescription>
            </Alert>

            <Tabs defaultValue='email' className='w-full'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='email'>Email Invite</TabsTrigger>
                <TabsTrigger value='link'>Copy Link</TabsTrigger>
              </TabsList>

              <TabsContent value='email' className='space-y-3'>
                <p className='text-sm text-muted-foreground'>
                  Send an email invitation to {inviteResult.email}
                </p>
                <Button
                  onClick={handleSendEmail}
                  disabled={isEmailSending}
                  className='w-full gap-2'
                  variant='default'
                >
                  {isEmailSending && (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  )}
                  <Mail className='h-4 w-4' />
                  Send Email Invitation
                </Button>
                <p className='text-xs text-muted-foreground'>
                  An HTML email with the invitation link will be sent to the
                  member.
                </p>
              </TabsContent>

              <TabsContent value='link' className='space-y-3'>
                <p className='text-sm text-muted-foreground'>
                  Share this link directly with the member or in a message:
                </p>
                <div className='flex gap-2'>
                  <Input
                    readOnly
                    value={inviteResult?.inviteLink || ''}
                    placeholder='Link will appear here...'
                    className='font-mono text-xs'
                  />
                  <Button
                    onClick={handleCopyLink}
                    size='icon'
                    variant='outline'
                    disabled={!inviteResult?.inviteLink}
                  >
                    <Copy className='h-4 w-4' />
                  </Button>
                </div>
                <p className='text-xs text-muted-foreground'>
                  The link expires in 7 days. You can resend invitations from
                  the Members list.
                </p>
              </TabsContent>
            </Tabs>

            <Button onClick={handleClose} variant='outline' className='w-full'>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Component to list and manage team members and pending invitations
 */
export function TeamMembersList() {
  const { can, isOwner, isLoading } = useUserRole();
  const members = useQuery(api.companyAccess.listOrganizationMembers);
  const pendingInvites = useQuery(api.companyAccess.getPendingInvitations);
  const customRoles = useQuery(api.teamManagement.listCustomRoles) || [];
  const removeMember = useMutation(api.companyAccess.removeMember);
  const updateMemberRole = useMutation(api.companyAccess.updateMemberRole);
  const resendInvitation = useMutation(api.companyAccess.resendInvitation);
  const [isRemoving, setIsRemoving] = useState<Id<'companyMembers'> | null>(
    null
  );
  const [isResending, setIsResending] = useState<Id<'companyMembers'> | null>(
    null
  );

  if (isLoading || !isOwner || !can('manage_users')) {
    return null;
  }

  const handleRemove = async (membershipId: Id<'companyMembers'>) => {
    try {
      setIsRemoving(membershipId);
      await removeMember({ membershipId });
      toast.success('Member removed');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to remove member');
    } finally {
      setIsRemoving(null);
    }
  };

  const handleRoleChange = async (
    membershipId: Id<'companyMembers'>,
    newRole: string
  ) => {
    try {
      await updateMemberRole({ membershipId, role: newRole });
      toast.success('Role updated');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update role');
    }
  };

  const handleResendInvite = async (membershipId: Id<'companyMembers'>) => {
    try {
      setIsResending(membershipId);
      const result = await resendInvitation({ membershipId });
      toast.success(`Invitation resent to ${result.email}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to resend invitation');
    } finally {
      setIsResending(null);
    }
  };

  const handleCopyInviteLink = (inviteLink: string) => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied to clipboard');
  };

  if (!members || !pendingInvites) {
    return <div>Loading members...</div>;
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className='space-y-6'>
      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <Card className='border-amber-200 bg-amber-50'>
          <CardHeader>
            <CardTitle className='text-amber-900'>
              Pending Invitations ({pendingInvites.length})
            </CardTitle>
            <CardDescription className='text-amber-800'>
              Team members waiting to accept their invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {pendingInvites.map((invite) => {
                const daysUntilExpiry = Math.ceil(
                  ((invite.expiresAt ?? Date.now()) - Date.now()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={invite._id}
                    className='flex items-center justify-between rounded-lg border border-amber-200 bg-white p-4'
                  >
                    <div className='flex-1'>
                      <p className='font-medium'>{invite.displayName}</p>
                      <p className='text-sm text-muted-foreground'>
                        {invite.email}
                      </p>
                      <div className='mt-2 flex gap-2'>
                        <span className='inline-flex items-center rounded bg-amber-100 px-2 py-1 text-xs text-amber-700'>
                          {invite.role}
                        </span>
                        {invite.isExpired ? (
                          <span className='inline-flex items-center rounded bg-red-100 px-2 py-1 text-xs text-red-700'>
                            Expired
                          </span>
                        ) : (
                          <span className='inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs text-blue-700'>
                            Expires in {daysUntilExpiry} days
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          handleCopyInviteLink(invite.inviteLink || '')
                        }
                        title='Copy invite link'
                      >
                        <Copy className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleResendInvite(invite._id)}
                        disabled={isResending === invite._id}
                        title='Resend invitation'
                      >
                        {isResending === invite._id ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <Mail className='h-4 w-4' />
                        )}
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleRemove(invite._id)}
                        disabled={isRemoving === invite._id}
                      >
                        {isRemoving === invite._id ? (
                          <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                          <Trash2 className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Members */}
      <Card>
        <CardHeader>
          <CardTitle>
            Active Members {members.length > 0 && `(${members.length})`}
          </CardTitle>
          <CardDescription>
            Members who have accepted invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              No active members yet.
            </p>
          ) : (
            <div className='space-y-4'>
              {members.map((member) => (
                <div
                  key={member._id}
                  className='flex items-center justify-between rounded-lg border p-4'
                >
                  <div>
                    <p className='font-medium'>{member.displayName}</p>
                    <p className='text-sm text-muted-foreground'>
                      {member.email}
                    </p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      Accepted on{' '}
                      {formatDate(member.acceptedAt || member.invitedAt)}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Select
                      value={member.role}
                      onValueChange={(newRole) =>
                        handleRoleChange(member._id, newRole)
                      }
                    >
                      <SelectTrigger className='w-[150px]'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='manager'>Manager</SelectItem>
                        <SelectItem value='staff'>Staff</SelectItem>
                        <SelectItem value='viewer'>Viewer</SelectItem>
                        {customRoles.length > 0 && (
                          <>
                            <div className='px-2 py-1.5 text-xs font-semibold text-muted-foreground'>
                              Custom Roles
                            </div>
                            {customRoles.map((cr: any) => (
                              <SelectItem key={cr._id} value={cr.name}>
                                {cr.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleRemove(member._id)}
                      disabled={isRemoving === member._id}
                    >
                      {isRemoving === member._id ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Trash2 className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
