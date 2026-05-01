'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  Database,
  HardDrive,
  Zap,
  Clock,
  Shield,
  AlertTriangle
} from 'lucide-react';

const serverMetrics = [
  { time: '00:00', cpu: 35, memory: 45, requests: 1200 },
  { time: '04:00', cpu: 28, memory: 38, requests: 900 },
  { time: '08:00', cpu: 52, memory: 62, requests: 2100 },
  { time: '12:00', cpu: 68, memory: 75, requests: 3200 },
  { time: '16:00', cpu: 45, memory: 55, requests: 2400 },
  { time: '20:00', cpu: 38, memory: 48, requests: 1800 },
  { time: '24:00', cpu: 32, memory: 42, requests: 1100 }
];

const apiPerformance = [
  { endpoint: '/api/companies', avgTime: 145, errorRate: 0.2, requests: 12500 },
  { endpoint: '/api/users', avgTime: 98, errorRate: 0.1, requests: 18300 },
  {
    endpoint: '/api/transactions',
    avgTime: 245,
    errorRate: 0.5,
    requests: 8900
  },
  { endpoint: '/api/reports', avgTime: 1200, errorRate: 0.8, requests: 1200 },
  { endpoint: '/api/analytics', avgTime: 892, errorRate: 0.3, requests: 3400 }
];

const systemHealth = [
  {
    name: 'Database',
    status: 'healthy',
    uptime: '99.99%',
    responseTime: '12ms'
  },
  {
    name: 'API Server',
    status: 'healthy',
    uptime: '99.95%',
    responseTime: '45ms'
  },
  {
    name: 'Cache (Redis)',
    status: 'healthy',
    uptime: '100%',
    responseTime: '2ms'
  },
  {
    name: 'Message Queue',
    status: 'warning',
    uptime: '98.5%',
    responseTime: '156ms'
  },
  { name: 'CDN', status: 'healthy', uptime: '99.98%', responseTime: '34ms' }
];

const recentAlerts = [
  {
    id: 1,
    severity: 'warning',
    title: 'High Memory Usage',
    message: 'Memory usage at 85% on Server 3',
    time: '2 minutes ago'
  },
  {
    id: 2,
    severity: 'info',
    title: 'Database Backup Completed',
    message: 'Daily backup completed successfully',
    time: '1 hour ago'
  },
  {
    id: 3,
    severity: 'error',
    title: 'API Response Time Spike',
    message: '/api/transactions average response time exceeded threshold',
    time: '3 hours ago'
  },
  {
    id: 4,
    severity: 'warning',
    title: 'Disk Space Low',
    message: 'Disk space on backup server at 92% capacity',
    time: '5 hours ago'
  }
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'healthy':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'error':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

export function SystemMonitoring() {
  const healthyServices = systemHealth.filter(
    (s) => s.status === 'healthy'
  ).length;
  const totalRequests = apiPerformance.reduce(
    (sum, api) => sum + api.requests,
    0
  );
  const avgErrorRate = (
    apiPerformance.reduce((sum, api) => sum + api.errorRate, 0) /
    apiPerformance.length
  ).toFixed(2);

  return (
    <div className='space-y-6'>
      {/* Health Overview */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Services Healthy
              </CardTitle>
              <Shield className='h-4 w-4 text-green-500' />
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>
              {healthyServices}/{systemHealth.length}
            </p>
            <p className='text-xs text-muted-foreground'>
              All systems operational
            </p>
          </CardContent>
        </Card>
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Requests
              </CardTitle>
              <Zap className='h-4 w-4 text-blue-500' />
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>
              {(totalRequests / 1000).toFixed(1)}K
            </p>
            <p className='text-xs text-muted-foreground'>Last 24 hours</p>
          </CardContent>
        </Card>
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Avg Error Rate
              </CardTitle>
              <AlertTriangle className='h-4 w-4 text-yellow-500' />
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>{avgErrorRate}%</p>
            <p className='text-xs text-muted-foreground'>
              Across all endpoints
            </p>
          </CardContent>
        </Card>
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Active Alerts
              </CardTitle>
              <Clock className='h-4 w-4 text-red-500' />
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-2xl font-bold'>
              {recentAlerts.filter((a) => a.severity !== 'info').length}
            </p>
            <p className='text-xs text-muted-foreground'>Requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <Card className='border-0 shadow-sm'>
        <CardHeader>
          <CardTitle>Server Resource Usage (24hr)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={serverMetrics}>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='hsl(var(--border))'
              />
              <XAxis dataKey='time' stroke='hsl(var(--muted-foreground))' />
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
                dataKey='cpu'
                stroke='#3b82f6'
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                name='CPU Usage %'
              />
              <Line
                type='monotone'
                dataKey='memory'
                stroke='#8b5cf6'
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                name='Memory Usage %'
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* API Performance */}
      <Card className='border-0 shadow-sm'>
        <CardHeader>
          <CardTitle>API Endpoint Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {apiPerformance.map((api, index) => (
              <div key={index} className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='font-mono text-sm font-medium'>
                    {api.endpoint}
                  </span>
                  <span className='text-sm text-muted-foreground'>
                    {api.requests.toLocaleString()} requests
                  </span>
                </div>
                <div className='flex gap-2'>
                  <div className='flex-1'>
                    <div className='mb-1 flex justify-between text-xs'>
                      <span>Response Time</span>
                      <span className='font-medium'>{api.avgTime}ms</span>
                    </div>
                    <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
                      <div
                        className='h-full bg-gradient-to-r from-blue-500 to-blue-600'
                        style={{
                          width: `${Math.min((api.avgTime / 1500) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                  <div className='flex-1'>
                    <div className='mb-1 flex justify-between text-xs'>
                      <span>Error Rate</span>
                      <span className='font-medium text-red-600'>
                        {api.errorRate}%
                      </span>
                    </div>
                    <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
                      <div
                        className='h-full bg-gradient-to-r from-red-500 to-red-600'
                        style={{
                          width: `${Math.min(api.errorRate * 10, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Modules Health */}
      <Card className='border-0 shadow-sm'>
        <CardHeader>
          <CardTitle>System Modules Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {systemHealth.map((service, index) => (
              <div
                key={index}
                className='flex items-center justify-between rounded-lg border border-muted bg-muted/30 p-3'
              >
                <div className='flex items-center gap-3'>
                  <Database className='h-4 w-4 text-muted-foreground' />
                  <div>
                    <p className='font-medium'>{service.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      Response: {service.responseTime}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='text-right'>
                    <p className='text-sm font-medium'>
                      Uptime: {service.uptime}
                    </p>
                  </div>
                  <Badge className={getStatusBadge(service.status)}>
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card className='border-0 shadow-sm'>
        <CardHeader>
          <CardTitle>Recent System Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className='flex items-start gap-3 rounded-lg border border-muted bg-muted/30 p-3'
              >
                <div className='mt-0.5 flex-shrink-0'>
                  {alert.severity === 'error' && (
                    <AlertTriangle className='h-4 w-4 text-red-500' />
                  )}
                  {alert.severity === 'warning' && (
                    <AlertTriangle className='h-4 w-4 text-yellow-500' />
                  )}
                  {alert.severity === 'info' && (
                    <Clock className='h-4 w-4 text-blue-500' />
                  )}
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='font-medium'>{alert.title}</p>
                  <p className='text-sm text-muted-foreground'>
                    {alert.message}
                  </p>
                  <p className='text-xs text-muted-foreground'>{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
