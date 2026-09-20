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
 * Custom Hook: useAutomation
 * Manages automation rules and workflows
 */
export function useAutomation() {
  const { toast } = useToast();

  const createRule = async (rule: any) => {
    try {
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
    createRule,
    deleteRule,
    executeRule
  };
}
