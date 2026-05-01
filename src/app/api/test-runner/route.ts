import { NextRequest, NextResponse } from 'next/server';

/**
 * Test Runner API Endpoint
 * Returns test documentation and instructions
 *
 * Tests are designed to be run from browser console or React components
 * using the Convex hooks/mutations directly
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get('format') || 'json';

  const testGuide = {
    title: 'Backend Integration Test Suite',
    description:
      'Comprehensive tests for settings persistence and notifications',
    timestamp: Date.now(),
    instructions: {
      browser_console: {
        description: 'Paste the following code in browser DevTools console',
        examples: [
          {
            test: 'Create Organization Settings',
            code: 'await testBackendIntegration.createSettings()'
          },
          {
            test: 'Update Organization Settings',
            code: 'await testBackendIntegration.updateSettings()'
          },
          {
            test: 'Create Notification Rule',
            code: 'await testBackendIntegration.createNotificationRule()'
          },
          {
            test: 'Trigger Notification Event',
            code: 'await testBackendIntegration.triggerNotification()'
          },
          {
            test: 'Run All Tests',
            code: 'await testBackendIntegration.runAllTests()'
          }
        ]
      }
    }
  };

  if (format === 'html') {
    const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${testGuide.title}</title>
                <style>
                    body { font-family: sans-serif; margin: 40px; }
                    h1 { color: #333; }
                    pre { background: #f4f4f4; padding: 10px; }
                </style>
            </head>
            <body>
                <h1>${testGuide.title}</h1>
                <p>${testGuide.description}</p>
                <h2>Instructions</h2>
                <p>${testGuide.instructions.browser_console.description}</p>
            </body>
            </html>
        `;
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  return NextResponse.json(testGuide);
}
