'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  getCookiePreferences,
  saveCookiePreferences,
  hasUserConsented,
  getDefaultCookiePreferences,
  loadTrackingScripts
} from '@/lib/cookies';
import { CookiePreferences } from '@/types/cookies';

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(
    getDefaultCookiePreferences()
  );
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if we should show the banner
  useEffect(() => {
    const hasConsented = hasUserConsented();
    if (!hasConsented) {
      // Small delay to avoid layout shift
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // Load scripts based on saved preferences
      const saved = getCookiePreferences();
      loadTrackingScripts(saved);
    }
  }, []);

  const handleAcceptAll = useCallback(() => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functionality: true
    };
    saveCookiePreferences(allAccepted);
    setPreferences(allAccepted);
    loadTrackingScripts(allAccepted);
    setShowBanner(false);
    setIsDismissed(true);
  }, []);

  const handleRejectAll = useCallback(() => {
    const essential: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functionality: false
    };
    saveCookiePreferences(essential);
    setPreferences(essential);
    setShowBanner(false);
    setIsDismissed(true);
  }, []);

  const handleSavePreferences = useCallback(() => {
    saveCookiePreferences(preferences);
    loadTrackingScripts(preferences);
    setShowBanner(false);
    setShowSettings(false);
    setIsDismissed(true);
  }, [preferences]);

  const handlePreferenceChange = useCallback(
    (category: keyof CookiePreferences, value: boolean) => {
      // Essential cookies can't be unchecked
      if (category === 'essential') return;

      setPreferences((prev) => ({
        ...prev,
        [category]: value
      }));
    },
    []
  );

  if (isDismissed || !showBanner) {
    return null;
  }

  return (
    <>
      {/* Banner */}
      <div className='fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl duration-500 animate-in slide-in-from-bottom-4'>
        <div className='mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            {/* Message */}
            <div className='flex-1'>
              <h3 className='text-sm font-semibold text-white'>
                🍪 Cookie Preferences
              </h3>
              <p className='mt-1 text-xs text-slate-300'>
                We use cookies to enhance your experience. By continuing to
                browse, you agree to our use of cookies. You can customize your
                preferences at any time.
              </p>
            </div>

            {/* Actions */}
            <div className='flex flex-col gap-2 sm:flex-row sm:gap-3 sm:whitespace-nowrap'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowSettings(true)}
                className='border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white'
              >
                <Settings className='mr-2 h-4 w-4' />
                Customize
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={handleRejectAll}
                className='border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white'
              >
                Reject
              </Button>

              <Button
                size='sm'
                onClick={handleAcceptAll}
                className='bg-green-600 text-white hover:bg-green-700'
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className='max-w-lg rounded-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <span>🍪</span>
              Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Manage your cookie preferences below. Essential cookies cannot be
              disabled as they are necessary for the website to function
              properly.
            </DialogDescription>
          </DialogHeader>

          {/* Cookie Categories */}
          <div className='space-y-4 py-6'>
            {/* Essential Cookies */}
            <div className='space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950'>
              <div className='flex items-start gap-3'>
                <Checkbox
                  id='essential'
                  checked={preferences.essential}
                  disabled
                  className='mt-1'
                />
                <div className='flex-1'>
                  <Label
                    htmlFor='essential'
                    className='text-sm font-semibold text-foreground'
                  >
                    Essential Cookies
                  </Label>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Required for the website to function properly. These include
                    authentication, security, and basic functionality.
                  </p>
                  <div className='mt-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200'>
                    Always Enabled
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className='space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950'>
              <div className='flex items-start gap-3'>
                <Checkbox
                  id='analytics'
                  checked={preferences.analytics}
                  onCheckedChange={(value) =>
                    handlePreferenceChange('analytics', value as boolean)
                  }
                  className='mt-1'
                />
                <div className='flex-1'>
                  <Label
                    htmlFor='analytics'
                    className='text-sm font-semibold text-foreground'
                  >
                    Analytics Cookies
                  </Label>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Help us understand how you use the website by collecting and
                    reporting information anonymously. Google Analytics, etc.
                  </p>
                </div>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className='space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950'>
              <div className='flex items-start gap-3'>
                <Checkbox
                  id='marketing'
                  checked={preferences.marketing}
                  onCheckedChange={(value) =>
                    handlePreferenceChange('marketing', value as boolean)
                  }
                  className='mt-1'
                />
                <div className='flex-1'>
                  <Label
                    htmlFor='marketing'
                    className='text-sm font-semibold text-foreground'
                  >
                    Marketing Cookies
                  </Label>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Used to track visitors across websites and display relevant
                    ads. Facebook Pixel, LinkedIn, etc.
                  </p>
                </div>
              </div>
            </div>

            {/* Functionality Cookies */}
            <div className='space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950'>
              <div className='flex items-start gap-3'>
                <Checkbox
                  id='functionality'
                  checked={preferences.functionality}
                  onCheckedChange={(value) =>
                    handlePreferenceChange('functionality', value as boolean)
                  }
                  className='mt-1'
                />
                <div className='flex-1'>
                  <Label
                    htmlFor='functionality'
                    className='text-sm font-semibold text-foreground'
                  >
                    Functionality Cookies
                  </Label>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Enable enhanced functionality and personalization. Hotjar,
                    session recordings, etc.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Learn More Link */}
          <div className='border-t border-slate-200 pt-4 dark:border-slate-800'>
            <p className='text-xs text-muted-foreground'>
              <a
                href='/privacy-policy'
                target='_blank'
                rel='noopener noreferrer'
                className='font-medium text-primary hover:underline'
              >
                Read our Privacy Policy
              </a>
              {' or '}
              <a
                href='/cookie-policy'
                target='_blank'
                rel='noopener noreferrer'
                className='font-medium text-primary hover:underline'
              >
                Cookie Policy
              </a>
            </p>
          </div>

          <DialogFooter className='gap-3 sm:gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                setShowSettings(false);
                setShowBanner(true);
              }}
            >
              Back
            </Button>
            <Button
              variant='outline'
              onClick={handleRejectAll}
              className='border-slate-600'
            >
              Reject All
            </Button>
            <Button
              onClick={handleSavePreferences}
              className='bg-green-600 hover:bg-green-700'
            >
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
