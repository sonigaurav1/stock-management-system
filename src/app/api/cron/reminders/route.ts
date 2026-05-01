import { api } from '@/../convex/_generated/api';
import { convexClient } from '@/lib/convex';

// POST handler - sends payment reminders for overdue invoices
export async function POST() {
  try {
    const client = convexClient;

    // Call the public mutation to send payment reminders
    const result = await client.mutation(
      api.invoiceScheduler.sendPaymentReminders,
      {}
    );

    return Response.json({ success: true, result });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
