'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MessageInbox, TaskList, TaskAssigner } from '@/features/communication';
import { Mail, CheckSquare, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/PageContainer';

const TABS = [
  { id: 'inbox', label: 'Messages', icon: Mail, href: '/communication/inbox' },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: CheckSquare,
    href: '/communication/tasks'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    href: '/communication/notifications'
  }
];

export default function CommunicationPage() {
  const pathname = usePathname();
  const activeTab = pathname.split('/').pop() || 'inbox';

  return (
    <PageContainer>
      <div className='flex h-full flex-col gap-4'>
        {/* Tab Navigation */}
        <div className='flex items-center justify-between border-b'>
          <div className='flex gap-1'>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Link key={tab.id} href={tab.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className='gap-2'
                  >
                    <Icon className='h-4 w-4' />
                    {tab.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          {activeTab === 'tasks' && <TaskAssigner />}
        </div>

        {/* Content Area */}
        <div className='flex-1 overflow-hidden'>
          {activeTab === 'inbox' && <MessageInbox />}
          {activeTab === 'tasks' && <TaskList />}
          {activeTab === 'notifications' && (
            <div className='py-12 text-center'>
              <p className='text-muted-foreground'>
                Notification settings page
              </p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
