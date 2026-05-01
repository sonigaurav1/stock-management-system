'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  ArrowUp,
  ArrowDown,
  Users,
  Building2,
  Activity,
  AlertCircle
} from 'lucide-react';

const overviewMetrics = [
  {
    title: 'Total Companies',
    value: '2,847',
    change: '+12.5%',
    isPositive: true,
    icon: Building2,
    bgGradient: 'from-blue-500/20 to-blue-600/20'
  },
  {
    title: 'Active Users',
    value: '15,324',
    change: '+8.3%',
    isPositive: true,
    icon: Users,
    bgGradient: 'from-green-500/20 to-green-600/20'
  },
  {
    title: 'System Health',
    value: '99.9%',
    change: '+0.1%',
    isPositive: true,
    icon: Activity,
    bgGradient: 'from-emerald-500/20 to-emerald-600/20'
  },
  {
    title: 'Critical Issues',
    value: '3',
    change: '-2',
    isPositive: true,
    icon: AlertCircle,
    bgGradient: 'from-red-500/20 to-red-600/20'
  }
];

const platformGrowth = [
  { month: 'Jan', companies: 1200, users: 8000 },
  { month: 'Feb', companies: 1400, users: 9200 },
  { month: 'Mar', companies: 1600, users: 10500 },
  { month: 'Apr', companies: 1900, users: 12100 },
  { month: 'May', companies: 2300, users: 13800 },
  { month: 'Jun', companies: 2847, users: 15324 }
];

const subscriptionBreakdown = [
  { name: 'Free', value: 850, color: '#3b82f6' },
  { name: 'Starter', value: 920, color: '#8b5cf6' },
  { name: 'Professional', value: 750, color: '#ec4899' },
  { name: 'Enterprise', value: 327, color: '#f59e0b' }
];

const regionStats = [
  { region: 'North America', companies: 1200, users: 6500 },
  { region: 'Europe', companies: 980, users: 5200 },
  { region: 'Asia Pacific', companies: 450, users: 2400 },
  { region: 'Latin America', companies: 130, users: 800 },
  { region: 'Other', companies: 87, users: 424 }
];

export function SuperAdminOverview() {
  return (
    <div className='space-y-6'>
      {/* Metrics Grid */}
      <div className='grid gap-4 md:grid-cols-4'>
        {overviewMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className='border-0 shadow-sm'>
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>
                    {metric.title}
                  </CardTitle>
                  <div
                    className={`rounded-lg bg-gradient-to-br ${metric.bgGradient} p-2.5`}
                  >
                    <Icon className='h-4 w-4 text-foreground' />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='text-2xl font-bold'>{metric.value}</div>
                  <div className='flex items-center gap-1'>
                    {metric.isPositive ? (
                      <ArrowUp className='h-3 w-3 text-green-500' />
                    ) : (
                      <ArrowDown className='h-3 w-3 text-red-500' />
                    )}
                    <span
                      className={
                        metric.isPositive ? 'text-green-500' : 'text-red-500'
                      }
                    >
                      {metric.change}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      vs last month
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className='grid gap-4 lg:grid-cols-2'>
        {/* Platform Growth */}
        <Card className='border-0 shadow-sm'>
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={platformGrowth}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='hsl(var(--border))'
                />
                <XAxis dataKey='month' stroke='hsl(var(--muted-foreground))' />
                <YAxis stroke='hsl(var(--muted-foreground))' />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='companies'
                  stroke='#3b82f6'
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  name='Companies'
                />
                <Line
                  type='monotone'
                  dataKey='users'
                  stroke='#8b5cf6'
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  name='Users'
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscription Breakdown */}
        <Card className='border-0 shadow-sm'>
          <CardHeader>
            <CardTitle>Subscription Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={subscriptionBreakdown}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {subscriptionBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Regional Distribution */}
      <Card className='border-0 shadow-sm'>
        <CardHeader>
          <CardTitle>Regional Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={regionStats}>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='hsl(var(--border))'
              />
              <XAxis dataKey='region' stroke='hsl(var(--muted-foreground))' />
              <YAxis stroke='hsl(var(--muted-foreground))' />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Bar dataKey='companies' fill='#3b82f6' name='Companies' />
              <Bar dataKey='users' fill='#8b5cf6' name='Users' />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
