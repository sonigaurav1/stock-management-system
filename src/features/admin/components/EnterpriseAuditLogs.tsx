'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Download, ChevronDown, Copy, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  email: string;
  action: string;
  category: 'user' | 'system' | 'data' | 'security' | 'billing';
  resource: string;
  status: 'success' | 'failure' | 'warning';
  details: string;
  ipAddress: string;
}

const auditLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    user: 'Sarah Johnson',
    email: 'sarah@example.com',
    action: 'User Created',
    category: 'user',
    resource: 'User #234',
    status: 'success',
    details: 'New admin user created with email: john.doe@example.com',
    ipAddress: '192.168.1.1'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    user: 'Mike Chen',
    email: 'mike@example.com',
    action: 'Settings Updated',
    category: 'system',
    resource: 'System Config',
    status: 'success',
    details: 'Updated security settings and password policy',
    ipAddress: '192.168.1.5'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    user: 'Emma Wilson',
    email: 'emma@example.com',
    action: 'Data Export',
    category: 'data',
    resource: 'Orders Export',
    status: 'success',
    details: 'Exported 500 orders to CSV format',
    ipAddress: '192.168.1.10'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    user: 'System',
    email: 'system@example.com',
    action: 'Security Alert',
    category: 'security',
    resource: 'Login Attempt',
    status: 'warning',
    details: 'Unusual login attempt detected from new location',
    ipAddress: '203.45.67.89'
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    user: 'Sarah Johnson',
    email: 'sarah@example.com',
    action: 'Invoice Generated',
    category: 'billing',
    resource: 'Invoice #1234',
    status: 'success',
    details: 'Monthly invoice generated for client ABC Corp',
    ipAddress: '192.168.1.1'
  }
];

function getCategoryColor(category: string) {
  switch (category) {
    case 'user':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    case 'system':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
    case 'data':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'security':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    case 'billing':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
    default:
      return '';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'failure':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
    default:
      return '';
  }
}

export function EnterpriseAuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || log.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'all' || log.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Audit Logs</h2>
          <p className='text-sm text-muted-foreground'>
            Track all system activities and user actions
          </p>
        </div>
        <Button variant='outline' className='gap-2'>
          <Download className='h-4 w-4' />
          Export Report
        </Button>
      </div>

      {/* Compact Stats */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='pt-6'>
            <div>
              <p className='text-xs text-muted-foreground'>Total Actions</p>
              <p className='text-2xl font-bold'>12,543</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div>
              <p className='text-xs text-muted-foreground'>This Month</p>
              <p className='text-2xl font-bold'>2,345</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div>
              <p className='text-xs text-muted-foreground'>Failed Actions</p>
              <p className='text-2xl font-bold'>23</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div>
              <p className='text-xs text-muted-foreground'>Alerts</p>
              <p className='text-2xl font-bold'>5</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className='flex flex-col gap-4 md:flex-row'>
        <Input
          placeholder='Search by user, action, or email...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='max-w-sm'
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className='max-w-xs'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Categories</SelectItem>
            <SelectItem value='user'>User Management</SelectItem>
            <SelectItem value='system'>System</SelectItem>
            <SelectItem value='data'>Data Operations</SelectItem>
            <SelectItem value='security'>Security</SelectItem>
            <SelectItem value='billing'>Billing</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className='max-w-xs'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='success'>Success</SelectItem>
            <SelectItem value='warning'>Warning</SelectItem>
            <SelectItem value='failure'>Failure</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className='pt-6'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className='whitespace-nowrap text-xs'>
                      {format(log.timestamp, 'MMM dd, HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className='font-medium'>{log.user}</p>
                        <p className='text-xs text-muted-foreground'>
                          {log.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className='font-medium'>{log.action}</TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(log.category)}>
                        {log.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.resource}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <Eye className='h-4 w-4' />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Action Details</DialogTitle>
                          </DialogHeader>
                          <div className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                              <div>
                                <p className='text-xs font-semibold text-muted-foreground'>
                                  Timestamp
                                </p>
                                <p>{format(log.timestamp, 'PPp')}</p>
                              </div>
                              <div>
                                <p className='text-xs font-semibold text-muted-foreground'>
                                  User
                                </p>
                                <p>{log.user}</p>
                              </div>
                              <div className='col-span-2'>
                                <p className='text-xs font-semibold text-muted-foreground'>
                                  Details
                                </p>
                                <p className='mt-1'>{log.details}</p>
                              </div>
                              <div>
                                <p className='text-xs font-semibold text-muted-foreground'>
                                  IP Address
                                </p>
                                <div className='flex items-center gap-2'>
                                  <p className='font-mono text-sm'>
                                    {log.ipAddress}
                                  </p>
                                  <Button variant='ghost' size='sm'>
                                    <Copy className='h-3 w-3' />
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <p className='text-xs font-semibold text-muted-foreground'>
                                  Resource
                                </p>
                                <p>{log.resource}</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
