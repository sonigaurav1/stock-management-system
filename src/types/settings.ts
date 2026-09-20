import { v } from 'convex/values';

/**
 * TypeScript interfaces for Settings
 * Ensures type safety across frontend and backend
 */

// Organization Settings
export interface OrganizationSettings {
  _id: string;
  userId: string;
  companyName: string;
  businessType:
    | 'retailer'
    | 'wholesaler'
    | 'distributor'
    | 'manufacturer'
    | 'service_provider';
  taxNumber: string;
  businessRegistration?: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  phone?: string;
  email: string;
  website?: string;
  description?: string;
  logo?: string;
  createdAt: number;
  updatedAt: number;
}

// Notification Settings
export interface NotificationRule {
  _id: string;
  userId: string;
  name: string;
  triggers: string[];
  channels: ('email' | 'sms')[];
  recipients: string[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AutomationRule {
  _id: string;
  userId: string;
  name: string;
  trigger: string;
  action: string;
  threshold?: string;
  isActive: boolean;
  lastExecutedAt?: number;
  executionCount: number;
  createdAt: number;
  updatedAt: number;
}

// Audit Log Entry
export interface AuditLogEntry {
  _id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: number;
}

// Feature Usage
export interface FeatureUsage {
  _id: string;
  userId: string;
  feature: string;
  metadata?: Record<string, any>;
  timestamp: number;
}
