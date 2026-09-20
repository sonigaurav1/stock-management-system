# Overview Documentation

Quick reference guides for the main application features.

## Contents

- **[ADMIN.md](ADMIN.md)** - Admin Dashboard overview (8 sections, setup, features)
- **[SUPER_ADMIN.md](SUPER_ADMIN.md)** - Super Admin Dashboard (5 sections, platform-wide config)
- **[DASHBOARD_OVERVIEW_PAGE.md](DASHBOARD_OVERVIEW_PAGE.md)** - Main dashboard with 10+ tabs
- **[LANDING_PAGE.md](LANDING_PAGE.md)** - Public landing page structure and flow
- **[RBAC.md](../rbac/README.md)** - Role-Based Access Control (permissions, roles, team management)

## Quick Links

| Feature         | URL                   | Access                 |
| --------------- | --------------------- | ---------------------- |
| Admin Dashboard | `/admin`              | Admin users only       |
| Super Admin     | `/super-admin`        | Super admin users only |
| Main Dashboard  | `/dashboard/overview` | Authenticated users    |
| Landing Page    | `/`                   | Public                 |

## Setup Checklist

- [ ] Set `NEXT_PUBLIC_ADMIN_USER_ID` for admin access
- [ ] Set `NEXT_PUBLIC_SUPER_ADMIN_USER_IDS` for super admin access
- [ ] Configure Clerk authentication
- [ ] Enable feature flags in settings
- [ ] Set up email notifications
