'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Trash2,
  Clock,
  Star
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function FeedbackList() {
  const [filter, setFilter] = useState<
    'all' | 'unread' | 'pending' | 'resolved'
  >('unread');
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [responseOpen, setResponseOpen] = useState(false);
  const [response, setResponse] = useState('');
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const feedbackList = useQuery(api.feedback.getAllFeedback, {
    sortBy: 'date',
    filter
  });

  const stats = useQuery(api.feedback.getFeedbackStats);
  const respondToFeedback = useMutation(api.feedback.respondToFeedback);
  const markAsRead = useMutation(api.feedback.markFeedbackAsRead);
  const deleteFeedback = useMutation(api.feedback.deleteFeedback);

  const handleRespond = async (feedbackId: string) => {
    if (!response.trim()) {
      toast.error('Please enter a response');
      return;
    }

    setLoading(true);
    try {
      await respondToFeedback({
        feedbackId: feedbackId as any,
        response: response.trim(),
        respondedBy: 'admin',
        isResolved: true
      });

      toast.success('Response sent successfully');
      setResponse('');
      setResponseOpen(false);
      setSelectedFeedback(null);
      setRespondingId(null);
    } catch (error) {
      console.error('Error responding to feedback:', error);
      toast.error('Failed to send response');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (feedbackId: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      await deleteFeedback({ feedbackId: feedbackId as any });
      toast.success('Feedback deleted');
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug':
        return <AlertCircle className='h-4 w-4' />;
      case 'feature':
        return <MessageSquare className='h-4 w-4' />;
      case 'improvement':
        return <CheckCircle2 className='h-4 w-4' />;
      default:
        return <MessageSquare className='h-4 w-4' />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bug':
        return 'destructive';
      case 'feature':
        return 'default';
      case 'improvement':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating);
  };

  if (!feedbackList || !stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Feedback
            </CardTitle>
            <MessageSquare className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
            <p className='text-xs text-muted-foreground'>
              All feedback entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Unread</CardTitle>
            <AlertCircle className='h-4 w-4 text-destructive' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-destructive'>
              {stats.unread}
            </div>
            <p className='text-xs text-muted-foreground'>Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pending</CardTitle>
            <Clock className='h-4 w-4 text-yellow-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-600'>
              {stats.pending}
            </div>
            <p className='text-xs text-muted-foreground'>Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Avg Rating</CardTitle>
            <Star className='h-4 w-4 text-yellow-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.averageRating.toFixed(1)}
            </div>
            <p className='text-xs text-muted-foreground'>out of 5</p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle>User Feedback</CardTitle>
          <CardDescription>
            Manage and respond to user feedback and feature requests
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Tabs for filtering */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList>
              <TabsTrigger value='unread'>Unread ({stats.unread})</TabsTrigger>
              <TabsTrigger value='pending'>
                Pending ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value='resolved'>
                Resolved ({stats.resolved})
              </TabsTrigger>
              <TabsTrigger value='all'>All ({stats.total})</TabsTrigger>
            </TabsList>

            {['all', 'unread', 'pending', 'resolved'].map((filterValue) => (
              <TabsContent
                key={filterValue}
                value={filterValue}
                className='space-y-4'
              >
                {feedbackList && feedbackList.length > 0 ? (
                  feedbackList.map((feedback) => (
                    <Card
                      key={feedback._id}
                      className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                        !feedback.isRead ? 'bg-blue-50 dark:bg-blue-950' : ''
                      }`}
                      onClick={() => {
                        setSelectedFeedback(feedback);
                        if (!feedback.isRead) {
                          markAsRead({ feedbackId: feedback._id });
                        }
                      }}
                    >
                      <CardContent className='pt-6'>
                        <div className='space-y-3'>
                          {/* Header row */}
                          <div className='flex items-start justify-between gap-4'>
                            <div className='flex-1 space-y-1'>
                              <div className='flex items-center gap-2'>
                                <h3 className='font-semibold'>
                                  {feedback.title}
                                </h3>
                                {!feedback.isRead && (
                                  <Badge variant='destructive'>New</Badge>
                                )}
                              </div>
                              <p className='text-sm text-muted-foreground'>
                                {feedback.email || 'Anonymous'}
                              </p>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Badge
                                variant={
                                  getCategoryColor(feedback.category) as any
                                }
                              >
                                {getCategoryIcon(feedback.category)}
                                <span className='ml-1 capitalize'>
                                  {feedback.category}
                                </span>
                              </Badge>
                            </div>
                          </div>

                          {/* Message preview */}
                          <p className='text-sm text-foreground'>
                            {feedback.message.length > 100
                              ? `${feedback.message.substring(0, 100)}...`
                              : feedback.message}
                          </p>

                          {/* Footer row */}
                          <div className='flex items-center justify-between pt-2'>
                            <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                              <span>{getRatingStars(feedback.rating)}</span>
                              <span>
                                {format(
                                  new Date(feedback.createdAt),
                                  'MMM d, yyyy'
                                )}
                              </span>
                              {feedback.isResolved && (
                                <Badge variant='outline' className='text-xs'>
                                  ✓ Resolved
                                </Badge>
                              )}
                            </div>
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(feedback._id);
                              }}
                            >
                              <Trash2 className='h-4 w-4 text-muted-foreground' />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className='rounded-lg border border-dashed p-8 text-center'>
                    <MessageSquare className='mx-auto h-12 w-12 text-muted-foreground/20' />
                    <p className='mt-2 text-sm text-muted-foreground'>
                      No feedback in this category
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Feedback Detail Dialog */}
      <Dialog
        open={!!selectedFeedback}
        onOpenChange={() => setSelectedFeedback(null)}
      >
        <DialogContent className='max-w-2xl'>
          {selectedFeedback && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedFeedback.title}</DialogTitle>
                <DialogDescription>
                  From: {selectedFeedback.email || 'Anonymous'} •{' '}
                  {format(new Date(selectedFeedback.createdAt), 'PPpp')}
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4'>
                {/* Metadata */}
                <div className='flex flex-wrap gap-2'>
                  <Badge
                    variant={getCategoryColor(selectedFeedback.category) as any}
                  >
                    {getCategoryIcon(selectedFeedback.category)}
                    <span className='ml-1 capitalize'>
                      {selectedFeedback.category}
                    </span>
                  </Badge>
                  <Badge variant='outline'>
                    {getRatingStars(selectedFeedback.rating)}
                  </Badge>
                  {!selectedFeedback.isRead && (
                    <Badge variant='destructive'>Unread</Badge>
                  )}
                  {selectedFeedback.isResolved && (
                    <Badge variant='outline'>✓ Resolved</Badge>
                  )}
                </div>

                <Separator />

                {/* Message */}
                <div>
                  <h4 className='mb-2 text-sm font-medium'>Feedback Message</h4>
                  <p className='whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm'>
                    {selectedFeedback.message}
                  </p>
                </div>

                {/* Attachment Image */}
                {selectedFeedback.attachmentUrl && (
                  <div>
                    <h4 className='mb-2 text-sm font-medium'>📎 Attachment</h4>
                    <div className='space-y-2'>
                      <img
                        src={selectedFeedback.attachmentUrl}
                        alt='Feedback attachment'
                        className='max-h-96 w-full rounded-lg border object-contain'
                      />
                      <a
                        href={selectedFeedback.attachmentUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex text-xs text-primary hover:underline'
                      >
                        Open full size image ↗
                      </a>
                    </div>
                  </div>
                )}

                {/* Response or form */}
                {selectedFeedback.response ? (
                  <div>
                    <h4 className='mb-2 text-sm font-medium'>Your Response</h4>
                    <div className='rounded-lg border bg-green-50 p-4 dark:bg-green-950'>
                      <p className='text-sm'>{selectedFeedback.response}</p>
                      <p className='mt-2 text-xs text-muted-foreground'>
                        Responded on{' '}
                        {format(new Date(selectedFeedback.respondedAt), 'PPp')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    <h4 className='text-sm font-medium'>Send Response</h4>
                    <Textarea
                      placeholder='Write your response here...'
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      disabled={loading}
                      rows={4}
                      className='resize-none'
                    />
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='outline'
                        onClick={() => {
                          setSelectedFeedback(null);
                          setResponse('');
                        }}
                        disabled={loading}
                      >
                        Close
                      </Button>
                      <Button
                        onClick={() => {
                          setRespondingId(selectedFeedback._id);
                          handleRespond(selectedFeedback._id);
                        }}
                        disabled={loading}
                      >
                        {loading ? 'Sending...' : 'Send Response'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
