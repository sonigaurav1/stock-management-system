'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface MessageThreadProps {
  messageId: Id<'messages'>;
  onBack: () => void;
}

export default function MessageThread({
  messageId,
  onBack
}: MessageThreadProps) {
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const threadData = useQuery(api.messaging.getMessageThread, { messageId });
  const sendMessage = useMutation(api.messaging.sendMessage);

  if (threadData === undefined) {
    return <div>Loading...</div>;
  }

  const { root, replies } = threadData;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsLoading(true);
    try {
      // Determine who to reply to (alternate between sender and recipient)
      const replyTo =
        root.senderId === root.recipientId ? root.senderId : root.recipientId;

      await sendMessage({
        recipientId: replyTo,
        content: replyContent,
        subject: `Re: ${root.subject || 'Message'}`,
        priority: root.priority,
        replyToId: messageId
      });

      setReplyContent('');
      toast.success('Reply sent');
    } catch (err) {
      toast.error('Failed to send reply');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const MessageBubble = ({
    data,
    isOwn
  }: {
    data: typeof root | (typeof replies)[0];
    isOwn: boolean;
  }) => (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-md rounded-lg p-3 ${
          isOwn ? 'bg-blue-500 text-white' : 'border bg-muted'
        }`}
      >
        <div className='mb-1 flex items-center gap-2'>
          <span className='text-sm font-semibold'>
            {isOwn ? 'You' : data.senderId.substring(0, 8)}
          </span>
          {data.priority === 'high' && <AlertCircle className='h-3 w-3' />}
        </div>
        <p className='whitespace-pre-wrap break-words text-sm'>
          {data.content}
        </p>
        <p
          className={`mt-2 text-xs ${isOwn ? 'text-blue-100' : 'text-muted-foreground'}`}
        >
          {new Date(data.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );

  return (
    <div className='flex h-full flex-col gap-4'>
      {/* Header */}
      <div className='flex items-center gap-3 border-b pb-4'>
        <Button variant='ghost' size='sm' onClick={onBack}>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div className='flex-1'>
          <h2 className='font-semibold'>{root.subject || 'Message Thread'}</h2>
          <p className='text-xs text-muted-foreground'>
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </p>
        </div>
      </div>

      {/* Message thread */}
      <div className='flex-1 overflow-y-auto rounded-lg bg-background p-4'>
        {/* Root message */}
        <MessageBubble data={root} isOwn={false} />

        {/* Replies */}
        {replies.map((reply, idx) => (
          <MessageBubble key={idx} data={reply} isOwn={false} />
        ))}
      </div>

      {/* Reply box */}
      <form onSubmit={handleSendReply} className='border-t pt-4'>
        <div className='flex gap-2'>
          <Textarea
            placeholder='Type your reply...'
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className='resize-none'
            rows={3}
          />
          <Button
            type='submit'
            disabled={isLoading || !replyContent.trim()}
            className='self-end'
          >
            <Send className='mr-2 h-4 w-4' />
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
