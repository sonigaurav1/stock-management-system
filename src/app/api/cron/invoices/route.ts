import { api } from '@/../convex/_generated/api';
import { convexClient } from '@/lib/convex';

// POST handler - generates due recurring invoices
export async function POST() {
  try {
    const client = convexClient;

    // Call the public mutation to generate due invoices
    const result = await client.mutation(
      api.invoiceScheduler.generateDueInvoices,
      {}
    );

    return Response.json({ success: true, result });
  } catch (error) {
    console.error('Error generating invoices:', error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
