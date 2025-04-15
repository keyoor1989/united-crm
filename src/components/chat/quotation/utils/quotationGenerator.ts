
import { Product, Quotation, QuotationItem as DatabaseQuotationItem } from "@/types/sales";
import { generateQuotationNumber, createQuotationItem } from "@/data/salesData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface QuotationItem {
  model: string;
  productId: string;
  product: Product | null;
  quantity: number;
  unitPrice: number;
}

export const createQuotationObject = (
  items: QuotationItem[], 
  customerId: string, 
  customerName: string
): Quotation => {
  // Calculate totals
  let subtotal = 0;
  let totalGst = 0;
  
  // Create quotation items
  const quotationItems = items.map(item => {
    if (!item.product && item.productId) {
      // Find the product if not already attached
      const product = require('@/data/salesData').products.find((p: Product) => p.id === item.productId) || null;
      item.product = product;
    }
    
    const quotationItem = createQuotationItem(
      item.product,
      item.quantity,
      item.unitPrice,
      !item.product, // isCustomItem if no product found
      item.product ? undefined : item.model, // use model as name for custom items
      item.product ? undefined : `${item.model} Printer/Copier`, // default description for custom items
      "Copier"
    );
    
    subtotal += item.quantity * item.unitPrice;
    totalGst += quotationItem.gstAmount;
    
    return quotationItem;
  });
  
  // Create quotation object
  const today = new Date();
  const validUntil = new Date();
  validUntil.setDate(today.getDate() + 15);
  
  const quotation: Quotation = {
    id: Math.random().toString(36).substring(2, 9),
    quotationNumber: generateQuotationNumber(),
    customerId: customerId || Math.random().toString(36).substring(2, 9),
    customerName: customerName,
    items: quotationItems,
    subtotal: subtotal,
    totalGst: totalGst,
    grandTotal: subtotal + totalGst,
    createdAt: today.toISOString().split('T')[0],
    validUntil: validUntil.toISOString().split('T')[0],
    status: "Draft",
    notes: "",
    terms: "Payment terms: 50% advance, 50% on delivery.\nDelivery within 7-10 working days after confirmation."
  };
  
  return quotation;
};

export const saveQuotationToDatabase = async (
  quotation: Quotation, 
  customerId: string
): Promise<boolean> => {
  try {
    // Convert quotationItems to a JSON-compatible format
    const jsonItems = JSON.stringify(quotation.items);
    
    // Insert a single record instead of an array
    const { error } = await supabase
      .from('quotations')
      .insert({
        quotation_number: quotation.quotationNumber,
        customer_id: customerId,
        customer_name: quotation.customerName,
        items: jsonItems as unknown as Json,
        subtotal: quotation.subtotal,
        total_gst: quotation.totalGst,
        grand_total: quotation.grandTotal,
        status: "Draft",
        notes: "",
        terms: "Payment terms: 50% advance, 50% on delivery.\nDelivery within 7-10 working days after confirmation."
      });
    
    if (error) {
      console.log("Error saving quotation to database:", error);
      toast.error("Failed to save quotation to database");
      return false;
    } else {
      toast.success("Quotation saved to database");
      return true;
    }
  } catch (error) {
    console.error("Exception saving quotation:", error);
    return false;
  }
};
