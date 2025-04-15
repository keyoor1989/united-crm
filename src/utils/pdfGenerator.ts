
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
 * Validate required data fields
 * @param data - The data object to validate
 * @returns true if data is valid, false otherwise
 */
const validateData = <T>(data: T | null | undefined): data is T => {
  if (!data) {
    console.error('No data provided for PDF generation');
    return false;
  }
  return true;
};

/**
 * Execute the PDF generator function with a delay to ensure fonts are loaded
 * @param generator - The PDF generator function
 * @param data - The data to pass to the generator
 * @param errorCallback - Optional callback for error handling
 */
const executePdfGenerator = <T>(
  generator: PdfGeneratorFunction<T>, 
  data: T, 
  errorCallback?: ErrorCallback
): void => {
  console.log("Executing PDF generator with validated data");
  
  // Add a slight delay to ensure fonts are loaded before generating PDF
  setTimeout(() => {
    try {
      generator(data);
    } catch (generatorError) {
      const errorMessage = generatorError instanceof Error 
        ? generatorError.message 
        : 'Unknown error during PDF generation';
        
      console.error("Error in PDF generator function:", errorMessage);
      
      if (errorCallback) {
        errorCallback(generatorError as Error);
      } else {
        alert("Failed to generate PDF. Please try again.");
      }
    }
  }, 100);
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
    
    // Validate that data exists
    if (!validateData(data)) {
      throw new Error('No data provided for PDF generation');
    }
    
    // Validate and fix items array
    const validatedData = validateItemsArray(data);
    
    // Execute the PDF generator
    executePdfGenerator(generator, validatedData, errorCallback);
    
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error during PDF generation';
      
    console.error('PDF generation failed in safeGeneratePdf:', errorMessage);
    
    if (errorCallback) {
      errorCallback(error as Error);
    } else {
      alert("Failed to generate PDF. Please try again.");
    }
    
    return false;
  }
};

/**
 * Generates a PDF with basic error handling (simpler version)
 * @param generator - The PDF generator function to call
 * @param data - The data to pass to the generator
 * @param onSuccess - Optional callback for successful generation
 * @param onError - Optional callback for failed generation
 */
export const generatePdf = <T>(
  generator: PdfGeneratorFunction<T>,
  data: T,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): void => {
  try {
    generator(data);
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error("PDF generation error:", error);
    if (onError) onError(error as Error);
    else alert("Failed to generate PDF. Please try again.");
  }
};
