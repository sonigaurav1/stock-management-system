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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Monitor, Calendar, Clock, Layout, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeInUp, easings } from '@/lib/animations';

const DisplaySettings = () => {
  const [dateFormat, setDateFormat] = useState('mdy');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [compactView, setCompactView] = useState(false);
  const [showAvatars, setShowAvatars] = useState(true);

  return (
    <div className='space-y-6 px-4 py-6 md:px-6 lg:px-8'>
      {/* Date Format */}
      <motion.div variants={fadeInUp} initial='initial' animate='animate'>
        <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600'>
                <Calendar className='h-5 w-5 text-white' />
              </div>
              <div>
                <CardTitle>Date Format</CardTitle>
                <CardDescription>
                  Choose how dates are displayed throughout the application
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup value={dateFormat} onValueChange={setDateFormat}>
              <div className='flex items-center space-x-3 rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800'>
                <RadioGroupItem value='mdy' id='mdy' />
                <Label
                  htmlFor='mdy'
                  className='cursor-pointer font-medium text-slate-900 dark:text-slate-100'
                >
                  MM/DD/YYYY
                </Label>
              </div>
              <div className='flex items-center space-x-3 rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800'>
                <RadioGroupItem value='dmy' id='dmy' />
                <Label
                  htmlFor='dmy'
                  className='cursor-pointer font-medium text-slate-900 dark:text-slate-100'
                >
                  DD/MM/YYYY
                </Label>
              </div>
              <div className='flex items-center space-x-3 rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800'>
                <RadioGroupItem value='ymd' id='ymd' />
                <Label
                  htmlFor='ymd'
                  className='cursor-pointer font-medium text-slate-900 dark:text-slate-100'
                >
                  YYYY/MM/DD
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </motion.div>

      {/* Time Format */}
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
                <Clock className='h-5 w-5 text-white' />
              </div>
              <div>
                <CardTitle>Time Format</CardTitle>
                <CardDescription>
                  Choose how time is displayed throughout the application
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup value={timeFormat} onValueChange={setTimeFormat}>
              <div className='flex items-center space-x-3 rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800'>
                <RadioGroupItem value='12h' id='12h' />
                <Label
                  htmlFor='12h'
                  className='cursor-pointer font-medium text-slate-900 dark:text-slate-100'
                >
                  12-hour (1:30 PM)
                </Label>
              </div>
              <div className='flex items-center space-x-3 rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800'>
                <RadioGroupItem value='24h' id='24h' />
                <Label
                  htmlFor='24h'
                  className='cursor-pointer font-medium text-slate-900 dark:text-slate-100'
                >
                  24-hour (13:30)
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </motion.div>

      {/* Display Options */}
      <motion.div
        variants={fadeInUp}
        initial='initial'
        animate='animate'
        transition={{ delay: 0.2 }}
      >
        <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600'>
                <Layout className='h-5 w-5 text-white' />
              </div>
              <div>
                <CardTitle>Display Options</CardTitle>
                <CardDescription>
                  Customize the overall display and layout preferences
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800'>
              <div className='space-y-0.5'>
                <Label
                  htmlFor='compact-view'
                  className='text-slate-900 dark:text-slate-100'
                >
                  Compact view
                </Label>
                <p className='text-sm text-slate-600 dark:text-slate-400'>
                  Display more content with less spacing.
                </p>
              </div>
              <Switch
                id='compact-view'
                checked={compactView}
                onCheckedChange={setCompactView}
              />
            </div>

            <div className='flex items-center justify-between rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800'>
              <div className='space-y-0.5'>
                <Label
                  htmlFor='show-avatars'
                  className='text-slate-900 dark:text-slate-100'
                >
                  Show avatars
                </Label>
                <p className='text-sm text-slate-600 dark:text-slate-400'>
                  Display user avatars in lists and comments.
                </p>
              </div>
              <Switch
                id='show-avatars'
                checked={showAvatars}
                onCheckedChange={setShowAvatars}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div
        variants={fadeInUp}
        initial='initial'
        animate='animate'
        transition={{ delay: 0.3 }}
        className='flex justify-end'
      >
        <Button className='bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'>
          Save preferences
        </Button>
      </motion.div>
    </div>
  );
};

export default DisplaySettings;
