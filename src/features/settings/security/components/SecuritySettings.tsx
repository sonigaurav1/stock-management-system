'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  History,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeInUp, easings } from '@/lib/animations';

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
    <div className='space-y-6 px-4 py-6 md:px-6 lg:px-8'>
      {/* Security Overview */}
      <motion.div variants={fadeInUp} initial='initial' animate='animate'>
        <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600'>
                  <ShieldCheck className='h-5 w-5 text-white' />
                </div>
                <div>
                  <CardTitle>Security Assessment</CardTitle>
                  <CardDescription>
                    Your account security status
                  </CardDescription>
                </div>
              </div>
              <Badge className='bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'>
                Secure
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div className='flex flex-col items-center rounded-lg bg-slate-50/50 p-4 dark:bg-slate-800/50'>
                <CheckCircle2 className='mb-2 h-6 w-6 text-emerald-600' />
                <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                  Strong Password
                </p>
              </div>
              <div className='flex flex-col items-center rounded-lg bg-slate-50/50 p-4 dark:bg-slate-800/50'>
                <AlertCircle className='mb-2 h-6 w-6 text-amber-600' />
                <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                  2FA Inactive
                </p>
              </div>
              <div className='flex flex-col items-center rounded-lg bg-slate-50/50 p-4 dark:bg-slate-800/50'>
                <CheckCircle2 className='mb-2 h-6 w-6 text-emerald-600' />
                <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                  Verified Email
                </p>
              </div>
              <div className='flex flex-col items-center rounded-lg bg-slate-50/50 p-4 dark:bg-slate-800/50'>
                <CheckCircle2 className='mb-2 h-6 w-6 text-emerald-600' />
                <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                  Active Sessions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Authentication */}
      <motion.div
        variants={fadeInUp}
        initial='initial'
        animate='animate'
        transition={{ delay: 0.1 }}
      >
        <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600'>
                <Lock className='h-5 w-5 text-white' />
              </div>
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
            <div className='flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30'>
                  <Smartphone className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                </div>
                <div>
                  <p className='font-medium text-slate-900 dark:text-slate-100'>
                    Two-Factor Authentication
                  </p>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
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
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className='rounded-xl border border-blue-200/50 bg-blue-50/50 p-4 dark:border-blue-800/50 dark:bg-blue-950/50'
              >
                <p className='mb-2 text-sm font-medium text-slate-900 dark:text-slate-100'>
                  Authenticator App Setup
                </p>
                <p className='mb-3 text-sm text-slate-600 dark:text-slate-400'>
                  Scan this QR code with an authenticator app to enable 2FA
                </p>
                <div className='mb-3 inline-block rounded-lg bg-white p-4 dark:bg-slate-800'>
                  <div className='flex h-40 w-40 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700'>
                    <span className='text-sm text-slate-500 dark:text-slate-400'>
                      QR Code
                    </span>
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
              </motion.div>
            )}

            <Separator className='bg-slate-200/50 dark:bg-slate-700/50' />

            {/* IP Whitelisting */}
            <div className='flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30'>
                  <Eye className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                </div>
                <div>
                  <p className='font-medium text-slate-900 dark:text-slate-100'>
                    IP Address Whitelisting
                  </p>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
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
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className='rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 dark:border-slate-700/50 dark:bg-slate-800/50'
              >
                <p className='mb-3 text-sm font-medium text-slate-900 dark:text-slate-100'>
                  Whitelisted IP Addresses
                </p>
                <div className='mb-3 space-y-2'>
                  <div className='flex items-center justify-between rounded-lg border border-slate-200/50 bg-white p-3 dark:border-slate-700/50 dark:bg-slate-900'>
                    <span className='text-sm text-slate-900 dark:text-slate-100'>
                      192.168.1.1
                    </span>
                    <Button variant='ghost' size='sm'>
                      Remove
                    </Button>
                  </div>
                </div>
                <Button variant='outline' size='sm'>
                  Add IP Address
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Session Management */}
      <motion.div
        variants={fadeInUp}
        initial='initial'
        animate='animate'
        transition={{ delay: 0.2 }}
      >
        <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600'>
                <Server className='h-5 w-5 text-white' />
              </div>
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
              <label className='mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100'>
                Session Timeout (minutes)
              </label>
              <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                <SelectTrigger className='border-slate-200/50 bg-slate-50/50 dark:border-slate-700/50 dark:bg-slate-800/50'>
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
              <p className='mt-2 text-xs text-slate-600 dark:text-slate-400'>
                You will be automatically logged out after this period of
                inactivity
              </p>
            </div>

            <Separator className='bg-slate-200/50 dark:bg-slate-700/50' />

            <div>
              <p className='mb-3 text-sm font-medium text-slate-900 dark:text-slate-100'>
                Active Sessions
              </p>
              <div className='space-y-2'>
                <div className='flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 p-3 dark:border-slate-700/50 dark:bg-slate-800/50'>
                  <div>
                    <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                      Chrome on macOS
                    </p>
                    <p className='text-xs text-slate-600 dark:text-slate-400'>
                      Last active: Now
                    </p>
                  </div>
                  <Badge
                    variant='secondary'
                    className='bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                  >
                    Current
                  </Badge>
                </div>
                <div className='flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 p-3 dark:border-slate-700/50 dark:bg-slate-800/50'>
                  <div>
                    <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                      Safari on iPhone
                    </p>
                    <p className='text-xs text-slate-600 dark:text-slate-400'>
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
      </motion.div>

      {/* Data Privacy & Retention */}
      <motion.div
        variants={fadeInUp}
        initial='initial'
        animate='animate'
        transition={{ delay: 0.3 }}
      >
        <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600'>
                <Calendar className='h-5 w-5 text-white' />
              </div>
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
              <label className='mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100'>
                Data Retention Period
              </label>
              <Select value={dataRetention} onValueChange={setDataRetention}>
                <SelectTrigger className='border-slate-200/50 bg-slate-50/50 dark:border-slate-700/50 dark:bg-slate-800/50'>
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
              <p className='mt-2 text-xs text-slate-600 dark:text-slate-400'>
                Data older than this period will be automatically archived
              </p>
            </div>

            <Separator className='bg-slate-200/50 dark:bg-slate-700/50' />

            <div className='space-y-3'>
              <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                Privacy Controls
              </p>
              <div className='space-y-2'>
                <div className='flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 p-3 dark:border-slate-700/50 dark:bg-slate-800/50'>
                  <span className='text-sm text-slate-900 dark:text-slate-100'>
                    Analytics Tracking
                  </span>
                  <Switch defaultChecked />
                </div>
                <div className='flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 p-3 dark:border-slate-700/50 dark:bg-slate-800/50'>
                  <span className='text-sm text-slate-900 dark:text-slate-100'>
                    Product Updates
                  </span>
                  <Switch defaultChecked />
                </div>
                <div className='flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 p-3 dark:border-slate-700/50 dark:bg-slate-800/50'>
                  <span className='text-sm text-slate-900 dark:text-slate-100'>
                    Marketing Communications
                  </span>
                  <Switch />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Audit Log */}
      <motion.div
        variants={fadeInUp}
        initial='initial'
        animate='animate'
        transition={{ delay: 0.4 }}
      >
        <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-gray-600'>
                <History className='h-5 w-5 text-white' />
              </div>
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
                  action: 'Login',
                  details: 'Safari on iPhone',
                  time: '10 days ago'
                }
              ].map((log, idx) => (
                <div
                  key={idx}
                  className='flex items-center justify-between rounded-xl border-l-4 border-slate-200/50 border-l-slate-400 bg-slate-50/50 p-3 dark:border-slate-700/50 dark:border-l-slate-600 dark:bg-slate-800/50'
                >
                  <div>
                    <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                      {log.action}
                    </p>
                    <p className='text-xs text-slate-600 dark:text-slate-400'>
                      {log.details}
                    </p>
                  </div>
                  <span className='text-xs text-slate-600 dark:text-slate-400'>
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
      </motion.div>
    </div>
  );
};

export default SecuritySettings;
