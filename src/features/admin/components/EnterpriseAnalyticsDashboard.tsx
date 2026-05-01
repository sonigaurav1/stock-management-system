'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

const revenueData = [
  { month: 'Jan', revenue: 45000, orders: 240, customers: 1200 },
  { month: 'Feb', revenue: 52000, orders: 290, customers: 1400 },
  { month: 'Mar', revenue: 48000, orders: 280, customers: 1300 },
  { month: 'Apr', revenue: 61000, orders: 340, customers: 1600 },
  { month: 'May', revenue: 55000, orders: 310, customers: 1500 },
  { month: 'Jun', revenue: 67000, orders: 380, customers: 1800 }
];

const categoryData = [
  { name: 'Electronics', value: 35, fill: '#3b82f6' },
  { name: 'Clothing', value: 25, fill: '#10b981' },
  { name: 'Home & Garden', value: 20, fill: '#f59e0b' },
  { name: 'Books', value: 15, fill: '#8b5cf6' },
  { name: 'Other', value: 5, fill: '#ef4444' }
];

const userActivityData = [
  { hour: '00:00', users: 120, sessions: 80 },
  { hour: '04:00', users: 45, sessions: 30 },
  { hour: '08:00', users: 230, sessions: 150 },
  { hour: '12:00', users: 450, sessions: 280 },
  { hour: '16:00', users: 520, sessions: 320 },
  { hour: '20:00', users: 380, sessions: 220 }
];

export function EnterpriseAnalyticsDashboard() {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold tracking-tight'>Analytics</h2>
        <p className='text-sm text-muted-foreground'>
          Business performance and market insights
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Revenue Trend */}
        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='month' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='revenue'
                  stroke='#3b82f6'
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name='Revenue ($)'
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders vs Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Orders vs Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='month' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='orders' fill='#10b981' name='Orders' />
                <Bar dataKey='customers' fill='#f59e0b' name='Customers' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Activity */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={250}>
            <BarChart data={userActivityData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='hour' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey='users' fill='#3b82f6' name='Active Users' />
              <Bar dataKey='sessions' fill='#8b5cf6' name='Sessions' />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-3xl font-bold'>87%</p>
              <p className='mt-2 text-xs text-muted-foreground'>
                Conversion Rate
              </p>
              <Badge className='mt-3' variant='outline'>
                +2.1%
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-3xl font-bold'>$456</p>
              <p className='mt-2 text-xs text-muted-foreground'>
                Avg Order Value
              </p>
              <Badge className='mt-3' variant='outline'>
                +5.2%
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-3xl font-bold'>3.2d</p>
              <p className='mt-2 text-xs text-muted-foreground'>
                Avg Delivery Time
              </p>
              <Badge className='mt-3' variant='outline'>
                -0.5d
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-3xl font-bold'>94%</p>
              <p className='mt-2 text-xs text-muted-foreground'>
                Customer Satisfaction
              </p>
              <Badge className='mt-3' variant='outline'>
                +1.3%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
