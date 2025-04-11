
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Register the virtual file system with pdfMake
pdfMake.vfs = (pdfFonts as any).vfs;

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

// Common PDF styling
export const styles = {
  header: {
    fontSize: 22,
    bold: true,
    color: '#0047AB', // Royal blue color for header
    alignment: 'center',
    margin: [0, 10, 0, 20] as [number, number, number, number]
  },
  subheader: {
    fontSize: 16,
    bold: true,
    margin: [0, 10, 0, 5] as [number, number, number, number]
  },
  companyName: {
    fontSize: 16,
    bold: true,
    color: '#0047AB'
  },
  companyAddress: {
    fontSize: 10,
    color: '#333333'
  },
  companyContact: {
    fontSize: 10,
    color: '#333333'
  },
  sectionTitle: {
    fontSize: 12,
    bold: true
  },
  tableHeader: {
    bold: true,
    fontSize: 12,
    color: 'white',
    fillColor: '#0047AB',
    alignment: 'center'
  },
  tableRow: {
    fontSize: 10
  },
  tableRowEven: {
    fontSize: 10,
    fillColor: '#f2f2f2'
  },
  termsHeader: {
    fontSize: 14,
    bold: true,
    margin: [0, 15, 0, 5] as [number, number, number, number]
  },
  termsList: {
    fontSize: 10,
    margin: [0, 2, 0, 2] as [number, number, number, number]
  },
  footer: {
    fontSize: 10,
    italic: true,
    alignment: 'center',
    color: '#0047AB',
    margin: [0, 10, 0, 0] as [number, number, number, number]
  }
};

// Company information data
export const companyInfo = {
  name: 'United Copier',
  address: '118, Jaora Compound, Indore',
  contact: '81033-49299, 93003-00345',
  tagline: 'United Copier - All Solutions Under A Roof for Printers'
};

// Common page footer function
export const getPageFooter = () => {
  return function(currentPage: number, pageCount: number) {
    return {
      columns: [
        { 
          text: companyInfo.tagline,
          alignment: 'center',
          margin: [40, 0, 40, 0],
          fontSize: 8,
          color: '#0047AB',
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
