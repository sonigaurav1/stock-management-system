'use client';

import { useState } from 'react';
import { FeedbackForm } from '@/features/admin/components/FeedbackForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, ThumbsUp, Zap, Award } from 'lucide-react';

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-muted/20 py-12'>
      <div className='container mx-auto max-w-2xl px-4'>
        {/* Header */}
        <div className='mb-12 text-center'>
          <div className='mb-4 flex justify-center'>
            <div className='rounded-full bg-primary/10 p-4'>
              <MessageSquare className='h-8 w-8 text-primary' />
            </div>
          </div>
          <h1 className='text-4xl font-bold tracking-tight'>
            We Value Your Feedback
          </h1>
          <p className='mt-2 text-lg text-muted-foreground'>
            Help us build the perfect inventory management solution for your
            business
          </p>
        </div>

        {/* Benefits */}
        <div className='mb-12 grid gap-4 sm:grid-cols-3'>
          <Card>
            <CardContent className='flex flex-col items-center gap-3 pt-6 text-center'>
              <ThumbsUp className='h-6 w-6 text-green-500' />
              <h3 className='font-semibold'>Your Voice Matters</h3>
              <p className='text-xs text-muted-foreground'>
                Every suggestion helps us improve
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='flex flex-col items-center gap-3 pt-6 text-center'>
              <Zap className='h-6 w-6 text-blue-500' />
              <h3 className='font-semibold'>Direct Impact</h3>
              <p className='text-xs text-muted-foreground'>
                Features are prioritized by user feedback
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='flex flex-col items-center gap-3 pt-6 text-center'>
              <Award className='h-6 w-6 text-amber-500' />
              <h3 className='font-semibold'>Quick Response</h3>
              <p className='text-xs text-muted-foreground'>
                We review all feedback actively
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Form Card */}
        <Card className='border-2 border-primary/20'>
          <CardHeader>
            <CardTitle>Share Your Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {submitted ? (
                <div className='rounded-lg bg-green-50 p-8 text-center dark:bg-green-950/30'>
                  <div className='text-4xl'>✅</div>
                  <h3 className='mt-4 text-lg font-semibold text-green-900 dark:text-green-300'>
                    Thank You!
                  </h3>
                  <p className='mt-2 text-sm text-green-800 dark:text-green-400'>
                    Your feedback has been received. Our team will review it and
                    get back to you soon.
                  </p>
                </div>
              ) : (
                <FeedbackForm onSubmitSuccess={() => setSubmitted(true)} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className='mt-12'>
          <h2 className='mb-6 text-center text-2xl font-bold'>
            Feedback Guidelines
          </h2>
          <div className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>
                  🎯 What Should I Share?
                </CardTitle>
              </CardHeader>
              <CardContent className='text-sm text-muted-foreground'>
                Share anything about your experience:
                <ul className='mt-2 list-inside list-disc space-y-1'>
                  <li>Features you love or want improved</li>
                  <li>Bugs or issues you've encountered</li>
                  <li>Workflow suggestions</li>
                  <li>Integration requests</li>
                  <li>Anything else on your mind</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-base'>
                  📸 Why Add Screenshots?
                </CardTitle>
              </CardHeader>
              <CardContent className='text-sm text-muted-foreground'>
                Screenshots help us understand your feedback better. They're
                especially useful for bug reports or feature requests where
                visual context matters.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-base'>⏱️ Response Time</CardTitle>
              </CardHeader>
              <CardContent className='text-sm text-muted-foreground'>
                Our team reviews all feedback actively. You can track your
                feedback status in the admin dashboard, and we'll notify you
                when there are updates.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
