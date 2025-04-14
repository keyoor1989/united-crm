
// Export all PDF generator functions from their respective files
export { generateQuotationPdf } from './pdf/quotationPdfGenerator';
export { generatePurchaseOrderPdf } from './pdf/purchaseOrderPdfGenerator';

// Add a generic error handler for PDF generation
export const safeGeneratePdf = (generator: Function, data: any, errorCallback?: (error: Error) => void) => {
  try {
    console.log("SafeGeneratePdf called with data:", JSON.stringify({
      hasData: !!data,
      hasItems: !!data?.items,
      itemsType: data?.items ? typeof data.items : 'undefined',
      itemsIsArray: data?.items ? Array.isArray(data.items) : false,
      itemsLength: data?.items && Array.isArray(data.items) ? data.items.length : 'N/A'
    }));
    
    // Validate that data exists
    if (!data) {
      throw new Error('No data provided for PDF generation');
    }
    
    // Ensure data.items is an array if it exists
    if (data && data.items) {
      if (typeof data.items === 'string') {
        try {
          console.log("Items is a string, attempting to parse:", data.items);
          data.items = JSON.parse(data.items);
        } catch (error) {
          console.error("Failed to parse items string:", error);
          console.log("Fallback: creating empty items array");
          data.items = [];
        }
      }
      
      // Check if we have a valid items array now
      if (!Array.isArray(data.items)) {
        console.error("Items is still not an array after processing:", data.items);
        console.log("Initializing empty items array");
        data.items = [];
      } else {
        console.log("Items array is valid with length:", data.items.length);
      }
    } else {
      console.log("No items property found, initializing empty array");
      data.items = [];
    }
    
    console.log("Calling PDF generator with validated data");
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
