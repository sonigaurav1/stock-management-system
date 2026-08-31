'use client';

import Link from 'next/link';
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
  Key
} from 'lucide-react';

const settingsCategories = [
  // Personal Settings
  {
    title: 'User Preferences',
    description: 'Profile, password, and personal details',
    href: '/settings/profile',
    icon: User,
    section: 'personal'
  },
  {
    title: 'Appearance',
    description: 'Theme, language, timezone, and display',
    href: '/settings/appearance',
    icon: Palette,
    section: 'personal'
  },
  {
    title: 'Display',
    description: 'Dashboard layout, density, and UI options',
    href: '/settings/display',
    icon: Monitor,
    section: 'personal'
  },
  {
    title: 'Notifications',
    description: 'Email alerts, SMS, and in-app notifications',
    href: '/settings/notifications',
    icon: Bell,
    section: 'personal'
  },
  // Organization Settings
  {
    title: 'Organization',
    description: 'Company details, GST, business registration',
    href: '/settings/organization',
    icon: Building2,
    section: 'organization'
  },
  {
    title: 'Users & Permissions',
    description: 'Team management, roles, and access levels',
    href: '/settings/users',
    icon: Users,
    section: 'organization'
  },
  {
    title: 'Security & Compliance',
    description: '2FA, audit logs, SSO, and data security',
    href: '/settings/security',
    icon: Lock,
    section: 'organization'
  },
  {
    title: 'Billing & Subscription',
    description: 'Plans, invoices, payment methods',
    href: '/settings/billing',
    icon: CreditCard,
    section: 'organization'
  },
  // Developer Settings
  {
    title: 'API',
    description: 'API keys, rate limits',
    href: '/settings/api',
    icon: Key,
    section: 'developer'
  },
  {
    title: 'Import / Export',
    description: 'Backup, restore, and data management',
    href: '/settings/data',
    icon: Download,
    section: 'developer'
  }
];

export default function SettingsPage() {
  // Group categories by section
  const personalCategories = settingsCategories.filter(
    (c) => c.section === 'personal'
  );
  const organizationCategories = settingsCategories.filter(
    (c) => c.section === 'organization'
  );
  const developerCategories = settingsCategories.filter(
    (c) => c.section === 'developer'
  );

  const renderCategoryCard = (category: (typeof settingsCategories)[0]) => (
    <Link
      key={category.href}
      href={category.href}
      className='group flex flex-col rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm'
    >
      <div className='mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10'>
        <category.icon className='h-4 w-4 text-primary' />
      </div>
      <h3 className='text-sm font-semibold group-hover:text-primary'>
        {category.title}
      </h3>
      <p className='mt-0.5 text-xs text-muted-foreground'>
        {category.description}
      </p>
    </Link>
  );

  return (
    <div className='flex flex-col p-6'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold tracking-tight'>Settings</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Configure your organization, team, and preferences
        </p>
      </div>

      <div className='space-y-8'>
        {/* Personal Section */}
        <section>
          <h2 className='mb-3 text-sm font-medium text-muted-foreground'>
            Personal
          </h2>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {personalCategories.map(renderCategoryCard)}
          </div>
        </section>

        {/* Organization Section */}
        <section>
          <h2 className='mb-3 text-sm font-medium text-muted-foreground'>
            Organization
          </h2>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {organizationCategories.map(renderCategoryCard)}
          </div>
        </section>

        {/* Developer Section */}
        <section>
          <h2 className='mb-3 text-sm font-medium text-muted-foreground'>
            Developer
          </h2>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {developerCategories.map(renderCategoryCard)}
          </div>
        </section>
      </div>

      {/* Quick Tip */}
      <div className='mt-8 rounded-lg border bg-muted/30 p-3'>
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <Settings className='h-3.5 w-3.5' />
          <span>
            Tip: Use keyboard shortcut{' '}
            <kbd className='rounded bg-muted px-1 py-0.5 font-mono text-xs'>
              S
            </kbd>{' '}
            to quickly open Settings
          </span>
        </div>
      </div>
    </div>
  );
}
