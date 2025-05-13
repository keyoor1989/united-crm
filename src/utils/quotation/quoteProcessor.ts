
import { Quotation } from "@/types/sales";
import { CustomerType } from "@/types/customer";

// Simple function to generate a quotation description without LangChain
export const generateQuotationDescription = async (
  apiKey: string,
  customerName: string,
  customerLocation: string = "N/A",
  customerContact: string = "N/A",
  productName: string,
  configuration: string = "Standard",
  price: number,
  gstPercent: number = 18,
  deliveryTime: string = "7-10 days",
  warranty: string = "1 Year onsite"
): Promise<string> => {
  try {
    // Calculate total amount
    const totalAmount = price + (price * gstPercent / 100);
    
    // If there's an API key, we could use it for other AI services in the future
    // For now, return a formatted description string
    return `📄 *Quotation for ${customerName}*

📦 Product: ${productName}
⚙️ Configuration: ${configuration}
💰 Price: ₹${price.toLocaleString('en-IN')}
🏷️ GST: ${gstPercent}%
💵 Total Amount: ₹${totalAmount.toLocaleString('en-IN')}
🚚 Delivery Time: ${deliveryTime}
🛡️ Warranty: ${warranty}

Thank you for your interest in our product. This quotation is valid for 15 days.`;
  } catch (error) {
    console.error("Error generating quotation:", error);
    // Fallback to a simple format if processing fails
    return `Quotation for ${productName} prepared for ${customerName} at ₹${price.toLocaleString('en-IN')} + ${gstPercent}% GST. Delivery in ${deliveryTime}. ${warranty} warranty included.`;
  }
};

export const processQuotationRequest = async (
  openAIApiKey: string,
  quotation: Quotation,
  customer?: CustomerType
): Promise<string> => {
  try {
    const mainProduct = quotation.items[0];
    
    return await generateQuotationDescription(
      openAIApiKey,
      quotation.customerName,
      customer?.location || "N/A",
      customer?.phone || "N/A",
      mainProduct.name,
      mainProduct.description || "Standard Configuration",
      mainProduct.unitPrice,
      mainProduct.gstPercent,
      "2-3 days", // You can customize this based on your business logic
      "1 Year onsite warranty"
    );
  } catch (error) {
    console.error("Error in processQuotationRequest:", error);
    return `Quotation #${quotation.quotationNumber} for ${quotation.customerName} has been prepared. Total amount: ₹${quotation.grandTotal.toLocaleString('en-IN')}`;
  }
};
