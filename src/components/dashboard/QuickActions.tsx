/**
 * Quick Actions Floating Action Button (FAB)
 * Accessible floating menu with arc animation
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ShoppingCart,
  Package,
  FileText,
  Receipt,
  X,
  Keyboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  shortcut: string;
  color: string;
  bgColor: string;
  onClick: () => void;
}

interface QuickActionsProps {
  actions?: QuickAction[];
  className?: string;
}

// Default actions
const defaultActions: QuickAction[] = [
  {
    id: 'sale',
    label: 'New Sale',
    icon: ShoppingCart,
    shortcut: '⌘+S',
    color: 'text-emerald-600',
    bgColor:
      'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20',
    onClick: () => console.log('New Sale')
  },
  {
    id: 'product',
    label: 'Add Product',
    icon: Package,
    shortcut: '⌘+P',
    color: 'text-blue-600',
    bgColor:
      'bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20',
    onClick: () => console.log('Add Product')
  },
  {
    id: 'invoice',
    label: 'Create Invoice',
    icon: FileText,
    shortcut: '⌘+I',
    color: 'text-violet-600',
    bgColor:
      'bg-violet-50 hover:bg-violet-100 dark:bg-violet-500/10 dark:hover:bg-violet-500/20',
    onClick: () => console.log('Create Invoice')
  },
  {
    id: 'expense',
    label: 'Record Expense',
    icon: Receipt,
    shortcut: '⌘+E',
    color: 'text-amber-600',
    bgColor:
      'bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20',
    onClick: () => console.log('Record Expense')
  }
];

// Arc animation variants
const menuVariants = {
  hidden: {
    opacity: 0,
    scale: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1
    }
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const itemVariants = (index: number, total: number) => {
  // Calculate arc position (spread in 90 degree arc)
  const startAngle = 200; // Start from bottom-left
  const arcRange = 100; // Spread over 100 degrees
  const angle = startAngle + (index / (total - 1)) * arcRange;
  const distance = 100; // Distance from center

  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;

  return {
    hidden: {
      opacity: 0,
      scale: 0,
      x: 0,
      y: 0
    },
    visible: {
      opacity: 1,
      scale: 1,
      x,
      y,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
        delay: index * 0.05
      }
    },
    exit: {
      opacity: 0,
      scale: 0,
      x: 0,
      y: 0,
      transition: {
        duration: 0.2,
        delay: (total - index - 1) * 0.03
      }
    }
  };
};

export function QuickActions({
  actions = defaultActions,
  className
}: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }

      // Handle shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            const saleAction = actions.find((a) => a.id === 'sale');
            saleAction?.onClick();
            break;
          case 'p':
            e.preventDefault();
            const productAction = actions.find((a) => a.id === 'product');
            productAction?.onClick();
            break;
          case 'i':
            e.preventDefault();
            const invoiceAction = actions.find((a) => a.id === 'invoice');
            invoiceAction?.onClick();
            break;
          case 'e':
            e.preventDefault();
            const expenseAction = actions.find((a) => a.id === 'expense');
            expenseAction?.onClick();
            break;
        }
      }
    },
    [actions]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <TooltipProvider delayDuration={100}>
      <div
        ref={containerRef}
        className={cn('fixed bottom-6 right-6 z-50', className)}
      >
        {/* Backdrop */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/20 backdrop-blur-sm'
              onClick={() => setIsOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Menu Items */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className='absolute bottom-0 right-0'
              variants={menuVariants}
              initial='hidden'
              animate='visible'
              exit='hidden'
            >
              {actions.map((action, index) => {
                const Icon = action.icon;
                const variants = itemVariants(index, actions.length);

                return (
                  <motion.div
                    key={action.id}
                    className='absolute bottom-7 right-7'
                    variants={variants}
                    initial='hidden'
                    animate='visible'
                    exit='exit'
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => {
                            action.onClick();
                            setIsOpen(false);
                          }}
                          className={cn(
                            'h-12 w-12 rounded-full shadow-lg transition-transform hover:scale-110',
                            action.bgColor,
                            action.color
                          )}
                          variant='ghost'
                        >
                          <Icon className='h-5 w-5' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side='left'
                        className='flex items-center gap-2'
                      >
                        <span>{action.label}</span>
                        <kbd className='rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
                          {action.shortcut}
                        </kbd>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                'relative flex h-14 w-14 items-center justify-center rounded-full',
                'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30',
                'transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                'dark:focus:ring-offset-slate-900'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isOpen ? (
                  <X className='h-6 w-6' />
                ) : (
                  <Plus className='h-6 w-6' />
                )}
              </motion.div>

              {/* Ripple effect */}
              {isOpen && (
                <motion.span
                  className='absolute inset-0 rounded-full bg-indigo-600'
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side='left'>
            <div className='flex items-center gap-2'>
              <span>Quick Actions</span>
              <kbd className='rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
                Q
              </kbd>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export default QuickActions;
