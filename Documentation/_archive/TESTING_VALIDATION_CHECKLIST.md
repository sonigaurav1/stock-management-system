# Production-Level Signup Flow - Testing & Validation Checklist

**Date**: April 21, 2026  
**Version**: 1.0

---

## Pre-Deployment Testing

### 1. Code Review

- [ ] `src/app/(auth)/onboarding/setup/page.tsx` - Verify all imports work
- [ ] `src/app/(auth)/onboarding/layout.tsx` - Verify simple layout
- [ ] `src/features/auth/components/SignUpForm.tsx` - Verify redirect change
- [ ] `src/features/auth/BusinessRegistrationForm.tsx` - Verify redirect change
- [ ] `src/components/auth/AccountStatusGuard.tsx` - Verify new user detection logic
- [ ] `src/types/index.ts` - Verify onboarding route added to PUBLIC_ROUTES
- [ ] No TypeScript errors: `pnpm run lint`
- [ ] Build succeeds: `pnpm run build`

### 2. Local Testing - Form-Based Signup

- [ ] Navigate to `/sign-up`
- [ ] Complete Step 1 (Personal Details)
  - [ ] All fields validate correctly
  - [ ] Next button works
- [ ] Complete Step 2 (Business Details)
  - [ ] All fields validate correctly
  - [ ] Dropdowns work (especially country selector)
- [ ] Click "Create Account"
  - [ ] Loading state shows
  - [ ] No console errors
- [ ] Redirected to `/onboarding/setup`
  - [ ] Page loads quickly
  - [ ] Background gradient displays correctly
  - [ ] Logo shows properly
- [ ] Onboarding page initialization
  - [ ] "Verify Your Session" → 🟢 Complete
  - [ ] "Create Your Profile" → ⟳ Loading → 🟢 Complete
  - [ ] "Set Up Access" → ⟳ Loading → 🟢 Complete
  - [ ] "Initialize Workspace" → ⟳ Loading → 🟢 Complete
- [ ] After 2-3 seconds: Auto-redirect to `/dashboard/overview`
  - [ ] ✅ Dashboard loads successfully
  - [ ] ❌ NO "Access Denied" error
  - [ ] Sidebar shows correctly
  - [ ] User data loads (name, email)

### 3. Local Testing - Google OAuth Signup

- [ ] Navigate to `/sign-up`
- [ ] Click "Sign up with Google"
- [ ] Complete Google authentication
- [ ] Redirected to `/company-registration`
  - [ ] Form shows correctly
  - [ ] Pre-filled fields (if any)
- [ ] Fill business details
- [ ] Click "Submit"
  - [ ] Loading state shows
  - [ ] No console errors
- [ ] Redirected to `/onboarding/setup`
  - [ ] Same flow as form-based signup ✓
- [ ] After 2-3 seconds: Auto-redirect to `/dashboard/overview`
  - [ ] ✅ Dashboard loads successfully
  - [ ] User data from Google shows (profile picture, etc.)

### 4. Error Scenarios (Local Testing)

- [ ] Stop backend service → See "Setup Error" message
  - [ ] "Retry" button visible and clickable
  - [ ] "Sign In Again" button visible
- [ ] Clear Convex data → Simulate missing records
  - [ ] Error message shows "Initialization incomplete"
  - [ ] Can click retry
- [ ] Very slow network → Simulate delay
  - [ ] Onboarding page shows loading state
  - [ ] After retry, eventually succeeds

### 5. Mobile Testing (iPhone/Android)

- [ ] Onboarding page responsive on mobile
  - [ ] No horizontal scrolling
  - [ ] Text readable at default zoom
  - [ ] Buttons have good touch targets
  - [ ] Logo visible
- [ ] Profile steps visible and readable
- [ ] Buttons clickable on mobile
- [ ] Form-based signup on mobile
  - [ ] Fields aren't too small
  - [ ] Can scroll through steps
  - [ ] Country dropdown works

### 6. Dark Mode Testing

- [ ] Set system to dark mode (or enable in browser)
- [ ] Navigate through signup
- [ ] Onboarding page in dark mode
  - [ ] Background dark
  - [ ] Text has proper contrast (readability test)
  - [ ] Icons visible
  - [ ] Loading spinner visible
  - [ ] Buttons visible and clickable
- [ ] Dashboard loads in dark mode
  - [ ] No broken colors

### 7. Cross-Browser Testing

- [ ] Chrome latest
  - [ ] [ ] Signup complete
  - [ ] [ ] Onboarding loads
  - [ ] [ ] Dashboard accessible
- [ ] Safari latest
  - [ ] [ ] Signup complete
  - [ ] [ ] Onboarding loads
  - [ ] [ ] Dashboard accessible
- [ ] Firefox latest
  - [ ] [ ] Signup complete
  - [ ] [ ] Onboarding loads
  - [ ] [ ] Dashboard accessible
- [ ] Edge latest
  - [ ] [ ] Signup complete
  - [ ] [ ] Onboarding loads
  - [ ] [ ] Dashboard accessible

### 8. Session & Auth Testing

- [ ] Refresh page during onboarding → Stays on onboarding (auto-retries)
- [ ] Open onboarding in 2 tabs → Both redirect to dashboard correctly
- [ ] Go back (browser back button) during onboarding → Redirects forward
- [ ] Sign in with different account during onboarding → Works correctly
- [ ] Session expiry → Clear error message

### 9. Performance Testing

- [ ] Onboarding page load time < 2 seconds
- [ ] Dashboard load time < 3 seconds from onboarding
- [ ] Queries execute quickly (check Convex dashboard)
- [ ] No memory leaks (DevTools - Performance tab)
  - [ ] Memory stable after multiple signup cycles
  - [ ] No garbage collection pauses

### 10. Accessibility Testing

- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
  - [ ] Loading steps announced correctly
  - [ ] Button text clear
  - [ ] Error messages announced
  - [ ] Success state clear
- [ ] Keyboard navigation only (no mouse)
  - [ ] Can tab through all elements
  - [ ] Can activate buttons with Enter/Space
  - [ ] Tab order logical
- [ ] Zoom test (200%)
  - [ ] All text readable at 200% zoom
  - [ ] No layout broken
  - [ ] Buttons still clickable

---

## Staging Environment Testing

### Before Merge to Main

- [ ] Deploy to staging environment
- [ ] Full regression test suite passes
- [ ] No new console errors or warnings
- [ ] Convex queries performance acceptable
- [ ] Database backup created
- [ ] Monitoring/logging in place

### Stakeholder Testing

- [ ] Product manager signs up successfully
- [ ] Design team approves UI/UX
- [ ] Support team ready for user questions
- [ ] Marketing team updated on new flow

---

## Post-Deployment Verification

### First 24 Hours (Production)

- [ ] Monitor signup success rate (target: > 95%)
- [ ] Check for "Account not found" errors (target: < 1%)
- [ ] Monitor redirect times (target: 2-4 seconds)
- [ ] Zero critical bugs reported
- [ ] User feedback positive (if any)

### First Week

- [ ] Signup completion rate tracking
- [ ] Onboarding page abandonment rate (target: < 5%)
- [ ] Error rate stable and low (< 1%)
- [ ] No memory leaks reported
- [ ] Session handling stable

### Metrics Dashboard Setup

- [ ] Conversion: Signup start → Dashboard success
- [ ] Timing: Onboarding page load → Dashboard load
- [ ] Errors: Count and categorize issues
- [ ] Retention: Users who complete signup stay active

---

## Known Limitations & Workarounds

| Issue                             | Workaround                         | Status          |
| --------------------------------- | ---------------------------------- | --------------- |
| Very slow Convex backend          | Increase MAX_RETRIES to 5+         | ✅ Configurable |
| Network timeout during polling    | User clicks retry button           | ✅ Handled      |
| Session expires during onboarding | Clear error, user signs in again   | ✅ Handled      |
| Multiple rapid signups            | Each user gets own onboarding page | ✅ Works        |

---

## Rollback Checklist

If critical issues found:

- [ ] Git revert commit prepared
- [ ] Team notified
- [ ] Users informed of temporary issue
- [ ] Revert deployed (< 5 minutes)
- [ ] Verification on staging
- [ ] Verification on production
- [ ] Post-mortem scheduled

**Rollback Time Target**: < 10 minutes

---

## Sign-Off

### Development Team

- [ ] Code reviewed and approved
- [ ] Tests pass locally
- [ ] No known critical issues
- [ ] Ready for staging

**Date**: ****\_****  
**Reviewer**: ****\_****  
**Signature**: ****\_****

### QA Team

- [ ] Test plan complete
- [ ] All critical tests passed
- [ ] Accessibility verified
- [ ] Performance acceptable
- [ ] Ready for production

**Date**: ****\_****  
**Reviewer**: ****\_****  
**Signature**: ****\_****

### Product Team

- [ ] Requirements met
- [ ] UX/UI approved
- [ ] Support team ready
- [ ] Deployment approved

**Date**: ****\_****  
**Reviewer**: ****\_****  
**Signature**: ****\_****

---

## Test Results Log

### Round 1: ******\_******

- Started: ****\_\_****
- Completed: ****\_\_****
- Issues Found: ****\_\_****
- Status: [ ] Pass [ ] Fail [ ] Conditional Pass

### Round 2: ******\_******

- Started: ****\_\_****
- Completed: ****\_\_****
- Issues Found: ****\_\_****
- Status: [ ] Pass [ ] Fail [ ] Conditional Pass

### Round 3: ******\_******

- Started: ****\_\_****
- Completed: ****\_\_****
- Issues Found: ****\_\_****
- Status: [ ] Pass [ ] Fail [ ] Conditional Pass

---

## Issue Tracking

| Issue # | Description                                      | Severity | Status | Fix                       |
| ------- | ------------------------------------------------ | -------- | ------ | ------------------------- |
| 1       | (Example) Onboarding page doesn't load on Safari | HIGH     | CLOSED | Updated viewport meta tag |
|         |                                                  |          |        |                           |
|         |                                                  |          |        |                           |

---

## Final Deployment Approval

**All boxes checked?** ☐ Yes ☐ No

**Ready for production?** ☐ Yes ☐ No

**Estimated impact**: Low Risk (no breaking changes, fully backward compatible)

**Deployment window**: Anytime (no dependencies, no data migration)

**Estimated rollback time**: < 10 minutes

**Support notification**: [ ] Email template ready
[ ] Slack notification ready
[ ] Documentation updated

---

**Checklist Completed By**: ********\_\_********  
**Date**: ********\_\_********  
**Status**: ✅ READY FOR PRODUCTION
