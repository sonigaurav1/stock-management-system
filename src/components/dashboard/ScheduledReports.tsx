import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Mail, Trash2, Play, Pause } from 'lucide-react';
import { useState } from 'react';

interface ScheduledReport {
  id: string;
  reportName: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'pptx';
  nextExecution: string;
  lastExecution?: string;
  isActive: boolean;
}

const mockSchedules: ScheduledReport[] = [
  {
    id: '1',
    reportName: 'Monthly Sales Summary',
    frequency: 'monthly',
    time: '09:00 AM',
    recipients: ['manager@company.com', 'sales@company.com'],
    format: 'excel',
    nextExecution: 'Mar 1, 2024',
    lastExecution: 'Feb 1, 2024',
    isActive: true
  },
  {
    id: '2',
    reportName: 'Weekly Inventory Report',
    frequency: 'weekly',
    time: '08:00 AM',
    recipients: ['inventory@company.com'],
    format: 'pdf',
    nextExecution: 'Mar 4, 2024',
    lastExecution: 'Feb 26, 2024',
    isActive: true
  },
  {
    id: '3',
    reportName: 'Daily Payment Status',
    frequency: 'daily',
    time: '05:00 PM',
    recipients: ['finance@company.com', 'admin@company.com'],
    format: 'excel',
    nextExecution: 'Tomorrow at 5:00 PM',
    lastExecution: 'Today at 5:00 PM',
    isActive: false
  }
];

export function ScheduledReports() {
  const [schedules, setSchedules] = useState<ScheduledReport[]>(mockSchedules);
  const [showForm, setShowForm] = useState(false);

  const handleToggle = (id: string) => {
    setSchedules(
      schedules.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleDelete = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors: Record<string, string> = {
      daily: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
      weekly:
        'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
      monthly:
        'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
    };
    return colors[frequency] || '';
  };

  const getFormatBadge = (format: string) => {
    const colors: Record<string, string> = {
      pdf: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
      excel:
        'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      pptx: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
    };
    return colors[format] || '';
  };

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Configure automated report delivery
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className='gap-2'>
              <Clock className='h-4 w-4' />
              New Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className='mb-6 rounded-lg border bg-gray-50 p-4 dark:bg-slate-700'>
              <h3 className='mb-4 font-semibold'>Create New Schedule</h3>
              <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label className='mb-1 block text-sm font-medium'>
                    Report
                  </label>
                  <select className='w-full rounded-lg border px-3 py-2 dark:bg-slate-800'>
                    <option>Select a report...</option>
                    <option>Monthly Sales Summary</option>
                    <option>Weekly Inventory Report</option>
                    <option>Daily Payment Status</option>
                  </select>
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium'>
                    Frequency
                  </label>
                  <select className='w-full rounded-lg border px-3 py-2 dark:bg-slate-800'>
                    <option value='daily'>Daily</option>
                    <option value='weekly'>Weekly</option>
                    <option value='monthly'>Monthly</option>
                  </select>
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium'>Time</label>
                  <input
                    type='time'
                    className='w-full rounded-lg border px-3 py-2 dark:bg-slate-800'
                    defaultValue='09:00'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium'>
                    Format
                  </label>
                  <select className='w-full rounded-lg border px-3 py-2 dark:bg-slate-800'>
                    <option value='pdf'>PDF</option>
                    <option value='excel'>Excel</option>
                    <option value='pptx'>PowerPoint</option>
                  </select>
                </div>
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium'>
                  Recipients (Email)
                </label>
                <textarea
                  className='w-full rounded-lg border px-3 py-2 text-sm dark:bg-slate-800'
                  placeholder='manager@company.com&#10;sales@company.com'
                  rows={3}
                />
              </div>
              <div className='mt-4 flex gap-2'>
                <Button className='flex-1'>Create Schedule</Button>
                <Button
                  variant='outline'
                  className='flex-1'
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className='space-y-3'>
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className='rounded-lg border bg-white p-4 transition hover:shadow-md dark:bg-slate-800'
              >
                <div className='mb-3 flex items-start justify-between'>
                  <div className='flex-1'>
                    <h4 className='font-semibold'>{schedule.reportName}</h4>
                    <div className='mt-2 flex items-center gap-2'>
                      <Badge
                        className={`text-xs ${getFrequencyBadge(schedule.frequency)}`}
                      >
                        {schedule.frequency.charAt(0).toUpperCase() +
                          schedule.frequency.slice(1)}
                      </Badge>
                      <Badge
                        className={`text-xs ${getFormatBadge(schedule.format)}`}
                      >
                        {schedule.format.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className='flex gap-1'>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => handleToggle(schedule.id)}
                      className='h-8 w-8 p-0'
                    >
                      {schedule.isActive ? (
                        <Pause className='h-4 w-4' />
                      ) : (
                        <Play className='h-4 w-4' />
                      )}
                    </Button>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => handleDelete(schedule.id)}
                      className='h-8 w-8 p-0'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3 text-sm md:grid-cols-4'>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-blue-500' />
                    <span className='text-muted-foreground'>
                      {schedule.time}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Mail className='h-4 w-4 text-green-500' />
                    <span className='text-muted-foreground'>
                      {schedule.recipients.length} recipients
                    </span>
                  </div>
                  <div>
                    <p className='text-muted-foreground'>
                      Next: {schedule.nextExecution}
                    </p>
                  </div>
                  <div>
                    <p className='text-muted-foreground'>
                      {schedule.isActive ? 'Active' : 'Paused'}
                    </p>
                  </div>
                </div>

                {schedule.lastExecution && (
                  <p className='mt-2 text-xs text-muted-foreground'>
                    Last run: {schedule.lastExecution}
                  </p>
                )}
              </div>
            ))}
          </div>

          {schedules.length === 0 && (
            <div className='py-12 text-center'>
              <Clock className='mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50' />
              <p className='text-muted-foreground'>No scheduled reports yet</p>
            </div>
          )}

          <div className='mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900'>
            <h4 className='mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100'>
              Scheduling Features
            </h4>
            <ul className='space-y-1 text-sm text-blue-800 dark:text-blue-200'>
              <li>• Daily, weekly, and monthly delivery options</li>
              <li>• Multiple recipient support</li>
              <li>• PDF, Excel, and PowerPoint formats</li>
              <li>• Execution history and tracking</li>
              <li>• Pause/resume schedules anytime</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
