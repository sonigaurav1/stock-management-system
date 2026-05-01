'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode
} from 'react';

interface OnboardingState {
  hasCompletedSetup: boolean;
  isVerifying: boolean;
  setupStartedAt: number | null;
}

interface OnboardingContextType extends OnboardingState {
  markSetupComplete: () => void;
  startVerification: () => void;
  endVerification: () => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function OnboardingStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>({
    hasCompletedSetup: false,
    isVerifying: false,
    setupStartedAt: null
  });

  const markSetupComplete = useCallback(() => {
    setState((prev) => ({
      ...prev,
      hasCompletedSetup: true,
      setupStartedAt: Date.now()
    }));
  }, []);

  const startVerification = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isVerifying: true
    }));
  }, []);

  const endVerification = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isVerifying: false
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      hasCompletedSetup: false,
      isVerifying: false,
      setupStartedAt: null
    });
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        ...state,
        markSetupComplete,
        startVerification,
        endVerification,
        reset
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingState() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error(
      'useOnboardingState must be used within OnboardingStateProvider'
    );
  }
  return context;
}
