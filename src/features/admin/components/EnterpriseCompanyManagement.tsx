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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Edit,
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function EnterpriseCompanyManagement() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Company Management
          </h2>
          <p className='text-sm text-muted-foreground'>
            View and manage company information
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className='gap-2'>
              <Edit className='h-4 w-4' />
              Edit Company
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Edit Company Information</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium'>Company Name</label>
                  <Input defaultValue='Acme Corporation' />
                </div>
                <div>
                  <label className='text-sm font-medium'>
                    Registration Number
                  </label>
                  <Input defaultValue='REG123456' />
                </div>
                <div className='col-span-2'>
                  <label className='text-sm font-medium'>Email</label>
                  <Input type='email' defaultValue='info@example.com' />
                </div>
                <div>
                  <label className='text-sm font-medium'>Phone</label>
                  <Input defaultValue='+1 (555) 123-4567' />
                </div>
                <div>
                  <label className='text-sm font-medium'>Tax ID / VAT</label>
                  <Input defaultValue='VAT12345678' />
                </div>
                <div className='col-span-2'>
                  <label className='text-sm font-medium'>Address</label>
                  <Input defaultValue='123 Business Ave, Tech City, 54321' />
                </div>
                <div>
                  <label className='text-sm font-medium'>City</label>
                  <Input defaultValue='Tech City' />
                </div>
                <div>
                  <label className='text-sm font-medium'>Country</label>
                  <Input defaultValue='United States' />
                </div>
              </div>
              <div className='flex justify-end gap-2'>
                <Button variant='outline'>Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue='overview' className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='documents'>Documents</TabsTrigger>
          <TabsTrigger value='locations'>Locations</TabsTrigger>
          <TabsTrigger value='compliance'>Compliance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Company Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <div className='flex items-start gap-3'>
                    <Building className='mt-1 h-5 w-5 text-muted-foreground' />
                    <div>
                      <p className='text-xs font-medium text-muted-foreground'>
                        Company Name
                      </p>
                      <p className='font-medium'>Acme Corporation</p>
                    </div>
                  </div>
                  <Separator />
                  <div className='flex items-start gap-3'>
                    <Mail className='mt-1 h-5 w-5 text-muted-foreground' />
                    <div>
                      <p className='text-xs font-medium text-muted-foreground'>
                        Email
                      </p>
                      <p className='font-medium'>info@acmecorp.com</p>
                    </div>
                  </div>
                  <Separator />
                  <div className='flex items-start gap-3'>
                    <Phone className='mt-1 h-5 w-5 text-muted-foreground' />
                    <div>
                      <p className='text-xs font-medium text-muted-foreground'>
                        Phone
                      </p>
                      <p className='font-medium'>+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <Separator />
                  <div className='flex items-start gap-3'>
                    <MapPin className='mt-1 h-5 w-5 text-muted-foreground' />
                    <div>
                      <p className='text-xs font-medium text-muted-foreground'>
                        Address
                      </p>
                      <p className='font-medium'>123 Business Ave</p>
                      <p className='text-sm text-muted-foreground'>
                        Tech City, 54321, United States
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Company Status</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Account Status</span>
                    <Badge className='flex items-center gap-1'>
                      <CheckCircle className='h-3 w-3' />
                      Active
                    </Badge>
                  </div>
                  <Separator />
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Verification Status</span>
                    <Badge className='flex items-center gap-1'>
                      <CheckCircle className='h-3 w-3' />
                      Verified
                    </Badge>
                  </div>
                  <Separator />
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Account Tier</span>
                    <Badge variant='default'>Enterprise</Badge>
                  </div>
                  <Separator />
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Tax ID Status</span>
                    <Badge className='flex items-center gap-1'>
                      <CheckCircle className='h-3 w-3' />
                      Verified
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                <div className='rounded-lg bg-muted p-4'>
                  <p className='text-xs font-medium text-muted-foreground'>
                    Account Created
                  </p>
                  <p className='font-semibold'>Jan 15, 2023</p>
                </div>
                <div className='rounded-lg bg-muted p-4'>
                  <p className='text-xs font-medium text-muted-foreground'>
                    Last Updated
                  </p>
                  <p className='font-semibold'>Apr 18, 2026</p>
                </div>
                <div className='rounded-lg bg-muted p-4'>
                  <p className='text-xs font-medium text-muted-foreground'>
                    Subscription Renewal
                  </p>
                  <p className='font-semibold'>May 15, 2026</p>
                </div>
                <div className='rounded-lg bg-muted p-4'>
                  <p className='text-xs font-medium text-muted-foreground'>
                    Tax Year End
                  </p>
                  <p className='font-semibold'>Dec 31, 2026</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value='documents' className='space-y-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Company Documents</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size='sm' className='gap-2'>
                    <Plus className='h-4 w-4' />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                  </DialogHeader>
                  <div className='space-y-4'>
                    <Input type='file' />
                    <Input placeholder='Document name' />
                    <div className='flex justify-end gap-2'>
                      <Button variant='outline'>Cancel</Button>
                      <Button>Upload</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {[
                  {
                    name: 'Articles of Incorporation',
                    date: 'Jan 15, 2023',
                    status: 'Verified'
                  },
                  {
                    name: 'Tax ID Certificate',
                    date: 'Feb 20, 2023',
                    status: 'Verified'
                  },
                  {
                    name: 'Business License',
                    date: 'Mar 10, 2023',
                    status: 'Verified'
                  },
                  {
                    name: 'Insurance Certificate',
                    date: 'Apr 1, 2026',
                    status: 'Pending'
                  }
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className='flex items-center justify-between rounded-lg border p-3'
                  >
                    <div>
                      <p className='font-medium'>{doc.name}</p>
                      <p className='text-xs text-muted-foreground'>
                        {doc.date}
                      </p>
                    </div>
                    <Badge
                      variant={
                        doc.status === 'Verified' ? 'default' : 'secondary'
                      }
                    >
                      {doc.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value='locations' className='space-y-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Business Locations</CardTitle>
              <Button size='sm' className='gap-2'>
                <Plus className='h-4 w-4' />
                Add Location
              </Button>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-2'>
                {[
                  {
                    name: 'Headquarters',
                    address: '123 Business Ave, Tech City',
                    status: 'Primary'
                  },
                  {
                    name: 'West Coast Office',
                    address: '456 Tech Street, San Francisco',
                    status: 'Active'
                  },
                  {
                    name: 'Service Center',
                    address: '789 Support Ave, Austin, TX',
                    status: 'Active'
                  }
                ].map((loc, idx) => (
                  <Card key={idx}>
                    <CardContent className='pt-6'>
                      <div className='space-y-2'>
                        <p className='font-semibold'>{loc.name}</p>
                        <p className='text-sm text-muted-foreground'>
                          {loc.address}
                        </p>
                        <Badge variant='outline'>{loc.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value='compliance' className='space-y-6'>
          <Card className='border-green-200 bg-green-50 dark:bg-green-950'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CheckCircle className='h-5 w-5 text-green-600' />
                Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>GDPR Compliant</span>
                  <Badge className='flex items-center gap-1'>
                    <CheckCircle className='h-3 w-3' />
                    Yes
                  </Badge>
                </div>
                <Separator />
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>PCI DSS Certified</span>
                  <Badge className='flex items-center gap-1'>
                    <CheckCircle className='h-3 w-3' />
                    Yes
                  </Badge>
                </div>
                <Separator />
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>ISO 27001 Certified</span>
                  <Badge className='flex items-center gap-1'>
                    <CheckCircle className='h-3 w-3' />
                    Yes
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Protection</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Data Encryption</span>
                <Badge>AES-256</Badge>
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Backup Frequency</span>
                <Badge variant='outline'>Daily</Badge>
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Disaster Recovery Plan</span>
                <Badge className='flex items-center gap-1'>
                  <CheckCircle className='h-3 w-3' />
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
