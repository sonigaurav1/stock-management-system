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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Monitor,
  Moon,
  Sun,
  Globe,
  Clock,
  Eye,
  Layout,
  Zap
} from 'lucide-react';

const AppearanceSettings = () => {
  const { toast } = useToast();
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Asia/Kathmandu');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  const handleThemeChange = (value: string) => {
    setTheme(value);
    toast({
      title: 'Theme Updated',
      description: `Theme changed to ${value}`
    });
  };

  const themes = [
    {
      id: 'light',
      name: 'Light',
      icon: Sun,
      description: 'Bright and clean interface'
    },
    {
      id: 'dark',
      name: 'Dark',
      icon: Moon,
      description: 'Easy on the eyes'
    },
    {
      id: 'system',
      name: 'System',
      icon: Monitor,
      description: 'Match your device settings'
    }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ne', name: 'Nepali' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' }
  ];

  const timezones = [
    'Asia/Kathmandu',
    'Asia/Kolkata',
    'Asia/Bangkok',
    'UTC',
    'America/New_York',
    'Europe/London'
  ];

  return (
    <div className='space-y-6'>
      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Eye className='h-5 w-5' />
            <div>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Choose your preferred appearance
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              return (
                <Button
                  key={themeOption.id}
                  variant={theme === themeOption.id ? 'default' : 'outline'}
                  className='flex h-auto flex-col items-center justify-center gap-2 p-4'
                  onClick={() => handleThemeChange(themeOption.id)}
                >
                  <Icon className='h-8 w-8' />
                  <div className='text-center'>
                    <p className='font-semibold'>{themeOption.name}</p>
                    <p className='text-xs'>{themeOption.description}</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Language & Localization */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Globe className='h-5 w-5' />
            <div>
              <CardTitle>Language & Localization</CardTitle>
              <CardDescription>
                Set your preferred language and regional settings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm font-medium'>Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='mt-2 text-xs text-muted-foreground'>
              Interface language will change on next refresh
            </p>
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium'>Timezone</label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='mt-2 text-xs text-muted-foreground'>
              Used for time-based reports and scheduling
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Layout Preferences */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Layout className='h-5 w-5' />
            <div>
              <CardTitle>Layout Preferences</CardTitle>
              <CardDescription>Customize the interface layout</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div>
              <p className='font-medium'>Collapse Sidebar by Default</p>
              <p className='text-sm text-muted-foreground'>
                Start with sidebar minimized
              </p>
            </div>
            <Button
              variant={sidebarCollapsed ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div>
              <p className='font-medium'>Compact Mode</p>
              <p className='text-sm text-muted-foreground'>
                Reduce spacing and font sizes
              </p>
            </div>
            <Button
              variant={compactMode ? 'default' : 'outline'}
              size='sm'
              onClick={() => setCompactMode(!compactMode)}
            >
              {compactMode ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div>
              <p className='font-medium'>Show Animations</p>
              <p className='text-sm text-muted-foreground'>
                Enable UI animations and transitions
              </p>
            </div>
            <Button variant='outline' size='sm'>
              Enabled
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Display Format */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Zap className='h-5 w-5' />
            <div>
              <CardTitle>Data Display Format</CardTitle>
              <CardDescription>Customize how data is displayed</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm font-medium'>
              Date Format
            </label>
            <Select defaultValue='DD/MM/YYYY'>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='DD/MM/YYYY'>DD/MM/YYYY</SelectItem>
                <SelectItem value='MM/DD/YYYY'>MM/DD/YYYY</SelectItem>
                <SelectItem value='YYYY-MM-DD'>YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium'>
              Time Format
            </label>
            <Select defaultValue='24'>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='24'>24-Hour (23:45)</SelectItem>
                <SelectItem value='12'>12-Hour (11:45 PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium'>
              Currency Format
            </label>
            <Select defaultValue='INR'>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='INR'>Indian Rupee (₹)</SelectItem>
                <SelectItem value='USD'>US Dollar ($)</SelectItem>
                <SelectItem value='EUR'>Euro (€)</SelectItem>
                <SelectItem value='GBP'>British Pound (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className='mb-2 block text-sm font-medium'>
              Number Format
            </label>
            <Select defaultValue='comma'>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='comma'>Comma (1,000.00)</SelectItem>
                <SelectItem value='period'>Period (1.000,00)</SelectItem>
                <SelectItem value='space'>Space (1 000,00)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Customization */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Widgets</CardTitle>
          <CardDescription>
            Choose which widgets appear on your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {[
              { name: 'Sales Overview', enabled: true },
              { name: 'Inventory Status', enabled: true },
              { name: 'Revenue Chart', enabled: true },
              { name: 'Top Products', enabled: true },
              { name: 'Recent Orders', enabled: false },
              { name: 'Team Activity', enabled: false }
            ].map((widget, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between rounded bg-slate-50 p-3 dark:bg-slate-900'
              >
                <p className='text-sm font-medium'>{widget.name}</p>
                <Button
                  variant={widget.enabled ? 'default' : 'outline'}
                  size='sm'
                >
                  {widget.enabled ? 'Visible' : 'Hidden'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>
            Enhance usability and accessibility features
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {[
            { name: 'High Contrast Mode', enabled: false },
            { name: 'Reduce Motion', enabled: false },
            { name: 'Larger Font Size', enabled: false },
            { name: 'Focus Indicators', enabled: true }
          ].map((feature, idx) => (
            <div
              key={idx}
              className='flex items-center justify-between rounded bg-slate-50 p-3 dark:bg-slate-900'
            >
              <p className='text-sm font-medium'>{feature.name}</p>
              <Button
                variant={feature.enabled ? 'default' : 'outline'}
                size='sm'
              >
                {feature.enabled ? 'On' : 'Off'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Changes */}
      <div className='flex justify-end gap-2'>
        <Button variant='outline'>Reset to Defaults</Button>
        <Button>Save Preferences</Button>
      </div>
    </div>
  );
};

export default AppearanceSettings;
