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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Check, Settings } from 'lucide-react';

export function EnterpriseSystemSettings() {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>System Settings</h2>
        <p className='text-sm text-muted-foreground'>
          Configure system-wide settings and preferences
        </p>
      </div>

      <Tabs defaultValue='general' className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='general'>General</TabsTrigger>
          <TabsTrigger value='security'>Security</TabsTrigger>
          <TabsTrigger value='email'>Email & Notifications</TabsTrigger>
          <TabsTrigger value='integrations'>Integrations</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value='general' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update company-wide settings</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium'>Company Name</label>
                  <Input defaultValue='Acme Corporation' />
                </div>
                <div>
                  <label className='text-sm font-medium'>Industry</label>
                  <Input defaultValue='Technology' />
                </div>
                <div className='col-span-2'>
                  <label className='text-sm font-medium'>Website</label>
                  <Input defaultValue='https://example.com' />
                </div>
                <div>
                  <label className='text-sm font-medium'>Time Zone</label>
                  <Select defaultValue='utc'>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='utc'>
                        UTC (Coordinated Universal Time)
                      </SelectItem>
                      <SelectItem value='est'>
                        EST (Eastern Standard Time)
                      </SelectItem>
                      <SelectItem value='cst'>
                        CST (Central Standard Time)
                      </SelectItem>
                      <SelectItem value='pst'>
                        PST (Pacific Standard Time)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className='text-sm font-medium'>Language</label>
                  <Select defaultValue='en'>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='en'>English</SelectItem>
                      <SelectItem value='es'>Spanish</SelectItem>
                      <SelectItem value='fr'>French</SelectItem>
                      <SelectItem value='de'>German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable features</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium'>Advanced Reporting</p>
                  <p className='text-sm text-muted-foreground'>
                    Enable advanced analytics and reports
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium'>Multi-Tenancy</p>
                  <p className='text-sm text-muted-foreground'>
                    Multiple organizations support
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium'>API Access</p>
                  <p className='text-sm text-muted-foreground'>
                    Enable third-party API access
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value='security' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                Configure authentication methods
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium'>Two-Factor Authentication (2FA)</p>
                  <p className='text-sm text-muted-foreground'>
                    Require 2FA for all users
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium'>Single Sign-On (SSO)</p>
                  <p className='text-sm text-muted-foreground'>
                    Enable enterprise SSO
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div>
                <p className='mb-2 font-medium'>Session Timeout</p>
                <Select defaultValue='30'>
                  <SelectTrigger className='w-48'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='15'>15 minutes</SelectItem>
                    <SelectItem value='30'>30 minutes</SelectItem>
                    <SelectItem value='60'>1 hour</SelectItem>
                    <SelectItem value='480'>8 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className='border-amber-200 bg-amber-50 dark:bg-amber-950'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <AlertCircle className='h-5 w-5 text-amber-600' />
                Password Policy
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm'>Minimum Length</p>
                  <Select defaultValue='12'>
                    <SelectTrigger className='w-32'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='8'>8 characters</SelectItem>
                      <SelectItem value='12'>12 characters</SelectItem>
                      <SelectItem value='16'>16 characters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex items-center justify-between'>
                  <p className='text-sm'>Require Special Characters</p>
                  <Switch defaultChecked />
                </div>
                <div className='flex items-center justify-between'>
                  <p className='text-sm'>Require Numbers</p>
                  <Switch defaultChecked />
                </div>
                <div className='flex items-center justify-between'>
                  <p className='text-sm'>Password Expiry (days)</p>
                  <Input type='number' defaultValue='90' className='w-32' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>IP Whitelisting</CardTitle>
              <CardDescription>Restrict access by IP address</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium'>Enable IP Whitelist</p>
                  <p className='text-sm text-muted-foreground'>
                    Only allow access from specific IPs
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div>
                <p className='mb-2 text-sm font-medium'>Whitelisted IPs</p>
                <Input placeholder='192.168.1.1, 192.168.1.2' />
                <p className='mt-1 text-xs text-muted-foreground'>
                  Comma-separated IP addresses
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email & Notifications */}
        <TabsContent value='email' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure email settings</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='col-span-2'>
                  <label className='text-sm font-medium'>SMTP Server</label>
                  <Input placeholder='smtp.gmail.com' />
                </div>
                <div>
                  <label className='text-sm font-medium'>SMTP Port</label>
                  <Input defaultValue='587' type='number' />
                </div>
                <div>
                  <label className='text-sm font-medium'>SMTP Username</label>
                  <Input placeholder='your-email@gmail.com' />
                </div>
                <div className='col-span-2'>
                  <label className='text-sm font-medium'>From Address</label>
                  <Input defaultValue='noreply@example.com' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <p className='text-sm'>User signup notifications</p>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <p className='text-sm'>Order confirmation emails</p>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <p className='text-sm'>System alert emails</p>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <p className='text-sm'>Daily summary reports</p>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value='integrations' className='space-y-6'>
          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>
                  Stripe Payment Gateway
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Badge variant='outline'>Connected</Badge>
                <Input placeholder='sk_live_...' />
                <Button className='w-full'>Disconnect</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Slack Notifications</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Badge variant='secondary'>Not Connected</Badge>
                <Button className='w-full'>Connect Slack</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Google Analytics</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Badge variant='outline'>Connected</Badge>
                <Input placeholder='GA-123456789' />
                <Button className='w-full'>Disconnect</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-base'>
                  Mailchimp Integration
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Badge variant='secondary'>Not Connected</Badge>
                <Button className='w-full'>Connect Mailchimp</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className='flex justify-end gap-2'>
        {isSaved && (
          <Badge className='flex items-center gap-2'>
            <Check className='h-3 w-3' />
            Settings saved
          </Badge>
        )}
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
}
