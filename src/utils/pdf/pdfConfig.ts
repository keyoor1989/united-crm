
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { Alignment } from "pdfmake/interfaces";

// Register the virtual file system with pdfMake
// Handle different possible structures of pdfFonts
pdfMake.vfs = (pdfFonts as any).pdfMake?.vfs || (pdfFonts as any).vfs;

// Define fonts for the document
pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  }
};

// Logo image path (served from public folder)
export const logoImagePath = "/lovable-uploads/6ee98dbf-b695-4632-976f-50c50bb67d59.png";

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

// Common page footer function
export const getPageFooter = () => {
  return function(currentPage: number, pageCount: number) {
    return {
      columns: [
        { 
          text: companyInfo.tagline,
          alignment: 'center' as Alignment,
          margin: [40, 0, 40, 0] as [number, number, number, number],
          fontSize: 8,
          color: '#333333',
          italics: true
        }
      ]
    };
  };
};

// Export pdf utility for download
export const downloadPdf = (docDefinition: any, fileName: string) => {
  try {
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.download(fileName);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
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
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  
  let result = '';
  
  // Convert rupees part
  if (rupees > 0) {
    let crore = Math.floor(rupees / 10000000);
    rupees %= 10000000;
    
    let lakh = Math.floor(rupees / 100000);
    rupees %= 100000;
    
    let thousand = Math.floor(rupees / 1000);
    rupees %= 1000;
    
    let hundred = Math.floor(rupees / 100);
    rupees %= 100;
    
    let ten = rupees;
    
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
  }
  
  // Convert paise part
  if (paise > 0) {
    result += ' and ' + formatTens(paise) + ' Paise';
  }
  
  return result + ' Only';
};
