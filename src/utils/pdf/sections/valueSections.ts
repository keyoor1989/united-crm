
import { Content } from "pdfmake/interfaces";
import { numberToWords } from "../pdfConfig";
import { PdfMargin } from "../pdfConfig";

// Create document totals section
export const createTotalsSection = (
  subtotal: number, 
  totalGst: number, 
  grandTotal: number
): Content => {
  const amountInWords = numberToWords(grandTotal);
  
  return {
    stack: [
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            table: {
              widths: ['auto', 100],
              body: [
                [
                  { text: 'Subtotal:', style: 'sectionTitle', alignment: 'right' },
                  { text: `₹${subtotal.toLocaleString()}`, alignment: 'right' }
                ],
                [
                  { text: 'GST (18%):', style: 'sectionTitle', alignment: 'right' },
                  { text: `₹${totalGst.toLocaleString()}`, alignment: 'right' }
                ],
                [
                  { text: 'Net Amount:', style: 'sectionTitle', alignment: 'right', fontSize: 10, bold: true },
                  { text: `₹${grandTotal.toLocaleString()}`, alignment: 'right', bold: true }
                ]
              ]
            },
            layout: 'noBorders'
          }
        ],
        margin: [0, 10, 0, 5] as PdfMargin
      },
      {
        text: `Amount in Words: ${amountInWords}`,
        style: 'amountInWords',
        margin: [0, 5, 0, 10]
      }
    ]
  };
};

// Create bank details section
export const createBankDetailsSection = (): Content => {
  return {
    stack: [
      { text: 'Bank Details:', style: 'bankDetailsHeader' },
      { text: `Bank Name: ${companyInfo.bankName}`, style: 'bankDetails' },
      { text: `Account No: ${companyInfo.accountNo}`, style: 'bankDetails' },
      { text: `IFSC Code: ${companyInfo.ifsc}`, style: 'bankDetails' },
      { text: `Branch: ${companyInfo.branch}`, style: 'bankDetails' },
    ],
    margin: [0, 10, 0, 0] as PdfMargin
  };
};

// Missing import
import { companyInfo } from "../pdfConfig";
