import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { ChevronRight, CheckCircle, Circle } from 'lucide-react';

interface SetupStep {
  id: number;
  title: string;
  description: string;
  action: string;
  icon: string;
  completed: boolean;
  estimatedTime: string;
}

/**
 * SetupWizard Component
 * Guided 10-minute setup for first-time users
 * Helps non-technical business owners get started
 */
export const SetupWizard: React.FC<{
  onComplete?: () => void;
  initialSteps?: SetupStep[];
}> = ({ onComplete, initialSteps }) => {
  const [steps, setSteps] = useState<SetupStep[]>(
    initialSteps || [
      {
        id: 1,
        title: 'Add Your Products',
        description:
          'Start by adding your top 5-10 products that you sell most frequently',
        action: 'Add Products',
        icon: '📦',
        completed: false,
        estimatedTime: '3 min'
      },
      {
        id: 2,
        title: 'Set Your Suppliers',
        description:
          'Add your main suppliers so we can track purchases and payables',
        action: 'Add Suppliers',
        icon: '🏭',
        completed: false,
        estimatedTime: '2 min'
      },
      {
        id: 3,
        title: 'Customize Dashboard',
        description:
          'Choose which metrics are most important for your business',
        action: 'Customize Dashboard',
        icon: '📊',
        completed: false,
        estimatedTime: '2 min'
      },
      {
        id: 4,
        title: 'Record First Sale',
        description: 'Create your first sale to see how the system works',
        action: 'Record Sale',
        icon: '💰',
        completed: false,
        estimatedTime: '2 min'
      },
      {
        id: 5,
        title: 'Explore Reports',
        description: 'Check out your first P&L and Cash Flow reports',
        action: 'View Reports',
        icon: '📈',
        completed: false,
        estimatedTime: '1 min'
      }
    ]
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [modalOpen, setModalOpen] = useState(true);

  const completedCount = steps.filter((s) => s.completed).length;
  const completionPercentage = Math.round(
    (completedCount / steps.length) * 100
  );

  const handleStepComplete = (stepId: number) => {
    setSteps(
      steps.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
    if (completedCount === steps.length - 1 && onComplete) {
      onComplete();
    }
  };

  if (!modalOpen) {
    return (
      <button
        onClick={() => setModalOpen(true)}
        className='fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-3 font-semibold text-white shadow-lg hover:bg-blue-600'
      >
        <span>📋</span>
        Setup Guide ({completionPercentage}%)
      </button>
    );
  }

  const activeStep = steps[currentStep];

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
      <Card className='w-full max-w-2xl'>
        <CardHeader className='pb-3'>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <CardTitle className='text-2xl'>
                Welcome! Let's Get You Started 👋
              </CardTitle>
              <CardDescription>
                Quick setup guide to get the most out of your business dashboard
                (10 minutes)
              </CardDescription>
            </div>
            <button
              onClick={() => setModalOpen(false)}
              className='text-2xl font-bold text-gray-400 hover:text-gray-600'
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className='h-2 w-full rounded-full bg-gray-200'>
            <div
              className='h-2 rounded-full bg-blue-500 transition-all duration-300'
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className='mt-2 text-sm text-gray-600'>
            {completedCount} of {steps.length} completed ({completionPercentage}
            %)
          </p>
        </CardHeader>

        <CardContent>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            {/* Steps List */}
            <div className='lg:col-span-1'>
              <h3 className='mb-3 font-semibold text-gray-900'>Setup Steps</h3>
              <div className='space-y-2'>
                {steps.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(idx)}
                    className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                      step.completed
                        ? 'border-green-200 bg-green-50'
                        : currentStep === idx
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className='flex items-start gap-2'>
                      {step.completed ? (
                        <CheckCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600' />
                      ) : (
                        <Circle className='mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400' />
                      )}
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-semibold text-gray-900'>
                          {step.title}
                        </p>
                        <p className='mt-1 text-xs text-gray-600'>
                          {step.estimatedTime}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Step Details */}
            <div className='lg:col-span-2'>
              <div className='rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6'>
                <div className='mb-4 text-5xl'>{activeStep.icon}</div>
                <h2 className='mb-2 text-2xl font-bold text-gray-900'>
                  {activeStep.title}
                </h2>
                <p className='mb-6 leading-relaxed text-gray-700'>
                  {activeStep.description}
                </p>

                {/* Step-specific guidance */}
                <div className='mb-6 rounded-lg border border-gray-200 bg-white p-4'>
                  {activeStep.id === 1 && (
                    <div className='space-y-2 text-sm'>
                      <p className='font-semibold text-gray-900'>
                        💡 Quick tip:
                      </p>
                      <ul className='list-inside list-disc space-y-1 text-gray-700'>
                        <li>Include product name, SKU, and cost price</li>
                        <li>Set the selling price higher than cost price</li>
                        <li>You can add more products later anytime</li>
                      </ul>
                    </div>
                  )}
                  {activeStep.id === 2 && (
                    <div className='space-y-2 text-sm'>
                      <p className='font-semibold text-gray-900'>
                        💡 Quick tip:
                      </p>
                      <ul className='list-inside list-disc space-y-1 text-gray-700'>
                        <li>Add your 2-3 main suppliers</li>
                        <li>Include their contact info and payment terms</li>
                        <li>This helps track what you owe them</li>
                      </ul>
                    </div>
                  )}
                  {activeStep.id === 3 && (
                    <div className='space-y-2 text-sm'>
                      <p className='font-semibold text-gray-900'>
                        💡 Quick tip:
                      </p>
                      <ul className='list-inside list-disc space-y-1 text-gray-700'>
                        <li>Choose widgets that matter to your business</li>
                        <li>Drag to reorder them how you like</li>
                        <li>You can always change these later</li>
                      </ul>
                    </div>
                  )}
                  {activeStep.id === 4 && (
                    <div className='space-y-2 text-sm'>
                      <p className='font-semibold text-gray-900'>
                        💡 Quick tip:
                      </p>
                      <ul className='list-inside list-disc space-y-1 text-gray-700'>
                        <li>Record an actual sale from today</li>
                        <li>Choose a product and customer</li>
                        <li>The system will calculate profit automatically</li>
                      </ul>
                    </div>
                  )}
                  {activeStep.id === 5 && (
                    <div className='space-y-2 text-sm'>
                      <p className='font-semibold text-gray-900'>
                        💡 Quick tip:
                      </p>
                      <ul className='list-inside list-disc space-y-1 text-gray-700'>
                        <li>Check Profit & Loss to see your margins</li>
                        <li>Review Cash Flow to understand receivables</li>
                        <li>Read tooltips for explanations of metrics</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className='flex gap-3'>
                  <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className='flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => handleStepComplete(activeStep.id)}
                    className='flex-1 rounded-lg bg-green-500 px-4 py-2 font-semibold text-white hover:bg-green-600'
                  >
                    {activeStep.completed ? '✓ Completed' : `✓ Mark Complete`}
                  </button>
                  <button
                    onClick={() =>
                      setCurrentStep(
                        Math.min(steps.length - 1, currentStep + 1)
                      )
                    }
                    disabled={currentStep === steps.length - 1}
                    className='flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    Next <ChevronRight className='h-4 w-4' />
                  </button>
                </div>
              </div>

              {/* Skip Option */}
              <button
                onClick={() => setModalOpen(false)}
                className='mt-4 w-full text-center text-sm text-gray-600 hover:text-gray-900'
              >
                I'll do this later
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Setup Progress Indicator
 * Minimal version for embedding in dashboard
 */
export const SetupProgressIndicator: React.FC<{
  completedSteps: number;
  totalSteps: number;
  onOpenWizard?: () => void;
}> = ({ completedSteps, totalSteps, onOpenWizard }) => {
  const percentage = Math.round((completedSteps / totalSteps) * 100);

  if (completedSteps === totalSteps) {
    return null; // Don't show when complete
  }

  return (
    <Card className='border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50'>
      <CardContent className='pt-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='font-semibold text-gray-900'>🎯 Setup Guide</h3>
            <p className='mt-1 text-sm text-gray-600'>
              Complete {totalSteps - completedSteps} more steps to get started
            </p>
          </div>
          <div className='text-right'>
            <div className='text-2xl font-bold text-blue-600'>
              {percentage}%
            </div>
            <button
              onClick={onOpenWizard}
              className='mt-2 rounded bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600'
            >
              Continue Setup
            </button>
          </div>
        </div>
        <div className='mt-4 h-2 w-full rounded-full bg-gray-200'>
          <div
            className='h-2 rounded-full bg-blue-500 transition-all duration-300'
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};
