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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  Code,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle2,
  Zap,
  AlertCircle
} from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  displayKey: string;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
}

const ApiSettings = () => {
  const { toast } = useToast();
  const [showKey, setShowKey] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'sk_live_Xxxxxxxxxxxxxxxxxxxxxxxxx',
      displayKey: 'sk_live_...xxxxx',
      createdAt: '2025-02-01',
      lastUsed: '1 hour ago',
      isActive: true
    }
  ]);

  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: '1',
      url: 'https://api.example.com/webhooks/inventory',
      events: ['product.created', 'product.updated', 'stock.low'],
      isActive: true,
      createdAt: '2025-02-05',
      lastTriggered: '30 mins ago'
    }
  ]);

  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: [] as string[]
  });

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: 'Copied',
      description: 'API key copied to clipboard'
    });
  };

  const handleGenerateKey = () => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: `API Key ${new Date().toLocaleDateString()}`,
      key: 'sk_live_' + Math.random().toString(36).substring(2, 50),
      displayKey: 'sk_live_...xxxxx',
      createdAt: new Date().toLocaleDateString(),
      isActive: true
    };
    setApiKeys([...apiKeys, newKey]);
    toast({
      title: 'Success',
      description: 'New API key generated'
    });
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
    toast({
      title: 'Deleted',
      description: 'API key has been removed'
    });
  };

  const handleAddWebhook = () => {
    if (!newWebhook.url || newWebhook.events.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter URL and select at least one event',
        variant: 'destructive'
      });
      return;
    }

    const webhook: Webhook = {
      id: Date.now().toString(),
      url: newWebhook.url,
      events: newWebhook.events,
      isActive: true,
      createdAt: new Date().toLocaleDateString()
    };

    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ url: '', events: [] });

    toast({
      title: 'Success',
      description: 'Webhook endpoint added'
    });
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter((w) => w.id !== id));
    toast({
      title: 'Deleted',
      description: 'Webhook has been removed'
    });
  };

  const availableEvents = [
    'product.created',
    'product.updated',
    'product.deleted',
    'stock.updated',
    'stock.low',
    'order.created',
    'order.completed',
    'invoice.created',
    'payment.received',
    'payment.failed'
  ];

  return (
    <div className='space-y-6'>
      {/* API Documentation Link */}
      <Card className='border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-950 dark:to-blue-900'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Code className='h-5 w-5' />
              <div>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>
                  Build integrations with our REST API
                </CardDescription>
              </div>
            </div>
            <Button variant='outline' size='sm'>
              View Docs
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage your API credentials</CardDescription>
          </div>
          <Button onClick={handleGenerateKey} size='sm'>
            <Plus className='mr-1 h-4 w-4' />
            Generate Key
          </Button>
        </CardHeader>
        <CardContent className='space-y-4'>
          {apiKeys.length > 0 ? (
            <div className='space-y-3'>
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className='rounded-lg border bg-slate-50 p-4 dark:bg-slate-900'
                >
                  <div className='mb-3 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <p className='font-semibold'>{key.name}</p>
                      <Badge variant={key.isActive ? 'default' : 'secondary'}>
                        {key.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleDeleteKey(key.id)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>

                  <div className='mb-2 flex items-center gap-2 rounded border bg-white p-2 dark:bg-slate-800'>
                    {showKey === key.id ? (
                      <>
                        <code className='flex-1 text-xs'>{key.key}</code>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => setShowKey(null)}
                        >
                          <EyeOff className='h-4 w-4' />
                        </Button>
                      </>
                    ) : (
                      <>
                        <code className='flex-1 text-xs text-muted-foreground'>
                          {key.displayKey}
                        </code>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => setShowKey(key.id)}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                      </>
                    )}
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleCopyKey(key.key)}
                    >
                      <Copy className='h-4 w-4' />
                    </Button>
                  </div>

                  <div className='grid grid-cols-2 text-xs text-muted-foreground'>
                    <div>
                      <p>Created: {key.createdAt}</p>
                    </div>
                    <div>
                      <p>Last used: {key.lastUsed || 'Never'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='py-8 text-center text-muted-foreground'>
              <Code className='mx-auto mb-2 h-8 w-8 opacity-50' />
              <p>No API keys yet</p>
              <p className='text-sm'>
                Generate your first API key to get started
              </p>
            </div>
          )}

          <div className='flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950'>
            <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600' />
            <div className='text-sm'>
              <p className='font-medium text-yellow-900 dark:text-yellow-100'>
                Keep your API keys secure
              </p>
              <p className='mt-1 text-xs text-yellow-800 dark:text-yellow-200'>
                Never share your API keys publicly. If compromised, regenerate
                immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <div className='mb-4 flex items-center gap-2'>
            <Zap className='h-5 w-5' />
            <div>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Receive real-time event notifications
              </CardDescription>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size='sm'>
                <Plus className='mr-1 h-4 w-4' />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Webhook Endpoint</DialogTitle>
                <DialogDescription>
                  Receive real-time notifications for events
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div>
                  <Label>Endpoint URL *</Label>
                  <Input
                    placeholder='https://api.example.com/webhooks'
                    value={newWebhook.url}
                    onChange={(e) =>
                      setNewWebhook({ ...newWebhook, url: e.target.value })
                    }
                  />
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Must be a valid HTTPS URL
                  </p>
                </div>
                <div>
                  <Label>Events to subscribe to *</Label>
                  <div className='max-h-48 space-y-2 overflow-y-auto rounded-lg border bg-slate-50 p-3 dark:bg-slate-900'>
                    {availableEvents.map((event) => (
                      <div key={event} className='flex items-center'>
                        <input
                          type='checkbox'
                          id={event}
                          checked={newWebhook.events.includes(event)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewWebhook({
                                ...newWebhook,
                                events: [...newWebhook.events, event]
                              });
                            } else {
                              setNewWebhook({
                                ...newWebhook,
                                events: newWebhook.events.filter(
                                  (ev) => ev !== event
                                )
                              });
                            }
                          }}
                          className='h-4 w-4'
                        />
                        <label
                          htmlFor={event}
                          className='ml-2 cursor-pointer text-sm'
                        >
                          {event}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='flex gap-2'>
                  <Button variant='outline' className='flex-1'>
                    Cancel
                  </Button>
                  <Button onClick={handleAddWebhook} className='flex-1'>
                    Add Webhook
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className='space-y-4'>
          {webhooks.length > 0 ? (
            <div className='space-y-3'>
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className='rounded-lg border bg-slate-50 p-4 dark:bg-slate-900'
                >
                  <div className='mb-3 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <CheckCircle2 className='h-5 w-5 text-green-600' />
                      <p className='font-mono text-sm'>{webhook.url}</p>
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleDeleteWebhook(webhook.id)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>

                  <div className='mb-2'>
                    <p className='mb-2 text-xs font-medium'>
                      Subscribed events:
                    </p>
                    <div className='flex flex-wrap gap-1'>
                      {webhook.events.map((event) => (
                        <Badge
                          key={event}
                          variant='secondary'
                          className='text-xs'
                        >
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className='grid grid-cols-2 text-xs text-muted-foreground'>
                    <div>Created: {webhook.createdAt}</div>
                    <div>
                      Last triggered: {webhook.lastTriggered || 'Never'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='py-8 text-center text-muted-foreground'>
              <Zap className='mx-auto mb-2 h-8 w-8 opacity-50' />
              <p>No webhooks configured</p>
              <p className='text-sm'>
                Add a webhook to receive real-time events
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limits</CardTitle>
          <CardDescription>API usage and rate limiting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {[
              { name: 'Requests per minute', limit: '100', used: '45' },
              { name: 'Requests per hour', limit: '5,000', used: '2,340' },
              { name: 'Concurrent requests', limit: '10', used: '3' }
            ].map((limit, idx) => (
              <div key={idx}>
                <div className='mb-2 flex items-center justify-between'>
                  <p className='text-sm font-medium'>{limit.name}</p>
                  <p className='text-sm text-muted-foreground'>
                    {limit.used} / {limit.limit}
                  </p>
                </div>
                <div className='h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700'>
                  <div
                    className='h-2 rounded-full bg-blue-500'
                    style={{
                      width: `${(parseInt(limit.used) / parseInt(limit.limit.replace(',', ''))) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card className='border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950'>
        <CardHeader>
          <CardTitle className='text-base'>📚 Developer Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2 text-sm'>
            <div>
              <p className='mb-1 font-medium'>Quick Links</p>
              <ul className='space-y-1 text-purple-900 dark:text-purple-100'>
                <li>→ API Reference Documentation</li>
                <li>→ Webhook Event Types</li>
                <li>→ Authentication Guide</li>
                <li>→ Error Codes Reference</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiSettings;
