'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { KnowledgeBase } from './HelpTooltip';
import { VideoTutorials } from './VideoTutorials';
import { SetupWizard } from './SetupWizard';
import {
  BookOpen,
  Play,
  Lightbulb,
  Zap,
  MessageCircle,
  CheckCircle2
} from 'lucide-react';

interface GettingStartedCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
}

const GETTING_STARTED_CARDS: GettingStartedCard[] = [
  {
    icon: <Zap className='h-6 w-6 text-orange-500' />,
    title: 'Quick Start (5 min)',
    description: 'Get set up in 5 minutes with our guided setup wizard.',
    action: 'Start Setup'
  },
  {
    icon: <Play className='h-6 w-6 text-blue-500' />,
    title: 'Watch Videos',
    description: 'Learn from step-by-step video tutorials on key topics.',
    action: 'Watch Now'
  },
  {
    icon: <BookOpen className='h-6 w-6 text-green-500' />,
    title: 'Read Guides',
    description: 'Search our comprehensive knowledge base for answers.',
    action: 'Browse'
  },
  {
    icon: <Lightbulb className='h-6 w-6 text-yellow-500' />,
    title: 'Pro Tips',
    description: 'Expert tips to maximize profits and improve cash flow.',
    action: 'Learn Tips'
  }
];

interface ComprehensiveHelpPageProps {
  defaultTab?: 'getting-started' | 'videos' | 'knowledge' | 'setup';
}

export const ComprehensiveHelpPage: React.FC<ComprehensiveHelpPageProps> = ({
  defaultTab = 'getting-started'
}) => {
  const [activeTab, setActiveTab] = useState<
    'getting-started' | 'videos' | 'knowledge' | 'setup' | 'tips'
  >(defaultTab);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  const handleTabChange = (value: string) => {
    setActiveTab(
      value as 'getting-started' | 'videos' | 'knowledge' | 'setup' | 'tips'
    );
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6'>
        <h1 className='text-3xl font-bold text-gray-900'>
          Help & Learning Center
        </h1>
        <p className='mt-2 text-gray-700'>
          Get answers, watch tutorials, and become an expert with your inventory
          system.
        </p>
      </div>

      {/* Setup Wizard Modal */}
      {showSetupWizard && (
        <SetupWizard onComplete={() => setShowSetupWizard(false)} />
      )}

      {/* Quick Navigation - Mobile View Hidden */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-1 gap-2 sm:grid-cols-4'>
          <TabsTrigger
            value='getting-started'
            className='flex items-center gap-2'
          >
            <CheckCircle2 className='h-4 w-4' />
            <span className='hidden sm:inline'>Getting Started</span>
            <span className='sm:hidden'>Start</span>
          </TabsTrigger>
          <TabsTrigger value='videos' className='flex items-center gap-2'>
            <Play className='h-4 w-4' />
            <span className='hidden sm:inline'>Videos</span>
          </TabsTrigger>
          <TabsTrigger value='knowledge' className='flex items-center gap-2'>
            <BookOpen className='h-4 w-4' />
            <span className='hidden sm:inline'>Knowledge Base</span>
            <span className='sm:hidden'>KB</span>
          </TabsTrigger>
          <TabsTrigger value='tips' className='flex items-center gap-2'>
            <Lightbulb className='h-4 w-4' />
            <span className='hidden sm:inline'>Pro Tips</span>
            <span className='sm:hidden'>Tips</span>
          </TabsTrigger>
        </TabsList>

        {/* Getting Started Tab */}
        <TabsContent value='getting-started' className='space-y-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {GETTING_STARTED_CARDS.map((card, idx) => (
              <Card
                key={idx}
                className='cursor-pointer border-2 border-gray-200 transition-all hover:border-blue-400 hover:shadow-md'
              >
                <CardContent className='p-6'>
                  <div className='mb-4'>{card.icon}</div>
                  <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                    {card.title}
                  </h3>
                  <p className='mb-4 text-sm text-gray-600'>
                    {card.description}
                  </p>
                  <button
                    onClick={() => {
                      if (idx === 0) setShowSetupWizard(true);
                      if (idx === 1) handleTabChange('videos');
                      if (idx === 2) handleTabChange('knowledge');
                      if (idx === 3) handleTabChange('tips');
                    }}
                    className='rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600'
                  >
                    {card.action} →
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Stats */}
          <Card className='border-blue-200 bg-blue-50'>
            <CardHeader>
              <CardTitle className='text-lg'>Did You Know?</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex gap-3'>
                <span className='text-2xl'>📊</span>
                <div>
                  <p className='font-semibold text-gray-900'>
                    Just 5% price increase = 20% profit increase
                  </p>
                  <p className='text-sm text-gray-600'>
                    Most businesses leave money on the table by underpricing.
                  </p>
                </div>
              </div>
              <div className='flex gap-3'>
                <span className='text-2xl'>💰</span>
                <div>
                  <p className='font-semibold text-gray-900'>
                    Cash flow beats profit
                  </p>
                  <p className='text-sm text-gray-600'>
                    Many profitable businesses fail due to poor cash flow.
                  </p>
                </div>
              </div>
              <div className='flex gap-3'>
                <span className='text-2xl'>📈</span>
                <div>
                  <p className='font-semibold text-gray-900'>
                    20% of products = 80% of profit
                  </p>
                  <p className='text-sm text-gray-600'>
                    Focus your time and inventory on top products.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value='videos' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>
                Learn at your own pace with step-by-step videos (5-10 minutes
                each)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VideoTutorials />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value='knowledge' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>
                Search articles, tips, and best practices for running your
                business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KnowledgeBase />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pro Tips Tab */}
        <TabsContent value='tips' className='space-y-4'>
          <div className='space-y-4'>
            {/* Pro Tips Section */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Pro Tips for Business Growth</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Pricing Strategies */}
                <div className='rounded-lg border-l-4 border-green-500 bg-green-50 p-4'>
                  <h4 className='mb-2 font-semibold text-gray-900'>
                    Pricing Strategies
                  </h4>
                  <ul className='space-y-2 text-sm text-gray-700'>
                    <li>
                      • <strong>Test pricing:</strong> Increase prices by 5% on
                      your top products and measure sales impact
                    </li>
                    <li>
                      • <strong>Seasonal pricing:</strong> Charge more during
                      peak demand
                    </li>
                    <li>
                      • <strong>Bundle pricing:</strong> Sell multiple products
                      together at a discount
                    </li>
                  </ul>
                </div>

                {/* Cash Flow Management */}
                <div className='rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4'>
                  <h4 className='mb-2 font-semibold text-gray-900'>
                    Cash Flow Management
                  </h4>
                  <ul className='space-y-2 text-sm text-gray-700'>
                    <li>
                      • <strong>Accelerate collections:</strong> Offer 2%
                      discount for payment in 7 days instead of 30
                    </li>
                    <li>
                      • <strong>Negotiate terms:</strong> Ask suppliers for
                      45-day payment terms
                    </li>
                    <li>
                      • <strong>Build reserves:</strong> Keep 30 days of
                      operating expenses as cash buffer
                    </li>
                  </ul>
                </div>

                {/* Inventory Optimization */}
                <div className='rounded-lg border-l-4 border-purple-500 bg-purple-50 p-4'>
                  <h4 className='mb-2 font-semibold text-gray-900'>
                    Inventory Optimization
                  </h4>
                  <ul className='space-y-2 text-sm text-gray-700'>
                    <li>
                      • <strong>ABC Analysis:</strong> Categorize products A
                      (high-value), B (medium), C (low-value)
                    </li>
                    <li>
                      • <strong>Review monthly:</strong> Identify slow-moving
                      items and consider discontinuing
                    </li>
                    <li>
                      • <strong>Just-in-time:</strong> Order more frequently in
                      smaller quantities to reduce carrying costs
                    </li>
                  </ul>
                </div>

                {/* Data-Driven Decisions */}
                <div className='rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4'>
                  <h4 className='mb-2 font-semibold text-gray-900'>
                    Make Data-Driven Decisions
                  </h4>
                  <ul className='space-y-2 text-sm text-gray-700'>
                    <li>
                      • <strong>Track margins:</strong> Know the profitability
                      of each product
                    </li>
                    <li>
                      • <strong>Monitor trends:</strong> Use weekly/monthly
                      reports to spot patterns
                    </li>
                    <li>
                      • <strong>Set targets:</strong> Use break-even analysis to
                      set realistic sales goals
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Common Questions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h4 className='mb-2 font-semibold text-gray-900'>
                    Q: How often should I update my data?
                  </h4>
                  <p className='text-sm text-gray-700'>
                    A: Daily is ideal for sales and inventory. Weekly for
                    detailed analysis. The system auto-calculates P&L and cash
                    flow in real-time.
                  </p>
                </div>
                <div>
                  <h4 className='mb-2 font-semibold text-gray-900'>
                    Q: What does a good profit margin look like?
                  </h4>
                  <p className='text-sm text-gray-700'>
                    A: It varies by industry, but 20-30% is healthy for retail,
                    40%+ for services. Use the Profit & Loss tab to compare your
                    products.
                  </p>
                </div>
                <div>
                  <h4 className='mb-2 font-semibold text-gray-900'>
                    Q: I have negative cash flow. What should I do?
                  </h4>
                  <p className='text-sm text-gray-700'>
                    A: Check the Cash Flow tab for your aging buckets.
                    Prioritize collecting from customers with 60+ days overdue.
                    Negotiate longer payment terms with suppliers.
                  </p>
                </div>
                <div>
                  <h4 className='mb-2 font-semibold text-gray-900'>
                    Q: Which products should I discontinue?
                  </h4>
                  <p className='text-sm text-gray-700'>
                    A: Use the P&L report to find products with lowest margins
                    or slowest sales. Discontinue bottom 10% to free up capital
                    for high performers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer CTA */}
      <Card className='border-2 border-blue-200 bg-blue-50'>
        <CardContent className='flex flex-col items-start gap-4 pt-6 md:flex-row md:items-center md:justify-between'>
          <div>
            <h3 className='font-semibold text-gray-900'>Still Need Help?</h3>
            <p className='text-sm text-gray-600'>
              Search the knowledge base or watch our video tutorials
            </p>
          </div>
          <div className='flex gap-2'>
            <button
              onClick={() => handleTabChange('knowledge')}
              className='rounded-lg border-2 border-blue-500 px-4 py-2 font-semibold text-blue-600 transition-colors hover:bg-blue-50'
            >
              Search KB
            </button>
            <button
              onClick={() => handleTabChange('videos')}
              className='rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-600'
            >
              Watch Videos
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
