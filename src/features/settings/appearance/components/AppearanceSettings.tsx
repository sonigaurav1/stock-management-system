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
  Monitor,
  Moon,
  Sun,
  Globe,
  Clock,
  Eye,
  Layout,
  Zap,
  Accessibility
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeInUp, easings } from '@/lib/animations';

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
      description: 'Bright and clean interface',
      color: 'from-amber-400 to-orange-500'
    },
    {
      id: 'dark',
      name: 'Dark',
      icon: Moon,
      description: 'Easy on the eyes',
      color: 'from-slate-600 to-slate-800'
    },
    {
      id: 'system',
      name: 'System',
      icon: Monitor,
      description: 'Match your device settings',
      color: 'from-blue-500 to-indigo-600'
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
    <div className='space-y-6 px-4 py-6 md:px-6 lg:px-8'>
      {/* Theme Selection */}
      <motion.div variants={fadeInUp} initial='initial' animate='animate'>
        <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600'>
                <Eye className='h-5 w-5 text-white' />
              </div>
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
                const isSelected = theme === themeOption.id;
                return (
                  <motion.button
                    key={themeOption.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleThemeChange(themeOption.id)}
                    className={cn(
                      'relative flex h-auto flex-col items-center justify-center gap-3 rounded-xl border-2 p-6 transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                        : 'border-slate-200/50 bg-slate-50/50 hover:border-primary/50 dark:border-slate-700/50 dark:bg-slate-800/50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br',
                        themeOption.color
                      )}
                    >
                      <Icon className='h-6 w-6 text-white' />
                    </div>
                    <div className='text-center'>
                      <p className='font-semibold text-slate-900 dark:text-slate-100'>
                        {themeOption.name}
                      </p>
                      <p className='text-xs text-slate-600 dark:text-slate-400'>
                        {themeOption.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Badge className='absolute right-3 top-3 bg-primary'>
                        Active
                      </Badge>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Language & Localization */}
      <motion.div
        variants={fadeInUp}
        initial='initial'
        animate='animate'
        transition={{ delay: 0.1 }}
      >
        <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600'>
                <Globe className='h-5 w-5 text-white' />
              </div>
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
              <label className='mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100'>
                Language
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className='border-slate-200/50 bg-slate-50/50 dark:border-slate-700/50 dark:bg-slate-800/50'>
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
              <p className='mt-2 text-xs text-slate-600 dark:text-slate-400'>
                Interface language will change on next refresh
              </p>
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100'>
                Timezone
              </label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className='border-slate-200/50 bg-slate-50/50 dark:border-slate-700/50 dark:bg-slate-800/50'>
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
              <p className='mt-2 text-xs text-slate-600 dark:text-slate-400'>
                Used for time-based reports and scheduling
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Layout Preferences */}
      <motion.div
        variants={fadeInUp}
        initial='initial'
        animate='animate'
        transition={{ delay: 0.2 }}
      >
        <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600'>
                <Layout className='h-5 w-5 text-white' />
              </div>
              <div>
                <CardTitle>Layout Preferences</CardTitle>
                <CardDescription>
                  Customize the interface layout
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800'>
              <div>
                <p className='font-medium text-slate-900 dark:text-slate-100'>
                  Collapse Sidebar by Default
                </p>
                <p className='text-sm text-slate-600 dark:text-slate-400'>
                  Start with sidebar minimized
                </p>
              </div>
              <Switch
                checked={sidebarCollapsed}
                onCheckedChange={setSidebarCollapsed}
              />
            </div>

            <div className='flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800'>
              <div>
                <p className='font-medium text-slate-900 dark:text-slate-100'>
                  Compact Mode
                </p>
                <p className='text-sm text-slate-600 dark:text-slate-400'>
                  Reduce spacing and font sizes
                </p>
              </div>
              <Switch checked={compactMode} onCheckedChange={setCompactMode} />
            </div>

            <div className='flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800'>
              <div>
                <p className='font-medium text-slate-900 dark:text-slate-100'>
                  Show Animations
                </p>
                <p className='text-sm text-slate-600 dark:text-slate-400'>
                  Enable UI animations and transitions
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Display Format */}
      <motion.div
        variants={fadeInUp}
        initial='initial'
        animate='animate'
        transition={{ delay: 0.3 }}
      >
        <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600'>
                <Zap className='h-5 w-5 text-white' />
              </div>
              <div>
                <CardTitle>Data Display Format</CardTitle>
                <CardDescription>
                  Customize how data is displayed
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100'>
                Date Format
              </label>
              <Select defaultValue='DD/MM/YYYY'>
                <SelectTrigger className='border-slate-200/50 bg-slate-50/50 dark:border-slate-700/50 dark:bg-slate-800/50'>
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
              <label className='mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100'>
                Time Format
              </label>
              <Select defaultValue='24'>
                <SelectTrigger className='border-slate-200/50 bg-slate-50/50 dark:border-slate-700/50 dark:bg-slate-800/50'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='24'>24-Hour (23:45)</SelectItem>
                  <SelectItem value='12'>12-Hour (11:45 PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100'>
                Currency Format
              </label>
              <Select defaultValue='INR'>
                <SelectTrigger className='border-slate-200/50 bg-slate-50/50 dark:border-slate-700/50 dark:bg-slate-800/50'>
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
              <label className='mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100'>
                Number Format
              </label>
              <Select defaultValue='comma'>
                <SelectTrigger className='border-slate-200/50 bg-slate-50/50 dark:border-slate-700/50 dark:bg-slate-800/50'>
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
      </motion.div>

      {/* Accessibility */}
      <motion.div
        variants={fadeInUp}
        initial='initial'
        animate='animate'
        transition={{ delay: 0.4 }}
      >
        <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600'>
                <Accessibility className='h-5 w-5 text-white' />
              </div>
              <div>
                <CardTitle>Accessibility</CardTitle>
                <CardDescription>
                  Enhance usability and accessibility features
                </CardDescription>
              </div>
            </div>
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
                className='flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 p-3 transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800'
              >
                <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                  {feature.name}
                </p>
                <Switch checked={feature.enabled} />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Changes */}
      <motion.div
        variants={fadeInUp}
        initial='initial'
        animate='animate'
        transition={{ delay: 0.5 }}
        className='flex justify-end gap-2'
      >
        <Button variant='outline'>Reset to Defaults</Button>
        <Button className='bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'>
          Save Preferences
        </Button>
      </motion.div>
    </div>
  );
};

export default AppearanceSettings;
