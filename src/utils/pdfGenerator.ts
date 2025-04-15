
// Export all PDF generator functions from their respective files
export { generateQuotationPdf } from './pdf/quotationPdfGenerator';
export { generatePurchaseOrderPdf } from './pdf/purchaseOrderPdfGenerator';

// Type for PDF generator callback function
type PdfGeneratorFunction<T> = (data: T) => void;
type ErrorCallback = (error: Error) => void;

/**
 * Validates that items property is a proper array
 * @param data - The data object to validate
 * @returns The data object with validated items property
 */
const validateItemsArray = <T extends { items?: any }>(data: T): T => {
  const result = { ...data };
  
  if (result.items) {
    console.log("Validating items array with type:", typeof result.items);
    
    // Handle items if it's a string (parse to JSON)
    if (typeof result.items === 'string') {
      try {
        console.log("Items is a string, attempting to parse");
        result.items = JSON.parse(result.items);
      } catch (error) {
        console.error("Failed to parse items string:", error);
        console.log("Fallback: creating empty items array");
        result.items = [];
      }
    }
    
    // Ensure items is an array
    if (!Array.isArray(result.items)) {
      console.error("Items is not an array after processing:", result.items);
      result.items = [];
    } else {
      console.log("Items array is valid with length:", result.items.length);
    }
  } else {
    console.log("No items property found, initializing empty array");
    result.items = [];
  }
  
  return result;
};

/**
 * Safely generates a PDF, handling data validation and errors
 * @param generator - The PDF generator function
 * @param data - The data to pass to the generator
 * @param errorCallback - Optional callback for error handling
 * @returns boolean indicating success or failure
 */
export const safeGeneratePdf = <T extends { items?: any }>(
  generator: PdfGeneratorFunction<T>, 
  data: T, 
  errorCallback?: ErrorCallback
): boolean => {
  try {
    console.log("SafeGeneratePdf called with data:", JSON.stringify({
      hasData: !!data,
      hasItems: !!data?.items,
      itemsType: data?.items ? typeof data.items : 'undefined',
      itemsIsArray: data?.items ? Array.isArray(data.items) : false,
      itemsLength: data?.items && Array.isArray(data.items) ? data.items.length : 'N/A'
    }));
    
    // Validate and fix items array
    const validatedData = validateItemsArray(data);
    
    // Execute the PDF generator with a slight delay to ensure fonts are loaded
    setTimeout(() => {
      try {
        generator(validatedData);
      } catch (generatorError) {
        console.error("Error in PDF generator function:", generatorError);
        
        if (errorCallback) {
          errorCallback(generatorError as Error);
        } else {
          alert("Failed to generate PDF. Please try again.");
        }
      }
    }, 100);
    
    return true;
  } catch (error) {
    console.error('PDF generation failed in safeGeneratePdf:', error);
    
    if (errorCallback) {
      errorCallback(error as Error);
    } else {
      alert("Failed to generate PDF. Please try again.");
    }
    
    return false;
  }
};
