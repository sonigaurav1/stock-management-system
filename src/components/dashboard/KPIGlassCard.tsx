/**
 * KPI Glass Card Component
 * Premium glassmorphism KPI card with animated counter and sparkline
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform, useInView } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { scaleOnHover, easings } from '@/lib/animations';

interface KPIGlassCardProps {
  title: string;
  value: number;
  change: number;
  sparklineData: number[];
  icon: LucideIcon;
  isCurrency?: boolean;
  onClick?: () => void;
  className?: string;
}

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 1) {
  const spring = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: duration * 1000
  });
  const rounded = useTransform(spring, (val) => Math.round(val));

  useEffect(() => {
    spring.set(target);
  }, [spring, target]);

  return rounded;
}

// Sparkline component
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Normalize data to SVG coordinates
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((val - min) / range) * 80 - 10; // 10% padding
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox='0 0 100 100'
      className='h-10 w-full overflow-visible'
      preserveAspectRatio='none'
    >
      <defs>
        <linearGradient
          id={`sparklineGradient-${positive ? 'up' : 'down'}`}
          x1='0%'
          y1='0%'
          x2='100%'
          y2='0%'
        >
          <stop offset='0%' stopColor={positive ? '#10b981' : '#f43f5e'} />
          <stop offset='100%' stopColor={positive ? '#34d399' : '#fb7185'} />
        </linearGradient>
      </defs>

      {/* Gradient fill under the line */}
      <motion.path
        d={`M0,100 L${points.replace(/ /g, ' L')} L100,100 Z`}
        fill={
          positive
            ? 'url(#sparklineGradientFillUp)'
            : 'url(#sparklineGradientFillDown)'
        }
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 0.5 }}
      />

      <defs>
        <linearGradient
          id='sparklineGradientFillUp'
          x1='0%'
          y1='0%'
          x2='0%'
          y2='100%'
        >
          <stop offset='0%' stopColor='#10b981' stopOpacity='0.3' />
          <stop offset='100%' stopColor='#10b981' stopOpacity='0' />
        </linearGradient>
        <linearGradient
          id='sparklineGradientFillDown'
          x1='0%'
          y1='0%'
          x2='0%'
          y2='100%'
        >
          <stop offset='0%' stopColor='#f43f5e' stopOpacity='0.3' />
          <stop offset='100%' stopColor='#f43f5e' stopOpacity='0' />
        </linearGradient>
      </defs>

      {/* Animated line */}
      <motion.polyline
        points={points}
        fill='none'
        stroke={`url(#sparklineGradient-${positive ? 'up' : 'down'})`}
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: easings.easeOut }}
      />

      {/* End dot */}
      <motion.circle
        cx={points.split(' ').pop()?.split(',')[0]}
        cy={points.split(' ').pop()?.split(',')[1]}
        r='3'
        fill={positive ? '#10b981' : '#f43f5e'}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      />
    </svg>
  );
}

export function KPIGlassCard({
  title,
  value,
  change,
  sparklineData,
  icon: Icon,
  isCurrency = false,
  onClick,
  className
}: KPIGlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const animatedValue = useAnimatedCounter(isInView ? value : 0, 1);

  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-emerald-600' : 'text-rose-600';
  const changeBg = isPositive ? 'bg-emerald-100' : 'bg-rose-100';

  const formatValue = (val: number) => {
    if (isCurrency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(val);
    }
    return new Intl.NumberFormat('en-US').format(val);
  };

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const unsubscribe = animatedValue.on('change', (v) => {
      setDisplayValue(v);
    });
    return unsubscribe;
  }, [animatedValue]);

  return (
    <motion.div
      ref={ref}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-slate-200/50 bg-white/80 p-6 backdrop-blur-md transition-shadow duration-300',
        'hover:shadow-lg hover:shadow-indigo-500/10 dark:border-slate-700/50 dark:bg-slate-900/80',
        onClick && 'cursor-pointer',
        className
      )}
      {...(onClick ? { onClick } : {})}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, ease: easings.easeOut }}
    >
      {/* Background gradient on hover */}
      <div className='absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-blue-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-5' />

      <div className='relative'>
        {/* Header */}
        <div className='mb-4 flex items-start justify-between'>
          <div>
            <p className='text-sm font-medium text-slate-500 dark:text-slate-400'>
              {title}
            </p>
            <motion.h3
              className='mt-1 font-mono text-3xl font-bold text-slate-900 dark:text-slate-100'
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {formatValue(displayValue)}
            </motion.h3>
          </div>

          <div className='rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'>
            <Icon className='h-5 w-5' />
          </div>
        </div>

        {/* Change indicator */}
        <div className='mb-4 flex items-center gap-2'>
          <Badge
            variant='secondary'
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              changeBg,
              changeColor
            )}
          >
            {isPositive ? '+' : ''}
            {change.toFixed(1)}%
          </Badge>
          <span className='text-xs text-slate-500 dark:text-slate-400'>
            vs last period
          </span>
        </div>

        {/* Sparkline */}
        <div className='mt-2'>
          <Sparkline data={sparklineData} positive={isPositive} />
        </div>
      </div>
    </motion.div>
  );
}

export default KPIGlassCard;
