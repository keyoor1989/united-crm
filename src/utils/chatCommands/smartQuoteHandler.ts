
import { Message } from "@/components/chat/types/chatTypes";
import { parseQuotationCommand, generateQuotationPrompt } from "./quotationParser";
import { products } from "@/data/salesData";
import { supabase } from "@/integrations/supabase/client";
import { CustomerType } from "@/types/customer";
import { Quotation } from "@/types/sales";
import { findCustomerByPhone } from "./customerLookupParser";

interface QuoteHandlerProps {
  message: string;
  addMessageToChat: (message: Message) => void;
  processAIRequest: (prompt: string) => Promise<string | null>;
  onCompleteQuotation: (quotation: Quotation) => void;
  customers: CustomerType[];
}

export const handleQuotationCommand = async ({
  message,
  addMessageToChat,
  processAIRequest,
  onCompleteQuotation,
  customers
}: QuoteHandlerProps) => {
  // Parse the quotation command
  const parsedQuotation = parseQuotationCommand(message);
  
  // Check if we have a valid quotation request
  if (parsedQuotation.models.length === 0) {
    // No product models found in the command
    addMessageToChat({
      id: `msg-${Date.now()}-bot`,
      content: "I couldn't identify a product in your request. Please specify a model like 'Kyocera 2554ci' or 'Canon IR 2525'.",
      sender: "bot",
      timestamp: new Date(),
    });
    return false;
  }
  
  // Let's check if we have customer information
  if (!parsedQuotation.customerName) {
    // No customer name found in the command
    addMessageToChat({
      id: `msg-${Date.now()}-bot`,
      content: "Please specify a customer name for the quotation. Example: 'Generate quotation for Kyocera 2554ci for Mr. Rajesh'",
      sender: "bot",
      timestamp: new Date(),
    });
    return false;
  }
  
  // Check if the customer exists in the database
  let customerFromDb: CustomerType | null = null;
  const matchingCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(parsedQuotation.customerName!.toLowerCase())
  );
  
  if (matchingCustomers.length === 1) {
    customerFromDb = matchingCustomers[0];
  }
  
  // Get the product details
  const product = parsedQuotation.models[0];
  
  // Try to find a corresponding product in the database
  const productDb = product.productId 
    ? products.find(p => p.id === product.productId)
    : products.find(p => p.name.toLowerCase().includes(product.model.toLowerCase()));
  
  if (!productDb) {
    // Product not found
    addMessageToChat({
      id: `msg-${Date.now()}-bot`,
      content: `I couldn't find the product "${product.model}" in our database. Please check the model name or use a different product.`,
      sender: "bot",
      timestamp: new Date(),
    });
    return false;
  }
  
  // We have enough information to generate a quotation
  
  // Default product price and GST
  const productPrice = 115000; // Default price
  const gstPercentage = 18; // Default GST percentage
  
  // Customer city and mobile - use defaults if not available
  const customerCity = customerFromDb?.area || "N/A";
  const customerMobile = customerFromDb?.phone || "N/A";
  
  // Generate the configuration description
  const configuration = "Duplex + ADF"; // Default configuration
  
  // Generate Claude prompt for the quotation
  const claudePrompt = generateQuotationPrompt(
    parsedQuotation.customerName,
    customerCity,
    customerMobile,
    productDb.name,
    configuration,
    productPrice,
    gstPercentage,
    "2-3 days" // Delivery time
  );
  
  // Process the prompt with Claude
  const claudeResponse = await processAIRequest(claudePrompt);
  
  if (!claudeResponse) {
    // Error getting response from Claude
    addMessageToChat({
      id: `msg-${Date.now()}-bot`,
      content: "I'm sorry, I couldn't generate the quotation at this time. Please try again later.",
      sender: "bot",
      timestamp: new Date(),
    });
    return false;
  }
  
  // Add the Claude response to the chat
  addMessageToChat({
    id: `msg-${Date.now()}-bot`,
    content: (
      <>
        <p className="mb-2">I've prepared a quotation based on your request:</p>
        <div className="border-l-4 border-primary/40 pl-4 py-1 whitespace-pre-line">
          {claudeResponse}
        </div>
        <div className="mt-4">
          <button 
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors inline-flex items-center"
            onClick={() => {
              // Create a quotation object and generate PDF
              const quotation: Quotation = {
                id: Math.random().toString(36).substring(2, 9),
                quotationNumber: `Q${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                customerId: customerFromDb?.id || "",
                customerName: parsedQuotation.customerName!,
                items: [
                  {
                    id: Math.random().toString(36).substring(2, 9),
                    productId: productDb.id,
                    name: productDb.name,
                    description: `${productDb.name} with ${configuration}`,
                    category: productDb.category,
                    specs: productDb.specs,
                    quantity: product.quantity,
                    unitPrice: productPrice,
                    gstPercent: gstPercentage,
                    gstAmount: (productPrice * gstPercentage) / 100 * product.quantity,
                    total: (productPrice + (productPrice * gstPercentage) / 100) * product.quantity,
                    isCustomItem: false
                  }
                ],
                subtotal: productPrice * product.quantity,
                totalGst: (productPrice * gstPercentage) / 100 * product.quantity,
                grandTotal: (productPrice + (productPrice * gstPercentage) / 100) * product.quantity,
                createdAt: new Date().toISOString().split('T')[0],
                validUntil: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0],
                status: "Draft",
                notes: "",
                terms: "Payment terms: 50% advance, 50% on delivery.\nDelivery within 2-3 days after confirmation."
              };

              // Call onCompleteQuotation to handle the quotation
              onCompleteQuotation(quotation);
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            Confirm & Create PDF Quotation
          </button>
        </div>
      </>
    ),
    sender: "bot",
    timestamp: new Date(),
  });
  
  return true;
};
