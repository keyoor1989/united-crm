
import { Content, Alignment } from "pdfmake/interfaces";
import { companyInfo } from "../config";
import { PdfMargin } from "../config/pdfCore";

// Create document header with company info only (no logo)
export const createDocumentHeader = (title: string): Content => {
  // Create the base header content
  const headerContent: Content = {
    columns: [
      // Company info on the left
      {
        width: '65%',
        stack: [
          { text: companyInfo.name, style: 'companyName' },
          { text: companyInfo.address, style: 'companyAddress' },
          { text: `Contact: ${companyInfo.contact}`, style: 'companyContact' },
          { text: `Email: ${companyInfo.email}`, style: 'companyContact' },
          { text: `GSTIN: ${companyInfo.gstin}`, style: 'gstin', margin: [0, 2, 0, 0] as [number, number, number, number] }
        ]
      },
      // Right side with title only
      {
        width: '35%',
        stack: [
          {
            text: title,
            style: 'header'
          }
        ]
      }
    ],
    margin: [0, 0, 0, 15] as [number, number, number, number]
  };

  return headerContent;
};
