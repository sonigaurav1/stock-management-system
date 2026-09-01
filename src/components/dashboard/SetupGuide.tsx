/**
 * Setup Guide / Onboarding Checklist Component
 * Progressive onboarding with confetti celebration
 */

'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { staggerContainer, fadeInUp, checkmark } from '@/lib/animations';

interface SetupItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  estimatedTime: string;
  completed: boolean;
}

interface SetupGuideProps {
  className?: string;
  onComplete?: () => void;
}

// Confetti particle component
function ConfettiPiece({ color, index }: { color: string; index: number }) {
  const angle = Math.random() * 360;
  const distance = 100 + Math.random() * 200;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  const rotation = Math.random() * 720 - 360;
  const size = 8 + Math.random() * 8;

  return (
    <motion.div
      className='absolute left-1/2 top-1/2 rounded-sm'
      style={{
        backgroundColor: color,
        width: size,
        height: size
      }}
      initial={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }}
      animate={{
        x,
        y: [y, y + 150 + Math.random() * 100],
        scale: [1, 0.5, 0],
        rotate: rotation,
        opacity: [1, 1, 0]
      }}
      transition={{
        duration: 1.2 + Math.random() * 0.5,
        ease: [0.4, 0, 0.2, 1],
        delay: index * 0.02
      }}
    />
  );
}

// Confetti celebration
function Confetti({ show }: { show: boolean }) {
  const colors = [
    '#6366f1',
    '#10b981',
    '#f59e0b',
    '#f43f5e',
    '#8b5cf6',
    '#ec4899'
  ];

  if (!show) return null;

  return (
    <div className='pointer-events-none fixed inset-0 z-50 overflow-hidden'>
      <div className='absolute left-1/2 top-1/3'>
        {Array.from({ length: 50 }).map((_, i) => (
          <ConfettiPiece key={i} color={colors[i % colors.length]} index={i} />
        ))}
      </div>
    </div>
  );
}

// Animated check icon
function AnimatedCheck({ completed }: { completed: boolean }) {
  return (
    <motion.div
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors duration-300',
        completed
          ? 'border-emerald-500 bg-emerald-500'
          : 'border-slate-300 bg-transparent'
      )}
      initial={false}
      animate={completed ? { scale: [1, 1.2, 1] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {completed && (
        <motion.svg
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='3'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='h-3.5 w-3.5 text-white'
        >
          <motion.path
            d='M5 12l5 5L20 7'
            variants={checkmark}
            initial='initial'
            animate='animate'
          />
        </motion.svg>
      )}
    </motion.div>
  );
}

export function SetupGuide({ className, onComplete }: SetupGuideProps) {
  const [items, setItems] = useState<SetupItem[]>([
    {
      id: '1',
      icon: Building2,
      title: 'Complete business profile',
      description: 'Add your company details and logo',
      estimatedTime: '2 min',
      completed: true
    },
    {
      id: '2',
      icon: Package,
      title: 'Add first product',
      description: 'Create your first inventory item',
      estimatedTime: '3 min',
      completed: true
    },
    {
      id: '3',
      icon: ShoppingCart,
      title: 'Create first sale',
      description: 'Record your first transaction',
      estimatedTime: '2 min',
      completed: false
    },
    {
      id: '4',
      icon: Users,
      title: 'Invite team member',
      description: 'Add a colleague to your workspace',
      estimatedTime: '1 min',
      completed: false
    },
    {
      id: '5',
      icon: CreditCard,
      title: 'Connect bank account',
      description: 'Link your financial accounts',
      estimatedTime: '5 min',
      completed: false
    }
  ]);

  const [showConfetti, setShowConfetti] = useState(false);

  const toggleItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        const newItems = prev.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item
        );

        // Check if all completed
        const allCompleted = newItems.every((item) => item.completed);
        if (allCompleted) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
          onComplete?.();
        }

        return newItems;
      });
    },
    [onComplete]
  );

  const completedCount = items.filter((item) => item.completed).length;
  const progress = (completedCount / items.length) * 100;
  const currentStep =
    items.findIndex((item) => !item.completed) + 1 || items.length;

  return (
    <>
      <Confetti show={showConfetti} />
      <Card
        className={cn(
          'overflow-hidden border-slate-200/50 bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-md',
          'dark:border-slate-700/50 dark:from-slate-900/80 dark:to-slate-800/50',
          className
        )}
      >
        <CardHeader className='pb-4'>
          <div className='flex items-start justify-between'>
            <div>
              <CardTitle className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
                Getting Started
              </CardTitle>
              <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
                Complete these steps to set up your workspace
              </p>
            </div>
            <div className='flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 dark:bg-indigo-500/10'>
              <Sparkles className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
              <span className='text-xs font-medium text-indigo-700 dark:text-indigo-300'>
                Step {currentStep} of {items.length}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className='mt-4 space-y-2'>
            <div className='flex justify-between text-xs'>
              <span className='text-slate-500 dark:text-slate-400'>
                {completedCount} of {items.length} completed
              </span>
              <span className='font-medium text-slate-900 dark:text-slate-100'>
                {Math.round(progress)}%
              </span>
            </div>
            <div className='h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700'>
              <motion.div
                className='h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500'
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className='pt-0'>
          <motion.div
            className='space-y-2'
            variants={staggerContainer}
            initial='initial'
            animate='animate'
          >
            {items.map((item, index) => {
              const Icon = item.icon;
              const isCurrent = !item.completed && items[index - 1]?.completed;
              const isPending = !item.completed && !isCurrent;

              return (
                <motion.div
                  key={item.id}
                  variants={fadeInUp}
                  className={cn(
                    'group relative rounded-xl border-2 p-4 transition-all duration-300',
                    item.completed
                      ? 'border-transparent bg-slate-100/50 dark:bg-slate-800/30'
                      : isCurrent
                        ? 'border-indigo-200 bg-indigo-50/30 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500/10'
                        : 'border-transparent bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  )}
                >
                  {/* Pulsing border for current item */}
                  {isCurrent && (
                    <motion.div
                      className='absolute inset-0 rounded-xl border-2 border-indigo-400'
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  <div className='relative flex items-start gap-4'>
                    <button
                      onClick={() => toggleItem(item.id)}
                      className='mt-0.5 flex-shrink-0 focus:outline-none'
                    >
                      <AnimatedCheck completed={item.completed} />
                    </button>

                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            item.completed
                              ? 'text-slate-400'
                              : 'text-indigo-600 dark:text-indigo-400'
                          )}
                        />
                        <h4
                          className={cn(
                            'font-medium',
                            item.completed
                              ? 'text-slate-500 line-through dark:text-slate-500'
                              : 'text-slate-900 dark:text-slate-100'
                          )}
                        >
                          {item.title}
                        </h4>
                      </div>
                      <p
                        className={cn(
                          'mt-1 text-sm',
                          item.completed
                            ? 'text-slate-400'
                            : 'text-slate-600 dark:text-slate-400'
                        )}
                      >
                        {item.description}
                      </p>
                      <div className='mt-2 flex items-center gap-2'>
                        <span className='text-xs text-slate-400'>
                          ~{item.estimatedTime}
                        </span>
                      </div>
                    </div>

                    {isCurrent && (
                      <Button
                        size='sm'
                        className='flex-shrink-0 bg-indigo-600 hover:bg-indigo-700'
                        onClick={() => toggleItem(item.id)}
                      >
                        Continue
                        <ChevronRight className='ml-1 h-4 w-4' />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>
    </>
  );
}

export default SetupGuide;
