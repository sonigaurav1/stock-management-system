# Super Admin Dashboard - Brief Overview

**Access:** `http://localhost:3000/super-admin`

## Setup

Set `NEXT_PUBLIC_SUPER_ADMIN_USER_IDS` in `.env.local` (comma-separated for multiple admins).

## 5 Main Sections

| Section        | Purpose                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------ |
| **Overview**   | Platform statistics: total companies, users, system health, growth charts, regional distribution |
| **Companies**  | Manage registered companies, approve pending, suspend active, view details                       |
| **Feedback**   | Global user feedback hub (New, Reviewed, Addressed, Rejected statuses)                           |
| **Monitoring** | System health: server metrics, API performance, module health, alerts                            |
| **Settings**   | API rate limits, feature flags, dangerous actions (maintenance, cache clear)                     |

## Key Features

- Subscription management
- Multi-company oversight
- Real-time system monitoring
- Global feedback management
- Platform-wide configuration

## Quick Actions

- Company approval workflow
- System maintenance
- Rate limit management
- Performance monitoring

## Permissions

Only users in `NEXT_PUBLIC_SUPER_ADMIN_USER_IDS` can access this dashboard.
