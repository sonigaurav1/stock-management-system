/**
 * AI Assistant Panel
 * Premium slide-in chat panel powered by Google Gemini (free tier)
 * Triggered from the AI Assistant button in PremiumHeader
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useChat } from 'ai/react';

interface Message {
  id: string;
  role: string;
  content: string;
}
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Send,
  User,
  Bot,
  RotateCcw,
  Loader2,
  Zap,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AIAssistantPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface QuickPrompt {
  label: string;
  prompt: string;
  icon: string;
}

// ─── Context-aware quick prompts per page ─────────────────────────────────────

const PAGE_PROMPTS: Record<string, QuickPrompt[]> = {
  '/dashboard': [
    {
      icon: '📊',
      label: 'Business summary',
      prompt:
        'Give me a quick summary of my business health and key metrics I should focus on today.'
    },
    {
      icon: '⚠️',
      label: 'Urgent actions',
      prompt:
        'What are the most urgent actions I need to take right now for my business?'
    },
    {
      icon: '📈',
      label: 'Growth tips',
      prompt:
        'What are some actionable tips to grow my inventory business this month?'
    }
  ],
  '/inventory': [
    {
      icon: '🔴',
      label: 'Low stock alerts',
      prompt:
        'Which products are running low on stock and need immediate attention?'
    },
    {
      icon: '📦',
      label: 'Reorder suggestions',
      prompt:
        'Which products should I reorder soon based on typical stock management best practices?'
    },
    {
      icon: '🏷️',
      label: 'Overstock items',
      prompt:
        'How do I identify and handle overstocked products to free up capital?'
    }
  ],
  '/inventory-forecast': [
    {
      icon: '🔮',
      label: 'Demand forecast',
      prompt:
        'How does demand forecasting work and what factors should I consider for my inventory?'
    },
    {
      icon: '📉',
      label: 'Prevent stockouts',
      prompt:
        'What strategies can I use to prevent stockouts without over-investing in inventory?'
    },
    {
      icon: '🎯',
      label: 'Safety stock',
      prompt: 'How do I calculate the right safety stock level for my products?'
    }
  ],
  '/sales': [
    {
      icon: '💰',
      label: "Today's revenue",
      prompt:
        'What should I track daily to understand my sales revenue performance?'
    },
    {
      icon: '🏆',
      label: 'Top products',
      prompt:
        'How do I identify my best-performing products and double down on them?'
    },
    {
      icon: '📅',
      label: 'Sales trends',
      prompt:
        'What are common seasonal sales trends in retail inventory management?'
    }
  ],
  '/invoice': [
    {
      icon: '📄',
      label: 'Invoice tips',
      prompt:
        'What are best practices for managing invoices and getting paid faster?'
    },
    {
      icon: '🔄',
      label: 'Overdue invoices',
      prompt:
        'How should I handle overdue invoices and improve collection rates?'
    },
    {
      icon: '💡',
      label: 'Invoice automation',
      prompt: 'How can I automate my invoicing process to save time?'
    }
  ],
  '/restock': [
    {
      icon: '🚀',
      label: 'Restock strategy',
      prompt: 'What is the best strategy for restocking inventory efficiently?'
    },
    {
      icon: '🤝',
      label: 'Supplier tips',
      prompt: 'How do I negotiate better terms with suppliers for restocking?'
    },
    {
      icon: '⏱️',
      label: 'Lead times',
      prompt:
        'How do I factor in supplier lead times when planning my restock orders?'
    }
  ],
  '/ledger': [
    {
      icon: '📒',
      label: 'Ledger overview',
      prompt:
        'What key metrics should I track in my business ledger for financial health?'
    },
    {
      icon: '💸',
      label: 'Cash flow tips',
      prompt: 'How do I improve cash flow management for my inventory business?'
    },
    {
      icon: '🔍',
      label: 'Expense analysis',
      prompt:
        'What are the main expense categories I should monitor closely in inventory management?'
    }
  ],
  '/reports': [
    {
      icon: '📊',
      label: 'Key reports',
      prompt:
        'Which reports are most important for an inventory business owner to review weekly?'
    },
    {
      icon: '📈',
      label: 'Performance KPIs',
      prompt:
        'What KPIs should I track to measure my inventory business performance?'
    },
    {
      icon: '🗓️',
      label: 'Monthly review',
      prompt:
        'Walk me through a monthly business review checklist for an inventory business.'
    }
  ]
};

const DEFAULT_PROMPTS: QuickPrompt[] = [
  {
    icon: '✨',
    label: 'What can you do?',
    prompt: 'What can you help me with as Invento AI assistant?'
  },
  {
    icon: '📦',
    label: 'Inventory tips',
    prompt:
      'What are the top 5 inventory management best practices for a growing business?'
  },
  {
    icon: '🚀',
    label: 'Get started',
    prompt:
      "I'm new to Invento. How do I get the most out of it for managing my stock?"
  }
];

function getPromptsForPath(pathname: string): QuickPrompt[] {
  for (const key of Object.keys(PAGE_PROMPTS)) {
    if (pathname === key || pathname.startsWith(key + '/')) {
      return PAGE_PROMPTS[key];
    }
  }
  return DEFAULT_PROMPTS;
}

function getPageLabel(pathname: string): string {
  const map: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/inventory': 'Inventory',
    '/inventory-forecast': 'Inventory Forecast',
    '/inventory-audit': 'Inventory Audit',
    '/sales': 'Sales',
    '/invoice': 'Invoices',
    '/invoice-generation': 'Invoice Generator',
    '/restock': 'Restock',
    '/ledger': 'Ledger',
    '/reports': 'Reports',
    '/locations': 'Locations',
    '/expenses': 'Expenses',
    '/settings': 'Settings'
  };
  for (const key of Object.keys(map)) {
    if (pathname === key || pathname.startsWith(key + '/')) return map[key];
  }
  return 'Invento';
}

// ─── Typing Dots Animation ─────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className='flex items-center gap-1 px-1 py-0.5'>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className='block h-1.5 w-1.5 rounded-full bg-violet-400'
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

// ─── Message Bubble ────────────────────────────────────────────────────────

function MessageBubble({ role, content }: { role: string; content: string }) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('flex gap-2.5', isUser && 'flex-row-reverse')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white',
          isUser
            ? 'bg-gradient-to-br from-slate-600 to-slate-800'
            : 'bg-gradient-to-br from-violet-600 to-indigo-600'
        )}
      >
        {isUser ? (
          <User className='h-3.5 w-3.5' />
        ) : (
          <Bot className='h-3.5 w-3.5' />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'rounded-tr-sm bg-violet-600 text-white'
            : 'rounded-tl-sm border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
        )}
      >
        {/* Render markdown-lite: bold, line breaks */}
        {content.split('\n').map((line, i) => {
          const boldified = line.replace(
            /\*\*(.*?)\*\*/g,
            '<strong>$1</strong>'
          );
          return (
            <p
              key={i}
              className={cn(i > 0 && 'mt-1.5', 'whitespace-pre-wrap')}
              dangerouslySetInnerHTML={{ __html: boldified }}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Main Panel ────────────────────────────────────────────────────────────

export function AIAssistantPanel({
  open,
  onOpenChange
}: AIAssistantPanelProps) {
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickPrompts = getPromptsForPath(pathname);
  const pageLabel = getPageLabel(pathname);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    setMessages,
    setInput
  } = useChat({
    api: '/api/ai-assistant',
    body: {
      context: {
        page: pathname,
        pageTitle: pageLabel
      }
    }
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Auto-scroll to bottom on new messages, loading state, or errors
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, error, scrollToBottom]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const handleQuickPrompt = useCallback(
    (prompt: string) => {
      setInput(prompt);
      setTimeout(() => {
        const fakeEvent = {
          preventDefault: () => {}
        } as React.FormEvent<HTMLFormElement>;
        handleSubmit(fakeEvent, {
          body: { context: { page: pathname, pageTitle: pageLabel } }
        });
      }, 50);
    },
    [handleSubmit, pathname, pageLabel, setInput]
  );

  const handleClear = () => setMessages([]);

  const hasMessages = messages.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='flex w-full flex-col gap-0 border-l border-slate-200/60 bg-slate-50 p-0 dark:border-slate-800/60 dark:bg-slate-950 sm:max-w-[420px]'
      >
        {/* ── Panel Header ── */}
        <SheetHeader className='shrink-0 border-b border-slate-200/60 bg-white/80 px-5 py-4 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2.5'>
              <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm shadow-violet-500/30'>
                <Sparkles className='h-4 w-4 text-white' />
              </div>
              <div>
                <SheetTitle className='text-sm font-semibold text-slate-900 dark:text-slate-50'>
                  AI Assistant
                </SheetTitle>
                <SheetDescription className='text-xs text-slate-500 dark:text-slate-400'>
                  On{' '}
                  <span className='font-medium text-violet-600 dark:text-violet-400'>
                    {pageLabel}
                  </span>
                </SheetDescription>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Badge
                variant='secondary'
                className='hidden items-center gap-1 border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] text-violet-700 dark:border-violet-800/50 dark:bg-violet-950/50 dark:text-violet-300 sm:flex'
              >
                <Zap className='h-2.5 w-2.5' />
                Premium
              </Badge>
              {hasMessages && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  onClick={handleClear}
                  title='Clear conversation'
                >
                  <RotateCcw className='h-3.5 w-3.5' />
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* ── Messages Area ── */}
        <ScrollArea className='flex-1 overflow-y-auto'>
          <div className='flex flex-col gap-4 px-4 py-5'>
            {/* Welcome / Quick Prompts (shown when no messages) */}
            <AnimatePresence>
              {!hasMessages && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className='flex flex-col gap-4'
                >
                  {/* Welcome card */}
                  <div className='rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-4 dark:border-violet-900/40 dark:from-violet-950/30 dark:to-indigo-950/30'>
                    <div className='mb-1 flex items-center gap-2'>
                      <Sparkles className='h-4 w-4 text-violet-500' />
                      <span className='text-sm font-semibold text-violet-800 dark:text-violet-200'>
                        Hello! I&apos;m Invento AI
                      </span>
                    </div>
                    <p className='text-xs leading-relaxed text-violet-700/80 dark:text-violet-300/70'>
                      Ask me anything about your inventory, sales, invoices, or
                      business strategy. I&apos;m here to help.
                    </p>
                  </div>

                  {/* Quick prompts */}
                  <div>
                    <p className='mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
                      Suggestions for {pageLabel}
                    </p>
                    <div className='flex flex-col gap-2'>
                      {quickPrompts.map((qp) => (
                        <button
                          key={qp.label}
                          onClick={() => handleQuickPrompt(qp.prompt)}
                          className='group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left transition-all hover:border-violet-200 hover:bg-violet-50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-800/60 dark:hover:bg-violet-950/20'
                        >
                          <span className='text-base'>{qp.icon}</span>
                          <span className='text-xs font-medium text-slate-700 group-hover:text-violet-700 dark:text-slate-300 dark:group-hover:text-violet-300'>
                            {qp.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message history */}
            {messages.map((m: Message) => (
              <MessageBubble key={m.id} role={m.role} content={m.content} />
            ))}

            {/* Typing indicator */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className='flex gap-2.5'
                >
                  <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white'>
                    <Bot className='h-3.5 w-3.5' />
                  </div>
                  <div className='rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800'>
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Invisible anchor element for auto-scroll */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* ── Input Area ── */}
        <div className='shrink-0 border-t border-slate-200/60 bg-white/80 p-4 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80'>
          <form onSubmit={handleSubmit} className='flex items-end gap-2'>
            <Input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder='Ask anything about your business…'
              disabled={isLoading}
              className='flex-1 resize-none rounded-xl border-slate-200 bg-slate-50 text-sm placeholder:text-slate-400 focus-visible:ring-violet-500 dark:border-slate-700 dark:bg-slate-800'
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!input.trim() || isLoading) return;
                  handleSubmit(
                    e as unknown as React.FormEvent<HTMLFormElement>
                  );
                  setTimeout(scrollToBottom, 100);
                }
              }}
            />
            <Button
              type='submit'
              size='icon'
              disabled={isLoading || !input.trim()}
              className='h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-500/30 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50'
            >
              {isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Send className='h-4 w-4' />
              )}
            </Button>
          </form>
          {/* <p className='mt-2 text-center text-[10px] text-slate-400'>
            Press{' '}
            <kbd className='rounded border border-slate-200 bg-slate-100 px-1 font-mono text-[9px] dark:border-slate-700 dark:bg-slate-800'>
              Enter
            </kbd>{' '}
            to send
          </p> */}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default AIAssistantPanel;
