import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingRight: 30,
    paddingBottom: 0,
    paddingLeft: 50,
    fontSize: 10,
    backgroundColor: '#ffffff'
  },
  body: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#000'
  },

  // Header
  header: {
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#000'
  },
  invoiceTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 15,
    marginTop: 5
  },
  companyName: {
    fontSize: 20,
    fontFamily: 'Times-Roman',
    fontWeight: 600,
    marginBottom: 2
  },
  companyAddress: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2
  },
  companyPhone: {
    fontSize: 10,
    marginBottom: 2
  },
  companyEmail: {
    fontSize: 10,
    marginBottom: 3
  },
  vatSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  vatText: {
    fontSize: 10,
    fontWeight: 600,
    marginRight: 5
  },
  vatNumber: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D3D3D3'
  },
  vatLabel: {
    fontSize: 10,
    fontWeight: 900,
    padding: 2,
    paddingTop: 0,
    paddingBottom: 0
  },

  // Invoice Info
  buyerSection: {
    width: '100%',
    flexDirection: 'row',
    paddingBottom: 5,
    paddingTop: 5,
    paddingLeft: 7,
    paddingRight: 7,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  buyerTitle: {
    marginBottom: 2,
    color: '#85837F'
  },
  buyerShopName: {
    fontFamily: 'Helvetica-Bold',
    marginBottom: 1
  },
  buyerShopAddress: {
    marginLeft: 2,
    fontFamily: 'Helvetica-Bold'
  },
  buyerText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1
  },
  infoTable: {
    flexDirection: 'row',
    marginBottom: 2
  },
  infoLabel: {
    width: 110,
    textAlign: 'right',
    paddingRight: 5
  },
  infoInvoiceLabel: {
    width: 110,
    textAlign: 'right',
    paddingRight: 5,
    fontWeight: 'bold'
  },
  infoInvoiceValue: {
    width: 50,
    textAlign: 'left',
    fontWeight: 'bold'
  },
  infoValue: {
    width: 50,
    textAlign: 'left'
  },

  // Table
  table: {
    width: '100%',
    height: 350,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#000',
    overflow: 'hidden'
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000'
  },
  snCell: {
    width: '5%',
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#000',
    textAlign: 'center',
    justifyContent: 'flex-start'
  },
  codeCell: {
    width: '12%',
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: '#000',
    textAlign: 'center',
    justifyContent: 'flex-start'
  },
  descCell: {
    width: '44%',
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#000',
    textAlign: 'left',
    justifyContent: 'flex-start'
  },
  qtyCell: {
    width: '10%',
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#000',
    textAlign: 'center',
    justifyContent: 'flex-start'
  },
  unitCell: {
    width: '6%',
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#000',
    textAlign: 'center',
    justifyContent: 'flex-start'
  },
  rateCell: {
    width: '10%',
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#000',
    textAlign: 'right',
    justifyContent: 'flex-start'
  },
  amountCell: {
    width: '13%',
    padding: 4,
    textAlign: 'right',
    justifyContent: 'flex-start'
  },
  tableRow: {
    flexDirection: 'row'
  },

  // Total Section
  totalSection: {
    flexDirection: 'row'
  },
  emptySpace: {
    padding: 10,
    marginTop: 'auto',
    width: '65%'
  },
  totalsTable: {
    width: '41.9%',
    borderLeftWidth: 1,
    borderLeftColor: '#000'
  },
  totalRow: {
    flexDirection: 'row',
    minHeight: 18
  },
  lastTotalRow: {
    flexDirection: 'row',
    minHeight: 20
  },
  totalLabel: {
    width: '60%',
    padding: 3,
    textAlign: 'right'
  },
  totalValue: {
    width: '40%',
    padding: 3,
    textAlign: 'right'
  },
  totalAmount: {
    fontWeight: 600,
    fontSize: 11
  },
  amountInWords: {
    fontSize: 10,
    paddingLeft: 10,
    paddingTop: 5,
    paddingBottom: 5,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#000'
  },

  // Footer
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    width: '100%'
  },

  // Footer Left
  footerLeft: {
    width: '33.33%'
  },
  vehicleSection: {
    fontSize: 9,
    marginBottom: 15
  },
  remarksSection: {
    fontSize: 9,
    marginBottom: 15
  },
  footerColumn: {
    textAlign: 'center',
    fontSize: 9
  },

  // Footer Middle
  footerMiddle: {
    width: '33.33%',
    textAlign: 'center',
    fontSize: 9,
    marginTop: 'auto'
  },

  // Footer Right
  footerRight: {
    width: '33.33%'
  },
  eAndOe: {
    marginLeft: 'auto',
    marginBottom: 13,
    fontSize: 9
  },
  footerCompanyName: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 500
  },
  signatureSection: {
    textAlign: 'center',
    fontSize: 9,
    marginTop: 'auto'
  }
});
