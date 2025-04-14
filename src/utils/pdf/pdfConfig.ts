
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions, Content, Alignment, DynamicContent } from "pdfmake/interfaces";

// Register the default fonts
pdfMake.vfs = pdfFonts.vfs;

// Base64 encoded logo to avoid URL loading issues
// This is a placeholder - we'll use a fallback text header if image fails
export const logoBase64 = "data:image/png;base64,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";

// Company information data
export const companyInfo = {
  name: 'United Copier',
  address: '118, Jaora Compound, Indore',
  contact: '81033-49299, 93003-00345',
  email: 'unitedcopier@gmail.com',
  gstin: '23ABCDE1234F1Z5',
  bankName: 'HDFC Bank',
  accountNo: '50100123456789',
  ifsc: 'HDFC0001234',
  branch: 'Indore',
  tagline: 'United Copier - All Solutions Under A Roof for Printers'
};

// Common PDF styling
export const styles = {
  header: {
    fontSize: 18,
    bold: true,
    color: '#333333',
    alignment: 'right' as Alignment,
    margin: [0, 5, 0, 10] as [number, number, number, number]
  },
  subheader: {
    fontSize: 14,
    bold: true,
    margin: [0, 5, 0, 5] as [number, number, number, number]
  },
  companyName: {
    fontSize: 14,
    bold: true,
    color: '#333333'
  },
  companyAddress: {
    fontSize: 9,
    color: '#333333'
  },
  companyContact: {
    fontSize: 9,
    color: '#333333'
  },
  gstin: {
    fontSize: 9,
    bold: true,
    color: '#333333'
  },
  sectionTitle: {
    fontSize: 10,
    bold: true
  },
  tableHeader: {
    bold: true,
    fontSize: 10,
    color: '#333333',
    fillColor: '#f2f2f2',
    alignment: 'center' as Alignment
  },
  tableRow: {
    fontSize: 9
  },
  tableRowEven: {
    fontSize: 9,
    fillColor: '#ffffff'
  },
  termsHeader: {
    fontSize: 11,
    bold: true,
    margin: [0, 10, 0, 5] as [number, number, number, number]
  },
  termsList: {
    fontSize: 9,
    margin: [0, 2, 0, 2] as [number, number, number, number]
  },
  footer: {
    fontSize: 9,
    italic: true,
    alignment: 'center' as Alignment,
    color: '#333333',
    margin: [0, 10, 0, 0] as [number, number, number, number]
  },
  bankDetails: {
    fontSize: 9,
    margin: [0, 5, 0, 0] as [number, number, number, number]
  },
  bankDetailsHeader: {
    fontSize: 9,
    bold: true,
    margin: [0, 5, 0, 2] as [number, number, number, number]
  },
  amountInWords: {
    fontSize: 9,
    italics: true,
    margin: [0, 2, 0, 5] as [number, number, number, number]
  }
};

// Define the correct return type for the page footer function
export type PageFooterFunction = (currentPage: number, pageCount: number) => Content;

// Common page footer function with the correct return type
export const getPageFooter = (): PageFooterFunction => {
  return function(currentPage: number, pageCount: number): Content {
    return {
      columns: [
        { 
          text: companyInfo.tagline,
          alignment: 'center',
          margin: [40, 0, 40, 0],
          fontSize: 8,
          color: '#333333',
          italics: true
        }
      ]
    };
  };
};

// Export pdf utility for download - fixed function with proper Promise handling
export const downloadPdf = (docDefinition: TDocumentDefinitions, fileName: string) => {
  try {
    console.log("downloadPdf called with fileName:", fileName);
    
    // Create the PDF document
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    
    // Download the PDF using the correct API
    pdfDocGenerator.download(fileName);
    console.log("PDF download initiated successfully");

  } catch (error) {
    console.error("Fatal error in downloadPdf:", error);
    alert("There was an error generating the PDF. Please try again.");
  }
};

// Convert number to words (for amount in words)
export const numberToWords = (num: number): string => {
  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const formatTens = (num: number): string => {
    if (num < 10) return single[num];
    else if (num < 20) return double[num - 10];
    else {
      return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + single[num % 10] : '');
    }
  };

  if (num === 0) return 'Zero';

  // Handle decimals
  const totalAmount = Number(num.toFixed(2)); // Ensure precise decimal handling
  const rupees = Math.floor(totalAmount);
  const paise = Math.round((totalAmount - rupees) * 100);
  
  let result = '';
  
  // Convert rupees part
  let remainingRupees = rupees;
  
  let crore = Math.floor(remainingRupees / 10000000);
  remainingRupees %= 10000000;
  
  let lakh = Math.floor(remainingRupees / 100000);
  remainingRupees %= 100000;
  
  let thousand = Math.floor(remainingRupees / 1000);
  remainingRupees %= 1000;
  
  let hundred = Math.floor(remainingRupees / 100);
  remainingRupees %= 100;
  
  let ten = remainingRupees;
  
  if (crore > 0) {
    result += formatTens(crore) + ' Crore ';
  }
  
  if (lakh > 0) {
    result += formatTens(lakh) + ' Lakh ';
  }
  
  if (thousand > 0) {
    result += formatTens(thousand) + ' Thousand ';
  }
  
  if (hundred > 0) {
    result += single[hundred] + ' Hundred ';
  }
  
  if (ten > 0) {
    result += formatTens(ten);
  }
  
  result += ' Rupees';
  
  // Convert paise part
  if (paise > 0) {
    result += ' and ' + formatTens(paise) + ' Paise';
  }
  
  return result + ' Only';
};
