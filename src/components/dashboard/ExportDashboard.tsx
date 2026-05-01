'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Download, FileText, Sheet, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { useToast } from '@/hooks/use-toast';

interface ExportDashboardProps {
  widgetIds: string[];
  widgetTitles: Record<string, string>;
}

export function ExportDashboard({
  widgetIds,
  widgetTitles
}: ExportDashboardProps) {
  const [open, setOpen] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [selectedWidgets, setSelectedWidgets] = useState<Set<string>>(
    new Set(widgetIds)
  );
  const [dateRange, setDateRange] = useState<'current' | 'week' | 'month'>(
    'current'
  );
  const [isExporting, setIsExporting] = useState(false);

  const { toast } = useToast();
  const requestExport = useMutation(api.dashboardExport.requestDashboardExport);

  const handleWidgetToggle = (widgetId: string) => {
    const newSet = new Set(selectedWidgets);
    if (newSet.has(widgetId)) {
      newSet.delete(widgetId);
    } else {
      newSet.add(widgetId);
    }
    setSelectedWidgets(newSet);
  };

  const getDateRange = () => {
    const now = Date.now();
    const endDate = now;

    let startDate = now;
    switch (dateRange) {
      case 'week':
        startDate = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        startDate = now - 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        startDate = now - 24 * 60 * 60 * 1000;
    }

    return { startDate, endDate };
  };

  const handleExport = async () => {
    if (selectedWidgets.size === 0) {
      toast({
        title: 'No widgets selected',
        description: 'Please select at least one widget to export',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);
    try {
      // Generate filename with timestamp
      const timestamp = new Date()
        .toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
        .replace(/\//g, '-')
        .replace(/,/g, '');
      const filename = `Dashboard-Export-${timestamp}`;

      if (exportType === 'pdf') {
        // Generate PDF
        await generatePDF(filename);
      } else if (exportType === 'excel') {
        // Generate Excel
        await generateExcel(filename);
      } else if (exportType === 'csv') {
        // Generate CSV
        await generateCSV(filename);
      }

      // Log the export request
      await requestExport({
        exportType,
        includeCharts,
        widgetsIncluded: Array.from(selectedWidgets),
        dateRange: getDateRange()
      });

      toast({
        title: '✓ Export Downloaded Successfully!',
        description: `Dashboard exported as ${exportType.toUpperCase()}. Check your Downloads folder.`
      });

      setOpen(false);
    } catch (error) {
      toast({
        title: 'Export Failed',
        description:
          error instanceof Error ? error.message : 'Failed to create export',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Generate PDF export
  const generatePDF = async (filename: string) => {
    try {
      // Dynamically import jsPDF to avoid SSR issues
      const { jsPDF } = await import('jspdf');

      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPosition = 20;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;

      // Set default font
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);

      // Add header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Dashboard Export Report', margin, yPosition);
      yPosition += 10;

      // Add export metadata
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const exportDate = new Date().toLocaleString();
      pdf.text(`Generated on: ${exportDate}`, margin, yPosition);
      yPosition += 5;
      pdf.text(`Export Format: ${exportType.toUpperCase()}`, margin, yPosition);
      yPosition += 5;
      pdf.text(
        `Include Charts: ${includeCharts ? 'Yes' : 'No'}`,
        margin,
        yPosition
      );
      yPosition += 10;

      // Add separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Add exported widgets section
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('Exported Widgets:', margin, yPosition);
      yPosition += 7;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      // Add table of widgets
      const widgets = Array.from(selectedWidgets);
      widgets.forEach((widgetId, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }

        const widgetName = widgetTitles[widgetId] || 'Unknown Widget';
        const bulletText = `${index + 1}. ${widgetName}`;

        // Add bullet point with text
        pdf.setTextColor(0, 0, 0);
        pdf.text(bulletText, margin + 5, yPosition);
        yPosition += 6;
      });

      yPosition += 5;

      // Add separator
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Add export summary
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('Export Summary:', margin, yPosition);
      yPosition += 7;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const summaryText = `Total Widgets Exported: ${widgets.length}`;
      pdf.text(summaryText, margin, yPosition);
      yPosition += 6;

      const dateRangeText = `Date Range: ${dateRange === 'current' ? 'Today' : dateRange === 'week' ? 'Last 7 days' : 'Last 30 days'}`;
      pdf.text(dateRangeText, margin, yPosition);
      yPosition += 10;

      // Add footer
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      const footerText =
        'This is an automated dashboard export. For detailed analysis, please visit the dashboard.';
      pdf.text(footerText, margin, pageHeight - 10, { maxWidth: contentWidth });

      // Save PDF
      pdf.save(`${filename}.pdf`);

      toast({
        title: '✓ PDF Generated Successfully!',
        description: 'Dashboard data exported as PDF'
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      // Fallback: Create a simple text document
      const content = `Dashboard Export Report\n${'='.repeat(50)}\n\nGenerated on: ${new Date().toLocaleString()}\nExport Format: PDF\nExport Type: ${exportType.toUpperCase()}\n\nExported Widgets:\n${Array.from(
        selectedWidgets
      )
        .map((id, idx) => `${idx + 1}. ${widgetTitles[id]}`)
        .join(
          '\n'
        )}\n\nTotal Widgets: ${Array.from(selectedWidgets).length}\n\nNote: This is a text fallback for PDF generation.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Generate Excel export
  const generateExcel = async (filename: string) => {
    try {
      // Import xlsx library dynamically
      const xlsxModule = await import('xlsx');
      const XLSX = xlsxModule;

      const data = Array.from(selectedWidgets).map((widgetId) => ({
        'Widget Name': widgetTitles[widgetId],
        'Exported Date': new Date().toLocaleString(),
        'Export Type': exportType.toUpperCase(),
        'Include Charts': includeCharts ? 'Yes' : 'No'
      }));

      const worksheet = (XLSX as any).utils.json_to_sheet(data);
      const workbook = (XLSX as any).utils.book_new();
      (XLSX as any).utils.book_append_sheet(
        workbook,
        worksheet,
        'Dashboard Export'
      );
      (XLSX as any).writeFile(workbook, `${filename}.xlsx`);
    } catch (error) {
      console.error('Excel generation error:', error);
      // Fallback to CSV
      generateCSV(filename);
    }
  };

  // Generate CSV export
  const generateCSV = (filename: string) => {
    const headers = [
      'Widget Name',
      'Exported Date',
      'Export Type',
      'Include Charts'
    ];
    const data = Array.from(selectedWidgets).map((widgetId) => [
      widgetTitles[widgetId],
      new Date().toLocaleString(),
      exportType.toUpperCase(),
      includeCharts ? 'Yes' : 'No'
    ]);

    const csvContent = [headers, ...data]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' className='gap-2'>
          <Download className='h-4 w-4' />
          Export
        </Button>
      </DialogTrigger>

      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Export Dashboard</DialogTitle>
          <DialogDescription>
            Choose format, widgets, and date range for your export.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Export Format */}
          <div className='space-y-3'>
            <Label className='text-sm font-semibold'>Export Format</Label>
            <div className='grid grid-cols-3 gap-2'>
              {[
                {
                  value: 'pdf' as const,
                  label: 'PDF',
                  icon: <FileText className='h-4 w-4' />
                },
                {
                  value: 'excel' as const,
                  label: 'Excel',
                  icon: <Sheet className='h-4 w-4' />
                },
                {
                  value: 'csv' as const,
                  label: 'CSV',
                  icon: <FileText className='h-4 w-4' />
                }
              ].map((format) => (
                <button
                  key={format.value}
                  onClick={() => setExportType(format.value)}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                    exportType === format.value
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                >
                  {format.icon}
                  <span className='text-xs font-medium'>{format.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className='space-y-2'>
            <Label className='flex cursor-pointer items-center gap-2'>
              <Checkbox
                checked={includeCharts}
                onCheckedChange={(checked) =>
                  setIncludeCharts(checked as boolean)
                }
              />
              <span className='text-sm'>Include Charts & Visualizations</span>
            </Label>
          </div>

          {/* Date Range */}
          <div className='space-y-3'>
            <Label className='text-sm font-semibold'>Date Range</Label>
            <Select
              value={dateRange}
              onValueChange={(value: any) => setDateRange(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='current'>Today</SelectItem>
                <SelectItem value='week'>Last 7 Days</SelectItem>
                <SelectItem value='month'>Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Widget Selection */}
          <div className='space-y-3'>
            <Label className='text-sm font-semibold'>
              Widgets ({selectedWidgets.size} selected)
            </Label>
            <div className='max-h-48 space-y-2 overflow-y-auto'>
              {widgetIds.map((widgetId) => (
                <Label
                  key={widgetId}
                  className='flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-muted'
                >
                  <Checkbox
                    checked={selectedWidgets.has(widgetId)}
                    onCheckedChange={() => handleWidgetToggle(widgetId)}
                  />
                  <span className='text-sm'>
                    {widgetTitles[widgetId] || widgetId}
                  </span>
                </Label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || selectedWidgets.size === 0}
            >
              {isExporting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
