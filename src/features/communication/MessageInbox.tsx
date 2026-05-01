'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Search,
  Mail,
  Archive,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import MessageThread from './MessageThread';

export default function MessageInbox() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Queries
  const messages = useQuery(api.messaging.getInbox, {
    filter: filter === 'all' ? undefined : filter,
    searchQuery: searchQuery || undefined,
    limit: 50
  });
  const unreadCount = useQuery(api.messaging.getUnreadCount);

  // Mutations
  const markAsRead = useMutation(api.messaging.markAsRead);
  const archiveMessage = useMutation(api.messaging.archiveMessage);
  const deleteMessage = useMutation(api.messaging.deleteMessage);

  if (messages === undefined) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <Clock className='animate-spin text-muted-foreground' />
      </div>
    );
  }

  const sorted = [...(messages || [])].sort((a, b) =>
    sortBy === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt
  );

  const handleMarkAsRead = async (messageId: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await markAsRead({ messageId: messageId as any });
      toast.success('Message marked as read');
    } catch (err) {
      toast.error('Failed to mark message as read');
    }
  };

  const handleArchive = async (messageId: string) => {
    try {
      await archiveMessage({ messageId: messageId as any });
      toast.success('Message archived');
    } catch (err) {
      toast.error('Failed to archive message');
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage({ messageId: messageId as any });
      toast.success('Message deleted');
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  if (selectedMessageId && messages) {
    const message = messages.find((m) => m._id === selectedMessageId);
    if (message) {
      return (
        <MessageThread
          messageId={selectedMessageId as any}
          onBack={() => setSelectedMessageId(null)}
        />
      );
    }
  }

  return (
    <div className='flex h-full flex-col gap-4 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Messages</h1>
          {unreadCount && unreadCount > 0 && (
            <p className='text-sm text-muted-foreground'>
              {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='min-w-[250px] flex-1'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
            <Input
              placeholder='Search messages...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>

        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className='w-32'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Messages</SelectItem>
            <SelectItem value='unread'>Unread</SelectItem>
            <SelectItem value='archived'>Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className='w-32'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='newest'>Newest First</SelectItem>
            <SelectItem value='oldest'>Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Messages List */}
      <div className='flex-1 overflow-y-auto rounded-lg border'>
        {sorted.length === 0 ? (
          <div className='flex h-64 flex-col items-center justify-center gap-3'>
            <Mail className='h-12 w-12 text-muted-foreground opacity-50' />
            <p className='text-muted-foreground'>No messages</p>
          </div>
        ) : (
          <div className='divide-y'>
            {sorted.map((message) => (
              <div
                key={message._id}
                className={`cursor-pointer p-4 transition-colors hover:bg-muted ${
                  !message.isRead ? 'bg-blue-50 dark:bg-blue-950' : ''
                }`}
              >
                <div
                  className='flex items-start gap-3'
                  onClick={() => {
                    handleMarkAsRead(message._id, message.isRead);
                    setSelectedMessageId(message._id);
                  }}
                >
                  {/* Unread indicator */}
                  <div className='flex-shrink-0 pt-1'>
                    {!message.isRead && (
                      <div className='h-3 w-3 rounded-full bg-blue-500' />
                    )}
                  </div>

                  {/* Message content */}
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <h3 className='truncate font-semibold'>
                          {message.subject || 'No Subject'}
                        </h3>
                        <p className='truncate text-sm text-muted-foreground'>
                          {message.content.substring(0, 80)}...
                        </p>
                      </div>
                      {message.priority === 'high' && (
                        <AlertCircle className='h-4 w-4 flex-shrink-0 text-red-500' />
                      )}
                    </div>

                    {/* Tags */}
                    {message.tags && message.tags.length > 0 && (
                      <div className='mt-2 flex flex-wrap gap-2'>
                        {message.tags.map((tag) => (
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

                    {/* Timestamp */}
                    <p className='mt-2 text-xs text-muted-foreground'>
                      {new Date(message.createdAt).toLocaleDateString()}{' '}
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div
                    className='flex flex-shrink-0 gap-1'
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleArchive(message._id)}
                      title='Archive'
                    >
                      <Archive className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDelete(message._id)}
                      title='Delete'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
