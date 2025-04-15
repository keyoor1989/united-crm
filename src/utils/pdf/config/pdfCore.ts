
// Import the pdfMake library and font definitions
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions } from "pdfmake/interfaces";

// Register the virtual file system used by pdfMake
// We need to explicitly handle this as TypeScript doesn't recognize the pdfMake property
(pdfFonts as any).pdfMake = pdfMake;
pdfMake.vfs = (pdfFonts as any).pdfMake.vfs;

// Define types for margin to match pdfmake expectations
export type PdfMargin = [number, number] | [number, number, number, number];

// Function to download PDF
export const downloadPdf = (docDefinition: TDocumentDefinitions, filename: string) => {
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
