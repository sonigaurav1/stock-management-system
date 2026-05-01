const COUNTRY_TO_CURRENCY_CODE: Record<string, string> = {
  NP: 'NPR',
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
  SG: 'SGD',
  AE: 'AED',
  SA: 'SAR',
  KW: 'KWD',
  QA: 'QAR',
  OM: 'OMR',
  BH: 'BHD',
  PK: 'PKR',
  BD: 'BDT',
  LK: 'LKR',
  MY: 'MYR',
  TH: 'THB',
  VN: 'VND',
  ID: 'IDR',
  PH: 'PHP',
  CN: 'CNY',
  HK: 'HKD',
  JP: 'JPY',
  KR: 'KRW',
  ZA: 'ZAR',
  NG: 'NGN',
  KE: 'KES',
  TZ: 'TZS',
  UG: 'UGX',
  RW: 'RWF',
  ET: 'ETB',
  GH: 'GHS',
  EU: 'EUR',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR'
};

const CURRENCY_TO_LOCALE: Record<string, string> = {
  NPR: 'ne-NP',
  INR: 'en-IN',
  USD: 'en-US',
  GBP: 'en-GB',
  CAD: 'en-CA',
  AUD: 'en-AU',
  NZD: 'en-NZ',
  SGD: 'en-SG',
  AED: 'ar-AE',
  SAR: 'ar-SA',
  KWD: 'ar-KW',
  QAR: 'ar-QA',
  OMR: 'ar-OM',
  BHD: 'ar-BH',
  PKR: 'ur-PK',
  BDT: 'bn-BD',
  LKR: 'si-LK',
  MYR: 'ms-MY',
  THB: 'th-TH',
  VND: 'vi-VN',
  IDR: 'id-ID',
  PHP: 'en-PH',
  CNY: 'zh-CN',
  HKD: 'zh-HK',
  JPY: 'ja-JP',
  KRW: 'ko-KR',
  ZAR: 'en-ZA',
  NGN: 'en-NG',
  KES: 'en-KE',
  TZS: 'sw-TZ',
  UGX: 'en-UG',
  RWF: 'rw-RW',
  ETB: 'am-ET',
  GHS: 'en-GH',
  EUR: 'en-IE'
};

const PREFERRED_CURRENCY_STORAGE_KEY = 'invento.preferredCurrencyCode';

export function countryToCurrencyCode(country?: string | null): string {
  if (!country) {
    return 'USD';
  }

  return COUNTRY_TO_CURRENCY_CODE[country.toUpperCase()] ?? 'USD';
}

export function currencyCodeToLocale(currencyCode?: string | null): string {
  if (!currencyCode) {
    return 'en-US';
  }

  return CURRENCY_TO_LOCALE[currencyCode.toUpperCase()] ?? 'en-US';
}

export function getPreferredCurrencyCode(fallback = 'USD'): string {
  if (typeof window === 'undefined') {
    return fallback;
  }

  return (
    window.localStorage.getItem(PREFERRED_CURRENCY_STORAGE_KEY) ?? fallback
  );
}

export function setPreferredCurrencyCode(currencyCode: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    PREFERRED_CURRENCY_STORAGE_KEY,
    currencyCode.toUpperCase()
  );
}

export function formatMoney(
  amount: number,
  options: {
    currencyCode?: string;
    locale?: string;
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
  } = {}
): string {
  const currencyCode = options.currencyCode?.toUpperCase() ?? 'USD';
  const locale = options.locale ?? currencyCodeToLocale(currencyCode);
  const isIntegerAmount = Number.isInteger(amount);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'symbol',
    minimumFractionDigits:
      options.minimumFractionDigits ?? (isIntegerAmount ? 0 : 2),
    maximumFractionDigits: options.maximumFractionDigits ?? 2
  }).format(amount);
}
