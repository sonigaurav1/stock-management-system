'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

export function ExpenseApprovalWorkflow() {
  const [selectedApprovalId, setSelectedApprovalId] = useState<string>('');
  const [approvalComments, setApprovalComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Get pending approvals
  const pendingApprovals = useQuery(api.budget.getPendingApprovals);

  // Mutations
  const approveAtLevel = useMutation(api.budget.approveExpenseAtLevel);
  const rejectExpense = useMutation(api.budget.rejectExpense);

  const handleApprove = async (approvalId: string) => {
    try {
      await approveAtLevel({
        approvalId,
        comments: approvalComments
      });
      setApprovalComments('');
      setSelectedApprovalId('');
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleReject = async (approvalId: string) => {
    try {
      await rejectExpense({
        approvalId,
        reason: rejectReason
      });
      setRejectReason('');
      setShowRejectForm(false);
      setSelectedApprovalId('');
    } catch (error) {
      console.error('Rejection failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className='h-4 w-4 text-yellow-600' />;
      case 'approved':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'rejected':
        return <XCircle className='h-4 w-4 text-red-600' />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (!pendingApprovals || pendingApprovals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Approvals</CardTitle>
          <CardDescription className='text-xs'>
            Multi-level expense approval workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='py-8 text-center text-gray-500'>
            <p className='text-sm'>No pending approvals</p>
            <p className='mt-1 text-xs text-gray-400'>
              Expenses awaiting your approval will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Pending Approvals</CardTitle>
          <CardDescription className='text-xs'>
            {pendingApprovals.length} expense
            {pendingApprovals.length !== 1 ? 's' : ''} awaiting approval
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {pendingApprovals.map((approval: any) => (
            <div
              key={approval._id}
              className={`rounded-lg border p-4 ${getStatusColor(approval.overallStatus)}`}
            >
              {/* Header */}
              <div className='mb-3 flex items-start justify-between'>
                <div>
                  <p className='text-sm font-medium'>
                    {approval.expense?.description || 'Expense'}
                  </p>
                  <p className='mt-1 text-xs text-gray-600'>
                    Submitted by: {approval.requestedBy}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  {getStatusIcon(approval.overallStatus)}
                  <Badge
                    className={
                      approval.overallStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : approval.overallStatus === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                    }
                  >
                    {approval.overallStatus}
                  </Badge>
                </div>
              </div>

              {/* Expense Details */}
              <div className='mb-3 grid grid-cols-3 gap-2 rounded border bg-white p-2'>
                <div>
                  <p className='text-xs text-gray-600'>Amount</p>
                  <p className='font-bold'>
                    {formatCurrency(approval.expense?.amount || 0)}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-gray-600'>Type</p>
                  <p className='text-sm font-bold'>{approval.expense?.type}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-600'>Date</p>
                  <p className='text-sm font-bold'>
                    {new Date(approval.expense?.date || 0).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Approval Chain */}
              <div className='mb-3'>
                <p className='mb-2 text-xs font-semibold text-gray-700'>
                  Approval Chain (Step {approval.currentApprovalLevel})
                </p>
                <div className='space-y-1'>
                  {approval.approvers.map((approver: any, idx: number) => (
                    <div key={idx} className='flex items-center gap-2 text-xs'>
                      <div className='flex flex-1 items-center gap-2'>
                        <span className='font-mono text-gray-600'>
                          L{idx + 1}:
                        </span>
                        <span>{approver.approverUserId}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        {approver.status === 'pending' && (
                          <Clock className='h-3 w-3 text-yellow-600' />
                        )}
                        {approver.status === 'approved' && (
                          <CheckCircle className='h-3 w-3 text-green-600' />
                        )}
                        {approver.status === 'rejected' && (
                          <XCircle className='h-3 w-3 text-red-600' />
                        )}
                        <Badge className='text-xs' variant='outline'>
                          {approver.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Form (only for current approver) */}
              {approval.overallStatus === 'pending' && (
                <div className='space-y-2 border-t pt-3'>
                  {!showRejectForm ? (
                    <div className='space-y-2'>
                      <Textarea
                        placeholder='Optional approval comments...'
                        value={approvalComments}
                        onChange={(e) => setApprovalComments(e.target.value)}
                        rows={2}
                        className='text-sm'
                      />
                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          className='bg-green-600 text-white hover:bg-green-700'
                          onClick={() => handleApprove(approval._id)}
                        >
                          <CheckCircle className='mr-2 h-4 w-4' />
                          Approve
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='border-red-200 text-red-600 hover:bg-red-50'
                          onClick={() => setShowRejectForm(true)}
                        >
                          <XCircle className='mr-2 h-4 w-4' />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-2 rounded border border-red-200 bg-red-50 p-3'>
                      <p className='text-sm font-medium text-red-900'>
                        Reason for rejection
                      </p>
                      <Textarea
                        placeholder="Please explain why you're rejecting this expense..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={2}
                        className='text-sm'
                      />
                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          className='bg-red-600 text-white hover:bg-red-700'
                          onClick={() => handleReject(approval._id)}
                        >
                          Confirm Rejection
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => {
                            setShowRejectForm(false);
                            setRejectReason('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Previous Comments */}
              {approval.approvers.some((a: any) => a.comments) && (
                <div className='mt-3 space-y-2 border-t pt-3'>
                  <p className='text-xs font-semibold text-gray-700'>
                    Comments
                  </p>
                  {approval.approvers.map((approver: any, idx: number) =>
                    approver.comments ? (
                      <div
                        key={idx}
                        className='rounded border bg-white p-2 text-xs'
                      >
                        <p className='font-medium'>{approver.approverUserId}</p>
                        <p className='text-gray-600'>{approver.comments}</p>
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
