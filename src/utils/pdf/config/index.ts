
import { downloadPdf } from "./pdfCore";
import { styles } from "./styles";
import { companyInfo } from "./companyInfo";

// Get the page footer for all PDF documents
const getPageFooter = () => {
  return function(currentPage: number, pageCount: number) {
    return {
      text: `Page ${currentPage} of ${pageCount}`,
      alignment: 'center',
      fontSize: 8,
      margin: [0, 10, 0, 0]
    };
  };
};

export {
  downloadPdf,
  styles,
  companyInfo,
  getPageFooter
};

export type PdfMargin = [number, number] | [number, number, number, number];
