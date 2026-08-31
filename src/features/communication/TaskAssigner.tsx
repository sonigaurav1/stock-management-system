'use client';

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface TaskAssignerProps {
  onTaskCreated?: () => void;
  trigger?: React.ReactNode;
}

export default function TaskAssigner({
  onTaskCreated,
  trigger
}: TaskAssignerProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    priority: 'medium',
    dueDate: '',
    tags: ''
  });

  const createTask = useMutation(api.tasks.createTask);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.assigneeId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await createTask({
        title: formData.title,
        description: formData.description || undefined,
        assigneeId: formData.assigneeId,
        priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent',
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).getTime()
          : undefined,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t),
        notifyAssignee: true
      });

      toast.success('Task assigned successfully');
      setFormData({
        title: '',
        description: '',
        assigneeId: '',
        priority: 'medium',
        dueDate: '',
        tags: ''
      });
      setOpen(false);
      onTaskCreated?.();
    } catch (err) {
      toast.error('Failed to create task');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>New Task</Button>}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Assign New Task</DialogTitle>
          <DialogDescription>
            Create and assign a task to a team member
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Title */}
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Task Title <span className='text-red-500'>*</span>
            </label>
            <Input
              required
              placeholder='e.g., Review inventory reconciliation'
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* Description */}
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Description
            </label>
            <Textarea
              placeholder='Add details about the task...'
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Assignee */}
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Assign To <span className='text-red-500'>*</span>
            </label>
            <Input
              required
              placeholder='User ID or email of assignee'
              value={formData.assigneeId}
              onChange={(e) =>
                setFormData({ ...formData, assigneeId: e.target.value })
              }
            />
            <p className='mt-1 text-xs text-muted-foreground'>
              Enter the Clerk user ID or email address
            </p>
          </div>

          {/* Priority */}
          <div>
            <label className='mb-1 block text-sm font-medium'>Priority</label>
            <Select
              value={formData.priority}
              onValueChange={(value) =>
                setFormData({ ...formData, priority: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='low'>Low</SelectItem>
                <SelectItem value='medium'>Medium</SelectItem>
                <SelectItem value='high'>High</SelectItem>
                <SelectItem value='urgent'>Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div>
            <label className='mb-1 block text-sm font-medium'>Due Date</label>
            <Input
              type='date'
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
            />
          </div>

          {/* Tags */}
          <div>
            <label className='mb-1 block text-sm font-medium'>Tags</label>
            <Input
              placeholder='Comma-separated tags, e.g., inventory, urgent'
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
            />
          </div>

          {/* Actions */}
          <div className='flex justify-end gap-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Assign Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
