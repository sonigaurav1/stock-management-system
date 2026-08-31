'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  Box,
  ClipboardList,
  Layers,
  Truck,
  ShoppingCart,
  Kanban,
  FileText,
  BookOpen,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  Lock,
  Zap,
  Users,
  Smartphone,
  TrendingUp,
  Wifi,
  Shield,
  Play,
  ChevronDown,
  Menu,
  X,
  Star,
  CheckCircle2,
  Facebook,
  Linkedin,
  Twitter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { TrialSignupModal } from '@/components/modal/trial-signup-modal';
import { ScheduleDemoModal } from '@/components/modal/schedule-demo-modal';
import { redirect, useRouter } from 'next/navigation';

interface TestimonialData {
  name: string;
  business: string;
  location: string;
  quote: string;
  rating: number;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface AnimatedCounterProps {
  end: number;
  suffix: string;
}

function AnimatedCounter({ end, suffix }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let current = 0;
        const increment = Math.ceil(end / 50);
        const timer = setInterval(() => {
          current += increment;
          if (current >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(current);
          }
        }, 30);
      }
    });

    const element = document.getElementById(`counter-${end}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [end]);

  return (
    <div id={`counter-${end}`} className='text-4xl font-bold text-primary'>
      {count}
      {suffix}
    </div>
  );
}

function FAQAccordion({ item, index }: { item: FAQItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='border-b border-slate-200 dark:border-slate-700'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex w-full items-center justify-between px-6 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800'
      >
        <span className='font-semibold text-slate-900 dark:text-white'>
          {item.question}
        </span>
        <ChevronDown
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className='border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-900'>
          <p className='text-slate-600 dark:text-slate-400'>{item.answer}</p>
        </div>
      )}
    </div>
  );
}

function Navbar({
  onSignupClick,
  onDemoClick
}: {
  onSignupClick: () => void;
  onDemoClick: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const router = useRouter();

  return (
    <nav className='fixed top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95'>
      <div className='container mx-auto flex items-center justify-between px-4 py-4'>
        <Link href='/' className='flex items-center gap-2'>
          <div className='flex items-center gap-2'>
            <div className='rounded-lg bg-gradient-to-br from-blue-600 to-emerald-600 p-2'>
              <Box className='h-6 w-6 text-white' />
            </div>
            <span className='text-xl font-bold text-slate-900 dark:text-white'>
              DigitalDukan
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className='hidden gap-8 md:flex'>
          <a
            href='#features'
            className='text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          >
            Features
          </a>
          <a
            href='#pricing'
            className='text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          >
            Pricing
          </a>
          <a
            href='#testimonials'
            className='text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          >
            Testimonials
          </a>
          <a
            href='#faq'
            className='text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          >
            FAQ
          </a>
        </div>

        <div className='hidden gap-3 md:flex'>
          <Button variant='outline' size='sm'>
            <Link href='/sign-in'>Sign In</Link>
          </Button>
          <Button
            size='sm'
            className='bg-gradient-to-r from-blue-600 to-emerald-600'
            onClick={() => router.push('/sign-up')}
          >
            Start Free
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className='md:hidden'
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className='h-6 w-6' />
          ) : (
            <Menu className='h-6 w-6' />
          )}
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className='absolute left-0 right-0 top-full border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95'>
            <div className='container mx-auto flex flex-col gap-4 px-4 py-4'>
              <a
                href='#features'
                className='text-slate-600 hover:text-slate-900'
              >
                Features
              </a>
              <a
                href='#pricing'
                className='text-slate-600 hover:text-slate-900'
              >
                Pricing
              </a>
              <a
                href='#testimonials'
                className='text-slate-600 hover:text-slate-900'
              >
                Testimonials
              </a>
              <a href='#faq' className='text-slate-600 hover:text-slate-900'>
                FAQ
              </a>
              <Button variant='outline' className='w-full'>
                Sign In
              </Button>
              <Button
                className='w-full bg-gradient-to-r from-blue-600 to-emerald-600'
                onClick={() => router.push('/sign-up')}
              >
                Start Free
              </Button>{' '}
              <Button
                variant='outline'
                className='w-full'
                onClick={onDemoClick}
              >
                Schedule Demo
              </Button>{' '}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default function DigitalDukanLanding() {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const openSignupModal = () => setIsSignupModalOpen(true);
  const closeSignupModal = () => setIsSignupModalOpen(false);
  const openDemoModal = () => setIsDemoModalOpen(true);
  const closeDemoModal = () => setIsDemoModalOpen(false);

  const businessTypes = [
    'Electronics Retailers',
    'General Stores',
    'Wholesale Shops',
    '500+ Businesses'
  ];

  const painPoints = [
    {
      icon: AlertCircle,
      title: 'Stockout Surprises',
      description: 'Lost sales due to out-of-stock items'
    },
    {
      icon: ClipboardList,
      title: 'Manual Chaos',
      description: 'Hours spent on paper records and spreadsheets'
    },
    {
      icon: FileText,
      title: 'Tax Confusion',
      description: 'Difficulty managing invoices and compliance'
    }
  ];

  const features = [
    {
      icon: Box,
      title: 'Product Management',
      description: 'Add products once, manage them forever'
    },
    {
      icon: Zap,
      title: 'Smart Reordering',
      description: 'Automatic low-stock alerts. Never miss a sale.'
    },
    {
      icon: FileText,
      title: 'Tax Invoicing',
      description: 'Generate professional bills in seconds. Fully compliant.'
    },
    {
      icon: Truck,
      title: 'Supplier Management',
      description: 'Track costs, manage payments, build relationships'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'See your business at a glance'
    },
    {
      icon: Wifi,
      title: 'Offline Mode',
      description: 'Works even without internet'
    }
  ];

  const whatIncluded = [
    { icon: Box, label: 'Product Management' },
    { icon: Truck, label: 'Supplier Tracking' },
    { icon: Shield, label: 'Tax Compliance' },
    { icon: Users, label: 'Multi-User Roles' },
    { icon: Smartphone, label: 'Mobile App' },
    { icon: BarChart3, label: 'Analytics Dashboard' },
    { icon: Wifi, label: 'Offline Support' },
    { icon: Lock, label: 'Data Security' }
  ];

  const testimonials: TestimonialData[] = [
    {
      name: 'Raj Kumar',
      business: 'Electronics Retailer',
      location: 'Kathmandu',
      quote: 'Saved me 15 hours every week. Best investment for my shop!',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      business: 'General Store',
      location: 'Pokhara',
      quote: 'Finally can manage credit customers properly. Game changer!',
      rating: 5
    },
    {
      name: 'Sundar Poudel',
      business: 'Wholesale Business',
      location: 'Lalitpur',
      quote: 'Simple to use and affordable. Worth every rupee.',
      rating: 5
    }
  ];

  const faqs: FAQItem[] = [
    {
      question: "What's the difference between Free and Premium plans?",
      answer:
        'Free plan includes 50 products, 1 user, 1 location, and basic invoicing - perfect for small shops. Premium plan offers unlimited products, users, locations, advanced analytics, and priority support for growing businesses.'
    },
    {
      question: 'How do I upgrade to Premium?',
      answer:
        'Simply go to Settings > Billing in your dashboard and click "Upgrade to Premium". You can pay via Fonepay, NepalPay, eSewa, or other local payment methods using QR code. No credit card required!'
    },
    {
      question: 'Can I import existing data?',
      answer:
        'Yes! We support data import from Excel, CSV, and other inventory systems. Our team can assist with migration at no additional cost.'
    },
    {
      question: 'Does it work on mobile?',
      answer:
        'Absolutely! DigitalDukan has a fully responsive mobile web app and native iOS/Android applications available on app stores.'
    },
    {
      question: 'Is my data secure?',
      answer:
        'Yes. We use bank-level SSL encryption, automatic backups, and comply with international data protection standards. Your data is encrypted both in transit and at rest.'
    },
    {
      question: 'Can multiple users access the system?',
      answer:
        'Free plan supports 1 user. Premium plan allows unlimited users with different roles and permissions. Control who can view, edit, or delete data for better security.'
    },
    {
      question: 'Do you support Nepali language?',
      answer:
        'Currently, we support English with Nepali language support coming soon. We are actively working on localization for better accessibility.'
    },
    {
      question: 'What payment methods are supported for Premium?',
      answer:
        'We support manual QR payments via Fonepay, NepalPay, eSewa, IME Pay, Khalti, and other local banking apps. Simply scan the QR code, pay, and upload your receipt for verification. No credit card required!'
    },
    {
      question: 'How long does payment verification take?',
      answer:
        "Most payments are verified within 24 hours during business days. You'll receive a notification once your Premium subscription is activated."
    },
    {
      question: 'Can I downgrade from Premium to Free?',
      answer:
        'Yes, you can downgrade anytime from your account settings. Your Premium features will remain active until the end of your current billing period.'
    }
  ];

  return (
    <div className='min-h-screen w-full bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      <Navbar onSignupClick={openSignupModal} onDemoClick={openDemoModal} />

      {/* Hero Section */}
      <section className='container mx-auto px-4 pb-16 pt-32 md:pb-24 md:pt-16'>
        <div className='grid items-center gap-12 md:grid-cols-2 md:gap-8'>
          {/* Left Content */}
          <div className='flex flex-col gap-6'>
            <div className='inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 dark:bg-emerald-950/30'>
              <span className='h-2 w-2 rounded-full bg-emerald-600'></span>
              <span className='text-sm font-medium text-emerald-700 dark:text-emerald-400'>
                Join 500+ businesses across Nepal
              </span>
            </div>

            <h1 className='bg-gradient-to-r from-blue-600 via-emerald-600 to-blue-600 bg-clip-text text-5xl font-bold leading-tight text-transparent md:text-6xl lg:text-7xl'>
              Inventory Management Made Simple
            </h1>

            <p className='text-xl leading-relaxed text-slate-600 dark:text-slate-400'>
              Start free with 50 products, upgrade to Premium for unlimited
              everything. No credit card required.
            </p>

            <div className='flex flex-col gap-3 sm:flex-row'>
              <Button
                size='lg'
                className='gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700'
                onClick={openSignupModal}
              >
                Start Free <ArrowRight className='h-4 w-4' />
              </Button>
              <Button
                size='lg'
                variant='outline'
                className='gap-2'
                onClick={openDemoModal}
              >
                <Play className='h-4 w-4' />
                Watch Demo
              </Button>
            </div>

            <div className='flex items-center gap-8 text-sm'>
              <div className='flex -space-x-2'>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className='h-8 w-8 rounded-full border-2 border-white bg-gradient-to-r from-blue-400 to-emerald-400 dark:border-slate-900'
                  />
                ))}
              </div>
              <span className='text-slate-600 dark:text-slate-400'>
                Trusted by shop owners and managers
              </span>
            </div>
          </div>

          {/* Right Visual */}
          <div className='relative hidden items-center justify-center md:flex'>
            <div className='relative aspect-square w-full'>
              {/* Animated background shapes */}
              <div className='absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-100 to-emerald-100 blur-3xl dark:from-blue-950/20 dark:to-emerald-950/20'></div>
              <div className='absolute inset-10 flex items-center justify-center rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-emerald-50 backdrop-blur-xl dark:border-slate-700 dark:from-slate-800 dark:to-slate-900'>
                <div className='text-center'>
                  <BarChart3 className='mx-auto mb-4 h-16 w-16 text-blue-600' />
                  <p className='text-sm font-semibold text-slate-900 dark:text-white'>
                    Dashboard Preview
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className='bg-slate-900 py-16 md:py-24'>
        <div className='container mx-auto px-4'>
          <div className='mb-16 text-center'>
            <h2 className='mb-4 text-3xl font-bold text-white md:text-4xl'>
              The Problem with Manual Inventory
            </h2>
            <p className='mx-auto max-w-2xl text-slate-400'>
              Running your shop without proper inventory management costs you
              time, money, and customers
            </p>
          </div>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
            {painPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <Card
                  key={index}
                  className='hover:bg-slate-750 border-slate-700 bg-slate-800 transition-colors'
                >
                  <CardContent className='p-6'>
                    <div className='mb-4 w-fit rounded-lg bg-red-500/10 p-3'>
                      <Icon className='h-6 w-6 text-red-500' />
                    </div>
                    <h3 className='mb-2 text-xl font-semibold text-white'>
                      {point.title}
                    </h3>
                    <p className='text-slate-400'>{point.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features' className='container mx-auto px-4 py-16 md:py-24'>
        <div className='mb-16 text-center'>
          <h2 className='mb-4 text-3xl font-bold md:text-4xl'>
            Everything You Need to Scale Your Business
          </h2>
          <p className='mx-auto max-w-2xl text-slate-600 dark:text-slate-400'>
            Comprehensive features designed specifically for Nepali businesses
          </p>
        </div>

        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className='border-none shadow-md transition-all hover:scale-105 hover:shadow-xl'
              >
                <CardContent className='p-6'>
                  <div className='mb-4 w-fit rounded-lg bg-blue-100 p-3 dark:bg-blue-950/30'>
                    <Icon className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                  </div>
                  <h3 className='mb-2 text-xl font-semibold'>
                    {feature.title}
                  </h3>
                  <p className='text-slate-600 dark:text-slate-400'>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* KPI/Benefits Section */}
      <section className='bg-gradient-to-r from-blue-50 to-emerald-50 py-16 dark:from-blue-950/20 dark:to-emerald-950/20 md:py-24'>
        <div className='container mx-auto px-4'>
          <div className='mb-16 text-center'>
            <h2 className='mb-4 text-3xl font-bold md:text-4xl'>
              Why DigitalDukan Works
            </h2>
            <p className='mx-auto max-w-2xl text-slate-600 dark:text-slate-400'>
              Real benefits that shop owners actually experience
            </p>
          </div>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
            <div className='flex flex-col items-center rounded-lg bg-white/50 p-6 text-center backdrop-blur dark:bg-slate-800/50'>
              <AnimatedCounter end={40} suffix='%' />
              <p className='mt-3 font-semibold text-slate-900 dark:text-white'>
                Reduction in stockouts
              </p>
            </div>
            <div className='flex flex-col items-center rounded-lg bg-white/50 p-6 text-center backdrop-blur dark:bg-slate-800/50'>
              <AnimatedCounter end={10} suffix='+' />
              <p className='mt-3 font-semibold text-slate-900 dark:text-white'>
                Hours saved weekly
              </p>
            </div>
            <div className='flex flex-col items-center rounded-lg bg-white/50 p-6 text-center backdrop-blur dark:bg-slate-800/50'>
              <div className='text-4xl font-bold text-primary'>99.9%</div>
              <p className='mt-3 font-semibold text-slate-900 dark:text-white'>
                Uptime guaranteed
              </p>
            </div>
            <div className='flex flex-col items-center rounded-lg bg-white/50 p-6 text-center backdrop-blur dark:bg-slate-800/50'>
              <AnimatedCounter end={500} suffix='+' />
              <p className='mt-3 font-semibold text-slate-900 dark:text-white'>
                Businesses trust us
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id='pricing' className='container mx-auto px-4 py-16 md:py-24'>
        <div className='mb-16 text-center'>
          <h2 className='mb-4 text-3xl font-bold md:text-4xl'>
            Plans That Grow With Your Business
          </h2>
          <p className='mx-auto max-w-2xl text-slate-600 dark:text-slate-400'>
            Start free, upgrade when you're ready. No hidden fees.
          </p>
        </div>

        <div className='mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2'>
          {/* Free Plan */}
          <Card className='border-2 border-slate-200 shadow-lg dark:border-slate-700'>
            <CardContent className='p-8'>
              <h3 className='mb-2 text-center text-xl font-semibold text-slate-600 dark:text-slate-400'>
                Free Plan
              </h3>
              <div className='mb-6 text-center'>
                <div className='text-5xl font-bold text-slate-900 dark:text-white'>
                  ₹0
                </div>
                <p className='text-slate-600 dark:text-slate-400'>
                  Forever free
                </p>
              </div>

              <div className='mb-6 space-y-3 border-b border-t border-slate-200 py-6 dark:border-slate-700'>
                <div className='flex items-center gap-2'>
                  <CheckCircle2 className='h-5 w-5 text-emerald-500' />
                  <span>50 products</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle2 className='h-5 w-5 text-emerald-500' />
                  <span>1 user</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle2 className='h-5 w-5 text-emerald-500' />
                  <span>1 location</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle2 className='h-5 w-5 text-emerald-500' />
                  <span>Basic invoicing</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle2 className='h-5 w-5 text-emerald-500' />
                  <span>Email support</span>
                </div>
              </div>

              <Button
                className='mb-4 w-full'
                variant='outline'
                onClick={openSignupModal}
              >
                Get Started Free
              </Button>

              <p className='text-center text-sm text-slate-600 dark:text-slate-400'>
                Perfect for small shops
              </p>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className='relative border-2 border-blue-200 shadow-xl dark:border-blue-900'>
            <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
              <Badge className='bg-gradient-to-r from-blue-600 to-emerald-600'>
                MOST POPULAR
              </Badge>
            </div>
            <CardContent className='p-8'>
              <h3 className='mb-2 text-center text-xl font-semibold text-blue-600 dark:text-blue-400'>
                Premium Plan
              </h3>
              <div className='mb-6 text-center'>
                <div className='text-5xl font-bold text-blue-600 dark:text-blue-400'>
                  ₹999
                </div>
                <p className='text-slate-600 dark:text-slate-400'>
                  /month or ₹9,999/year
                </p>
              </div>

              <div className='mb-6 space-y-3 border-b border-t border-slate-200 py-6 dark:border-slate-700'>
                <div className='flex items-center gap-2'>
                  <CheckCircle2 className='h-5 w-5 text-emerald-500' />
                  <span>Unlimited products</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle2 className='h-5 w-5 text-emerald-500' />
                  <span>Unlimited users</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle2 className='h-5 w-5 text-emerald-500' />
                  <span>Multi-location support</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle2 className='h-5 w-5 text-emerald-500' />
                  <span>Advanced analytics</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle2 className='h-5 w-5 text-emerald-500' />
                  <span>Tax-compliant invoicing</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CheckCircle2 className='h-5 w-5 text-emerald-500' />
                  <span>Priority support</span>
                </div>
              </div>

              <Button
                className='mb-4 w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700'
                onClick={openSignupModal}
              >
                Upgrade to Premium
              </Button>

              <p className='flex items-center justify-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400'>
                <CheckCircle2 className='h-4 w-4' />
                Pay via QR code - No credit card needed
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What's Included Section */}
      <section className='bg-slate-50 py-16 dark:bg-slate-900/50 md:py-24'>
        <div className='container mx-auto px-4'>
          <div className='mb-16 text-center'>
            <h2 className='mb-4 text-3xl font-bold md:text-4xl'>
              Complete Inventory Solution
            </h2>
            <p className='mx-auto max-w-2xl text-slate-600 dark:text-slate-400'>
              Everything needed to run your business efficiently
            </p>
          </div>

          <div className='grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-4'>
            {whatIncluded.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className='flex flex-col items-center rounded-lg p-6 text-center transition-colors hover:bg-white dark:hover:bg-slate-800'
                >
                  <div className='mb-3 w-fit rounded-lg bg-blue-100 p-3 dark:bg-blue-950/30'>
                    <Icon className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                  </div>
                  <p className='font-semibold text-slate-900 dark:text-white'>
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id='testimonials'
        className='container mx-auto px-4 py-16 md:py-24'
      >
        <div className='mb-16 text-center'>
          <h2 className='mb-4 text-3xl font-bold md:text-4xl'>
            Trusted by Business Owners Across Nepal
          </h2>
          <p className='mx-auto max-w-2xl text-slate-600 dark:text-slate-400'>
            Real success stories from our customers
          </p>
        </div>

        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className='border-none shadow-md transition-shadow hover:shadow-xl'
            >
              <CardContent className='p-6'>
                <div className='mb-4 flex gap-1'>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className='h-4 w-4 fill-yellow-400 text-yellow-400'
                    />
                  ))}
                </div>
                <p className='mb-6 text-lg font-semibold text-slate-900 dark:text-white'>
                  "{testimonial.quote}"
                </p>
                <div className='border-t border-slate-200 pt-4 dark:border-slate-700'>
                  <p className='font-semibold text-slate-900 dark:text-white'>
                    {testimonial.name}
                  </p>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    {testimonial.business} • {testimonial.location}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Demo Section */}
      <section
        id='demo'
        className='bg-gradient-to-r from-blue-50 to-emerald-50 py-16 dark:from-blue-950/20 dark:to-emerald-950/20 md:py-24'
      >
        <div className='container mx-auto px-4'>
          <div className='text-center'>
            <h2 className='mb-4 text-3xl font-bold md:text-4xl'>
              See It In Action
            </h2>
            <p className='mx-auto mb-8 max-w-2xl text-slate-600 dark:text-slate-400'>
              Watch how DigitalDukan transforms inventory management for Nepali
              businesses
            </p>

            <div className='group relative mx-auto flex aspect-video max-w-3xl cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-slate-900'>
              <div className='absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50'></div>
              <Play className='h-16 w-16 text-white opacity-50 transition-opacity group-hover:opacity-100' />
            </div>

            <Button
              size='lg'
              className='mt-8 gap-2 bg-gradient-to-r from-blue-600 to-emerald-600'
              onClick={openSignupModal}
            >
              Get Started Free <ArrowRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id='faq' className='container mx-auto px-4 py-16 md:py-24'>
        <div className='mb-16 text-center'>
          <h2 className='mb-4 text-3xl font-bold md:text-4xl'>
            Common Questions Answered
          </h2>
          <p className='mx-auto max-w-2xl text-slate-600 dark:text-slate-400'>
            We're here to help. Find answers to common questions below.
          </p>
        </div>

        <div className='mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'>
          {faqs.map((faq, index) => (
            <FAQAccordion key={index} item={faq} index={index} />
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className='bg-gradient-to-r from-blue-600 via-emerald-600 to-blue-600 py-16 md:py-24'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-col items-center rounded-2xl text-center text-white'>
            <h2 className='mb-4 text-3xl font-bold md:text-4xl'>
              Ready to Transform Your Inventory Management?
            </h2>
            <p className='mb-8 max-w-2xl text-lg text-blue-100'>
              Join hundreds of successful businesses across Nepal. Start free
              today, upgrade when you're ready—no credit card required.
            </p>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <Button
                size='lg'
                className='bg-white text-blue-600 hover:bg-slate-100'
                onClick={openSignupModal}
              >
                Get Started Free <ArrowRight className='h-4 w-4' />
              </Button>
              <Button
                size='lg'
                variant='outline'
                className='border-white text-white hover:bg-white/10'
                onClick={openDemoModal}
              >
                Schedule a Demo Call
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-slate-900 py-12 text-white'>
        <div className='container mx-auto px-4'>
          <div className='mb-8 grid grid-cols-1 gap-8 md:grid-cols-4'>
            {/* Brand */}
            <div>
              <div className='mb-4 flex items-center gap-2'>
                <div className='rounded-lg bg-gradient-to-br from-blue-600 to-emerald-600 p-2'>
                  <Box className='h-5 w-5 text-white' />
                </div>
                <span className='font-bold'>DigitalDukan</span>
              </div>
              <p className='text-sm text-slate-400'>
                Inventory management for modern Nepali businesses.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className='mb-4 font-semibold'>Quick Links</h3>
              <ul className='space-y-2 text-sm text-slate-400'>
                <li>
                  <a href='#' className='transition-colors hover:text-white'>
                    Features
                  </a>
                </li>
                <li>
                  <a href='#' className='transition-colors hover:text-white'>
                    Pricing
                  </a>
                </li>
                <li>
                  <a href='#' className='transition-colors hover:text-white'>
                    Blog
                  </a>
                </li>
                <li>
                  <a href='#' className='transition-colors hover:text-white'>
                    Docs
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className='mb-4 font-semibold'>Company</h3>
              <ul className='space-y-2 text-sm text-slate-400'>
                <li>
                  <a href='#' className='transition-colors hover:text-white'>
                    About
                  </a>
                </li>
                <li>
                  <a href='#' className='transition-colors hover:text-white'>
                    Contact
                  </a>
                </li>
                <li>
                  <a href='#' className='transition-colors hover:text-white'>
                    Privacy
                  </a>
                </li>
                <li>
                  <a href='#' className='transition-colors hover:text-white'>
                    Terms
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className='mb-4 font-semibold'>Connect With Us</h3>
              <div className='mb-4 flex gap-4'>
                <a
                  href='#'
                  className='text-slate-400 transition-colors hover:text-white'
                >
                  <Linkedin className='h-5 w-5' />
                </a>
                <a
                  href='#'
                  className='text-slate-400 transition-colors hover:text-white'
                >
                  <Twitter className='h-5 w-5' />
                </a>
                <a
                  href='#'
                  className='text-slate-400 transition-colors hover:text-white'
                >
                  <Facebook className='h-5 w-5' />
                </a>
              </div>
              <p className='text-sm text-slate-400'>
                📧 support@digitaldukan.np
              </p>
            </div>
          </div>

          <div className='border-t border-slate-800 pt-8 text-center text-slate-400'>
            <p>
              &copy; {new Date().getFullYear()} DigitalDukan. Made for Nepal 🇳🇵
            </p>
          </div>
        </div>
      </footer>

      <TrialSignupModal isOpen={isSignupModalOpen} onClose={closeSignupModal} />
      <ScheduleDemoModal isOpen={isDemoModalOpen} onClose={closeDemoModal} />
    </div>
  );
}
