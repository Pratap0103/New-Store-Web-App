import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register a font if needed, or use defaults
// Font.register({ family: 'Roboto', src: '...' });

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0369a1', // sky-700
    marginBottom: 4,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    textTransform: 'uppercase',
    backgroundColor: '#f8fafc',
    padding: 5,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  box: {
    width: '48%',
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
  },
  boxTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 9,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    padding: 5,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 5,
    alignItems: 'center',
  },
  col1: { width: '5%' },
  col2: { width: '15%' },
  col3: { width: '25%' },
  col4: { width: '10%', textAlign: 'center' },
  col5: { width: '15%', textAlign: 'right' },
  col6: { width: '10%', textAlign: 'center' },
  col7: { width: '10%', textAlign: 'center' },
  col8: { width: '15%', textAlign: 'right' },
  
  totals: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  totalLabel: {
    width: 100,
    textAlign: 'right',
    paddingRight: 10,
  },
  totalValue: {
    width: 80,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 5,
    paddingTop: 5,
    color: '#0369a1',
  },
  terms: {
    marginTop: 20,
  },
  termTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 10,
  },
  termItem: {
    marginBottom: 2,
    fontSize: 9,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  }
});

const POPdf = ({ 
  companyName, companyAddress, companyPhone, companyEmail, companyGstin, companyPan,
  supplierName, supplierAddress, supplierGstin, supplierEmail,
  poNumber, poDate, deliveryDate, projectName, deliveryAddress,
  siteEngineerName, siteEngineerPhoneNo,
  items, subtotal, totalGst, totalAmount, terms,
  quotationNumber, quotationDate, enqNo, enqDate,
  preparedBy, approvedBy, companyLogo
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text>{companyAddress}</Text>
          <Text>Phone: {companyPhone} | Email: {companyEmail}</Text>
          <Text>GSTIN: {companyGstin} | PAN: {companyPan}</Text>
        </View>
        {companyLogo && (
          <Image src={companyLogo} style={styles.logo} />
        )}
      </View>

      <Text style={styles.title}>Purchase Order</Text>

      {/* PO Details & Supplier */}
      <View style={styles.section}>
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Supplier Details</Text>
          <Text style={{ fontWeight: 'bold' }}>{supplierName}</Text>
          <Text>{supplierAddress}</Text>
          <Text>GSTIN: {supplierGstin}</Text>
          <Text>Email: {supplierEmail}</Text>
        </View>
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Order Details</Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ width: 60 }}>PO No:</Text>
            <Text style={{ fontWeight: 'bold' }}>{poNumber}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ width: 60 }}>PO Date:</Text>
            <Text>{poDate}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ width: 60 }}>Delivery:</Text>
            <Text>{deliveryDate}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ width: 60 }}>Project:</Text>
            <Text>{projectName}</Text>
          </View>
          {quotationNumber && (
            <>
              <View style={{ flexDirection: 'row', marginTop: 4 }}>
                <Text style={{ width: 60 }}>Quot No:</Text>
                <Text>{quotationNumber}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ width: 60 }}>Quot Date:</Text>
                <Text>{quotationDate}</Text>
              </View>
            </>
          )}
          {enqNo && (
            <>
              <View style={{ flexDirection: 'row', marginTop: 4 }}>
                <Text style={{ width: 60 }}>Enq No:</Text>
                <Text>{enqNo}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ width: 60 }}>Enq Date:</Text>
                <Text>{enqDate}</Text>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Delivery Info */}
      <View style={styles.section}>
        <View style={[styles.box, { width: '100%' }]}>
          <Text style={styles.boxTitle}>Consignee & Delivery Address</Text>
          <Text>{deliveryAddress}</Text>
          {siteEngineerName && (
            <Text style={{ marginTop: 4 }}>
              Contact: {siteEngineerName} ({siteEngineerPhoneNo})
            </Text>
          )}
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>#</Text>
          <Text style={styles.col2}>Code</Text>
          <Text style={styles.col3}>Product / Description</Text>
          <Text style={styles.col4}>Qty</Text>
          <Text style={styles.col5}>Rate</Text>
          <Text style={styles.col6}>GST%</Text>
          <Text style={styles.col7}>Disc%</Text>
          <Text style={styles.col8}>Amount</Text>
        </View>

        {items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.col1}>{index + 1}</Text>
            <Text style={styles.col2}>{item.internalCode}</Text>
            <View style={styles.col3}>
              <Text style={{ fontWeight: 'bold' }}>{item.product}</Text>
              <Text style={{ fontSize: 8, color: '#666' }}>{item.paymentTerm}</Text>
            </View>
            <Text style={styles.col4}>{item.qty}</Text>
            <Text style={styles.col5}>{item.rate.toFixed(2)}</Text>
            <Text style={styles.col6}>{item.gst}</Text>
            <Text style={styles.col7}>{item.discount}</Text>
            <Text style={styles.col8}>{item.amount.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>₹{parseFloat(subtotal).toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>GST Amount:</Text>
          <Text style={styles.totalValue}>₹{parseFloat(totalGst).toLocaleString('en-IN')}</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={[styles.totalLabel, { fontWeight: 'bold' }]}>Grand Total:</Text>
          <Text style={styles.totalValue}>₹{parseFloat(totalAmount).toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {/* Terms */}
      {terms && terms.length > 0 && (
        <View style={styles.terms}>
          <Text style={styles.termTitle}>Terms & Conditions:</Text>
          {terms.map((term, index) => (
            <Text key={index} style={styles.termItem}>
              {term.num}. {term.text}
            </Text>
          ))}
        </View>
      )}

      {/* Signatures */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }}>
        <View style={{ width: '30%', textAlign: 'center' }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>Prepared By</Text>
          <Text>{preparedBy}</Text>
        </View>
        <View style={{ width: '30%', textAlign: 'center' }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>Approved By</Text>
          <Text>{approvedBy}</Text>
        </View>
        <View style={{ width: '30%', textAlign: 'center' }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>For {companyName}</Text>
          <Text style={{ fontSize: 8, marginTop: 4 }}>(Authorized Signatory)</Text>
        </View>
      </View>

      <Text style={styles.footer}>
        This is a computer generated document and does not require signature.
      </Text>
    </Page>
  </Document>
);

export default POPdf;
