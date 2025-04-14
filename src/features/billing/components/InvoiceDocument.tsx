'use client';

import React from 'react';
import { Document, Page, Text, View, Font } from '@react-pdf/renderer';
import { styles } from './styles';
import { InvoiceProps } from '../interfaces/IBilling';

// Register a font that resembles the one in the image
Font.register({
  family: 'Helvetica-Bold',
  src: 'https://cdn.jsdelivr.net/npm/@react-pdf/font/lib/assets/Helvetica-Bold.ttf'
});

Font.register({
  family: 'Times-Roman',
  src: 'https://cdn.jsdelivr.net/npm/@react-pdf/font/lib/assets/Times-Roman.ttf'
});

function InvoiceDocument({ invoiceData }: InvoiceProps) {
  const totalRows = 42; // Define the total number of rows you want in the table
  const emptyRows = Math.floor(totalRows - invoiceData?.items?.length * 2.3); // Calculate the number of empty rows needed

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Invoice body */}
        <View style={styles.body}>
          {/* Header with Invoice Title & Company Name */}
          <View style={styles.header}>
            {invoiceData?.isInvoice ? (
              <Text style={styles.invoiceTitle}>INVOICE</Text>
            ) : (
              <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            )}
            <Text style={styles.companyName}>
              {invoiceData?.companyName?.toUpperCase() ?? ''}
            </Text>
            <Text style={styles.companyAddress}>
              {invoiceData?.companyAddress ?? ''}
            </Text>
            <Text style={[styles.companyPhone, { fontWeight: 600 }]}>
              PHONE: {invoiceData?.phone ?? ''}
            </Text>
            <Text style={styles.companyEmail}>
              e-mail: {invoiceData?.email ?? ''}
            </Text>
            <View style={styles.vatSection}>
              <Text style={styles.vatText}>VAT NO: </Text>
              <View style={styles.vatNumber}>
                {
                  // Display VAT number digit by digit
                  invoiceData?.vatNumber
                    ?.split('')
                    .map((digit: string | number, index: number) => (
                      <Text
                        key={index}
                        style={[
                          styles.vatLabel,
                          index !==
                          (invoiceData.buyerPan?.toString()?.length ?? 0) - 1
                            ? {
                                borderRightWidth: 0.5,
                                borderRightColor: '#D3D3D3'
                              }
                            : {}
                        ]}
                      >
                        {digit}
                      </Text>
                    )) ?? null
                }
              </View>
            </View>
          </View>

          {/* Buyer and Invoice Info */}
          <View style={styles.buyerSection}>
            {/* Buyer Info */}
            <View>
              <Text style={styles.buyerTitle}>SOLD TO:</Text>
              <Text style={styles.buyerShopName}>{invoiceData?.buyerName}</Text>
              <View style={{ flexDirection: 'row', marginBottom: 1 }}>
                <Text style={{ color: '#85837F' }}>ADDRESS :</Text>
                <Text style={styles.buyerShopAddress}>
                  {invoiceData?.buyerAddress}
                </Text>
              </View>
              <Text style={[styles.buyerText, { color: '#85837F' }]}>
                PHONE : {invoiceData.buyerPhone?.replace(/\//g, ' / ')}
              </Text>
              <View style={styles.buyerText}>
                <Text style={{ color: '#85837F' }}>BUYER&apos;S PAN : </Text>
                <View style={styles.vatNumber}>
                  <View style={styles.vatNumber}>
                    {(() => {
                      const buyerPan = invoiceData.buyerPan?.toString();
                      const buyerPanLength = buyerPan?.length;

                      // If valid PAN, show the digits; otherwise show 9 placeholders
                      if (buyerPanLength === 9) {
                        return buyerPan
                          ?.split('')
                          .map((digit: any, index: any) => (
                            <Text
                              key={index}
                              style={[
                                styles.vatLabel,
                                index < 8
                                  ? {
                                      borderRightWidth: 0.5,
                                      borderRightColor: '#85837F'
                                    }
                                  : {}
                              ]}
                            >
                              {digit}
                            </Text>
                          ));
                      } else {
                        // For empty/invalid PAN, create a row of empty blocks
                        return Array(9)
                          .fill('')
                          .map((_, index) => (
                            <View
                              key={index}
                              style={[
                                styles.emptyVatLabel,
                                index < 8
                                  ? {
                                      borderRightWidth: 0.5,
                                      borderRightColor: '#85837F'
                                    }
                                  : {}
                              ]}
                            />
                          ));
                      }
                    })()}
                  </View>
                </View>
              </View>
            </View>

            {/* Invoice Info */}
            <View>
              <View style={[styles.infoTable, { color: '#85837F' }]}>
                <Text style={styles.infoLabel}>Transaction DATE :</Text>
                <Text style={styles.infoValue}>
                  {invoiceData.transactionDate}
                </Text>
              </View>
              <View style={styles.infoTable}>
                <Text style={styles.infoInvoiceLabel}>INVOICE NO :</Text>
                <Text style={styles.infoInvoiceValue}>
                  {invoiceData?.invoiceNumber}
                </Text>
              </View>
              <View style={[styles.infoTable, { color: '#85837F' }]}>
                <Text style={styles.infoLabel}>DATE :</Text>
                <Text style={styles.infoValue}>{invoiceData.date}</Text>
              </View>
              <View style={[styles.infoTable, { color: '#85837F' }]}>
                <Text style={styles.infoLabel}>MITI :</Text>
                <Text style={styles.infoValue}>{invoiceData.miti}</Text>
              </View>
              <View style={styles.infoTable}>
                <Text style={[styles.infoLabel, { color: '#85837F' }]}>
                  MODE OF PAYMENT :
                </Text>
                <Text style={styles.infoInvoiceValue}>
                  {invoiceData?.paymentMode}
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
            {invoiceData.items?.map((item: any, index: number) => (
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
                  <Text>{item.quantity?.toFixed(0)}</Text>
                </View>
                <View style={styles.unitCell}>
                  <Text>{item.unit}</Text>
                </View>
                <View style={styles.rateCell}>
                  <Text>{item.rate?.toFixed(2)}</Text>
                </View>
                <View style={styles.amountCell}>
                  <Text>{item.amount?.toFixed(2)}</Text>
                </View>
              </View>
            ))}

            {/* Empty rows to match layout */}
            {Array.from({ length: emptyRows }).map((_, index) => (
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
              <Text>
                Print Date: {invoiceData.printDate}, Time:{' '}
                {invoiceData.printTime}
              </Text>
            </View>

            {/* Totals Table */}
            <View style={styles.totalsTable}>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { fontWeight: 600 }]}>
                  VALUE :
                </Text>
                <Text style={[styles.totalValue, { fontWeight: 600 }]}>
                  {invoiceData.value?.toFixed(2)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>LESS DISCOUNT :</Text>
                <Text style={styles.totalValue}>
                  {invoiceData.discount?.toFixed(2)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>NON TAXABLE :</Text>
                <Text style={[styles.totalValue, { fontWeight: 600 }]}>
                  {invoiceData.nonTaxable?.toFixed(2)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TAXABLE AMOUNT :</Text>
                <Text style={[styles.totalValue, { fontWeight: 600 }]}>
                  {invoiceData.taxableAmount?.toFixed(2)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>V.A.T. @13% :</Text>
                <Text style={styles.totalValue}>
                  {invoiceData.vatAmount?.toFixed(2)}
                </Text>
              </View>
              <View style={styles.lastTotalRow}>
                <Text style={[styles.totalLabel, styles.totalAmount]}>
                  TOTAL AMOUNT :
                </Text>
                <Text style={[styles.totalValue, styles.totalAmount]}>
                  {invoiceData.totalAmount?.toFixed(2)}
                </Text>
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
                <Text>Vehicle No. : {invoiceData?.vehicleNo}</Text>
              </View>

              {/* Remarks */}
              <View style={styles.remarksSection}>
                <Text>REMARKS: {invoiceData?.remarks}</Text>
              </View>

              <View style={styles.footerColumn}>
                <Text>........................</Text>
                <Text>Received by</Text>
              </View>
            </View>

            {/* Center */}
            <View style={styles.footerMiddle}>
              <Text>........................</Text>
              <Text>
                User :{' '}
                {invoiceData?.processedBy ? invoiceData.processedBy : 'Admin'}
              </Text>
            </View>

            {/* Right */}
            <View style={styles.footerRight}>
              {/* E & O.E. text */}
              <Text style={styles.eAndOe}>E.&O.E.</Text>

              <View style={styles.footerCompanyName}>
                {renderCompanyName(invoiceData.companyName)}
              </View>

              <View style={styles.signatureSection}>
                <Text>......................................</Text>
                <Text>Authorized Signatory</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Watermark */}
        {invoiceData?.isTestUser && (
          <View style={styles.watermark}>
            <Text style={styles.watermarkText}>PAID</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

const renderCompanyName = (companyName: string) => {
  if (!companyName) return null;

  const words = companyName.trim().split(' ');
  if (words.length === 1 || companyName.length <= 15) {
    return <Text style={styles.footerCompanyName}>{companyName}</Text>;
  }

  // Distribute words to two lines based on length balance
  let line1 = '';
  let line2 = '';
  let line1Length = 0;
  let line2Length = 0;

  words.forEach((word) => {
    const wordLengthWithSpace = word.length + 1;

    if (
      line1Length <= line2Length ||
      line1Length + wordLengthWithSpace <= companyName.length / 2 + 2
    ) {
      line1 += (line1 ? ' ' : '') + word;
      line1Length += wordLengthWithSpace;
    } else {
      line2 += (line2 ? ' ' : '') + word;
      line2Length += wordLengthWithSpace;
    }
  });

  return (
    <>
      <Text style={styles.footerCompanyName}>{line1}</Text>
      <Text style={styles.footerCompanyName}>{line2}</Text>
    </>
  );
};

export default InvoiceDocument;
