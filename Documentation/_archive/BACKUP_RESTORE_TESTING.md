# Backup & Restore Feature - Testing Guide

## Pre-Testing Setup

### Start Development Servers

```bash
# Terminal 1: Convex dev server
cd "/Users/gauravsoni/Desktop/Project X/inventory-management-system"
pnpm run convex

# Terminal 2: Next.js dev server (in another terminal)
cd "/Users/gauravsoni/Desktop/Project X/inventory-management-system"
pnpm run dev
```

Access the app at: `http://localhost:3000`

## Test Scenarios

### Test 1: Download Backup (Positive Case)

**Objective**: Verify backup download works with valid data

**Preconditions**:

- User is logged in
- User has created some products/data
- Browser developer console open (F12)

**Steps**:

1. Navigate to Settings → Account
2. Scroll to "Data Backup & Restore" section
3. Click "Download Backup" button
4. Observe loading state (spinner appears)
5. Wait for completion (2-5 seconds)
6. Check for success toast: "Backup downloaded successfully"
7. Verify file in Downloads folder
8. Filename format: `backup_<userId>_<timestamp>.json`

**Expected Results**:

- ✅ Button shows loading state with spinner
- ✅ Toast appears with success message
- ✅ File downloads with correct naming
- ✅ File contains valid JSON
- ✅ No console errors

**Verification**:

```bash
# Check file was downloaded
ls ~/Downloads/backup_*.json

# Verify JSON structure
cat ~/Downloads/backup_user_*.json | jq '.version, .tables'
```

**Success**: If file downloads and contains valid JSON

---

### Test 2: Backup File Structure

**Objective**: Verify backup JSON format is correct

**Steps**:

1. Download backup from Test 1
2. Open file in text editor
3. Verify structure:

```json
{
  "version": "1.0.0",
  "exportDate": "2025-01-15T...",
  "userId": "user_...",
  "checksumVersion": "sha256",
  "tables": {
    "products": {
      "count": 42,
      "records": [{ "name": "...", "price": 100 }, ...]
    },
    "sales": { "count": 15, "records": [...] }
  },
  "checksum": "a3f8c2e1..."
}
```

**Expected Results**:

- ✅ Has `version` field = "1.0.0"
- ✅ Has `exportDate` in ISO format
- ✅ Has `userId` matching logged-in user
- ✅ `tables` object contains arrays
- ✅ Each table has `count` and `records`
- ✅ Has `checksum` field
- ✅ No `_id` or `_creationTime` fields in records

**Success**: If all fields present and correct format

---

### Test 3: Restore Backup (Positive Case)

**Objective**: Verify backup restoration to new account

**Preconditions**:

- Backup file from Test 1 saved
- Second test account (or can create one)
- Logged into second account

**Steps**:

1. On new account, navigate to Settings → Account
2. Scroll to "Data Backup & Restore"
3. Click "Restore from Backup"
4. Select backup file from Test 1
5. Observe loading: "Reading backup file..."
6. Observe: "Restoring data..."
7. Wait for completion
8. Check toast: "Data restored successfully"
9. Returns to Dashboard
10. Verify data is now present

**Expected Results**:

- ✅ File picker opens
- ✅ File accepted without errors
- ✅ Loading toasts show operations
- ✅ Success message shows record count
- ✅ Toast format: "Successfully imported X records"
- ✅ Data visible in dashboard/products/sales
- ✅ Record counts match original

**Success**: If data imports and is visible in new account

---

### Test 4: Backup Before Account Deletion

**Objective**: Verify backup downloads before account deletion

**Preconditions**:

- Test account with data to delete
- Downloads folder is accessible
- Admin access to create new account afterwards

**Steps**:

1. Navigate to Settings → Account
2. Scroll to "Delete Account"
3. Click "Delete account" button
4. Dialog opens: "Are you absolutely sure?"
5. Check checkbox: "Create a backup of my data before deletion"
6. Click "Delete Account" button
7. Observe: "Creating backup..." toast
8. Monitor Downloads folder
9. Observe: "Deleting account data..." toast
10. Account should be deleted
11. Redirect to sign-in page

**Expected Results**:

- ✅ Checkbox toggles on/off
- ✅ Backup downloads before deletion begins
- ✅ File appears in Downloads
- ✅ Account successfully deleted
- ✅ Redirected to /sign-in
- ✅ Can no longer log in with old account

**Verification**:

```bash
# Verify backup file exists
ls ~/Downloads/backup_*.json | head -1

# Verify file is valid JSON
cat ~/Downloads/backup_*.json | jq . > /dev/null && echo "Valid JSON"
```

**Success**: If backup downloads AND account is deleted

---

### Test 5: Corrupted Backup Detection

**Objective**: Verify system rejects tampered backup files

**Steps**:

1. Download valid backup from Test 1
2. Open backup file in text editor
3. Modify the JSON:
   - Change one number in checksum
   - Example: Change `"checksum": "a3f8c2e1"` to `"checksum": "bad1234e"`
4. Save file
5. Try to restore corrupted file
6. Select modified file
7. Observe error message

**Expected Results**:

- ✅ System detects checksum mismatch
- ✅ Error toast appears: "Backup file integrity check failed"
- ✅ No data is imported
- ✅ Clear error message helps user

**Success**: If corrupted file is rejected

---

### Test 6: Invalid File Format Rejection

**Objective**: Verify system rejects non-backup files

**Steps**:

1. Create a test JSON file with wrong structure:

```json
{
  "this": "is not a backup"
}
```

2. Save as `test-invalid.json`
3. Go to Settings → Account
4. Click "Restore from Backup"
5. Select invalid file
6. Observe error

**Expected Results**:

- ✅ Error toast: "Invalid backup file format"
- ✅ No data imported
- ✅ User guided to solution

**Success**: If invalid format is detected

---

### Test 7: Large Data Backup

**Objective**: Verify system handles large backups efficiently

**Preconditions**:

- Test account with 1000+ records across multiple tables
- Or create test data programmatically

**Steps**:

1. Create multiple products/sales/expenses in bulk
2. Click "Download Backup"
3. Monitor operation time
4. Check file size
5. Try to restore on another account

**Expected Results**:

- ✅ Download completes within 10 seconds
- ✅ File size <50MB
- ✅ Restore completes within 15 seconds
- ✅ All records imported correctly
- ✅ No timeout errors

**Measurement**:

```bash
# Check file size
ls -lh ~/Downloads/backup_*.json

# Time the operation (from browser console)
console.time('backup');
// do backup
console.timeEnd('backup');
```

**Success**: If large backup/restore works smoothly

---

### Test 8: UI State Management

**Objective**: Verify loading states and button behavior during operations

**Steps**:

1. Click "Download Backup"
2. Immediately try clicking again (should be disabled)
3. Wait for completion
4. Button should be clickable again
5. Repeat for "Restore from Backup"

**Expected Results**:

- ✅ Button shows spinner during operation
- ✅ Button is disabled (grayed out) during operation
- ✅ Cannot click multiple times
- ✅ After completion, button is clickable again
- ✅ Loading state properly reflected

**Success**: If UI prevents duplicate operations

---

### Test 9: Toast Notifications

**Objective**: Verify all user feedback messages appear

**Steps**:

1. Test each operation and note all toasts:
   - Download backup
   - Restore backup
   - Delete account with backup
   - Corrupt file restore

**Expected Toast Messages**:

- ✅ "Backup downloaded successfully" - File saved as `filename`
- ✅ "Data restored successfully" - Successfully imported X records
- ✅ "Error creating backup" - With specific error message
- ✅ "Error restoring backup" - With specific error message
- ✅ "Backup file integrity check failed" - Data may be corrupted
- ✅ "Invalid backup file format" - Please check file
- ✅ "Account deleted successfully" - Redirect to sign-in

**Success**: If all toasts appear with clear messages

---

### Test 10: Data Integrity After Restore

**Objective**: Verify restored data matches original

**Steps**:

1. Download backup from account A
2. Note some specific data points:
   - Product name: "Widget Pro"
   - Sale amount: $1,234.56
   - Expense category: "Office Supplies"
3. Restore to account B
4. Navigate to equivalent sections
5. Verify exact same data exists

**Expected Results**:

- ✅ All data fields match exactly
- ✅ Numbers are not rounded
- ✅ Text is not modified
- ✅ Dates/timestamps present (may be updated)
- ✅ No data loss

**Database Query** (if direct access available):

```sql
-- Before export (Account A)
SELECT COUNT(*) as product_count FROM products WHERE userId = 'user_A'

-- After restore (Account B)
SELECT COUNT(*) as product_count FROM products WHERE userId = 'user_B'
-- Should show same count
```

**Success**: If restored data perfectly matches original

---

### Test 11: Browser Compatibility

**Objective**: Verify feature works across browsers

**Test Matrix**:
| Browser | Version | Download | Restore | Status |
|---------|---------|----------|---------|--------|
| Chrome | 90+ | ✓/✗ | ✓/✗ | |
| Firefox | 88+ | ✓/✗ | ✓/✗ | |
| Safari | 14+ | ✓/✗ | ✓/✗ | |
| Edge | 90+ | ✓/✗ | ✓/✗ | |

**Steps** (for each browser):

1. Open app
2. Test download backup
3. Test restore backup
4. Note any errors
5. Mark as ✓ or ✗

**Success**: If all supported browsers work

---

### Test 12: Permissions & Security

**Objective**: Verify users can only access their own data

**Steps**:

1. Create accounts A and B
2. Log into A, download backup
3. Try to upload B's backup to A (if you have one)
4. Log into B, try to upload A's backup
5. Each user should only see their own data

**Expected Results**:

- ✅ User A can only export/import A's data
- ✅ User B can only export/import B's data
- ✅ Cannot access other user's backups
- ✅ Import updates to new user ID

**Success**: If data is properly isolated

---

### Test 13: Error Recovery

**Objective**: Verify system recovers gracefully from errors

**Steps**:

1. Start restore operation
2. Close browser tab during restore
3. Reload page
4. Check account state
5. Try restore again

**Expected Results**:

- ✅ Partial import doesn't break account
- ✅ Can retry restore
- ✅ No orphaned data

**Success**: If system handles interruptions gracefully

---

## Test Data Preparation

### Quick Setup for Testing

```typescript
// Create test data (run in browser console)
// This is pseudocode - adjust based on actual API

const testData = {
  products: [
    { name: 'Test Product A', price: 99.99 },
    { name: 'Test Product B', price: 149.99 },
    { name: 'Test Product C', price: 199.99 }
  ],
  sales: [
    { items: 5, amount: 499.95 },
    { items: 3, amount: 449.97 },
    { items: 1, amount: 99.99 }
  ],
  expenses: [
    { category: 'Office', amount: 50 },
    { category: 'Travel', amount: 200 },
    { category: 'Supplies', amount: 75 }
  ]
};
```

## Test Report Template

```markdown
# Backup & Restore Testing Report

**Date**: [Date]
**Tester**: [Name]
**Environment**: Development / Staging / Production

## Test Results Summary

| Test                           | Status | Notes |
| ------------------------------ | ------ | ----- |
| Test 1: Download Backup        | ✓/✗    |       |
| Test 2: Backup File Structure  | ✓/✗    |       |
| Test 3: Restore Backup         | ✓/✗    |       |
| Test 4: Delete with Backup     | ✓/✗    |       |
| Test 5: Corrupted File         | ✓/✗    |       |
| Test 6: Invalid Format         | ✓/✗    |       |
| Test 7: Large Data             | ✓/✗    |       |
| Test 8: UI State               | ✓/✗    |       |
| Test 9: Toast Notifications    | ✓/✗    |       |
| Test 10: Data Integrity        | ✓/✗    |       |
| Test 11: Browser Compatibility | ✓/✗    |       |
| Test 12: Permissions           | ✓/✗    |       |
| Test 13: Error Recovery        | ✓/✗    |       |

## Overall Status: [PASS/FAIL]

### Bugs Found

- [List any issues discovered]

### Performance Notes

- Download time: **\_** seconds
- Restore time: **\_** seconds
- File size: **\_** MB

### Recommendations

- [Any improvements needed]

## Sign-off

- ✓ Ready for Production
- ⚠️ Needs Fixes
- ✗ Not Ready
```

## Automation Testing

### Jest Unit Tests (Template)

```typescript
// Test backup exports correct structure
test('exportUserDataAsBackup returns valid structure', async () => {
  const result = await exportUserDataAsBackup(ctx);
  expect(result).toHaveProperty('version');
  expect(result).toHaveProperty('tables');
  expect(result).toHaveProperty('checksum');
  expect(result.version).toBe('1.0.0');
});

// Test checksum verification
test('importUserDataFromBackup detects corrupted data', async () => {
  const backup = { ...validBackup, checksum: 'bad' };
  expect(() => importUserDataFromBackup(ctx, { backup })).toThrow(
    'integrity check failed'
  );
});

// Test user ID remapping
test('importUserDataFromBackup remaps user IDs', async () => {
  const result = await importUserDataFromBackup(ctx, { backup });
  expect(result.importedCount).toBeGreaterThan(0);
  // Verify new userIds in database
});
```

## Performance Benchmarks

### Target Metrics

| Metric        | Target | Acceptable |
| ------------- | ------ | ---------- |
| Export Time   | <3s    | <5s        |
| Import Time   | <5s    | <10s       |
| Download File | <1s    | <2s        |
| File Size     | <20MB  | <50MB      |
| Memory Usage  | <100MB | <200MB     |

### Measurement

```bash
# Browser DevTools Timing
performance.mark('backup-start');
// ... perform backup
performance.mark('backup-end');
performance.measure('backup', 'backup-start', 'backup-end');
```

## Regression Testing

After each deployment, verify:

- ✅ Normal account operations work
- ✅ Delete account (without backup) still works
- ✅ Orphaned data cleanup happens
- ✅ UI doesn't break
- ✅ No console errors

## Sign-Off

After completing all tests:

- [ ] All 13 tests passed
- [ ] Performance within targets
- [ ] No critical bugs
- [ ] Documentation updated
- [ ] Ready for production deployment

---

**Test Suite Version**: 1.0.0
**Last Updated**: January 15, 2025
