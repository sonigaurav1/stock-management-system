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
  channels: ('email' | 'sms' | 'slack')[];
  recipients: string[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Integration
export interface Integration {
  _id: string;
  userId: string;
  name: string;
  category:
    | 'accounting'
    | 'ecommerce'
    | 'shipping'
    | 'marketing'
    | 'communication'
    | 'storage';
  isConnected: boolean;
  apiKey: string; // Encrypted
  apiSecret?: string;
  lastSyncAt?: number;
  syncStatus?: 'success' | 'failed' | 'in_progress';
  config?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

// API Key
export interface ApiKey {
  _id: string;
  userId: string;
  name: string;
  key: string; // Hashed
  displayKey: string; // Last 8 chars
  isActive: boolean;
  lastUsedAt?: number;
  rateLimit?: number;
  createdAt: number;
  expiresAt?: number;
}

// Webhook
export interface Webhook {
  _id: string;
  userId: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastTriggeredAt?: number;
  failureCount: number;
  createdAt: number;
  updatedAt: number;
}

// Automation Rule
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
