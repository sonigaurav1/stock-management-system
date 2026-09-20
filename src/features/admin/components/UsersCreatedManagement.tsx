'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Search,
  Users,
  UserCheck,
  ShieldCheck,
  UserPlus,
  Eye,
  Calendar,
  Mail,
  AtSign,
  Building
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface UserProfileItem {
  _id: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name: string;
  username: string;
  role: string;
  organizationName?: string;
  status: string;
  createdAt: number;
  updatedAt?: number;
}

const mockUsers: UserProfileItem[] = [
  {
    _id: 'u1',
    userId: 'user_clerk_101',
    email: 'alex.smith@acme.com',
    firstName: 'Alex',
    lastName: 'Smith',
    name: 'Alex Smith',
    username: 'alex_smith',
    role: 'Owner',
    organizationName: 'Acme Logistics',
    status: 'active',
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000
  },
  {
    _id: 'u2',
    userId: 'user_clerk_102',
    email: 'sarah.johnson@techcorp.io',
    firstName: 'Sarah',
    lastName: 'Johnson',
    name: 'Sarah Johnson',
    username: 'sarah_j',
    role: 'Admin',
    organizationName: 'TechCorp Solutions',
    status: 'active',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000
  },
  {
    _id: 'u3',
    userId: 'user_clerk_103',
    email: 'michael.brown@retailhub.com',
    firstName: 'Michael',
    lastName: 'Brown',
    name: 'Michael Brown',
    username: 'mbrown',
    role: 'Manager',
    organizationName: 'RetailHub Superstore',
    status: 'active',
    createdAt: Date.now() - 28 * 24 * 60 * 60 * 1000
  },
  {
    _id: 'u4',
    userId: 'user_clerk_104',
    email: 'priya.sharma@dukan.np',
    firstName: 'Priya',
    lastName: 'Sharma',
    name: 'Priya Sharma',
    username: 'priyasharma',
    role: 'Staff',
    organizationName: 'Dukan Traders',
    status: 'active',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000
  },
  {
    _id: 'u5',
    userId: 'user_clerk_105',
    email: 'david.lee@innovate.co',
    firstName: 'David',
    lastName: 'Lee',
    name: 'David Lee',
    username: 'dlee_dev',
    role: 'Viewer',
    organizationName: 'Innovate Labs',
    status: 'invited',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000
  }
];

function getRoleBadgeColor(role: string) {
  switch (role.toLowerCase()) {
    case 'owner':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200';
    case 'admin':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
    case 'manager':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200';
    case 'staff':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200';
  }
}

export function UsersCreatedManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserProfileItem | null>(
    null
  );

  // Fetch real users from Convex DB
  const convexUsers = useQuery(api.admin.getAllUsers, {
    search: searchTerm || undefined
  });

  const rawUsers: UserProfileItem[] =
    convexUsers && convexUsers.length > 0
      ? (convexUsers as UserProfileItem[])
      : mockUsers;

  const filteredUsers = rawUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === 'all' ||
      user.role.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesRole;
  });

  const stats = {
    total: rawUsers.length,
    newThisWeek: rawUsers.filter(
      (u) => u.createdAt >= Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length,
    owners: rawUsers.filter((u) => u.role.toLowerCase() === 'owner').length,
    active: rawUsers.filter((u) => u.status === 'active').length
  };

  return (
    <div className='space-y-6'>
      {/* Metrics Row */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Users Created
              </CardTitle>
              <div className='rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400'>
                <Users className='h-4 w-4' />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>{stats.total}</p>
            <p className='text-xs text-muted-foreground'>Registered accounts</p>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                New This Week
              </CardTitle>
              <div className='rounded-lg bg-green-500/10 p-2 text-green-600 dark:text-green-400'>
                <UserPlus className='h-4 w-4' />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
              +{stats.newThisWeek}
            </p>
            <p className='text-xs text-muted-foreground'>Past 7 days</p>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Account Owners
              </CardTitle>
              <div className='rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400'>
                <ShieldCheck className='h-4 w-4' />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
              {stats.owners}
            </p>
            <p className='text-xs text-muted-foreground'>Organization admins</p>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Active Status
              </CardTitle>
              <div className='rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400'>
                <UserCheck className='h-4 w-4' />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold text-emerald-600 dark:text-emerald-400'>
              {stats.active}
            </p>
            <p className='text-xs text-muted-foreground'>Active users</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className='border-0 shadow-sm'>
        <CardHeader>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <CardTitle>Registered Users List</CardTitle>
            <div className='flex flex-wrap gap-2'>
              <div className='relative min-w-[220px] flex-1 sm:flex-none'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search by name, email, username...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-9 sm:w-64'
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className='w-36'>
                  <SelectValue placeholder='Filter Role' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Roles</SelectItem>
                  <SelectItem value='owner'>Owner</SelectItem>
                  <SelectItem value='admin'>Admin</SelectItem>
                  <SelectItem value='manager'>Manager</SelectItem>
                  <SelectItem value='staff'>Staff</SelectItem>
                  <SelectItem value='user'>User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Users Table */}
      <Card className='border-0 shadow-sm'>
        <CardContent className='pt-6'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='hover:bg-transparent'>
                  <TableHead>User Profile</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id} className='hover:bg-muted/50'>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-9 w-9'>
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${user.username}`}
                          />
                          <AvatarFallback className='bg-primary/10 font-medium text-primary'>
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='font-medium leading-none'>
                            {user.name}
                          </p>
                          <p className='mt-1 text-xs text-muted-foreground'>
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className='font-mono text-xs text-muted-foreground'>
                        @{user.username || 'n/a'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className={getRoleBadgeColor(user.role)}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {user.organizationName || 'Personal Workspace'}
                    </TableCell>
                    <TableCell className='text-xs text-muted-foreground'>
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='secondary'
                        className={
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400'
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className='mr-1 h-3.5 w-3.5' />
                            Details
                          </Button>
                        </DialogTrigger>

                        {selectedUser && selectedUser._id === user._id && (
                          <DialogContent className='max-w-md'>
                            <DialogHeader>
                              <DialogTitle className='flex items-center gap-2'>
                                <Avatar className='h-8 w-8'>
                                  <AvatarImage
                                    src={`https://avatar.vercel.sh/${selectedUser.username}`}
                                  />
                                  <AvatarFallback>
                                    {selectedUser.name
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                User Information
                              </DialogTitle>
                              <DialogDescription>
                                Raw user account details and permissions context
                              </DialogDescription>
                            </DialogHeader>

                            <div className='space-y-4 pt-2'>
                              <div className='space-y-3 rounded-lg border bg-muted/40 p-4 text-sm'>
                                <div className='flex items-center justify-between'>
                                  <span className='flex items-center text-muted-foreground'>
                                    <AtSign className='mr-2 h-4 w-4' /> Name
                                  </span>
                                  <span className='font-semibold'>
                                    {selectedUser.name}
                                  </span>
                                </div>
                                <div className='flex items-center justify-between'>
                                  <span className='flex items-center text-muted-foreground'>
                                    <Mail className='mr-2 h-4 w-4' /> Email
                                  </span>
                                  <span className='font-mono text-xs'>
                                    {selectedUser.email}
                                  </span>
                                </div>
                                <div className='flex items-center justify-between'>
                                  <span className='flex items-center text-muted-foreground'>
                                    <AtSign className='mr-2 h-4 w-4' /> Username
                                  </span>
                                  <span className='font-mono text-xs'>
                                    @{selectedUser.username}
                                  </span>
                                </div>
                                <div className='flex items-center justify-between'>
                                  <span className='flex items-center text-muted-foreground'>
                                    <ShieldCheck className='mr-2 h-4 w-4' />{' '}
                                    Role
                                  </span>
                                  <Badge
                                    className={getRoleBadgeColor(
                                      selectedUser.role
                                    )}
                                  >
                                    {selectedUser.role}
                                  </Badge>
                                </div>
                                <div className='flex items-center justify-between'>
                                  <span className='flex items-center text-muted-foreground'>
                                    <Building className='mr-2 h-4 w-4' />{' '}
                                    Organization
                                  </span>
                                  <span>
                                    {selectedUser.organizationName ||
                                      'Personal'}
                                  </span>
                                </div>
                                <div className='flex items-center justify-between'>
                                  <span className='flex items-center text-muted-foreground'>
                                    <Calendar className='mr-2 h-4 w-4' />{' '}
                                    Created At
                                  </span>
                                  <span className='text-xs'>
                                    {new Date(
                                      selectedUser.createdAt
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              <div className='overflow-x-auto rounded-md bg-slate-900 p-3 font-mono text-xs text-slate-200'>
                                <p className='mb-1 font-semibold text-slate-400'>
                                  // User Subject Identifier
                                </p>
                                <p>{selectedUser.userId}</p>
                              </div>
                            </div>
                          </DialogContent>
                        )}
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className='py-12 text-center text-muted-foreground'>
              No users matching search filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
