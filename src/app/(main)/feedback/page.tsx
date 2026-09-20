'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import Link from 'next/link';
import { FeedbackForm } from '@/features/admin/components/FeedbackForm';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Sparkles,
  Zap,
  Award,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Star,
  Clock,
  Paperclip,
  ExternalLink,
  MessageCircle,
  Inbox,
  Send
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('submit');

  // Query user's submitted feedback from Convex DB
  const userFeedbackList = useQuery(api.feedback.getFeedback, {});

  const respondedCount =
    userFeedbackList?.filter((f) => f.response || f.isResolved).length || 0;

  return (
    <PageContainer scrollable>
      <div className='container mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-6'>
        {/* Header Hero Section */}
        <div className='relative overflow-hidden rounded-xl border border-border bg-gradient-to-r from-card via-background to-card p-8 text-foreground shadow-card'>
          <div className='pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl' />

          <div className='flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='max-w-2xl space-y-2'>
              <div className='flex items-center gap-2'>
                <div className='rounded-lg border border-primary/20 bg-primary/10 p-2 text-primary'>
                  <MessageSquare className='h-5 w-5' />
                </div>
                <Badge
                  variant='outline'
                  className='border-primary/20 bg-primary/5 font-mono text-xs text-primary'
                >
                  USER FEEDBACK PORTAL
                </Badge>
              </div>
              <h1 className='text-3xl font-bold tracking-tight text-foreground'>
                User Feedback & Developer Responses
              </h1>
              <p className='text-sm leading-relaxed text-muted-foreground'>
                Share feature requests, report issues, and track live developer
                responses to your feedback.
              </p>
            </div>

            <div className='flex items-center gap-3 pt-2 md:pt-0'>
              <Link href='/admin'>
                <Button
                  variant='outline'
                  size='sm'
                  className='gap-2 border-border text-xs'
                >
                  <ShieldAlert className='h-3.5 w-3.5 text-primary' />
                  Admin Console
                  <ArrowRight className='h-3 w-3' />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Highlight Stats Cards */}
        <div className='grid gap-4 md:grid-cols-3'>
          <Card className='border-border bg-card/60 shadow-sm'>
            <CardContent className='flex items-start gap-3 pt-6'>
              <div className='flex-shrink-0 rounded-lg bg-emerald-500/10 p-2.5 text-emerald-500'>
                <CheckCircle2 className='h-5 w-5' />
              </div>
              <div>
                <h3 className='text-sm font-semibold text-foreground'>
                  Direct Impact
                </h3>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  Submissions route directly to our developer team.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className='border-border bg-card/60 shadow-sm'>
            <CardContent className='flex items-start gap-3 pt-6'>
              <div className='flex-shrink-0 rounded-lg bg-blue-500/10 p-2.5 text-blue-500'>
                <Zap className='h-5 w-5' />
              </div>
              <div>
                <h3 className='text-sm font-semibold text-foreground'>
                  Developer Responses
                </h3>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  Developers reply directly to your questions & issues.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className='border-border bg-card/60 shadow-sm'>
            <CardContent className='flex items-start gap-3 pt-6'>
              <div className='flex-shrink-0 rounded-lg bg-amber-500/10 p-2.5 text-amber-500'>
                <Award className='h-5 w-5' />
              </div>
              <div>
                <h3 className='text-sm font-semibold text-foreground'>
                  Prioritized Features
                </h3>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  Highly rated feedback is added to production releases.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs: Submit Feedback vs My Submissions */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-6'
        >
          <TabsList className='grid w-full max-w-md grid-cols-2 rounded-lg bg-muted p-1'>
            <TabsTrigger
              value='submit'
              className='flex items-center gap-2 text-xs font-medium md:text-sm'
            >
              <Send className='h-4 w-4 text-primary' />
              <span>Submit Feedback</span>
            </TabsTrigger>

            <TabsTrigger
              value='history'
              className='flex items-center gap-2 text-xs font-medium md:text-sm'
            >
              <MessageCircle className='h-4 w-4 text-emerald-500' />
              <span>My Submissions & Replies</span>
              {respondedCount > 0 && (
                <Badge className='ml-1.5 h-5 bg-emerald-500 px-1.5 text-[10px] font-bold text-white'>
                  {respondedCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Submit Form */}
          <TabsContent
            value='submit'
            className='space-y-6 focus-visible:outline-none'
          >
            <div className='grid gap-8 lg:grid-cols-12'>
              {/* Form Card (Left Column) */}
              <div className='lg:col-span-8'>
                <Card className='border-border bg-card text-card-foreground shadow-card'>
                  <CardHeader className='border-b border-border/60 pb-4'>
                    <CardTitle className='flex items-center gap-2 text-lg font-bold'>
                      <Sparkles className='h-5 w-5 text-primary' />
                      Submit New Feedback
                    </CardTitle>
                    <CardDescription className='text-xs text-muted-foreground'>
                      Fill out the form below. Your submission will be recorded
                      in our system.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='pt-6'>
                    {submitted ? (
                      <div className='space-y-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center dark:bg-emerald-950/30'>
                        <div className='inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500'>
                          <CheckCircle2 className='h-8 w-8' />
                        </div>
                        <div className='space-y-1'>
                          <h3 className='text-xl font-bold text-foreground'>
                            Feedback Submitted Successfully!
                          </h3>
                          <p className='mx-auto max-w-md text-sm text-muted-foreground'>
                            Thank you for sharing! Your feedback is recorded and
                            visible under{' '}
                            <strong>My Submissions & Replies</strong>.
                          </p>
                        </div>

                        <div className='flex flex-wrap justify-center gap-3 pt-4'>
                          <Button
                            onClick={() => setSubmitted(false)}
                            className='bg-primary text-primary-foreground hover:bg-primary/90'
                          >
                            Submit Another Feedback
                          </Button>
                          <Button
                            variant='outline'
                            onClick={() => setActiveTab('history')}
                            className='border-border'
                          >
                            View Developer Responses
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <FeedbackForm
                        inline={true}
                        onSubmitSuccess={() => {
                          setSubmitted(true);
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Guidelines Sidebar (Right Column) */}
              <div className='space-y-6 lg:col-span-4'>
                <Card className='border-border bg-card text-card-foreground shadow-sm'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
                      <HelpCircle className='h-4 w-4 text-primary' />
                      Submission Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4 text-xs text-muted-foreground'>
                    <div className='space-y-1.5'>
                      <h4 className='text-xs font-semibold text-foreground'>
                        🎯 Clear Title & Context
                      </h4>
                      <p>
                        Specify the feature or page affected to help developers
                        address your query faster.
                      </p>
                    </div>
                    <div className='space-y-1.5'>
                      <h4 className='text-xs font-semibold text-foreground'>
                        📎 Screenshots
                      </h4>
                      <p>
                        Screenshots are automatically rendered in full
                        resolution on the developer admin console.
                      </p>
                    </div>
                    <div className='space-y-1.5'>
                      <h4 className='text-xs font-semibold text-foreground'>
                        💬 View Responses
                      </h4>
                      <p>
                        Switch to the <strong>My Submissions & Replies</strong>{' '}
                        tab anytime to read replies from developers.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: My Submissions & Developer Responses */}
          <TabsContent
            value='history'
            className='space-y-6 focus-visible:outline-none'
          >
            <Card className='border-border bg-card text-card-foreground shadow-card'>
              <CardHeader className='border-b border-border/60 pb-4'>
                <CardTitle className='flex items-center justify-between text-lg font-bold'>
                  <span className='flex items-center gap-2'>
                    <MessageCircle className='h-5 w-5 text-emerald-500' />
                    My Submitted Feedback & Developer Responses
                  </span>
                  <Badge variant='outline' className='font-mono text-xs'>
                    {userFeedbackList?.length || 0} Submissions
                  </Badge>
                </CardTitle>
                <CardDescription className='text-xs text-muted-foreground'>
                  Track your submitted issues and read direct replies from the
                  developer team.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6 pt-6'>
                {userFeedbackList && userFeedbackList.length > 0 ? (
                  <div className='space-y-4'>
                    {userFeedbackList.map((item) => (
                      <Card
                        key={item._id}
                        className='border border-border/80 bg-background/50 shadow-sm'
                      >
                        <CardContent className='space-y-4 pt-6'>
                          {/* Item Header */}
                          <div className='flex flex-wrap items-start justify-between gap-3'>
                            <div className='min-w-0 flex-1 space-y-1'>
                              <div className='flex flex-wrap items-center gap-2'>
                                <Badge
                                  variant='outline'
                                  className='border-primary/20 bg-primary/10 text-xs capitalize text-primary'
                                >
                                  {item.category.replace('-', ' ')}
                                </Badge>

                                <div className='flex items-center text-xs font-semibold text-amber-400'>
                                  {item.rating}{' '}
                                  <Star className='ml-0.5 h-3.5 w-3.5 fill-current' />
                                </div>

                                <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                                  <Clock className='h-3 w-3' />
                                  {new Date(item.createdAt).toLocaleString()}
                                </span>
                              </div>

                              <h3 className='pt-1 text-base font-bold text-foreground'>
                                {item.title || 'Feedback Entry'}
                              </h3>
                            </div>

                            <Badge
                              className={
                                item.isResolved || item.response
                                  ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                  : 'border-amber-500/30 bg-amber-500/20 text-amber-600 dark:text-amber-400'
                              }
                            >
                              {item.isResolved || item.response
                                ? 'Responded / Resolved'
                                : 'Pending Developer Review'}
                            </Badge>
                          </div>

                          {/* Message Body */}
                          <div className='whitespace-pre-wrap rounded-lg border border-border/60 bg-card p-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200'>
                            {item.message}
                          </div>

                          {/* Attachment Screenshot Preview if available */}
                          {item.attachmentUrl && (
                            <div className='space-y-1.5 rounded-lg border border-border/60 bg-slate-950 p-2'>
                              <p className='flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
                                <Paperclip className='h-3 w-3 text-blue-400' />{' '}
                                Screenshot Attachment
                              </p>
                              <div className='flex justify-center'>
                                <a
                                  href={item.attachmentUrl}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='group'
                                >
                                  <img
                                    src={item.attachmentUrl}
                                    alt='Attachment'
                                    className='max-h-48 rounded border border-slate-800 object-contain group-hover:opacity-90'
                                  />
                                  <span className='block pt-1 text-center text-[10px] text-blue-400 group-hover:underline'>
                                    Open Image Fullscreen{' '}
                                    <ExternalLink className='inline h-2.5 w-2.5' />
                                  </span>
                                </a>
                              </div>
                            </div>
                          )}

                          {/* DEVELOPER RESPONSE DISPLAY BOX */}
                          {item.response ? (
                            <div className='space-y-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 dark:bg-emerald-950/30'>
                              <div className='flex items-center justify-between text-sm font-semibold text-emerald-600 dark:text-emerald-400'>
                                <span className='flex items-center gap-2'>
                                  <MessageSquare className='h-4 w-4' />
                                  Developer Response from{' '}
                                  {item.respondedBy || 'Developer Admin'}
                                </span>
                                <span className='text-xs font-normal text-muted-foreground'>
                                  {item.respondedAt
                                    ? new Date(
                                        Number(item.respondedAt)
                                      ).toLocaleString()
                                    : 'Recently'}
                                </span>
                              </div>
                              <p className='whitespace-pre-wrap pt-1 text-sm font-medium leading-relaxed text-foreground'>
                                {item.response}
                              </p>
                            </div>
                          ) : (
                            <div className='flex items-center gap-2 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground'>
                              <Clock className='h-4 w-4 animate-pulse text-amber-500' />
                              <span>
                                Awaiting response from developers. Updates will
                                appear here automatically.
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className='space-y-3 py-12 text-center'>
                    <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground'>
                      <Inbox className='h-6 w-6' />
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      No feedback submissions found. Submit feedback to track
                      developer responses here.
                    </p>
                    <Button
                      onClick={() => setActiveTab('submit')}
                      variant='outline'
                      size='sm'
                    >
                      Submit Your First Feedback
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
