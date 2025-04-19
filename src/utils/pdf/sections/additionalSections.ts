
import { Content } from "pdfmake/interfaces";
import { TextWithMargin, PdfAlignment } from "./types";
import { PdfMargin } from "../config";

// Create terms and conditions section
export const createTermsSection = (standardTerms: string[], customTerms?: string): Content => {
  const termsStack: Content[] = [
    { text: 'Terms & Conditions', style: 'termsHeader' } as Content
  ];
  
  // Add standard terms as bullet points
  standardTerms.forEach(term => {
    termsStack.push({ text: `• ${term}`, style: 'termsList' } as Content);
  });
  
  // Add custom terms if provided
  if (customTerms) {
    termsStack.push({ 
      text: customTerms, 
      style: 'termsList', 
      margin: [0, 5, 0, 0] 
    } as Content);
  }
  
  return { stack: termsStack };
};

// Create notes section
export const createNotesSection = (notes?: string): Content => {
  if (!notes) return { text: '' };
  
  return {
    stack: [
      { text: 'Notes', style: 'termsHeader' } as Content,
      { text: notes, style: 'termsList' } as Content
    ]
  };
};

// Create thank you note
export const createThankYouNote = (message: string): Content => {
  return { 
    text: message, 
    style: 'footer', 
    margin: [0, 20, 0, 0], 
    alignment: 'center' as PdfAlignment
  } as Content;
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
          { text: '', margin: [0, 30, 0, 0] } as Content,
          { text: 'Authorized Signature', style: 'termsList', alignment: 'center' as PdfAlignment } as Content
        ]
      }
    ],
    margin: [0, 20, 0, 0] as PdfMargin
  };
};
