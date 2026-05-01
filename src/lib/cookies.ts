import {
  CookiePreferences,
  COOKIE_PREFERENCES_KEY,
  COOKIE_CONSENT_VERSION
} from '@/types/cookies';

/**
 * Get default cookie preferences
 */
export const getDefaultCookiePreferences = (): CookiePreferences => ({
  essential: true,
  analytics: false,
  marketing: false,
  functionality: false,
  consentedAt: undefined
});

/**
 * Get cookie preferences from localStorage
 */
export const getCookiePreferences = (): CookiePreferences => {
  if (typeof window === 'undefined') {
    return getDefaultCookiePreferences();
  }

  try {
    const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...getDefaultCookiePreferences(),
        ...parsed
      };
    }
  } catch (error) {
    console.error('Error reading cookie preferences:', error);
  }

  return getDefaultCookiePreferences();
};

/**
 * Save cookie preferences to localStorage
 */
export const saveCookiePreferences = (preferences: CookiePreferences): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      COOKIE_PREFERENCES_KEY,
      JSON.stringify({
        ...preferences,
        consentedAt: Date.now()
      })
    );
  } catch (error) {
    console.error('Error saving cookie preferences:', error);
  }
};

/**
 * Check if user has consented
 */
export const hasUserConsented = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(COOKIE_PREFERENCES_KEY) !== null;
};

/**
 * Clear cookie preferences
 */
export const clearCookiePreferences = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(COOKIE_PREFERENCES_KEY);
  } catch (error) {
    console.error('Error clearing cookie preferences:', error);
  }
};

/**
 * Check if specific cookie category is allowed
 */
export const isCategoryAllowed = (category: string): boolean => {
  const preferences = getCookiePreferences();
  const value = preferences[category as keyof CookiePreferences];
  return typeof value === 'boolean' ? value : false;
};

/**
 * Load tracking scripts based on user preferences
 */
export const loadTrackingScripts = (preferences: CookiePreferences): void => {
  // Analytics script (Google Analytics example)
  if (preferences.analytics) {
    loadGoogleAnalytics();
  }

  // Marketing script (Facebook Pixel example)
  if (preferences.marketing) {
    loadFacebookPixel();
  }

  // Functionality script (HotJar example)
  if (preferences.functionality) {
    loadHotjar();
  }
};

/**
 * Load Google Analytics
 */
const loadGoogleAnalytics = (): void => {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push(arguments);
    }
  }
  (window as any).gtag = gtag;
  gtag('js', new Date());
  gtag('config', process.env.NEXT_PUBLIC_GA_ID || '');
};

/**
 * Load Facebook Pixel
 */
const loadFacebookPixel = (): void => {
  if (!process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID) return;

  (window as any).fbq =
    (window as any).fbq ||
    function () {
      if ((window as any).fbq.callMethod) {
        (window as any).fbq.callMethod.apply((window as any).fbq, arguments);
      } else {
        (window as any).fbq.queue.push(arguments);
      }
    };
  (window as any).fbq.push = (window as any).fbq;
  (window as any).fbq.loaded = true;
  (window as any).fbq.version = '2.0';
  (window as any).fbq.queue = [];

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  (window as any).fbq('init', process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID);
  (window as any).fbq('track', 'PageView');
};

/**
 * Load Hotjar
 */
const loadHotjar = (): void => {
  if (!process.env.NEXT_PUBLIC_HOTJAR_ID) return;

  (window as any).hj =
    (window as any).hj ||
    function () {
      if ((window as any).hj.q) {
        (window as any).hj.q.push(arguments);
      }
    };
  (window as any).hj.q = (window as any).hj.q || [];

  (window as any).hj('identify', {
    userId: 'user_id'
  });
};
