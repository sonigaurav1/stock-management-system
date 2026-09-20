'use client';

import { PROJECT_NAME } from '@/constants/data';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  storageKey?: string;
  attribute?: string;
};

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const isTheme = (value: string | null): value is Theme => {
  return value === 'light' || value === 'dark' || value === 'system';
};

export const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

// Single source of truth - USE THIS EVERYWHERE
const applyTheme = (theme: ResolvedTheme, attribute: string) => {
  if (typeof window === 'undefined') return;

  const root = window.document.documentElement;

  if (attribute === 'class') {
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  } else {
    root.setAttribute(attribute, theme);
  }
};

export const setSystemTheme = (theme: ResolvedTheme, attribute = 'class') => {
  applyTheme(theme, attribute);
};

export default function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableSystem = true,
  storageKey = 'theme',
  attribute = 'class'
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemThemeState] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false); // ← ADDED

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(storageKey);

    if (isTheme(storedTheme)) {
      setThemeState(storedTheme);
    } else {
      setThemeState(defaultTheme);
    }

    setSystemThemeState(getSystemTheme());
    setMounted(true); // ← ADDED
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    if (!enableSystem) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) =>
      setSystemThemeState(e.matches ? 'dark' : 'light'); // ← More efficient

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableSystem]);

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  // ← USE applyTheme instead of duplicating logic
  useEffect(() => {
    if (!mounted) return;
    applyTheme(resolvedTheme, attribute);
  }, [resolvedTheme, attribute, mounted]);

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme);
      window.localStorage.setItem(storageKey, nextTheme);

      // ← Apply immediately, don't wait for useEffect
      const actualTheme = nextTheme === 'system' ? systemTheme : nextTheme;
      applyTheme(actualTheme, attribute);
    },
    [storageKey, systemTheme, attribute]
  );

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      systemTheme
    }),
    [theme, setTheme, resolvedTheme, systemTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
