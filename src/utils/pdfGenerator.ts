
// Export all PDF generator functions from their respective files
export { generateQuotationPdf } from './pdf/quotationPdfGenerator';
export { generatePurchaseOrderPdf } from './pdf/purchaseOrderPdfGenerator';

// Add a generic error handler for PDF generation
export const safeGeneratePdf = (generator: Function, data: any, errorCallback?: (error: Error) => void) => {
  try {
    // Validate that data exists
    if (!data) {
      throw new Error('No data provided for PDF generation');
    }
    
    // Ensure data.items is an array if it exists
    if (data && data.items) {
      data.items = Array.isArray(data.items) 
        ? data.items 
        : (typeof data.items === 'string' ? JSON.parse(data.items) : []);
    }
    
    // Check if we have a valid items array now
    if (data.items && !Array.isArray(data.items)) {
      throw new Error('Invalid items format: could not convert to array');
    }
    
    return generator(data);
  } catch (error) {
    console.error('PDF generation failed:', error);
    if (errorCallback) {
      errorCallback(error as Error);
    }
    // Return a default value or error indication
    return null;
  }
};
