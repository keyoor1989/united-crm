
import { useState, useEffect } from "react";
import { CustomerType } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";

// Get customers from Supabase database
const fetchCustomers = async (): Promise<CustomerType[]> => {
  try {
    console.log("Fetching customers from Supabase");
    const { data, error } = await supabase
      .from('customers')
      .select('id, name, phone, email, area, lead_status, last_contact, customer_machines(machine_name)')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log("No customers found in database");
      return [];
    }
    
    console.log(`Loaded ${data.length} customers from database:`, data);
    
    // Transform the data to match our CustomerType structure
    const customers: CustomerType[] = data.map(customer => ({
      id: customer.id, // This is now correctly typed as string
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      location: customer.area,
      lastContact: customer.last_contact ? new Date(customer.last_contact).toLocaleDateString() : "Never",
      machines: customer.customer_machines ? customer.customer_machines.map((m: any) => m.machine_name).filter(Boolean) : [],
      status: mapLeadStatusToCustomerStatus(customer.lead_status)
    }));
    
    return customers;
  } catch (error) {
    console.error("Error in fetchCustomers:", error);
    return [];
  }
};

// Helper function to map lead_status from database to CustomerStatus type
const mapLeadStatusToCustomerStatus = (leadStatus: string): CustomerType["status"] => {
  switch (leadStatus) {
    case "Converted":
      return "Active";
    case "Lost":
      return "Inactive";
    case "New":
    case "Quoted":
      return "Prospect";
    case "Follow-up":
      return "Contract Renewal";
    default:
      return "Active";
  }
};

export const useCustomers = () => {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 5;

  useEffect(() => {
    const loadCustomers = async () => {
      setIsLoading(true);
      try {
        const loadedCustomers = await fetchCustomers();
        console.log(`Setting ${loadedCustomers.length} customers from Supabase`);
        setCustomers(loadedCustomers);
      } catch (error) {
        console.error("Error loading customers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    // Enhanced search to include phone, location, and machines
    const matchesSearch = 
      searchTerm === "" || 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.machines.some(machine => 
        machine.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = 
      !statusFilter || 
      customer.status === statusFilter;
    
    const matchesLocation = 
      !locationFilter || 
      customer.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const uniqueLocations = Array.from(new Set(customers.map(c => c.location)));
  const uniqueStatuses = Array.from(new Set(customers.map(c => c.status)));

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter(null);
    setLocationFilter(null);
    setCurrentPage(1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return {
    customers: currentItems,
    filteredCustomers,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    locationFilter,
    setLocationFilter,
    currentPage,
    totalPages,
    handlePageChange,
    resetFilters,
    showFilters,
    toggleFilters,
    uniqueLocations,
    uniqueStatuses,
    isLoading,
  };
};
