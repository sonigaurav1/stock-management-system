import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  TrendingUp,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const riskTrendData = [
  { month: 'Jan', high: 8, medium: 15, low: 22 },
  { month: 'Feb', high: 6, medium: 14, low: 25 },
  { month: 'Mar', high: 7, medium: 16, low: 23 },
  { month: 'Apr', high: 5, medium: 12, low: 28 },
  { month: 'May', high: 4, medium: 10, low: 30 },
  { month: 'Jun', high: 3, medium: 9, low: 32 }
];

const activeRisks = [
  {
    id: '1',
    title: 'Supply Chain Disruption',
    level: 'high',
    probability: 85,
    impact: 90,
    description: 'Potential disruption from primary supplier'
  },
  {
    id: '2',
    title: 'Inventory Shrinkage',
    level: 'medium',
    probability: 60,
    impact: 75,
    description: 'Unexplained inventory loss in warehouse'
  },
  {
    id: '3',
    title: 'Data Security Breach',
    level: 'high',
    probability: 40,
    impact: 95,
    description: 'Unauthorized customer data access'
  },
  {
    id: '4',
    title: 'System Downtime',
    level: 'medium',
    probability: 45,
    impact: 65,
    description: 'ERP system unavailability'
  }
];

function getRiskColor(level: string) {
  switch (level) {
    case 'high':
      return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
    case 'medium':
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
    case 'low':
      return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
    default:
      return '';
  }
}

function getRiskIcon(level: string) {
  switch (level) {
    case 'high':
      return <AlertCircle className='h-4 w-4' />;
    case 'medium':
      return <Clock className='h-4 w-4' />;
    case 'low':
      return <CheckCircle className='h-4 w-4' />;
    default:
      return null;
  }
}

export function RiskAssessment() {
  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>
                Enterprise risk evaluation and mitigation tracking
              </CardDescription>
            </div>
            <Button className='gap-2'>
              <BarChart3 className='h-4 w-4' />
              Assess Risks
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Compliance Score */}
            <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
              <div className='mb-2 flex items-center justify-between'>
                <p className='text-sm font-medium text-muted-foreground'>
                  Overall Compliance Score
                </p>
                <span className='text-2xl font-bold text-green-600'>85%</span>
              </div>
              <div className='h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
                <div
                  className='h-2 rounded-full bg-green-600'
                  style={{ width: '85%' }}
                ></div>
              </div>
              <p className='mt-2 text-xs text-muted-foreground'>
                Based on active risk mitigation efforts
              </p>
            </div>

            {/* Risk Metrics */}
            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <div className='mb-2 flex items-center gap-3'>
                  <AlertCircle className='h-5 w-5 text-red-600' />
                  <p className='text-sm text-muted-foreground'>Active Risks</p>
                </div>
                <p className='text-2xl font-bold'>12</p>
                <p className='text-xs text-muted-foreground'>3 high severity</p>
              </div>

              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <div className='mb-2 flex items-center gap-3'>
                  <TrendingUp className='h-5 w-5 text-yellow-600' />
                  <p className='text-sm text-muted-foreground'>
                    Mitigation Rate
                  </p>
                </div>
                <p className='text-2xl font-bold'>78%</p>
                <p className='text-xs text-muted-foreground'>
                  Risks being addressed
                </p>
              </div>

              <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
                <div className='mb-2 flex items-center gap-3'>
                  <CheckCircle className='h-5 w-5 text-green-600' />
                  <p className='text-sm text-muted-foreground'>
                    Resolved This Month
                  </p>
                </div>
                <p className='text-2xl font-bold'>5</p>
                <p className='text-xs text-muted-foreground'>
                  Down 2 from last month
                </p>
              </div>
            </div>

            {/* Risk Trend */}
            <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
              <h3 className='mb-4 text-sm font-semibold'>
                Risk Trend (6 months)
              </h3>
              <ResponsiveContainer width='100%' height={200}>
                <LineChart data={riskTrendData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                  <XAxis dataKey='month' stroke='#8b5cf6' />
                  <YAxis stroke='#8b5cf6' />
                  <Tooltip />
                  <Line
                    type='monotone'
                    dataKey='high'
                    stroke='#ef4444'
                    strokeWidth={2}
                    name='High'
                  />
                  <Line
                    type='monotone'
                    dataKey='medium'
                    stroke='#eab308'
                    strokeWidth={2}
                    name='Medium'
                  />
                  <Line
                    type='monotone'
                    dataKey='low'
                    stroke='#22c55e'
                    strokeWidth={2}
                    name='Low'
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Active Risks List */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>
                Critical & High-Priority Risks
              </h3>
              <div className='space-y-2'>
                {activeRisks.map((risk) => (
                  <div
                    key={risk.id}
                    className='rounded-lg border bg-white p-4 transition-colors hover:border-purple-500 dark:bg-slate-800'
                  >
                    <div className='mb-2 flex items-start justify-between gap-4'>
                      <div className='flex-1'>
                        <div className='mb-1 flex items-center gap-2'>
                          {getRiskIcon(risk.level)}
                          <h4 className='text-sm font-medium'>{risk.title}</h4>
                          <Badge className={getRiskColor(risk.level)}>
                            {risk.level.toUpperCase()}
                          </Badge>
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          {risk.description}
                        </p>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                      <div>
                        <p className='text-xs font-medium'>
                          Probability: {risk.probability}%
                        </p>
                        <div className='mt-1 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
                          <div
                            className='h-1.5 rounded-full bg-orange-500'
                            style={{ width: `${risk.probability}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className='text-xs font-medium'>
                          Impact: {risk.impact}%
                        </p>
                        <div className='mt-1 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
                          <div
                            className='h-1.5 rounded-full bg-red-500'
                            style={{ width: `${risk.impact}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mitigation Recommendations */}
            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900'>
              <h3 className='mb-3 text-sm font-semibold text-blue-900 dark:text-blue-100'>
                Recommended Actions
              </h3>
              <ul className='space-y-2 text-sm text-blue-800 dark:text-blue-200'>
                <li>
                  • Diversify supplier base to reduce single point of failure
                </li>
                <li>
                  • Implement enhanced inventory controls and cycle counts
                </li>
                <li>• Conduct security audit and penetration testing</li>
                <li>• Review and test disaster recovery procedures</li>
                <li>• Schedule quarterly risk management meetings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
