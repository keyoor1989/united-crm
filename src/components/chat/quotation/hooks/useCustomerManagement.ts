
import { useState, useEffect } from "react";
import { CustomerType } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

interface UseCustomerManagementParams {
  initialCustomerName: string;
}

export const useCustomerManagement = ({ initialCustomerName }: UseCustomerManagementParams) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Extract customer data from URL parameters if available
  const customerIdFromUrl = queryParams.get('customerId') || '';
  const customerNameFromUrl = queryParams.get('customerName') || '';
  const customerEmailFromUrl = queryParams.get('customerEmail') || '';
  const customerPhoneFromUrl = queryParams.get('customerPhone') || '';
  
  // Debug: Log the parameters to see what's being passed
  console.log("URL Parameters in useCustomerManagement:", {
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
  const [customerName, setCustomerName] = useState(customerNameFromUrl || initialCustomerName || '');
  const [customerEmail, setCustomerEmail] = useState(customerEmailFromUrl || '');
  const [customerPhone, setCustomerPhone] = useState(customerPhoneFromUrl || '');
  
  // Effect to initialize state once component is mounted
  useEffect(() => {
    // Set customer details from URL parameters or initialData
    if (customerNameFromUrl) {
      setCustomerName(customerNameFromUrl);
      console.log("Setting customer name from URL:", customerNameFromUrl);
    } else if (initialCustomerName) {
      setCustomerName(initialCustomerName);
      console.log("Setting customer name from initialData:", initialCustomerName);
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

  const toggleCustomerSearch = () => {
    setShowCustomerSearch(!showCustomerSearch);
  };

  return {
    customerId,
    customerName,
    customerEmail,
    customerPhone,
    showCustomerSearch,
    setCustomerEmail,
    setCustomerPhone,
    toggleCustomerSearch,
    selectCustomer,
    saveCustomerIfNeeded
  };
};
