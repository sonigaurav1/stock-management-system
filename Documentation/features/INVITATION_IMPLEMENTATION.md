# Invitation System Implementation Summary

## 🎯 Architecture: Option A (Single-Tenant)
**Invited staff belongs to Owner's company - uses owner's company details, no duplication**

---

## ✅ What Was Implemented

### 1. **Schema Consolidation**
- Enhanced `companyMembers` table with `token`, `expiresAt`, `resendCount`, `by_token` index
- Marked `invitations` table as deprecated (kept for backward compatibility)

### 2. **Email Sending** 
- New `sendInviteEmail` action - sends HTML emails via SendGrid
- Professional template with invite link, role, company context
- Respects env vars: `SENDGRID_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_APP_URL`

### 3. **Role Assignment**
- `inviteMember` mutation now accepts role parameter
- Updated UI shows role selector in invite dialog (Manager, Staff, Viewer)

### 4. **Improved Status Tracking**
- Invite tokens generated automatically (24-char unique)
- 7-day expiry by default
- Resend tracking with counter
- Expired detection on queries

### 5. **New Capabilities**
- **`sendInviteEmail` action** - Email invitations
- **`resendInvitation` mutation** - Resend expired/unanswered invites
- **`getPendingInvitations` query** - List with status & expiry
- **`getInvitationByToken` query** - Lookup by token (public)
- **`acceptInvitationByToken` mutation** - Accept via token link

### 6. **Enhanced UI Components**
- **InviteMemberDialog** - Two-stage flow (create → share/email)
  - Email tab: Send invitation email
  - Link tab: Copy shareable link
  - Role selector during creation
  
- **TeamMembersList** - Pending + Active sections
  - Pending: Amber highlight, resend/copy/delete buttons
  - Active: Role dropdowns, delete buttons
  - Shows expiry countdown and resend count

### 7. **New Acceptance Flow**
- **`/auth/accept-invite?token=TOKEN`** page
  - Shows invitation preview
  - Auto-accepts if signed in
  - Email validation
  - Error handling for expired/invalid

### 8. **Company Details Skip (Option A)**
- Updated `company-registration` page
- If invite token present: Skip company details form
- Redirect to accept-invite page instead
- Explains why company details not needed

---

## 🔄 User Flows

### **Staff Invited (Option A)**
```
Owner: Opens "Invite Member" → Fills email/name/role
       ↓
       Chooses: Email Invite OR Copy Link
       ↓
Staff: Receives email OR gets link manually
          ↓
          Clicks link → /auth/accept-invite?token=TOKEN
          ↓ (if not signed up: sign up first)
          ↓
          Auto-accepts → Redirects to /dashboard/overview
          ↓
          Result: "Accepted" member, uses owner's company details
```

### **Business Owner (New Account)**
```
Owner: Signs up → Fills company details
       ↓
       Company verified → Dashboard
       ↓
       Can now invite team members
```

---

## 📊 Database Changes

### companyMembers table - NEW FIELDS
```typescript
token: v.optional(v.string()),           // Unique invite token
expiresAt: v.optional(v.number()),       // 7-day expiry timestamp
resendCount: v.optional(v.number()),     // Track resends
```

### companyMembers indices - NEW
```typescript
.index('by_token', ['token'])  // For fast token lookups
```

---

## 🛠️ API Endpoints (Convex)

### Queries
| Function | Purpose |
|----------|---------|
| `getInvitationByToken` | Get invite details by token (public) |
| `getPendingInvitations` | List pending invites with expiry status |

### Mutations
| Function | Purpose |
|----------|---------|
| `inviteMember` | Create invitation + generate token |
| `resendInvitation` | Resend invitation (regenerate token if expired) |
| `acceptInvitationByToken` | Accept invite via token link |

### Actions
| Function | Purpose |
|----------|---------|
| `sendInviteEmail` | Send email invitation (HTML template) |

---

## 🚀 How to Use

### **As Owner - Invite a Staff**
1. Go to `/settings/users` (Team Members page)
2. Click "Invite Member"
3. Fill: Email, Name, Role (select "Staff")
4. Click "Create Invitation"
5. Choose:
   - **Email**: Sends automated HTML email with invite link
   - **Link**: Copy link to clipboard, share manually
6. Invite shows in "Pending Invitations" section
7. Can resend, copy link, or delete

### **As Staff - Accept Invite**
1. Receive email OR get link from owner
2. Click link → `/auth/accept-invite?token=...`
3. If not signed up: Sign up with provided email
4. If signed up: Auto-accepts
5. Redirects to dashboard
6. Ready to access shared inventory/data

---

## 🔍 Redundancy Fixed

| Problem | Before | After |
|---------|--------|-------|
| **Two systems** | `invitations` + `companyMembers` | Unified via `companyMembers` |
| **Email sending** | ❌ Missing | ✅ `sendInviteEmail` action |
| **Role assignment** | ❌ Only on create | ✅ UI + mutation |
| **Resend capability** | ❌ None | ✅ `resendInvitation` |
| **Status tracking** | ❌ Minimal | ✅ Token + expiry + resend count |
| **Company duplication** | ⚠️ Risk | ✅ Skipped for invited users |

---

## 📋 Files Modified

| File | Changes |
|------|---------|
| `convex/schema.ts` | Enhanced companyMembers, deprecated invitations |
| `convex/companyAccess.ts` | +sendInviteEmail, +resendInvitation, +getInvitationByToken, +acceptInvitationByToken |
| `src/components/features/team/InviteMemberDialog.tsx` | Two-stage dialog, email + link tabs, pending section |
| `src/app/(auth)/accept-invite/page.tsx` | NEW - Acceptance flow page |
| `src/app/(auth)/company-registration/page.tsx` | Added invite token check, skip company details |

---

## 🎨 User Experience Flow

```
┌─ Owner Dashboard
│  └─ Settings > Users
│     └─ "Invite Member" button
│        └─ Dialog: Email + Name + Role
│           └─ Create Invitation
│              ├─ Tab 1: Email Invite (sends automatically)
│              └─ Tab 2: Copy Link (manual share)
│                 └─ Shows in "Pending Invitations"
│                    ├─ Resend button (if expired)
│                    ├─ Copy link button
│                    └─ Delete button
│
└─ Staff
   ├─ Receives email OR gets link
   │  └─ Clicks invite link
   │     └─ /auth/accept-invite?token=TOKEN
   │        ├─ If not signed up: Sign up first
   │        └─ If signed up: Auto-accept
   │           └─ Redirect to dashboard
   │
   └─ Uses Owner's company data (Option A)
      └─ No duplicate company details
```

---

## ✨ Key Features

- ✅ Email invitations with professional HTML template
- ✅ Copy-to-clipboard invite links
- ✅ Token-based acceptance (no database access needed)
- ✅ Automatic expiry (7 days)
- ✅ Resend capability for pending invites
- ✅ Role assignment at invite time
- ✅ Pending vs Active member sections
- ✅ Company details skipped for invited users (Option A)
- ✅ Email validation on acceptance
- ✅ Clear expiry countdown display

---

## 🧪 Testing Checklist

- [ ] Create invitation → Verify token generated
- [ ] Send email → Check template in SendGrid
- [ ] Copy link → Paste and verify token matches
- [ ] Accept via link → Verify membership created
- [ ] Resend expired → Verify new token generated
- [ ] Wrong email → Verify error on accept
- [ ] Expired token → Verify error handling
- [ ] Pending section → Shows all pending invites
- [ ] Active section → Shows accepted members
- [ ] Role change → Updated in both sections

---

## 📝 Notes

- Invitations expire after 7 days
- Owners can resend anytime (regenerates token if expired)
- Option A means staff shares owner's company context
- Email template auto-formats based on: ownerName, companyName, role, inviteLink
- Public signup flow (via `invitations` table) still works unchanged
- No breaking changes to existing auth flows
