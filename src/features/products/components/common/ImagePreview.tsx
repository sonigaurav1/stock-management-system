'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Link2, Share2, X } from 'lucide-react';

type ImagePreviewProps = {
  src?: string | null;
  alt: string;
  fallbackSrc: string;
  className?: string;
  imageClassName?: string;
  previewTitle?: string;
};

export default function ImagePreview({
  src,
  alt,
  fallbackSrc,
  className = 'relative aspect-square h-16 w-16 overflow-hidden rounded-lg border border-border/60 bg-muted',
  imageClassName = 'object-cover transition-transform duration-300 hover:scale-105',
  previewTitle = 'Image Preview'
}: ImagePreviewProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewSrc = src || fallbackSrc;

  useEffect(() => {
    return () => {
      if (copyResetTimer.current) {
        clearTimeout(copyResetTimer.current);
      }
    };
  }, []);

  const safeFileName =
    alt
      .trim()
      .replace(/[^a-z0-9]+/gi, '_')
      .replace(/^_+|_+$/g, '') || 'image';

  const handleDownloadImage = async () => {
    try {
      const response = await fetch(previewSrc);
      if (!response.ok) throw new Error('Failed to download image');

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${safeFileName}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      alert('Download failed. Please try again.');
    }
  };

  const handleCopyImageLink = async () => {
    try {
      await navigator.clipboard.writeText(previewSrc);
      setCopied(true);

      if (copyResetTimer.current) {
        clearTimeout(copyResetTimer.current);
      }

      copyResetTimer.current = setTimeout(() => {
        setCopied(false);
      }, 5000);
    } catch {
      alert('Failed to copy link. Please try again.');
    }
  };

  const handleShareImage = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: previewTitle,
          url: previewSrc
        });
        return;
      }

      await handleCopyImageLink();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      alert('Failed to share image. Please try again.');
    }
  };

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className={`${className} cursor-zoom-in p-0 text-left focus:outline-none focus:ring-2 focus:ring-primary/40`}
        aria-label={`Preview ${alt}`}
      >
        <Image
          src={previewSrc}
          alt={alt}
          fill
          sizes='64px'
          className={imageClassName}
        />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='h-[88vh] w-[88vw] max-w-5xl overflow-hidden border-white/20 bg-white/5 p-0 backdrop-blur-xl sm:rounded-2xl [&>button]:hidden'>
          <div className='flex h-full flex-col bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90'>
            <div className='flex items-center justify-between border-b border-white/15 px-4 py-3 text-white'>
              <DialogHeader>
                <DialogTitle className='text-sm font-medium uppercase tracking-[0.18em] text-white/75'>
                  {previewTitle}
                </DialogTitle>
              </DialogHeader>
              <div className='flex flex-wrap items-center gap-2'>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={handleCopyImageLink}
                  className='h-8 rounded-full px-3 text-xs'
                >
                  <Link2 className='mr-2 h-4 w-4' />
                  {copied ? 'Copied' : 'Copy Link'}
                </Button>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={handleShareImage}
                  className='h-8 rounded-full px-3 text-xs'
                >
                  <Share2 className='mr-2 h-4 w-4' />
                  Share
                </Button>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={handleDownloadImage}
                  className='h-8 rounded-full px-3 text-xs'
                >
                  <Download className='mr-2 h-4 w-4' />
                  Download
                </Button>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={() => window.open(previewSrc, '_blank')}
                  className='h-8 rounded-full px-3 text-xs'
                >
                  <ExternalLink className='mr-2 h-4 w-4' />
                  Open
                </Button>
                <Button
                  size='sm'
                  variant='secondary'
                  onClick={() => setOpen(false)}
                  className='h-8 rounded-full px-3 text-xs'
                >
                  <X className='mr-2 h-4 w-4' />
                  Close
                </Button>
              </div>
            </div>
            <div className='flex min-h-0 flex-1 items-center justify-center p-4'>
              <div className='rounded-2xl border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-md'>
                <Image
                  src={previewSrc}
                  alt={alt}
                  width={1600}
                  height={1600}
                  className='h-auto max-h-[82vh] w-auto max-w-[92vw] rounded-xl object-contain'
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
