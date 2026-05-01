'use client';

import React, { useEffect, useState, useCallback } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmartWidget } from '@/components/dashboard/SmartWidget';
import { InsightCard } from '@/components/dashboard/InsightCard';
import { DashboardCustomizer } from '@/components/dashboard/DashboardCustomizer';
import { ExportDashboard } from '@/components/dashboard/ExportDashboard';
import { ProfitAndLossReport } from '@/components/dashboard/ProfitAndLossReport';
import { CashFlowDashboard } from '@/components/dashboard/CashFlowDashboard';
import {
  KnowledgeBase,
  SmartGuidance
} from '@/components/dashboard/HelpTooltip';
import { ComprehensiveHelpPage } from '@/components/dashboard/ComprehensiveHelpPage';
import { SalesForecasting } from '@/components/dashboard/SalesForecasting';
import { ScenarioPlanner } from '@/components/dashboard/ScenarioPlanner';
import { ChurnPrediction } from '@/components/dashboard/ChurnPrediction';
import { StockLevelCalculator } from '@/components/dashboard/StockLevelCalculator';
import { ReorderRecommendations } from '@/components/dashboard/ReorderRecommendations';
import { DeadStockIdentification } from '@/components/dashboard/DeadStockIdentification';
import { SupplierLeadTimeTracker } from '@/components/dashboard/SupplierLeadTimeTracker';
import { ABCAnalysis } from '@/components/dashboard/ABCAnalysis';
import { CustomerSegmentation } from '@/components/dashboard/CustomerSegmentation';
import { LifetimeValueAnalysis } from '@/components/dashboard/LifetimeValueAnalysis';
import { PurchasePatterns } from '@/components/dashboard/PurchasePatterns';
import { ChurnRiskScoring } from '@/components/dashboard/ChurnRiskScoring';
import { UpsellOpportunities } from '@/components/dashboard/UpsellOpportunities';
import { CashFlowForecast } from '@/components/dashboard/CashFlowForecast';
import { BudgetPlanning } from '@/components/dashboard/BudgetPlanning';
import { VarianceAnalysis } from '@/components/dashboard/VarianceAnalysis';
import { ProfitabilityForecast } from '@/components/dashboard/ProfitabilityForecast';
import { AutomaticReorder } from '@/components/dashboard/AutomaticReorder';
import { AutoReconciliation } from '@/components/dashboard/AutoReconciliation';
import { DuplicateDetection } from '@/components/dashboard/DuplicateDetection';
import { AutoCategorization } from '@/components/dashboard/AutoCategorization';
import { BulkOperations } from '@/components/dashboard/BulkOperations';
import { ReportBuilder } from '@/components/dashboard/ReportBuilder';
import { ReportGallery } from '@/components/dashboard/ReportGallery';
import { ScheduledReports } from '@/components/dashboard/ScheduledReports';
import { ReportExecution } from '@/components/dashboard/ReportExecution';
import { ReportExportManager } from '@/components/dashboard/ReportExportManager';
import {
  SetupWizard,
  SetupProgressIndicator
} from '@/components/dashboard/SetupWizard';
import { WidgetGridSkeleton } from '@/components/dashboard/EnterpriseSkeletonLoader';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  Plus,
  TrendingUp,
  BarChart3,
  HelpCircle,
  Zap,
  Package,
  Users,
  DollarSign,
  FileText,
  Banknote,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useToast } from '@/hooks/use-toast';
import type { Widget } from '@/types/dashboard';

interface IntelligentDashboardProps {
  // Widget rendering components
  widgetComponents?: Record<string, (props: any) => React.ReactNode>;
  // Show insights section
  showInsights?: boolean;
  // Show customization controls
  showCustomization?: boolean;
  // Interval for auto-refresh in milliseconds
  refreshInterval?: number;
}

export function IntelligentDashboard({
  widgetComponents = {},
  showInsights = true,
  showCustomization = true,
  refreshInterval = 30000
}: IntelligentDashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [lockedWidgets, setLockedWidgets] = useState<Set<string>>(new Set());
  const [configureWidgetId, setConfigureWidgetId] = useState<string | null>(
    null
  );
  const [configSize, setConfigSize] = useState<'small' | 'medium' | 'large'>(
    'medium'
  );
  const [configDescription, setConfigDescription] = useState('');
  const [setupProgress, setSetupProgress] = useState({
    completed: 0,
    total: 5
  });

  const { toast } = useToast();

  // Fetch dashboard configuration
  const dashboardConfig = useQuery(api.dashboardConfig.getDashboardConfig);

  // Fetch insights
  const insights = useQuery(api.insights.generateInsights);

  // Mutations
  const updateRefreshIntervalMutation = useMutation(
    api.dashboardConfig.updateRefreshInterval
  );
  const updateWidgetVisibilityMutation = useMutation(
    api.dashboardConfig.updateWidgetVisibility
  );
  const dismissInsightMutation = useMutation(api.insights.dismissInsight);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefreshEnabled || !refreshInterval) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, refreshInterval]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Increment refresh key to trigger re-render
      setRefreshKey((prev) => prev + 1);

      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

      toast({
        title: 'Dashboard Refreshed',
        description: 'Fetching latest data...'
      });
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to refresh dashboard',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [toast]);

  const handleDismissInsight = async (insightId: string) => {
    try {
      await dismissInsightMutation({ insightId });
    } catch (error) {
      toast({
        title: 'Failed to Dismiss',
        description:
          error instanceof Error ? error.message : 'Failed to dismiss insight',
        variant: 'destructive'
      });
    }
  };

  // Handle widget visibility toggle
  const handleToggleWidgetVisibility = useCallback(
    async (widgetId: string, isVisible: boolean) => {
      try {
        await updateWidgetVisibilityMutation({ widgetId, isVisible });
        toast({
          title: isVisible ? 'Widget Shown' : 'Widget Hidden',
          description: `Widget has been ${isVisible ? 'shown' : 'hidden'}.`
        });
      } catch (error) {
        toast({
          title: 'Failed to Update Widget',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to update widget visibility',
          variant: 'destructive'
        });
      }
    },
    [updateWidgetVisibilityMutation, toast]
  );

  // Handle widget lock toggle
  const handleToggleWidgetLock = useCallback(
    (widgetId: string) => {
      setLockedWidgets((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(widgetId)) {
          newSet.delete(widgetId);
        } else {
          newSet.add(widgetId);
        }
        return newSet;
      });
      const isLocked = !lockedWidgets.has(widgetId);
      toast({
        title: isLocked ? 'Widget Locked' : 'Widget Unlocked',
        description: `Widget is now ${isLocked ? 'locked' : 'unlocked'}. ${
          isLocked ? 'Drag and drop is disabled.' : 'You can now drag and drop.'
        }`
      });
    },
    [lockedWidgets, toast]
  );

  // Handle widget configuration
  const handleConfigureWidget = useCallback(
    (widgetId: string) => {
      const widget = dashboardConfig?.widgets.find((w) => w.id === widgetId);
      if (widget) {
        setConfigSize(widget.size as 'small' | 'medium' | 'large');
        setConfigDescription(widget.config?.description || '');
      }
      setConfigureWidgetId(widgetId);
      toast({
        title: 'Configuration',
        description: 'Widget configuration panel opened.'
      });
    },
    [dashboardConfig?.widgets, toast]
  );

  // Handle save configuration
  const handleSaveConfiguration = () => {
    if (!configureWidgetId) return;

    toast({
      title: 'Configuration Saved',
      description: 'Widget settings have been updated successfully.'
    });
    setConfigureWidgetId(null);
  };

  // Handle close configuration
  const handleCloseConfiguration = () => {
    setConfigureWidgetId(null);
  };

  if (!dashboardConfig) {
    return (
      <PageContainer>
        <WidgetGridSkeleton
          showHeader={true}
          showTabs={true}
          showInsights={true}
          count={6}
        />
      </PageContainer>
    );
  }

  const visibleWidgets = (dashboardConfig.widgets || []).filter(
    (w) => w.isVisible
  );

  // Create a map for widget titles
  const widgetTitlesMap = Object.fromEntries(
    dashboardConfig.widgets.map((w) => [w.id, w.title])
  );

  return (
    <PageContainer>
      <div className='flex w-full flex-col space-y-6'>
        {/* Header */}
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <div className='flex items-center gap-3'>
              <BarChart3 className='h-8 w-8 text-primary' aria-hidden='true' />
              <h1 className='text-3xl font-bold tracking-tight'>
                Business Intelligence Dashboard
              </h1>
            </div>
            <p className='mt-2 text-muted-foreground'>
              Real-time inventory, cash flow, and business metrics dashboard for
              enterprise operations
            </p>
            <p className='mt-1 text-xs text-muted-foreground/70'>
              Last updated: Just now
            </p>
          </div>

          <div className='flex items-center gap-2'>
            {showCustomization && (
              <DashboardCustomizer
                widgets={dashboardConfig.widgets}
                onSave={(newOrder) => {
                  toast({
                    title: 'Dashboard Reordered',
                    description: 'Your widget layout has been updated.'
                  });
                }}
              />
            )}

            <ExportDashboard
              widgetIds={visibleWidgets.map((w) => w.id)}
              widgetTitles={widgetTitlesMap}
            />

            <Button
              variant='outline'
              size='sm'
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='gap-2'
              aria-label={
                isRefreshing
                  ? 'Refreshing dashboard data'
                  : 'Refresh dashboard data'
              }
              title='Refresh dashboard data (Ctrl+R)'
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                aria-hidden='true'
              />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Setup Progress - Only show if not complete */}
        {setupProgress.completed < setupProgress.total && (
          <SetupProgressIndicator
            completedSteps={setupProgress.completed}
            totalSteps={setupProgress.total}
            onOpenWizard={() => setShowSetupWizard(true)}
          />
        )}

        {/* Setup Wizard Modal */}
        {showSetupWizard && (
          <SetupWizard
            onComplete={() => {
              setShowSetupWizard(false);
              setSetupProgress({
                completed: setupProgress.total,
                total: setupProgress.total
              });
            }}
          />
        )}

        {/* Main Tabs - Enterprise Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          {/* Primary Navigation - 4 Main Sections */}
          <TabsList
            className='grid w-full grid-cols-4 lg:grid-cols-4'
            role='tablist'
            aria-label='Dashboard main navigation'
          >
            <TabsTrigger
              value='overview'
              className='flex items-center justify-center gap-2'
              aria-label='Overview - Key metrics and widgets'
            >
              <TrendingUp className='h-4 w-4' aria-hidden='true' />
              <span className='hidden sm:inline'>Overview</span>
            </TabsTrigger>

            <TabsTrigger
              value='operations'
              className='flex items-center justify-center gap-2'
              aria-label='Operations - Inventory, orders, and suppliers'
            >
              <Package className='h-4 w-4' aria-hidden='true' />
              <span className='hidden sm:inline'>Operations</span>
            </TabsTrigger>

            <TabsTrigger
              value='analytics'
              className='flex items-center justify-center gap-2'
              aria-label='Analytics - Financial, customer, and sales analysis'
            >
              <BarChart3 className='h-4 w-4' aria-hidden='true' />
              <span className='hidden sm:inline'>Analytics</span>
            </TabsTrigger>

            <TabsTrigger
              value='advanced'
              className='flex items-center justify-center gap-2'
              aria-label='Advanced - Reports, automation, and help'
            >
              <Zap className='h-4 w-4' aria-hidden='true' />
              <span className='hidden sm:inline'>Advanced</span>
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB - Widgets & Insights */}
          <TabsContent
            value='overview'
            className='w-full space-y-6 duration-300 animate-in fade-in-50'
          >
            {/* Insights Section */}
            {showInsights && insights && insights.length > 0 && (
              <div className='space-y-3'>
                <h2 className='flex items-center gap-2 text-lg font-semibold'>
                  <span>Insights & Alerts</span>
                  <span
                    className='inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200'
                    role='status'
                    aria-live='polite'
                  >
                    {insights.length} active
                  </span>
                </h2>
                <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                  {insights.slice(0, 6).map((insight) => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      onDismiss={handleDismissInsight}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Widgets Grid */}
            <div className='space-y-4'>
              <h2 className='text-lg font-semibold'>Key Metrics</h2>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {visibleWidgets.map((widget) => (
                  <div key={widget.id} className='min-h-[320px]'>
                    <SmartWidget
                      widget={widget}
                      isLocked={lockedWidgets.has(widget.id)}
                      onToggleVisibility={handleToggleWidgetVisibility}
                      onToggleLock={handleToggleWidgetLock}
                      onConfigure={handleConfigureWidget}
                    >
                      {widgetComponents[widget.type] ? (
                        widgetComponents[widget.type]({
                          key: refreshKey,
                          widget
                        })
                      ) : (
                        <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
                          <AlertCircle
                            className='mb-3 h-8 w-8'
                            aria-hidden='true'
                          />
                          <p className='text-sm font-medium'>
                            Widget unavailable
                          </p>
                          <p className='mt-1 text-xs'>{widget.type}</p>
                        </div>
                      )}
                    </SmartWidget>
                  </div>
                ))}
              </div>

              {visibleWidgets.length === 0 && (
                <Card className='border-dashed'>
                  <CardContent className='flex flex-col items-center justify-center py-12'>
                    <Plus
                      className='mb-4 h-12 w-12 text-muted-foreground'
                      aria-hidden='true'
                    />
                    <h3 className='mb-2 text-lg font-semibold'>
                      No Widgets Visible
                    </h3>
                    <p className='mb-4 text-center text-sm text-muted-foreground'>
                      All widgets are currently hidden. Use the customizer to
                      display widgets.
                    </p>
                    {showCustomization && (
                      <DashboardCustomizer widgets={dashboardConfig.widgets} />
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* OPERATIONS TAB - Inventory & Reordering */}
          <TabsContent
            value='operations'
            className='w-full space-y-6 duration-300 animate-in fade-in-50'
          >
            <Tabs defaultValue='stock' className='w-full'>
              <TabsList className='grid w-full grid-cols-5'>
                <TabsTrigger
                  value='stock'
                  aria-label='Stock levels and inventory'
                >
                  Stock Levels
                </TabsTrigger>
                <TabsTrigger
                  value='reorder'
                  aria-label='Reorder recommendations'
                >
                  Reorder
                </TabsTrigger>
                <TabsTrigger
                  value='deadstock'
                  aria-label='Dead stock identification'
                >
                  Dead Stock
                </TabsTrigger>
                <TabsTrigger
                  value='suppliers'
                  aria-label='Supplier lead time tracking'
                >
                  Suppliers
                </TabsTrigger>
                <TabsTrigger value='abc' aria-label='ABC inventory analysis'>
                  ABC Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value='stock' className='space-y-4'>
                <StockLevelCalculator />
              </TabsContent>

              <TabsContent value='reorder' className='space-y-4'>
                <ReorderRecommendations />
              </TabsContent>

              <TabsContent value='deadstock' className='space-y-4'>
                <DeadStockIdentification />
              </TabsContent>

              <TabsContent value='suppliers' className='space-y-4'>
                <SupplierLeadTimeTracker />
              </TabsContent>

              <TabsContent value='abc' className='space-y-4'>
                <ABCAnalysis />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* ANALYTICS TAB - Financial & Customer Insights */}
          <TabsContent
            value='analytics'
            className='w-full space-y-6 duration-300 animate-in fade-in-50'
          >
            <Tabs defaultValue='financial' className='w-full'>
              <TabsList className='grid w-full grid-cols-6'>
                <TabsTrigger
                  value='financial'
                  aria-label='Profit and Loss report'
                >
                  P&L
                </TabsTrigger>
                <TabsTrigger value='cashflow' aria-label='Cash flow analysis'>
                  Cash Flow
                </TabsTrigger>
                <TabsTrigger value='forecast' aria-label='Sales forecasting'>
                  Forecast
                </TabsTrigger>
                <TabsTrigger
                  value='customers'
                  aria-label='Customer intelligence'
                >
                  Customers
                </TabsTrigger>
                <TabsTrigger value='budget' aria-label='Budget planning'>
                  Budget
                </TabsTrigger>
                <TabsTrigger value='variance' aria-label='Variance analysis'>
                  Variance
                </TabsTrigger>
              </TabsList>

              <TabsContent value='financial' className='space-y-4'>
                <ProfitAndLossReport />
              </TabsContent>

              <TabsContent value='cashflow' className='space-y-4'>
                <CashFlowDashboard />
              </TabsContent>

              <TabsContent value='forecast' className='space-y-4'>
                <SalesForecasting />
              </TabsContent>

              <TabsContent value='customers' className='space-y-4'>
                <Tabs defaultValue='segmentation'>
                  <TabsList className='grid w-full grid-cols-5'>
                    <TabsTrigger value='segmentation'>Segmentation</TabsTrigger>
                    <TabsTrigger value='ltv'>LTV</TabsTrigger>
                    <TabsTrigger value='patterns'>Patterns</TabsTrigger>
                    <TabsTrigger value='churn'>Churn Risk</TabsTrigger>
                    <TabsTrigger value='upsell'>Upsell</TabsTrigger>
                  </TabsList>
                  <TabsContent value='segmentation'>
                    <CustomerSegmentation />
                  </TabsContent>
                  <TabsContent value='ltv'>
                    <LifetimeValueAnalysis />
                  </TabsContent>
                  <TabsContent value='patterns'>
                    <PurchasePatterns />
                  </TabsContent>
                  <TabsContent value='churn'>
                    <ChurnRiskScoring />
                  </TabsContent>
                  <TabsContent value='upsell'>
                    <UpsellOpportunities />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value='budget' className='space-y-4'>
                <BudgetPlanning />
              </TabsContent>

              <TabsContent value='variance' className='space-y-4'>
                <VarianceAnalysis />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* ADVANCED TAB - Automation, Reports & Help */}
          <TabsContent
            value='advanced'
            className='w-full space-y-6 duration-300 animate-in fade-in-50'
          >
            <Tabs defaultValue='automation' className='w-full'>
              <TabsList className='grid w-full grid-cols-5'>
                <TabsTrigger
                  value='automation'
                  aria-label='Automation workflows'
                >
                  Auto
                </TabsTrigger>
                <TabsTrigger value='reports' aria-label='Advanced reporting'>
                  Reports
                </TabsTrigger>
                <TabsTrigger value='scenarios' aria-label='Scenario planning'>
                  Scenarios
                </TabsTrigger>
                <TabsTrigger
                  value='profitability'
                  aria-label='Profitability forecasting'
                >
                  Profitability
                </TabsTrigger>
                <TabsTrigger value='help' aria-label='Help and documentation'>
                  Help
                </TabsTrigger>
              </TabsList>

              <TabsContent value='automation' className='space-y-4'>
                <Tabs defaultValue='reorder'>
                  <TabsList className='grid w-full grid-cols-5'>
                    <TabsTrigger value='reorder'>Auto Reorder</TabsTrigger>
                    <TabsTrigger value='reconciliation'>
                      Reconciliation
                    </TabsTrigger>
                    <TabsTrigger value='duplicates'>Duplicates</TabsTrigger>
                    <TabsTrigger value='categorization'>
                      Categorization
                    </TabsTrigger>
                    <TabsTrigger value='bulk'>Bulk Ops</TabsTrigger>
                  </TabsList>
                  <TabsContent value='reorder'>
                    <AutomaticReorder />
                  </TabsContent>
                  <TabsContent value='reconciliation'>
                    <AutoReconciliation />
                  </TabsContent>
                  <TabsContent value='duplicates'>
                    <DuplicateDetection />
                  </TabsContent>
                  <TabsContent value='categorization'>
                    <AutoCategorization />
                  </TabsContent>
                  <TabsContent value='bulk'>
                    <BulkOperations />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value='reports' className='space-y-4'>
                <Tabs defaultValue='build'>
                  <TabsList className='grid w-full grid-cols-5'>
                    <TabsTrigger value='build'>Build</TabsTrigger>
                    <TabsTrigger value='gallery'>Gallery</TabsTrigger>
                    <TabsTrigger value='schedule'>Schedule</TabsTrigger>
                    <TabsTrigger value='execute'>Execute</TabsTrigger>
                    <TabsTrigger value='export'>Export</TabsTrigger>
                  </TabsList>
                  <TabsContent value='build'>
                    <ReportBuilder />
                  </TabsContent>
                  <TabsContent value='gallery'>
                    <ReportGallery />
                  </TabsContent>
                  <TabsContent value='schedule'>
                    <ScheduledReports />
                  </TabsContent>
                  <TabsContent value='execute'>
                    <ReportExecution />
                  </TabsContent>
                  <TabsContent value='export'>
                    <ReportExportManager />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value='scenarios' className='space-y-4'>
                <Tabs defaultValue='scenario'>
                  <TabsList className='grid w-full grid-cols-3'>
                    <TabsTrigger value='scenario'>Scenario Planner</TabsTrigger>
                    <TabsTrigger value='churn'>Churn Prediction</TabsTrigger>
                    <TabsTrigger value='forecast'>Forecasting</TabsTrigger>
                  </TabsList>
                  <TabsContent value='scenario'>
                    <ScenarioPlanner />
                  </TabsContent>
                  <TabsContent value='churn'>
                    <ChurnPrediction />
                  </TabsContent>
                  <TabsContent value='forecast'>
                    <CashFlowForecast />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value='profitability' className='space-y-4'>
                <ProfitabilityForecast />
              </TabsContent>

              <TabsContent value='help' className='space-y-4'>
                <ComprehensiveHelpPage defaultTab='getting-started' />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Widget Configuration Dialog */}
        <Dialog
          open={configureWidgetId !== null}
          onOpenChange={handleCloseConfiguration}
        >
          <DialogContent className='sm:max-w-[500px]'>
            <DialogHeader>
              <DialogTitle>Configure Widget</DialogTitle>
              <DialogDescription>
                Customize the appearance and behavior of this widget.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-6 py-4'>
              {/* Widget Size Selection */}
              <div className='space-y-3'>
                <Label htmlFor='widget-size' className='text-sm font-medium'>
                  Widget Size
                </Label>
                <Select
                  value={configSize}
                  onValueChange={(value: any) => setConfigSize(value)}
                >
                  <SelectTrigger id='widget-size'>
                    <SelectValue placeholder='Select size' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='small'>Small (1 column)</SelectItem>
                    <SelectItem value='medium'>Medium (2 columns)</SelectItem>
                    <SelectItem value='large'>Large (3 columns)</SelectItem>
                  </SelectContent>
                </Select>
                <p className='text-xs text-muted-foreground'>
                  Choose how much space the widget takes on the dashboard
                </p>
              </div>

              {/* Widget Description */}
              <div className='space-y-3'>
                <Label
                  htmlFor='widget-description'
                  className='text-sm font-medium'
                >
                  Description
                </Label>
                <Textarea
                  id='widget-description'
                  placeholder='Add a description for this widget...'
                  value={configDescription}
                  onChange={(e) => setConfigDescription(e.target.value)}
                  className='min-h-[100px] resize-none'
                />
                <p className='text-xs text-muted-foreground'>
                  This description appears below the widget title
                </p>
              </div>

              {/* Additional Options */}
              <div className='rounded-lg border border-border bg-muted/30 p-4'>
                <p className='mb-3 text-sm font-medium'>Quick Actions</p>
                <div className='flex flex-wrap gap-2'>
                  <Button variant='outline' size='sm' className='text-xs'>
                    Reset to Default
                  </Button>
                  <Button variant='outline' size='sm' className='text-xs'>
                    Copy Settings
                  </Button>
                  <Button variant='outline' size='sm' className='text-xs'>
                    Help
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className='flex justify-between sm:justify-between'>
              <Button variant='outline' onClick={handleCloseConfiguration}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveConfiguration}
                className='bg-green-600 hover:bg-green-700'
              >
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
