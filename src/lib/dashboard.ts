// Re-export all dashboard-related hooks and utilities for easy usage
export { SmartWidget } from '@/components/dashboard/SmartWidget';
export { InsightCard } from '@/components/dashboard/InsightCard';
export { DashboardCustomizer } from '@/components/dashboard/DashboardCustomizer';
export { ExportDashboard } from '@/components/dashboard/ExportDashboard';
export { IntelligentDashboard } from '@/features/overview/components/IntelligentDashboard';
export {
  WidgetRenderer,
  widgetComponentFactory
} from '@/components/dashboard/WidgetRenderer';
export {
  KPIWidget,
  RevenueWidget,
  SalesCountWidget,
  CustomerCountWidget,
  LoadingKPIWidget
} from '@/components/dashboard/KPIWidgets';

// Re-export types
export type {
  BusinessType,
  WidgetType,
  Widget,
  DashboardLayout,
  Insight,
  InsightConfig
} from '@/types/dashboard';

export {
  WIDGET_CONFIGS,
  DEFAULT_LAYOUTS,
  type Widget as WidgetInterface
} from '@/types/dashboard';

// Usage Example:
// import { IntelligentDashboard, widgetComponentFactory } from '@/lib/dashboard';
//
// export function Page() {
//   return (
//     <IntelligentDashboard
//       widgetComponents={widgetComponentFactory}
//       showInsights={true}
//       showCustomization={true}
//       refreshInterval={30000}
//     />
//   );
// }
