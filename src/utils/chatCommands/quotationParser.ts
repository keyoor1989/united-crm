
import { products } from "@/data/salesData";

// Interface for parsed quotation request
export interface ParsedQuotationRequest {
  models: {
    model: string;
    productId?: string;
    quantity: number;
  }[];
  customerName?: string;
}

/**
 * Parse quotation command from a message
 * Examples:
 * - "Generate quotation for Kyocera 2554ci"
 * - "Send quote for Canon IR 2525 to Mr. Rahul"
 * - "Make quotation for 3 machines: Kyocera 2554ci, Ricoh 2014D, Sharp 261"
 */
export const parseQuotationCommand = (message: string): ParsedQuotationRequest => {
  const result: ParsedQuotationRequest = {
    models: []
  };
  
  // Convert to lowercase for easier matching
  const lowerMessage = message.toLowerCase();
  
  // Extract customer name if present
  const customerMatch = lowerMessage.match(/(?:to|for)\s+(?:mr\.|mrs\.|ms\.)?\s*([a-z\s]+)(?:$|[,.;])/i);
  if (customerMatch && customerMatch[1]) {
    // Capitalize the first letter of each word in the customer name
    result.customerName = customerMatch[1].trim().split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Check for multiple machines format
  if (lowerMessage.includes('machines:') || lowerMessage.includes('models:')) {
    const modelsListMatch = message.match(/(?:machines|models):\s*(.+)(?:$|[,.;])/i);
    if (modelsListMatch && modelsListMatch[1]) {
      const modelsList = modelsListMatch[1].split(',');
      
      modelsList.forEach(modelItem => {
        // Check if quantity is specified
        const quantityMatch = modelItem.match(/(\d+)\s*x\s*(.+)/i);
        
        if (quantityMatch) {
          // Format with quantity specified: "3 x Kyocera 2554ci"
          const quantity = parseInt(quantityMatch[1]);
          const modelName = quantityMatch[2].trim();
          
          // Try to find matching product
          const matchedProduct = findMatchingProduct(modelName);
          
          result.models.push({
            model: modelName,
            productId: matchedProduct?.id,
            quantity
          });
        } else {
          // Standard format: just the model name
          const modelName = modelItem.trim();
          
          // Try to find matching product
          const matchedProduct = findMatchingProduct(modelName);
          
          result.models.push({
            model: modelName,
            productId: matchedProduct?.id,
            quantity: 1
          });
        }
      });
    }
  } else {
    // Single machine format
    // Extract model name - look for patterns like "for Kyocera 2554ci" or "for 2 Kyocera 2554ci"
    const modelMatch = message.match(/for\s+(?:(\d+)\s+)?([a-z0-9\s]+\d+[a-z0-9\s]*)/i);
    
    if (modelMatch) {
      const quantity = modelMatch[1] ? parseInt(modelMatch[1]) : 1;
      const modelName = modelMatch[2].trim();
      
      // Try to find matching product
      const matchedProduct = findMatchingProduct(modelName);
      
      result.models.push({
        model: modelName,
        productId: matchedProduct?.id,
        quantity
      });
    }
  }
  
  return result;
};

/**
 * Generate a quotation prompt template for Claude
 */
export const generateQuotationPrompt = (
  customerName: string, 
  customerCity: string = "N/A",
  customerMobile: string = "N/A",
  productName: string,
  configuration: string = "Standard",
  rate: number,
  gstPercent: number = 18,
  deliveryTime: string = "7-10 days"
): string => {
  // Calculate GST amount and final price
  const gstAmount = (rate * gstPercent) / 100;
  const finalPrice = rate + gstAmount;
  
  // Format numbers with commas for Indian currency format
  const formattedRate = rate.toLocaleString('en-IN');
  const formattedFinalPrice = finalPrice.toLocaleString('en-IN');
  
  return `
Please help summarize the following quotation details in a short professional format:

Customer Name: ${customerName}
City: ${customerCity}
Mobile: ${customerMobile}

Product: ${productName}
Configuration: ${configuration}
Rate: ₹${formattedRate}
GST: ${gstPercent}%
Final Price with GST: ₹${formattedFinalPrice}
Delivery Time: ${deliveryTime}
Warranty: 1 Year onsite

Summarize this for sharing with the customer in a quote-style message. Keep it short, clean, and business-friendly.
`;
};

/**
 * Try to find a matching product from the product catalog
 */
const findMatchingProduct = (modelName: string) => {
  // Convert model name to lowercase for matching
  const lowerModelName = modelName.toLowerCase();
  
  // Try to find an exact match first
  return products.find(product => 
    product.name.toLowerCase() === lowerModelName ||
    product.name.toLowerCase().includes(lowerModelName) ||
    lowerModelName.includes(product.name.toLowerCase())
  );
};
