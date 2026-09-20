'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Id } from '@/../convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Search,
  MessageSquare,
  Send,
  CheckCircle2,
  Star,
  Clock,
  Paperclip,
  ExternalLink
} from 'lucide-react';
import { AvatarFallback, Avatar, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export interface GlobalFeedback {
  id: string;
  _id?: string;
  companyName?: string;
  userName: string;
  userEmail: string;
  rating: number;
  category: string;
  title?: string;
  message: string;
  attachmentUrl?: string;
  status: 'new' | 'reviewed' | 'addressed' | 'rejected' | 'pending';
  isResolved?: boolean;
  isRead?: boolean;
  createdAt: string | number;
  response?: string;
  respondedAt?: string | number;
  respondedBy?: string;
}

const mockGlobalFeedback: GlobalFeedback[] = [
  {
    id: '1',
    companyName: 'Acme Corporation',
    userName: 'John Smith',
    userEmail: 'john@acme.com',
    rating: 5,
    category: 'feature-request',
    title: 'Mobile app support',
    message:
      'We would love to see mobile app support for inventory management. It would help our field teams tremendously.',
    status: 'reviewed',
    isResolved: false,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    response:
      'Thank you for the suggestion! Mobile app is in our roadmap for Q3 2024.',
    respondedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    respondedBy: 'Sarah Johnson'
  },
  {
    id: '2',
    companyName: 'TechStart Inc',
    userName: 'Emma Davis',
    userEmail: 'emma@techstart.com',
    rating: 4,
    category: 'bug-report',
    title: 'CSV export issue',
    message:
      'Export to CSV sometimes truncates long text fields. Needs fixing.',
    status: 'addressed',
    isResolved: true,
    createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    response:
      'Fixed in version 2.5.1. Please update to get the latest version.',
    respondedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    respondedBy: 'Tech Support'
  },
  {
    id: '3',
    companyName: 'Global Solutions Ltd',
    userName: 'Michael Chen',
    userEmail: 'michael@globalsolutions.com',
    rating: 3,
    category: 'general-feedback',
    title: 'Dashboard loading speed',
    message:
      'Dashboard loads slowly when there are many items. Consider pagination.',
    status: 'new',
    isResolved: false,
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000
  },
  {
    id: '4',
    companyName: 'Innovation Labs',
    userName: 'Lisa Anderson',
    userEmail: 'lisa@innolabs.com',
    rating: 5,
    category: 'feature-request',
    title: 'Custom reports options',
    message:
      'The new analytics dashboard is fantastic! Would love to see more custom report options.',
    status: 'reviewed',
    isResolved: false,
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000
  },
  {
    id: '5',
    companyName: 'DataDrive Systems',
    userName: 'Robert Wilson',
    userEmail: 'robert@datadrive.com',
    rating: 2,
    category: 'support',
    title: 'API integration inquiry',
    message:
      'Had issues with API integration. Support team was helpful but response time could be faster.',
    status: 'addressed',
    isResolved: true,
    createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000
  }
];

function getRatingColor(rating: number) {
  if (rating >= 4) return 'text-amber-500 dark:text-amber-400';
  if (rating >= 3) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-500 dark:text-red-400';
}

function getStatusColor(status: string, isResolved?: boolean) {
  if (isResolved || status === 'addressed') {
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  }
  if (status === 'reviewed') {
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
  }
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    'feature-request':
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200',
    bug: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200',
    'bug-report':
      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200',
    improvement:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200',
    'general-feedback':
      'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200',
    support:
      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200'
  };
  return (
    colors[category] ||
    'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  );
}

export function GlobalFeedbackManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] =
    useState<GlobalFeedback | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live Convex Queries
  const convexFeedbackList = useQuery(api.admin.getAllFeedback, {
    search: searchTerm || undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined,
    category: filterCategory !== 'all' ? filterCategory : undefined
  });

  const respondMutation = useMutation(api.admin.adminRespondToFeedback);

  const rawFeedbackList: GlobalFeedback[] =
    convexFeedbackList && convexFeedbackList.length > 0
      ? (convexFeedbackList as unknown as GlobalFeedback[])
      : mockGlobalFeedback;

  const filteredFeedbacks = rawFeedbackList.filter((f) => {
    const matchesSearch =
      (f.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'resolved' && f.isResolved) ||
      (filterStatus === 'pending' && !f.isResolved) ||
      f.status === filterStatus;

    const matchesCategory =
      filterCategory === 'all' || f.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleRespond = async () => {
    if (!selectedFeedback || !responseText.trim()) return;

    setIsSubmitting(true);

    try {
      if (selectedFeedback._id && !selectedFeedback.id.startsWith('1')) {
        // Submit real mutation to Convex backend
        await respondMutation({
          feedbackId: selectedFeedback._id as Id<'feedback'>,
          response: responseText,
          isResolved: true
        });
        toast.success('Response sent and feedback marked as resolved!');
      } else {
        // Fallback for mock items
        selectedFeedback.response = responseText;
        selectedFeedback.respondedBy = 'Developer Admin';
        selectedFeedback.respondedAt = Date.now();
        selectedFeedback.isResolved = true;
        selectedFeedback.status = 'addressed';
        toast.success('Response recorded for demo item!');
      }

      setResponseText('');
      setSelectedFeedback(null);
    } catch (err) {
      console.error('Failed to submit response:', err);
      toast.error('Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    total: rawFeedbackList.length,
    newCount: rawFeedbackList.filter((f) => !f.isResolved && !f.response)
      .length,
    resolvedCount: rawFeedbackList.filter((f) => f.isResolved).length,
    avgRating: (
      rawFeedbackList.reduce((sum, f) => sum + f.rating, 0) /
      Math.max(rawFeedbackList.length, 1)
    ).toFixed(1)
  };

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>{stats.total}</p>
            <p className='text-xs text-muted-foreground'>
              Submissions received
            </p>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
              {stats.newCount}
            </p>
            <p className='text-xs text-muted-foreground'>
              Awaiting admin response
            </p>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Resolved Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
              {stats.resolvedCount}
            </p>
            <p className='text-xs text-muted-foreground'>Completed items</p>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Avg User Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${getRatingColor(parseFloat(stats.avgRating))}`}
            >
              {stats.avgRating}{' '}
              <Star className='inline-block h-5 w-5 fill-current align-text-top' />
            </p>
            <p className='text-xs text-muted-foreground'>Out of 5.0 stars</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className='border-0 shadow-sm'>
        <CardHeader>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <CardTitle>User Feedback Submissions</CardTitle>
            <div className='flex flex-wrap gap-2'>
              <div className='relative flex-1 sm:flex-none'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search message, user, email...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-9 sm:w-64'
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className='w-36'>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='resolved'>Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className='w-40'>
                  <SelectValue placeholder='Category' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Categories</SelectItem>
                  <SelectItem value='bug'>Bugs</SelectItem>
                  <SelectItem value='feature-request'>
                    Feature Request
                  </SelectItem>
                  <SelectItem value='improvement'>Improvement</SelectItem>
                  <SelectItem value='general-feedback'>General</SelectItem>
                  <SelectItem value='support'>Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Feedback Card List */}
      <div className='space-y-3'>
        {filteredFeedbacks.map((feedback) => (
          <Dialog key={feedback.id || feedback._id}>
            <DialogTrigger asChild>
              <Card
                className='cursor-pointer border-0 shadow-sm transition-all hover:shadow-md'
                onClick={() => setSelectedFeedback(feedback)}
              >
                <CardContent className='pt-6'>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex flex-1 gap-4'>
                      <Avatar className='h-10 w-10 flex-shrink-0'>
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${feedback.userEmail}`}
                        />
                        <AvatarFallback className='bg-primary/10 text-primary'>
                          {feedback.userName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className='min-w-0 flex-1 space-y-1.5'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <p className='font-semibold'>{feedback.userName}</p>
                          <span className='text-xs text-muted-foreground'>
                            • {feedback.userEmail}
                          </span>
                          <div
                            className={`flex items-center ${getRatingColor(feedback.rating)} text-sm font-medium`}
                          >
                            {feedback.rating}{' '}
                            <Star className='ml-0.5 h-3.5 w-3.5 fill-current' />
                          </div>
                        </div>

                        {feedback.title && (
                          <h4 className='text-sm font-semibold text-foreground'>
                            {feedback.title}
                          </h4>
                        )}

                        <p className='line-clamp-2 text-sm text-slate-600 dark:text-slate-300'>
                          {feedback.message}
                        </p>

                        <div className='flex flex-wrap items-center gap-2 pt-1'>
                          <Badge
                            variant='outline'
                            className={getCategoryColor(feedback.category)}
                          >
                            {feedback.category.replace('-', ' ')}
                          </Badge>

                          <Badge
                            className={getStatusColor(
                              feedback.status,
                              feedback.isResolved
                            )}
                          >
                            {feedback.isResolved ? 'Resolved' : 'Pending'}
                          </Badge>

                          {feedback.attachmentUrl && (
                            <Badge
                              variant='outline'
                              className='border-blue-500/20 bg-blue-500/10 text-xs text-blue-600 dark:text-blue-400'
                            >
                              <Paperclip className='mr-1 h-3 w-3' /> Image
                              Attached
                            </Badge>
                          )}

                          <span className='ml-auto flex items-center text-xs text-muted-foreground'>
                            <Clock className='mr-1 h-3 w-3' />
                            {typeof feedback.createdAt === 'number'
                              ? new Date(
                                  feedback.createdAt
                                ).toLocaleDateString()
                              : feedback.createdAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    <MessageSquare className='h-5 w-5 flex-shrink-0 text-muted-foreground' />
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>

            {selectedFeedback &&
              (selectedFeedback.id === feedback.id ||
                selectedFeedback._id === feedback._id) && (
                <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
                  <DialogHeader>
                    <DialogTitle className='flex items-center justify-between pr-4'>
                      <span>Feedback Details</span>
                      <Badge
                        className={getStatusColor(
                          selectedFeedback.status,
                          selectedFeedback.isResolved
                        )}
                      >
                        {selectedFeedback.isResolved
                          ? 'Resolved'
                          : 'Pending Response'}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription>
                      Submitted by {selectedFeedback.userName} (
                      {selectedFeedback.userEmail})
                    </DialogDescription>
                  </DialogHeader>

                  <div className='space-y-4 pt-2'>
                    {/* Feedback Details Box */}
                    <div className='space-y-3 rounded-lg border bg-muted/30 p-4 text-sm'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant='outline'
                            className={getCategoryColor(
                              selectedFeedback.category
                            )}
                          >
                            {selectedFeedback.category.replace('-', ' ')}
                          </Badge>
                          <span className='text-xs text-muted-foreground'>
                            {typeof selectedFeedback.createdAt === 'number'
                              ? new Date(
                                  selectedFeedback.createdAt
                                ).toLocaleString()
                              : selectedFeedback.createdAt}
                          </span>
                        </div>

                        <div
                          className={`flex items-center ${getRatingColor(selectedFeedback.rating)} text-base font-semibold`}
                        >
                          {selectedFeedback.rating} / 5{' '}
                          <Star className='ml-1 h-4 w-4 fill-current' />
                        </div>
                      </div>

                      {selectedFeedback.title && (
                        <h3 className='text-base font-bold text-foreground'>
                          {selectedFeedback.title}
                        </h3>
                      )}

                      <p className='whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-200'>
                        {selectedFeedback.message}
                      </p>

                      {/* Image Attachment Rendering */}
                      {selectedFeedback.attachmentUrl && (
                        <div className='space-y-1.5 border-t border-border/60 pt-2'>
                          <p className='flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                            <Paperclip className='h-3.5 w-3.5 text-blue-500' />{' '}
                            Attached Image / Screenshot
                          </p>
                          <div className='overflow-hidden rounded-lg border bg-slate-950 p-2 text-center'>
                            <a
                              href={selectedFeedback.attachmentUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='group relative inline-block'
                            >
                              <img
                                src={selectedFeedback.attachmentUrl}
                                alt='User Attachment'
                                className='max-h-72 w-full rounded object-contain transition-opacity group-hover:opacity-90'
                              />
                              <span className='mt-1 inline-flex items-center gap-1 text-[11px] text-blue-400 group-hover:underline'>
                                Open Image Fullscreen{' '}
                                <ExternalLink className='h-3 w-3' />
                              </span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Previous Response Box */}
                    {selectedFeedback.response && (
                      <div className='space-y-2 rounded-lg border border-green-200 bg-green-50/80 p-4 dark:border-green-900/50 dark:bg-green-950/30'>
                        <div className='flex items-center justify-between text-sm font-semibold text-green-900 dark:text-green-300'>
                          <span className='flex items-center gap-1.5'>
                            <CheckCircle2 className='h-4 w-4 text-green-600 dark:text-green-400' />
                            Response from{' '}
                            {selectedFeedback.respondedBy || 'Developer Admin'}
                          </span>
                          <span className='text-xs font-normal text-muted-foreground'>
                            {selectedFeedback.respondedAt
                              ? new Date(
                                  Number(selectedFeedback.respondedAt)
                                ).toLocaleString()
                              : 'Recently'}
                          </span>
                        </div>
                        <p className='whitespace-pre-wrap text-sm text-green-950 dark:text-green-200'>
                          {selectedFeedback.response}
                        </p>
                      </div>
                    )}

                    {/* Add / Update Response Form */}
                    <div className='space-y-2 pt-2'>
                      <label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                        {selectedFeedback.response
                          ? 'Update Developer Response'
                          : 'Reply to User'}
                      </label>
                      <Textarea
                        placeholder='Type developer resolution message or response...'
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        rows={4}
                        className='text-sm'
                      />

                      <div className='flex justify-end gap-2 pt-2'>
                        <Button
                          onClick={handleRespond}
                          disabled={!responseText.trim() || isSubmitting}
                          className='w-full sm:w-auto'
                        >
                          <Send className='mr-2 h-4 w-4' />
                          {isSubmitting
                            ? 'Sending...'
                            : 'Send Response & Resolve'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              )}
          </Dialog>
        ))}
      </div>

      {filteredFeedbacks.length === 0 && (
        <Card className='border-0 shadow-sm'>
          <CardContent className='flex h-32 items-center justify-center'>
            <p className='text-muted-foreground'>
              No feedback found matching the current search criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
