
import { StyleDictionary } from "pdfmake/interfaces";
import { PdfMargin } from "./pdfCore";

// Common styles for PDF documents
export const styles: StyleDictionary = {
  header: {
    fontSize: 20,
    bold: true,
    margin: [0, 0, 0, 10] as PdfMargin
  },
  subheader: {
    fontSize: 16,
    bold: true,
    margin: [0, 10, 0, 5] as PdfMargin
  },
  tableHeader: {
    bold: true,
    fontSize: 12,
    color: 'black',
    fillColor: '#f2f2f2'
  },
  itemsTable: {
    margin: [0, 5, 0, 15] as PdfMargin
  },
  infoLabel: {
    bold: true
  },
  infoValue: {
  },
  notes: {
    fontSize: 10,
    margin: [0, 5, 0, 0] as PdfMargin,
    italics: true
  },
  tableHeaderCell: {
    fillColor: '#f2f2f2',
    bold: true,
    fontSize: 10,
    color: '#333',
    margin: [0, 5, 0, 5] as PdfMargin
  },
  tableCell: {
    fontSize: 10,
    margin: [0, 3, 0, 3] as PdfMargin
  },
  amountCell: {
    fontSize: 10,
    alignment: 'right',
    margin: [0, 3, 0, 3] as PdfMargin
  },
  totalRow: {
    bold: true
  },
  grandTotalRow: {
    bold: true,
    fontSize: 11
  },
  companyName: {
    fontSize: 14,
    bold: true,
    margin: [0, 0, 0, 2] as PdfMargin
  },
  companyAddress: {
    fontSize: 10,
    margin: [0, 0, 0, 1] as PdfMargin
  },
  companyContact: {
    fontSize: 10,
    margin: [0, 0, 0, 1] as PdfMargin
  },
  gstin: {
    fontSize: 10,
    bold: true
  },
  sectionTitle: {
    fontSize: 10,
    bold: true
  },
  termsList: {
    fontSize: 9,
    margin: [0, 2, 0, 0] as PdfMargin
  },
  termsHeader: {
    fontSize: 11,
    bold: true,
    margin: [0, 5, 0, 3] as PdfMargin
  },
  bankDetailsHeader: {
    fontSize: 11,
    bold: true,
    margin: [0, 0, 0, 3] as PdfMargin
  },
  bankDetails: {
    fontSize: 9,
    margin: [0, 1, 0, 1] as PdfMargin
  },
  amountInWords: {
    fontSize: 10,
    italics: true
  },
  footer: {
    fontSize: 10,
    bold: true,
    alignment: 'center'
  },
  tableRow: {
    fontSize: 9
  },
  tableRowEven: {
    fontSize: 9,
    fillColor: '#f9f9f9'
  }
};
