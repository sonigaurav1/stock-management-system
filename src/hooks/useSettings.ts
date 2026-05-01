import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Id } from 'convex/_generated/dataModel';

/**
 * Custom Hook: useOrganizationSettings
 * Manages organization settings with real-time syncing
 */
export function useOrganizationSettings() {
  const { toast } = useToast();
  const settings = useQuery(api.settings.getOrganizationSettings);
  const updateMutation = useMutation(api.settings.updateOrganizationSettings);
  const [isLoading, setIsLoading] = useState(false);

  const updateSettings = async (data: any) => {
    try {
      setIsLoading(true);
      await updateMutation(data);
      toast({
        title: 'Success',
        description: 'Organization settings updated'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    updateSettings,
    isLoading: !settings && isLoading
  };
}

/**
 * Custom Hook: useNotificationRules
 * Manages notification preferences
 */
export function useNotificationRules() {
  const { toast } = useToast();
  const rules = useQuery(api.notifications.getNotificationRules);
  const createMutation = useMutation(api.notifications.createNotificationRule);
  const updateMutation = useMutation(api.notifications.updateNotificationRule);
  const deleteMutation = useMutation(api.notifications.deleteNotificationRule);

  const createRule = async (rule: any) => {
    try {
      await createMutation(rule);
      toast({
        title: 'Success',
        description: 'Notification rule created'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create rule',
        variant: 'destructive'
      });
    }
  };

  const updateRule = async (id: string, updates: any) => {
    try {
      await updateMutation({ id: id as Id<'notificationRules'>, ...updates });
      toast({
        title: 'Success',
        description: 'Rule updated'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update rule',
        variant: 'destructive'
      });
    }
  };

  const deleteRule = async (id: string) => {
    try {
      await deleteMutation({ id: id as Id<'notificationRules'> });
      toast({
        title: 'Deleted',
        description: 'Rule removed'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete rule',
        variant: 'destructive'
      });
    }
  };

  return {
    rules,
    createRule,
    updateRule,
    deleteRule,
    isLoading: !rules
  };
}

/**
 * Custom Hook: useIntegrations
 * Manages third-party integrations
 */
export function useIntegrations() {
  const { toast } = useToast();
  const integrations = useQuery(api.integrations.getIntegrations);
  const connectMutation = useMutation(api.integrations.connectIntegration);
  const disconnectMutation = useMutation(
    api.integrations.disconnectIntegration
  );

  const connectIntegration = async (data: any) => {
    try {
      await connectMutation(data);
      toast({
        title: 'Connected',
        description: 'Integration connected successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect integration',
        variant: 'destructive'
      });
    }
  };

  const disconnectIntegration = async (id: string) => {
    try {
      await disconnectMutation({ id: id as Id<'integrations'> });
      toast({
        title: 'Disconnected',
        description: 'Integration removed'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect',
        variant: 'destructive'
      });
    }
  };

  return {
    integrations,
    connectIntegration,
    disconnectIntegration,
    isLoading: !integrations
  };
}

/**
 * Custom Hook: useApiKeys
 * Manages API keys and authentication tokens
 */
export function useApiKeys() {
  const { toast } = useToast();
  const keys = useQuery(api.api.getApiKeys);
  const createMutation = useMutation(api.api.createApiKey);
  const deleteMutation = useMutation(api.api.deleteApiKey);

  const createKey = async (name: string) => {
    try {
      const result = await createMutation({ name });
      toast({
        title: 'Success',
        description: "API key generated. Copy it now - you won't see it again!"
      });
      return result;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create API key',
        variant: 'destructive'
      });
    }
  };

  const deleteKey = async (id: string) => {
    try {
      await deleteMutation({ id: id as Id<'apiKeys'> });
      toast({
        title: 'Deleted',
        description: 'API key removed'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete key',
        variant: 'destructive'
      });
    }
  };

  return {
    keys,
    createKey,
    deleteKey,
    isLoading: !keys
  };
}

/**
 * Custom Hook: useAutomation
 * Manages automation rules and workflows
 */
export function useAutomation() {
  const { toast } = useToast();
  const rules = useQuery(api.automation.getAutomationRules);
  const createMutation = useMutation(api.automation.createAutomationRule);
  const updateMutation = useMutation(api.automation.updateAutomationRule);
  const deleteMutation = useMutation(api.automation.deleteAutomationRule);
  const executeMutation = useMutation(api.automation.executeAutomationRule);

  const createRule = async (rule: any) => {
    try {
      await createMutation(rule);
      toast({
        title: 'Success',
        description: 'Automation rule created'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create rule',
        variant: 'destructive'
      });
    }
  };

  const deleteRule = async (id: string) => {
    try {
      await deleteMutation({ id: id as Id<'automationRules'> });
      toast({
        title: 'Deleted',
        description: 'Rule removed'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete rule',
        variant: 'destructive'
      });
    }
  };

  const executeRule = async (id: string) => {
    try {
      await executeMutation({ id: id as Id<'automationRules'> });
      toast({
        title: 'Success',
        description: 'Automation rule executed'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to execute rule',
        variant: 'destructive'
      });
    }
  };

  return {
    rules,
    createRule,
    deleteRule,
    executeRule,
    isLoading: !rules
  };
}
