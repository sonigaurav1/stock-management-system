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
 * Generate a URL-friendly slug from a string.
 * Handles special characters, accents, spaces, and ensures URL safety.
 *
 * @param text The string to generate a slug from.
 * @param options Additional options for slug generation.
 * @returns The generated slug.
 */
export interface SlugOptions {
  /** Maximum length of the generated slug (default: 100) */
  maxLength?: number;
  /** Character to use for word separation (default: '-') */
  separator?: string;
  /** Whether to remove language accents (default: true) */
  removeAccents?: boolean;
  /** Whether to include a unique hash at the end (default: false) */
  makeUnique?: boolean;
}

export const generateSlug = (
  text: string,
  options: SlugOptions = {}
): string => {
  // Default options
  const {
    maxLength = 100,
    separator = '-',
    removeAccents = true,
    makeUnique = false
  } = options;

  if (!text?.trim()) return '';

  let slug = text.trim();

  // Remove accents/diacritics if requested
  if (removeAccents) {
    slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // Convert to lowercase and replace spaces and unwanted chars
  slug = slug
    .toLowerCase()
    // Replace common separators with our separator
    .replace(/[_\s.]+/g, separator)
    // Remove non-alphanumeric characters except for the separator
    .replace(new RegExp(`[^a-z0-9${separator}]`, 'g'), '')
    // Replace multiple instances of separator with single instance
    .replace(new RegExp(`${separator}+`, 'g'), separator)
    // Remove leading and trailing separators
    .replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');

  // Truncate to maxLength, making sure not to cut in the middle of a word
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    // If the slug is cut mid-word (ends with the separator), remove trailing separator
    if (slug.endsWith(separator)) {
      slug = slug.substring(0, slug.lastIndexOf(separator));
    }
  }

  // Add unique identifier if requested
  if (makeUnique) {
    const uniqueHash = Math.random().toString(36).substring(2, 6);
    slug = `${slug}${separator}${uniqueHash}`;
  }

  return slug;
};

/**
 * Generate a unique SKU from the category, name, and optional brand.
 * Creates a consistent, unique identifier with proper formatting and validation.
 *
 * @param category The category of the product.
 * @param name The name of the product.
 * @param brand The brand of the product (optional).
 * @param options Additional options for SKU generation.
 * @returns The generated SKU.
 * @throws Error if required parameters are missing or invalid.
 */
export interface SKUOptions {
  /** Include a timestamp for guaranteed uniqueness (default: true) */
  includeTimestamp?: boolean;
  /** Maximum length for each segment (default: 5) */
  maxSegmentLength?: number;
  /** Custom separator (default: '-') */
  separator?: string;
}

export const generateSKU = (
  category: string,
  name: string,
  brand?: string,
  options: SKUOptions = {}
): string => {
  // Default options
  const {
    includeTimestamp = true,
    maxSegmentLength = 5,
    separator = '-'
  } = options;

  // Validate inputs
  if (!category?.trim()) throw new Error('Category is required');
  if (!name?.trim()) throw new Error('Name is required');

  // Process each segment
  const processSegment = (segment: string): string => {
    return segment
      .trim()
      .replace(/[^\w\d]/g, '') // Remove special characters
      .slice(0, maxSegmentLength)
      .toUpperCase();
  };

  const catSegment = processSegment(category);
  const nameSegment = processSegment(name);

  // Process brand segment if provided
  const brandSegment = brand?.trim()
    ? `${separator}${processSegment(brand)}`
    : '';

  // Create unique timestamp code if needed
  const timestampSegment = includeTimestamp
    ? `${separator}${Date.now().toString(36).slice(-4).toUpperCase()}`
    : '';

  // Assemble SKU
  return `${catSegment}${brandSegment}${separator}${nameSegment}${timestampSegment}`;
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

/**
 * Options for text truncation
 */
interface TruncateOptions {
  /**
   * Maximum length of the text
   * @default 100
   */
  maxLength?: number;

  /**
   * Ellipsis to append when text is truncated
   * @default '...'
   */
  ellipsis?: string;

  /**
   * Truncation mode
   * - 'end': Truncate from the end (default)
   * - 'middle': Truncate from the middle
   * - 'start': Truncate from the start
   * @default 'end'
   */
  mode?: 'end' | 'middle' | 'start';
}

/**
 * Truncates text to a specified maximum length
 *
 * @param text - The input text to truncate
 * @param options - Truncation configuration options
 * @returns Truncated text
 */
export function truncate(text: string, options: TruncateOptions = {}): string {
  // Set default options
  const { maxLength = 100, ellipsis = '...', mode = 'end' } = options;

  // If text is shorter than max length, return as-is
  if (text?.length <= maxLength) {
    return text;
  }

  // Calculate available length for truncation
  const availableLength = maxLength - ellipsis.length;

  // Truncate based on mode
  switch (mode) {
    case 'end':
      return text?.slice(0, availableLength) + ellipsis;

    case 'start':
      return ellipsis + text?.slice(-availableLength);

    case 'middle':
      const leftSideLength = Math.ceil(availableLength / 2);
      const rightSideLength = Math.floor(availableLength / 2);

      return (
        text.slice(0, leftSideLength) + ellipsis + text.slice(-rightSideLength)
      );

    default:
      return text.slice(0, availableLength) + ellipsis;
  }
}

/**
 * Determines the stock status based on stock level and reorder level
 * @param {number|undefined} stockLevel - Current stock level
 * @param {number|undefined} reorderLevel - Level at which to reorder
 * @returns {'in_stock'|'low_stock'|'out_of_stock'} Stock status
 */
export function determineStockStatus({
  stockLevel,
  reorderLevel
}: {
  stockLevel: undefined | number;
  reorderLevel: undefined | number;
}): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (stockLevel === undefined || stockLevel === 0) {
    return 'out_of_stock';
  }
  if (reorderLevel !== undefined && stockLevel <= reorderLevel) {
    return 'low_stock';
  }
  return 'in_stock';
}

/**
 * Capitalizes the first letter of each word in a string and makes the rest lowercase.
 * @param text The input string to format.
 * @returns The formatted string.
 * @example
 * capitalizeWords("hello world"); // "Hello World"
 * capitalizeWords("javaSCRIPT is FUN"); // "Javascript Is Fun"
 */
export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formats a number to a currency string in NPR format.
 * @param amount The amount to format.
 * @param showNPR Whether to prefix with "NPR".
 * @returns The formatted currency string.
 */
export function formatCurrency(
  amount: number,
  showNPR: boolean = false
): string {
  // Convert to fixed decimal string
  const fixedAmount = amount.toFixed(2);

  // Split into integer and decimal parts
  const [integerPart, decimalPart] = fixedAmount.split('.');

  // Format integer part according to Nepali convention (first 3 digits, then groups of 2)
  let formattedInt = '';
  const digits = integerPart.length;

  for (let i = 0; i < digits; i++) {
    formattedInt += integerPart[i];

    // Calculate position from right
    const posFromRight = digits - i - 1;

    // Add comma after first 3 digits from right, then every 2 digits
    if (
      posFromRight === 3 ||
      (posFromRight > 3 && (posFromRight - 3) % 2 === 0)
    ) {
      if (i < digits - 1) {
        formattedInt += ',';
      }
    }
  }

  // Check if decimal part is all zeros
  const hasDecimalValue = decimalPart !== '00';

  // Construct final result - include decimal part only if it's not all zeros
  const result = hasDecimalValue
    ? `${formattedInt}.${decimalPart}`
    : formattedInt;

  return showNPR ? `NPR ${result}` : result;
}
