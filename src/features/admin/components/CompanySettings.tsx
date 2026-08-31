/**
 * Company Settings Component
 * Manage organization settings and configuration
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CompanySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='text-sm text-muted-foreground'>
          Organization configuration and settings coming soon.
        </div>
      </CardContent>
    </Card>
  );
}
