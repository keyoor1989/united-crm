
import { useState } from "react";
import { CustomerType } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCustomerSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerType[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Format phone number with proper spacing (e.g., 98765 43210)
  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Format as 5 digits space 5 digits if it's a 10-digit number
    if (cleaned.length === 10) {
      return cleaned.slice(0, 5) + ' ' + cleaned.slice(5);
    }
    return phone;
  };

  const searchCustomers = async (term: string) => {
    if (term.length < 1) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      // Check if search term contains only digits (likely a phone number)
      const isPhoneSearch = /^\d+$/.test(term);
      
      let nameData: any[] = [];
      let phoneData: any[] = [];
      let areaData: any[] = [];
      let machineData: any[] = [];
      
      // Search by name
      const { data: nameResults, error: nameError } = await supabase
        .from('customers')
        .select('id, name, phone, email, area, lead_status, customer_machines(machine_name)')
        .ilike('name', `%${term}%`)
        .order('name')
        .limit(10);
      
      if (!nameError) nameData = nameResults || [];
      
      // Search by phone - prioritize this if it seems like a phone search
      const { data: phoneResults, error: phoneError } = await supabase
        .from('customers')
        .select('id, name, phone, email, area, lead_status, customer_machines(machine_name)')
        .ilike('phone', `%${term}%`)
        .order('name')
        .limit(10);
      
      if (!phoneError) phoneData = phoneResults || [];
      
      // Search by location/area
      const { data: areaResults, error: areaError } = await supabase
        .from('customers')
        .select('id, name, phone, email, area, lead_status, customer_machines(machine_name)')
        .ilike('area', `%${term}%`)
        .order('name')
        .limit(10);
      
      if (!areaError) areaData = areaResults || [];
      
      // Search by machine model via the related table
      const { data: machineResults, error: machineError } = await supabase
        .from('customers')
        .select('id, name, phone, email, area, lead_status, customer_machines!inner(machine_name)')
        .filter('customer_machines.machine_name', 'ilike', `%${term}%`)
        .order('name')
        .limit(10);
        
      if (!machineError) machineData = machineResults || [];
      
      // Combine results and remove duplicates
      // If it's a phone search, prioritize phone results first
      let combinedResults = isPhoneSearch 
        ? [...phoneData, ...nameData, ...areaData, ...machineData]
        : [...nameData, ...phoneData, ...areaData, ...machineData];
        
      const uniqueCustomers = combinedResults.filter((customer, index, self) => 
        index === self.findIndex(c => c.id === customer.id)
      );
      
      // Convert to CustomerType format
      const customers: CustomerType[] = uniqueCustomers.map(customer => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email || "",
        location: customer.area,
        lastContact: "N/A",
        machines: customer.customer_machines ? customer.customer_machines.map((m: any) => m.machine_name).filter(Boolean) : [],
        status: "Active"
      }));
      
      console.log("Search results:", customers);
      setSearchResults(customers);
    } catch (error) {
      console.error("Error in search process:", error);
      toast.error("An error occurred while searching");
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    formatPhoneNumber,
    searchCustomers
  };
};
