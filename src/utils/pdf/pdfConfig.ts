
// Import the pdfMake library and font definitions
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

// Register the virtual file system used by pdfMake
// We need to explicitly handle this as TypeScript doesn't recognize the pdfMake property
(pdfFonts as any).pdfMake = pdfMake;
pdfMake.vfs = (pdfFonts as any).pdfMake.vfs;

// Common styles for PDF documents
export const styles = {
  header: {
    fontSize: 20,
    bold: true,
    margin: [0, 0, 0, 10]
  },
  subheader: {
    fontSize: 16,
    bold: true,
    margin: [0, 10, 0, 5]
  },
  tableHeader: {
    bold: true,
    fontSize: 12,
    color: 'black',
    fillColor: '#f2f2f2'
  },
  itemsTable: {
    margin: [0, 5, 0, 15]
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
    margin: [0, 5, 0, 0],
    italics: true
  },
  tableHeaderCell: {
    fillColor: '#f2f2f2',
    bold: true,
    fontSize: 10,
    color: '#333',
    margin: [0, 5, 0, 5]
  },
  tableCell: {
    fontSize: 10,
    margin: [0, 3, 0, 3]
  },
  amountCell: {
    fontSize: 10,
    alignment: 'right',
    margin: [0, 3, 0, 3]
  },
  totalRow: {
    bold: true
  },
  grandTotalRow: {
    bold: true,
    fontSize: 11
  }
};

// Default footer for PDF pages
export const getPageFooter = () => {
  return function(currentPage: number, pageCount: number) {
    return {
      columns: [
        { 
          text: 'United Copiers - Your Complete Office Automation Partner', 
          alignment: 'left',
          fontSize: 8,
          color: '#666',
          margin: [40, 0, 0, 0]
        },
        { 
          text: `Page ${currentPage} of ${pageCount}`, 
          alignment: 'right',
          fontSize: 8,
          color: '#666',
          margin: [0, 0, 40, 0]
        }
      ],
      margin: [40, 0]
    };
  };
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
