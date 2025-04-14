import { capitalizeWords } from '../../../lib/utils';

export function generatePaymentNote({
  customerName,
  invoiceNumber,
  paymentMode,
  onCredit,
  amountPaid,
  outstandingBalance,
  totalAmount
}: {
  customerName: string;
  invoiceNumber: string;
  paymentMode: string;
  onCredit: boolean;
  amountPaid: number;
  outstandingBalance: number;
  totalAmount: number;
}): string {
  const formattedAmount = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2
    }).format(amount);

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (onCredit && outstandingBalance === totalAmount) {
    return `Credit sale to ${capitalizeWords(customerName)} for invoice #${invoiceNumber} via ${paymentMode.replace('_', ' ').toLowerCase()} on ${date}. Full amount of ${formattedAmount(totalAmount)} pending payment.`;
  }

  if (onCredit && outstandingBalance > 0) {
    return `Partial payment of ${formattedAmount(amountPaid)} received from ${capitalizeWords(customerName)} for invoice #${invoiceNumber} via ${paymentMode.replace('_', ' ').toLowerCase()} on ${date}. Remaining balance: ${formattedAmount(outstandingBalance)}.`;
  }
  if (onCredit && outstandingBalance === 0) {
    return `Full payment of ${formattedAmount(totalAmount)} received from ${capitalizeWords(customerName)} for invoice #${invoiceNumber} on ${date}.`;
  }

  // For other payment modes (e.g., ONLINE, BANK_TRANSFER, CHEQUE)
  return `Payment of ${formattedAmount(amountPaid)} received from ${capitalizeWords(customerName)} for invoice #${invoiceNumber} via ${paymentMode.replace('_', ' ').toLowerCase()} on ${date}.`;
}
