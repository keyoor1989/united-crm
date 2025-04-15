
import { Content } from "pdfmake/interfaces";
import { PdfMargin } from "./pdfCore";

// Define the page footer as a function that conforms to pdfMake's expected type
export const getPageFooter = () => {
  return function(currentPage: number, pageCount: number): Content {
    return {
      columns: [
        { 
          text: 'United Copiers - Your Complete Office Automation Partner', 
          alignment: 'left',
          fontSize: 8,
          color: '#666',
          margin: [40, 0, 0, 0] as PdfMargin
        },
        { 
          text: `Page ${currentPage} of ${pageCount}`, 
          alignment: 'right',
          fontSize: 8,
          color: '#666',
          margin: [0, 0, 40, 0] as PdfMargin
        }
      ],
      margin: [40, 0] as PdfMargin
    };
  };
};
