'use client';

import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

/**
 * Hook for running backend integration tests
 * Provides easy access to all test functions
 */
export const useBackendTests = () => {
  // Import all test mutations
  const testSettingsCreate = useMutation(api.tests.testSettingsCreate);
  const testSettingsUpdate = useMutation(api.tests.testSettingsUpdate);
  const testNotificationRuleCreate = useMutation(
    api.tests.testNotificationRuleCreate
  );
  const testNotificationTrigger = useMutation(
    api.tests.testNotificationTrigger
  );
  const testAuditLogCreate = useMutation(api.tests.testAuditLogCreate);
  const testFeatureUsageTrack = useMutation(api.tests.testFeatureUsageTrack);

  // Import query
  const getAllTestDataQuery = useQuery(api.tests.getAllTestData);

  return {
    // Individual test runners
    createSettings: async () => {
      console.debug('🧪 Running: Create Settings...');
      const result = await testSettingsCreate();
      console.debug('✅ Result:', result);
      return result;
    },

    updateSettings: async () => {
      console.debug('🧪 Running: Update Settings...');
      const result = await testSettingsUpdate({
        companyName: 'Updated Test Company',
        businessType: 'E-commerce'
      });
      console.debug('✅ Result:', result);
      return result;
    },

    createNotificationRule: async () => {
      console.debug('🧪 Running: Create Notification Rule...');
      const result = await testNotificationRuleCreate();
      console.debug('✅ Result:', result);
      return result;
    },

    triggerNotification: async () => {
      console.debug('🧪 Running: Trigger Notification...');
      const result = await testNotificationTrigger();
      console.debug('✅ Result:', result);
      return result;
    },

    createAuditLog: async () => {
      console.debug('🧪 Running: Create Audit Log...');
      const result = await testAuditLogCreate();
      console.debug('✅ Result:', result);
      return result;
    },

    trackFeatureUsage: async () => {
      console.debug('🧪 Running: Track Feature Usage...');
      const result = await testFeatureUsageTrack();
      console.debug('✅ Result:', result);
      return result;
    },

    getAllData: async () => {
      console.debug('🧪 Running: Get All Test Data...');
      const result = getAllTestDataQuery;
      console.debug('✅ Result:', result);
      return result;
    },

    // Run all tests in sequence
    runAllTests: async () => {
      console.debug('🧪 Running All Tests...\n');
      const results = [];

      try {
        console.debug('1️⃣  Creating Settings...');
        results.push(await testSettingsCreate());

        console.debug('2️⃣  Updating Settings...');
        results.push(
          await testSettingsUpdate({
            companyName: 'Updated Test Company',
            businessType: 'Enterprise'
          })
        );

        console.debug('3️⃣  Creating Notification Rule...');
        results.push(await testNotificationRuleCreate());

        console.debug('4️⃣  Triggering Notification...');
        results.push(await testNotificationTrigger());

        console.debug('5️⃣  Creating Audit Log...');
        results.push(await testAuditLogCreate());

        console.debug('6️⃣  Tracking Feature Usage...');
        results.push(await testFeatureUsageTrack());

        console.debug('7️⃣  Getting All Test Data...');
        results.push(getAllTestDataQuery);

        // Calculate summary
        const passed = results.filter((r: any) => r?.success).length;
        const failed = results.filter((r: any) => r?.success === false).length;

        console.debug('\n' + '='.repeat(50));
        console.debug('📊 TEST SUMMARY');
        console.debug('='.repeat(50));
        console.debug(`✅ Passed: ${passed}`);
        console.debug(`❌ Failed: ${failed}`);
        console.debug(
          `📈 Success Rate: ${Math.round((passed / results.length) * 100)}%`
        );
        console.debug('='.repeat(50));

        return {
          success: failed === 0,
          summary: {
            total: results.length,
            passed,
            failed,
            successRate: Math.round((passed / results.length) * 100)
          },
          results
        };
      } catch (error) {
        console.error('❌ Test Error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          results
        };
      }
    }
  };
};

/**
 * Utility to expose test functions to window for browser console access
 */
export const initializeTestUtilities = (
  testObject: ReturnType<typeof useBackendTests>
) => {
  if (typeof window !== 'undefined') {
    (window as any).testBackendIntegration = testObject;
    console.debug(
      '✅ Test utilities loaded. Run: testBackendIntegration.runAllTests()'
    );
  }
};
