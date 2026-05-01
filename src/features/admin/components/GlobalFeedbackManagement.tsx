'use client';

import { useState } from 'react';
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
import { Search, MessageSquare, Send, Filter } from 'lucide-react';
import { AvatarFallback, Avatar, AvatarImage } from '@/components/ui/avatar';

interface GlobalFeedback {
  id: string;
  companyName: string;
  userName: string;
  userEmail: string;
  rating: number;
  category: string;
  message: string;
  status: 'new' | 'reviewed' | 'addressed' | 'rejected';
  createdAt: string;
  response?: string;
  respondedAt?: string;
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
    message:
      'We would love to see mobile app support for inventory management. It would help our field teams tremendously.',
    status: 'reviewed',
    createdAt: '2024-04-10 10:30',
    response:
      'Thank you for the suggestion! Mobile app is in our roadmap for Q3 2024.',
    respondedAt: '2024-04-10 14:20',
    respondedBy: 'Sarah Johnson'
  },
  {
    id: '2',
    companyName: 'TechStart Inc',
    userName: 'Emma Davis',
    userEmail: 'emma@techstart.com',
    rating: 4,
    category: 'bug-report',
    message:
      'Export to CSV sometimes truncates long text fields. Needs fixing.',
    status: 'addressed',
    createdAt: '2024-04-09 15:45',
    response:
      'Fixed in version 2.5.1. Please update to get the latest version.',
    respondedAt: '2024-04-10 09:15',
    respondedBy: 'Tech Support'
  },
  {
    id: '3',
    companyName: 'Global Solutions Ltd',
    userName: 'Michael Chen',
    userEmail: 'michael@globalsolutions.com',
    rating: 3,
    category: 'general-feedback',
    message:
      'Dashboard loads slowly when there are many items. Consider pagination.',
    status: 'new',
    createdAt: '2024-04-10 16:20'
  },
  {
    id: '4',
    companyName: 'Innovation Labs',
    userName: 'Lisa Anderson',
    userEmail: 'lisa@innolabs.com',
    rating: 5,
    category: 'feature-request',
    message:
      'The new analytics dashboard is fantastic! Would love to see more custom report options.',
    status: 'reviewed',
    createdAt: '2024-04-08 11:00'
  },
  {
    id: '5',
    companyName: 'DataDrive Systems',
    userName: 'Robert Wilson',
    userEmail: 'robert@datadrive.com',
    rating: 2,
    category: 'support',
    message:
      'Had issues with API integration. Support team was helpful but response time could be faster.',
    status: 'addressed',
    createdAt: '2024-04-07 09:30'
  }
];

function getRatingColor(rating: number) {
  if (rating >= 4) return 'text-green-600 dark:text-green-400';
  if (rating >= 3) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

function getStatusColor(status: GlobalFeedback['status']) {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'reviewed':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'addressed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return '';
  }
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    'feature-request':
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    'bug-report':
      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    'general-feedback':
      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    support:
      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
  };
  return colors[category] || colors['general-feedback'];
}

export function GlobalFeedbackManagement() {
  const [feedbacks, setFeedbacks] =
    useState<GlobalFeedback[]>(mockGlobalFeedback);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] =
    useState<GlobalFeedback | null>(null);
  const [response, setResponse] = useState('');

  const filteredFeedbacks = feedbacks.filter((f) => {
    const matchesSearch =
      f.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || f.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleRespond = () => {
    if (selectedFeedback && response.trim()) {
      setFeedbacks(
        feedbacks.map((f) =>
          f.id === selectedFeedback.id
            ? {
                ...f,
                status: 'reviewed' as const,
                response,
                respondedAt: new Date().toLocaleString(),
                respondedBy: 'Admin'
              }
            : f
        )
      );
      setResponse('');
      setSelectedFeedback(null);
    }
  };

  const stats = {
    total: feedbacks.length,
    new: feedbacks.filter((f) => f.status === 'new').length,
    reviewed: feedbacks.filter((f) => f.status === 'reviewed').length,
    addressed: feedbacks.filter((f) => f.status === 'addressed').length,
    avgRating: (
      feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
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
            <p className='text-xs text-muted-foreground'>All time</p>
          </CardContent>
        </Card>
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              New
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold text-blue-600'>{stats.new}</p>
            <p className='text-xs text-muted-foreground'>Needs review</p>
          </CardContent>
        </Card>
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Reviewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold text-purple-600'>
              {stats.reviewed}
            </p>
            <p className='text-xs text-muted-foreground'>Responded to</p>
          </CardContent>
        </Card>
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${getRatingColor(parseFloat(stats.avgRating))}`}
            >
              {stats.avgRating}⭐
            </p>
            <p className='text-xs text-muted-foreground'>User satisfaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className='border-0 shadow-sm'>
        <CardHeader>
          <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
            <CardTitle>Feedback from All Companies</CardTitle>
            <div className='flex w-full gap-2 sm:w-auto'>
              <div className='relative flex-1 sm:flex-none'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search feedback...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-8 sm:w-64'
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className='w-40'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='new'>New</SelectItem>
                  <SelectItem value='reviewed'>Reviewed</SelectItem>
                  <SelectItem value='addressed'>Addressed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Feedback List */}
      <div className='space-y-3'>
        {filteredFeedbacks.map((feedback) => (
          <Dialog key={feedback.id}>
            <DialogTrigger asChild>
              <Card className='cursor-pointer border-0 shadow-sm transition-all hover:shadow-md'>
                <CardContent className='pt-6'>
                  <div className='space-y-3'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex flex-1 gap-4'>
                        <Avatar className='h-10 w-10 flex-shrink-0'>
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${feedback.userName}`}
                          />
                          <AvatarFallback>
                            {feedback.userName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className='min-w-0 flex-1'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <p className='font-semibold'>{feedback.userName}</p>
                            <span className='text-xs text-muted-foreground'>
                              from {feedback.companyName}
                            </span>
                            <div
                              className={`${getRatingColor(feedback.rating)} text-sm`}
                            >
                              {'⭐'.repeat(feedback.rating)}
                            </div>
                          </div>
                          <p className='text-sm text-muted-foreground'>
                            {feedback.userEmail}
                          </p>
                          <p className='mt-2 line-clamp-2'>
                            {feedback.message}
                          </p>
                          <div className='mt-2 flex flex-wrap gap-2'>
                            <Badge
                              variant='outline'
                              className={getCategoryColor(feedback.category)}
                            >
                              {feedback.category.replace('-', ' ')}
                            </Badge>
                            <Badge className={getStatusColor(feedback.status)}>
                              {feedback.status}
                            </Badge>
                            <span className='text-xs text-muted-foreground'>
                              {feedback.createdAt}
                            </span>
                          </div>
                        </div>
                      </div>
                      <MessageSquare className='h-5 w-5 flex-shrink-0 text-muted-foreground' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>

            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Feedback Details</DialogTitle>
                <DialogDescription>
                  From {selectedFeedback?.userName} (
                  {selectedFeedback?.companyName})
                </DialogDescription>
              </DialogHeader>

              {selectedFeedback && (
                <div className='space-y-4'>
                  {/* Feedback Details */}
                  <div className='space-y-2 border-l-4 border-muted-foreground bg-muted/50 p-3'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='font-semibold'>
                          {selectedFeedback.userName}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          {selectedFeedback.userEmail}
                        </p>
                      </div>
                      <div className={getRatingColor(selectedFeedback.rating)}>
                        {'⭐'.repeat(selectedFeedback.rating)}
                      </div>
                    </div>
                    <p className='text-sm font-medium'>
                      Company: {selectedFeedback.companyName}
                    </p>
                    <div className='flex gap-2'>
                      <Badge
                        className={getCategoryColor(selectedFeedback.category)}
                      >
                        {selectedFeedback.category.replace('-', ' ')}
                      </Badge>
                      <Badge
                        className={getStatusColor(selectedFeedback.status)}
                      >
                        {selectedFeedback.status}
                      </Badge>
                    </div>
                    <p className='mt-2 whitespace-pre-wrap text-sm'>
                      {selectedFeedback.message}
                    </p>
                  </div>

                  {/* Response Section */}
                  {selectedFeedback.response && (
                    <div className='space-y-2 border-l-4 border-green-500 bg-green-50 p-3 dark:bg-green-950/20'>
                      <p className='font-semibold text-green-700 dark:text-green-400'>
                        Response from {selectedFeedback.respondedBy}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {selectedFeedback.respondedAt}
                      </p>
                      <p className='whitespace-pre-wrap text-sm'>
                        {selectedFeedback.response}
                      </p>
                    </div>
                  )}

                  {/* Add Response */}
                  {!selectedFeedback.response && (
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>
                        Add Response
                      </label>
                      <Textarea
                        placeholder='Type your response here...'
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        rows={4}
                      />
                      <Button
                        onClick={handleRespond}
                        disabled={!response.trim()}
                        className='w-full'
                      >
                        <Send className='mr-2 h-4 w-4' />
                        Send Response
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {filteredFeedbacks.length === 0 && (
        <Card className='border-0 shadow-sm'>
          <CardContent className='flex h-32 items-center justify-center'>
            <p className='text-muted-foreground'>No feedback found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
