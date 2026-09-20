'use client';

import React, { createContext, useContext, useMemo } from 'react';

/**
 * Feature Flags Context
 * Provides centralized feature toggling
 * Enables graceful degradation and testing of new features
 *
 * Usage: useFeatureFlag().isEnabled('advanced_reporting')
 */

interface FeatureFlagsContextType {
  isEnabled: (flag: string) => boolean;
  getAllFlags: () => Record<string, boolean>;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(
  undefined
);

interface FeatureFlagsProviderProps {
  children: React.ReactNode;
}

/**
 * Define your feature flags here
 * Can be overridden by environment variables: NEXT_PUBLIC_ENABLED_FEATURES
 */
const DEFAULT_FLAGS: Record<string, boolean> = {
  advanced_reporting: true,
  inventory_forecast: true,
  supplier_portal: false,
  auto_restock: true
};

export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
  const flags = useMemo<Record<string, boolean>>(() => {
    const envFlags = process.env.NEXT_PUBLIC_ENABLED_FEATURES?.split(',') ?? [];

    return {
      ...DEFAULT_FLAGS,
      // Environment flags override defaults
      ...Object.fromEntries(envFlags.map((flag) => [flag.trim(), true]))
    };
  }, []);

  const isEnabled = (flag: string): boolean => {
    return flags[flag] ?? false;
  };

  const getAllFlags = () => flags;

  const value = useMemo<FeatureFlagsContextType>(
    () => ({ isEnabled, getAllFlags }),
    [flags]
  );

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

/**
 * Hook to access feature flags
 * Must be used within FeatureFlagsProvider
 */
export function useFeatureFlag() {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error(
      'useFeatureFlag must be used within FeatureFlagsProvider. ' +
        'Make sure FeatureFlagsProvider wraps your component.'
    );
  }
  return context;
}
