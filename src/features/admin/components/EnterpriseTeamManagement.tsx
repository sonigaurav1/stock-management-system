'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreVertical, Plus, Mail, Shield, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'staff' | 'viewer';
  department: string;
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
  lastActive: string;
  image?: string;
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'owner',
    department: 'Executive',
    status: 'active',
    joinedDate: '2023-01-15',
    lastActive: '2 minutes ago'
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@example.com',
    role: 'admin',
    department: 'Operations',
    status: 'active',
    joinedDate: '2023-02-20',
    lastActive: '15 minutes ago'
  },
  {
    id: '3',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    role: 'manager',
    department: 'Sales',
    status: 'active',
    joinedDate: '2023-03-10',
    lastActive: '45 minutes ago'
  },
  {
    id: '4',
    name: 'Alex Rodriguez',
    email: 'alex@example.com',
    role: 'staff',
    department: 'Support',
    status: 'inactive',
    joinedDate: '2023-04-05',
    lastActive: '3 days ago'
  }
];

const rolePermissions = {
  owner: [
    'Full system access',
    'User management',
    'Settings',
    'Billing',
    'Compliance'
  ],
  admin: ['User management', 'Content management', 'Reports', 'Settings'],
  manager: ['Team management', 'Reports', 'Content approval'],
  staff: ['Content creation', 'Basic reports'],
  viewer: ['View only access']
};

function getRoleBadgeVariant(
  role: string
): 'default' | 'secondary' | 'outline' {
  switch (role) {
    case 'owner':
      return 'default';
    case 'admin':
      return 'default';
    case 'manager':
      return 'secondary';
    default:
      return 'outline';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-500';
    case 'inactive':
      return 'bg-gray-500';
    case 'pending':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
}

export function EnterpriseTeamManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Team Management</h2>
          <p className='text-sm text-muted-foreground'>
            Manage team members, roles, and permissions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className='gap-2'>
              <Plus className='h-4 w-4' />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium'>Email Address</label>
                <Input placeholder='member@example.com' type='email' />
              </div>
              <div>
                <label className='text-sm font-medium'>Role</label>
                <Select defaultValue='staff'>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='admin'>Admin</SelectItem>
                    <SelectItem value='manager'>Manager</SelectItem>
                    <SelectItem value='staff'>Staff</SelectItem>
                    <SelectItem value='viewer'>Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className='text-sm font-medium'>Department</label>
                <Input placeholder='e.g., Sales, Operations' />
              </div>
              <Button className='w-full'>Send Invitation</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className='flex gap-4'>
        <Input
          placeholder='Search members...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='max-w-sm'
        />
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className='max-w-xs'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Roles</SelectItem>
            <SelectItem value='owner'>Owner</SelectItem>
            <SelectItem value='admin'>Admin</SelectItem>
            <SelectItem value='manager'>Manager</SelectItem>
            <SelectItem value='staff'>Staff</SelectItem>
            <SelectItem value='viewer'>Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Team Members Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {filteredMembers.map((member) => (
          <Card key={member.id} className='relative'>
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='relative'>
                    <Avatar>
                      <AvatarImage src={member.image} />
                      <AvatarFallback>
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${getStatusColor(
                        member.status
                      )}`}
                    />
                  </div>
                  <div>
                    <p className='font-semibold'>{member.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {member.email}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='sm'>
                      <MoreVertical className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem>
                      <Edit className='mr-2 h-4 w-4' />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className='mr-2 h-4 w-4' />
                      Resend Invite
                    </DropdownMenuItem>
                    <DropdownMenuItem className='text-destructive'>
                      <Trash2 className='mr-2 h-4 w-4' />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex flex-wrap gap-2'>
                <Badge variant={getRoleBadgeVariant(member.role)}>
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </Badge>
                <Badge variant='outline'>{member.department}</Badge>
                <Badge
                  variant='outline'
                  className={
                    member.status === 'active'
                      ? 'border-green-500 text-green-700'
                      : ''
                  }
                >
                  {member.status}
                </Badge>
              </div>
              <div className='space-y-1 text-xs text-muted-foreground'>
                <p>
                  Joined: {new Date(member.joinedDate).toLocaleDateString()}
                </p>
                <p>Last active: {member.lastActive}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Permissions Reference */}
      <Card className='bg-muted/50'>
        <CardHeader>
          <CardTitle className='text-base'>
            Role Permissions Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-5'>
            {Object.entries(rolePermissions).map(([role, permissions]) => (
              <div key={role}>
                <Badge className='mb-2 block w-fit'>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
                <ul className='space-y-1 text-xs'>
                  {permissions.map((perm, idx) => (
                    <li key={idx} className='flex items-start gap-2'>
                      <Shield className='mt-0.5 h-3 w-3 flex-shrink-0 text-muted-foreground' />
                      <span>{perm}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
