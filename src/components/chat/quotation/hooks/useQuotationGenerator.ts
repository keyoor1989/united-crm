
import { useState } from "react";
import { ParsedQuotationRequest } from "@/utils/chatCommands/quotationParser";
import { Quotation } from "@/types/sales";
import { generateQuotationPdf } from "@/utils/pdfGenerator";
import { toast } from "sonner";
import { useCustomerManagement } from "./useCustomerManagement";
import { useItemsManagement } from "./useItemsManagement";
import { createQuotationObject, saveQuotationToDatabase } from "../utils/quotationGenerator";

interface UseQuotationGeneratorParams {
  initialData: ParsedQuotationRequest;
  onComplete: (quotation: Quotation) => void;
}

export const useQuotationGenerator = ({ initialData, onComplete }: UseQuotationGeneratorParams) => {
  // Customer management hook
  const customerManagement = useCustomerManagement({
    initialCustomerName: initialData.customerName || ''
  });
  
  // Item management hook
  const itemsManagement = useItemsManagement({
    initialModels: initialData.models
  });
  
  // GST state
  const [gstPercent, setGstPercent] = useState("18");

  // Generate quotation function
  const generateQuotation = async () => {
    if (!customerManagement.customerName.trim()) {
      toast.error("Please enter a customer name");
      return;
    }
    
    // Save customer to database if needed and get the customer ID
    const finalCustomerId = await customerManagement.saveCustomerIfNeeded();
    
    // Create quotation object
    const quotation = createQuotationObject(
      itemsManagement.items,
      finalCustomerId || '',
      customerManagement.customerName
    );
    
    // Try to save the quotation to Supabase
    await saveQuotationToDatabase(quotation, finalCustomerId || '');
    
    // Generate PDF for the quotation
    try {
      generateQuotationPdf(quotation);
      toast.success("Quotation PDF generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
    
    // Complete the flow
    onComplete(quotation);
  };

  // Return all the required states and functions
  return {
    // Customer related
    customerId: customerManagement.customerId,
    customerName: customerManagement.customerName,
    customerEmail: customerManagement.customerEmail,
    customerPhone: customerManagement.customerPhone,
    showCustomerSearch: customerManagement.showCustomerSearch,
    setCustomerEmail: customerManagement.setCustomerEmail,
    setCustomerPhone: customerManagement.setCustomerPhone,
    toggleCustomerSearch: customerManagement.toggleCustomerSearch,
    selectCustomer: customerManagement.selectCustomer,
    
    // Items related
    items: itemsManagement.items,
    handleProductSelect: itemsManagement.handleProductSelect,
    handleQuantityChange: itemsManagement.handleQuantityChange,
    handleUnitPriceChange: itemsManagement.handleUnitPriceChange,
    
    // GST related
    gstPercent,
    setGstPercent,
    
    // Action
    generateQuotation
  };
};
