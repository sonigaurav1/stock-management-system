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
import { Switch } from '@/components/ui/switch';
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
  Zap,
  AlertCircle,
  MailIcon,
  Plus,
  Edit2,
  Trash2,
  Clock,
  TrendingDown
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  threshold: string;
  isActive: boolean;
  createdAt: string;
}

const AutomationSettings = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Low Stock Alert',
      trigger: 'Stock Level Below Reorder Point',
      action: 'Email Notification',
      threshold: 'Reorder Level',
      isActive: true,
      createdAt: '2025-02-15'
    },
    {
      id: '2',
      name: 'Payment Due Reminder',
      trigger: 'Invoice Unpaid for 7 Days',
      action: 'SMS Alert to Customer',
      threshold: '7 days',
      isActive: true,
      createdAt: '2025-02-10'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    trigger: '',
    action: '',
    threshold: ''
  });

  const handleAddRule = () => {
    if (!newRule.name || !newRule.trigger || !newRule.action) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const rule: AutomationRule = {
      id: Date.now().toString(),
      ...newRule,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setRules([...rules, rule]);
    setNewRule({ name: '', trigger: '', action: '', threshold: '' });
    setIsDialogOpen(false);

    toast({
      title: 'Success',
      description: 'Automation rule created successfully'
    });
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id));
    toast({
      title: 'Deleted',
      description: 'Automation rule has been removed'
    });
  };

  const toggleRuleActive = (id: string) => {
    setRules(
      rules.map((rule) =>
        rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  return (
    <div className='space-y-6'>
      {/* Automation Overview */}
      <Card className='border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 dark:border-orange-800 dark:from-orange-950 dark:to-orange-900'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Zap className='h-5 w-5' />
              <div>
                <CardTitle>Automation Rules</CardTitle>
                <CardDescription>
                  {rules.filter((r) => r.isActive).length} of {rules.length}{' '}
                  rules active
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Setup Templates */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Quick Setup Templates</CardTitle>
          <CardDescription>Commonly used automation workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
            {[
              {
                icon: '📦',
                name: 'Low Stock Alert',
                desc: 'Alert when stock < reorder level'
              },
              {
                icon: '💰',
                name: 'Payment Reminder',
                desc: 'Remind unpaid invoices'
              },
              {
                icon: '📊',
                name: 'Daily Report',
                desc: 'Email daily sales summary'
              },
              {
                icon: '🔄',
                name: 'Auto Purchase Order',
                desc: 'Create PO when stock low'
              },
              {
                icon: '⏰',
                name: 'Expiry Alert',
                desc: 'Alert 30 days before expiry'
              },
              {
                icon: '📈',
                name: 'Weekly Analytics',
                desc: 'Weekly performance report'
              }
            ].map((template, idx) => (
              <Button
                key={idx}
                variant='outline'
                className='h-full justify-start text-left'
              >
                <div>
                  <p className='mb-1 text-lg'>{template.icon}</p>
                  <p className='text-sm font-medium'>{template.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {template.desc}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Rules */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Active Automation Rules</CardTitle>
            <CardDescription>
              Manage your automation workflows and triggers
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size='sm'>
                <Plus className='mr-1 h-4 w-4' />
                New Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Automation Rule</DialogTitle>
                <DialogDescription>
                  Set up a new automation workflow
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div>
                  <Label>Rule Name</Label>
                  <Input
                    placeholder='e.g., Low Stock Alert'
                    value={newRule.name}
                    onChange={(e) =>
                      setNewRule({ ...newRule, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Trigger Event</Label>
                  <Select
                    value={newRule.trigger}
                    onValueChange={(value) =>
                      setNewRule({ ...newRule, trigger: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select trigger' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='stock-low'>
                        Stock Below Reorder Level
                      </SelectItem>
                      <SelectItem value='invoice-unpaid'>
                        Invoice Unpaid
                      </SelectItem>
                      <SelectItem value='order-created'>
                        Order Created
                      </SelectItem>
                      <SelectItem value='daily-schedule'>
                        Daily Schedule
                      </SelectItem>
                      <SelectItem value='weekly-schedule'>
                        Weekly Schedule
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Action</Label>
                  <Select
                    value={newRule.action}
                    onValueChange={(value) =>
                      setNewRule({ ...newRule, action: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select action' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='email'>Send Email</SelectItem>
                      <SelectItem value='sms'>Send SMS</SelectItem>
                      <SelectItem value='webhook'>Trigger Webhook</SelectItem>
                      <SelectItem value='create-po'>
                        Create Purchase Order
                      </SelectItem>
                      <SelectItem value='assign-task'>Assign Task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Threshold (Optional)</Label>
                  <Input
                    placeholder='e.g., 7 days, 50 units'
                    value={newRule.threshold}
                    onChange={(e) =>
                      setNewRule({ ...newRule, threshold: e.target.value })
                    }
                  />
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setIsDialogOpen(false)}
                    className='flex-1'
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddRule} className='flex-1'>
                    Create Rule
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {rules.length > 0 ? (
              rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`rounded-lg border p-4 transition-all ${
                    rule.isActive
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                      : 'border-slate-200 bg-slate-50 opacity-60 dark:border-slate-700 dark:bg-slate-900'
                  }`}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='mb-2 flex items-center gap-2'>
                        <p className='font-semibold'>{rule.name}</p>
                        <Badge
                          variant={rule.isActive ? 'default' : 'secondary'}
                        >
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className='grid grid-cols-1 gap-3 text-sm text-muted-foreground md:grid-cols-3'>
                        <div>
                          <p className='mb-1 text-xs font-medium'>Trigger</p>
                          <p>{rule.trigger}</p>
                        </div>
                        <div>
                          <p className='mb-1 text-xs font-medium'>Action</p>
                          <p>{rule.action}</p>
                        </div>
                        <div>
                          <p className='mb-1 text-xs font-medium'>Created</p>
                          <p>{rule.createdAt}</p>
                        </div>
                      </div>
                    </div>
                    <div className='ml-4 flex items-center gap-2'>
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => toggleRuleActive(rule.id)}
                      />
                      <Button variant='ghost' size='icon'>
                        <Edit2 className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='py-8 text-center text-muted-foreground'>
                <Zap className='mx-auto mb-2 h-8 w-8 opacity-50' />
                <p>No automation rules created yet</p>
                <p className='text-sm'>Create your first rule to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <MailIcon className='h-5 w-5' />
            <div>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Configure where automation notifications are sent
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-3'>
            {[
              { name: 'Email', value: 'user@company.com', active: true },
              { name: 'SMS', value: '+977-98XXXXXXXX', active: false },
              { name: 'Slack', value: 'Not Connected', active: false }
            ].map((channel, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between rounded border bg-slate-50 p-3 dark:bg-slate-900'
              >
                <div>
                  <p className='text-sm font-medium'>{channel.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {channel.value}
                  </p>
                </div>
                <Button
                  variant={channel.active ? 'default' : 'outline'}
                  size='sm'
                >
                  {channel.active ? 'Configured' : 'Setup'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail for Automation */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            <div>
              <CardTitle>Automation Execution History</CardTitle>
              <CardDescription>
                Recent automation workflows executed
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {[
              {
                rule: 'Low Stock Alert',
                status: 'Success',
                time: '1 hour ago',
                details: 'Email sent to admin@company.com'
              },
              {
                rule: 'Payment Due Reminder',
                status: 'Success',
                time: '3 hours ago',
                details: 'SMS sent to customer'
              },
              {
                rule: 'Daily Report',
                status: 'Failed',
                time: '1 day ago',
                details: 'Invalid email address'
              }
            ].map((log, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between rounded border-l-4 border-l-blue-500 bg-slate-50 p-3 dark:bg-slate-900'
              >
                <div>
                  <p className='text-sm font-medium'>{log.rule}</p>
                  <p className='text-xs text-muted-foreground'>{log.details}</p>
                </div>
                <div className='text-right'>
                  <Badge
                    variant={
                      log.status === 'Success' ? 'default' : 'destructive'
                    }
                  >
                    {log.status}
                  </Badge>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    {log.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className='border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'>
        <CardHeader>
          <CardTitle className='text-base'>
            💡 Automation Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm text-muted-foreground'>
          <ul className='list-inside list-disc space-y-1'>
            <li>Test automation rules before enabling them on live data</li>
            <li>Monitor automation execution history for failures</li>
            <li>Set reasonable thresholds to avoid alert fatigue</li>
            <li>
              Review and update rules periodically based on business changes
            </li>
            <li>Use multiple notification channels for critical alerts</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationSettings;
