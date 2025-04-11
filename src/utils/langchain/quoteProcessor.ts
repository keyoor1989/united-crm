
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Quotation } from "@/types/sales";
import { CustomerType } from "@/types/customer";

// Initialize the model with the API key
const getLanguageModel = (apiKey: string) => {
  return new ChatOpenAI({
    openAIApiKey: apiKey,
    modelName: "gpt-3.5-turbo",
    temperature: 0.2,
  });
};

// Create a prompt template for quotation generation
const quotationPromptTemplate = PromptTemplate.fromTemplate(`
You are a professional sales assistant for a copier business. Format the following quotation details in a clean, professional manner:

Customer: {customerName}
Location: {customerLocation}
Contact: {customerContact}
Product: {productName}
Configuration: {configuration}
Price: ₹{price}
GST: {gstPercent}%
Total Amount: ₹{totalAmount}
Delivery Time: {deliveryTime}
Warranty: {warranty}

Create a professional and concise quotation message that highlights the key details. Include emojis where appropriate.
`);

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
    if (!apiKey) {
      console.error("No OpenAI API key provided for LangChain");
      return `Quotation for ${productName} prepared for ${customerName} at ₹${price.toLocaleString('en-IN')} + ${gstPercent}% GST. Delivery in ${deliveryTime}. ${warranty} warranty included.`;
    }
    
    const totalAmount = price + (price * gstPercent / 100);
    
    const model = getLanguageModel(apiKey);
    const outputParser = new StringOutputParser();
    
    const chain = quotationPromptTemplate
      .pipe(model)
      .pipe(outputParser);
    
    const result = await chain.invoke({
      customerName: customerName,
      customerLocation: customerLocation,
      customerContact: customerContact,
      productName: productName,
      configuration: configuration,
      price: price.toLocaleString('en-IN'),
      gstPercent: gstPercent.toString(), // Convert number to string
      totalAmount: totalAmount.toLocaleString('en-IN'),
      deliveryTime: deliveryTime,
      warranty: warranty,
    });
    
    return result;
  } catch (error) {
    console.error("Error generating quotation with LangChain:", error);
    // Fallback to a simple format if LangChain processing fails
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
