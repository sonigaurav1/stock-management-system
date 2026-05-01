'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface KPIMetric {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
  subtext?: string;
  bgColor: string;
}

export function EnterpriseKPIDashboard() {
  // Mock data - replace with real data from your backend
  const kpiMetrics: KPIMetric[] = [
    {
      title: 'Total Revenue',
      value: '$2.45M',
      change: 12.5,
      trend: 'up',
      icon: <DollarSign className='h-6 w-6' />,
      subtext: 'vs last month',
      bgColor: 'from-emerald-500/10 to-teal-500/10'
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: 8.3,
      trend: 'up',
      icon: <Users className='h-6 w-6' />,
      subtext: 'this month',
      bgColor: 'from-blue-500/10 to-cyan-500/10'
    },
    {
      title: 'Total Orders',
      value: '5,890',
      change: -2.1,
      trend: 'down',
      icon: <ShoppingCart className='h-6 w-6' />,
      subtext: 'vs last month',
      bgColor: 'from-orange-500/10 to-red-500/10'
    },
    {
      title: 'Inventory Value',
      value: '$780K',
      change: 5.7,
      trend: 'up',
      icon: <Package className='h-6 w-6' />,
      subtext: 'current stock',
      bgColor: 'from-purple-500/10 to-pink-500/10'
    }
  ];

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>
          Dashboard Overview
        </h2>
        <p className='text-sm text-muted-foreground'>
          Real-time key performance indicators and business metrics
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {kpiMetrics.map((metric, index) => (
          <Card key={index} className='relative overflow-hidden'>
            <div
              className={`absolute inset-0 bg-gradient-to-br ${metric.bgColor}`}
            />
            <CardHeader className='relative z-10 flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {metric.title}
              </CardTitle>
              <div className='rounded-lg bg-background/50 p-2 backdrop-blur-sm'>
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent className='relative z-10'>
              <div className='text-2xl font-bold'>{metric.value}</div>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <Badge
                  variant={
                    metric.trend === 'up'
                      ? 'default'
                      : metric.trend === 'down'
                        ? 'destructive'
                        : 'secondary'
                  }
                  className='flex items-center gap-1'
                >
                  <TrendingUp className='h-3 w-3' />
                  {Math.abs(metric.change)}%
                </Badge>
                <span>{metric.subtext}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Summary Cards */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <CheckCircle className='h-5 w-5 text-green-500' />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <p className='text-2xl font-bold text-green-600'>Operational</p>
              <p className='text-xs text-muted-foreground'>
                All systems running normally
              </p>
              <div className='mt-3 flex items-center gap-2'>
                <div className='h-2 w-2 rounded-full bg-green-500' />
                <span className='text-xs'>99.9% Uptime</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Clock className='h-5 w-5 text-blue-500' />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <p className='text-2xl font-bold'>42</p>
              <p className='text-xs text-muted-foreground'>
                Requiring attention
              </p>
              <div className='mt-3 h-2 w-full rounded-full bg-secondary'>
                <div
                  className='h-2 rounded-full bg-blue-500'
                  style={{ width: '65%' }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <AlertCircle className='h-5 w-5 text-amber-500' />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <p className='text-2xl font-bold'>3</p>
              <p className='text-xs text-muted-foreground'>Active alerts</p>
              <div className='mt-3 space-y-1'>
                <p className='text-xs'>2 Warnings • 1 Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
