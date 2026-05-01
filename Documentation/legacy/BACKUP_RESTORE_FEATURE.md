# Backup & Restore Feature - Production Implementation

## Overview

This document describes the production-level backup and restore system implemented for the Inventory Management System. This feature allows users to export all their data as a backup file and restore it later or to a new account.

## Features

### 1. **Data Export (Backup)**

- Export all user data to a JSON backup file
- Includes all 40+ tables with complete records
- Automatic checksums for integrity verification
- Timestamped filename: `backup_<userId>_<timestamp>.json`
- Available on-demand or during account deletion

### 2. **Data Import (Restore)**

- Import data from previously exported backup files
- Automatic integrity verification via checksums
- User ID remapping for new account restoration
- Comprehensive error handling with detailed messages
- Rollback on validation failures

### 3. **Pre-Deletion Backup Option**

- Optional checkbox in account deletion dialog
- Automatic backup creation before account deletion
- Download triggers automatically
- Ensures data preservation before account erasure

## Architecture

### Backend Implementation

#### 1. **exportUserDataAsBackup Query** (`convex/users.ts`)

```typescript
export const exportUserDataAsBackup = query({
  handler: async (ctx) => {
    // Returns structured backup with:
    // - version: API version for format
    // - exportDate: ISO timestamp
    // - userId: Owner ID
    // - checksumVersion: Hash algorithm identifier
    // - tables: All user data organized by table
    // - checksum: Integrity verification hash
  }
});
```

**Features:**

- Queries all 40+ tables by userId
- Filters with `.withIndex('by_user', ...)` for performance
- Removes internal Convex fields (`_id`, `_creationTime`)
- Includes record count per table
- Calculates checksums for tampering detection

**Tables Exported:**

- **Business**: products, sales, invoices, customers, suppliers, firms
- **Inventory**: stockMovements, locations, locationInventory, stockTransfers
- **Finance**: expenses, budgets, payments, taxReports, taxPayments
- **Management**: organizationSettings, companyMembers, automationRules, webhooks
- **Analytics**: auditLog, featureUsage, dashboardWidgets, userInsights, reports
- **Settings**: userSettings, notificationRules, integrations, apiKeys

#### 2. **importUserDataFromBackup Mutation** (`convex/users.ts`)

```typescript
export const importUserDataFromBackup = mutation({
  args: { backupData: v.any() },
  handler: async (ctx, args) => {
    // Returns import result with:
    // - success: Boolean
    // - message: Human-readable message
    // - importedCount: Total records imported
    // - errors: Array of table-specific errors (if any)
  }
});
```

**Validation:**

1. **Format Validation**: Checks version and structure
2. **Integrity Check**: Verifies checksum hasn't been tampered with
3. **User ID Remapping**: Updates all records to new userId
4. **Timestamp Reset**: Sets createdAt/updatedAt to current time

**Error Handling:**

- Continues importing other tables on single table failure
- Collects all errors in response
- Never partially imports and fails silently
- Returns detailed error messages per table

### Frontend Implementation

#### UI Components (`src/app/(main)/(authenticated)/settings/account/page.tsx`)

**New Sections:**

1. **Data Backup & Restore Section**

   - Download Backup button
   - Restore from Backup button
   - File input for backup selection

2. **Delete Account Dialog Enhancement**
   - Checkbox: "Create a backup of my data before deletion"
   - Backup triggers before Clerk deletion
   - Download happens automatically

#### Key Functions:

**downloadBackup()**

- Fetches backup data via query
- Creates timestamped JSON file
- Triggers browser download
- Shows success/error toast

**handleRestoreFile()**

- Reads uploaded JSON file
- Parses and validates format
- Calls import mutation
- Reports import results with record count

**deleteAccount() - Updated**

- Now checks `shouldBackupBeforeDelete`
- Creates backup before deletion if enabled
- Maintains existing deletion flow
- Adds backup download promise

#### State Management:

```typescript
// New loading states
const [isLoading, setIsLoading] = useState({
  // ... existing states
  backingUp: false, // Download backup loading
  restoring: false // Restore upload loading
});

// Backup-specific state
const [shouldBackupBeforeDelete, setShouldBackupBeforeDelete] = useState(false);

// File input reference
const fileInputRef = useRef<HTMLInputElement>(null);
```

## Data Format

### Backup File Structure

```json
{
  "version": "1.0.0",
  "exportDate": "2024-01-15T10:30:45.123Z",
  "userId": "user_abc123",
  "checksumVersion": "sha256",
  "tables": {
    "products": {
      "count": 42,
      "records": [
        {
          "userId": "user_abc123",
          "name": "Product Name",
          "description": "...",
          // ... other fields without _id, _creationTime
        }
        // ... more records
      ]
    },
    "sales": {
      "count": 15,
      "records": [...]
    }
    // ... more tables
  },
  "checksum": "a3f8c2e1..."
}
```

### Export Flow

```
1. User clicks "Download Backup"
       ↓
2. Query executes exportUserDataAsBackup
       ↓
3. All tables fetched by userId
       ↓
4. Records serialized, internal fields removed
       ↓
5. Checksum calculated for integrity
       ↓
6. JSON created and blob generated
       ↓
7. Browser downloads file with timestamp
       ↓
8. Toast confirms success/failure
```

### Import Flow

```
1. User selects backup file
       ↓
2. File read and parsed to JSON
       ↓
3. Format validation (version, structure)
       ↓
4. Checksum verification
       ↓
5. Mapper updates userId for all records
       ↓
6. Mutation processes each table
       ↓
7. Records inserted with new userId
       ↓
8. Report generated with counts and errors
       ↓
9. Toast shows results and any warnings
```

## Security Considerations

### Integrity Verification

- **Checksums**: Simple CRC32 hash (can be upgraded to SHA-256)
- **Version Checking**: Prevents importing from incompatible versions
- **File Format**: JSON structure validation before processing

### Privacy & Compliance

- **GDPR Compliant**: User owns exported data
- **Local Storage**: Files stored on user's device only
- **No Server Storage**: Backups never persisted server-side for export
- **Private Data Access**: Only authenticated users can export their own data

### Future Enhancements

- [ ] AES-256 encryption for exported files
- [ ] User-provided password protection
- [ ] Backup file versioning (keep multiple backups)
- [ ] Incremental backups (only changed records)
- [ ] Scheduled automatic backups
- [ ] Backup expiration policies

## Error Handling

### Export Errors

```
- Authentication Required: "Authentication required"
- Missing Data: Silently skips tables that can't be queried
- Query Failure: Continues with next table, logs error
```

### Import Errors

```
- Invalid Format: "Invalid backup format version"
- Corrupted File: "Invalid backup structure"
- Checksum Mismatch: "Backup file integrity check failed - data may be corrupted"
- Parse Error: "Invalid backup file"
- Insert Failure: Collected per-table errors, continues with other tables
```

### User Feedback

- **Toast Messages**: Real-time feedback during operations
- **Error Details**: Specific messages help troubleshooting
- **Warnings**: Non-fatal errors displayed but operation continues
- **Success Metrics**: Record counts confirm successful import

## Testing Scenarios

### 1. **Full Backup → Restore Cycle**

```
Setup:
- Create test user with sample data (products, sales, expenses)

Steps:
1. Click "Download Backup"
2. Verify file downloads with correct filename
3. Create new test account
4. Upload backup file
5. Verify all records restored with new userId

Expected:
- All records present in new account
- No orphaned data
- Timestamps updated
```

### 2. **Backup Before Deletion**

```
Setup:
- Create test user with data

Steps:
1. Click "Delete Account"
2. Check "Create backup before deletion"
3. Click "Delete Account" button
4. Verify backup downloads
5. Verify account deleted from Clerk+Convex

Expected:
- Backup file created before deletion
- Account completely removed
- Can restore backup to new account
```

### 3. **Corrupted Backup Handling**

```
Steps:
1. Modify backup JSON (remove checksum)
2. Try to restore
3. Verify error message shown
4. Try to restore unmodified backup
5. Verify successful restore

Expected:
- Checksum mismatch detected
- Clear error message
- Original backup restores successfully
```

### 4. **Partial Import with Errors**

```
Setup:
- Backup contains 40 tables

Simulate:
- Make one table readonly (permission denied)

Steps:
1. Upload backup
2. One table fails, others succeed

Expected:
- Success message with import count
- Warning list showing failed tables
- Data partially imported (38/40 tables)
```

## Performance Metrics

### Expected Timings

| Operation            | Duration | Notes                   |
| -------------------- | -------- | ----------------------- |
| Export 40 tables     | 1-2s     | Depends on record count |
| Create JSON blob     | <100ms   | In-memory operation     |
| Download file        | <500ms   | Browser-dependent       |
| Parse large backup   | 1-2s     | File size dependent     |
| Import 40 tables     | 3-5s     | Convex mutation cost    |
| Checksum calculation | <100ms   | Fast CRC32 algorithm    |

### Data Volume Limits

- **Max Records per Table**: 10,000 (soft limit)
- **Max Backup Size**: 50MB (browser download limit)
- **Timeout**: 30 seconds per import operation

## API Reference

### `exportUserDataAsBackup` (Query)

**Parameters**: None (uses auth context)

**Returns**: Backup object with all user tables

**Permissions**: Authenticated users only (checks identity)

**Performance**: O(n) where n = total records across all tables

### `importUserDataFromBackup` (Mutation)

**Parameters**: `backupData: any` (backup JSON object)

**Returns**:

```typescript
{
  success: boolean,
  message: string,
  importedCount: number,
  errors?: Array<{table: string, error: string}>,
  warnings?: string
}
```

**Permissions**: Authenticated users only

**Side Effects**: Creates records in Convex database

## Known Limitations

1. **No Encryption By Default**: Backup files sent unencrypted

   - Mitigation: HTTPS transport, user-managed encryption

2. **Timestamp Reset**: Import resets all timestamps to current time

   - Limitation: Can't preserve exact creation times
   - Workaround: Store original timestamps in custom field if needed

3. **User ID Remapping Only**: Can't restore to different user without code change

   - Limitation: Prevents unintended data sharing
   - Security feature, not a bug

4. **Large Backups**: Very large backups may timeout

   - Mitigation: Implement incremental backups in Phase 2

5. **No Backup Versioning Yet**: Only single backup at a time
   - Roadmap: Add backup history and versioning

## Migration Path (Future Phases)

### Phase 2: Advanced Features

- [ ] Backup encryption with user password
- [ ] Backup file versioning (keep last 5)
- [ ] Incremental backups (delta sync)
- [ ] Backup expiration policies
- [ ] Selective table restore

### Phase 3: Enterprise Features

- [ ] Scheduled automatic backups
- [ ] Cloud backup storage (AWS S3, Azure Blob)
- [ ] Backup sharing between accounts
- [ ] Disaster recovery workflows
- [ ] Compliance audit trail

### Phase 4: Advanced Analytics

- [ ] Backup size trends
- [ ] Restore success rates
- [ ] Data growth tracking
- [ ] Storage optimization suggestions

## Deployment Checklist

- [x] Backend mutations implemented in `convex/users.ts`
- [x] Frontend UI added to account settings
- [x] Error handling comprehensive
- [x] Toast notifications in place
- [x] File download logic implemented
- [x] File upload and parse logic implemented
- [x] Checksum validation working
- [x] Delete flow integrated with backup option
- [ ] Unit tests to be written
- [ ] Integration tests to be written
- [ ] Load testing for large backups
- [ ] Documentation in place (this file)
- [ ] User documentation/help text added
- [ ] Analytics tracking for backup usage

## Support & Troubleshooting

### "Backup file integrity check failed"

**Cause**: File was modified or corrupted
**Solution**: Re-download backup and try restore again

### "Invalid backup format version"

**Cause**: Backup from different app version
**Solution**: Ensure backup is from same version

### "Could not fetch your data"

**Cause**: Network timeout or auth issue
**Solution**: Refresh page and try again

### Large backup download stuck

**Cause**: Network timeout or browser limits
**Solution**: Try restoring on faster connection or split into smaller backups (Phase 2)

### Restore shows warnings

**Cause**: One or more tables failed to import
**Solution**: Check warnings list, may need to retry or contact support

## Maintenance

### Regular Tasks

- Monitor backup/restore success rates
- Track average backup file sizes
- Audit integrity check failures
- Review error logs for patterns

### Monitoring Queries

```typescript
// Track backup exports
SELECT userId, COUNT(*) as backups FROM backupLog

// Monitor restore success rate
SELECT success, COUNT(*) as count FROM restoreLog GROUP BY success

// Check average backup size
SELECT AVG(fileSize) as avgSize FROM backupMetrics
```

## References

- Convex Documentation: https://docs.convex.dev
- JSON file handling: MDN Web Docs
- Blob API: MDN Web Docs
- GDPR Compliance: https://gdpr.eu
- Data Privacy Best Practices: OWASP

---

**Last Updated**: January 15, 2025
**Version**: 1.0.0
**Author**: Production Development Team
