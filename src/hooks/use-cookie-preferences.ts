import { useEffect, useState } from 'react';
import { CookiePreferences, CookieCategory } from '@/types/cookies';
import {
  getCookiePreferences,
  saveCookiePreferences,
  isCategoryAllowed
} from '@/lib/cookies';

/**
 * Hook for managing cookie preferences
 */
export function useCookiePreferences() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    const loaded = getCookiePreferences();
    setPreferences(loaded);
    setIsLoading(false);
  }, []);

  const updatePreference = (category: CookieCategory, value: boolean) => {
    if (!preferences) return;

    // Essential cookies can't be unchecked
    if (category === 'essential') return;

    const updated = {
      ...preferences,
      [category]: value
    };
    setPreferences(updated);
    saveCookiePreferences(updated);
  };

  const isAllowed = (category: CookieCategory): boolean => {
    if (preferences === null) return false;
    return preferences[category] || false;
  };

  return {
    preferences,
    isLoading,
    updatePreference,
    isAllowed
  };
}

/**
 * Hook to check if specific cookie category is allowed
 */
export function useCookieCategory(category: CookieCategory): boolean {
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    setIsAllowed(isCategoryAllowed(category));
  }, [category]);

  return isAllowed;
}
