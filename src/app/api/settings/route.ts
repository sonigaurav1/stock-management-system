/**
 * API Route: /api/settings
 * Handles all settings-related API requests
 */

import { NextRequest, NextResponse } from 'next/server';

// Organization Settings
export async function POST(req: NextRequest) {
  const { action } = await req.json();

  switch (action) {
    case 'update-organization':
      return handleUpdateOrganization(req);
    case 'get-notifications':
      return handleGetNotifications(req);
    case 'update-notifications':
      return handleUpdateNotifications(req);
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}

async function handleUpdateOrganization(req: NextRequest) {
  try {
    const data = await req.json();
    // Call Convex mutation: updateOrganizationSettings
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

async function handleGetNotifications(req: NextRequest) {
  try {
    // Call Convex query: getNotificationRules
    return NextResponse.json({ notifications: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

async function handleUpdateNotifications(req: NextRequest) {
  try {
    const data = await req.json();
    // Call Convex mutation: updateNotificationRule
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
