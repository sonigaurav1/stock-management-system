import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { HelpTooltip } from './HelpTooltip';

/**
 * CashFlowDashboard Component
 * Displays comprehensive cash flow analysis for business owners
 * Shows cash position, receivables, payables, and forecasts in plain English
 */
export const CashFlowDashboard = () => {
  // Fetch cash flow data
  const cashPosition = useQuery(api.cashFlow.getCashPositionSummary);
  const paymentAlerts = useQuery(api.cashFlow.getPaymentDueAlerts, {
    daysAhead: 30
  });
  const invoiceAging = useQuery(api.cashFlow.getInvoiceAging);
  const receivables = useQuery(api.cashFlow.getReceivablesDashboard);
  const payables = useQuery(api.cashFlow.getPayablesDashboard);
  const cashForecast = useQuery(api.cashFlow.getCashFlowForecast, {
    months: 3
  });

  if (!cashPosition)
    return <div className='py-8 text-center'>Loading cash flow data...</div>;

  const healthColor = {
    healthy: 'text-green-600',
    warning: 'text-amber-600',
    critical: 'text-red-600'
  }[cashPosition.health];

  const healthBgColor = {
    healthy: 'bg-green-50 border-green-200',
    warning: 'bg-amber-50 border-amber-200',
    critical: 'bg-red-50 border-red-200'
  }[cashPosition.health];

  const healthIcon = {
    healthy: '✓',
    warning: '⚠️',
    critical: '🚨'
  }[cashPosition.health];

  return (
    <div className='space-y-6'>
      {/* Main Cash Position Summary */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Cash Health Card */}
        <Card className={`border-2 ${healthBgColor}`}>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Cash Position</CardTitle>
              <span className='text-2xl'>{healthIcon}</span>
            </div>
            <CardDescription>Your current financial health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <p className={`text-3xl font-bold ${healthColor}`}>
                  {cashPosition.cashMetrics.estimatedCashPosition > 0
                    ? '+'
                    : ''}
                  ₹
                  {Math.abs(
                    cashPosition.cashMetrics.estimatedCashPosition
                  ).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
                <p className='mt-2 text-sm text-gray-600'>
                  {cashPosition.summary}
                </p>
              </div>

              {cashPosition.health === 'critical' && (
                <div className='rounded border border-red-300 bg-red-100 p-3 text-sm font-semibold text-red-800'>
                  ⚠️ Negative cash flow alert! Take immediate action to collect
                  receivables or reduce spending.
                </div>
              )}

              {cashPosition.health === 'warning' && (
                <div className='rounded border border-amber-300 bg-amber-100 p-3 text-sm font-semibold text-amber-800'>
                  💡 Low cash reserves. Focus on collecting payments to improve
                  position.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Metrics */}
        <div className='grid grid-cols-2 gap-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-1 text-sm font-semibold'>
                Cash Received
                <HelpTooltip
                  title='Cash Received'
                  content="Total money you've received from customers"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold text-green-600'>
                ₹
                {cashPosition.cashMetrics.totalCashReceived.toLocaleString(
                  'en-IN',
                  {
                    maximumFractionDigits: 0
                  }
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-1 text-sm font-semibold'>
                Outstanding
                <HelpTooltip
                  title='Outstanding Amount'
                  content='Money customers still owe you'
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold text-amber-600'>
                ₹
                {cashPosition.receivables.outstandingReceivables.toLocaleString(
                  'en-IN',
                  {
                    maximumFractionDigits: 0
                  }
                )}
              </p>
              <p className='mt-1 text-xs text-gray-600'>
                {cashPosition.receivables.percentageOutstanding}% of revenue
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue='alerts' className='w-full'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='alerts'>
            {paymentAlerts && paymentAlerts.urgentCount > 0 && (
              <span className='mr-2 flex h-2 w-2 rounded-full bg-red-600'></span>
            )}
            Due Alerts
          </TabsTrigger>
          <TabsTrigger value='aging'>Invoice Aging</TabsTrigger>
          <TabsTrigger value='receivables'>Receivables</TabsTrigger>
          <TabsTrigger value='payables'>Payables</TabsTrigger>
          <TabsTrigger value='forecast'>Cash Forecast</TabsTrigger>
        </TabsList>

        {/* Payment Due Alerts */}
        <TabsContent value='alerts'>
          <Card>
            <CardHeader>
              <CardTitle>Payment Due Alerts</CardTitle>
              <CardDescription>Upcoming payment deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentAlerts && paymentAlerts.alerts.length > 0 ? (
                <div className='space-y-3'>
                  {/* Summary Stats */}
                  <div className='mb-6 grid grid-cols-3 gap-4'>
                    <div className='rounded bg-blue-50 p-3 text-center'>
                      <p className='text-2xl font-bold text-blue-600'>
                        ₹
                        {paymentAlerts.totalDue.toLocaleString('en-IN', {
                          maximumFractionDigits: 0
                        })}
                      </p>
                      <p className='mt-1 text-xs text-gray-600'>Total Due</p>
                    </div>
                    <div className='rounded bg-amber-50 p-3 text-center'>
                      <p className='text-2xl font-bold text-amber-600'>
                        {paymentAlerts.alertCount}
                      </p>
                      <p className='mt-1 text-xs text-gray-600'>Upcoming</p>
                    </div>
                    <div className='rounded bg-red-50 p-3 text-center'>
                      <p className='text-2xl font-bold text-red-600'>
                        {paymentAlerts.urgentCount}
                      </p>
                      <p className='mt-1 text-xs text-gray-600'>Urgent</p>
                    </div>
                  </div>

                  {/* Alerts List */}
                  {paymentAlerts.alerts.map((alert) => (
                    <div
                      key={alert.paymentId}
                      className={`rounded-lg border-l-4 p-3 ${
                        alert.priority === 'urgent'
                          ? 'border-red-500 bg-red-50 text-red-900'
                          : alert.priority === 'high'
                            ? 'border-amber-500 bg-amber-50 text-amber-900'
                            : 'border-blue-500 bg-blue-50 text-blue-900'
                      }`}
                    >
                      <div className='flex items-start justify-between'>
                        <div>
                          <p className='font-semibold'>{alert.invoiceNumber}</p>
                          <p className='mt-1 text-sm'>
                            Due: {alert.dueDate} ({alert.daysUntilDue} days)
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='text-lg font-bold'>
                            ₹
                            {alert.amount.toLocaleString('en-IN', {
                              maximumFractionDigits: 2
                            })}
                          </p>
                          <p className='text-xs font-semibold uppercase'>
                            {alert.priority}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='rounded-lg border border-green-200 bg-green-50 p-4'>
                  <p className='font-semibold text-green-800'>
                    ✓ No payments due in the next 30 days
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Aging */}
        <TabsContent value='aging'>
          <Card>
            <CardHeader>
              <CardTitle>Invoice Aging Analysis</CardTitle>
              <CardDescription>
                Understand which customers are slow to pay
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoiceAging ? (
                <div className='space-y-6'>
                  {/* Aging Buckets Summary */}
                  <div>
                    <h4 className='mb-3 font-semibold'>Outstanding by Age</h4>
                    <div className='grid grid-cols-4 gap-3'>
                      <div className='rounded border-l-4 border-green-500 bg-green-50 p-3'>
                        <p className='text-xs text-gray-600'>
                          {invoiceAging.ageingBuckets.current.label}
                        </p>
                        <p className='mt-1 text-xl font-bold text-green-600'>
                          ₹
                          {invoiceAging.ageingBuckets.current.amount.toLocaleString(
                            'en-IN',
                            {
                              maximumFractionDigits: 0
                            }
                          )}
                        </p>
                        <p className='mt-1 text-xs text-gray-600'>
                          {invoiceAging.ageingBuckets.current.count} invoices
                        </p>
                      </div>

                      <div className='rounded border-l-4 border-amber-500 bg-amber-50 p-3'>
                        <p className='text-xs text-gray-600'>
                          {invoiceAging.ageingBuckets.thirtyPlus.label}
                        </p>
                        <p className='mt-1 text-xl font-bold text-amber-600'>
                          ₹
                          {invoiceAging.ageingBuckets.thirtyPlus.amount.toLocaleString(
                            'en-IN',
                            {
                              maximumFractionDigits: 0
                            }
                          )}
                        </p>
                        <p className='mt-1 text-xs text-gray-600'>
                          {invoiceAging.ageingBuckets.thirtyPlus.count} invoices
                        </p>
                      </div>

                      <div className='rounded border-l-4 border-orange-500 bg-orange-50 p-3'>
                        <p className='text-xs text-gray-600'>
                          {invoiceAging.ageingBuckets.sixtyPlus.label}
                        </p>
                        <p className='mt-1 text-xl font-bold text-orange-600'>
                          ₹
                          {invoiceAging.ageingBuckets.sixtyPlus.amount.toLocaleString(
                            'en-IN',
                            {
                              maximumFractionDigits: 0
                            }
                          )}
                        </p>
                        <p className='mt-1 text-xs text-gray-600'>
                          {invoiceAging.ageingBuckets.sixtyPlus.count} invoices
                        </p>
                      </div>

                      <div className='rounded border-l-4 border-red-500 bg-red-50 p-3'>
                        <p className='text-xs text-gray-600'>
                          {invoiceAging.ageingBuckets.ninetyPlus.label}
                        </p>
                        <p className='mt-1 text-xl font-bold text-red-600'>
                          ₹
                          {invoiceAging.ageingBuckets.ninetyPlus.amount.toLocaleString(
                            'en-IN',
                            {
                              maximumFractionDigits: 0
                            }
                          )}
                        </p>
                        <p className='mt-1 text-xs text-gray-600'>
                          {invoiceAging.ageingBuckets.ninetyPlus.count} invoices
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Slow Payers Warning */}
                  {invoiceAging.slowPayers.length > 0 && (
                    <div className='rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4'>
                      <p className='font-semibold text-amber-900'>
                        ⚠️ Slow Payment Pattern Detected
                      </p>
                      <p className='mt-1 text-sm text-amber-800'>
                        {invoiceAging.slowPayers.length} customer(s) have
                        outstanding invoices. Focus on collecting payments from
                        these customers.
                      </p>
                    </div>
                  )}

                  {/* Slow Payers List */}
                  {invoiceAging.slowPayers.length > 0 && (
                    <>
                      <h4 className='font-semibold'>Customers Slow to Pay</h4>
                      <div className='space-y-2'>
                        {invoiceAging.slowPayers.map((payer) => (
                          <div
                            key={payer.customerId}
                            className='flex items-center justify-between rounded bg-gray-50 p-3 hover:bg-gray-100'
                          >
                            <div>
                              <p className='font-semibold text-gray-900'>
                                {payer.customerName}
                              </p>
                              <p className='text-sm text-gray-600'>
                                {payer.invoiceCount} outstanding invoice
                                {payer.invoiceCount > 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className='text-right'>
                              <p className='text-lg font-bold text-red-600'>
                                ₹
                                {payer.totalOutstanding.toLocaleString(
                                  'en-IN',
                                  {
                                    maximumFractionDigits: 0
                                  }
                                )}
                              </p>
                              <p className='text-xs text-gray-600'>
                                Overdue:{' '}
                                {payer.daysOverdue === 1
                                  ? '1 day'
                                  : `${payer.daysOverdue} days`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Info Box */}
                  <div className='rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4'>
                    <p className='font-semibold text-blue-900'>
                      💡 What This Means
                    </p>
                    <p className='mt-2 text-sm text-blue-800'>
                      Invoices older than 30 days should be collected urgently.
                      Invoices older than 90 days may require special attention
                      or collection efforts. Keep track of repeat slow payers.
                    </p>
                  </div>
                </div>
              ) : (
                <p className='text-gray-600'>Loading invoice aging data...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='receivables'>
          <Card>
            <CardHeader>
              <CardTitle>Customer Receivables</CardTitle>
              <CardDescription>Money customers owe you</CardDescription>
            </CardHeader>
            <CardContent>
              {receivables ? (
                <div>
                  {/* Summary */}
                  <div className='mb-6 grid grid-cols-3 gap-4'>
                    <div className='rounded bg-blue-50 p-3'>
                      <p className='text-xs text-gray-600'>Total Customers</p>
                      <p className='text-2xl font-bold text-blue-600'>
                        {receivables.summary.totalCustomers}
                      </p>
                    </div>
                    <div className='rounded bg-amber-50 p-3'>
                      <p className='text-xs text-gray-600'>With Outstanding</p>
                      <p className='text-2xl font-bold text-amber-600'>
                        {receivables.summary.customersWithOutstanding}
                      </p>
                    </div>
                    <div className='rounded bg-red-50 p-3'>
                      <p className='text-xs text-gray-600'>Total Outstanding</p>
                      <p className='text-2xl font-bold text-red-600'>
                        ₹
                        {receivables.summary.totalReceivables.toLocaleString(
                          'en-IN',
                          {
                            maximumFractionDigits: 0
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Top Receivables */}
                  {receivables.topReceivables.length > 0 && (
                    <>
                      <h4 className='mb-3 mt-6 font-semibold'>
                        Top Customers with Outstanding Dues
                      </h4>
                      <div className='space-y-2'>
                        {receivables.topReceivables.map((customer) => (
                          <div
                            key={customer.customerId}
                            className='flex items-center justify-between rounded bg-gray-50 p-3 hover:bg-gray-100'
                          >
                            <div>
                              <p className='font-semibold text-gray-900'>
                                {customer.customerName}
                              </p>
                              <p className='text-sm text-gray-600'>
                                {customer.transactionCount} transactions
                              </p>
                            </div>
                            <div className='text-right'>
                              <p className='font-bold text-red-600'>
                                ₹
                                {customer.outstanding.toLocaleString('en-IN', {
                                  maximumFractionDigits: 2
                                })}
                              </p>
                              <p className='text-xs text-gray-600'>
                                of ₹
                                {customer.totalAmount.toLocaleString('en-IN', {
                                  maximumFractionDigits: 0
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className='text-gray-600'>Loading receivables data...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payables */}
        <TabsContent value='payables'>
          <Card>
            <CardHeader>
              <CardTitle>Supplier Payables</CardTitle>
              <CardDescription>Money you owe to suppliers</CardDescription>
            </CardHeader>
            <CardContent>
              {payables ? (
                <div>
                  {/* Summary */}
                  <div className='mb-6 grid grid-cols-3 gap-4'>
                    <div className='rounded bg-blue-50 p-3'>
                      <p className='text-xs text-gray-600'>Total Suppliers</p>
                      <p className='text-2xl font-bold text-blue-600'>
                        {payables.summary.totalSuppliers}
                      </p>
                    </div>
                    <div className='rounded bg-amber-50 p-3'>
                      <p className='text-xs text-gray-600'>With Outstanding</p>
                      <p className='text-2xl font-bold text-amber-600'>
                        {payables.summary.suppliersWithOutstanding}
                      </p>
                    </div>
                    <div className='rounded bg-orange-50 p-3'>
                      <p className='text-xs text-gray-600'>Total Payables</p>
                      <p className='text-2xl font-bold text-orange-600'>
                        ₹
                        {payables.summary.totalPayables.toLocaleString(
                          'en-IN',
                          {
                            maximumFractionDigits: 0
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Top Payables */}
                  {payables.topPayables.length > 0 && (
                    <>
                      <h4 className='mb-3 mt-6 font-semibold'>
                        Suppliers You Owe Money To
                      </h4>
                      <div className='space-y-2'>
                        {payables.topPayables.map((supplier) => (
                          <div
                            key={supplier.supplierId}
                            className='flex items-center justify-between rounded bg-gray-50 p-3 hover:bg-gray-100'
                          >
                            <div>
                              <p className='font-semibold text-gray-900'>
                                {supplier.supplierName}
                              </p>
                              <p className='text-sm text-gray-600'>
                                {supplier.purchaseCount} purchases
                              </p>
                            </div>
                            <div className='text-right'>
                              <p className='font-bold text-orange-600'>
                                ₹
                                {supplier.outstanding.toLocaleString('en-IN', {
                                  maximumFractionDigits: 2
                                })}
                              </p>
                              <p className='text-xs text-gray-600'>
                                of ₹
                                {supplier.totalPurchased.toLocaleString(
                                  'en-IN',
                                  {
                                    maximumFractionDigits: 0
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className='text-gray-600'>Loading payables data...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Forecast */}
        <TabsContent value='forecast'>
          <Card>
            <CardHeader>
              <CardTitle>3-Month Cash Flow Forecast</CardTitle>
              <CardDescription>
                Projected cash position based on historical trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cashForecast ? (
                <div className='space-y-4'>
                  {cashForecast.riskLevel === 'high' && (
                    <div className='flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4'>
                      <AlertTriangle className='h-5 w-5 flex-shrink-0 text-red-600' />
                      <div>
                        <p className='font-semibold text-red-900'>
                          ⚠️ Negative forecast alert
                        </p>
                        <p className='mt-1 text-sm text-red-800'>
                          Based on current trends, you may face cash flow
                          challenges in the coming months. Consider collecting
                          receivables or reducing expenses.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Forecast Table */}
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr className='border-b'>
                          <th className='px-2 py-2 text-left font-semibold'>
                            Month
                          </th>
                          <th className='px-2 py-2 text-right font-semibold'>
                            Revenue
                          </th>
                          <th className='px-2 py-2 text-right font-semibold'>
                            Expenses
                          </th>
                          <th className='px-2 py-2 text-right font-semibold'>
                            Net Cash
                          </th>
                          <th className='px-2 py-2 text-right font-semibold'>
                            Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cashForecast.forecast.map((month) => (
                          <tr
                            key={month.month}
                            className='border-b hover:bg-gray-50'
                          >
                            <td className='px-2 py-2'>{month.monthLabel}</td>
                            <td className='px-2 py-2 text-right font-semibold text-green-600'>
                              ₹
                              {month.projectedRevenue.toLocaleString('en-IN', {
                                maximumFractionDigits: 0
                              })}
                            </td>
                            <td className='px-2 py-2 text-right font-semibold text-red-600'>
                              ₹
                              {month.projectedExpenses.toLocaleString('en-IN', {
                                maximumFractionDigits: 0
                              })}
                            </td>
                            <td
                              className={`px-2 py-2 text-right font-bold ${
                                month.netCashFlow >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {month.netCashFlow >= 0 ? '+' : ''}₹
                              {month.netCashFlow.toLocaleString('en-IN', {
                                maximumFractionDigits: 0
                              })}
                            </td>
                            <td
                              className={`px-2 py-2 text-right font-bold ${
                                month.projectedBalance >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              ₹
                              {month.projectedBalance.toLocaleString('en-IN', {
                                maximumFractionDigits: 0
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className='mt-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4'>
                    <p className='mb-2 font-semibold text-blue-900'>
                      💡 What This Means for Your Business
                    </p>
                    <p className='text-sm text-blue-800'>
                      This forecast shows your projected cash position over the
                      next 3 months based on your average monthly revenue (₹
                      {cashForecast.historicalAverageMonthlyRevenue.toLocaleString(
                        'en-IN',
                        {
                          maximumFractionDigits: 0
                        }
                      )}
                      ) and estimated expenses. Review this regularly and adjust
                      your spending or collections if needed.
                    </p>
                  </div>
                </div>
              ) : (
                <p className='text-gray-600'>Loading forecast data...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
