
import { StyleDictionary } from "pdfmake/interfaces";
import { PdfAlignment } from "../sections/types";

// PDF styling configuration
export const styles: StyleDictionary = {
  header: {
    fontSize: 18,
    bold: true,
    alignment: 'right' as PdfAlignment,
    margin: [0, 0, 0, 10]
  },
  companyName: {
    fontSize: 16,
    bold: true,
    margin: [0, 0, 0, 2]
  },
  companyAddress: {
    fontSize: 10,
    margin: [0, 0, 0, 1]
  },
  companyContact: {
    fontSize: 10,
    margin: [0, 0, 0, 1]
  },
  gstin: {
    fontSize: 10,
    bold: true,
  },
  tableHeader: {
    fontSize: 10,
    bold: true,
    fillColor: '#f3f3f3',
    alignment: 'left' as PdfAlignment
  },
  sectionTitle: {
    fontSize: 11,
    bold: true,
    margin: [0, 5, 0, 5]
  },
  footer: {
    fontSize: 10,
    alignment: 'center' as PdfAlignment,
    italics: true
  },
  termsHeader: {
    fontSize: 11,
    bold: true,
    margin: [0, 10, 0, 5]
  },
  termsList: {
    fontSize: 9,
    margin: [0, 2, 0, 0]
  },
  amountInWords: {
    fontSize: 10,
    italics: true
  },
  bankDetailsHeader: {
    fontSize: 11,
    bold: true,
    margin: [0, 10, 0, 5]
  },
  bankDetails: {
    fontSize: 9,
    margin: [0, 2, 0, 0]
  }
};
