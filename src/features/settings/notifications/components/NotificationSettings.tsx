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
  Trash2
} from 'lucide-react';

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

  const [slackConnected, setSlackConnected] = useState(false);
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
      alerts: [
        { name: 'New User Added', enabled: true },
        { name: 'User Permissions Changed', enabled: true },
        { name: 'Failed Login Attempt', enabled: true },
        { name: 'API Key Created', enabled: true }
      ]
    },
    {
      icon: BarChart3,
      title: 'Report & Analytics',
      desc: 'Scheduled reports and analytics notifications',
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
      alerts: [
        { name: 'System Downtime', enabled: true },
        { name: 'Data Backup Complete', enabled: false },
        { name: 'Security Event', enabled: true },
        { name: 'Subscription Expiring', enabled: true }
      ]
    }
  ];

  return (
    <div className='space-y-6'>
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Configure where you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Email */}
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div className='flex items-center gap-3'>
              <Mail className='h-5 w-5' />
              <div>
                <p className='font-medium'>Email</p>
                <p className='text-sm text-muted-foreground'>
                  admin@company.com
                </p>
              </div>
            </div>
            <Badge className='bg-green-100 text-green-800'>Connected</Badge>
          </div>

          {/* SMS */}
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div className='flex items-center gap-3'>
              <MessageSquare className='h-5 w-5' />
              <div>
                <p className='font-medium'>SMS</p>
                <p className='text-sm text-muted-foreground'>+977-98XXXXXXXX</p>
              </div>
            </div>
            <Button variant='outline' size='sm'>
              Connect
            </Button>
          </div>

          {/* Slack */}
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-5 w-5 items-center justify-center rounded bg-purple-500 text-xs text-white'>
                ≡
              </div>
              <div>
                <p className='font-medium'>Slack</p>
                <p className='text-sm text-muted-foreground'>
                  {slackConnected ? '#inventory-alerts' : 'Not connected'}
                </p>
              </div>
            </div>
            <Button
              variant={slackConnected ? 'outline' : 'default'}
              size='sm'
              onClick={() => setSlackConnected(!slackConnected)}
            >
              {slackConnected ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
          <CardDescription>
            Choose what emails you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {Object.entries(emailPrefs).map(([key, enabled]) => (
            <div
              key={key}
              className='flex items-center justify-between rounded bg-slate-50 p-3 dark:bg-slate-900'
            >
              <p className='text-sm font-medium capitalize'>
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

      {/* Notification Categories */}
      <div>
        <h3 className='mb-4 text-lg font-semibold'>Notification Preferences</h3>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {notificationCategories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <Card key={idx}>
                <CardHeader className='pb-3'>
                  <div className='flex items-center gap-2'>
                    <Icon className='h-5 w-5' />
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
                      <p className='text-sm'>{alert.name}</p>
                      <Switch checked={alert.enabled} disabled />
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Custom Alert Rules */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Custom Alert Rules</CardTitle>
            <CardDescription>
              Create custom notification rules for your business
            </CardDescription>
          </div>
          <Button size='sm'>
            <Plus className='mr-1 h-4 w-4' />
            Add Rule
          </Button>
        </CardHeader>
        <CardContent className='space-y-3'>
          {notificationRules.map((rule) => (
            <div
              key={rule.id}
              className='rounded-lg border bg-slate-50 p-4 dark:bg-slate-900'
            >
              <div className='mb-3 flex items-center justify-between'>
                <div>
                  <p className='font-semibold'>{rule.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    Recipients: {rule.recipients.join(', ')}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant={rule.isActive ? 'default' : 'secondary'}>
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

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
          <CardDescription>
            Set times when you don't want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between rounded bg-slate-50 p-3 dark:bg-slate-900'>
            <p className='text-sm font-medium'>Enable Quiet Hours</p>
            <Switch defaultChecked />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label>Start Time</Label>
              <Input type='time' defaultValue='22:00' />
            </div>
            <div>
              <Label>End Time</Label>
              <Input type='time' defaultValue='09:00' />
            </div>
            <div className='md:col-span-2'>
              <Label>Days</Label>
              <Select defaultValue='all'>
                <SelectTrigger>
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

          <p className='text-xs text-muted-foreground'>
            Critical alerts will still be delivered during quiet hours
          </p>
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Latest alerts sent to you</CardDescription>
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
                className='rounded border-l-4 border-l-blue-500 bg-slate-50 p-3 dark:bg-slate-900'
              >
                <div className='mb-1 flex items-start justify-between'>
                  <p className='text-sm font-medium'>{notif.type}</p>
                  <Badge variant='secondary' className='text-xs'>
                    {notif.channel}
                  </Badge>
                </div>
                <p className='text-sm text-muted-foreground'>{notif.message}</p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  {notif.time}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
