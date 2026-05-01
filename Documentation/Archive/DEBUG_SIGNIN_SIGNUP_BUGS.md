# Sign-In & Sign-Up Debug Analysis

## 🐛 BUGS FOUND

### 1. **CRITICAL: Silent Failure in Sign-In** (`useAuth.ts`)

**Location**: `handleSignIn()` function  
**Issue**: Only handles `status === 'complete'`. Other statuses silently fail.

```typescript
// BUG: What if status is 'needs_first_factor', 'needs_identifier_verification', etc?
if (signInAttempt.status === 'complete') {
  // handle success
}
// ❌ NO ELSE - just silently fails!
```

**Impact**: Users can't sign in with MFA, identifier verification, or other multi-step flows.

---

### 2. **CRITICAL: Lost SignUp State on Verify Email Page**

**Location**: `verify-email/page.tsx`  
**Issue**: Fresh `useSignUp()` hook after page redirect loses the signup context.

```typescript
// BUG: After redirect, this is a NEW signUp instance!
const { signUp, isLoaded } = useSignUp();

// This check might fail after page reload:
if (!signUp?.status || signUp.status === 'complete') {
  router.push('/sign-up');
}
```

**Impact**:

- If user refreshes page on verify-email route, they get redirected to sign-up
- SignUp state is not preserved across navigation
- User has to start over

---

### 3. **HIGH: No Fallback When sessionStorage is Empty**

**Location**: `verify-email/page.tsx` initialization  
**Issue**: No handling if `currentSignUpAttempt` is missing from sessionStorage.

```typescript
// BUG: What if storedData is null?
const storedData = sessionStorage.getItem('currentSignUpAttempt');
if (storedData) {
  const { email: storedEmail } = JSON.parse(storedData);
  setEmail(storedEmail); // email stays empty if storedData is null
}
```

**Impact**: Email display shows empty, user confused about which email needs verification.

---

### 4. **HIGH: Insufficient Error Handling in SignUp**

**Location**: `useAuth.ts` - `handleSignUp()`  
**Issue**: Missing session setup and incomplete error context.

```typescript
// BUG: Session might not be activated before redirect
if (setActive && signUpAttempt.createdSessionId) {
  try {
    await setActive({ session: signUpAttempt.createdSessionId });
  } catch (sessionErr) {
    toast.error('Session setup failed...');
    router.push('/sign-in');
    return; // But user already created!
  }
}
```

**Impact**: If session fails to activate, user is redirected to sign-in but account exists.

---

### 5. **MEDIUM: Verify Email Doesn't Set Active Session**

**Location**: `verify-email/page.tsx` - `handleVerify()`  
**Issue**: After verification completes, the session is NOT activated.

```typescript
if (completeSignUp.status === 'complete') {
  // ❌ BUG: No setActive() call!
  // User is verified but not logged in
  router.push('/company-registration'); // Expects user to be logged in
}
```

**Impact**: On company-registration page, `useUser()` might not have the user data yet.

---

### 6. **MEDIUM: No Validation Before Company Registration**

**Location**: `company-registration/page.tsx`  
**Issue**: No check if user actually completed email verification.

```typescript
// BUG: Any authenticated user can access, not just those who verified
if (isLoaded && !user && !isOAuthCallback) {
  setShouldRedirect(true);
}
```

**Impact**: Users could potentially bypass email verification step.

---

### 7. **MEDIUM: Race Condition in Email Verification Storage**

**Location**: `useAuth.ts` - `handleSignUp()` around line 88-103  
**Issue**: Data stored in sessionStorage immediately after prepareEmailAddressVerification.

```typescript
// BUG: Potential race condition - what if prepareEmailAddressVerification fails?
await signUpAttempt.prepareEmailAddressVerification({ strategy: 'email_code' });

// Then immediately store (might store incomplete state)
sessionStorage.setItem('currentSignUpAttempt', JSON.stringify({...}));
router.push('/verify-email'); // Off to verify page with maybe incomplete state
```

---

### 8. **LOW: No Response Status Check in Role API**

**Location**: `verify-email/page.tsx` line 53  
**Issue**: API response not properly validated before proceeding.

```typescript
// LOW: Just logs warning if API call fails
if (!roleResponse.ok) {
  console.warn('Failed to set user role');
  // ❌ But continues anyway to company-registration
}
```

---

## 🔧 ROOT CAUSES

| Bug | Root Cause                                               |
| --- | -------------------------------------------------------- |
| #1  | Incomplete status handling in handleSignIn               |
| #2  | Clerk's useSignUp hook loses state on page navigation    |
| #3  | sessionStorage not validated before use                  |
| #4  | Missing session activation after email verification      |
| #5  | Session not set active in verify-email                   |
| #6  | No verification status tracking                          |
| #7  | No error handling around prepareEmailAddressVerification |
| #8  | Silent API errors for role assignment                    |

---

## 📊 FLOW DIAGRAM - Current (BROKEN)

```
Sign Up Form
    ↓
handleSignUp()
    ├→ create account
    ├→ prepareEmailAddressVerification()
    ├→ store data in sessionStorage
    └→ redirect to /verify-email

/verify-email
    ├→ NEW useSignUp() instance loses state ❌
    ├→ checks sessionStorage (might be empty)
    ├→ user enters code
    ├→ attemptEmailAddressVerification()
    ├→ ❌ NO setActive() - session not activated
    └→ redirect to /company-registration

/company-registration
    └→ useUser() might not have user (not logged in) ❌
```

---

## ✅ SOLUTIONS (Implement These Changes)

### Solution 1: Complete Sign-In Status Handling

```typescript
// In handleSignIn - add all status cases
if (signInAttempt.status === 'complete') {
  // success
} else if (signInAttempt.status === 'needs_first_factor') {
  toast.error('Requires verification factor');
} else if (signInAttempt.status === 'needs_identifier_verification') {
  // Handle identifier verification flow
} else {
  toast.error(`Unknown sign-in status: ${signInAttempt.status}`);
}
```

### Solution 2: Preserve SignUp State

```typescript
// In verify-email page - validate state before redirecting
useEffect(() => {
  const storedData = sessionStorage.getItem('currentSignUpAttempt');

  if (!storedData) {
    toast.error('Session expired. Please sign up again.');
    router.push('/sign-up');
    return;
  }
  // Continue with verification
}, []);
```

### Solution 3: Activate Session After Email Verification

```typescript
// In verify-email - add setActive after verification
if (completeSignUp.status === 'complete') {
  const { setActive } = useClerk();
  await setActive({ session: completeSignUp.createdSessionId });
  router.push('/company-registration');
}
```

### Solution 4: Verify Email Verification Before Company Registration

```typescript
// In company-registration - check verification status via Clerk
useEffect(() => {
  if (isLoaded && user) {
    // Check if email is actually verified
    const emailVerified = user.emailAddresses.some(
      (email) => email.verification?.status === 'verified'
    );
    if (!emailVerified && !isOAuthCallback) {
      router.push('/verify-email');
    }
  }
}, [user, isLoaded]);
```

---

## 🎯 PRIORITY FIXES

1. **CRITICAL**: Add setActive() in verify-email after verification completes
2. **CRITICAL**: Add complete status handling in handleSignIn
3. **HIGH**: Validate sessionStorage data before using in verify-email
4. **HIGH**: Add email verification check in company-registration
5. **MEDIUM**: Add error handling around prepareEmailAddressVerification
6. **MEDIUM**: Add proper API error handling for role assignment
