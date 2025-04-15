
// Import the pdfMake library and font definitions
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";

// Register the virtual file system used by pdfMake
// We need to explicitly handle this as TypeScript doesn't recognize the pdfMake property
(pdfFonts as any).pdfMake = pdfMake;
pdfMake.vfs = (pdfFonts as any).pdfMake.vfs;

// Do not define custom fonts - use pdfMake's built-in Roboto font
// pdfMake automatically includes Roboto by default

// Define types for margin to match pdfmake expectations
export type PdfMargin = [number, number] | [number, number, number, number];

// Function to download PDF with better error handling
export const downloadPdf = (docDefinition: TDocumentDefinitions, filename: string) => {
  console.log("Downloading PDF with filename:", filename);
  try {
    // Ensure default font is set to Roboto if not specified
    if (!docDefinition.defaultStyle) {
      docDefinition.defaultStyle = { font: 'Roboto' };
    } else if (!docDefinition.defaultStyle.font) {
      docDefinition.defaultStyle.font = 'Roboto';
    }
    
    // Use a more robust approach to create and download the PDF
    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    
    pdfDocGenerator.getBlob((blob) => {
      try {
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);
        
        // Create a link element and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          console.log("PDF download completed successfully");
        }, 100);
      } catch (blobError) {
        console.error("Error in blob handling:", blobError);
        // Fallback to direct download if blob approach fails
        pdfDocGenerator.download(filename);
      }
    });
  } catch (error) {
    console.error("Error downloading PDF:", error);
    throw new Error(`PDF download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
