'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useToast } from '@/hooks/use-toast';
import {
  CreditCard,
  Download,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Zap
} from 'lucide-react';

const BillingSettings = () => {
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState('pro');

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for getting started',
      features: [
        'Basic inventory management',
        '1 location',
        '1-2 users',
        'Basic reports',
        'Email support'
      ],
      current: false
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '₹4,999',
      period: '/month',
      description: 'For growing businesses',
      features: [
        'Multi-user support',
        'Multiple locations',
        'Advanced reports',
        'Low stock alerts',
        'Barcode scanning',
        'Priority support'
      ],
      current: false
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '₹9,999',
      period: '/month',
      description: 'For professional operations',
      features: [
        'Unlimited users',
        'Unlimited locations',
        'Advanced analytics',
        'Integrations',
        'Automation workflows',
        'API access',
        'Dedicated support'
      ],
      current: true,
      badge: 'CURRENT PLAN'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large enterprises',
      features: [
        'Everything in Pro',
        'Custom integrations',
        'SSO / SAML',
        'Advanced security',
        'Dedicated account manager',
        'SLA support'
      ],
      current: false
    }
  ];

  const invoices = [
    {
      id: 'INV-001',
      date: '2025-02-01',
      amount: 9999,
      status: 'Paid',
      period: 'February 2025'
    },
    {
      id: 'INV-002',
      date: '2025-01-01',
      amount: 9999,
      status: 'Paid',
      period: 'January 2025'
    },
    {
      id: 'INV-003',
      date: '2024-12-01',
      amount: 9999,
      status: 'Paid',
      period: 'December 2024'
    }
  ];

  const handleUpgradePlan = (planId: string) => {
    if (planId === currentPlan) {
      toast({
        title: 'Already on this plan',
        description: 'You are already subscribed to this plan'
      });
      return;
    }
    toast({
      title: 'Plan upgrade initiated',
      description: `You will be upgraded to ${plans.find((p) => p.id === planId)?.name} plan`
    });
  };

  return (
    <div className='space-y-6'>
      {/* Current Plan Overview */}
      <Card className='border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-950 dark:to-blue-900'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Professional Plan</CardTitle>
              <CardDescription>
                Active subscription - Renews on March 1, 2025
              </CardDescription>
            </div>
            <Badge className='bg-green-100 text-green-800'>Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div>
              <p className='text-sm text-muted-foreground'>Monthly Cost</p>
              <p className='text-2xl font-bold'>₹9,999</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Users</p>
              <p className='text-2xl font-bold'>Unlimited</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Days Remaining</p>
              <p className='text-2xl font-bold'>14</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div>
        <h3 className='mb-4 text-lg font-semibold'>Choose Your Plan</h3>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all ${
                plan.current
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {plan.badge && (
                <div className='absolute -top-3 left-4'>
                  <Badge className='bg-blue-600'>{plan.badge}</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className='text-lg'>{plan.name}</CardTitle>
                <CardDescription className='text-xs'>
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <p className='text-3xl font-bold'>{plan.price}</p>
                  {plan.period && (
                    <p className='text-sm text-muted-foreground'>
                      {plan.period}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className='flex items-start gap-2'>
                      <CheckCircle2 className='mt-0.5 h-4 w-4 flex-shrink-0 text-green-600' />
                      <span className='text-xs'>{feature}</span>
                    </div>
                  ))}
                </div>

                {!plan.current && (
                  <Button
                    className='w-full'
                    onClick={() => handleUpgradePlan(plan.id)}
                  >
                    {plan.price === 'Free' ? 'Get Started' : 'Upgrade'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <CreditCard className='h-5 w-5' />
            <div>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Manage your billing payment details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between rounded-lg border bg-slate-50 p-4 dark:bg-slate-900'>
            <div className='flex items-center gap-3'>
              <CreditCard className='h-6 w-6' />
              <div>
                <p className='font-medium'>Visa ending in 4242</p>
                <p className='text-sm text-muted-foreground'>Expires 12/26</p>
              </div>
            </div>
            <Button variant='outline' size='sm'>
              Edit
            </Button>
          </div>

          <Button variant='outline' className='w-full'>
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>
            Update your company and billing address
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label>Company Name</Label>
              <Input value='Acme Corporation' readOnly />
            </div>
            <div>
              <Label>Email</Label>
              <Input value='billing@acme.com' />
            </div>
            <div className='md:col-span-2'>
              <Label>Billing Address</Label>
              <Input value='123 Business St, City, State 12345' />
            </div>
            <div>
              <Label>Tax ID / GST</Label>
              <Input placeholder='Enter tax ID' />
            </div>
          </div>
          <Button>Update Billing Information</Button>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              <div>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View and download invoices</CardDescription>
              </div>
            </div>
            <Button variant='outline' size='sm'>
              <Download className='mr-1 h-4 w-4' />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className='flex items-center justify-between rounded border bg-slate-50 p-3 dark:bg-slate-900'
              >
                <div>
                  <p className='text-sm font-medium'>{invoice.period}</p>
                  <p className='text-xs text-muted-foreground'>
                    Invoice {invoice.id}
                  </p>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='text-right'>
                    <p className='text-sm font-medium'>₹{invoice.amount}</p>
                    <Badge variant='outline' className='mt-1'>
                      {invoice.status}
                    </Badge>
                  </div>
                  <Button variant='ghost' size='icon'>
                    <Download className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            <div>
              <CardTitle>Current Usage</CardTitle>
              <CardDescription>
                This billing cycle usage details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {[
            {
              name: 'Users',
              used: 8,
              limit: 'Unlimited',
              percentage: 0
            },
            {
              name: 'Locations',
              used: 3,
              limit: 'Unlimited',
              percentage: 0
            },
            {
              name: 'API Calls',
              used: 45230,
              limit: '500,000',
              percentage: 9
            },
            {
              name: 'Storage',
              used: 2.4,
              limit: '100 GB',
              percentage: 2
            }
          ].map((usage, idx) => (
            <div key={idx}>
              <div className='mb-2 flex items-center justify-between'>
                <p className='text-sm font-medium'>{usage.name}</p>
                <span className='text-sm text-muted-foreground'>
                  {usage.used} / {usage.limit}
                </span>
              </div>
              {usage.percentage > 0 && (
                <div className='h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700'>
                  <div
                    className='h-2 rounded-full bg-blue-500'
                    style={{ width: `${usage.percentage}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Subscription Management */}
      <Card className='border-yellow-200 dark:border-yellow-800'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-yellow-600' />
            <div>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>
                Manage your subscription preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant='outline' className='w-full'>
                Pause Subscription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pause Subscription?</DialogTitle>
                <DialogDescription>
                  Your subscription will be paused for up to 3 months
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-3'>
                <p className='text-sm text-muted-foreground'>
                  You will lose access to your data during the pause period. You
                  can resume at any time.
                </p>
                <div className='flex gap-2'>
                  <Button variant='outline' className='flex-1'>
                    Cancel
                  </Button>
                  <Button variant='destructive' className='flex-1'>
                    Pause Subscription
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant='destructive' className='w-full'>
                Cancel Subscription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Subscription?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. Your data will be retained for
                  30 days.
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-3'>
                <p className='text-sm text-muted-foreground'>
                  We'd love to hear why you're leaving. Please let us know so we
                  can improve.
                </p>
                <div className='flex gap-2'>
                  <Button variant='outline' className='flex-1'>
                    Keep Subscription
                  </Button>
                  <Button variant='destructive' className='flex-1'>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingSettings;
