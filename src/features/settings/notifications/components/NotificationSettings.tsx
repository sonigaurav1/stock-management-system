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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Bell,
  Mail,
  MessageSquare,
  Package,
  DollarSign,
  AlertCircle,
  Users,
  BarChart3,
  Plus,
  Trash2,
  Clock,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeInUp, easings } from '@/lib/animations';

const NotificationSettings = () => {
  const { toast } = useToast();
  const [notificationRules, setNotificationRules] = useState([
    {
      id: '1',
      name: 'Low Stock Alert',
      triggers: ['stock_below_reorder', 'inventory_low'],
      channels: ['email'],
      recipients: ['admin@company.com'],
      isActive: true
    },
    {
      id: '2',
      name: 'Payment Reminders',
      triggers: ['invoice_unpaid_7days'],
      channels: ['email', 'sms'],
      recipients: ['accounts@company.com'],
      isActive: true
    }
  ]);

  const [emailPrefs, setEmailPrefs] = useState({
    dailyDigest: true,
    weeklyReport: true,
    monthlyAnalytics: true,
    productUpdates: true,
    promotions: false
  });

  const notificationCategories = [
    {
      icon: Package,
      title: 'Inventory Alerts',
      desc: 'Low stock, reorder, dead stock notifications',
      color: 'from-amber-500 to-orange-600',
      alerts: [
        { name: 'Low Stock Warning', enabled: true },
        { name: 'Reorder Point Reached', enabled: true },
        { name: 'Stock Transfer', enabled: false },
        { name: 'Inventory Audit', enabled: true }
      ]
    },
    {
      icon: DollarSign,
      title: 'Financial Alerts',
      desc: 'Invoice, payment, and billing notifications',
      color: 'from-emerald-500 to-teal-600',
      alerts: [
        { name: 'Invoice Created', enabled: true },
        { name: 'Payment Received', enabled: true },
        { name: 'Unpaid Invoice Reminder', enabled: true },
        { name: 'Expense Approved', enabled: false }
      ]
    },
    {
      icon: Users,
      title: 'Team Alerts',
      desc: 'User, permission, and access notifications',
      color: 'from-violet-500 to-purple-600',
      alerts: [
        { name: 'New User Added', enabled: true },
        { name: 'User Permissions Changed', enabled: true },
        { name: 'Failed Login Attempt', enabled: true }
      ]
    },
    {
      icon: BarChart3,
      title: 'Report & Analytics',
      desc: 'Scheduled reports and analytics notifications',
      color: 'from-blue-500 to-indigo-600',
      alerts: [
        { name: 'Daily Sales Summary', enabled: true },
        { name: 'Weekly Performance Report', enabled: true },
        { name: 'Monthly Analytics', enabled: false },
        { name: 'Anomaly Detection', enabled: true }
      ]
    },
    {
      icon: AlertCircle,
      title: 'System Alerts',
      desc: 'System health and critical alerts',
      color: 'from-rose-500 to-pink-600',
      alerts: [
        { name: 'System Downtime', enabled: true },
        { name: 'Data Backup Complete', enabled: false },
        { name: 'Security Event', enabled: true },
        { name: 'Subscription Expiring', enabled: true }
      ]
    }
  ];

  return (
    <div className='space-y-6 px-4 py-6 md:px-6 lg:px-8'>
      {/* Notification Channels */}
      {/* <motion.div
        variants={fadeInUp}
        initial='initial'
        animate='animate'
      >
        <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600'>
                <Bell className='h-5 w-5 text-white' />
              </div>
              <div>
                <CardTitle>Notification Channels</CardTitle>
                <CardDescription>
                  Configure where you receive notifications
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            // Email 
            <div className='flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30'>
                  <Mail className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                </div>
                <div>
                  <p className='font-medium text-slate-900 dark:text-slate-100'>Email</p>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    admin@company.com
                  </p>
                </div>
              </div>
              <Badge className='bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'>
                Connected
              </Badge>
            </div>

            // SMS 
            <div className='flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30'>
                  <MessageSquare className='h-5 w-5 text-green-600 dark:text-green-400' />
                </div>
                <div>
                  <p className='font-medium text-slate-900 dark:text-slate-100'>SMS</p>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>+977-98XXXXXXXX</p>
                </div>
              </div>
              <Button variant='outline' size='sm'>
                Connect
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div> */}

      {/* Email Preferences */}
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
                <Mail className='h-5 w-5 text-white' />
              </div>
              <div>
                <CardTitle>Email Preferences</CardTitle>
                <CardDescription>
                  Choose what emails you want to receive
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            {Object.entries(emailPrefs).map(([key, enabled]) => (
              <div
                key={key}
                className='flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 p-3 transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800'
              >
                <p className='text-sm font-medium capitalize text-slate-900 dark:text-slate-100'>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <Switch
                  checked={enabled}
                  onCheckedChange={(value) =>
                    setEmailPrefs({
                      ...emailPrefs,
                      [key]: value
                    })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Categories */}
      <motion.div
        variants={fadeInUp}
        initial='initial'
        animate='animate'
        transition={{ delay: 0.2 }}
      >
        <div className='mb-4 flex items-center gap-3'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600'>
            <Settings className='h-4 w-4 text-white' />
          </div>
          <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
            Notification Preferences
          </h3>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {notificationCategories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <Card
                key={idx}
                className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-center gap-3'>
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br',
                        category.color
                      )}
                    >
                      <Icon className='h-5 w-5 text-white' />
                    </div>
                    <div>
                      <CardTitle className='text-base'>
                        {category.title}
                      </CardTitle>
                      <CardDescription className='text-xs'>
                        {category.desc}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-2'>
                  {category.alerts.map((alert, alertIdx) => (
                    <div
                      key={alertIdx}
                      className='flex items-center justify-between'
                    >
                      <p className='text-sm text-slate-900 dark:text-slate-100'>
                        {alert.name}
                      </p>
                      <Switch checked={alert.enabled} disabled />
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Custom Alert Rules */}
      <motion.div
        variants={fadeInUp}
        initial='initial'
        animate='animate'
        transition={{ delay: 0.3 }}
      >
        <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600'>
                <AlertCircle className='h-5 w-5 text-white' />
              </div>
              <div>
                <CardTitle>Custom Alert Rules</CardTitle>
                <CardDescription>
                  Create custom notification rules for your business
                </CardDescription>
              </div>
            </div>
            <Button
              size='sm'
              className='gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
            >
              <Plus className='h-4 w-4' />
              Add Rule
            </Button>
          </CardHeader>
          <CardContent className='space-y-3'>
            {notificationRules.map((rule) => (
              <div
                key={rule.id}
                className='rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 dark:border-slate-700/50 dark:bg-slate-800/50'
              >
                <div className='mb-3 flex items-center justify-between'>
                  <div>
                    <p className='font-semibold text-slate-900 dark:text-slate-100'>
                      {rule.name}
                    </p>
                    <p className='text-xs text-slate-600 dark:text-slate-400'>
                      Recipients: {rule.recipients.join(', ')}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant={rule.isActive ? 'default' : 'secondary'}
                      className={cn(
                        rule.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : ''
                      )}
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant='ghost' size='icon'>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {rule.channels.map((channel) => (
                    <Badge key={channel} variant='outline' className='text-xs'>
                      {channel.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quiet Hours */}
      <motion.div
        variants={fadeInUp}
        initial='initial'
        animate='animate'
        transition={{ delay: 0.4 }}
      >
        <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600'>
                <Clock className='h-5 w-5 text-white' />
              </div>
              <div>
                <CardTitle>Quiet Hours</CardTitle>
                <CardDescription>
                  Set times when you don't want to receive notifications
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 p-3 transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800'>
              <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                Enable Quiet Hours
              </p>
              <Switch defaultChecked />
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <Label className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                  Start Time
                </Label>
                <Input
                  type='time'
                  defaultValue='22:00'
                  className='border-slate-200/50 bg-slate-50/50 dark:border-slate-700/50 dark:bg-slate-800/50'
                />
              </div>
              <div>
                <Label className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                  End Time
                </Label>
                <Input
                  type='time'
                  defaultValue='09:00'
                  className='border-slate-200/50 bg-slate-50/50 dark:border-slate-700/50 dark:bg-slate-800/50'
                />
              </div>
              <div className='md:col-span-2'>
                <Label className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                  Days
                </Label>
                <Select defaultValue='all'>
                  <SelectTrigger className='border-slate-200/50 bg-slate-50/50 dark:border-slate-700/50 dark:bg-slate-800/50'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='weekdays'>Weekdays Only</SelectItem>
                    <SelectItem value='weekends'>Weekends Only</SelectItem>
                    <SelectItem value='all'>All Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className='text-xs text-slate-600 dark:text-slate-400'>
              Critical alerts will still be delivered during quiet hours
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification History */}
      <motion.div
        variants={fadeInUp}
        initial='initial'
        animate='animate'
        transition={{ delay: 0.5 }}
      >
        <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-gray-600'>
                <Bell className='h-5 w-5 text-white' />
              </div>
              <div>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>Latest alerts sent to you</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {[
                {
                  type: 'Low Stock',
                  message: 'Product "Canvas Shoes" stock below reorder level',
                  time: '2 hours ago',
                  channel: 'Email'
                },
                {
                  type: 'Payment',
                  message: 'Invoice #INV-001 payment received',
                  time: '5 hours ago',
                  channel: 'Email'
                },
                {
                  type: 'System',
                  message: 'Backup completed successfully',
                  time: '1 day ago',
                  channel: 'Email'
                }
              ].map((notif, idx) => (
                <div
                  key={idx}
                  className='rounded-xl border-l-4 border-slate-200/50 border-l-blue-500 bg-slate-50/50 p-3 dark:border-slate-700/50 dark:border-l-blue-400 dark:bg-slate-800/50'
                >
                  <div className='mb-1 flex items-start justify-between'>
                    <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                      {notif.type}
                    </p>
                    <Badge variant='secondary' className='text-xs'>
                      {notif.channel}
                    </Badge>
                  </div>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    {notif.message}
                  </p>
                  <p className='mt-1 text-xs text-slate-600 dark:text-slate-400'>
                    {notif.time}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default NotificationSettings;
