'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Upload,
  X,
  Image as ImageIcon,
  Maximize2,
  Clipboard,
  Info,
  CheckCircle,
  Crop,
  RotateCw,
  RotateCcw,
  Check,
  Maximize,
  Rotate3d,
  Undo2
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogHeader
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Cropper from 'react-easy-crop';
import { Slider } from '@/components/ui/slider';

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

interface ImageMetadata {
  width?: number;
  height?: number;
  size: number;
  name: string;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
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
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null
  );
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Get image dimensions
  const getImageDimensions = useCallback(
    (file: File): Promise<{ width: number; height: number }> => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
          URL.revokeObjectURL(img.src);
        };
        img.onerror = () => resolve({ width: 0, height: 0 });
        img.src = URL.createObjectURL(file);
      });
    },
    []
  );

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'] as const;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Create cropped file - simplified version
  const createCroppedImage = useCallback(
    async (imageSrc: string, pixelCrop: CropArea): Promise<File> => {
      const image = new window.Image();
      image.src = imageSrc;

      return new Promise((resolve, reject) => {
        image.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
              reject(new Error('Canvas context not available'));
              return;
            }

            canvas.width = pixelCrop.width;
            canvas.height = pixelCrop.height;

            // Draw cropped portion directly
            ctx.drawImage(
              image,
              pixelCrop.x,
              pixelCrop.y,
              pixelCrop.width,
              pixelCrop.height,
              0,
              0,
              pixelCrop.width,
              pixelCrop.height
            );

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const file = new File([blob], 'cropped-image.jpg', {
                    type: 'image/jpeg'
                  });
                  resolve(file);
                } else {
                  reject(new Error('Failed to create cropped blob'));
                }
              },
              'image/jpeg',
              0.95
            );
          } catch (err) {
            reject(err);
          }
        };

        image.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      });
    },
    []
  );

  // Get aspect ratio for cropper - use selected or default from props
  const getCropAspectRatio = (): number => {
    if (selectedAspectRatio !== null) return selectedAspectRatio;
    switch (aspectRatio) {
      case 'square':
        return 1;
      case 'video':
        return 16 / 9;
      case 'wide':
        return 16 / 9;
      default:
        return 1;
    }
  };

  // Aspect ratio presets
  const aspectRatioPresets = [
    { label: 'Free', value: 0 },
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 }
  ];

  // Handle crop save
  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsLoading(true);
    try {
      const croppedFile = await createCroppedImage(imageSrc, croppedAreaPixels);

      // Create a preview URL from the cropped file
      const croppedPreview = URL.createObjectURL(croppedFile);

      // Get dimensions of cropped image
      getImageDimensions(croppedFile).then(({ width, height }) => {
        setMetadata({
          width,
          height,
          size: croppedFile.size,
          name: croppedFile.name
        });
      });

      setPreview(croppedPreview);
      onChange(croppedFile);
      setIsCropOpen(false);
      toast.success('Image cropped', { description: 'Click to preview' });
    } catch (err: any) {
      console.error('Crop error:', err);
      toast.error('Crop failed', {
        description: err?.message || 'Failed to crop image'
      });
    }
    setIsLoading(false);
  };

  // Open crop modal
  const openCropModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageSrc(preview);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setSelectedAspectRatio(null);
    setIsCropOpen(true);
  };

  // Handle quick rotation
  const handleRotate = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360);
  };

  // Handle zoom presets
  const handleZoomPreset = (value: number) => {
    setZoom(value);
  };

  // Handle aspect ratio
  const handleAspectRatio = (value: number | null) => {
    setSelectedAspectRatio(value);
  };

  // Reset crop
  const handleResetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setSelectedAspectRatio(null);
  };

  useEffect(() => {
    if (value && !defaultPreview) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(value);

      // Get metadata
      getImageDimensions(value).then(({ width, height }) => {
        setMetadata({
          width,
          height,
          size: value.size,
          name: value.name
        });
      });
    }
  }, [value, defaultPreview, getImageDimensions]);

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleFile(file);
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [disabled]);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[16/9]'
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      const formats = acceptedFormats
        .map((format) => format.split('/')[1])
        .join(', ');
      return { valid: false, error: `Invalid format. Accepted: ${formats}` };
    }

    // Validate file size
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return { valid: false, error: `File too large. Max: ${maxSizeInMB}MB` };
    }

    return { valid: true };
  };

  const handleFile = (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error('Upload Failed', { description: validation.error });
      return;
    }

    setIsLoading(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setIsLoading(false);
      toast.success('Image uploaded', { description: 'Click to preview' });
    };
    reader.readAsDataURL(file);

    // Get metadata
    getImageDimensions(file).then(({ width, height }) => {
      setMetadata({
        width,
        height,
        size: file.size,
        name: file.name
      });
    });

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
    if (file) handleFile(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    setPreview('');
    setMetadata(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    toast.info('Image removed');
  };

  const handleClick = () => {
    if (disabled) return;
    if (preview) {
      setIsLightboxOpen(true);
    } else {
      inputRef.current?.click();
    }
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            required && "after:ml-0.5 after:text-[#EF4444] after:content-['*']"
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
          'group relative rounded-lg border-2 border-dashed',
          'cursor-pointer transition-colors duration-200',
          isDragging && 'border-primary bg-primary/5',
          error && 'border-destructive',
          disabled && 'cursor-not-allowed opacity-50',
          !disabled && !preview && 'hover:border-primary',
          preview ? 'border-solid bg-background' : 'bg-muted'
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
            {/* Image Preview */}
            <Image
              fill
              src={preview}
              alt='Preview'
              className={cn(
                'h-full w-full rounded-lg object-contain',
                disabled && 'opacity-50'
              )}
            />

            {/* Overlay Controls - Bottom Right - Always Visible */}
            <div className='absolute inset-0 flex items-end justify-end gap-2 p-2'>
              {/* Crop Button */}
              <button
                type='button'
                onClick={openCropModal}
                className='flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white'
                title='Crop image'
              >
                <Crop className='h-5 w-5' />
              </button>
              {/* Fullscreen Button */}
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                className='flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white'
                title='Fullscreen'
              >
                <Maximize2 className='h-5 w-5' />
              </button>
              {/* Remove Button */}
              {showRemoveButton && (
                <button
                  type='button'
                  onClick={handleRemove}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white',
                    disabled && 'cursor-not-allowed'
                  )}
                  title='Remove image'
                >
                  <X className='h-5 w-5' />
                </button>
              )}
            </div>

            {/* Metadata Badge */}
            {metadata && (
              <div className='absolute bottom-2 left-2 flex items-center gap-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white'>
                <Info className='h-3 w-3' />
                <span>
                  {metadata.width}x{metadata.height}
                </span>
                <span>•</span>
                <span>{formatFileSize(metadata.size)}</span>
              </div>
            )}
          </>
        ) : (
          <div className='flex flex-col items-center gap-2 p-4 text-center'>
            {isLoading ? (
              <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
            ) : isDragging ? (
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
              <p className='flex items-center gap-1 text-xs text-muted-foreground'>
                <Clipboard className='h-3 w-3' />
                or paste from clipboard (Ctrl+V)
              </p>
              <p className='text-xs text-muted-foreground'>
                {`Max: ${maxSizeInMB}MB • ${acceptedFormats.map((f) => f.split('/')[1]).join(', ')}`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className='text-sm font-medium text-destructive'>{error}</p>}

      {/* Description */}
      {description && !error && (
        <p className='text-sm text-muted-foreground'>{description}</p>
      )}

      {/* Success Indicator */}
      {metadata && !error && (
        <div className='flex items-center gap-1 text-xs text-green-600'>
          <CheckCircle className='h-3 w-3' />
          <span>
            {metadata.name} ({metadata.width}x{metadata.height})
          </span>
        </div>
      )}

      {/* Lightbox / Fullscreen Preview */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent
          className='max-h-[90vh] w-auto max-w-[90vw] border-none bg-transparent p-0'
          onPointerDownOutside={() => setIsLightboxOpen(false)}
        >
          <DialogTitle className='sr-only'>Image Preview</DialogTitle>
          <button
            onClick={() => setIsLightboxOpen(false)}
            className='absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30'
          >
            <X className='h-5 w-5' />
          </button>
          {preview && (
            <div className='relative flex h-[85vh] w-[85vw] items-center justify-center'>
              <Image
                src={preview}
                alt='Full preview'
                fill
                className='h-full w-full object-contain'
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Crop Modal */}
      <Dialog open={isCropOpen} onOpenChange={setIsCropOpen}>
        <DialogContent className='w-full max-w-2xl p-0'>
          <DialogHeader className='p-4 pb-2'>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>

          {/* Cropper Container */}
          <div className='relative h-[350px] w-full bg-muted'>
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={getCropAspectRatio()}
                // @ts-ignore - cropAreaPercent controls initial crop area size (default ~90%)
                cropAreaPercent={100}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(croppedArea, croppedAreaPixels) => {
                  setCroppedAreaPixels(croppedAreaPixels as any);
                }}
              />
            )}
          </div>

          {/* Controls - More intuitive UX */}
          <div className='space-y-3 p-4 pt-2'>
            {/* Aspect Ratio Presets */}
            <div className='flex items-center gap-2'>
              <span className='w-12 text-xs text-muted-foreground'>
                Aspect:
              </span>
              <div className='flex gap-1'>
                {aspectRatioPresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleAspectRatio(preset.value)}
                    className={cn(
                      'rounded border px-2 py-1 text-xs transition-colors',
                      (selectedAspectRatio ?? getCropAspectRatio()) ===
                        preset.value ||
                        (preset.value === 0 && selectedAspectRatio === null)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input hover:bg-muted'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className='flex items-center gap-2'>
              {/* Rotate Buttons */}
              <div className='flex items-center gap-1'>
                <span className='w-12 text-xs text-muted-foreground'>
                  Rotate:
                </span>
                <button
                  onClick={() => handleRotate(-90)}
                  className='flex h-8 w-8 items-center justify-center rounded border hover:bg-muted'
                  title='Rotate left'
                >
                  <RotateCcw className='h-4 w-4' />
                </button>
                <button
                  onClick={() => handleRotate(90)}
                  className='flex h-8 w-8 items-center justify-center rounded border hover:bg-muted'
                  title='Rotate right'
                >
                  <RotateCw className='h-4 w-4' />
                </button>
              </div>

              <div className='h-4 w-px bg-border' />

              {/* Zoom Presets */}
              <div className='flex items-center gap-1'>
                <span className='w-12 text-xs text-muted-foreground'>
                  Zoom:
                </span>
                <button
                  onClick={() => handleZoomPreset(1)}
                  className={cn(
                    'rounded border px-2 py-1 text-xs transition-colors',
                    zoom === 1
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input hover:bg-muted'
                  )}
                >
                  Fit
                </button>
                <button
                  onClick={() => handleZoomPreset(1.5)}
                  className={cn(
                    'rounded border px-2 py-1 text-xs transition-colors',
                    zoom === 1.5
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input hover:bg-muted'
                  )}
                >
                  1.5x
                </button>
                <button
                  onClick={() => handleZoomPreset(2)}
                  className={cn(
                    'rounded border px-2 py-1 text-xs transition-colors',
                    zoom === 2
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input hover:bg-muted'
                  )}
                >
                  2x
                </button>
              </div>

              <div className='flex-1' />

              {/* Reset Button */}
              <button
                onClick={handleResetCrop}
                className='flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground'
                title='Reset'
              >
                <Undo2 className='h-3 w-3' />
                Reset
              </button>
            </div>

            {/* Zoom Slider (for fine-tuning) */}
            <div className='flex items-center gap-2'>
              <span className='w-12 text-xs text-muted-foreground'>
                Zoom: {Math.round(zoom * 100)}%
              </span>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={([value]) => setZoom(value)}
                className='flex-1'
              />
            </div>
          </div>

          <DialogFooter className='p-4 pt-2'>
            <Button variant='outline' onClick={() => setIsCropOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCropSave} disabled={isLoading}>
              {isLoading ? (
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
              ) : (
                <>
                  <Check className='mr-2 h-4 w-4' />
                  Apply
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomImageUpload;
