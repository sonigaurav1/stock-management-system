import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: 'accurate' | 'normal';
  } = {}
) {
  const { decimals = 0, sizeType = 'normal' } = opts;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === 'accurate'
      ? (accurateSizes[i] ?? 'Bytest')
      : (sizes[i] ?? 'Bytes')
  }`;
}

/**
 * Generate a SKU from the category, brand, and name.
 * @param category The category of the product.
 * @param brand The brand of the product.
 * @param name The name of the product.
 * @returns The generated SKU.
 */
export const generateSKU = (category: string, brand: string, name: string) => {
  return `${category}-${brand}-${name}`.replace(/\s+/g, '').toUpperCase();
};

/**
 * Generate a slug from a string.
 * @param str The string to generate a slug from.
 * @returns The generated slug.
 */
export const generateSlug = (str: string) => {
  return str.toLowerCase().replace(/\s+/g, '-');
};

export class CustomError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Format a timestamp into a human-readable date.
 * @param timestamp The timestamp to format.
 * @returns The formatted date.
 */
export function formatDateFromTimestamp(timestamp: number) {
  if (!timestamp) return 'Invalid Date';

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Invalid Date';

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long', // Full month name (e.g., March)
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true // AM/PM format for clarity
  });
}
