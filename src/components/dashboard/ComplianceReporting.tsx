import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, FileText, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const complianceData = [
  { standard: 'SOC 2', score: 87, target: 90 },
  { standard: 'GDPR', score: 92, target: 95 },
  { standard: 'HIPAA', score: 78, target: 85 },
  { standard: 'ISO 27001', score: 85, target: 90 }
];

const standards = [
  {
    id: 'soc2',
    name: 'SOC 2 Type II',
    description:
      'Security, availability, processing integrity, confidentiality',
    score: 87,
    controlsPassing: 52,
    controlsTotal: 60,
    status: 'partial'
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    description: 'General Data Protection Regulation for EU data',
    score: 92,
    controlsPassing: 46,
    controlsTotal: 50,
    status: 'compliant'
  },
  {
    id: 'hipaa',
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act',
    score: 78,
    controlsPassing: 31,
    controlsTotal: 40,
    status: 'partial'
  },
  {
    id: 'iso27001',
    name: 'ISO 27001',
    description: 'Information Security Management System',
    score: 85,
    controlsPassing: 77,
    controlsTotal: 90,
    status: 'partial'
  }
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'compliant':
      return (
        <Badge className='bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'>
          Compliant
        </Badge>
      );
    case 'partial':
      return (
        <Badge className='bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'>
          Partially Compliant
        </Badge>
      );
    case 'non-compliant':
      return (
        <Badge className='bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'>
          Non-Compliant
        </Badge>
      );
    default:
      return null;
  }
}

export function ComplianceReporting() {
  const overallScore = Math.round(
    standards.reduce((sum, s) => sum + s.score, 0) / standards.length
  );

  return (
    <div className='space-y-4'>
      <Card className='bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Compliance Reporting</CardTitle>
              <CardDescription>
                Multi-standard compliance & regulatory reporting
              </CardDescription>
            </div>
            <Button className='gap-2'>
              <FileText className='h-4 w-4' />
              Generate Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* Overall Score */}
            <div className='rounded-lg border bg-white p-6 dark:bg-slate-800'>
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='font-semibold'>Overall Compliance Score</h3>
                <div className='text-right'>
                  <p className='text-4xl font-bold text-purple-600'>
                    {overallScore}%
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Across 4 frameworks
                  </p>
                </div>
              </div>
              <div className='h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
                <div
                  className='h-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600'
                  style={{ width: `${overallScore}%` }}
                />
              </div>
            </div>

            {/* Compliance Chart */}
            <div className='rounded-lg border bg-white p-4 dark:bg-slate-800'>
              <h3 className='mb-4 text-sm font-semibold'>
                Compliance Score by Standard
              </h3>
              <ResponsiveContainer width='100%' height={250}>
                <BarChart data={complianceData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                  <XAxis dataKey='standard' stroke='#8b5cf6' />
                  <YAxis stroke='#8b5cf6' />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='score' fill='#8b5cf6' name='Current Score' />
                  <Bar dataKey='target' fill='#d5d5d5' name='Target' />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Standards Details */}
            <div className='space-y-3'>
              <h3 className='text-sm font-semibold'>Compliance Standards</h3>
              <div className='space-y-3'>
                {standards.map((standard) => (
                  <div
                    key={standard.id}
                    className='rounded-lg border bg-white p-4 transition-colors hover:border-purple-500 dark:bg-slate-800'
                  >
                    <div className='mb-3 flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='mb-1 flex items-center gap-2'>
                          <h4 className='text-sm font-semibold'>
                            {standard.name}
                          </h4>
                          {getStatusBadge(standard.status)}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          {standard.description}
                        </p>
                      </div>
                      <p className='text-2xl font-bold text-purple-600'>
                        {standard.score}%
                      </p>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex items-center justify-between text-xs'>
                        <span>Controls Passing</span>
                        <span className='font-medium'>
                          {standard.controlsPassing} of {standard.controlsTotal}
                        </span>
                      </div>
                      <div className='h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
                        <div
                          className='h-2 rounded-full bg-purple-600'
                          style={{
                            width: `${(standard.controlsPassing / standard.controlsTotal) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Alerts */}
            <div className='space-y-2'>
              <h3 className='text-sm font-semibold'>Compliance Alerts</h3>
              <div className='space-y-2'>
                <div className='flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900'>
                  <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600' />
                  <div>
                    <p className='text-sm font-medium text-yellow-900 dark:text-yellow-100'>
                      HIPAA: 22% Gap Identified
                    </p>
                    <p className='text-xs text-yellow-800 dark:text-yellow-200'>
                      9 controls need remediation. Target completion: Q3 2024
                    </p>
                  </div>
                </div>

                <div className='flex gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-700 dark:bg-green-900'>
                  <CheckCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-green-600' />
                  <div>
                    <p className='text-sm font-medium text-green-900 dark:text-green-100'>
                      GDPR: All Controls Active
                    </p>
                    <p className='text-xs text-green-800 dark:text-green-200'>
                      92% compliant with 46/50 controls passing
                    </p>
                  </div>
                </div>

                <div className='flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900'>
                  <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600' />
                  <div>
                    <p className='text-sm font-medium text-yellow-900 dark:text-yellow-100'>
                      SOC 2: 3 Control Gaps
                    </p>
                    <p className='text-xs text-yellow-800 dark:text-yellow-200'>
                      8 controls need updates. Due review: 2024-04-30
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Remediation Plan */}
            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900'>
              <h3 className='mb-3 text-sm font-semibold text-blue-900 dark:text-blue-100'>
                Remediation Progress
              </h3>
              <div className='space-y-3'>
                <div>
                  <div className='mb-1 flex items-center justify-between'>
                    <span className='text-sm text-blue-800 dark:text-blue-200'>
                      HIPAA Controls
                    </span>
                    <span className='text-xs font-medium'>7/9 Complete</span>
                  </div>
                  <div className='h-2 w-full rounded-full bg-blue-200 dark:bg-blue-800'>
                    <div
                      className='h-2 rounded-full bg-blue-600'
                      style={{ width: '78%' }}
                    />
                  </div>
                </div>
                <div>
                  <div className='mb-1 flex items-center justify-between'>
                    <span className='text-sm text-blue-800 dark:text-blue-200'>
                      ISO 27001 Controls
                    </span>
                    <span className='text-xs font-medium'>15/18 Complete</span>
                  </div>
                  <div className='h-2 w-full rounded-full bg-blue-200 dark:bg-blue-800'>
                    <div
                      className='h-2 rounded-full bg-blue-600'
                      style={{ width: '83%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Key Recommendations */}
            <div className='rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-700 dark:bg-indigo-900'>
              <h3 className='mb-3 text-sm font-semibold text-indigo-900 dark:text-indigo-100'>
                Key Recommendations
              </h3>
              <ul className='space-y-2 text-sm text-indigo-800 dark:text-indigo-200'>
                <li>✓ Implement data retention policies for GDPR compliance</li>
                <li>✓ Configure encryption for healthcare data (HIPAA)</li>
                <li>✓ Schedule access control audit (SOC 2)</li>
                <li>✓ Update risk assessment documentation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
