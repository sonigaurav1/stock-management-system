'use client';

import { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Paperclip,
  Upload,
  CheckCircle,
  AlertCircle,
  Image,
  FileText,
  Trash2,
  Eye
} from 'lucide-react';

interface ReceiptData {
  vendor?: string;
  date?: string;
  amount?: number;
  description?: string;
  confidence?: number;
}

interface ReceiptFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  ocrStatus: 'pending' | 'processing' | 'completed' | 'failed';
  extractedData?: ReceiptData;
}

interface ReceiptUploadProps {
  onReceiptsChange?: (receipts: ReceiptFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

export function ReceiptUpload({
  onReceiptsChange,
  maxFiles = 5,
  maxFileSize = 10
}: ReceiptUploadProps) {
  const [receipts, setReceipts] = useState<ReceiptFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    setUploading(true);

    for (
      let i = 0;
      i < Math.min(files.length, maxFiles - receipts.length);
      i++
    ) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        console.error('Invalid file type:', file.type);
        continue;
      }

      // Validate file size
      if (file.size > maxFileSize * 1024 * 1024) {
        console.error('File too large:', file.name);
        continue;
      }

      // Create file reader to get base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;

        // Mock receipt data extraction (in production, use OCR API)
        const mockExtractedData: ReceiptData = {
          vendor: 'Sample Vendor',
          date: new Date().toISOString().split('T')[0],
          amount: Math.floor(Math.random() * 5000) + 100,
          description: 'Purchased items',
          confidence: Math.floor(Math.random() * 30) + 70
        };

        const newReceipt: ReceiptFile = {
          id: `receipt-${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url,
          uploadedAt: new Date(),
          ocrStatus: 'completed',
          extractedData: mockExtractedData
        };

        setReceipts((prev) => {
          const updated = [...prev, newReceipt];
          onReceiptsChange?.(updated);
          return updated;
        });
      };
      reader.readAsDataURL(file);
    }

    setUploading(false);
  };

  const removeReceipt = (id: string) => {
    setReceipts((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      onReceiptsChange?.(updated);
      return updated;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base'>
          <Paperclip className='h-5 w-5' />
          Receipt Files
        </CardTitle>
        <CardDescription className='text-xs'>
          Upload receipts and invoices for automatic data extraction
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Upload Zone */}
        {receipts.length < maxFiles && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type='file'
              multiple
              accept='image/*,.pdf'
              onChange={handleChange}
              className='hidden'
              disabled={uploading}
            />

            <div className='flex flex-col items-center justify-center gap-2'>
              <Upload
                className={`h-8 w-8 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`}
              />
              <p className='text-sm font-medium'>
                {dragActive
                  ? 'Drop files here'
                  : 'Drag & drop or click to upload'}
              </p>
              <p className='text-xs text-gray-600'>
                PNG, JPG, PDF up to {maxFileSize}MB
              </p>
            </div>

            {uploading && (
              <div className='mt-3'>
                <Progress value={66} className='h-2' />
                <p className='mt-2 text-xs text-gray-600'>Uploading...</p>
              </div>
            )}
          </div>
        )}

        {/* Uploaded Files */}
        {receipts.length > 0 && (
          <div className='space-y-2'>
            <p className='text-sm font-semibold'>
              {receipts.length} / {maxFiles} files
            </p>

            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className='space-y-2 rounded-lg border bg-gray-50 p-3'
              >
                {/* File Header */}
                <div className='flex items-start justify-between'>
                  <div className='flex flex-1 items-start gap-2'>
                    {receipt.type.startsWith('image/') ? (
                      <Image className='mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400' />
                    ) : (
                      <FileText className='mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400' />
                    )}

                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>
                        {receipt.name}
                      </p>
                      <p className='text-xs text-gray-600'>
                        {formatFileSize(receipt.size)} • Uploaded{' '}
                        {receipt.uploadedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className='flex flex-shrink-0 items-center gap-1'>
                    <Button
                      variant='ghost'
                      size='sm'
                      title='View'
                      className='text-gray-600'
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => removeReceipt(receipt.id)}
                      title='Delete'
                      className='text-red-600 hover:text-red-700'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                {/* OCR Status & Extracted Data */}
                {receipt.extractedData && (
                  <div className='mt-2 space-y-2 border-t pt-2'>
                    <div className='flex items-center justify-between'>
                      <p className='text-xs font-semibold text-gray-700'>
                        Extracted Data
                      </p>
                      <div className='flex items-center gap-1'>
                        <CheckCircle className='h-4 w-4 text-green-600' />
                        <span className='text-xs font-medium text-green-600'>
                          {receipt.extractedData.confidence}% confident
                        </span>
                      </div>
                    </div>

                    {/* Data Grid */}
                    <div className='grid grid-cols-2 gap-2 text-xs'>
                      {receipt.extractedData.vendor && (
                        <div className='rounded border bg-white p-2'>
                          <p className='text-gray-600'>Vendor</p>
                          <p className='font-medium'>
                            {receipt.extractedData.vendor}
                          </p>
                        </div>
                      )}
                      {receipt.extractedData.date && (
                        <div className='rounded border bg-white p-2'>
                          <p className='text-gray-600'>Date</p>
                          <p className='font-medium'>
                            {receipt.extractedData.date}
                          </p>
                        </div>
                      )}
                      {receipt.extractedData.amount && (
                        <div className='rounded border bg-white p-2'>
                          <p className='text-gray-600'>Amount</p>
                          <p className='font-medium'>
                            ₹{receipt.extractedData.amount}
                          </p>
                        </div>
                      )}
                      {receipt.extractedData.description && (
                        <div className='rounded border bg-white p-2'>
                          <p className='text-gray-600'>Description</p>
                          <p className='line-clamp-1 font-medium'>
                            {receipt.extractedData.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* OCR Status Indicator */}
                {receipt.ocrStatus !== 'completed' && (
                  <div className='flex items-center gap-2 rounded border border-yellow-200 bg-yellow-50 p-2'>
                    {receipt.ocrStatus === 'processing' && (
                      <>
                        <AlertCircle className='h-4 w-4 text-yellow-600' />
                        <span className='text-xs font-medium text-yellow-700'>
                          Processing...
                        </span>
                      </>
                    )}
                    {receipt.ocrStatus === 'failed' && (
                      <>
                        <AlertCircle className='h-4 w-4 text-red-600' />
                        <span className='text-xs font-medium text-red-700'>
                          OCR failed. Please review manually.
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {receipts.length === 0 && !uploading && (
          <div className='py-6 text-center text-gray-600'>
            <p className='text-sm'>No receipts uploaded yet</p>
            <p className='mt-1 text-xs'>
              Start by uploading a receipt or invoice
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
