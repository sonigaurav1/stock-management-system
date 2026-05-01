'use client';

import { useState, useEffect } from 'react';
import {
  useBackendTests,
  initializeTestUtilities
} from '@/hooks/useBackendTests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TestResult {
  success?: boolean;
  message?: string;
  error?: string;
  data?: any;
  [key: string]: any;
}

export function BackendTestDashboard() {
  const tests = useBackendTests();
  const [results, setResults] = useState<{ [key: string]: TestResult }>({});
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<
    'idle' | 'running' | 'complete'
  >('idle');

  // Initialize window utilities for console access
  useEffect(() => {
    initializeTestUtilities(tests);
  }, [tests]);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    try {
      setResults((prev) => ({
        ...prev,
        [testName]: { success: undefined, message: 'Running...' }
      }));

      const result = await testFn();
      setResults((prev) => ({
        ...prev,
        [testName]: result
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [testName]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    setResults({});

    try {
      await runTest('Settings: Create', tests.createSettings);
      await runTest('Settings: Update', tests.updateSettings);
      await runTest('Notifications: Create Rule', tests.createNotificationRule);
      await runTest('Notifications: Trigger', tests.triggerNotification);
      await runTest('Audit: Create Log', tests.createAuditLog);
      await runTest('Feature Usage: Track', tests.trackFeatureUsage);
      await runTest('Data: Get All', tests.getAllData);

      setOverallStatus('complete');
    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const passedCount = Object.values(results).filter(
    (r) => r.success === true
  ).length;
  const failedCount = Object.values(results).filter(
    (r) => r.success === false
  ).length;
  const totalCount = Object.keys(results).length;
  const successRate =
    totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  return (
    <div className='mx-auto w-full max-w-4xl space-y-6 p-6'>
      <Card>
        <CardHeader>
          <CardTitle>🧪 Backend Integration Test Suite</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='mb-4 text-gray-600'>
            Test settings persistence, notifications, audit logging, and feature
            tracking.
          </p>

          <div className='mb-6 flex gap-2'>
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className='bg-green-600 hover:bg-green-700'
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            <Button onClick={() => setResults({})} variant='outline'>
              Clear Results
            </Button>
          </div>

          {totalCount > 0 && (
            <div className='mb-6 grid grid-cols-4 gap-4 rounded bg-gray-50 p-4'>
              <div>
                <div className='text-2xl font-bold text-blue-600'>
                  {totalCount}
                </div>
                <div className='text-sm text-gray-600'>Total Tests</div>
              </div>
              <div>
                <div className='text-2xl font-bold text-green-600'>
                  {passedCount}
                </div>
                <div className='text-sm text-gray-600'>Passed</div>
              </div>
              <div>
                <div className='text-2xl font-bold text-red-600'>
                  {failedCount}
                </div>
                <div className='text-sm text-gray-600'>Failed</div>
              </div>
              <div>
                <div className='text-2xl font-bold text-blue-600'>
                  {successRate}%
                </div>
                <div className='text-sm text-gray-600'>Success Rate</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Test Results */}
      <div className='space-y-3'>
        {Object.entries(results).map(([testName, result]) => (
          <Card key={testName}>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-base'>{testName}</CardTitle>
                <div className='flex items-center gap-2'>
                  {result.success === true && (
                    <Badge className='bg-green-100 text-green-800'>
                      ✅ PASS
                    </Badge>
                  )}
                  {result.success === false && (
                    <Badge className='bg-red-100 text-red-800'>❌ FAIL</Badge>
                  )}
                  {result.success === undefined && (
                    <Badge className='bg-yellow-100 text-yellow-800'>
                      ⏳ Running
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-2 text-sm'>
                {result.message && (
                  <div className='text-gray-700'>
                    <span className='font-semibold'>Message:</span>{' '}
                    {result.message}
                  </div>
                )}
                {result.error && (
                  <div className='text-red-600'>
                    <span className='font-semibold'>Error:</span> {result.error}
                  </div>
                )}
                {result.data && (
                  <details className='text-gray-600'>
                    <summary className='cursor-pointer font-semibold'>
                      View Response Data
                    </summary>
                    <pre className='mt-2 max-h-40 overflow-auto rounded bg-gray-50 p-3 text-xs'>
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
                {result.summary && (
                  <details className='text-gray-600'>
                    <summary className='cursor-pointer font-semibold'>
                      View Summary
                    </summary>
                    <pre className='mt-2 max-h-40 overflow-auto rounded bg-gray-50 p-3 text-xs'>
                      {JSON.stringify(result.summary, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>📝 How to Run Tests</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3 text-sm'>
          <div>
            <h4 className='mb-1 font-semibold'>From This Dashboard:</h4>
            <p className='text-gray-600'>
              Click "Run All Tests" button above to execute all tests.
            </p>
          </div>
          <div>
            <h4 className='mb-1 font-semibold'>From Browser Console:</h4>
            <p className='text-gray-600'>Open DevTools (F12) and run:</p>
            <code className='mt-1 block overflow-auto rounded bg-gray-100 p-2'>
              await testBackendIntegration.runAllTests()
            </code>
          </div>
          <div>
            <h4 className='mb-1 font-semibold'>View Test Instructions:</h4>
            <p className='text-gray-600'>
              Visit{' '}
              <a
                href='/api/test-runner?format=html'
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:underline'
              >
                /api/test-runner
              </a>{' '}
              for detailed documentation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
