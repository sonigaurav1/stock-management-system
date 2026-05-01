# Super Admin Dashboard - Developer Page Guide

## 🚀 Overview

The **Super Admin Dashboard** is a platform-level management interface for developers and platform administrators. It provides complete visibility and control over the entire system, all registered companies, and platform infrastructure.

**Route**: `http://localhost:3000/super-admin`

---

## 🔐 Access Control

### Setting Super Admin Users

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPER_ADMIN_USER_IDS=user_id_1,user_id_2,user_id_3
```

Multiple super admins can be configured by separating Clerk user IDs with commas.

**Get Your User ID**:

1. Open browser DevTools (F12)
2. Go to Console
3. Type: `console.debug(localStorage.getItem('jwt'))`
4. Decode the JWT and extract the `sub` field, or check your Clerk dashboard

---

## 📊 Dashboard Tabs

### 1. **Overview** - Platform Intelligence

Real-time insights into platform health and growth.

**Metrics**:

- **Total Companies**: 2,847 registered organizations
- **Active Users**: 15,324 users across all companies
- **System Health**: 99.9% uptime
- **Critical Issues**: Active problem count

**Charts**:

- Platform Growth (companies + users over 6 months)
- Subscription Breakdown (Free, Starter, Professional, Enterprise)
- Regional Distribution (by geographic region)

**What You Can Do**:

- ✅ Monitor platform growth trends
- ✅ Track adoption by subscription plan
- ✅ See geographic distribution of customers
- ✅ Identify growth patterns

---

### 2. **Companies** - Registration Management

Manage all registered companies on the platform.

**Features**:

#### Search & Filter

- Search by company name or email
- Filter by status (Active, Pending, Suspended, Inactive)
- View real-time company metrics

#### Company Management

**For Each Company, View**:

- Company name and creation date
- Email and contact information
- Subscription plan (Free/Starter/Professional/Enterprise)
- Status (Active/Pending/Suspended/Inactive)
- Number of active users
- Monthly revenue contribution
- Last activity timestamp

**Actions Available**:

| Action           | Status  | Effect                            |
| ---------------- | ------- | --------------------------------- |
| **View Details** | All     | Open detailed company information |
| **Approve**      | Pending | Move to Active status             |
| **Suspend**      | Active  | Block company access temporarily  |

#### Company Details Modal

When you click "View Details", you see:

- Email address
- Subscription tier
- Current status
- Total users
- Monthly revenue
- Creation date
- Approval/suspension buttons

**Statistics**:

- Total Companies count
- Active companies (green)
- Pending approvals (yellow)
- Total monthly revenue (MRR)

**Use Cases**:

- 📋 Onboard new companies (approve pending registrations)
- 🚫 Suspend problematic companies
- 💰 Monitor revenue and growth
- 👥 Track user adoption per company
- 📅 Monitor company lifecycle

---

### 3. **Feedback** - Global Feedback Management

View and manage feedback from all companies and users on the platform.

**Features**:

#### Feedback Cards

Each feedback item shows:

- **User Avatar & Name**: Who submitted feedback
- **Company**: Which company they're from
- **Rating**: 1-5 stars
- **Category**: Feature Request, Bug Report, General Feedback, Support
- **Message**: Preview of feedback text
- **Status**: New, Reviewed, Addressed, Rejected
- **Timestamp**: When submitted

#### Search & Filter

- Search by: Company name, User name, or Message content
- Filter by Status: All, New, Reviewed, Addressed

#### Feedback Detail View

Click any feedback card to open detailed view with:

**Original Feedback Section**:

- User name and email
- Star rating (with visual stars)
- Company origin
- Category badge
- Status badge
- Full feedback message
- Creation timestamp

**Response Section** (if responded):

- Response text
- Admin who responded
- Response timestamp

**Add Response** (if new):

- Text area to type response
- Send button
- Records admin name automatically

#### Feedback Statistics

- **Total Feedback**: All feedback ever received
- **New**: Awaiting review
- **Reviewed**: Responded to
- **Addressed**: Issue resolved
- **Avg Rating**: Platform satisfaction (1-5)

**Feedback Categories**:

- 🎯 **Feature Requests**: Suggested improvements
- 🐛 **Bug Reports**: Issues found
- 💬 **General Feedback**: Comments/suggestions
- 🆘 **Support**: Help requests

**Use Cases**:

- 📋 Review user suggestions for new features
- 🐛 Triage bug reports by priority
- 💬 Engage with users and respond to feedback
- 📊 Understand feature demand
- ⭐ Monitor platform satisfaction
- 🎯 Build product roadmap from feedback

**Best Practices**:

- Respond to new feedback within 24 hours
- Acknowledge bugs in bug reports
- Explain timeline for feature requests
- Use responses to guide product development

---

### 4. **Monitoring** - System Health & Performance

Real-time infrastructure and performance monitoring.

**Metrics Overview**:

- **Services Healthy**: X out of Y services running normally
- **Total Requests**: API calls in last 24 hours
- **Avg Error Rate**: Percentage of failed requests
- **Active Alerts**: Issues needing attention

**Resource Usage Chart**:

- CPU usage over 24 hours
- Memory usage over 24 hours
- Request volume over 24 hours

**API Endpoint Performance**:
For each endpoint, monitor:

- **Response Time**: Average latency (in milliseconds)
- **Error Rate**: Percentage of failed requests
- **Request Volume**: Total requests to endpoint
- **Visual Progress Bars**: See at-a-glance performance

**Key Endpoints**:

- `/api/companies` - Company operations
- `/api/users` - User management
- `/api/transactions` - Payment processing
- `/api/reports` - Report generation
- `/api/analytics` - Analytics queries

**System Modules Health**:
Each critical system shows:

- **Service Name**: Component being monitored
- **Status**: Healthy ✅, Warning ⚠️, or Error ❌
- **Uptime**: Percentage of time operational
- **Response Time**: Average latency

**Critical Services**:

- 🗄️ Database
- 🌐 API Server
- ⚡ Cache (Redis)
- 📨 Message Queue
- 🌍 CDN

**Recent Alerts**:
System alerts for:

- ⚠️ **Warning**: Resources near limits
- ❌ **Error**: Service failures
- ℹ️ **Info**: Maintenance notifications

**Alert Examples**:

```
⚠️ High Memory Usage
   Memory at 85% on Server 3 (2 min ago)

ℹ️ Database Backup Completed
   Daily backup completed successfully (1 hr ago)

❌ API Response Time Spike
   /api/transactions exceeded threshold (3 hrs ago)

⚠️ Disk Space Low
   Backup server at 92% capacity (5 hrs ago)
```

**Use Cases**:

- 🔍 Identify performance bottlenecks
- ⚠️ Catch issues before users notice
- 📊 Plan capacity upgrades
- 🚨 Respond to system alerts
- 📈 Optimize API endpoints
- 🛡️ Ensure system reliability

**Alert Response**:

1. Check the alert timestamp and severity
2. Review the affected service
3. Check resource usage charts
4. Take corrective action if needed:
   - Restart service
   - Scale resources
   - Optimize queries
   - Check database performance

---

### 5. **Settings** - Platform Configuration

Configure global platform settings and dangerous operations.

**Standard Settings**:

| Setting               | Default    | Purpose           |
| --------------------- | ---------- | ----------------- |
| Global API Rate Limit | 1000 req/s | Prevent abuse     |
| Max Companies         | 10000      | Platform capacity |
| Enable Registrations  | ✅ Enabled | Allow new signups |
| Auto Backups          | ✅ Enabled | Data protection   |
| Send Alerts           | ✅ Enabled | Notify admins     |

**Configuration Options**:

**API Rate Limiting**:

- Set maximum requests per second globally
- Prevents platform overload
- Protects against DoS attacks

**Company Limits**:

- Set maximum number of companies allowed
- Plan for capacity growth
- Control platform scale

**Feature Toggles**:

- ✅ Enable/disable new registrations
- ✅ Enable/disable automatic backups
- ✅ Enable/disable admin alerts

**Dangerous Actions** ⚠️:

These should be used with extreme caution:

1. **Force Platform Maintenance Mode**

   - Takes entire platform offline
   - Use before critical updates
   - Displays maintenance message to all users

2. **Clear All Cache**

   - Clears Redis cache
   - Temporary performance impact
   - Use if cache corrupted

3. **Export Platform Database**
   - Creates full database backup
   - Use for migration or disaster recovery
   - Can be large file

**Use Cases**:

- 🔧 Adjust system parameters
- 🛡️ Control access during incidents
- 📊 Plan platform growth
- 🔄 Maintenance operations
- 💾 Backup and recovery

---

## 📈 Key Workflows

### Workflow 1: Approve New Company Registration

1. Navigate to **Companies** tab
2. Filter by: Status = "Pending"
3. Review company details
4. Click "View Details"
5. Check company information
6. Click "Approve Company"
7. Company moves to "Active" status

### Workflow 2: Respond to User Feedback

1. Navigate to **Feedback** tab
2. Look for items with Status = "New"
3. Click on feedback to open detail view
4. Read user message
5. Type response in text area
6. Click "Send Response"
7. Response recorded with your name and timestamp

### Workflow 3: Investigate System Alert

1. Navigate to **Monitoring** tab
2. Check "Recent System Alerts" section
3. Identify severity and service affected
4. Check "System Modules Health" for that service
5. Review relevant charts (e.g., CPU, Memory)
6. Take appropriate action
7. Verify service returns to healthy status

### Workflow 4: Monitor Platform Growth

1. Navigate to **Overview** tab
2. Check "Platform Growth" chart
3. Compare month-to-month growth
4. Check "Subscription Breakdown"
5. Analyze regional distribution
6. Identify growth trends
7. Plan for scaling if needed

---

## 🎯 Success Indicators

You'll know the super-admin dashboard is working when:

✅ You can view all companies registered on platform  
✅ Pending company approvals show up in Companies tab  
✅ All feedback from all companies appears in Feedback tab  
✅ System health shows real-time monitoring data  
✅ You can respond to feedback  
✅ You can approve/suspend companies  
✅ Alerts appear when system issues occur  
✅ Charts update with real data  
✅ Settings changes save successfully

---

## 🔗 Related Pages

- **Business Owner Admin**: `/admin` - Company-specific management
- **Super Admin Dashboard**: `/super-admin` - Platform-wide management
- **Main App**: `/` - Customer-facing application

---

## 📝 Common Use Cases

### Case 1: Onboarding New Enterprise Customer

1. Company signs up and appears as "Pending"
2. You review company details
3. Approve registration → Status changes to "Active"
4. Company can now use platform
5. Monitor their usage in Overview

### Case 2: Responding to Feature Request

1. User submits feedback: "Add mobile app"
2. Status: "New"
3. You review request in Feedback tab
4. Respond: "Thanks! Mobile is in Q3 roadmap"
5. Status: Auto-updates to "Reviewed"
6. User sees your response in their feedback

### Case 3: Production Issue

1. Alert fires in Monitoring tab: "High API Error Rate"
2. You check `/api/companies` endpoint
3. See 2.5% error rate (above threshold)
4. Check System Modules → Database health
5. Database response time elevated
6. Scale database resources OR optimize queries
7. Error rate returns to normal ✅

### Case 4: Monthly Revenue Reporting

1. Navigate to Overview tab
2. Check Platform Growth chart
3. See company and user growth trends
4. Check companies list → Total Revenue
5. Generate report for business stakeholders
6. FYI leadership of MRR growth

---

## 🛠️ Troubleshooting

**Q: "Access Denied" error?**
A: Check your Clerk user ID in browser console and add to `.env.local`

**Q: Dashboard data not updating?**
A: Check browser console for errors, try page refresh, verify network connection

**Q: Charts showing no data?**
A: Check browser DevTools Network tab, verify API responses, clear cache

**Q: Can't approve pending company?**
A: Check company status, ensure not already active, verify permissions

**Q: Settings changes not saving?**
A: Check browser console for errors, verify network connection, try again

---

## 📞 Support

For issues or features:

1. Check system alerts in Monitoring tab
2. Review browser console for errors
3. Check API endpoint performance
4. Contact platform development team

---

## 🎓 Next Steps

1. ✅ Set your super admin ID in `.env.local`
2. ✅ Navigate to `/super-admin` to access dashboard
3. ✅ Explore each tab and features
4. ✅ Try approving a pending company
5. ✅ Monitor system health in real-time
6. ✅ Respond to user feedback

**You're all set!** 🎉

---

**Version**: 1.0  
**Last Updated**: April 18, 2026  
**Status**: Production Ready
