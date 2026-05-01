'use client';

import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  PERMISSION_OPTIONS,
  TRANSACTION_TYPE_OPTIONS
} from '@/features/teams/permissionCatalog';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import {
  InviteMemberDialog,
  TeamMembersList
} from '@/components/features/team/InviteMemberDialog';

export default function UsersPermissionsPage() {
  const { user, isLoaded } = useUser();
  const ensureDefaults = useMutation(api.teamManagement.ensureTeamDefaults);
  const [booted, setBooted] = React.useState(false);

  React.useEffect(() => {
    if (!isLoaded || !user || booted) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await ensureDefaults({});
        if (!cancelled && r.seeded) toast.success('Default roles created');
      } catch (e) {
        if (!cancelled) console.error(e);
      } finally {
        if (!cancelled) setBooted(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, user, ensureDefaults, booted]);

  const roles = useQuery(api.teamManagement.listCustomRoles) ?? [];
  const teams = useQuery(api.teamManagement.listTeams) ?? [];
  const activity =
    useQuery(api.teamManagement.listTeamActivity, { limit: 60 }) ?? [];
  const metrics = useQuery(api.teamManagement.getTeamPerformanceMetrics, {
    days: 30
  });
  const workflows = useQuery(api.teamManagement.listApprovalWorkflows) ?? [];
  const approvals = useQuery(api.teamManagement.listApprovalRequests, {}) ?? [];

  const createRole = useMutation(api.teamManagement.createCustomRole);
  const updateRole = useMutation(api.teamManagement.updateCustomRole);
  const deleteRole = useMutation(api.teamManagement.deleteCustomRole);
  const createTeam = useMutation(api.teamManagement.createTeam);
  const deleteTeam = useMutation(api.teamManagement.deleteTeam);
  const addMember = useMutation(api.teamManagement.addTeamMember);
  const removeMember = useMutation(api.teamManagement.removeTeamMember);
  const updateMemberRole = useMutation(api.teamManagement.updateTeamMemberRole);
  const upsertWorkflow = useMutation(api.teamManagement.upsertApprovalWorkflow);
  const deleteWorkflow = useMutation(api.teamManagement.deleteApprovalWorkflow);
  const createRequest = useMutation(api.teamManagement.createApprovalRequest);
  const approveStep = useMutation(api.teamManagement.approveApprovalStep);
  const rejectRequest = useMutation(api.teamManagement.rejectApprovalRequest);

  // Invitation mutations and queries
  const listInvitations = useQuery(api.teamManagement.listInvitations) ?? [];
  const createInvitation = useMutation(api.teamManagement.createInvitation);
  const deleteInvitation = useMutation(api.teamManagement.deleteInvitation);

  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteName, setInviteName] = React.useState('');
  const [inviteRoleId, setInviteRoleId] = React.useState<string>('');
  const [invitePerms, setInvitePerms] = React.useState<string[]>([
    'view_inventory',
    'create_transaction'
  ]);
  const [inviteLink, setInviteLink] = React.useState<string | null>(null);

  const [roleOpen, setRoleOpen] = React.useState(false);
  const [roleName, setRoleName] = React.useState('');
  const [roleDesc, setRoleDesc] = React.useState('');
  const [rolePerms, setRolePerms] = React.useState<string[]>([
    'view_inventory'
  ]);

  const [teamOpen, setTeamOpen] = React.useState(false);
  const [teamName, setTeamName] = React.useState('');
  const [teamDesc, setTeamDesc] = React.useState('');
  const [teamLocation, setTeamLocation] = React.useState('');

  const [memberOpen, setMemberOpen] = React.useState(false);
  const [memberTeamId, setMemberTeamId] = React.useState<Id<'teams'> | null>(
    null
  );
  const [memberKey, setMemberKey] = React.useState('');
  const [memberDisplay, setMemberDisplay] = React.useState('');
  const [memberEmail, setMemberEmail] = React.useState('');
  const [memberRoleId, setMemberRoleId] = React.useState<string>('');

  const [wfOpen, setWfOpen] = React.useState(false);
  const [wfName, setWfName] = React.useState('');
  const [wfDesc, setWfDesc] = React.useState('');
  const [wfTypes, setWfTypes] = React.useState<string[]>(['sale']);
  const [wfSteps, setWfSteps] = React.useState<
    { order: number; label: string; requiredRoleId?: string }[]
  >([{ order: 0, label: 'Manager review', requiredRoleId: undefined }]);

  const [reqOpen, setReqOpen] = React.useState(false);
  const [reqWorkflowId, setReqWorkflowId] = React.useState<string>('');
  const [reqTitle, setReqTitle] = React.useState('');
  const [reqType, setReqType] = React.useState('sale');
  const [reqRef, setReqRef] = React.useState('');
  const [reqAmount, setReqAmount] = React.useState('');

  const resetRoleForm = () => {
    setRoleName('');
    setRoleDesc('');
    setRolePerms(['view_inventory']);
  };

  const togglePerm = (id: string) => {
    setRolePerms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleWfType = (id: string) => {
    setWfTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <Tabs defaultValue='roles' className='w-full space-y-6'>
      <TabsList className='flex h-auto flex-wrap gap-1'>
        <TabsTrigger value='quick-invite'>Quick Invite</TabsTrigger>
        <TabsTrigger value='roles'>Role designer</TabsTrigger>
        <TabsTrigger value='teams'>Teams</TabsTrigger>
        <TabsTrigger value='invitations'>Invite</TabsTrigger>
        <TabsTrigger value='activity'>Activity</TabsTrigger>
        <TabsTrigger value='metrics'>Performance</TabsTrigger>
        <TabsTrigger value='approvals'>Approvals</TabsTrigger>
      </TabsList>

      <TabsContent value='quick-invite' className='space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-xl font-semibold'>Invite Team Members</h2>
            <p className='text-sm text-muted-foreground'>
              Quickly invite staff with predefined roles (Manager, Staff,
              Viewer).
            </p>
          </div>
          <InviteMemberDialog />
        </div>
        <TeamMembersList />
      </TabsContent>

      <TabsContent value='roles' className='space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-xl font-semibold'>Custom roles</h2>
            <p className='text-sm text-muted-foreground'>
              Define permissions once, then assign them to team members.
            </p>
          </div>
          <Dialog
            open={roleOpen}
            onOpenChange={(open) => {
              setRoleOpen(open);
              if (open) resetRoleForm();
            }}
          >
            <DialogTrigger asChild>
              <Button type='button'>
                <Plus className='mr-2 h-4 w-4' />
                New role
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
              <DialogHeader>
                <DialogTitle>Create role</DialogTitle>
              </DialogHeader>
              <div className='space-y-4 py-2'>
                <div className='space-y-2'>
                  <Label htmlFor='rn'>Name</Label>
                  <Input
                    id='rn'
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder='e.g. Regional lead'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='rd'>Description</Label>
                  <Textarea
                    id='rd'
                    value={roleDesc}
                    onChange={(e) => setRoleDesc(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Permissions</Label>
                  <div className='grid max-h-52 gap-2 overflow-y-auto rounded-md border p-3'>
                    {PERMISSION_OPTIONS.map((p) => (
                      <label
                        key={p.id}
                        className='flex cursor-pointer items-center gap-2 text-sm'
                      >
                        <Checkbox
                          checked={rolePerms.includes(p.id)}
                          onCheckedChange={() => togglePerm(p.id)}
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={async () => {
                    if (!roleName.trim()) {
                      toast.error('Name is required');
                      return;
                    }
                    try {
                      await createRole({
                        name: roleName.trim(),
                        description: roleDesc.trim() || undefined,
                        permissions: rolePerms
                      });
                      toast.success('Role created');
                      setRoleOpen(false);
                      resetRoleForm();
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'Failed');
                    }
                  }}
                >
                  Save role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          {roles.map((r) => (
            <Card key={r._id}>
              <CardHeader className='pb-2'>
                <div className='flex items-start justify-between gap-2'>
                  <div>
                    <CardTitle className='text-base'>{r.name}</CardTitle>
                    <CardDescription>{r.description}</CardDescription>
                  </div>
                  {r.isSystem ? (
                    <Badge variant='secondary'>Built-in</Badge>
                  ) : (
                    <Button
                      variant='ghost'
                      size='icon'
                      className='shrink-0 text-destructive'
                      onClick={async () => {
                        if (!confirm(`Delete role “${r.name}”?`)) return;
                        try {
                          await deleteRole({ roleId: r._id });
                          toast.success('Role deleted');
                        } catch (e) {
                          toast.error(
                            e instanceof Error ? e.message : 'Failed'
                          );
                        }
                      }}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex flex-wrap gap-1'>
                  {r.permissions.map((p) => (
                    <Badge key={p} variant='outline' className='font-normal'>
                      {p.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
                <RoleEditor
                  permissions={r.permissions}
                  onSave={async (perms) => {
                    await updateRole({ roleId: r._id, permissions: perms });
                    toast.success('Permissions updated');
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value='teams' className='space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-xl font-semibold'>Teams & departments</h2>
            <p className='text-sm text-muted-foreground'>
              Group people by department or location. Use each member&apos;s
              Clerk user ID as Member key so approvals can match their role
              later.
            </p>
          </div>
          <Dialog
            open={teamOpen}
            onOpenChange={(o) => {
              setTeamOpen(o);
              if (!o) {
                setTeamName('');
                setTeamDesc('');
                setTeamLocation('');
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                New team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create team</DialogTitle>
              </DialogHeader>
              <div className='space-y-3 py-2'>
                <div className='space-y-2'>
                  <Label>Name</Label>
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Description</Label>
                  <Textarea
                    value={teamDesc}
                    onChange={(e) => setTeamDesc(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Location label (optional)</Label>
                  <Input
                    value={teamLocation}
                    onChange={(e) => setTeamLocation(e.target.value)}
                    placeholder='e.g. Warehouse A'
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={async () => {
                    if (!teamName.trim()) {
                      toast.error('Name is required');
                      return;
                    }
                    try {
                      await createTeam({
                        name: teamName.trim(),
                        description: teamDesc.trim() || undefined,
                        locationLabel: teamLocation.trim() || undefined
                      });
                      toast.success('Team created');
                      setTeamOpen(false);
                      setTeamName('');
                      setTeamDesc('');
                      setTeamLocation('');
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'Failed');
                    }
                  }}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoaded && user && (
          <p className='text-xs text-muted-foreground'>
            Your Clerk user id (for testing member assignments):{' '}
            <code className='rounded bg-muted px-1 py-0.5'>{user.id}</code>
          </p>
        )}

        <div className='grid gap-4 lg:grid-cols-2'>
          {teams.map((t) => (
            <TeamCard
              key={t._id}
              team={t}
              roles={roles}
              onDelete={async () => {
                if (!confirm(`Delete team “${t.name}”?`)) return;
                try {
                  await deleteTeam({ teamId: t._id });
                  toast.success('Team removed');
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : 'Failed');
                }
              }}
              onAddMember={() => {
                setMemberTeamId(t._id);
                setMemberKey('');
                setMemberDisplay('');
                setMemberEmail('');
                setMemberRoleId('');
                setMemberOpen(true);
              }}
              onRemoveMember={async (id) => {
                try {
                  await removeMember({ teamMemberId: id });
                  toast.success('Member removed');
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : 'Failed');
                }
              }}
              onChangeMemberRole={async (memberId, roleId) => {
                try {
                  await updateMemberRole({
                    teamMemberId: memberId,
                    customRoleId: roleId
                      ? (roleId as Id<'customRoles'>)
                      : undefined
                  });
                  toast.success('Role updated');
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : 'Failed');
                }
              }}
            />
          ))}
        </div>

        <Dialog
          open={memberOpen}
          onOpenChange={(o) => {
            setMemberOpen(o);
            if (!o) setMemberTeamId(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add team member</DialogTitle>
            </DialogHeader>
            <div className='space-y-3 py-2'>
              <div className='space-y-2'>
                <Label>Member key (Clerk user id)</Label>
                <Input
                  value={memberKey}
                  onChange={(e) => setMemberKey(e.target.value)}
                  placeholder='user_...'
                />
              </div>
              <div className='space-y-2'>
                <Label>Display name</Label>
                <Input
                  value={memberDisplay}
                  onChange={(e) => setMemberDisplay(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label>Email (optional)</Label>
                <Input
                  type='email'
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label>Role</Label>
                <Select
                  value={memberRoleId || '__none'}
                  onValueChange={setMemberRoleId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select role' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='__none'>No role</SelectItem>
                    {roles.map((r) => (
                      <SelectItem key={r._id} value={r._id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={async () => {
                  if (
                    !memberTeamId ||
                    !memberKey.trim() ||
                    !memberDisplay.trim()
                  ) {
                    toast.error(
                      'Team, member key, and display name are required'
                    );
                    return;
                  }
                  try {
                    await addMember({
                      teamId: memberTeamId,
                      memberKey: memberKey.trim(),
                      displayName: memberDisplay.trim(),
                      email: memberEmail.trim() || undefined,
                      customRoleId:
                        memberRoleId && memberRoleId !== '__none'
                          ? (memberRoleId as Id<'customRoles'>)
                          : undefined
                    });
                    toast.success('Member added');
                    setMemberOpen(false);
                    setMemberTeamId(null);
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Failed');
                  }
                }}
              >
                Add member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TabsContent>

      <TabsContent value='invitations' className='space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-xl font-semibold'>Invite team member</h2>
            <p className='text-sm text-muted-foreground'>
              Send an invitation link to someone. They can sign up and
              automatically join your organization.
            </p>
          </div>
          <Dialog
            open={inviteOpen}
            onOpenChange={(o) => {
              setInviteOpen(o);
              if (!o) setInviteLink(null);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Send invitation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite team member</DialogTitle>
              </DialogHeader>
              {inviteLink ? (
                <div className='space-y-3 py-2'>
                  <p className='text-sm text-muted-foreground'>
                    Share this link with {inviteName || inviteEmail}:
                  </p>
                  <div className='flex gap-2'>
                    <Input
                      value={inviteLink}
                      readOnly
                      className='font-mono text-xs'
                    />
                    <Button
                      variant='secondary'
                      onClick={() => {
                        navigator.clipboard.writeText(inviteLink);
                        toast.success('Link copied!');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Link expires in 7 days.
                  </p>
                </div>
              ) : (
                <div className='space-y-3 py-2'>
                  <div className='space-y-2'>
                    <Label>Name</Label>
                    <Input
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder='e.g. John Doe'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Email</Label>
                    <Input
                      type='email'
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder='staff@company.com'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Role</Label>
                    <Select
                      value={inviteRoleId || '__none'}
                      onValueChange={setInviteRoleId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select role' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='__none'>
                          No role (custom permissions)
                        </SelectItem>
                        {roles.map((r) => (
                          <SelectItem key={r._id} value={r._id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label>Permissions</Label>
                    <div className='grid max-h-32 gap-1 overflow-y-auto rounded-md border p-2'>
                      {PERMISSION_OPTIONS.map((p) => (
                        <label
                          key={p.id}
                          className='flex items-center gap-2 text-sm'
                        >
                          <Checkbox
                            checked={invitePerms.includes(p.id)}
                            onCheckedChange={() =>
                              setInvitePerms((prev) =>
                                prev.includes(p.id)
                                  ? prev.filter((x) => x !== p.id)
                                  : [...prev, p.id]
                              )
                            }
                          />
                          {p.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                {!inviteLink && (
                  <Button
                    onClick={async () => {
                      if (!inviteName.trim() || !inviteEmail.trim()) {
                        toast.error('Name and email are required');
                        return;
                      }
                      try {
                        const roleId =
                          inviteRoleId && inviteRoleId !== '__none'
                            ? (inviteRoleId as Id<'customRoles'>)
                            : undefined;
                        const result = await createInvitation({
                          email: inviteEmail.trim(),
                          name: inviteName.trim(),
                          roleId,
                          permissions: invitePerms
                        });
                        const link = `${window.location.origin}/sign-up?invite=${result.token}`;
                        setInviteLink(link);
                        toast.success('Invitation created');
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : 'Failed');
                      }
                    }}
                  >
                    Create invitation
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className='rounded-md border'>
          {listInvitations.length === 0 ? (
            <div className='p-8 text-center text-sm text-muted-foreground'>
              No invitations sent yet.
            </div>
          ) : (
            <table className='w-full text-sm'>
              <thead className='border-b bg-muted/50'>
                <tr>
                  <th className='px-3 py-2 text-left font-medium'>Name</th>
                  <th className='px-3 py-2 text-left font-medium'>Email</th>
                  <th className='px-3 py-2 text-left font-medium'>
                    Permissions
                  </th>
                  <th className='px-3 py-2 text-left font-medium'>Status</th>
                  <th className='px-3 py-2 text-left font-medium'>Sent</th>
                  <th className='px-3 py-2'></th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {listInvitations.map((inv) => (
                  <tr key={inv._id}>
                    <td className='px-3 py-2'>{inv.name}</td>
                    <td className='px-3 py-2 font-mono text-xs'>{inv.email}</td>
                    <td className='px-3 py-2'>
                      <div className='flex flex-wrap gap-1'>
                        {inv.permissions.slice(0, 2).map((p) => (
                          <Badge
                            key={p}
                            variant='outline'
                            className='text-[10px]'
                          >
                            {p.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {inv.permissions.length > 2 && (
                          <Badge variant='outline' className='text-[10px]'>
                            +{inv.permissions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className='px-3 py-2'>
                      <Badge
                        variant={
                          inv.status === 'pending'
                            ? 'default'
                            : inv.status === 'accepted'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className='px-3 py-2 text-muted-foreground'>
                      {new Date(inv.invitedAt).toLocaleDateString()}
                    </td>
                    <td className='px-3 py-2'>
                      {inv.status === 'pending' && (
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-destructive'
                          onClick={async () => {
                            if (!confirm('Cancel this invitation?')) return;
                            try {
                              await deleteInvitation({ invitationId: inv._id });
                              toast.success('Invitation cancelled');
                            } catch (e) {
                              toast.error(
                                e instanceof Error ? e.message : 'Failed'
                              );
                            }
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </TabsContent>

      <TabsContent value='activity' className='space-y-4'>
        <h2 className='text-xl font-semibold'>Team activity</h2>
        <p className='text-sm text-muted-foreground'>
          Recent actions across teams, members, and approvals (tenant-scoped).
        </p>
        <Card>
          <CardContent className='p-0'>
            <ul className='divide-y'>
              {activity.length === 0 && (
                <li className='px-4 py-8 text-center text-sm text-muted-foreground'>
                  No activity yet. Create teams or run approvals to populate
                  this feed.
                </li>
              )}
              {activity.map((a) => (
                <li
                  key={a._id}
                  className='flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 text-sm'
                >
                  <span className='font-medium text-foreground'>
                    {a.action}
                  </span>
                  {a.details && (
                    <span className='text-muted-foreground'>{a.details}</span>
                  )}
                  <span className='ml-auto text-xs text-muted-foreground'>
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='metrics' className='space-y-4'>
        <h2 className='text-xl font-semibold'>Performance</h2>
        <p className='text-sm text-muted-foreground'>
          Activity volume by actor and team size over the last{' '}
          {metrics?.windowDays ?? 30} days.
        </p>
        {!metrics ? (
          <div className='flex justify-center py-12'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Summary</CardTitle>
              </CardHeader>
              <CardContent className='space-y-1 text-sm'>
                <p>Total actions: {metrics.totalActions}</p>
                <p>Teams: {metrics.teamCount}</p>
                <p>Members (all teams): {metrics.memberCount}</p>
                <p>Avg members / team: {metrics.avgMembersPerTeam}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Actions by actor</CardTitle>
                <CardDescription>From team activity log</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm'>
                  {metrics.actionsByActor.length === 0 && (
                    <li className='text-muted-foreground'>
                      No data in this window.
                    </li>
                  )}
                  {metrics.actionsByActor.map((row) => (
                    <li
                      key={row.actorKey}
                      className='flex justify-between gap-2'
                    >
                      <code className='truncate text-xs'>{row.actorKey}</code>
                      <span className='shrink-0 font-medium'>{row.count}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className='md:col-span-2'>
              <CardHeader>
                <CardTitle className='text-base'>Headcount by team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {metrics.membersPerTeam.map((m) => (
                    <Badge key={m.teamId} variant='outline'>
                      {m.name}: {m.members}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>

      <TabsContent value='approvals' className='space-y-6'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-xl font-semibold'>Approval workflows</h2>
            <p className='text-sm text-muted-foreground'>
              Multi-level steps. Each step can require a specific custom role
              with the &quot;Approve transaction&quot; permission.
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Dialog
              open={wfOpen}
              onOpenChange={(o) => {
                setWfOpen(o);
                if (!o) {
                  setWfName('');
                  setWfDesc('');
                  setWfTypes(['sale']);
                  setWfSteps([
                    {
                      order: 0,
                      label: 'Manager review',
                      requiredRoleId: undefined
                    }
                  ]);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button variant='secondary'>New workflow</Button>
              </DialogTrigger>
              <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
                <DialogHeader>
                  <DialogTitle>Workflow</DialogTitle>
                </DialogHeader>
                <div className='space-y-4 py-2'>
                  <div className='space-y-2'>
                    <Label>Name</Label>
                    <Input
                      value={wfName}
                      onChange={(e) => setWfName(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Description</Label>
                    <Textarea
                      value={wfDesc}
                      onChange={(e) => setWfDesc(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Applies to</Label>
                    <div className='flex flex-wrap gap-3'>
                      {TRANSACTION_TYPE_OPTIONS.map((t) => (
                        <label
                          key={t.id}
                          className='flex items-center gap-2 text-sm'
                        >
                          <Checkbox
                            checked={wfTypes.includes(t.id)}
                            onCheckedChange={() => toggleWfType(t.id)}
                          />
                          {t.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <Label>Steps</Label>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          setWfSteps((s) => [
                            ...s,
                            {
                              order: s.length,
                              label: `Step ${s.length + 1}`,
                              requiredRoleId: undefined
                            }
                          ])
                        }
                      >
                        Add step
                      </Button>
                    </div>
                    <div className='space-y-3 rounded-md border p-3'>
                      {wfSteps.map((step, idx) => (
                        <div key={idx} className='grid gap-2 sm:grid-cols-2'>
                          <Input
                            placeholder='Step label'
                            value={step.label}
                            onChange={(e) => {
                              const next = [...wfSteps];
                              next[idx] = {
                                ...next[idx],
                                label: e.target.value
                              };
                              setWfSteps(next);
                            }}
                          />
                          <Select
                            value={step.requiredRoleId ?? '__any'}
                            onValueChange={(v) => {
                              const next = [...wfSteps];
                              next[idx] = {
                                ...next[idx],
                                requiredRoleId: v === '__any' ? undefined : v
                              };
                              setWfSteps(next);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Approver role' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='__any'>
                                Any approver role
                              </SelectItem>
                              {roles.map((r) => (
                                <SelectItem key={r._id} value={r._id}>
                                  {r.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={async () => {
                      if (!wfName.trim() || wfTypes.length === 0) {
                        toast.error(
                          'Name and at least one transaction type are required'
                        );
                        return;
                      }
                      try {
                        await upsertWorkflow({
                          name: wfName.trim(),
                          description: wfDesc.trim() || undefined,
                          transactionTypes: wfTypes,
                          steps: wfSteps.map((s, i) => ({
                            order: i,
                            label: s.label || `Step ${i + 1}`,
                            requiredRoleId: s.requiredRoleId as
                              | Id<'customRoles'>
                              | undefined
                          })),
                          isActive: true
                        });
                        toast.success('Workflow saved');
                        setWfOpen(false);
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : 'Failed');
                      }
                    }}
                  >
                    Save workflow
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={reqOpen}
              onOpenChange={(o) => {
                setReqOpen(o);
                if (!o) {
                  setReqWorkflowId('');
                  setReqTitle('');
                  setReqRef('');
                  setReqAmount('');
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  New approval request
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit for approval</DialogTitle>
                </DialogHeader>
                <div className='space-y-3 py-2'>
                  <div className='space-y-2'>
                    <Label>Workflow</Label>
                    <Select
                      value={reqWorkflowId}
                      onValueChange={setReqWorkflowId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Choose workflow' />
                      </SelectTrigger>
                      <SelectContent>
                        {workflows.map((w) => (
                          <SelectItem key={w._id} value={w._id}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label>Title</Label>
                    <Input
                      value={reqTitle}
                      onChange={(e) => setReqTitle(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Resource type</Label>
                    <Select value={reqType} onValueChange={setReqType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSACTION_TYPE_OPTIONS.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label>Resource id (reference)</Label>
                    <Input
                      value={reqRef}
                      onChange={(e) => setReqRef(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Amount (optional)</Label>
                    <Input
                      value={reqAmount}
                      onChange={(e) => setReqAmount(e.target.value)}
                      placeholder='0'
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={async () => {
                      if (
                        !reqWorkflowId ||
                        !reqTitle.trim() ||
                        !reqRef.trim()
                      ) {
                        toast.error(
                          'Workflow, title, and resource id are required'
                        );
                        return;
                      }
                      try {
                        await createRequest({
                          workflowId: reqWorkflowId as Id<'approvalWorkflows'>,
                          title: reqTitle.trim(),
                          resourceType: reqType,
                          resourceId: reqRef.trim(),
                          amount: reqAmount.trim()
                            ? Number(reqAmount)
                            : undefined
                        });
                        toast.success('Request created');
                        setReqOpen(false);
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : 'Failed');
                      }
                    }}
                  >
                    Submit
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className='grid gap-4 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Configured workflows</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {workflows.length === 0 && (
                <p className='text-sm text-muted-foreground'>
                  No workflows yet.
                </p>
              )}
              {workflows.map((w) => (
                <div
                  key={w._id}
                  className='flex flex-col gap-2 rounded-lg border p-3 text-sm sm:flex-row sm:items-center sm:justify-between'
                >
                  <div>
                    <p className='font-medium'>{w.name}</p>
                    <p className='text-muted-foreground'>
                      {w.transactionTypes.join(', ')} · {w.steps.length} step(s)
                    </p>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-destructive'
                    onClick={async () => {
                      if (!confirm('Delete this workflow?')) return;
                      try {
                        await deleteWorkflow({ workflowId: w._id });
                        toast.success('Deleted');
                      } catch (e) {
                        toast.error(e instanceof Error ? e.message : 'Failed');
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Requests</CardTitle>
              <CardDescription>Approve or reject pending items</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {approvals.filter((a) => a.status === 'pending').length === 0 && (
                <p className='text-sm text-muted-foreground'>
                  No pending requests.
                </p>
              )}
              {approvals
                .filter((a) => a.status === 'pending')
                .map((a) => (
                  <div key={a._id} className='rounded-lg border p-3 text-sm'>
                    <p className='font-medium'>{a.title}</p>
                    <p className='text-muted-foreground'>
                      {a.resourceType} · {a.resourceId}
                      {a.amount != null && ` · ${a.amount}`}
                    </p>
                    <div className='mt-2 flex flex-wrap gap-2'>
                      <Button
                        size='sm'
                        onClick={async () => {
                          try {
                            await approveStep({ requestId: a._id });
                            toast.success('Step approved');
                          } catch (e) {
                            toast.error(
                              e instanceof Error ? e.message : 'Failed'
                            );
                          }
                        }}
                      >
                        Approve step
                      </Button>
                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={async () => {
                          try {
                            await rejectRequest({ requestId: a._id });
                            toast.success('Rejected');
                          } catch (e) {
                            toast.error(
                              e instanceof Error ? e.message : 'Failed'
                            );
                          }
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function RoleEditor({
  permissions,
  onSave
}: {
  permissions: string[];
  onSave: (p: string[]) => Promise<void>;
}) {
  const [local, setLocal] = React.useState(permissions);
  React.useEffect(() => {
    setLocal(permissions);
  }, [permissions]);

  return (
    <div className='space-y-2 rounded-md border p-3'>
      <p className='text-xs font-medium text-muted-foreground'>
        Edit permissions
      </p>
      <div className='grid max-h-36 gap-1 overflow-y-auto'>
        {PERMISSION_OPTIONS.map((p) => (
          <label key={p.id} className='flex items-center gap-2 text-xs'>
            <Checkbox
              checked={local.includes(p.id)}
              onCheckedChange={() =>
                setLocal((prev) =>
                  prev.includes(p.id)
                    ? prev.filter((x) => x !== p.id)
                    : [...prev, p.id]
                )
              }
            />
            {p.label}
          </label>
        ))}
      </div>
      <Button size='sm' variant='secondary' onClick={() => onSave(local)}>
        Update permissions
      </Button>
    </div>
  );
}

function TeamCard({
  team,
  roles,
  onDelete,
  onAddMember,
  onRemoveMember,
  onChangeMemberRole
}: {
  team: {
    _id: Id<'teams'>;
    name: string;
    description?: string;
    locationLabel?: string;
  };
  roles: { _id: Id<'customRoles'>; name: string }[];
  onDelete: () => void;
  onAddMember: () => void;
  onRemoveMember: (id: Id<'teamMembers'>) => void;
  onChangeMemberRole: (memberId: Id<'teamMembers'>, roleId: string) => void;
}) {
  const members =
    useQuery(api.teamManagement.listTeamMembers, { teamId: team._id }) ?? [];

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between gap-2'>
          <div>
            <CardTitle className='text-base'>{team.name}</CardTitle>
            <CardDescription>
              {[team.description, team.locationLabel]
                .filter(Boolean)
                .join(' · ') || 'No description'}
            </CardDescription>
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='text-destructive'
            onClick={onDelete}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='flex flex-wrap gap-2'>
          <Button size='sm' variant='secondary' onClick={onAddMember}>
            <Plus className='mr-1 h-3 w-3' />
            Add member
          </Button>
        </div>
        <ul className='space-y-2 text-sm'>
          {members.length === 0 && (
            <li className='text-muted-foreground'>No members yet.</li>
          )}
          {members.map((m) => (
            <li
              key={m._id}
              className='flex flex-col gap-2 rounded-md border px-3 py-2 sm:flex-row sm:items-center sm:justify-between'
            >
              <div>
                <p className='font-medium'>{m.displayName}</p>
                <p className='text-xs text-muted-foreground'>
                  <code>{m.memberKey}</code>
                </p>
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                <Select
                  value={m.customRoleId ?? '__none'}
                  onValueChange={(v) =>
                    onChangeMemberRole(m._id, v === '__none' ? '' : v)
                  }
                >
                  <SelectTrigger className='h-8 w-[160px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='__none'>No role</SelectItem>
                    {roles.map((r) => (
                      <SelectItem key={r._id} value={r._id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => onRemoveMember(m._id)}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
