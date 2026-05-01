'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Lock,
  Eye,
  Smartphone,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Server,
  History
} from 'lucide-react';

const SecuritySettings = () => {
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [dataRetention, setDataRetention] = useState('90');

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast({
      title: twoFactorEnabled ? 'Disabled' : 'Enabled',
      description: `Two-factor authentication has been ${twoFactorEnabled ? 'disabled' : 'enabled'}`
    });
  };

  return (
    <div className='space-y-6'>
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Shield className='h-5 w-5' />
              <div>
                <CardTitle>Security Assessment</CardTitle>
                <CardDescription>Your account security status</CardDescription>
              </div>
            </div>
            <Badge className='bg-green-100 text-green-800'>Secure</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            <div className='text-center'>
              <CheckCircle2 className='mx-auto mb-2 h-6 w-6 text-green-600' />
              <p className='text-sm font-medium'>Strong Password</p>
            </div>
            <div className='text-center'>
              <AlertCircle className='mx-auto mb-2 h-6 w-6 text-yellow-600' />
              <p className='text-sm font-medium'>2FA Inactive</p>
            </div>
            <div className='text-center'>
              <CheckCircle2 className='mx-auto mb-2 h-6 w-6 text-green-600' />
              <p className='text-sm font-medium'>Verified Email</p>
            </div>
            <div className='text-center'>
              <CheckCircle2 className='mx-auto mb-2 h-6 w-6 text-green-600' />
              <p className='text-sm font-medium'>Active Sessions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Lock className='h-5 w-5' />
            <div>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                Manage login methods and security
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Two-Factor Authentication */}
          <div className='flex items-center justify-between rounded-lg bg-slate-50 p-4 dark:bg-slate-900'>
            <div className='flex items-center gap-3'>
              <Smartphone className='h-5 w-5 text-muted-foreground' />
              <div>
                <p className='font-medium'>Two-Factor Authentication</p>
                <p className='text-sm text-muted-foreground'>
                  Add an extra layer of security
                </p>
              </div>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleTwoFactorToggle}
            />
          </div>

          {twoFactorEnabled && (
            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950'>
              <p className='mb-2 text-sm font-medium'>
                Authenticator App Setup
              </p>
              <p className='mb-3 text-sm text-muted-foreground'>
                Scan this QR code with an authenticator app to enable 2FA
              </p>
              <div className='mb-3 inline-block rounded bg-white p-4 dark:bg-slate-800'>
                <div className='flex h-40 w-40 items-center justify-center rounded bg-slate-200 dark:bg-slate-700'>
                  <span className='text-muted-foreground'>QR Code</span>
                </div>
              </div>
              <div className='space-y-2'>
                <Button variant='outline' className='w-full'>
                  Backup Codes
                </Button>
                <Button variant='destructive' className='w-full'>
                  Disable 2FA
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* IP Whitelisting */}
          <div className='flex items-center justify-between rounded-lg bg-slate-50 p-4 dark:bg-slate-900'>
            <div className='flex items-center gap-3'>
              <Eye className='h-5 w-5 text-muted-foreground' />
              <div>
                <p className='font-medium'>IP Address Whitelisting</p>
                <p className='text-sm text-muted-foreground'>
                  Restrict access to specific IP addresses
                </p>
              </div>
            </div>
            <Switch
              checked={ipWhitelistEnabled}
              onCheckedChange={setIpWhitelistEnabled}
            />
          </div>

          {ipWhitelistEnabled && (
            <div className='rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900'>
              <p className='mb-3 text-sm font-medium'>
                Whitelisted IP Addresses
              </p>
              <div className='mb-3 space-y-2'>
                <div className='flex items-center justify-between rounded border bg-white p-2 dark:bg-slate-800'>
                  <span className='text-sm'>192.168.1.1</span>
                  <Button variant='ghost' size='sm'>
                    Remove
                  </Button>
                </div>
              </div>
              <Button variant='outline' size='sm'>
                Add IP Address
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Server className='h-5 w-5' />
            <div>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>
                Manage active sessions and timeouts
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm font-medium'>
              Session Timeout (minutes)
            </label>
            <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='15'>15 minutes</SelectItem>
                <SelectItem value='30'>30 minutes</SelectItem>
                <SelectItem value='60'>1 hour</SelectItem>
                <SelectItem value='480'>8 hours</SelectItem>
                <SelectItem value='1440'>24 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className='mt-2 text-xs text-muted-foreground'>
              You will be automatically logged out after this period of
              inactivity
            </p>
          </div>

          <Separator />

          <div>
            <p className='mb-3 text-sm font-medium'>Active Sessions</p>
            <div className='space-y-2'>
              <div className='flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-900'>
                <div>
                  <p className='text-sm font-medium'>Chrome on macOS</p>
                  <p className='text-xs text-muted-foreground'>
                    Last active: Now
                  </p>
                </div>
                <Badge variant='secondary'>Current</Badge>
              </div>
              <div className='flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-900'>
                <div>
                  <p className='text-sm font-medium'>Safari on iPhone</p>
                  <p className='text-xs text-muted-foreground'>
                    Last active: 2 hours ago
                  </p>
                </div>
                <Button variant='ghost' size='sm'>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Privacy & Retention */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            <div>
              <CardTitle>Data Privacy & Retention</CardTitle>
              <CardDescription>
                Manage how your data is stored and retained
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm font-medium'>
              Data Retention Period
            </label>
            <Select value={dataRetention} onValueChange={setDataRetention}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='30'>30 days</SelectItem>
                <SelectItem value='90'>90 days</SelectItem>
                <SelectItem value='180'>6 months</SelectItem>
                <SelectItem value='365'>1 year</SelectItem>
                <SelectItem value='indefinite'>Indefinite</SelectItem>
              </SelectContent>
            </Select>
            <p className='mt-2 text-xs text-muted-foreground'>
              Data older than this period will be automatically archived
            </p>
          </div>

          <Separator />

          <div className='space-y-3'>
            <p className='text-sm font-medium'>Privacy Controls</p>
            <div className='space-y-2'>
              <div className='flex items-center justify-between rounded bg-slate-50 p-3 dark:bg-slate-900'>
                <span className='text-sm'>Analytics Tracking</span>
                <Switch defaultChecked />
              </div>
              <div className='flex items-center justify-between rounded bg-slate-50 p-3 dark:bg-slate-900'>
                <span className='text-sm'>Product Updates</span>
                <Switch defaultChecked />
              </div>
              <div className='flex items-center justify-between rounded bg-slate-50 p-3 dark:bg-slate-900'>
                <span className='text-sm'>Marketing Communications</span>
                <Switch />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <History className='h-5 w-5' />
            <div>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>
                Recent security and activity events
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {[
              { action: 'Login', details: 'Chrome on macOS', time: 'Now' },
              {
                action: 'Password Changed',
                details: 'Admin panel',
                time: '2 days ago'
              },
              {
                action: 'API Key Created',
                details: 'For integration',
                time: '1 week ago'
              },
              {
                action: 'Login',
                details: 'Safari on iPhone',
                time: '10 days ago'
              }
            ].map((log, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between rounded border-l-2 border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900'
              >
                <div>
                  <p className='text-sm font-medium'>{log.action}</p>
                  <p className='text-xs text-muted-foreground'>{log.details}</p>
                </div>
                <span className='text-xs text-muted-foreground'>
                  {log.time}
                </span>
              </div>
            ))}
          </div>
          <Button variant='outline' className='mt-4 w-full'>
            View Full Audit Log
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
