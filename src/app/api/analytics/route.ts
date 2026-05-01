'use node';

import { AnalyticsClient } from '@/convex/lib/analytics';
/**
 * API Route: /api/analytics
 * Track feature usage and application analytics
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { userId, feature, action, metadata } = data;

    // Validate the request
    if (!userId || !feature || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, feature, action' },
        { status: 400 }
      );
    }

    // Track the event
    const analytics = new AnalyticsClient(userId);
    await analytics.track(feature, action, metadata);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '30', 10);

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    if (action === 'daily-active-users') {
      // Return daily active users data
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Analytics query failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
