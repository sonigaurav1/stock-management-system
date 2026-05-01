/**
 * Type definitions for Compliance Components
 * Used across RiskAssessment, AuditTrail, ComplianceReporting, AccessControl, and TaxCompliance
 */

// ============================================================================
// Risk Assessment Types
// ============================================================================

export type RiskLevel = 'high' | 'medium' | 'low';
export type RiskStatus = 'active' | 'mitigated' | 'resolved';

export interface RiskItem {
  id: string;
  title: string;
  description: string;
  level: RiskLevel;
  status: RiskStatus;
  source: string;
  mitigation?: string;
  dueDate?: Date;
  assignedTo?: string;
  probability: number; // 0-100
  impact: number; // 0-100
  riskScore: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskTrend {
  month: string;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
}

export interface RiskMetrics {
  totalRisks: number;
  activeRisks: number;
  mitigatedRisks: number;
  complianceScore: number;
  trend: RiskTrend[];
}

// ============================================================================
// Audit Trail Types
// ============================================================================

export type ActionType =
  | 'added'
  | 'modified'
  | 'deleted'
  | 'exported'
  | 'verified';
export type ResourceType =
  | 'product'
  | 'transaction'
  | 'user'
  | 'company'
  | 'report'
  | 'settings';

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: ActionType;
  resourceType: ResourceType;
  resourceId: string;
  resourceName: string;
  changes?: {
    field: string;
    before: any;
    after: any;
  }[];
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  status: 'success' | 'failure';
  errorMessage?: string;
}

export interface AuditLogFilter {
  userId?: string;
  action?: ActionType;
  resourceType?: ResourceType;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogStats {
  totalEntries: number;
  entriesByAction: Record<ActionType, number>;
  entriesByUser: Record<string, number>;
  entriesByResourceType: Record<ResourceType, number>;
}

// ============================================================================
// Compliance Reporting Types
// ============================================================================

export type ComplianceStandard = 'soc2' | 'gdpr' | 'hipaa' | 'iso27001';
export type ControlStatus =
  | 'compliant'
  | 'partial'
  | 'non-compliant'
  | 'not-applicable';

export interface ComplianceControl {
  id: string;
  standard: ComplianceStandard;
  controlId: string;
  title: string;
  description: string;
  status: ControlStatus;
  evidence: string[];
  lastAudit?: Date;
  nextAudit?: Date;
  owner?: string;
  remediation?: string;
  remediationTarget?: Date;
}

export interface ComplianceReport {
  id: string;
  standard: ComplianceStandard;
  name: string;
  description: string;
  complianceScore: number; // 0-100
  controlsPassing: number;
  controlsTotal: number;
  implementationPercentage: number; // 0-100
  lastGenerated: Date;
  nextDueDate?: Date;
  controls: ComplianceControl[];
  recommendations: string[];
}

export interface ComplianceMetrics {
  overallScore: number;
  standards: Record<ComplianceStandard, number>;
  previousScores: {
    date: Date;
    score: number;
  }[];
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
}

// ============================================================================
// Access Control Types
// ============================================================================

export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';
export type Permission =
  | 'view_inventory'
  | 'create_transaction'
  | 'edit_transaction'
  | 'delete_transaction'
  | 'export_data'
  | 'view_reports'
  | 'manage_users'
  | 'view_audit_logs'
  | 'manage_settings'
  | 'view_compliance';

export interface RolePermission {
  role: UserRole;
  permissions: Permission[];
  description: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  members: string[]; // user IDs
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessRequest {
  id: string;
  userId: string;
  requestedPermissions: Permission[];
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface UserActivity {
  userId: string;
  date: Date;
  actionsCount: number;
  lastAction: string;
}

// ============================================================================
// Tax Compliance Types
// ============================================================================

export type TaxJurisdiction = 'CA' | 'US' | 'EU' | 'OTHER';
export type TaxType = 'GST' | 'HST' | 'PST' | 'VAT' | 'SALES_TAX';
export type TaxStatus = 'filed' | 'pending' | 'overdue' | 'paid' | 'refunded';

export interface TaxRate {
  id: string;
  type: TaxType;
  jurisdiction: TaxJurisdiction;
  rate: number; // percentage, e.g., 16 for 16%
  effectiveDate: Date;
  expiryDate?: Date;
  description?: string;
}

export interface TaxExemption {
  id: string;
  customerId?: string;
  productId?: string;
  reason: string;
  rate: number;
  isActive: boolean;
  effectiveDate: Date;
  expiryDate?: Date;
}

export interface TaxCalculation {
  id: string;
  transactionId: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  jurisdiction: TaxJurisdiction;
  exemptions: TaxExemption[];
  timestamp: Date;
}

export interface TaxFilingPeriod {
  period: string; // e.g., "Q1 2026"
  startDate: Date;
  endDate: Date;
  dueDate: Date;
  status: TaxStatus;
  filedDate?: Date;
  grossRevenue: number;
  taxableAmount: number;
  totalTax: number;
  taxPaid?: number;
  refund?: number;
  notes?: string;
}

export interface TaxCompliance {
  registrationNumber: string;
  jurisdiction: TaxJurisdiction;
  registeredDate: Date;
  isActive: boolean;
  currentRate: number;
  ytdCollected: number;
  ytdPaid: number;
  filingPeriods: TaxFilingPeriod[];
  exemptions: TaxExemption[];
  inputTaxCredits: TaxCalculation[];
}

// ============================================================================
// Common Types
// ============================================================================

export interface Notification {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  includeMetadata: boolean;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  filters?: Record<string, any>;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface RiskAssessmentProps {
  onRiskClick?: (risk: RiskItem) => void;
  onExport?: (format: 'csv' | 'pdf') => void;
  readOnly?: boolean;
}

export interface AuditTrailProps {
  userId?: string;
  resourceType?: ResourceType;
  showFilters?: boolean;
  rowsPerPage?: number;
  onExport?: (format: ExportOptions) => void;
  readOnly?: boolean;
}

export interface ComplianceReportingProps {
  standards?: ComplianceStandard[];
  showMetrics?: boolean;
  showRecommendations?: boolean;
  onGenerateReport?: (standard: ComplianceStandard) => void;
}

export interface AccessControlProps {
  onUserUpdate?: (user: User) => void;
  onRoleChange?: (userId: string, newRole: UserRole) => void;
  onPermissionChange?: (userId: string, permissions: Permission[]) => void;
  readOnly?: boolean;
}

export interface TaxComplianceProps {
  jurisdiction?: TaxJurisdiction;
  yearFocused?: number;
  showChart?: boolean;
  onFilingClick?: (period: TaxFilingPeriod) => void;
  onExport?: (format: 'csv' | 'pdf') => void;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: Date;
  requestId: string;
}

export interface BulkOperationResult {
  succeeded: number;
  failed: number;
  errors: {
    index: number;
    error: string;
  }[];
}
