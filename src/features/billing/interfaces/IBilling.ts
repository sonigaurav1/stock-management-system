// Define types for the product entities
export interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  quantity: number;
  stockLevel: number;
  rate: number;
}

// Define the item type to match the schema requirements
export interface InvoiceItem {
  productId?: string;
  sn: number;
  hsCode: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface InvoiceProps {
  invoiceData: {
    isInvoice?: boolean;
    companyName: string;
    companyAddress: string;
    phone: string;
    email: string;
    vatNumber: string;
    transactionDate: string;
    invoiceNumber: string;
    date: string;
    miti: string;
    paymentMode: string;
    buyerName: string;
    buyerAddress: string;
    buyerPhone?: string;
    buyerPan?: string;
    items: {
      sn: number;
      hsCode: string;
      description: string;
      quantity: number;
      unit: string;
      rate: number;
      amount: number;
    }[];
    value: number | null;
    discount: number | null;
    nonTaxable: number | null;
    taxableAmount: number | null;
    vatAmount: number | null;
    totalAmount: number | null;
    amountInWords: string | null | undefined;
    printDate: string;
    printTime: string;
    vehicleNo: string | null;
    remarks: string | null;
    isAdmin: boolean;
    processedBy?: string;
  };
}
