'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Bell,
  Mail,
  MessageSquare,
  Slack,
  Send,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function NotificationSettings() {
  const prefs = useQuery(
    api.notificationPreferences.getNotificationPreferences
  );
  const createDefaults = useMutation(
    api.notificationPreferences.createDefaultPreferences
  );
  const updateChannels = useMutation(
    api.notificationPreferences.updateChannelPreferences
  );
  const updateTypes = useMutation(
    api.notificationPreferences.updateNotificationTypes
  );
  const updateQuietHoursMutation = useMutation(
    api.notificationPreferences.setQuietHours
  );
  const addPhoneNumber = useMutation(
    api.notificationPreferences.addPhoneNumber
  );
  const testNotification = useMutation(
    api.notificationPreferences.testNotificationChannel
  );

  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [quietHours, setQuietHours] = useState({
    enabled: false,
    startTime: '09:00',
    endTime: '17:00'
  });

  useEffect(() => {
    // If preferences don't exist, create default ones
    if (prefs === null) {
      (async () => {
        try {
          await createDefaults();
        } catch (err) {
          console.error('Failed to create default preferences:', err);
        }
      })();
    }

    if (prefs?.quietHours) {
      setQuietHours({
        enabled: prefs.quietHours.enabled,
        startTime: prefs.quietHours.startTime,
        endTime: prefs.quietHours.endTime
      });
    }
    if (prefs?.phoneNumber) {
      setPhoneNumber(prefs.phoneNumber);
    }
  }, [prefs, createDefaults]);

  if (prefs === undefined) {
    return <div>Loading notification settings...</div>;
  }

  if (prefs === null) {
    return <div>Initializing notification settings...</div>;
  }

  const handleChannelToggle = async (
    channel: 'emailEnabled' | 'smsEnabled' | 'slackEnabled' | 'inAppEnabled'
  ) => {
    setIsLoading(true);
    try {
      const newValue = !prefs[channel];
      await updateChannels({
        [channel]: newValue
      });
      toast.success(
        `${channel.replace('Enabled', '')} notifications ${newValue ? 'enabled' : 'disabled'}`
      );
    } catch (err) {
      toast.error('Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationTypeToggle = async (
    type: keyof typeof prefs.notificationTypes
  ) => {
    setIsLoading(true);
    try {
      await updateTypes({
        [type]: !prefs.notificationTypes[type]
      });
      toast.success(
        `${type} notifications ${!prefs.notificationTypes[type] ? 'enabled' : 'disabled'}`
      );
    } catch (err) {
      toast.error('Failed to update notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuietHoursUpdate = async () => {
    setIsLoading(true);
    try {
      await updateQuietHoursMutation({
        enabled: quietHours.enabled,
        startTime: quietHours.startTime,
        endTime: quietHours.endTime
      });
      toast.success('Quiet hours updated');
    } catch (err) {
      toast.error('Failed to update quiet hours');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneNumberAdd = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setIsLoading(true);
    try {
      await addPhoneNumber({ phoneNumber });
      toast.success('Phone number saved');
    } catch (err) {
      toast.error('Failed to save phone number');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async (channel: string) => {
    try {
      await testNotification({ channel });
      toast.success(`Test ${channel} notification sent`);
    } catch (err) {
      toast.error(`Failed to send test ${channel} notification`);
    }
  };

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='mb-2 text-2xl font-bold'>Notification Settings</h1>
        <p className='text-muted-foreground'>
          Manage how and when you receive notifications
        </p>
      </div>

      {/* Channel Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Bell className='h-5 w-5' />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose which channels to receive notifications through
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* In-App */}
          <div className='flex items-center justify-between rounded-lg border p-3'>
            <div className='flex items-center gap-3'>
              <MessageSquare className='h-5 w-5 text-blue-500' />
              <div>
                <p className='font-medium'>In-App Notifications</p>
                <p className='text-sm text-muted-foreground'>
                  See notifications in your inbox
                </p>
              </div>
            </div>
            <Switch
              checked={prefs.inAppEnabled}
              onCheckedChange={() => handleChannelToggle('inAppEnabled')}
              disabled={isLoading}
            />
          </div>

          {/* Email */}
          <div className='flex items-center justify-between rounded-lg border p-3'>
            <div className='flex items-center gap-3'>
              <Mail className='h-5 w-5 text-amber-500' />
              <div>
                <p className='font-medium'>Email Notifications</p>
                <p className='text-sm text-muted-foreground'>
                  Receive important updates via email
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Switch
                checked={prefs.emailEnabled}
                onCheckedChange={() => handleChannelToggle('emailEnabled')}
                disabled={isLoading}
              />
              {prefs.emailEnabled && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleTestNotification('email')}
                >
                  Test
                </Button>
              )}
            </div>
          </div>

          {/* SMS */}
          <div className='flex items-center justify-between rounded-lg border p-3'>
            <div className='flex items-center gap-3'>
              <Send className='h-5 w-5 text-green-500' />
              <div>
                <p className='font-medium'>SMS Alerts</p>
                <p className='text-sm text-muted-foreground'>
                  Get critical alerts via text message
                </p>
              </div>
            </div>
            <Switch
              checked={prefs.smsEnabled}
              onCheckedChange={() => handleChannelToggle('smsEnabled')}
              disabled={isLoading}
            />
          </div>

          {/* SMS Phone Number */}
          {prefs.smsEnabled && (
            <div className='rounded-lg border bg-muted p-3'>
              <label className='mb-2 block text-sm font-medium'>
                Phone Number for SMS
              </label>
              <div className='flex gap-2'>
                <Input
                  type='tel'
                  placeholder='+1 (555) 123-4567'
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <Button
                  onClick={handlePhoneNumberAdd}
                  disabled={isLoading}
                  variant='outline'
                >
                  Save
                </Button>
              </div>
            </div>
          )}

          {/* Slack */}
          <div className='flex items-center justify-between rounded-lg border p-3'>
            <div className='flex items-center gap-3'>
              <Slack className='h-5 w-5 text-purple-500' />
              <div>
                <p className='font-medium'>Slack Integration</p>
                <p className='text-sm text-muted-foreground'>
                  Receive messages in your Slack workspace
                </p>
              </div>
            </div>
            <Switch
              checked={prefs.slackEnabled}
              onCheckedChange={() => handleChannelToggle('slackEnabled')}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Choose which types of notifications to receive
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {Object.entries(prefs.notificationTypes).map(([type, enabled]) => (
            <div key={type} className='flex items-center justify-between p-2'>
              <label className='cursor-pointer text-sm font-medium capitalize'>
                {type.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <Switch
                checked={enabled}
                onCheckedChange={() =>
                  handleNotificationTypeToggle(
                    type as keyof typeof prefs.notificationTypes
                  )
                }
                disabled={isLoading}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
          <CardDescription>
            Pause non-critical notifications during these hours
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-3 rounded-lg border p-3'>
            <Switch
              checked={quietHours.enabled}
              onCheckedChange={(v) =>
                setQuietHours({ ...quietHours, enabled: v })
              }
            />
            <p className='text-sm font-medium'>Enable Quiet Hours</p>
          </div>

          {quietHours.enabled && (
            <div className='space-y-3 rounded-lg border bg-muted p-3'>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='mb-1 block text-sm font-medium'>
                    Start Time
                  </label>
                  <Input
                    type='time'
                    value={quietHours.startTime}
                    onChange={(e) =>
                      setQuietHours({
                        ...quietHours,
                        startTime: e.target.value
                      })
                    }
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium'>
                    End Time
                  </label>
                  <Input
                    type='time'
                    value={quietHours.endTime}
                    onChange={(e) =>
                      setQuietHours({
                        ...quietHours,
                        endTime: e.target.value
                      })
                    }
                  />
                </div>
              </div>
              <Button
                onClick={handleQuietHoursUpdate}
                disabled={isLoading}
                className='w-full'
              >
                Save Quiet Hours
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
