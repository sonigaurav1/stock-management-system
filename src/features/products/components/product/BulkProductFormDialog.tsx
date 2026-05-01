'use client';

import { useState, useRef } from 'react';
import {
  Plus,
  Upload,
  FileSpreadsheet,
  X,
  Check,
  Download,
  AlertCircle,
  Trash2,
  CirclePlus,
  ClipboardPaste
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { api } from '@/../convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'sonner';
import CategoryFormDialog from '../category/CategoryFormDialog';
import SupplierFormDialog from '../suppliers/SupplierFormDialog';

// Default empty row
const createEmptyRow = () => ({
  name: '',
  sku: '',
  slug: '',
  barcode: '',
  categoryName: '',
  categoryId: '',
  subcategory: '',
  description: '',
  brand: '',
  purchasePrice: '',
  sellingPrice: '',
  stockLevel: '',
  reorderLevel: '',
  supplierName: '',
  supplierId: '',
  isValid: false,
  errors: {} as Record<string, string>
});

interface BulkProductFormDialogProps {
  className?: string;
  onProductsAdded?: () => void;
}

export default function BulkProductFormDialog({
  className,
  onProductsAdded
}: BulkProductFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [categoryForRow, setCategoryForRow] = useState<number | null>(null);
  const [rows, setRows] = useState<ReturnType<typeof createEmptyRow>[]>([
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow()
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showTextPaste, setShowTextPaste] = useState(false);
  const [pasteText, setPasteText] = useState('');

  // Query hooks
  const categories = useQuery(api.categories.getAllCategories) ?? [];
  const suppliers = useQuery(api.suppliers.getAllSuppliers) ?? [];

  // Mutation hook
  const createProducts = useMutation(api.products.createProducts);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddRow = () => {
    setRows([...rows, createEmptyRow()]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleRowChange = (index: number, field: string, value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };

    // Auto-generate slug from name
    if (field === 'name') {
      newRows[index].slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Auto-generate SKU from name if empty
    if (field === 'name' && !newRows[index].sku) {
      const prefix = value.substring(0, 3).toUpperCase();
      const timestamp = Date.now().toString(36).toUpperCase();
      newRows[index].sku = `${prefix}-${timestamp}`;
    }

    // Validate row
    newRows[index].isValid = !!(
      newRows[index].name &&
      newRows[index].sku &&
      newRows[index].categoryId
    );

    setRows(newRows);
  };

  const handleCategorySelect = (
    index: number,
    categoryName: string,
    categoryId: string
  ) => {
    const newRows = [...rows];
    newRows[index].categoryName = categoryName;
    newRows[index].categoryId = categoryId;
    newRows[index].isValid = !!(
      newRows[index].name &&
      newRows[index].sku &&
      categoryId
    );
    setRows(newRows);
    setCategoryDialogOpen(false);
    setCategoryForRow(null);
  };

  const handleAddNewCategory = (index: number) => {
    setCategoryForRow(index);
    setCategoryDialogOpen(true);
  };

  const handleAddNewSupplier = (index: number) => {
    setCategoryForRow(index);
    setSupplierDialogOpen(true);
  };

  const handleSupplierSelect = (
    index: number,
    supplierName: string,
    supplierId: string
  ) => {
    const newRows = [...rows];
    newRows[index].supplierName = supplierName;
    newRows[index].supplierId = supplierId;
    setRows(newRows);
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter((line) => line.trim());
      if (lines.length < 2) {
        toast.error('CSV file is empty or has no data rows');
        setIsLoading(false);
        return;
      }

      // Parse header
      const headers = lines[0]
        .split(',')
        .map((h) => h.trim().toLowerCase().replace(/\s+/g, ''));

      // Parse data rows
      const newRows: ReturnType<typeof createEmptyRow>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i]
          .split(',')
          .map((v) => v.trim().replace(/^"|"$/g, ''));
        const row: ReturnType<typeof createEmptyRow> = createEmptyRow();

        headers.forEach((header, j) => {
          if (values[j] !== undefined) {
            switch (header) {
              case 'name':
                row.name = values[j];
                row.slug = values[j]
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-|-$/g, '');
                break;
              case 'sku':
                row.sku = values[j];
                break;
              case 'barcode':
                row.barcode = values[j];
                break;
              case 'category':
              case 'categoryname':
                row.categoryName = values[j];
                break;
              case 'description':
                row.description = values[j];
                break;
              case 'brand':
                row.brand = values[j];
                break;
              case 'purchaseprice':
              case 'costprice':
                row.purchasePrice = values[j];
                break;
              case 'sellingprice':
              case 'price':
                row.sellingPrice = values[j];
                break;
              case 'stock':
              case 'stocklevel':
              case 'quantity':
                row.stockLevel = values[j];
                break;
              case 'reorderlevel':
              case 'reorder':
                row.reorderLevel = values[j];
                break;
              case 'supplier':
              case 'suppliername':
                row.supplierName = values[j];
                break;
            }
          }
        });

        // Auto-generate SKU if missing
        if (!row.sku) {
          const prefix = row.name?.substring(0, 3).toUpperCase() || 'PRD';
          row.sku = `${prefix}-${Date.now().toString(36).toUpperCase()}${i}`;
        }

        // Match category by name
        if (row.categoryName) {
          const matchedCategory = categories.find(
            (c) => c.name.toLowerCase() === row.categoryName?.toLowerCase()
          );
          if (matchedCategory) {
            row.categoryId = matchedCategory._id;
            row.categoryName = matchedCategory.name;
          }
        }

        // Match supplier by name
        if (row.supplierName) {
          const matchedSupplier = suppliers.find(
            (s) => s.name.toLowerCase() === row.supplierName?.toLowerCase()
          );
          if (matchedSupplier) {
            row.supplierId = matchedSupplier._id;
            row.supplierName = matchedSupplier.name;
          }
        }

        row.isValid = !!(row.name && row.sku && row.categoryId);
        newRows.push(row);
      }

      if (newRows.length > 0) {
        setRows(newRows);
        toast.success(`Loaded ${newRows.length} products from CSV`);
      }
    } catch (error) {
      toast.error('Failed to parse CSV file');
    }
    setIsLoading(false);
  };

  // STEP 3.4: Handle formatted text paste
  const handleTextPaste = async () => {
    if (!pasteText.trim()) {
      toast.error('Please paste some text');
      return;
    }

    setIsLoading(true);
    try {
      const lines = pasteText.split('\n').filter((line) => line.trim());
      if (lines.length === 0) {
        toast.error('No data found in pasted text');
        setIsLoading(false);
        return;
      }

      const newRows: ReturnType<typeof createEmptyRow>[] = [];

      // Try multiple parsing strategies
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Try different delimiters: tab, pipe, comma, semicolon
        let values: string[] = [];
        if (line.includes('\t')) {
          values = line.split('\t').map((v) => v.trim());
        } else if (line.includes('|')) {
          values = line.split('|').map((v) => v.trim());
        } else if (line.includes(';') && !line.includes(',')) {
          values = line.split(';').map((v) => v.trim());
        } else {
          // For comma, try to preserve quoted values
          const regex = /(?:^|,)(\"(?:[^\"]|\"\")*\"|[^,]*)/g;
          const matches: string[] = [];
          let match;
          while ((match = regex.exec(line)) !== null) {
            let val = match[1];
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.slice(1, -1).replace(/""/g, '"');
            }
            matches.push(val.trim());
          }
          values = matches.filter(Boolean);
        }

        const row: ReturnType<typeof createEmptyRow> = createEmptyRow();

        // Smart parsing: detect which column is which based on content
        // Look at position and try to identify: name, price, sku, category
        if (values[0]) {
          // First non-empty value is likely the product name
          row.name = values[0];
          row.slug = values[0]
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        }

        // Try to find prices in any numeric fields
        values.forEach((val, idx) => {
          const numVal = parseFloat(val.replace(/[^0-9.-]/g, ''));
          if (!isNaN(numVal)) {
            // If it's between 0-10000, could be price or stock
            if (numVal > 1000 && !row.sellingPrice) {
              row.sellingPrice = numVal.toString();
            } else if (numVal <= 500 && !row.stockLevel) {
              row.stockLevel = numVal.toString();
            } else if (!row.sellingPrice) {
              row.sellingPrice = numVal.toString();
            }
          }
          // Detect SKU patterns
          if (/^[A-Z0-9]{3,10}$/i.test(val) && !row.sku) {
            row.sku = val.toUpperCase();
          }
          // Detect category keywords
          const categoryKeywords = [
            'electronics',
            'clothing',
            'food',
            'book',
            'toy',
            'furniture',
            'phone',
            'laptop'
          ];
          if (
            categoryKeywords.some((k) => val.toLowerCase().includes(k)) &&
            !row.categoryName
          ) {
            row.categoryName = val;
          }
        });

        // Auto-generate SKU if missing
        if (!row.sku) {
          const prefix = row.name?.substring(0, 3).toUpperCase() || 'PRD';
          row.sku = `${prefix}-${Date.now().toString(36).toUpperCase()}${i}`;
        }

        // Match category by name
        if (row.categoryName) {
          const matchedCategory = categories.find(
            (c) => c.name.toLowerCase() === row.categoryName?.toLowerCase()
          );
          if (matchedCategory) {
            row.categoryId = matchedCategory._id;
            row.categoryName = matchedCategory.name;
          }
        }

        // Match supplier by name
        if (row.supplierName) {
          const matchedSupplier = suppliers.find(
            (s) => s.name.toLowerCase() === row.supplierName?.toLowerCase()
          );
          if (matchedSupplier) {
            row.supplierId = matchedSupplier._id;
            row.supplierName = matchedSupplier.name;
          }
        }

        row.isValid = !!(row.name && row.sku);
        newRows.push(row);
      }

      if (newRows.length > 0) {
        setRows(newRows);
        setShowTextPaste(false);
        setPasteText('');
        toast.success(`Loaded ${newRows.length} products from text`);
      }
    } catch (error) {
      toast.error('Failed to parse text');
    }
    setIsLoading(false);
  };

  const downloadTemplate = () => {
    const headers = [
      'name',
      'sku',
      'barcode',
      'category',
      'description',
      'brand',
      'purchasePrice',
      'sellingPrice',
      'stockLevel',
      'reorderLevel',
      'supplier'
    ];
    const sampleData = [
      'Sample Product,SKU-001,123456789,Electronics,Sample description,Brand A,100,199,50,10,Supplier A'
    ];

    const csv = [headers.join(','), ...sampleData.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    const validRows = rows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error('No valid products to add. Please fill in required fields.');
      return;
    }

    setIsLoading(true);
    try {
      // Transform rows to product format
      const products = validRows.map((row) => ({
        name: row.name,
        slug:
          row.slug ||
          row.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
        sku: row.sku,
        barcode: row.barcode || undefined,
        categoryName: row.categoryName,
        categoryId: row.categoryId,
        subcategory: row.subcategory || undefined,
        description: row.description || undefined,
        serialNumber: undefined,
        brand: row.brand || undefined,
        purchasePrice: row.purchasePrice || undefined,
        sellingPrice: row.sellingPrice
          ? parseFloat(row.sellingPrice)
          : undefined,
        stockLevel: row.stockLevel ? parseInt(row.stockLevel) : undefined,
        inStock: row.stockLevel ? parseInt(row.stockLevel) > 0 : undefined,
        stockStatus: row.stockLevel
          ? parseInt(row.stockLevel) === 0
            ? ('out_of_stock' as const)
            : ('in_stock' as const)
          : undefined,
        reorderLevel: row.reorderLevel ? parseInt(row.reorderLevel) : undefined,
        imageUrl: undefined,
        supplierName: row.supplierName || undefined,
        supplierId: row.supplierId || undefined
      }));

      const result = await createProducts({ products });

      setResults(result.results);
      setShowResults(true);

      if (result.successCount > 0) {
        toast.success(`Successfully created ${result.successCount} products`);
        onProductsAdded?.();
      }

      if (result.errorCount > 0) {
        toast.warning(`Failed to create ${result.errorCount} products`);
      }
    } catch (error) {
      toast.error('Failed to create products');
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
    setRows([
      createEmptyRow(),
      createEmptyRow(),
      createEmptyRow(),
      createEmptyRow(),
      createEmptyRow()
    ]);
    setResults([]);
    setShowResults(false);
  };

  const validCount = rows.filter((r) => r.isValid).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn('text-xs md:text-sm', className)}>
          <FileSpreadsheet className='mr-2 h-4 w-4' />
          Bulk Add Products
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[90vh] w-full max-w-7xl overflow-hidden'>
        <DialogHeader>
          <DialogTitle>Bulk Add Products</DialogTitle>
          <DialogDescription>
            Add multiple products at once. Fill in the spreadsheet below or
            upload a CSV file.
          </DialogDescription>
        </DialogHeader>

        {!showResults ? (
          <div className='flex flex-col gap-4'>
            {/* Actions */}
            <div className='flex flex-wrap items-center gap-2'>
              <input
                type='file'
                ref={fileInputRef}
                accept='.csv'
                onChange={handleCSVUpload}
                className='hidden'
              />
              <Button
                variant='outline'
                size='sm'
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Upload className='mr-2 h-4 w-4' />
                Import CSV
              </Button>
              <Button variant='outline' size='sm' onClick={downloadTemplate}>
                <Download className='mr-2 h-4 w-4' />
                Download Template
              </Button>
              <Button variant='outline' size='sm' onClick={handleAddRow}>
                <Plus className='mr-2 h-4 w-4' />
                Add Row
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowTextPaste(true)}
              >
                <ClipboardPaste className='mr-2 h-4 w-4' />
                Paste Text
              </Button>
            </div>

            {/* Progress */}
            <div className='flex items-center gap-2'>
              <Progress
                value={(validCount / rows.length) * 100}
                className='flex-1'
              />
              <span className='text-sm text-muted-foreground'>
                {validCount}/{rows.length} valid
              </span>
            </div>

            {/* Spreadsheet Grid */}
            <ScrollArea className='h-[500px]'>
              <div className='overflow-x-auto'>
                <table className='w-full min-w-[1200px] border-collapse text-sm'>
                  <thead className='sticky top-0 bg-muted'>
                    <tr>
                      <th className='w-10 p-2 text-left'>#</th>
                      <th className='min-w-[150px] p-2 text-left'>
                        Name
                        <span className='ml-1 text-xs text-red-500'>*</span>
                      </th>
                      <th className='min-w-[120px] p-2 text-left'>
                        SKU
                        <span className='ml-1 text-xs text-red-500'>*</span>
                      </th>
                      <th className='min-w-[100px] p-2 text-left'>Barcode</th>
                      <th className='min-w-[140px] p-2 text-left'>
                        <span className='flex items-center gap-1'>
                          Category
                          <span className='text-xs text-red-500'>*</span>
                          <button
                            type='button'
                            onClick={() => handleAddNewCategory(0)}
                            className='ml-1 flex h-5 w-5 items-center justify-center rounded hover:bg-muted'
                            title='Add new category'
                          >
                            <CirclePlus className='h-3 w-3 text-muted-foreground' />
                          </button>
                        </span>
                      </th>
                      <th className='min-w-[100px] p-2 text-left'>Brand</th>
                      <th className='min-w-[80px] p-2 text-left'>Cost Price</th>
                      <th className='min-w-[80px] p-2 text-left'>
                        Selling Price
                      </th>
                      <th className='min-w-[80px] p-2 text-left'>Stock</th>
                      <th className='min-w-[80px] p-2 text-left'>
                        Reorder Level
                      </th>
                      <th className='min-w-[100px] p-2 text-left'>
                        <span className='flex items-center gap-1'>
                          Supplier
                          <button
                            type='button'
                            onClick={() => handleAddNewSupplier(0)}
                            className='ml-1 flex h-5 w-5 items-center justify-center rounded hover:bg-muted'
                            title='Add new supplier'
                          >
                            <CirclePlus className='h-3 w-3 text-muted-foreground' />
                          </button>
                        </span>
                      </th>
                      <th className='w-10 p-2 text-center'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr
                        key={index}
                        className={cn(
                          'border-b',
                          row.isValid ? 'bg-green-50/50' : 'bg-red-50/50'
                        )}
                      >
                        <td className='p-2 text-center text-muted-foreground'>
                          {index + 1}
                        </td>
                        <td className='p-1'>
                          <Input
                            value={row.name}
                            onChange={(e) =>
                              handleRowChange(index, 'name', e.target.value)
                            }
                            placeholder='Product name'
                            className='h-8'
                          />
                        </td>
                        <td className='p-1'>
                          <Input
                            value={row.sku}
                            onChange={(e) =>
                              handleRowChange(index, 'sku', e.target.value)
                            }
                            placeholder='SKU'
                            className='h-8'
                          />
                        </td>
                        <td className='p-1'>
                          <Input
                            value={row.barcode}
                            onChange={(e) =>
                              handleRowChange(index, 'barcode', e.target.value)
                            }
                            placeholder='Barcode'
                            className='h-8'
                          />
                        </td>
                        <td className='p-1'>
                          <select
                            value={row.categoryId}
                            onChange={(e) => {
                              const cat = categories.find(
                                (c) => c._id === e.target.value
                              );
                              handleCategorySelect(
                                index,
                                cat?.name || '',
                                e.target.value
                              );
                            }}
                            className='h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm'
                          >
                            <option value=''>Select...</option>
                            {categories.map((cat) => (
                              <option key={cat._id} value={cat._id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className='p-1'>
                          <Input
                            value={row.brand}
                            onChange={(e) =>
                              handleRowChange(index, 'brand', e.target.value)
                            }
                            placeholder='Brand'
                            className='h-8'
                          />
                        </td>
                        <td className='p-1'>
                          <Input
                            value={row.purchasePrice}
                            onChange={(e) =>
                              handleRowChange(
                                index,
                                'purchasePrice',
                                e.target.value
                              )
                            }
                            placeholder='0'
                            className='h-8'
                          />
                        </td>
                        <td className='p-1'>
                          <Input
                            value={row.sellingPrice}
                            onChange={(e) =>
                              handleRowChange(
                                index,
                                'sellingPrice',
                                e.target.value
                              )
                            }
                            placeholder='0'
                            className='h-8'
                          />
                        </td>
                        <td className='p-1'>
                          <Input
                            value={row.stockLevel}
                            onChange={(e) =>
                              handleRowChange(
                                index,
                                'stockLevel',
                                e.target.value
                              )
                            }
                            placeholder='0'
                            type='number'
                            className='h-8'
                          />
                        </td>
                        <td className='p-1'>
                          <Input
                            value={row.reorderLevel}
                            onChange={(e) =>
                              handleRowChange(
                                index,
                                'reorderLevel',
                                e.target.value
                              )
                            }
                            placeholder='0'
                            type='number'
                            className='h-8'
                          />
                        </td>
                        <td className='p-1'>
                          <select
                            value={row.supplierId}
                            onChange={(e) => {
                              const sup = suppliers.find(
                                (s) => s._id === e.target.value
                              );
                              handleSupplierSelect(
                                index,
                                sup?.name || '',
                                e.target.value
                              );
                            }}
                            className='h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm'
                          >
                            <option value=''>Select...</option>
                            {suppliers.map((sup) => (
                              <option key={sup._id} value={sup._id}>
                                {sup.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className='p-1 text-center'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-red-500 hover:text-red-600'
                            onClick={() => handleRemoveRow(index)}
                            disabled={rows.length <= 1}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>

            {/* Submit */}
            <div className='flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>
                <span className='text-red-500'>*</span> Required fields: Name,
                SKU, Category
              </p>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || validCount === 0}
              >
                {isLoading ? 'Creating...' : `Add ${validCount} Products`}
              </Button>
            </div>
          </div>
        ) : (
          // Results View
          <div className='flex flex-col gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  Import Results
                  <Badge
                    variant={
                      results.some((r) => r.status === 'error')
                        ? 'destructive'
                        : 'default'
                    }
                  >
                    {results.filter((r) => r.status === 'success').length}{' '}
                    succeeded
                  </Badge>
                  {results.some((r) => r.status === 'error') && (
                    <Badge variant='destructive'>
                      {results.filter((r) => r.status === 'error').length}{' '}
                      failed
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {results.filter((r) => r.status === 'success').length}{' '}
                  products created successfully
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className='h-[300px]'>
                  <div className='space-y-2'>
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className={cn(
                          'flex items-center gap-2 rounded-md border p-2',
                          result.status === 'success'
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                        )}
                      >
                        {result.status === 'success' ? (
                          <Check className='h-4 w-4 text-green-500' />
                        ) : (
                          <AlertCircle className='h-4 w-4 text-red-500' />
                        )}
                        <span className='flex-1 text-sm'>{result.name}</span>
                        {result.status === 'error' && (
                          <span className='text-sm text-red-500'>
                            {result.message}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            <div className='flex justify-end'>
              <Button onClick={handleClose}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Add Category Dialog - embedded */}
      <CategoryFormDialog
        open={categoryDialogOpen}
        onOpenChange={(open) => {
          setCategoryDialogOpen(open);
          if (!open) {
            setCategoryForRow(null);
          }
        }}
        onCategoryAdded={() => {
          // After category is added, categories will auto-refresh via Convex
          // User can now select the new category from dropdown
        }}
        hideTrigger
      />

      {/* Add Supplier Dialog - embedded */}
      <SupplierFormDialog
        open={supplierDialogOpen}
        onOpenChange={(open) => {
          setSupplierDialogOpen(open);
          if (!open) {
            setCategoryForRow(null);
          }
        }}
        onSupplierAdded={() => {
          // After supplier is added, suppliers will auto-refresh via Convex
          // User can now select the new supplier from dropdown
        }}
        hideTrigger
      />

      {/* STEP 3.4: Text Paste Modal */}
      {showTextPaste && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='w-full max-w-2xl rounded-lg border bg-background p-6 shadow-lg'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Paste Product Data</h3>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setShowTextPaste(false);
                  setPasteText('');
                }}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
            <div className='mb-4 space-y-2'>
              <p className='text-sm text-muted-foreground'>
                Paste data from Excel, WhatsApp, or any text source. Supported
                formats:
              </p>
              <ul className='list-inside list-disc text-xs text-muted-foreground'>
                <li>Tab-separated (Excel copy)</li>
                <li>Pipe-separated (|)</li>
                <li>Comma-separated (CSV)</li>
                <li>Semicolon-separated</li>
              </ul>
            </div>
            <Textarea
              placeholder={`Paste your product data here...\nExample:\niPhone 15 Pro | 999 | 50\nSamsung Galaxy S24 | 899 | 30`}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className='min-h-[200px] font-mono text-sm'
            />
            <div className='mt-4 flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setShowTextPaste(false);
                  setPasteText('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleTextPaste} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Import Products'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
