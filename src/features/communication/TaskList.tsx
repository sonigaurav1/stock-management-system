'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Edit,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function TaskList() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>(
    'dueDate'
  );
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const tasks = useQuery(api.tasks.getAssignedTasks, {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sortBy
  });

  const taskStats = useQuery(api.tasks.getTaskStats);
  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);
  const deleteTask = useMutation(api.tasks.deleteTask);

  if (tasks === undefined || taskStats === undefined) {
    return <div>Loading tasks...</div>;
  }

  const priorityColor = {
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900',
    low: 'bg-green-100 text-green-800 dark:bg-green-900'
  };

  const statusIcons = {
    assigned: <AlertCircle className='h-4 w-4' />,
    in_progress: <Clock className='h-4 w-4' />,
    completed: <CheckCircle2 className='h-4 w-4' />
  };

  const isOverdue = (task: any) =>
    task.dueDate && task.dueDate < Date.now() && task.status !== 'completed';

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus({
        taskId: taskId as any,
        status: newStatus
      });
      toast.success(`Task marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask({ taskId: taskId as any });
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className='flex h-full flex-col gap-4 p-6'>
      {/* Header with stats */}
      <div>
        <h1 className='mb-4 text-2xl font-bold'>My Tasks</h1>

        {/* Stats cards */}
        <div className='mb-4 grid grid-cols-2 gap-2 md:grid-cols-6'>
          <StatCard label='Total' value={taskStats.total} />
          <StatCard label='Assigned' value={taskStats.assigned} color='blue' />
          <StatCard
            label='In Progress'
            value={taskStats.inProgress}
            color='orange'
          />
          <StatCard
            label='Completed'
            value={taskStats.completed}
            color='green'
          />
          <StatCard label='Overdue' value={taskStats.overdue} color='red' />
          <StatCard
            label='High Priority'
            value={taskStats.high_priority}
            color='purple'
          />
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-3'>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-32'>
            <SelectValue placeholder='All Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='assigned'>Assigned</SelectItem>
            <SelectItem value='in_progress'>In Progress</SelectItem>
            <SelectItem value='completed'>Completed</SelectItem>
            <SelectItem value='cancelled'>Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className='w-32'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='dueDate'>Due Date</SelectItem>
            <SelectItem value='priority'>Priority</SelectItem>
            <SelectItem value='createdAt'>Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task list */}
      <div className='flex-1 space-y-2 overflow-y-auto'>
        {tasks.length === 0 ? (
          <div className='flex h-64 items-center justify-center'>
            <p className='text-muted-foreground'>No tasks found</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className={`cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md ${
                isOverdue(task)
                  ? 'border-red-300 bg-red-50 dark:bg-red-950'
                  : ''
              }`}
              onClick={() => setSelectedTask(task._id)}
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0 flex-1'>
                  <div className='mb-2 flex items-center gap-2'>
                    <h3 className='truncate font-semibold'>{task.title}</h3>
                    {statusIcons[task.status as keyof typeof statusIcons]}
                  </div>

                  {task.description && (
                    <p className='mb-2 truncate text-sm text-muted-foreground'>
                      {task.description}
                    </p>
                  )}

                  <div className='flex flex-wrap items-center gap-2'>
                    <Badge
                      className={
                        priorityColor[
                          task.priority as keyof typeof priorityColor
                        ]
                      }
                      variant='outline'
                    >
                      {task.priority}
                    </Badge>

                    {task.dueDate && (
                      <span
                        className={`text-xs ${isOverdue(task) ? 'font-semibold text-red-600' : 'text-muted-foreground'}`}
                      >
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}

                    {task.tags && task.tags.length > 0 && (
                      <div className='flex gap-1'>
                        {task.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant='secondary'
                            className='text-xs'
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className='flex flex-shrink-0 gap-1'
                  onClick={(e) => e.stopPropagation()}
                >
                  <Select
                    value={task.status}
                    onValueChange={(v) => handleStatusChange(task._id, v)}
                  >
                    <SelectTrigger className='h-8 w-24'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='assigned'>Assigned</SelectItem>
                      <SelectItem value='in_progress'>In Progress</SelectItem>
                      <SelectItem value='completed'>Done</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleDelete(task._id)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = 'slate'
}: {
  label: string;
  value: number;
  color?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-900 dark:bg-blue-900',
    orange: 'bg-orange-100 text-orange-900 dark:bg-orange-900',
    green: 'bg-green-100 text-green-900 dark:bg-green-900',
    red: 'bg-red-100 text-red-900 dark:bg-red-900',
    purple: 'bg-purple-100 text-purple-900 dark:bg-purple-900',
    slate: 'bg-slate-100 text-slate-900 dark:bg-slate-900'
  };

  return (
    <div
      className={`rounded-lg p-3 ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <p className='text-xs opacity-75'>{label}</p>
      <p className='text-xl font-bold'>{value}</p>
    </div>
  );
}
