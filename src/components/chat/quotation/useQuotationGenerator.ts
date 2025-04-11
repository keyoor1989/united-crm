
import { useState, useEffect } from "react";
import { ParsedQuotationRequest } from "@/utils/chatCommands/quotationParser";
import { products, generateQuotationNumber, createQuotationItem } from "@/data/salesData";
import { Quotation, Product } from "@/types/sales";
import { generateQuotationPdf } from "@/utils/pdfGenerator";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { CustomerType } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface UseQuotationGeneratorParams {
  initialData: ParsedQuotationRequest;
  onComplete: (quotation: Quotation) => void;
}

export const useQuotationGenerator = ({ initialData, onComplete }: UseQuotationGeneratorParams) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Extract customer data from URL parameters if available
  const customerIdFromUrl = queryParams.get('customerId') || '';
  const customerNameFromUrl = queryParams.get('customerName') || '';
  const customerEmailFromUrl = queryParams.get('customerEmail') || '';
  const customerPhoneFromUrl = queryParams.get('customerPhone') || '';
  
  // Debug: Log the parameters to see what's being passed
  console.log("URL Parameters in useQuotationGenerator:", {
    customerId: customerIdFromUrl,
    customerName: customerNameFromUrl,
    customerEmail: customerEmailFromUrl,
    customerPhone: customerPhoneFromUrl,
    pathname: location.pathname,
    search: location.search,
    fullURL: window.location.href
  });
  
  // State for customer search
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  
  // Initialize state with URL parameters or initialData as fallback
  const [customerId, setCustomerId] = useState(customerIdFromUrl || '');
  const [customerName, setCustomerName] = useState(customerNameFromUrl || initialData.customerName || '');
  const [customerEmail, setCustomerEmail] = useState(customerEmailFromUrl || '');
  const [customerPhone, setCustomerPhone] = useState(customerPhoneFromUrl || '');
  const [gstPercent, setGstPercent] = useState("18");
  const [items, setItems] = useState(initialData.models.map(model => {
    const product = products.find(p => p.id === model.productId);
    
    return {
      model: model.model,
      productId: model.productId,
      product: product || null,
      quantity: model.quantity,
      unitPrice: product ? 165000 : 150000, // Default price if not found
    };
  }));

  // Effect to initialize state once component is mounted
  useEffect(() => {
    // Set customer details from URL parameters or initialData
    if (customerNameFromUrl) {
      setCustomerName(customerNameFromUrl);
      console.log("Setting customer name from URL:", customerNameFromUrl);
    } else if (initialData.customerName) {
      setCustomerName(initialData.customerName);
      console.log("Setting customer name from initialData:", initialData.customerName);
    }
    
    if (customerEmailFromUrl) {
      setCustomerEmail(customerEmailFromUrl);
    }
    
    if (customerPhoneFromUrl) {
      setCustomerPhone(customerPhoneFromUrl);
    }
    
    // Auto search for customers if we only have a name but no ID
    if (customerNameFromUrl && !customerIdFromUrl && customerNameFromUrl.length > 2) {
      console.log("Auto-searching for customer:", customerNameFromUrl);
      setShowCustomerSearch(true);
    }
  }, []);

  // Debug: Log state after it should be set
  useEffect(() => {
    console.log("Current state:", { customerId, customerName, customerEmail, customerPhone });
  }, [customerId, customerName, customerEmail, customerPhone]);

  const handleUnitPriceChange = (index: number, price: string) => {
    const newItems = [...items];
    newItems[index].unitPrice = Number(price);
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, quantity: string) => {
    const newItems = [...items];
    newItems[index].quantity = Number(quantity);
    setItems(newItems);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const newItems = [...items];
    const product = products.find(p => p.id === productId);
    if (product) {
      newItems[index].product = product;
      newItems[index].productId = productId;
    }
    setItems(newItems);
  };

  // Handle customer selection from search results
  const selectCustomer = (customer: CustomerType) => {
    setCustomerId(customer.id);
    setCustomerName(customer.name);
    setCustomerEmail(customer.email || '');
    setCustomerPhone(customer.phone || '');
    setShowCustomerSearch(false);
    
    toast.success(`Selected customer: ${customer.name}`);
  };

  const saveCustomerIfNeeded = async () => {
    // If we have a name but no ID, we should create a new customer record
    if (customerName && !customerId) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .insert([
            { 
              name: customerName,
              phone: customerPhone || "",
              email: customerEmail || null,
              lead_status: "New",
              area: "",
              customer_type: "Business"
            }
          ])
          .select();
        
        if (error) {
          console.error("Error creating customer:", error);
          toast.error("Failed to save customer information");
        } else if (data && data.length > 0) {
          setCustomerId(data[0].id);
          toast.success("New customer saved to database");
          return data[0].id;
        }
      } catch (error) {
        console.error("Exception saving customer:", error);
      }
    }
    return customerId;
  };

  const generateQuotation = async () => {
    if (!customerName.trim()) {
      toast.error("Please enter a customer name");
      return;
    }
    
    // Save customer to database if needed and get the customer ID
    const finalCustomerId = await saveCustomerIfNeeded();
    
    // Calculate totals
    let subtotal = 0;
    let totalGst = 0;
    
    // Create quotation items
    const quotationItems = items.map(item => {
      if (!item.product && item.productId) {
        item.product = products.find(p => p.id === item.productId) || null;
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
      customerId: finalCustomerId || Math.random().toString(36).substring(2, 9),
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
    
    // Try to save the quotation to Supabase
    try {
      // Convert quotationItems to a JSON-compatible format
      const jsonItems = JSON.stringify(quotationItems);
      
      // Insert a single record instead of an array
      const { error } = await supabase
        .from('quotations')
        .insert({
          quotation_number: quotation.quotationNumber,
          customer_id: finalCustomerId,
          customer_name: customerName,
          items: jsonItems as unknown as Json,
          subtotal: subtotal,
          total_gst: totalGst,
          grand_total: subtotal + totalGst,
          status: "Draft",
          notes: "",
          terms: "Payment terms: 50% advance, 50% on delivery.\nDelivery within 7-10 working days after confirmation."
        });
      
      if (error) {
        console.log("Error saving quotation to database:", error);
        toast.error("Failed to save quotation to database");
      } else {
        toast.success("Quotation saved to database");
      }
    } catch (error) {
      console.error("Exception saving quotation:", error);
      // Continue even if saving fails
    }
    
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

  const toggleCustomerSearch = () => {
    setShowCustomerSearch(!showCustomerSearch);
  };

  return {
    customerId,
    customerName,
    customerEmail,
    customerPhone,
    gstPercent,
    items,
    showCustomerSearch,
    setCustomerEmail,
    setCustomerPhone,
    setGstPercent,
    handleProductSelect,
    handleQuantityChange,
    handleUnitPriceChange,
    toggleCustomerSearch,
    selectCustomer,
    generateQuotation
  };
};
