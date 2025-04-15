
import { format } from "date-fns";
import { Content, ContentText } from "pdfmake/interfaces";
import { styles, logoBase64, companyInfo, numberToWords } from "./pdfConfig";

// Interface for text with margin
interface TextWithMargin extends ContentText {
  margin?: [number, number, number, number];
}

// Type for content objects that have a stack property
// Instead of extending Content, we'll define it as its own interface
interface ContentWithStack {
  stack: (ContentText | TextWithMargin)[];
  margin?: [number, number, number, number];
}

// Create document header with logo and company info
export const createDocumentHeader = (title: string): Content => {
  return {
    columns: [
      // Company info on the left
      {
        width: '65%',
        stack: [
          { text: companyInfo.name, style: 'companyName' },
          { text: companyInfo.address, style: 'companyAddress' },
          { text: `Contact: ${companyInfo.contact}`, style: 'companyContact' },
          { text: `Email: ${companyInfo.email}`, style: 'companyContact' },
          { text: `GSTIN: ${companyInfo.gstin}`, style: 'gstin', margin: [0, 2, 0, 0] }
        ]
      },
      // Logo on the right or fallback to text if image loading fails
      {
        width: '35%',
        stack: [
          {
            image: logoBase64,
            width: 150,
            alignment: 'right',
            margin: [0, 0, 0, 5]
          },
          {
            text: title,
            style: 'header'
          }
        ]
      }
    ],
    margin: [0, 0, 0, 15]
  };
};

// Create document details section (date, number, etc.)
export const createDocumentDetails = (details: { label: string, value: string }[]): ContentWithStack => {
  return {
    stack: details.map(detail => ({ 
      columns: [
        { text: `${detail.label}:`, style: 'sectionTitle', width: 'auto' },
        { text: ` ${detail.value}`, width: '*' }
      ]
    }))
  };
};

// Create client/vendor information section
export const createEntityInfoSection = (label: string, name: string, address?: string): ContentWithStack => {
  const infoStack: (ContentText | TextWithMargin)[] = [
    { text: `${label}:`, style: 'sectionTitle', margin: [0, 0, 0, 2] },
    { text: name, margin: [0, 0, 0, 2] }
  ];
  
  if (address) {
    infoStack.push({ 
      text: address, 
      margin: [0, 0, 0, 10],
      fontSize: 9 
    } as TextWithMargin);
  } else {
    infoStack.push({ 
      text: '', 
      margin: [0, 0, 0, 10]
    } as TextWithMargin);
  }
  
  return { stack: infoStack };
};

// Create document totals section
export const createTotalsSection = (subtotal: number, totalGst: number, grandTotal: number): Content => {
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
        margin: [0, 10, 0, 5] as [number, number, number, number]
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
    margin: [0, 10, 0, 0] as [number, number, number, number]
  };
};

// Create terms and conditions section with explicit return type
export const createTermsSection = (standardTerms: string[], customTerms?: string): Content => {
  const termsContent: (ContentText | TextWithMargin)[] = [
    { text: 'Terms & Conditions', style: 'termsHeader' },
    ...standardTerms.map(term => ({ text: `• ${term}`, style: 'termsList' }))
  ];
  
  if (customTerms) {
    termsContent.push({ 
      text: customTerms, 
      style: 'termsList', 
      margin: [0, 5, 0, 0]
    } as TextWithMargin);
  }
  
  return { stack: termsContent };
};

// Create notes section with explicit return type
export const createNotesSection = (notes?: string): Content => {
  if (!notes) return { text: '' };
  
  return {
    stack: [
      { text: 'Notes', style: 'termsHeader' },
      { text: notes, style: 'termsList' }
    ]
  };
};

// Create thank you note
export const createThankYouNote = (message: string): Content => {
  return { 
    text: message, 
    style: 'footer', 
    margin: [0, 20, 0, 0]
  } as TextWithMargin;
};

// Create signature section
export const createSignatureSection = (): Content => {
  return {
    columns: [
      {
        width: '*',
        text: '',
      },
      {
        width: '30%',
        stack: [
          { text: '', margin: [0, 30, 0, 0] },
          { text: 'Authorized Signature', style: 'termsList', alignment: 'center' }
        ]
      }
    ],
    margin: [0, 20, 0, 0] as [number, number, number, number]
  };
};
