
import { Content, ContentText } from "pdfmake/interfaces";
import { TextWithMargin } from "./types";
import { PdfMargin } from "../pdfConfig";

// Create terms and conditions section
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

// Create notes section
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
    margin: [0, 20, 0, 0] as PdfMargin
  };
};
