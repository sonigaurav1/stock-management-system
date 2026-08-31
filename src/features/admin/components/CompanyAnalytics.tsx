/**
 * Company Analytics Component
 * Display company metrics and analytics
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CompanyAnalytics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='text-sm text-muted-foreground'>
          Company metrics and analytics coming soon.
        </div>
      </CardContent>
    </Card>
  );
}
