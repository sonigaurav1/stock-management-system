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
import { SubscriptionUpgrade } from './SubscriptionUpgrade';

const BillingSettings = () => {
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState<'free' | 'premium'>('free');

  return (
    <div className='space-y-6'>
      {/* Subscription Management */}
      <SubscriptionUpgrade
        currentPlan={currentPlan}
        onUpgradeComplete={() => setCurrentPlan('premium')}
      />
    </div>
  );
};

export default BillingSettings;
