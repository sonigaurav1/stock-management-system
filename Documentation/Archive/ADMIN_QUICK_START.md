# Admin Dashboard - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Set Your Admin User ID (1 min)

Edit `.env.local`:

```env
NEXT_PUBLIC_ADMIN_USER_ID=your_clerk_user_id
# Get this from your Clerk dashboard or check user.id in console
```

### 2. Access the Dashboard (30 seconds)

Navigate to:

```
http://localhost:3000/admin
```

You should see the enterprise admin dashboard with 8 tabs!

### 3. Explore Each Section (2 min)

**Dashboard Tab** - KPI overview

- Real-time metrics
- System status
- Pending tasks
- Active alerts

**Analytics Tab** - Business intelligence

- 6-month revenue trend
- Orders vs customers
- Sales by category
- 24-hour activity

**Company Tab** - Organization info

- Company details
- Documents management
- Locations
- Compliance status

**Team Tab** - User management

- View all team members
- Invite new members
- Manage roles
- Permission reference

**Audit Tab** - Activity logging

- All admin actions
- Filter by category/status
- Search functionality
- Export reports

**Feedback Tab** - User feedback

- Customer feedback
- Admin responses
- Image attachments
- Statistics

**Reports Tab** - Generate reports

- Sales reports
- Inventory reports
- User analytics

**Settings Tab** - System configuration

- General settings
- Security policies
- Email configuration
- Third-party integrations

### 4. Try a Mutation (1 min)

Go to **Team tab** → Click **"Invite Member"**

Fill in:

- Email: test@example.com
- Role: Staff
- Department: Sales

Click **"Send Invitation"** - You'll see a success toast!

### 5. View Audit Logs (30 seconds)

Go to **Audit tab** - You should see your action logged!

---

## 🎯 Common Tasks

### View Team Members

1. Navigate to **Team** tab
2. Use search to find member
3. View role, department, status
4. Last active time shows engagement

### Invite New Team Member

1. **Team** tab → **"Invite Member"**
2. Enter email, select role, choose department
3. Click **"Send Invitation"**
4. Check **Audit** tab to see action logged

### Change User Role

1. **Team** tab → Find member card
2. Click menu (⋮) → **"Edit"**
3. Select new role
4. Save changes
5. Verify in **Audit** tab

### Remove Team Member

1. **Team** tab → Find member card
2. Click menu (⋮) → **"Remove"**
3. Confirm deletion
4. Member removed, action logged

### Export Data

1. Navigate to **Reports** or find export option
2. Select data type (Sales, Inventory, etc.)
3. Choose format (CSV, JSON)
4. Click **"Download"**
5. File downloads to your computer

### Check Company Status

1. **Company** tab → **"Overview"**
2. View verification, tier, compliance
3. Check important dates
4. Review financial information

### Update System Settings

1. **Settings** tab → Choose section
2. Make changes to configuration
3. Click **"Save Settings"**
4. Toast notification shows confirmation
5. Settings persist across sessions

### View Audit Trail

1. **Audit** tab → Browse all actions
2. Filter by category or status
3. Click eye icon to see details
4. Search for specific actions
5. Export audit report for compliance

---

## 🔄 Currently Using Mock Data

**Important**: The dashboard is currently showing **mock/demo data**.

To see real data, we need to connect the Convex backend.

### See What Needs to Be Done

Open `convex/admin.ts` and look for comments like:

```typescript
// TODO: Replace with real data from your database
```

These are the places where you need to connect real database queries.

### Example Connection (Easy!)

**Before** (Mock Data):

```typescript
export const getTeamMembers = query({
  handler: async (ctx) => {
    return [{ id: '1', name: 'Sarah Johnson', ... }];
  }
});
```

**After** (Real Data):

```typescript
export const getTeamMembers = query({
  handler: async (ctx) => {
    return await ctx.db.query('users').collect();
  }
});
```

See [ADMIN_IMPLEMENTATION_GUIDE.md](./ADMIN_IMPLEMENTATION_GUIDE.md) for detailed instructions!

---

## 📊 Dashboard Components Overview

| Tab       | Component                      | Features                   | Mock Data |
| --------- | ------------------------------ | -------------------------- | --------- |
| Dashboard | `EnterpriseKPIDashboard`       | KPIs, Status, Alerts       | ✅        |
| Analytics | `EnterpriseAnalyticsDashboard` | Charts, Trends, Stats      | ✅        |
| Company   | `EnterpriseCompanyManagement`  | Info, Docs, Compliance     | ✅        |
| Team      | `EnterpriseTeamManagement`     | CRUD, Roles, Invite        | ✅        |
| Audit     | `EnterpriseAuditLogs`          | Logging, Filtering, Export | ✅        |
| Feedback  | `FeedbackList`                 | User Feedback, Response    | ✅        |
| Reports   | Reports Section                | Generate, Download         | ✅        |
| Settings  | `EnterpriseSystemSettings`     | Config, Security, Auth     | ✅        |

---

## 🪝 Available React Hooks

Use these in any component:

```typescript
import {
  useKPIMetrics, // Get KPI data
  useAnalyticsData, // Get analytics
  useTeamMembers, // Get team list
  useAuditLogs, // Get audit logs
  useCompanyDetails, // Get company info
  useSystemSettings, // Get settings
  useInviteTeamMember, // Invite member
  useUpdateTeamMemberRole, // Change role
  useRemoveTeamMember, // Remove member
  useExportData, // Export data
  useGenerateReport // Generate report
} from '@/hooks/useAdminDashboard';
```

---

## 🧪 Test the UI

### Try Dark Mode

Press the theme toggle in the sidebar to see dark mode

### Try Responsive Design

- Shrink browser to mobile size
- Tabs become iconized
- Layout adapts beautifully

### Try Interactive Elements

- Click member cards in Team tab
- Use search boxes
- Click "More" menus (⋮)
- Try form dialogs

---

## 📱 Mobile Access

The dashboard is **fully responsive**!

- 📱 Looks great on phones
- 📱 Works on tablets
- 📱 Optimized for small screens
- 📱 Touch-friendly buttons

Try visiting `/admin` on your phone!

---

## ⌨️ Keyboard Navigation

- **Tab** - Navigate between elements
- **Enter** - Activate buttons/links
- **Esc** - Close dialogs
- **Cmd+K / Ctrl+K** - Global search (when implemented)

---

## 🎨 Customization

Want to customize the dashboard?

**Change Colors**

- Edit Tailwind classes in components
- Update color scheme in `tailwind.config.js`

**Change Layout**

- Modify grid columns in responsive sections
- Adjust tab arrangement

**Add New KPI**

- Edit `EnterpriseKPIDashboard.tsx`
- Add new metric to `kpiMetrics` array

**Add New Chart**

- Edit `EnterpriseAnalyticsDashboard.tsx`
- Import Recharts chart type
- Add chart component

---

## 🐛 Troubleshooting

### Issue: "Access Denied" Page

**Solution**:

- Check admin user ID in `.env.local`
- Verify you're logged in with correct user
- Check browser console for the actual user ID
- Update `.env.local` if needed

### Issue: Console Showing Errors

**Solution**:

- Check browser console (F12)
- Look for error messages
- Check Network tab for failed requests
- Ensure Convex is running

### Issue: Mock Data Not Showing

**Solution**:

- Refresh the page
- Clear browser cache
- Check if component is rendering
- Verify no JavaScript errors

### Issue: Buttons Not Working

**Solution**:

- Check browser console
- Verify mutation functions exist in `convex/admin.ts`
- Check network tab for API calls
- Try a page refresh

---

## 🚀 Next Steps

### Option 1: Explore Mock Data (5 min)

1. Click through all 8 tabs
2. Try interactive elements
3. Notice the beautiful UI
4. Familiarize yourself with layout

### Option 2: Connect Real Data (2 hours)

1. Follow [ADMIN_IMPLEMENTATION_GUIDE.md](./ADMIN_IMPLEMENTATION_GUIDE.md)
2. Create database tables in `convex/schema.ts`
3. Replace mock data with real queries
4. Test each function

### Option 3: Customize the Dashboard (1 hour)

1. Update KPI metrics with your metrics
2. Change colors to match branding
3. Add your company info
4. Customize team roles

---

## 📚 Documentation Files

- **[ENTERPRISE_ADMIN_GUIDE.md](./ENTERPRISE_ADMIN_GUIDE.md)** - Complete feature documentation
- **[ADMIN_IMPLEMENTATION_GUIDE.md](./ADMIN_IMPLEMENTATION_GUIDE.md)** - Step-by-step implementation
- **[ADMIN_DASHBOARD_CHECKLIST.md](./ADMIN_DASHBOARD_CHECKLIST.md)** - Detailed checklist
- **This file** - Quick start reference

---

## 💡 Pro Tips

💡 **Tip 1**: Use search/filter in Audit tab to find specific actions

💡 **Tip 2**: Settings persist in database, not just session

💡 **Tip 3**: Team member status indicator shows active/inactive

💡 **Tip 4**: Export data in multiple formats (CSV, JSON, etc.)

💡 **Tip 5**: Mobile-first design - works great on any device

💡 **Tip 6**: Dark mode is fully supported

💡 **Tip 7**: Audit logs track all admin actions for compliance

💡 **Tip 8**: Role permissions are clearly documented in Team tab

---

## 🎯 Success Indicators

You'll know it's working when:

✅ `/admin` page loads without errors  
✅ All 8 tabs are clickable and show content  
✅ Team tab shows "Invite Member" button  
✅ Clicking buttons shows loading state  
✅ Charts render correctly in Analytics tab  
✅ Dark mode toggles properly  
✅ Responsive design works on mobile  
✅ No console errors when clicking elements

---

## ❓ Questions?

- Check the specific guide file
- Review component comments
- Look at hook implementations
- Check Convex documentation

**Ready ?** Let's go!

---

**Version**: 1.0  
**Last Updated**: April 18, 2026  
**Status**: Ready to Use (with mock data)
