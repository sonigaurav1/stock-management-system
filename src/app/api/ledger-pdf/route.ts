import { NextRequest } from 'next/server';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface LedgerPdfRequestBody {
  company: {
    companyName: string;
    companyAddress: string;
    phone?: string;
    email?: string;
    vatNumber?: string;
  } | null;
  firm: { name: string; owner: string; phone?: string };
  from: string | null;
  to: string | null;
  transactions: Array<{
    date: string | null;
    particular: string;
    drAmount: number;
    crAmount: number;
    balance: number;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LedgerPdfRequestBody;
    const { company, firm, from, to, transactions } = body;

    const doc = new jsPDF();
    // Company header (optional)
    let cursorY = 12;
    if (company) {
      doc.setFontSize(14);
      const companyName = (company.companyName || '').toUpperCase();
      doc.text(companyName, 14, cursorY);
      cursorY += 7;
      if (company.companyAddress) {
        doc.setFontSize(10);
        doc.text(company.companyAddress, 14, cursorY);
        cursorY += 6;
      }
      if (company.phone) {
        doc.text(`PHONE: ${company.phone}`, 14, cursorY);
        cursorY += 6;
      }
      if (company.email) {
        doc.text(`e-mail: ${company.email}`, 14, cursorY);
        cursorY += 6;
      }
      if (company.vatNumber) {
        doc.text(`VAT NO: ${company.vatNumber}`, 14, cursorY);
        cursorY += 6;
      }
      cursorY += 4;
    }

    const title = 'Ledger Statement';
    doc.setFontSize(16);
    doc.text(title, 14, cursorY);
    cursorY += 10;

    doc.setFontSize(11);
    doc.text(`Firm: ${firm.name}`, 14, cursorY);
    cursorY += 7;
    doc.text(`Owner: ${firm.owner}`, 14, cursorY);
    cursorY += 7;
    if (firm.phone) {
      doc.text(`Phone: ${firm.phone}`, 14, cursorY);
      cursorY += 7;
    }

    const rangeLabel =
      from && to
        ? `Range: ${from.split('T')[0]} to ${to.split('T')[0]}`
        : 'Range: All Transactions';
    doc.text(rangeLabel, 14, cursorY);
    cursorY += 10;

    if (!transactions.length) {
      doc.text('No transactions for selected period.', 14, cursorY);
    } else {
      autoTable(doc, {
        startY: cursorY,
        head: [['Date', 'Particular', 'Dr', 'Cr', 'Balance']],
        styles: { fontSize: 9 },
        body: transactions.map((t) => [
          t.date ? t.date.split('T')[0] : '',
          t.particular,
          t.drAmount ? t.drAmount.toLocaleString() : '',
          t.crAmount ? t.crAmount.toLocaleString() : '',
          t.balance.toLocaleString()
        ])
      });
    }

    // Totals
    const totalDebit = transactions.reduce((s, t) => s + (t.drAmount || 0), 0);
    const totalCredit = transactions.reduce((s, t) => s + (t.crAmount || 0), 0);
    const closingBalance = transactions.length
      ? transactions[transactions.length - 1].balance
      : 0;

    const finalY = (doc as any).lastAutoTable
      ? (doc as any).lastAutoTable.finalY + 8
      : cursorY + 10;
    doc.setFontSize(11);
    doc.text(`Total Debit: ${totalDebit.toLocaleString()}`, 14, finalY);
    doc.text(`Total Credit: ${totalCredit.toLocaleString()}`, 80, finalY);
    doc.text(
      `Closing Balance: ${closingBalance.toLocaleString()}`,
      140,
      finalY
    );

    const pdfArrayBuffer = doc.output('arraybuffer');
    const fileNameBase = firm.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const rangePart =
      from && to ? `${from.split('T')[0]}-${to.split('T')[0]}` : 'all';
    // Return as Uint8Array for the Response body
    return new Response(new Uint8Array(pdfArrayBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${fileNameBase}_ledger_${rangePart}.pdf`
      }
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate PDF', detail: e?.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
