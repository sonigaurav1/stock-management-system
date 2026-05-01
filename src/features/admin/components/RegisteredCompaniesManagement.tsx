'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Search, Eye, Ban, CheckCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface Company {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  users: number;
  createdAt: string;
  lastActive: string;
  revenue: number;
}

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'admin@acme.com',
    status: 'active',
    plan: 'enterprise',
    users: 450,
    createdAt: '2024-01-15',
    lastActive: '2 hours ago',
    revenue: 15000
  },
  {
    id: '2',
    name: 'TechStart Inc',
    email: 'contact@techstart.com',
    status: 'active',
    plan: 'professional',
    users: 120,
    createdAt: '2024-02-20',
    lastActive: '5 minutes ago',
    revenue: 4500
  },
  {
    id: '3',
    name: 'Global Solutions Ltd',
    email: 'info@globalsolutions.com',
    status: 'pending',
    plan: 'starter',
    users: 0,
    createdAt: '2024-04-10',
    lastActive: 'Never',
    revenue: 0
  },
  {
    id: '4',
    name: 'Innovation Labs',
    email: 'admin@innolabs.com',
    status: 'active',
    plan: 'professional',
    users: 85,
    createdAt: '2024-01-05',
    lastActive: '1 day ago',
    revenue: 3200
  },
  {
    id: '5',
    name: 'DataDrive Systems',
    email: 'support@datadrive.com',
    status: 'suspended',
    plan: 'enterprise',
    users: 200,
    createdAt: '2023-11-22',
    lastActive: '1 month ago',
    revenue: 12000
  }
];

function getStatusColor(status: Company['status']) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'suspended':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'inactive':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    default:
      return '';
  }
}

function getPlanColor(plan: Company['plan']) {
  switch (plan) {
    case 'free':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'starter':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'professional':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
    case 'enterprise':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    default:
      return '';
  }
}

export function RegisteredCompaniesManagement() {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = (id: string) => {
    setCompanies(
      companies.map((c) =>
        c.id === id ? { ...c, status: 'active' as const } : c
      )
    );
  };

  const handleSuspend = (id: string) => {
    setCompanies(
      companies.map((c) =>
        c.id === id ? { ...c, status: 'suspended' as const } : c
      )
    );
  };

  return (
    <div className='space-y-6'>
      {/* Search and Filters */}
      <Card className='border-0 shadow-sm'>
        <CardHeader>
          <div className='flex items-center justify-between gap-4'>
            <CardTitle>All Registered Companies</CardTitle>
            <div className='relative w-64'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search companies...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-8'
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Companies Table */}
      <Card className='border-0 shadow-sm'>
        <CardContent className='pt-6'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='hover:bg-transparent'>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Users</TableHead>
                  <TableHead className='text-right'>Monthly Revenue</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className='w-10'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id} className='hover:bg-muted/50'>
                    <TableCell>
                      <div>
                        <p className='font-medium'>{company.name}</p>
                        <p className='text-xs text-muted-foreground'>
                          {company.createdAt}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className='text-sm'>{company.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={`capitalize ${getPlanColor(company.plan)}`}
                      >
                        {company.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`capitalize ${getStatusColor(company.status)}`}
                      >
                        {company.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {company.users}
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      ${company.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {company.lastActive}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm'>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DialogTrigger asChild>
                              <DropdownMenuItem
                                onClick={() => setSelectedCompany(company)}
                              >
                                <Eye className='mr-2 h-4 w-4' />
                                View Details
                              </DropdownMenuItem>
                            </DialogTrigger>
                            {company.status === 'pending' && (
                              <DropdownMenuItem
                                onClick={() => handleApprove(company.id)}
                                className='text-green-600 dark:text-green-400'
                              >
                                <CheckCircle2 className='mr-2 h-4 w-4' />
                                Approve
                              </DropdownMenuItem>
                            )}
                            {company.status === 'active' && (
                              <DropdownMenuItem
                                onClick={() => handleSuspend(company.id)}
                                className='text-red-600 dark:text-red-400'
                              >
                                <Ban className='mr-2 h-4 w-4' />
                                Suspend
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {selectedCompany && (
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{selectedCompany.name}</DialogTitle>
                              <DialogDescription>
                                Detailed company information and management
                              </DialogDescription>
                            </DialogHeader>
                            <div className='space-y-4'>
                              <div className='grid gap-4 sm:grid-cols-2'>
                                <div>
                                  <p className='text-sm font-medium text-muted-foreground'>
                                    Email
                                  </p>
                                  <p className='font-medium'>
                                    {selectedCompany.email}
                                  </p>
                                </div>
                                <div>
                                  <p className='text-sm font-medium text-muted-foreground'>
                                    Plan
                                  </p>
                                  <Badge
                                    className={`capitalize ${getPlanColor(selectedCompany.plan)}`}
                                  >
                                    {selectedCompany.plan}
                                  </Badge>
                                </div>
                                <div>
                                  <p className='text-sm font-medium text-muted-foreground'>
                                    Status
                                  </p>
                                  <Badge
                                    className={`capitalize ${getStatusColor(selectedCompany.status)}`}
                                  >
                                    {selectedCompany.status}
                                  </Badge>
                                </div>
                                <div>
                                  <p className='text-sm font-medium text-muted-foreground'>
                                    Users
                                  </p>
                                  <p className='text-lg font-bold'>
                                    {selectedCompany.users}
                                  </p>
                                </div>
                                <div>
                                  <p className='text-sm font-medium text-muted-foreground'>
                                    Monthly Revenue
                                  </p>
                                  <p className='text-lg font-bold'>
                                    ${selectedCompany.revenue.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className='text-sm font-medium text-muted-foreground'>
                                    Created
                                  </p>
                                  <p className='font-medium'>
                                    {selectedCompany.createdAt}
                                  </p>
                                </div>
                              </div>
                              <div className='flex gap-2 pt-4'>
                                {selectedCompany.status === 'pending' && (
                                  <Button
                                    className='w-full'
                                    onClick={() => {
                                      handleApprove(selectedCompany.id);
                                      setSelectedCompany(null);
                                    }}
                                  >
                                    Approve Company
                                  </Button>
                                )}
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
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>{companies.length}</p>
            <p className='text-xs text-muted-foreground'>All registered</p>
          </CardContent>
        </Card>
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold text-green-600'>
              {companies.filter((c) => c.status === 'active').length}
            </p>
            <p className='text-xs text-muted-foreground'>Currently active</p>
          </CardContent>
        </Card>
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold text-yellow-600'>
              {companies.filter((c) => c.status === 'pending').length}
            </p>
            <p className='text-xs text-muted-foreground'>Awaiting approval</p>
          </CardContent>
        </Card>
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>
              $
              {companies
                .reduce((sum, c) => sum + c.revenue, 0)
                .toLocaleString()}
            </p>
            <p className='text-xs text-muted-foreground'>Monthly MRR</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
