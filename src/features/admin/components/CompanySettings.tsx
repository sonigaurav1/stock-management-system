/**
 * Company Settings Component
 * Manage company settings and configuration
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CompanySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='text-sm text-muted-foreground'>
          Company configuration and settings coming soon.
        </div>
      </CardContent>
    </Card>
  );
}
