# Production-Level Company Details Signup Flow Implementation

## Overview

This implementation ensures that users cannot access the dashboard (`/dashboard/overview`) without submitting company details. Two separate flows are handled:

1. **Form-based Signup**: Personal + Business details collected in signup form
2. **Google OAuth Signup**: Business details collected on `/company-registration` page

---

## Complete Flow Architecture

### 1. FORM-BASED SIGNUP (No company-registration redirect)

```
Step 1: Personal Details Form
  ↓
Step 2: Business Details Form
  ↓
onBusinessSubmit():
  ├─ handleSignUp() → Creates Clerk account & returns userId
  ├─ createAccountStatus(userId, businessType) → Saves to Convex
  ├─ upsertOrganizationSettings(...) → Saves company details to Convex
  ├─ POST /api/company-details-submitted → Updates Clerk metadata
  │  └─ Sets publicMetadata.companyDetailsSubmitted = true
  └─ router.push('/dashboard/overview') → Redirects to dashboard
      ↓
  Middleware checks: companyDetailsSubmitted flag ✓
      ↓
  BusinessProfileGuard checks:
  ├─ isBusinessProfileComplete (Convex) ✓
  └─ companyDetailsSubmitted (Clerk metadata) ✓
      ↓
  Dashboard renders ✅
```

### 2. GOOGLE OAUTH SIGNUP (Requires company-registration)

```
OAuth Sign-up with Google
  ↓
Account created in Clerk (NO company details)
  ↓
Redirected to /company-registration
  ↓
CompanyRegistrationForm.handleSubmit():
  ├─ createAccountStatus(userId, businessType) → Saves to Convex
  ├─ upsertOrganizationSettings(...) → Saves company details to Convex
  ├─ POST /api/company-details-submitted → Updates Clerk metadata
  │  └─ Sets publicMetadata.companyDetailsSubmitted = true
  └─ router.push('/dashboard/overview') → Redirects to dashboard
      ↓
  Middleware checks: companyDetailsSubmitted flag ✓
      ↓
  BusinessProfileGuard checks:
  ├─ isBusinessProfileComplete (Convex) ✓
  └─ companyDetailsSubmitted (Clerk metadata) ✓
      ↓
  Dashboard renders ✅
```

---

## Components Modified

### 1. SignUpForm.tsx (`onBusinessSubmit`)

- **File**: `src/features/auth/components/SignUpForm.tsx`
- **Change**: After saving business details, calls `/api/company-details-submitted` to mark company details as submitted
- **Key code**:
  ```typescript
  // Mark company details as submitted in Clerk metadata
  const companyDetailsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/company-details-submitted`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    }
  );
  // Then redirect to dashboard (NOT company-registration!)
  router.push('/dashboard/overview');
  ```

### 2. BusinessRegistrationForm.tsx (`handleSubmit`)

- **File**: `src/features/auth/BusinessRegistrationForm.tsx`
- **Change**: After saving business details (for OAuth users), calls `/api/company-details-submitted`
- **Same pattern as SignUpForm** for consistency

### 3. New API Route: `/api/company-details-submitted`

- **File**: `src/app/api/company-details-submitted/route.ts`
- **Purpose**: Updates Clerk user's public metadata to mark company details as submitted
- **Payload**: `{ userId: string }`
- **Response**: Updates Clerk with `publicMetadata.companyDetailsSubmitted = true` and timestamp
- **Error handling**: Validates inputs, handles Clerk API errors gracefully

### 4. Middleware: proxy.ts

- **File**: `src/proxy.ts`
- **Change**: Updated to check `companyDetailsSubmitted` claim instead of just `isVerified`
- **Protection**:
  ```typescript
  // If user hasn't submitted company details and is trying to access dashboard
  if (!hasCompanyDetails && isDashboardRoute(request)) {
    return NextResponse.redirect(
      new URL(RedirectDestination.COMPANY_REGISTRATION, request.url)
    );
  }
  ```

### 5. BusinessProfileGuard Component

- **File**: `src/features/auth/components/BusinessProfileGuard.tsx`
- **Change**: Enhanced to check BOTH:
  - Convex DB: `isBusinessProfileComplete` query (checks organizationSettings)
  - Clerk metadata: `companyDetailsSubmitted` flag
- **Ensures**:
  - Multi-layer protection against race conditions
  - If either check fails, redirects to `/company-registration`
  - Prevents accessing dashboard without complete company details

---

## Multi-Layer Protection Strategy

### Layer 1: Middleware (proxy.ts)

- Fast check at request level
- Blocks unauthorized access before reaching app
- Checks: `companyDetailsSubmitted` claim from Clerk metadata

### Layer 2: Layout Guard (BusinessProfileGuard)

- Checks at component level
- Verifies both Convex and Clerk state
- Prevents race conditions:
  - `isBusinessProfileComplete` (Convex DB record exists)
  - `companyDetailsSubmitted` (Clerk metadata set)
- Shows loading state during verification

### Layer 3: Session Persistence

- Clerk metadata ensures persistence across sessions
- Convex DB records ensure data consistency
- Both sources checked for redundancy

---

## Security Guarantees

✅ **Users cannot access dashboard without company details**

- Middleware redirects unauthorized requests
- BusinessProfileGuard blocks access at component level
- Two independent checks ensure no bypass

✅ **Form-based signup does NOT redirect to company-registration**

- Company details collected in signup form (Step 2)
- Directly redirects to dashboard after signup
- API call marks completion before redirect

✅ **Google OAuth users MUST complete company-registration**

- No company details collected during OAuth
- Middleware redirects to `/company-registration`
- Cannot proceed to dashboard until form submitted

✅ **No race conditions or inconsistencies**

- Both Convex DB and Clerk metadata checked
- Company details saved before redirect
- Clerk metadata updated in same request
- Synchronized checks prevent edge cases

---

## Production Considerations

### Error Handling

- All API calls include try-catch blocks
- Graceful degradation if Clerk API fails
- Console logging for debugging
- Toast notifications for user feedback

### Performance

- Middleware check is fast (metadata lookup)
- BusinessProfileGuard uses Convex query (cached)
- No additional DB queries after initial checks
- Minimal UI blocking (only show loading if needed)

### Logging

- SignUpForm logs business details save progress
- API route logs Clerk update success/failure
- BusinessProfileGuard logs redirect reasons
- Middleware logs unauthorized access attempts

### Testable Flows

1. **Form signup** → Business details → Dashboard ✓
2. **Google OAuth** → Company registration → Dashboard ✓
3. **Direct dashboard access without company details** → Redirect to company-registration ✓
4. **Company registration incomplete** → Cannot access dashboard ✓

---

## Environment Variables Required

```env
NEXT_PUBLIC_API_URL=<app-url>
CLERK_SECRET_KEY=<clerk-api-key>
```

---

## Files Modified Summary

| File                               | Change                                 | Type       |
| ---------------------------------- | -------------------------------------- | ---------- |
| SignUpForm.tsx                     | Add company details submitted API call | Feature    |
| BusinessRegistrationForm.tsx       | Add company details submitted API call | Feature    |
| company-details-submitted/route.ts | NEW API route                          | New File   |
| proxy.ts (middleware)              | Check companyDetailsSubmitted flag     | Protection |
| BusinessProfileGuard.tsx           | Enhanced with Clerk metadata check     | Protection |

---

## Exact User Flow Verification

### ✅ Form-Based Signup

```
1. User enters personal details → Step 2
2. User enters business details → onBusinessSubmit()
3. Create Clerk account
4. Save company details to Convex
5. Mark companyDetailsSubmitted = true in Clerk
6. Redirect to /dashboard/overview
7. BusinessProfileGuard allows access
8. Dashboard renders
Result: NO intermediate /company-registration page ✅
```

### ✅ Google OAuth Signup

```
1. User clicks "Sign with Google"
2. Clerk creates account (no company details)
3. Redirected to /company-registration
4. User fills company details
5. handleSubmit() saves details
6. Mark companyDetailsSubmitted = true in Clerk
7. Redirect to /dashboard/overview
8. BusinessProfileGuard allows access
9. Dashboard renders
Result: Required company-registration page ✅
```

### ✅ Protection Test

```
1. User tries direct access: /dashboard/overview
2. Middleware checks: companyDetailsSubmitted missing
3. Redirects to /company-registration
4. User must complete form
5. After submission, can access dashboard
Result: Cannot bypass company details ✅
```
