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
      console.log('🧪 Running: Create Settings...');
      const result = await testSettingsCreate();
      console.log('✅ Result:', result);
      return result;
    },

    updateSettings: async () => {
      console.log('🧪 Running: Update Settings...');
      const result = await testSettingsUpdate({
        companyName: 'Updated Test Company',
        businessType: 'E-commerce'
      });
      console.log('✅ Result:', result);
      return result;
    },

    createNotificationRule: async () => {
      console.log('🧪 Running: Create Notification Rule...');
      const result = await testNotificationRuleCreate();
      console.log('✅ Result:', result);
      return result;
    },

    triggerNotification: async () => {
      console.log('🧪 Running: Trigger Notification...');
      const result = await testNotificationTrigger();
      console.log('✅ Result:', result);
      return result;
    },

    createAuditLog: async () => {
      console.log('🧪 Running: Create Audit Log...');
      const result = await testAuditLogCreate();
      console.log('✅ Result:', result);
      return result;
    },

    trackFeatureUsage: async () => {
      console.log('🧪 Running: Track Feature Usage...');
      const result = await testFeatureUsageTrack();
      console.log('✅ Result:', result);
      return result;
    },

    getAllData: async () => {
      console.log('🧪 Running: Get All Test Data...');
      const result = getAllTestDataQuery;
      console.log('✅ Result:', result);
      return result;
    },

    // Run all tests in sequence
    runAllTests: async () => {
      console.log('🧪 Running All Tests...\n');
      const results = [];

      try {
        console.log('1️⃣  Creating Settings...');
        results.push(await testSettingsCreate());

        console.log('2️⃣  Updating Settings...');
        results.push(
          await testSettingsUpdate({
            companyName: 'Updated Test Company',
            businessType: 'Enterprise'
          })
        );

        console.log('3️⃣  Creating Notification Rule...');
        results.push(await testNotificationRuleCreate());

        console.log('4️⃣  Triggering Notification...');
        results.push(await testNotificationTrigger());

        console.log('5️⃣  Creating Audit Log...');
        results.push(await testAuditLogCreate());

        console.log('6️⃣  Tracking Feature Usage...');
        results.push(await testFeatureUsageTrack());

        console.log('7️⃣  Getting All Test Data...');
        results.push(getAllTestDataQuery);

        // Calculate summary
        const passed = results.filter((r: any) => r?.success).length;
        const failed = results.filter((r: any) => r?.success === false).length;

        console.log('\n' + '='.repeat(50));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(50));
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(
          `📈 Success Rate: ${Math.round((passed / results.length) * 100)}%`
        );
        console.log('='.repeat(50));

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
    console.log(
      '✅ Test utilities loaded. Run: testBackendIntegration.runAllTests()'
    );
  }
};
