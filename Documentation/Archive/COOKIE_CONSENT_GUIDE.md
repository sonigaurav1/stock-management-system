# Cookie Consent System

Enterprise-ready cookie consent management for your Digital Dukan application.

## Features

✅ **GDPR Compliant** - Respects user privacy preferences
✅ **User-Friendly** - Clean banner UI with preference customization
✅ **Cookie Categories** - Essential, Analytics, Marketing, Functionality
✅ **Persistent Storage** - Saves user preferences in localStorage
✅ **Script Loading** - Conditionally loads tracking scripts based on preferences
✅ **Analytics Integration** - Support for Google Analytics, Facebook Pixel, Hotjar
✅ **Dark Mode** - Fully themed for light and dark modes
✅ **Mobile Responsive** - Works seamlessly on all devices

## Components

### CookieConsentBanner

Main component that displays the cookie consent banner and preferences dialog.

```tsx
import { CookieConsentBanner } from '@/components/cookies/CookieConsentBanner';

// Add to your layout (already added in root layout)
<CookieConsentBanner />;
```

## Hooks

### useCookiePreferences

Hook to manage cookie preferences in client components.

```tsx
import { useCookiePreferences } from '@/hooks/use-cookie-preferences';

export function MyComponent() {
  const { preferences, isLoading, updatePreference, isAllowed } =
    useCookiePreferences();

  if (isLoading) return <div>Loading...</div>;

  const analyticsEnabled = isAllowed('analytics');

  return (
    <button onClick={() => updatePreference('marketing', true)}>
      Enable Marketing Cookies
    </button>
  );
}
```

### useCookieCategory

Hook to check if a specific cookie category is allowed.

```tsx
import { useCookieCategory } from '@/hooks/use-cookie-preferences';

export function AnalyticsComponent() {
  const analyticsAllowed = useCookieCategory('analytics');

  if (!analyticsAllowed) {
    return <div>Analytics disabled</div>;
  }

  return <div>Analytics dashboard</div>;
}
```

## Utilities

### Cookie Management

```tsx
import {
  getCookiePreferences,
  saveCookiePreferences,
  hasUserConsented,
  isCategoryAllowed,
  loadTrackingScripts,
  clearCookiePreferences
} from '@/lib/cookies';

// Get current preferences
const prefs = getCookiePreferences();

// Save new preferences
saveCookiePreferences({
  essential: true,
  analytics: true,
  marketing: false,
  functionality: true
});

// Check if user has consented
if (hasUserConsented()) {
  // User has already set preferences
}

// Check specific category
if (isCategoryAllowed('analytics')) {
  // Analytics is allowed
}

// Clear user preferences (reset)
clearCookiePreferences();
```

### Analytics Events

```tsx
import {
  trackEvent,
  trackPageView,
  trackGoal,
  setUserProperties,
  trackTransaction,
  trackFacebookPixelEvent,
  identifyFacebookPixelUser
} from '@/lib/analytics';

// Track custom event
trackEvent('button_click', {
  button_name: 'checkout',
  page: '/products'
});

// Track page view
trackPageView('/checkout', 'Checkout Page');

// Track goal/conversion
trackGoal('purchase_goal', 100);

// Set user properties
setUserProperties('user_123', {
  subscription_level: 'premium'
});

// Track transaction
trackTransaction('TXN_001', 99.99, 'USD', [
  {
    item_id: 'SKU_123',
    item_name: 'Premium Plan',
    price: 99.99,
    quantity: 1
  }
]);

// Track Facebook Pixel event
trackFacebookPixelEvent('AddToCart', {
  content_name: 'Product Name',
  content_type: 'product',
  value: 29.99,
  currency: 'USD'
});
```

## Cookie Categories

### Essential (Always Enabled)

- Authentication sessions
- Security tokens (CSRF)
- User preferences
- Basic functionality

### Analytics

- Google Analytics
- User behavior tracking
- Performance metrics
- Session duration

### Marketing

- Facebook Pixel
- LinkedIn Insight Tag
- Retargeting pixels
- Conversion tracking

### Functionality

- Hotjar (session recordings)
- Feature usage tracking
- User experience analytics
- Bug reporting

## Environment Variables

Add these to your `.env.local`:

```env
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXX

# Facebook Pixel
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=XXXXXXXXX

# Hotjar
NEXT_PUBLIC_HOTJAR_ID=XXXXXXXXX
```

## Pages

### Cookie Policy

Access at `/cookie-policy` to view the full cookie policy.

Update the cookie policy page content in:

```
src/app/(public)/cookie-policy/page.tsx
```

## Customization

### Change Banner Text

Edit the banner text in:

```tsx
src / components / cookies / CookieConsentBanner.tsx;
```

### Add More Cookie Categories

1. Add to `CookieCategory` type in `src/types/cookies.ts`
2. Add checkbox in the settings dialog
3. Add loading logic in `src/lib/cookies.ts`

### Customize Colors/Styling

The banner uses Tailwind classes. Modify the className props in:

```tsx
src / components / cookies / CookieConsentBanner.tsx;
```

## Best Practices

1. **Always get consent** before loading non-essential scripts
2. **Respect user preferences** - don't force analytics if disabled
3. **Update privacy policy** when adding new trackers
4. **Test analytics** in different browsers with consent disabled
5. **Document** what data is collected for each category
6. **Provide easy opt-out** - links to cookie settings on every page

## Data Storage

Cookie preferences are saved in `localStorage` under the key:

```
cookie_preferences
```

Example stored data:

```json
{
  "essential": true,
  "analytics": true,
  "marketing": false,
  "functionality": true,
  "consentedAt": 1713394800000
}
```

## Privacy Compliance

This system helps comply with:

- ✅ GDPR (EU Cookie Law)
- ✅ ePrivacy Directive
- ✅ CCPA regulations
- ✅ PIPEDA (Canada)

## Flow

1. User visits website for first time
2. Cookie consent banner appears after 500ms delay
3. User can:
   - "Accept All" - enables all non-essential cookies
   - "Reject" - disables analytics & marketing
   - "Customize" - open settings dialog for granular control
4. Preferences saved to localStorage
5. Tracking scripts loaded based on preferences
6. Page doesn't reload - smooth experience

## Troubleshooting

### Banner not showing

- Check if localStorage is available
- Verify `CookieConsentBanner` is added to layout
- Check browser console for errors

### Scripts not loading

- Verify environment variables are set
- Check if category is enabled in preferences
- Open DevTools Network tab to see request

### Preferences not saving

- Check browser localStorage quota
- Verify localStorage is not disabled
- Check browser console for errors

## Testing

Test in different scenarios:

```tsx
// Clear preferences and see banner again
localStorage.removeItem('cookie_preferences');
location.reload();

// Check saved preferences
JSON.parse(localStorage.getItem('cookie_preferences'));

// Verify tracking scripts are loaded
window
  .gtag(
    // Google Analytics
    window
  )
  .fbq(
    // Facebook Pixel
    window
  ).hj; // Hotjar
```
