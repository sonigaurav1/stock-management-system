'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  PDFDownloadLink,
  Font,
  PDFViewer
} from '@react-pdf/renderer';
import { styles } from './styles';
import { invoiceData } from './__data';

// Register a font that resembles the one in the image
Font.register({
  family: 'Helvetica-Bold',
  src: 'https://cdn.jsdelivr.net/npm/@react-pdf/font/lib/assets/Helvetica-Bold.ttf'
});

function InvoiceDocument({ invoiceData }: { invoiceData: any }) {
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Invoice body */}
        <View style={styles.body}>
          {/* Header with Invoice Title & Company Name */}
          <View style={styles.header}>
            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.companyName}>SONU JEWELLERS</Text>
            <Text style={styles.companyAddress}>ITAHARI-9, SUNSARI</Text>
            <Text style={styles.companyPhone}>PHONE: 025-584001</Text>
            <Text style={styles.companyEmail}>
              e-mail: rstlsunsari@gmail.com
            </Text>
            <View style={styles.vatSection}>
              <Text>VAT NO: </Text>
              <View style={styles.vatNumber}>
                {
                  // Display VAT number digit by digit
                  '302875452'.split('').map((digit, index) => (
                    <Text
                      key={index}
                      style={[
                        styles.vatLabel,
                        index !== invoiceData.buyerPan.length - 1
                          ? {
                              borderRightWidth: 0.5,
                              borderRightColor: '#000'
                            }
                          : {}
                      ]}
                    >
                      {digit}
                    </Text>
                  ))
                }
              </View>
            </View>
          </View>

          {/* Buyer and Invoice Info */}
          <View style={styles.buyerSection}>
            {/* Buyer Info */}
            <View>
              <Text style={styles.buyerTitle}>SOLD TO:</Text>
              <Text style={styles.buyerShopName}>{invoiceData.buyerName}</Text>
              <View style={{ flexDirection: 'row', marginBottom: 1 }}>
                <Text>ADDRESS :</Text>
                <Text style={styles.buyerShopAddress}>
                  {invoiceData.buyerAddress}
                </Text>
              </View>
              <Text style={styles.buyerText}>
                PHONE : {invoiceData.buyerPhone}
              </Text>
              <View style={styles.buyerText}>
                <Text>BUYER&apos;S PAN : </Text>
                <View style={styles.vatNumber}>
                  {
                    // Display VAT number digit by digit
                    invoiceData.buyerPan
                      .split('')
                      .map((digit: any, index: any) => (
                        <Text
                          key={index}
                          style={[
                            styles.vatLabel,
                            index !== invoiceData.buyerPan.length - 1
                              ? {
                                  borderRightWidth: 0.5,
                                  borderRightColor: '#000'
                                }
                              : {}
                          ]}
                        >
                          {digit}
                        </Text>
                      ))
                  }
                </View>
              </View>
            </View>

            {/* Invoice Info */}
            <View>
              <View style={styles.infoTable}>
                <Text style={styles.infoLabel}>Transaction DATE :</Text>
                <Text style={styles.infoValue}>
                  {invoiceData.transactionDate}
                </Text>
              </View>
              <View style={styles.infoTable}>
                <Text style={styles.infoInvoiceLabel}>INVOICE NO :</Text>
                <Text style={styles.infoInvoiceValue}>
                  {invoiceData.invoiceNumber}
                </Text>
              </View>
              <View style={styles.infoTable}>
                <Text style={styles.infoLabel}>DATE :</Text>
                <Text style={styles.infoValue}>{invoiceData.date}</Text>
              </View>
              <View style={styles.infoTable}>
                <Text style={styles.infoLabel}>MITI :</Text>
                <Text style={styles.infoValue}>{invoiceData.miti}</Text>
              </View>
              <View style={styles.infoTable}>
                <Text style={styles.infoLabel}>MODE OF PAYMENT :</Text>
                <Text style={styles.infoInvoiceValue}>
                  {invoiceData.paymentMode}
                </Text>
              </View>
            </View>
          </View>

          {/* Items Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.snCell}>
                <Text>SN.</Text>
              </View>
              <View style={styles.codeCell}>
                <Text>HS.CODE</Text>
              </View>
              <View style={styles.descCell}>
                <Text>DESCRIPTION</Text>
              </View>
              <View style={styles.qtyCell}>
                <Text>QTY.</Text>
              </View>
              <View style={styles.unitCell}>
                <Text>UNIT</Text>
              </View>
              <View style={styles.rateCell}>
                <Text>RATE</Text>
              </View>
              <View style={styles.amountCell}>
                <Text>AMOUNT</Text>
              </View>
            </View>

            {/* Table Rows */}
            {invoiceData.items.map((item: any, index: number) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.snCell}>
                  <Text>{item.sn}</Text>
                </View>
                <View style={styles.codeCell}>
                  <Text>{item.hsCode}</Text>
                </View>
                <View style={styles.descCell}>
                  <Text>{item.description}</Text>
                </View>
                <View style={styles.qtyCell}>
                  <Text>{item.quantity.toLocaleString()}</Text>
                </View>
                <View style={styles.unitCell}>
                  <Text>{item.unit}</Text>
                </View>
                <View style={styles.rateCell}>
                  <Text>{item.rate.toFixed(2)}</Text>
                </View>
                <View style={styles.amountCell}>
                  <Text>{item.amount.toLocaleString()}</Text>
                </View>
              </View>
            ))}

            {/* Empty rows to match layout */}
            {[1, 2, 3, 4, 5].map((_, index) => (
              <View style={styles.tableRow} key={`blank-${index}`}>
                <View style={styles.snCell}>
                  <Text></Text>
                </View>
                <View style={styles.codeCell}>
                  <Text></Text>
                </View>
                <View style={styles.descCell}>
                  <Text></Text>
                </View>
                <View style={styles.qtyCell}>
                  <Text></Text>
                </View>
                <View style={styles.unitCell}>
                  <Text></Text>
                </View>
                <View style={styles.rateCell}>
                  <Text></Text>
                </View>
                <View style={styles.amountCell}>
                  <Text></Text>
                </View>
              </View>
            ))}
          </View>

          {/* Totals Section */}
          <View style={styles.totalSection}>
            {/* Empty space */}
            <View style={styles.emptySpace}>
              <Text>Print Date: 02/03/2025, Time: 09:58</Text>
            </View>

            {/* Totals Table */}
            <View style={styles.totalsTable}>
              <View style={styles.totalRow}>
                <View style={styles.totalLabel}>
                  <Text>VALUE</Text>
                </View>
                <View style={styles.totalValue}>
                  <Text>{invoiceData.value.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.totalRow}>
                <View style={styles.totalLabel}>
                  <Text>LESS DISCOUNT</Text>
                </View>
                <View style={styles.totalValue}>
                  <Text>{invoiceData.discount.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.totalRow}>
                <View style={styles.totalLabel}>
                  <Text>NON TAXABLE</Text>
                </View>
                <View style={styles.totalValue}>
                  <Text>{invoiceData.nonTaxable.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.totalRow}>
                <View style={styles.totalLabel}>
                  <Text>TAXABLE AMOUNT</Text>
                </View>
                <View style={styles.totalValue}>
                  <Text>{invoiceData.taxableAmount.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.totalRow}>
                <View style={styles.totalLabel}>
                  <Text>V.A.T. @13%</Text>
                </View>
                <View style={styles.totalValue}>
                  <Text>{invoiceData.vat.toLocaleString()}</Text>
                </View>
              </View>
              <View style={styles.lastTotalRow}>
                <View style={styles.totalLabel}>
                  <Text style={styles.totalAmount}>TOTAL AMOUNT</Text>
                </View>
                <View style={styles.totalValue}>
                  <Text style={styles.totalAmount}>
                    {invoiceData.totalAmount.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Amount in Words */}
          <View style={styles.amountInWords}>
            <Text>In words: Rs. {invoiceData.amountInWords}</Text>
          </View>

          {/* Footer Section */}
          <View style={styles.footerSection}>
            {/* Left */}
            <View style={styles.footerLeft}>
              {/* Vehicle Number */}
              <View style={styles.vehicleSection}>
                <Text>Vehicle No. : {invoiceData.vehicleNo}</Text>
              </View>

              {/* Remarks */}
              <View style={styles.remarksSection}>
                <Text>REMARKS: {invoiceData.remarks}</Text>
              </View>

              <View style={styles.footerColumn}>
                <Text>........................</Text>
                <Text>Received by</Text>
              </View>
            </View>

            {/* Center */}
            <View style={styles.footerMiddle}>
              <Text>........................</Text>
              <Text>User : Admin</Text>
            </View>

            {/* Right */}
            <View style={styles.footerRight}>
              {/* E & O.E. text */}
              <Text style={styles.eAndOe}>E.&O.E.</Text>

              <Text>{invoiceData.companyName}</Text>

              <View style={styles.signatureSection}>
                <Text>........................</Text>
                <Text>Authorized Signatory</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default function InvoicePreview() {
  return (
    <div className='mx-auto max-w-4xl p-5'>
      <h1 className='mb-6 text-2xl font-bold'>Invoice Preview</h1>
      {/* <div className='mb-6'>
        <PDFDownloadLink
          document={<InvoiceDocument invoiceData={invoiceData} />}
          fileName='riddhi-siddhi-invoice.pdf'
          className='cursor-pointer rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
        >
          {({ loading }) =>
            loading ? 'Generating Invoice PDF...' : 'Download Invoice PDF'
          }
        </PDFDownloadLink>
      </div> */}

      {/* PDF Viewer */}
      <div className='mb-6'>
        {typeof window !== 'undefined' && (
          <PDFViewer width='100%' height='800'>
            <InvoiceDocument invoiceData={invoiceData} />
          </PDFViewer>
        )}
      </div>

      {/* Preview info */}
      <div className='rounded-lg border bg-gray-50 p-5'>
        <h2 className='mb-2 font-bold'>Invoice Details:</h2>
        <p>Invoice #: {invoiceData.invoiceNumber}</p>
        <p>Date: {invoiceData.date}</p>
        <p>Customer: {invoiceData.buyerName}</p>
        <p>Total Amount: Rs. {invoiceData.totalAmount}</p>
      </div>
    </div>
  );
}
