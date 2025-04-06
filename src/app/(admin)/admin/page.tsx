'use client';

import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Phone,
  Mail,
  Building,
  MapPin,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { DataTable } from '@/features/admin/components/DataTable';
import { columns } from '@/features/admin/components/columns';

// Mock data - replace with actual data fetching from your Convex database
const mockCompanyDetails = {
  companyName: 'Acme Corporation',
  companyAddress: '123 Business Avenue, Tech City, 54321',
  phone: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
  email: 'contact@acmecorp.com',
  vatNumber: 'VAT12345678',
  isVerified: true,
  createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
  urls: [
    { id: 1, value: 'https://acmecorp.com' },
    { id: 2, value: 'https://shop.acmecorp.com' }
  ]
};

export default function AdminPage() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [companyDetails, setCompanyDetails] = useState(mockCompanyDetails);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your admin user ID
    const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

    if (user?.id === ADMIN_USER_ID) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }

    // Simulate data loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    // In a real implementation, you would fetch data from Convex here
    // Example:
    // const fetchCompanyDetails = async () => {
    //   try {
    //     const data = await convex.query('companyDetails.getByUserId', { userId: user?.id });
    //     setCompanyDetails(data);
    //     setLoading(false);
    //   } catch (error) {
    //     console.error('Error fetching company details:', error);
    //     setLoading(false);
    //   }
    // };
    //
    // if (user?.id) {
    //   fetchCompanyDetails();
    // }
  }, [user]);

  if (!isAdmin) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='text-center text-red-500'>
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-center'>
              You are not authorized to view this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Admin Dashboard</h1>
          <p className='text-muted-foreground'>
            Manage company details and user information
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src={user?.imageUrl} alt={user?.fullName || 'Admin'} />
            <AvatarFallback>{user?.firstName?.charAt(0) || 'A'}</AvatarFallback>
          </Avatar>
          <div>
            <p className='text-sm font-medium'>
              {user?.fullName || 'Admin User'}
            </p>
            <p className='text-xs text-muted-foreground'>
              {user?.emailAddresses[0]?.emailAddress || 'admin@example.com'}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue='company' className='w-full'>
        <TabsList className='mb-8 grid w-full grid-cols-2'>
          <TabsTrigger value='company'>Company Details</TabsTrigger>
          <TabsTrigger value='users'>User Management</TabsTrigger>
        </TabsList>

        <TabsContent value='company' className='space-y-6'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    View and manage company details
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    companyDetails.isVerified ? 'default' : 'destructive'
                  }
                >
                  {companyDetails.isVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-4'>
                  <div>
                    <h3 className='flex items-center gap-2 text-lg font-semibold'>
                      <Building className='h-5 w-5' />
                      Company Name
                    </h3>
                    <p className='text-muted-foreground'>
                      {companyDetails.companyName}
                    </p>
                  </div>

                  <div>
                    <h3 className='flex items-center gap-2 text-lg font-semibold'>
                      <MapPin className='h-5 w-5' />
                      Address
                    </h3>
                    <p className='text-muted-foreground'>
                      {companyDetails.companyAddress}
                    </p>
                  </div>

                  <div>
                    <h3 className='flex items-center gap-2 text-lg font-semibold'>
                      <Mail className='h-5 w-5' />
                      Email
                    </h3>
                    <p className='text-muted-foreground'>
                      {companyDetails.email}
                    </p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <h3 className='flex items-center gap-2 text-lg font-semibold'>
                      <Phone className='h-5 w-5' />
                      Phone Numbers
                    </h3>
                    <ul className='space-y-1'>
                      {companyDetails.phone.map((phone, index) => (
                        <li key={index} className='text-muted-foreground'>
                          {phone}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className='text-lg font-semibold'>VAT Number</h3>
                    <div className='flex items-center gap-2'>
                      <p className='text-muted-foreground'>
                        {companyDetails.vatNumber}
                      </p>
                      {companyDetails.isVerified ? (
                        <CheckCircle className='h-5 w-5 text-green-500' />
                      ) : (
                        <XCircle className='h-5 w-5 text-red-500' />
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className='flex items-center gap-2 text-lg font-semibold'>
                      <Clock className='h-5 w-5' />
                      Created At
                    </h3>
                    <p className='text-muted-foreground'>
                      {new Date(companyDetails.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className='mb-2 text-lg font-semibold'>Company URLs</h3>
                <ul className='space-y-2'>
                  {companyDetails.urls.map((url) => (
                    <li key={url.id} className='flex items-center gap-2'>
                      <span className='text-muted-foreground'>{url.id}.</span>
                      <a
                        href={url.value}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-primary hover:underline'
                      >
                        {url.value}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className='flex justify-end gap-2'>
                <Button variant='outline'>Edit Details</Button>
                <Button>Verify Company</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>OTP Verification</CardTitle>
              <CardDescription>
                Manage one-time password settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <div className='rounded-lg border p-4'>
                    <h3 className='mb-1 font-medium'>Current OTP</h3>
                    <p className='font-mono text-2xl'>123456</p>
                  </div>
                  <div className='rounded-lg border p-4'>
                    <h3 className='mb-1 font-medium'>Expires At</h3>
                    <p className='text-sm'>
                      {new Date(Date.now() + 15 * 60 * 1000).toLocaleString()}
                    </p>
                  </div>
                  <div className='rounded-lg border p-4'>
                    <h3 className='mb-1 font-medium'>Status</h3>
                    <Badge>Active</Badge>
                  </div>
                </div>

                <div className='flex justify-end gap-2'>
                  <Button variant='outline'>Reset OTP</Button>
                  <Button>Generate New OTP</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='users' className='space-y-6'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    View and manage user accounts
                  </CardDescription>
                </div>
                <Button>Add User</Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={[
                  {
                    id: '1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    role: 'Admin',
                    status: 'Active',
                    lastLogin: '2023-04-01T09:00:00'
                  },
                  {
                    id: '2',
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    role: 'Editor',
                    status: 'Active',
                    lastLogin: '2023-04-01T10:30:00'
                  },
                  {
                    id: '3',
                    name: 'Bob Johnson',
                    email: 'bob@example.com',
                    role: 'Viewer',
                    status: 'Inactive',
                    lastLogin: '2023-03-28T14:15:00'
                  }
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
