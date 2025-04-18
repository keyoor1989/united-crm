
import { useState, useCallback } from "react";
import { CustomerType } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCustomerSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerType[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Format as Indian mobile number
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    return cleaned;
  };

  const searchCustomers = useCallback(async (term: string) => {
    if (!term || term.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search in customers table by phone number
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, email, area, customer_machines(machine_name)')
        .or(`phone.ilike.%${term}%`)
        .limit(5);

      if (error) {
        console.error('Error searching customers:', error);
        toast.error('Failed to search customers');
        return;
      }

      // Transform data to match CustomerType
      const customers: CustomerType[] = data.map(customer => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        location: customer.area,
        machines: customer.customer_machines ? 
          customer.customer_machines.map((m: any) => m.machine_name).filter(Boolean) : [],
        status: 'Active',
        lastContact: new Date().toISOString()
      }));

      setSearchResults(customers);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to search customers');
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    formatPhoneNumber,
    searchCustomers
  };
};
