'use client';

import { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function StockManagementLanding() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <ScrollArea>
      <div className='min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900'>
        {/* Hero Section */}
        <header className='container mx-auto px-4 py-16 md:py-24'>
          <div className='flex flex-col items-center text-center'>
            <div className='mb-4 inline-block rounded-full bg-primary/10 p-2'>
              <Box className='h-6 w-6 text-primary' />
            </div>
            <h1 className='mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl'>
              Stock Management System
            </h1>
            <p className='mb-8 max-w-2xl text-xl text-slate-600 dark:text-slate-400'>
              Effortlessly manage your business inventory with our intuitive and
              powerful tools.
            </p>
            <div className='flex flex-col gap-4 sm:flex-row'>
              <Button size='lg' className='gap-2'>
                Get Started <ArrowRight className='h-4 w-4' />
              </Button>
              <Button size='lg' variant='outline'>
                Learn More
              </Button>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <section className='container mx-auto px-4 py-16'>
          <div className='mb-16 text-center'>
            <h2 className='mb-4 text-3xl font-bold'>Comprehensive Features</h2>
            <p className='mx-auto max-w-2xl text-slate-600 dark:text-slate-400'>
              Everything you need to streamline your inventory management
              process
            </p>
          </div>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
            <FeatureCard
              icon={<Box className='h-6 w-6 text-primary' />}
              title='Product Management'
              description='Add, update, and delete products with detailed information such as name, SKU, barcode, category, and more.'
            />
            <FeatureCard
              icon={<Truck className='h-6 w-6 text-primary' />}
              title='Supplier Management'
              description='Manage your suppliers with ease. Add, update, and delete supplier information including name, phone, email, and address.'
            />
            <FeatureCard
              icon={<Layers className='h-6 w-6 text-primary' />}
              title='Category Management'
              description='Organize your products into categories for better management and reporting.'
            />
            <FeatureCard
              icon={<ClipboardList className='h-6 w-6 text-primary' />}
              title='Stock Movements'
              description='Track stock movements such as purchases, sales, damages, and returns.'
            />
            <FeatureCard
              icon={<ShoppingCart className='h-6 w-6 text-primary' />}
              title='Sales Management'
              description='Record and manage sales transactions with detailed information.'
            />
            <FeatureCard
              icon={<Kanban className='h-6 w-6 text-primary' />}
              title='Kanban Board'
              description='Visualize and manage tasks using a Kanban board.'
            />
            <FeatureCard
              icon={<FileText className='h-6 w-6 text-primary' />}
              title='Tax Invoice Bill'
              description='Generate tax invoice bills to make your business go digital and keep records of sales transactions.'
            />
            <FeatureCard
              icon={<BookOpen className='h-6 w-6 text-primary' />}
              title='Ledger Feature'
              description='Maintain a record of financial transactions with suppliers and shopkeepers.'
            />
            <FeatureCard
              icon={<BarChart3 className='h-6 w-6 text-primary' />}
              title='Advanced Analytics'
              description='Gain insights into your inventory with powerful reporting and analytics tools.'
            />
          </div>
        </section>

        {/* How It Works Section */}
        <section className='bg-white py-16 dark:bg-slate-800'>
          <div className='container mx-auto px-4'>
            <div className='mb-12 text-center'>
              <h2 className='mb-4 text-3xl font-bold'>How It Works</h2>
              <p className='mx-auto max-w-2xl text-slate-600 dark:text-slate-400'>
                Our platform is designed to be intuitive and easy to use
              </p>
            </div>

            <div className='flex flex-col justify-center gap-8 md:flex-row'>
              <div className='flex max-w-xs flex-col items-center text-center'>
                <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
                  <span className='text-xl font-bold text-primary'>1</span>
                </div>
                <h3 className='mb-2 text-xl font-semibold'>
                  Set Up Your Inventory
                </h3>
                <p className='text-slate-600 dark:text-slate-400'>
                  Add your products, suppliers, and categories to get started.
                </p>
              </div>
              <div className='flex max-w-xs flex-col items-center text-center'>
                <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
                  <span className='text-xl font-bold text-primary'>2</span>
                </div>
                <h3 className='mb-2 text-xl font-semibold'>Track Movements</h3>
                <p className='text-slate-600 dark:text-slate-400'>
                  Record all stock movements including purchases, sales, and
                  returns.
                </p>
              </div>
              <div className='flex max-w-xs flex-col items-center text-center'>
                <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
                  <span className='text-xl font-bold text-primary'>3</span>
                </div>
                <h3 className='mb-2 text-xl font-semibold'>Generate Reports</h3>
                <p className='text-slate-600 dark:text-slate-400'>
                  Get insights into your business with comprehensive reports and
                  analytics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='container mx-auto px-4 py-16'>
          <div className='flex flex-col items-center rounded-2xl bg-primary/10 p-8 text-center md:p-12'>
            <h2 className='mb-4 text-3xl font-bold'>
              Ready to streamline your inventory management?
            </h2>
            <p className='mb-8 max-w-2xl text-slate-600 dark:text-slate-400'>
              Join thousands of businesses that have transformed their inventory
              management process with our system.
            </p>
            <Button size='lg' className='gap-2'>
              Get Started Today <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className='bg-slate-900 py-12 text-white'>
          <div className='container mx-auto px-4'>
            <div className='flex flex-col items-center justify-between md:flex-row'>
              <div className='mb-6 flex items-center md:mb-0'>
                <Box className='mr-2 h-8 w-8' />
                <span className='text-xl font-bold'>
                  Stock Management System
                </span>
              </div>
              <div className='flex gap-6'>
                <a href='#' className='transition-colors hover:text-primary'>
                  Home
                </a>
                <a href='#' className='transition-colors hover:text-primary'>
                  Features
                </a>
                <a href='#' className='transition-colors hover:text-primary'>
                  Pricing
                </a>
                <a href='#' className='transition-colors hover:text-primary'>
                  Contact
                </a>
              </div>
            </div>
            <div className='mt-8 border-t border-slate-800 pt-8 text-center text-slate-400'>
              <p>
                &copy; {new Date().getFullYear()} Stock Management System. All
                rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ScrollArea>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className='border-none shadow-md transition-shadow hover:shadow-lg'>
      <CardContent className='p-6'>
        <div className='mb-4 w-fit rounded-full bg-primary/10 p-2'>{icon}</div>
        <h3 className='mb-2 text-xl font-semibold'>{title}</h3>
        <p className='text-slate-600 dark:text-slate-400'>{description}</p>
      </CardContent>
    </Card>
  );
}
