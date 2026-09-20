'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  Building2,
  Users,
  Lock,
  CreditCard,
  Download,
  Settings,
  Palette,
  Bell,
  Monitor,
  Key,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fadeInUp, staggerContainer, easings } from '@/lib/animations';

const settingsCategories = [
  // Personal Settings
  {
    title: 'User Preferences',
    description: 'Profile, password, and personal details',
    href: '/settings/profile',
    icon: User,
    section: 'personal',
    color: 'from-blue-500 to-indigo-600'
  },
  // {
  //   title: 'Appearance',
  //   description: 'Theme, language, timezone, and display',
  //   href: '/settings/appearance',
  //   icon: Palette,
  //   section: 'personal',
  //   color: 'from-purple-500 to-pink-600'
  // },
  {
    title: 'Display',
    description: 'Dashboard layout, density, and UI options',
    href: '/settings/display',
    icon: Monitor,
    section: 'personal',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    title: 'Notifications',
    description: 'Email alerts, SMS, and in-app notifications',
    href: '/settings/notifications',
    icon: Bell,
    section: 'personal',
    color: 'from-amber-500 to-orange-600'
  },
  // Company Settings
  {
    title: 'Company Details',
    description: 'Company details, GST, business registration',
    href: '/settings/company',
    icon: Building2,
    section: 'company',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    title: 'Users & Permissions',
    description: 'Team management, roles, and access levels',
    href: '/settings/users',
    icon: Users,
    section: 'company',
    color: 'from-violet-500 to-purple-600'
  },
  {
    title: 'Security & Compliance',
    description: '2FA, audit logs, SSO, and data security',
    href: '/settings/security',
    icon: Lock,
    section: 'company',
    color: 'from-rose-500 to-red-600'
  },
  {
    title: 'Billing & Subscription',
    description: 'Plans, invoices, payment methods',
    href: '/settings/billing',
    icon: CreditCard,
    section: 'company',
    color: 'from-green-500 to-emerald-600'
  },
  // Developer Settings
  {
    title: 'Import / Export',
    description: 'Backup, restore, and data management',
    href: '/settings/data',
    icon: Download,
    section: 'developer',
    color: 'from-slate-500 to-gray-600'
  }
];

export default function SettingsPage() {
  // Group categories by section
  const personalCategories = settingsCategories.filter(
    (c) => c.section === 'personal'
  );
  const companyCategories = settingsCategories.filter(
    (c) => c.section === 'company'
  );
  const developerCategories = settingsCategories.filter(
    (c) => c.section === 'developer'
  );

  const renderCategoryCard = (
    category: (typeof settingsCategories)[0],
    index: number
  ) => (
    <motion.div
      key={category.href}
      variants={fadeInUp}
      initial='initial'
      animate='animate'
      transition={{ delay: index * 0.05, duration: 0.3, ease: easings.easeOut }}
    >
      <Link
        href={category.href}
        className='group relative block overflow-hidden rounded-xl border border-slate-200/50 bg-white/80 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 dark:border-slate-700/50 dark:bg-slate-900/80'
      >
        {/* Gradient background on hover */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-5',
            category.color
          )}
        />

        <div className='relative'>
          {/* Icon */}
          <div
            className={cn(
              'mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br opacity-90',
              category.color
            )}
          >
            <category.icon className='h-6 w-6 text-white' />
          </div>

          {/* Content */}
          <div className='mb-3 flex items-start justify-between'>
            <h3 className='text-base font-semibold text-slate-900 transition-colors group-hover:text-primary dark:text-slate-100'>
              {category.title}
            </h3>
            <ArrowRight className='h-4 w-4 translate-x-[-8px] transform text-slate-400 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100' />
          </div>

          <p className='text-sm text-slate-600 dark:text-slate-400'>
            {category.description}
          </p>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <motion.div
      variants={staggerContainer}
      initial='initial'
      animate='animate'
      className='flex flex-col p-6 md:p-8'
    >
      <div className='space-y-10'>
        {/* Personal Section */}
        <motion.section variants={fadeInUp}>
          <h2 className='mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
            Personal
          </h2>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {personalCategories.map((category, index) =>
              renderCategoryCard(category, index)
            )}
          </div>
        </motion.section>

        {/* Company Section */}
        <motion.section variants={fadeInUp}>
          <h2 className='mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
            Company
          </h2>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {companyCategories.map((category, index) =>
              renderCategoryCard(category, index + personalCategories.length)
            )}
          </div>
        </motion.section>

        {/* Developer Section */}
        <motion.section variants={fadeInUp}>
          <h2 className='mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'>
            Developer
          </h2>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {developerCategories.map((category, index) =>
              renderCategoryCard(
                category,
                index + personalCategories.length + companyCategories.length
              )
            )}
          </div>
        </motion.section>
      </div>

      {/* Quick Tip */}
      <motion.div
        variants={fadeInUp}
        className='mt-10 rounded-xl border border-slate-200/50 bg-slate-50/80 p-4 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/50'
      >
        <div className='flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30'>
            <Settings className='h-4 w-4 text-cyan-600 dark:text-cyan-400' />
          </div>
          <span>
            Tip: Use keyboard shortcut{' '}
            <kbd className='rounded bg-slate-200 px-2 py-1 font-mono text-xs dark:bg-slate-700 dark:text-slate-300'>
              S
            </kbd>{' '}
            to quickly open Settings
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
