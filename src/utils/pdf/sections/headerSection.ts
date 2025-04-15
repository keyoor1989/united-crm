
import { Content } from "pdfmake/interfaces";
import { logoBase64, companyInfo } from "../pdfConfig";

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
