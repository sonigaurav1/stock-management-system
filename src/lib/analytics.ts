/**
 * Track an event in Google Analytics
 */
export const trackEvent = (
  eventName: string,
  eventData?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventData);
  }
};

/**
 * Track a page view
 */
export const trackPageView = (path: string, title?: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
      page_path: path,
      page_title: title
    });
  }
};

/**
 * Track a goal/conversion
 */
export const trackGoal = (goalId: string, value?: number) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      goal_id: goalId,
      value: value || 1
    });
  }
};

/**
 * Set user properties
 */
export const setUserProperties = (
  userId: string,
  properties?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('set', {
      user_id: userId,
      ...properties
    });
  }
};

/**
 * Track a transaction/purchase
 */
export const trackTransaction = (
  transactionId: string,
  value: number,
  currency: string = 'USD',
  items?: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items || []
    });
  }
};

/**
 * Track Facebook Pixel event
 */
export const trackFacebookPixelEvent = (
  eventName: string,
  eventData?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, eventData);
  }
};

/**
 * Identify user for Facebook Pixel
 */
export const identifyFacebookPixelUser = (userData: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('setUserData', userData);
  }
};
