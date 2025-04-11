
import { format } from "date-fns";
import { Content, ContentText } from "pdfmake/interfaces";
import { styles, logoImagePath, companyInfo } from "./pdfConfig";

// Interface for text with margin
interface TextWithMargin extends ContentText {
  margin?: [number, number, number, number];
}

// Create document header with logo and title
export const createDocumentHeader = (title: string) => {
  return {
    columns: [
      // Logo on the left
      {
        image: logoImagePath,
        width: 220,
        alignment: 'left'
      },
      // Spacer
      { width: '*', text: '' },
      // Title on the right
      {
        text: title,
        style: 'header',
        width: 'auto'
      }
    ]
  };
};

// Create company information section
export const createCompanyInfoSection = () => {
  return {
    stack: [
      { text: companyInfo.name, style: 'companyName' },
      { text: companyInfo.address, style: 'companyAddress' },
      { text: companyInfo.contact, style: 'companyContact' }
    ]
  };
};

// Create document details section (date, number, etc.)
export const createDocumentDetails = (details: { label: string, value: string }[]) => {
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
export const createEntityInfoSection = (label: string, name: string, address?: string) => {
  const infoStack: (ContentText | TextWithMargin)[] = [
    { text: `${label}:`, style: 'sectionTitle' },
    { text: name }
  ];
  
  if (address) {
    infoStack.push({ 
      text: address, 
      margin: [0, 0, 0, 20]
    } as TextWithMargin);
  } else {
    infoStack.push({ 
      text: '', 
      margin: [0, 0, 0, 20]
    } as TextWithMargin);
  }
  
  return { stack: infoStack };
};

// Create document totals section
export const createTotalsSection = (subtotal: number, totalGst: number, grandTotal: number) => {
  return {
    columns: [
      { width: '*', text: '' },
      {
        width: 'auto',
        table: {
          widths: ['auto', 'auto'],
          body: [
            [
              { text: 'Subtotal:', style: 'sectionTitle', alignment: 'right' },
              { text: `₹${subtotal.toLocaleString()}`, alignment: 'right' }
            ],
            [
              { text: 'GST:', style: 'sectionTitle', alignment: 'right' },
              { text: `₹${totalGst.toLocaleString()}`, alignment: 'right' }
            ],
            [
              { text: 'Grand Total:', style: 'sectionTitle', alignment: 'right' },
              { text: `₹${grandTotal.toLocaleString()}`, alignment: 'right', bold: true }
            ]
          ]
        },
        layout: 'noBorders'
      }
    ],
    margin: [0, 15, 0, 15] as [number, number, number, number]
  };
};

// Create terms and conditions section
export const createTermsSection = (standardTerms: string[], customTerms?: string) => {
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
  
  return termsContent;
};

// Create notes section
export const createNotesSection = (notes?: string) => {
  if (!notes) return [];
  
  return [
    { text: 'Notes', style: 'termsHeader' },
    { text: notes, style: 'termsList' }
  ];
};

// Create thank you note
export const createThankYouNote = (message: string) => {
  return { 
    text: message, 
    style: 'footer', 
    margin: [0, 20, 0, 0]
  } as TextWithMargin;
};
