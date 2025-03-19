// pages/api/generate-pdf.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Suppose we receive invoice data from the request body
  const { companyName, invoiceNumber, date, items } = req.body;

  const doc = new jsPDF();

  doc.text('Tax Invoice', 10, 10);
  doc.text(`Company: ${companyName}`, 10, 20);
  doc.text(`Invoice #: ${invoiceNumber}`, 10, 30);
  doc.text(`Date: ${date}`, 10, 40);

  // Using autoTable for the item table
  autoTable(doc, {
    startY: 50,
    head: [['Item', 'Quantity', 'Price']],
    body: items.map((item: any) => [
      item.description,
      item.quantity,
      item.price
    ])
  });

  // Send the PDF as a buffer
  const pdfData = doc.output('arraybuffer');
  res.setHeader('Content-Type', 'application/pdf');
  res.send(Buffer.from(pdfData));
}
