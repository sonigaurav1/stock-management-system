/**
 * Company Audit Logs Component
 * Display audit trail for organization activities
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CompanyAuditLogs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='text-sm text-muted-foreground'>
          Audit trail and activity logs coming soon.
        </div>
      </CardContent>
    </Card>
  );
}
