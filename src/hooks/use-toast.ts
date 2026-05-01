'use client';

import { toast as sonnerToast } from 'sonner';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export const useToast = () => {
  const toast = (props: ToastProps) => {
    const { title, description, variant = 'default', duration = 3000 } = props;

    const message = title
      ? `${title}${description ? ': ' + description : ''}`
      : description;

    if (variant === 'destructive') {
      sonnerToast.error(message, { duration });
    } else {
      sonnerToast.success(message, { duration });
    }
  };

  return { toast };
};
