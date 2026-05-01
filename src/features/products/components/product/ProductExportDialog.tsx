'use client';

import { useState } from 'react';
import {
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  File,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { api } from '@/../convex/_generated/api';
import { useQuery } from 'convex/react';
import { toast } from 'sonner';

interface ProductExportDialogProps {
  className?: string;
}

type ExportFormat = 'csv' | 'json' | 'excel' | 'pdf';

export default function ProductExportDialog({
  className
}: ProductExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Query products for export
  const exportData = useQuery(api.products.exportProducts, {
    format,
    includeDeleted
  }) as { products: any[]; totalCount: number; exportedAt: number } | undefined;

  const formatOptions = [
    {
      id: 'csv',
      label: 'CSV',
      description: 'Comma-separated values (Excel compatible)',
      icon: FileSpreadsheet,
      extension: '.csv'
    },
    {
      id: 'json',
      label: 'JSON',
      description: 'JavaScript Object Notation',
      icon: FileJson,
      extension: '.json'
    },
    {
      id: 'excel',
      label: 'Excel',
      description: 'Microsoft Excel spreadsheet',
      icon: FileText,
      extension: '.xlsx'
    },
    {
      id: 'pdf',
      label: 'PDF',
      description: 'Portable Document Format',
      icon: File,
      extension: '.pdf'
    }
  ];

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';

    const headers = [
      'id',
      'name',
      'sku',
      'slug',
      'barcode',
      'categoryName',
      'categoryId',
      'subcategory',
      'description',
      'brand',
      'purchasePrice',
      'sellingPrice',
      'discountPrice',
      'stockLevel',
      'inStock',
      'reorderLevel',
      'stockStatus',
      'supplierName',
      'supplierId',
      'isDeleted',
      'createdAt',
      'updatedAt'
    ];

    const rows = data.map((product) =>
      headers
        .map((header) => {
          const value = product[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return String(value);
        })
        .join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  };

  const convertToJSON = (data: any[]): string => {
    return JSON.stringify(data, null, 2);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toISOString().split('T')[0];
  };

  const handleExport = async () => {
    if (!exportData?.products || exportData.products.length === 0) {
      toast.error('No products to export');
      return;
    }

    setIsExporting(true);

    try {
      let content: string;
      let mimeType: string;
      let extension: string;

      if (format === 'csv') {
        content = convertToCSV(exportData.products);
        mimeType = 'text/csv';
        extension = 'csv';
      } else if (format === 'json') {
        content = convertToJSON(exportData.products);
        mimeType = 'application/json';
        extension = 'json';
      } else if (format === 'excel') {
        // Excel format - convert to CSV with BOM for Excel compatibility
        content = '\uFEFF' + convertToCSV(exportData.products);
        mimeType = 'application/vnd.ms-excel';
        extension = 'xls';
      } else if (format === 'pdf') {
        // Generate HTML for PDF (print-friendly)
        const rows = exportData.products
          .map(
            (p) => `
          <tr>
            <td>${p.name || ''}</td>
            <td>${p.sku || ''}</td>
            <td>${p.categoryName || ''}</td>
            <td>${p.brand || ''}</td>
            <td>${p.sellingPrice || ''}</td>
            <td>${p.stockLevel ?? ''}</td>
            <td>${p.stockStatus || ''}</td>
          </tr>
        `
          )
          .join('');

        content = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Products Export</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background: #f5f5f5; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            <h1>Products Export</h1>
            <p>Total Products: ${exportData.products.length}</p>
            <p>Exported: ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </body>
          </html>
        `;
        mimeType = 'text/html';
        extension = 'html';
      } else {
        // Excel format - convert to CSV with BOM for Excel compatibility
        content = '\uFEFF' + convertToCSV(exportData.products);
        mimeType = 'application/vnd.ms-excel';
        extension = 'csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_export_${formatDate(Date.now())}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${exportData.products.length} products`);
      setOpen(false);
    } catch (error) {
      toast.error('Failed to export products');
    }

    setIsExporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className={cn('text-xs md:text-sm', className)}
        >
          <Download className='mr-2 h-4 w-4' />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Export Products</DialogTitle>
          <DialogDescription>
            Export your products to a file. Choose your preferred format.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Format Selection */}
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as ExportFormat)}
              className='grid grid-cols-4 gap-2'
            >
              {formatOptions.map((option) => (
                <Label
                  key={option.id}
                  className={cn(
                    'flex cursor-pointer flex-col items-center justify-center rounded-lg border p-3 text-center transition-colors',
                    format === option.id
                      ? 'border-primary bg-primary/10'
                      : 'hover:bg-muted'
                  )}
                >
                  <RadioGroupItem value={option.id} className='sr-only' />
                  <option.icon className='mb-1 h-5 w-5' />
                  <span className='text-sm font-medium'>{option.label}</span>
                  <span className='text-xs text-muted-foreground'>
                    {option.extension}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Options */}
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='includeDeleted'
              checked={includeDeleted}
              onCheckedChange={(checked) =>
                setIncludeDeleted(checked as boolean)
              }
            />
            <Label htmlFor='includeDeleted' className='text-sm font-normal'>
              Include deleted products
            </Label>
          </div>

          {/* Preview */}
          <div className='rounded-lg border bg-muted p-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>
                Products to export
              </span>
              <span className='font-medium'>{exportData?.totalCount ?? 0}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => setOpen(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !exportData?.products?.length}
          >
            {isExporting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Exporting...
              </>
            ) : (
              <>
                <Download className='mr-2 h-4 w-4' />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
