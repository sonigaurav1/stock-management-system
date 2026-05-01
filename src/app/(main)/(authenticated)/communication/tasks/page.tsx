'use client';

import PageContainer from '@/components/layout/PageContainer';
import { TaskList, TaskAssigner } from '@/features/communication';
import { Plus } from 'lucide-react';

export default function TasksPage() {
  return (
    <PageContainer>
      <div className='flex h-full flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>Task Management</h1>
          <TaskAssigner
            trigger={
              <button className='inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'>
                <Plus className='h-4 w-4' />
                New Task
              </button>
            }
          />
        </div>
        <TaskList />
      </div>
    </PageContainer>
  );
}
