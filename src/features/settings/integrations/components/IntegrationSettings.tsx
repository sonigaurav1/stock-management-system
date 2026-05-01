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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Plus,
  Trash2,
  Settings as SettingsIcon
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  description: string;
  isConnected: boolean;
  apiKey?: string;
  lastSync?: string;
}

const IntegrationSettings = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'tally',
      name: 'Tally Prime',
      category: 'Accounting',
      icon: '📦',
      description: 'Sync invoices and accounting data with Tally',
      isConnected: false,
      lastSync: undefined
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      category: 'Accounting',
      icon: '📊',
      description: 'Connect with QuickBooks for seamless accounting',
      isConnected: false
    },
    {
      id: 'shopify',
      name: 'Shopify',
      category: 'E-Commerce',
      icon: '🛒',
      description: 'Sync products and orders with Shopify store',
      isConnected: false
    },
    {
      id: 'woocommerce',
      name: 'WooCommerce',
      category: 'E-Commerce',
      icon: '📱',
      description: 'Connect with WooCommerce powered stores',
      isConnected: false
    },
    {
      id: 'shipstation',
      name: 'ShipStation',
      category: 'Shipping',
      icon: '📦',
      description: 'Manage shipping and order fulfillment',
      isConnected: false
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      category: 'Marketing',
      icon: '📧',
      description: 'Email marketing and customer engagement',
      isConnected: false
    },
    {
      id: 'slack',
      name: 'Slack',
      category: 'Communication',
      icon: '💬',
      description: 'Get notifications and alerts in Slack',
      isConnected: false
    },
    {
      id: 'googledrive',
      name: 'Google Drive',
      category: 'Storage',
      icon: '☁️',
      description: 'Backup reports and data to Google Drive',
      isConnected: false
    }
  ]);

  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [apiKey, setApiKey] = useState('');

  const handleConnect = () => {
    if (!selectedIntegration || !apiKey.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter API key',
        variant: 'destructive'
      });
      return;
    }

    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === selectedIntegration.id
          ? {
              ...int,
              isConnected: true,
              apiKey,
              lastSync: new Date().toLocaleDateString()
            }
          : int
      )
    );

    toast({
      title: 'Success',
      description: `${selectedIntegration.name} connected successfully`
    });

    setApiKey('');
    setSelectedIntegration(null);
  };

  const handleDisconnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((int) =>
        int.id === id
          ? {
              ...int,
              isConnected: false,
              apiKey: undefined,
              lastSync: undefined
            }
          : int
      )
    );

    toast({
      title: 'Disconnected',
      description: 'Integration has been removed'
    });
  };

  const categories = Array.from(
    new Set(integrations.map((int) => int.category))
  ).sort();

  return (
    <div className='space-y-6'>
      {/* Integration Overview */}
      <Card className='border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:border-blue-800 dark:from-blue-950 dark:to-blue-900'>
        <CardHeader>
          <CardTitle className='text-lg'>Connected Integrations</CardTitle>
          <CardDescription>
            {integrations.filter((int) => int.isConnected).length} of{' '}
            {integrations.length} integrations connected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex gap-2'>
            <Badge variant='secondary'>
              {integrations.filter((int) => int.isConnected).length} Active
            </Badge>
            <Badge variant='outline'>
              {integrations.filter((int) => !int.isConnected).length} Available
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Integrations by Category */}
      {categories.map((category) => (
        <div key={category} className='space-y-3'>
          <h3 className='text-lg font-semibold text-muted-foreground'>
            {category}
          </h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {integrations
              .filter((int) => int.category === category)
              .map((integration) => (
                <Card
                  key={integration.id}
                  className={`transition-all ${
                    integration.isConnected
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between'>
                      <div className='flex flex-1 items-start gap-3'>
                        <span className='text-2xl'>{integration.icon}</span>
                        <div>
                          <CardTitle className='text-base'>
                            {integration.name}
                          </CardTitle>
                          <CardDescription className='mt-1 text-xs'>
                            {integration.description}
                          </CardDescription>
                        </div>
                      </div>
                      {integration.isConnected ? (
                        <CheckCircle2 className='h-5 w-5 flex-shrink-0 text-green-600' />
                      ) : (
                        <Circle className='h-5 w-5 flex-shrink-0 text-slate-300' />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-3 pt-2'>
                    {integration.isConnected && integration.lastSync && (
                      <div>
                        <p className='text-xs text-muted-foreground'>
                          Last synced
                        </p>
                        <p className='text-sm font-medium'>
                          {integration.lastSync}
                        </p>
                      </div>
                    )}
                    <div className='flex gap-2'>
                      {integration.isConnected ? (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size='sm'
                                variant='outline'
                                className='flex-1'
                              >
                                <SettingsIcon className='mr-1 h-4 w-4' />
                                Settings
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Manage {integration.name} Integration
                                </DialogTitle>
                              </DialogHeader>
                              <div className='space-y-4'>
                                <div>
                                  <p className='mb-2 text-sm font-medium'>
                                    API Key
                                  </p>
                                  <Input
                                    value={integration.apiKey || ''}
                                    readOnly
                                    type='password'
                                  />
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  <p>• Last synced: {integration.lastSync}</p>
                                  <p>• Status: Connected</p>
                                </div>
                                <Button
                                  variant='destructive'
                                  className='w-full'
                                  onClick={() =>
                                    handleDisconnect(integration.id)
                                  }
                                >
                                  <Trash2 className='mr-2 h-4 w-4' />
                                  Disconnect
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      ) : (
                        <Dialog
                          open={selectedIntegration?.id === integration.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setSelectedIntegration(null);
                              setApiKey('');
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size='sm'
                              variant='default'
                              className='flex-1'
                              onClick={() =>
                                setSelectedIntegration(integration)
                              }
                            >
                              <Plus className='mr-1 h-4 w-4' />
                              Connect
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Connect {integration.name}
                              </DialogTitle>
                              <DialogDescription>
                                Enter your API credentials to connect with{' '}
                                {integration.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className='space-y-4'>
                              <div>
                                <Label htmlFor='apikey'>API Key</Label>
                                <Input
                                  id='apikey'
                                  placeholder='Enter your API key'
                                  value={apiKey}
                                  onChange={(e) => setApiKey(e.target.value)}
                                  type='password'
                                />
                              </div>
                              <div className='rounded border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950'>
                                <p className='text-sm text-blue-900 dark:text-blue-100'>
                                  ℹ️ You can find your API key in your{' '}
                                  {integration.name} account settings
                                </p>
                              </div>
                              <div className='flex gap-2'>
                                <Button
                                  variant='outline'
                                  className='flex-1'
                                  onClick={() => {
                                    setSelectedIntegration(null);
                                    setApiKey('');
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  className='flex-1'
                                  onClick={handleConnect}
                                >
                                  <Plus className='mr-1 h-4 w-4' />
                                  Connect
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      <Button size='sm' variant='ghost'>
                        <ExternalLink className='h-4 w-4' />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      {/* Integration Tips */}
      <Card className='border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950'>
        <CardHeader>
          <CardTitle className='text-base'>💡 Integration Tips</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm text-muted-foreground'>
          <ul className='list-inside list-disc space-y-1'>
            <li>Keep your API keys secure and never share them</li>
            <li>Check integration documentation for setup instructions</li>
            <li>Enable two-factor authentication on connected accounts</li>
            <li>Review connected app permissions regularly</li>
            <li>Test integrations in a sandbox environment first</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationSettings;
