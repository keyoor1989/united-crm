
// Import the pdfMake library and font definitions
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

// Register the virtual file system used by pdfMake
// We need to explicitly handle this as TypeScript doesn't recognize the pdfMake property
(pdfFonts as any).pdfMake = pdfMake;
pdfMake.vfs = (pdfFonts as any).pdfMake.vfs;

// Define types for margin to match pdfmake expectations
type PdfMargin = [number, number] | [number, number, number, number];

// Common styles for PDF documents
export const styles = {
  header: {
    fontSize: 20,
    bold: true,
    margin: [0, 0, 0, 10] as PdfMargin
  },
  subheader: {
    fontSize: 16,
    bold: true,
    margin: [0, 10, 0, 5] as PdfMargin
  },
  tableHeader: {
    bold: true,
    fontSize: 12,
    color: 'black',
    fillColor: '#f2f2f2'
  },
  itemsTable: {
    margin: [0, 5, 0, 15] as PdfMargin
  },
  infoLabel: {
    bold: true,
    width: '30%'
  },
  infoValue: {
    width: '70%'
  },
  notes: {
    fontSize: 10,
    margin: [0, 5, 0, 0] as PdfMargin,
    italics: true
  },
  tableHeaderCell: {
    fillColor: '#f2f2f2',
    bold: true,
    fontSize: 10,
    color: '#333',
    margin: [0, 5, 0, 5] as PdfMargin
  },
  tableCell: {
    fontSize: 10,
    margin: [0, 3, 0, 3] as PdfMargin
  },
  amountCell: {
    fontSize: 10,
    alignment: 'right',
    margin: [0, 3, 0, 3] as PdfMargin
  },
  totalRow: {
    bold: true
  },
  grandTotalRow: {
    bold: true,
    fontSize: 11
  }
};

// Define the page footer as a function that conforms to pdfMake's expected type
export const getPageFooter = () => {
  return function(currentPage: number, pageCount: number) {
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

// Add missing exports that are imported in contentSections.ts
export const logoBase64 = ""; // Add your logo base64 string here if needed
export const companyInfo = {
  name: "United Copiers",
  address: "Your Company Address",
  phone: "Your Phone Number",
  email: "your@email.com",
  website: "www.yourwebsite.com"
};

// Helper function for number to words conversion
export const numberToWords = (num: number): string => {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const convertLessThanOneThousand = (n: number): string => {
    if (n === 0) return '';
    
    let result = '';
    
    if (n < 10) {
      result = units[n];
    } else if (n < 20) {
      result = teens[n - 10];
    } else if (n < 100) {
      result = tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    } else {
      result = units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertLessThanOneThousand(n % 100) : '');
    }
    
    return result;
  };
  
  if (num === 0) return 'Zero';
  
  let result = '';
  let n = num;
  
  if (n < 0) {
    result = 'Negative ';
    n = Math.abs(n);
  }
  
  if (n < 1000) {
    result += convertLessThanOneThousand(n);
  } else if (n < 1000000) {
    result += convertLessThanOneThousand(Math.floor(n / 1000)) + ' Thousand';
    if (n % 1000 !== 0) result += ' ' + convertLessThanOneThousand(n % 1000);
  } else {
    result += convertLessThanOneThousand(Math.floor(n / 1000000)) + ' Million';
    if ((n % 1000000) !== 0) result += ' ' + convertLessThanOneThousand(Math.floor((n % 1000000) / 1000)) + ' Thousand';
    if (n % 1000 !== 0) result += ' ' + convertLessThanOneThousand(n % 1000);
  }
  
  return result;
};

// Function to download PDF
export const downloadPdf = (docDefinition: any, filename: string) => {
  console.log("Downloading PDF with filename:", filename);
  try {
    // Create buffer and download
    pdfMake.createPdf(docDefinition).download(filename);
    console.log("PDF download initiated successfully");
  } catch (error) {
    console.error("Error downloading PDF:", error);
    throw new Error(`PDF download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
