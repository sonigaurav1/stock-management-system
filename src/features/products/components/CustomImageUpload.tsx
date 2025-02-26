'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface CustomImageUploadProps {
  onChange: (file: File | null) => void;
  value?: File | null;
  defaultPreview?: string;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
  className?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  description?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
  showRemoveButton?: boolean;
}

const CustomImageUpload = ({
  onChange,
  value,
  defaultPreview,
  maxSizeInMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  className,
  disabled = false,
  error,
  label,
  required = false,
  description,
  aspectRatio = 'square',
  showRemoveButton = true
}: CustomImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string>(defaultPreview || '');
  const [dragCount, setDragCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value && !defaultPreview) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(value);
    }
  }, [value, defaultPreview]);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[16/9]'
  };

  const handleFile = (file: File | null) => {
    if (!file) {
      setPreview('');
      onChange(null);
      return;
    }

    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      const formats = acceptedFormats
        .map((format) => format.split('/')[1])
        .join(', ');
      alert(`Please upload a valid image file (${formats})`);
      return;
    }

    // Validate file size
    if (file.size > maxSizeInMB * 1024 * 1024) {
      alert(`File size should be less than ${maxSizeInMB}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onChange(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCount((prev) => prev + 1);
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCount((prev) => prev - 1);
    if (dragCount - 1 === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCount(0);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    setPreview('');
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            required &&
              "after:ml-0.5 after:text-destructive after:content-['*']"
          )}
        >
          {label}
        </label>
      )}

      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex max-h-[40vh] flex-col items-center justify-center',
          aspectRatioClasses[aspectRatio],
          'rounded-lg border-2 border-dashed',
          'transition-colors duration-200',
          isDragging && 'border-primary bg-primary/5',
          error && 'border-destructive',
          disabled && 'cursor-not-allowed opacity-50',
          !disabled && 'cursor-pointer hover:border-primary',
          preview ? 'bg-background' : 'bg-muted'
        )}
      >
        <input
          ref={inputRef}
          type='file'
          accept={acceptedFormats.join(',')}
          onChange={handleChange}
          className='hidden'
          disabled={disabled}
        />

        {preview ? (
          <>
            <Image
              fill
              src={preview}
              alt='Preview'
              className={cn(
                'h-full w-full rounded-lg object-cover',
                disabled && 'opacity-50'
              )}
            />
            {showRemoveButton && (
              <button
                onClick={handleRemove}
                className={cn(
                  'absolute right-2 top-2 rounded-full p-1',
                  'bg-background/80 hover:bg-background',
                  'text-foreground/80 hover:text-foreground',
                  'transition-colors duration-200',
                  disabled && 'cursor-not-allowed'
                )}
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </>
        ) : (
          <div className='flex flex-col items-center gap-2 p-4 text-center'>
            {isDragging ? (
              <Upload className='h-8 w-8 animate-bounce text-primary' />
            ) : (
              <ImageIcon className='h-8 w-8 text-muted-foreground' />
            )}
            <div className='flex flex-col gap-1'>
              <p className='text-sm font-medium'>
                {isDragging
                  ? 'Drop image here'
                  : 'Click or drag image to upload'}
              </p>
              <p className='text-xs text-muted-foreground'>
                {`Maximum file size: ${maxSizeInMB}MB`}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && <p className='text-sm font-medium text-destructive'>{error}</p>}

      {description && !error && (
        <p className='text-sm text-muted-foreground'>{description}</p>
      )}
    </div>
  );
};

export default CustomImageUpload;
