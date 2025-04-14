
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, X, Phone, MapPin } from "lucide-react";
import { CustomerType } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CustomerSearchProps {
  onSelectCustomer: (customer: CustomerType) => void;
  showSearch: boolean;
  onToggleSearch: () => void;
  customerName: string;
}

const CustomerSearch: React.FC<CustomerSearchProps> = ({
  onSelectCustomer,
  showSearch,
  onToggleSearch,
  customerName,
}) => {
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

  return (
    <>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name
          </label>
          <Input
            id="customerName"
            value={customerName}
            readOnly
            placeholder="Enter customer name"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={onToggleSearch}
          title="Search customers"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      
      {showSearch && (
        <div className="p-3 border rounded-md bg-background">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, phone, city or machine..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                searchCustomers(e.target.value);
              }}
              className="flex-1"
              autoFocus
            />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggleSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-1.5 text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1 font-medium"><Phone className="h-3 w-3" /> Phone</span>
            <span>•</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> City</span>
            <span>•</span>
            <span className="flex items-center gap-1"><User className="h-3 w-3" /> Name</span>
          </div>
          
          {isSearching ? (
            <div className="py-2 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="max-h-60 overflow-y-auto divide-y divide-muted/20">
              {searchResults.map((customer) => (
                <div 
                  key={customer.id}
                  className="p-2 hover:bg-muted rounded-md cursor-pointer"
                  onClick={() => onSelectCustomer(customer)}
                >
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary">{formatPhoneNumber(customer.phone)}</span>
                        {customer.machines.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {customer.machines.length} machines
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm">{customer.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {customer.location && 
                          <span className="flex items-center gap-1 inline-block mr-2">
                            <MapPin className="h-3 w-3" /> {customer.location}
                          </span>
                        }
                        {customer.email && 
                          <span className="text-xs text-muted-foreground">
                            {customer.email}
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm.length > 0 ? (
            <div className="py-2 text-center text-sm text-muted-foreground">
              No customers found
            </div>
          ) : (
            <div className="py-2 text-center text-sm text-muted-foreground">
              Type a name, phone number, or location to search
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CustomerSearch;
