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

// Helper function to format date objects for display
export const formatDate = (date: Date | undefined): string => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

// Helper function get the current time in HH:MM format
export const getCurrentTime = (): string => {
  const date = new Date();
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export function amountToWords(amount: number): string {
  const ones = [
    '',
    'ONE',
    'TWO',
    'THREE',
    'FOUR',
    'FIVE',
    'SIX',
    'SEVEN',
    'EIGHT',
    'NINE'
  ];
  const teens = [
    'ELEVEN',
    'TWELVE',
    'THIRTEEN',
    'FOURTEEN',
    'FIFTEEN',
    'SIXTEEN',
    'SEVENTEEN',
    'EIGHTEEN',
    'NINETEEN'
  ];
  const tens = [
    '',
    'TEN',
    'TWENTY',
    'THIRTY',
    'FORTY',
    'FIFTY',
    'SIXTY',
    'SEVENTY',
    'EIGHTY',
    'NINETY'
  ];

  function convertLessThanOneThousand(num: number): string {
    if (num === 0) return '';

    let words = '';

    if (num >= 100) {
      words += ones[Math.floor(num / 100)] + ' HUNDRED';
      num %= 100;
      if (num > 0) {
        words += ' AND ';
      }
    }

    if (num >= 11 && num <= 19) {
      words += teens[num - 11];
    } else {
      if (num >= 20) {
        words += tens[Math.floor(num / 10)];
        num %= 10;
        if (num > 0) {
          words += ' ' + ones[num];
        }
      } else if (num > 0) {
        words += ones[num];
      }
    }

    return words;
  }

  function nepaliNumberToWords(num: number): string {
    if (num === 0) return 'ZERO';

    let words = '';

    // Handle crores (10 million / 1,00,00,000)
    if (num >= 10000000) {
      const crores = Math.floor(num / 10000000);
      words += convertLessThanOneThousand(crores) + ' CRORE';
      if (crores > 1) words += 'S';
      num %= 10000000;
      if (num > 0) words += ' ';
    }

    // Handle lakhs (hundred thousand / 1,00,000)
    if (num >= 100000) {
      const lakhs = Math.floor(num / 100000);
      words += convertLessThanOneThousand(lakhs) + ' LAKH';
      if (lakhs > 1) words += 'S';
      num %= 100000;
      if (num > 0) words += ' ';
    }

    // Handle thousands
    if (num >= 1000) {
      const thousands = Math.floor(num / 1000);
      words += convertLessThanOneThousand(thousands) + ' THOUSAND';
      num %= 1000;
      if (num > 0) words += ' ';
    }

    // Handle remaining hundreds, tens and ones
    if (num > 0) {
      words += convertLessThanOneThousand(num);
    }

    return words;
  }

  // Split into rupees and paise
  const [rupees, paise] = amount.toFixed(2).split('.');

  let words = nepaliNumberToWords(parseInt(rupees));
  if (parseInt(paise) > 0) {
    words += ' AND PAISE ' + nepaliNumberToWords(parseInt(paise));
  }

  return words + ' ONLY';
}

export function formatIndianCurrency(number: number): string {
  number = Math.round(number);
  let str = number.toString();
  let parts = str.split('.');
  const lastThree = parts[0].substring(parts[0].length - 3);
  const otherNumbers = parts[0].substring(0, parts[0].length - 3);
  const formatted =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') +
    (otherNumbers ? ',' : '') +
    lastThree;

  return formatted + (parts.length > 1 ? '.' + parts[1] : '');
}
