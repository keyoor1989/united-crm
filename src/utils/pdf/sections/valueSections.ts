
import { Content } from "pdfmake/interfaces";
import { numberToWords } from "../utils/numberToWords";
import { companyInfo } from "../config/companyInfo";

// Create document totals section
export const createTotalsSection = (
  subtotal: number, 
  totalGst: number, 
  grandTotal: number
): Content => {
  const amountInWords = numberToWords(grandTotal);
  
  return {
    stack: [
      // Table for amounts
      {
        table: {
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: '', border: [false, false, false, false] },
              { text: 'Subtotal:', style: 'sectionTitle', alignment: 'right' },
              { text: `₹${subtotal.toFixed(2)}`, alignment: 'right' }
            ],
            [
              { text: '', border: [false, false, false, false] },
              { text: 'GST:', style: 'sectionTitle', alignment: 'right' },
              { text: `₹${totalGst.toFixed(2)}`, alignment: 'right' }
            ],
            [
              { text: '', border: [false, false, false, false] },
              { text: 'Total:', style: 'sectionTitle', alignment: 'right', bold: true },
              { text: `₹${grandTotal.toFixed(2)}`, alignment: 'right', bold: true }
            ]
          ]
        },
        layout: {
          hLineWidth: function(i, node) {
            return (i === node.table.body.length - 1) ? 1 : 0.5;
          },
          vLineWidth: function() {
            return 0;
          },
          hLineColor: function(i, node) {
            return (i === node.table.body.length) ? 'black' : '#dddddd';
          }
        },
        margin: [0, 10, 0, 10]
      },
      
      // Amount in words
      {
        text: `Amount in words: ${amountInWords}`,
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
      { text: 'Bank Details', style: 'bankDetailsHeader' },
      { text: `Bank Name: ${companyInfo.bankName}`, style: 'bankDetails' },
      { text: `Account No: ${companyInfo.accountNo}`, style: 'bankDetails' },
      { text: `IFSC Code: ${companyInfo.ifsc}`, style: 'bankDetails' },
      { text: `Branch: ${companyInfo.branch}`, style: 'bankDetails' }
    ],
    margin: [0, 10, 0, 10]
  };
};
