import { PROJECT_NAME } from '@/constants/data';

/**
 * Cookie consent preferences
 */
export type CookieCategory =
  | 'essential'
  | 'analytics'
  | 'marketing'
  | 'functionality';

export interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  functionality: boolean;
  consentedAt?: number; // Timestamp
}

export interface CookieConsentBannerProps {
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
  onCustomize?: () => void;
}

export const COOKIE_PREFERENCES_KEY = `${PROJECT_NAME}_cookie_preferences`;
export const COOKIE_CONSENT_VERSION = 'v1';
