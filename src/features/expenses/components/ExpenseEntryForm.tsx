'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DollarSign,
  Calendar,
  Tag,
  Paperclip,
  AlertCircle
} from 'lucide-react';

interface ExpenseEntryFormProps {
  onSuccess?: () => void;
}

export function ExpenseEntryForm({ onSuccess }: ExpenseEntryFormProps) {
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    type: 'business',
    vendor: '',
    invoice: '',
    isTaxDeductible: false,
    isReimbursable: false,
    tags: [] as string[],
    notes: '',
    department: '',
    project: ''
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Get expense categories
  const categories = useQuery(api.expenses.getExpenseCategories, {
    type: formData.type
  });

  // Create expense mutation
  const createExpense = useMutation(api.expenses.createExpense);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      if (!formData.categoryId || !formData.amount || !formData.description) {
        setSubmitError('Please fill in all required fields');
        return;
      }

      await createExpense({
        categoryId: formData.categoryId,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: new Date(formData.date).getTime(),
        paymentMethod: formData.paymentMethod,
        type: formData.type,
        vendor: formData.vendor || undefined,
        invoice: formData.invoice || undefined,
        isTaxDeductible: formData.isTaxDeductible,
        isReimbursable: formData.isReimbursable,
        tags: selectedTags,
        notes: formData.notes || undefined,
        department: formData.department || undefined,
        project: formData.project || undefined
      });

      setSubmitSuccess(true);
      setSelectedTags([]);
      setFormData({
        categoryId: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        type: 'business',
        vendor: '',
        invoice: '',
        isTaxDeductible: false,
        isReimbursable: false,
        tags: [],
        notes: '',
        department: '',
        project: ''
      });

      setTimeout(() => setSubmitSuccess(false), 5000);
      onSuccess?.();
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to create expense');
    }
  };

  const commonTags = [
    'recurring',
    'tax-deductible',
    'reimbursable',
    'urgent',
    'needs-receipt'
  ];

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Add New Expense</CardTitle>
        <CardDescription>Record a business or personal expense</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Error Alert */}
          {submitError && (
            <div className='flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700'>
              <AlertCircle className='h-5 w-5 flex-shrink-0' />
              <span className='text-sm'>{submitError}</span>
            </div>
          )}

          {/* Success Alert */}
          {submitSuccess && (
            <div className='flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700'>
              <span className='text-sm'>✓ Expense recorded successfully</span>
            </div>
          )}

          {/* Row 1: Type & Amount */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='type'>Expense Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='business'>Business</SelectItem>
                  <SelectItem value='personal'>Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='amount' className='flex items-center gap-2'>
                <DollarSign className='h-4 w-4' />
                Amount (₹) *
              </Label>
              <Input
                id='amount'
                name='amount'
                type='number'
                step='0.01'
                placeholder='0.00'
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2: Category & Payment Method */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='categoryId'>Category *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, categoryId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select category' />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat: any) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='paymentMethod'>Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, paymentMethod: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='cash'>Cash</SelectItem>
                  <SelectItem value='credit_card'>Credit Card</SelectItem>
                  <SelectItem value='debit_card'>Debit Card</SelectItem>
                  <SelectItem value='bank_transfer'>Bank Transfer</SelectItem>
                  <SelectItem value='check'>Check</SelectItem>
                  <SelectItem value='wallet'>Wallet/UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Date & Vendor */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='date' className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                Date *
              </Label>
              <Input
                id='date'
                name='date'
                type='date'
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='vendor'>Vendor/Supplier</Label>
              <Input
                id='vendor'
                name='vendor'
                placeholder='e.g., Amazon, Local Shop'
                value={formData.vendor}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 4: Invoice & Department */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='invoice'>Invoice Number</Label>
              <Input
                id='invoice'
                name='invoice'
                placeholder='INV-2026-001'
                value={formData.invoice}
                onChange={handleChange}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='department'>Department/Project</Label>
              <Input
                id='department'
                name='department'
                placeholder='e.g., Marketing, Operations'
                value={formData.department}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='description'>Description *</Label>
            <Textarea
              id='description'
              name='description'
              placeholder='Brief description of the expense'
              value={formData.description}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          {/* Checkboxes */}
          <div className='flex items-center gap-6'>
            <div className='flex items-center gap-2'>
              <Checkbox
                id='isTaxDeductible'
                checked={formData.isTaxDeductible}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isTaxDeductible: checked as boolean
                  }))
                }
              />
              <Label htmlFor='isTaxDeductible' className='cursor-pointer'>
                Tax Deductible
              </Label>
            </div>

            <div className='flex items-center gap-2'>
              <Checkbox
                id='isReimbursable'
                checked={formData.isReimbursable}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isReimbursable: checked as boolean
                  }))
                }
              />
              <Label htmlFor='isReimbursable' className='cursor-pointer'>
                Reimbursable
              </Label>
            </div>
          </div>

          {/* Tags */}
          <div className='space-y-3'>
            <Label className='flex items-center gap-2'>
              <Tag className='h-4 w-4' />
              Tags
            </Label>
            <div className='flex flex-wrap gap-2 rounded-lg border bg-gray-50 p-3'>
              {commonTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  onClick={() => handleTagToggle(tag)}
                  className='cursor-pointer'
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className='space-y-2'>
            <Label htmlFor='notes'>Additional Notes</Label>
            <Textarea
              id='notes'
              name='notes'
              placeholder='Any additional information...'
              value={formData.notes}
              onChange={handleChange}
              rows={2}
            />
          </div>

          {/* Submit Button */}
          <div className='flex gap-3 pt-4'>
            <Button
              type='submit'
              className='flex-1'
              disabled={
                !formData.amount ||
                !formData.categoryId ||
                !formData.description
              }
            >
              Save Expense
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setFormData({
                  categoryId: '',
                  amount: '',
                  description: '',
                  date: new Date().toISOString().split('T')[0],
                  paymentMethod: 'cash',
                  type: 'business',
                  vendor: '',
                  invoice: '',
                  isTaxDeductible: false,
                  isReimbursable: false,
                  tags: [],
                  notes: '',
                  department: '',
                  project: ''
                });
                setSelectedTags([]);
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
