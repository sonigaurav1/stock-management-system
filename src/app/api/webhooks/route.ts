/**
 * API Route: /api/webhooks
 * Test and manage webhook endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { testWebhook, isValidWebhookUrl } from '@/lib/webhookTest';

export async function POST(req: NextRequest) {
  const { action, url, secret, eventType } = await req.json();

  if (!isValidWebhookUrl(url)) {
    return NextResponse.json({ error: 'Invalid webhook URL' }, { status: 400 });
  }

  if (action === 'test') {
    const result = await testWebhook(url, secret, eventType);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
