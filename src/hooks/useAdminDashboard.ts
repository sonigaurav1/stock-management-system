// Custom hooks for Admin Dashboard data fetching
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

// ============ ANALYTICS HOOKS ============
export function useAnalyticsData(months = 6) {
  return useQuery(api.admin.getAnalyticsData, { months });
}

// ============ KPI HOOKS ============
export function useKPIMetrics() {
  return useQuery(api.admin.getKPIMetrics, {});
}

// ============ TEAM MANAGEMENT HOOKS ============
export function useTeamMembers(role?: string) {
  return useQuery(api.admin.getTeamMembers, { role });
}

export function useInviteTeamMember() {
  return useMutation(api.admin.inviteTeamMember);
}

export function useUpdateTeamMemberRole() {
  return useMutation(api.admin.updateTeamMemberRole);
}

export function useRemoveTeamMember() {
  return useMutation(api.admin.removeTeamMember);
}

// ============ AUDIT LOGS HOOKS ============
export function useAuditLogs(
  category?: string,
  status?: string,
  limit?: number
) {
  return useQuery(api.admin.getAuditLogs, { category, status, limit });
}

export function useLogAuditEntry() {
  return useMutation(api.admin.logAuditEntry);
}

export function useAuditStats() {
  return useQuery(api.admin.getAuditStats, {});
}

// ============ COMPANY MANAGEMENT HOOKS ============
export function useCompanyDetails() {
  return useQuery(api.admin.getCompanyDetails, {});
}

export function useUpdateCompanyDetails() {
  return useMutation(api.admin.updateCompanyDetails);
}

export function useComplianceStatus() {
  return useQuery(api.admin.getComplianceStatus, {});
}

// ============ SYSTEM SETTINGS HOOKS ============
export function useSystemSettings() {
  return useQuery(api.admin.getSystemSettings, {});
}

export function useUpdateSystemSettings() {
  return useMutation(api.admin.updateSystemSettings);
}

// ============ DATA EXPORT HOOKS ============
export function useExportData() {
  return useMutation(api.admin.exportData);
}

export function useRecentExports(limit = 10) {
  return useQuery(api.admin.getRecentExports, { limit });
}

export function useScheduleExport() {
  return useMutation(api.admin.scheduleExport);
}

// ============ REPORTS HOOKS ============
export function useGenerateReport() {
  return useMutation(api.admin.generateReport);
}

export function useReportHistory(limit = 20) {
  return useQuery(api.admin.getReportHistory, { limit });
}
