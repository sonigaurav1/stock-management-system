/**
 * Operations Analytics Tab
 * Stock reconciliation
 */

'use client';

import { motion } from 'motion/react';
import { FileCheck } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fadeInUp, staggerContainer } from '@/lib/animations';

import { StockReconciliation } from '../StockReconciliation';

export default function OperationsTab() {
  return (
    <motion.div
      variants={staggerContainer}
      initial='initial'
      animate='animate'
      className='space-y-6'
    >
      <motion.div variants={fadeInUp}>
        <Card className='border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-lg font-semibold'>
                  Stock Reconciliation
                </CardTitle>
                <CardDescription>
                  Match physical and system inventory
                </CardDescription>
              </div>
              <Badge className='bg-emerald-100 text-emerald-700'>
                <FileCheck className='mr-1 h-3 w-3' />
                Physical count
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <StockReconciliation />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
