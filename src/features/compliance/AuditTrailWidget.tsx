'use client';

import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, User } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

export default function AuditTrailWidget() {
  const auditLog = useQuery(api.compliance.getAuditLog, { limit: 100 });

  if (auditLog === undefined) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-purple-600' />
      </div>
    );
  }

  const logs = auditLog || [];

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            Complete Audit Trail
          </CardTitle>
          <CardDescription>
            All system changes tracked with timestamp and user information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className='py-8 text-center text-gray-500'>
              <p>No audit events recorded yet</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.slice(0, 50).map((log: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className='text-sm'>
                        {new Date(
                          log.timestamp || log.createdAt
                        ).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>{log.entityType}</Badge>
                      </TableCell>
                      <TableCell className='font-medium'>
                        <Badge
                          variant={
                            log.action === 'create'
                              ? 'default'
                              : log.action === 'update'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className='flex items-center gap-2 text-sm'>
                        <User className='h-3 w-3' />
                        {log.changes?.changedBy || 'System'}
                      </TableCell>
                      <TableCell className='text-sm text-gray-600'>
                        {log.details || 'Event recorded'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
            <div className='rounded-lg bg-blue-50 p-4'>
              <p className='text-sm text-gray-600'>Total Events</p>
              <p className='mt-1 text-2xl font-bold'>{logs.length}</p>
            </div>
            <div className='rounded-lg bg-green-50 p-4'>
              <p className='text-sm text-gray-600'>Creates</p>
              <p className='mt-1 text-2xl font-bold'>
                {logs.filter((l: any) => l.action === 'create').length}
              </p>
            </div>
            <div className='rounded-lg bg-yellow-50 p-4'>
              <p className='text-sm text-gray-600'>Updates</p>
              <p className='mt-1 text-2xl font-bold'>
                {logs.filter((l: any) => l.action === 'update').length}
              </p>
            </div>
            <div className='rounded-lg bg-purple-50 p-4'>
              <p className='text-sm text-gray-600'>Deletes</p>
              <p className='mt-1 text-2xl font-bold'>
                {logs.filter((l: any) => l.action === 'delete').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
