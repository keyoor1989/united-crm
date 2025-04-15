
import { Content, Alignment } from "pdfmake/interfaces";
import { logoBase64, companyInfo } from "../config";

// Create document header with logo and company info
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
          { text: `GSTIN: ${companyInfo.gstin}`, style: 'gstin', margin: [0, 2, 0, 0] }
        ]
      },
      // Right side with title and conditionally the logo
      {
        width: '35%',
        stack: [
          // Only include the image if logoBase64 is not empty
          ...(logoBase64 ? [{
            image: logoBase64,
            width: 150,
            alignment: 'right' as Alignment,
            margin: [0, 0, 0, 5]
          }] : []),
          {
            text: title,
            style: 'header'
          }
        ]
      }
    ],
    margin: [0, 0, 0, 15]
  };

  return headerContent;
};
