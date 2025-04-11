
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

  const searchCustomers = async (term: string) => {
    if (term.length < 1) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      // Search in Supabase database - can search by name, phone, or location (area)
      const { data: nameData, error: nameError } = await supabase
        .from('customers')
        .select('id, name, phone, email, area, lead_status, customer_machines(machine_name)')
        .ilike('name', `%${term}%`)
        .order('name')
        .limit(10);
      
      // Search by phone
      const { data: phoneData, error: phoneError } = await supabase
        .from('customers')
        .select('id, name, phone, email, area, lead_status, customer_machines(machine_name)')
        .ilike('phone', `%${term}%`)
        .order('name')
        .limit(10);
      
      // Search by location/area
      const { data: areaData, error: areaError } = await supabase
        .from('customers')
        .select('id, name, phone, email, area, lead_status, customer_machines(machine_name)')
        .ilike('area', `%${term}%`)
        .order('name')
        .limit(10);
      
      // Search by machine model via the related table
      const { data: machineData, error: machineError } = await supabase
        .from('customers')
        .select('id, name, phone, email, area, lead_status, customer_machines!inner(machine_name)')
        .filter('customer_machines.machine_name', 'ilike', `%${term}%`)
        .order('name')
        .limit(10);
        
      if (nameError || phoneError || areaError || machineError) {
        console.error("Error searching customers:", nameError || phoneError || areaError || machineError);
        toast.error("Failed to search customers");
        return;
      }
      
      // Combine results and remove duplicates
      const combinedResults = [...(nameData || []), ...(phoneData || []), ...(areaData || []), ...(machineData || [])];
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
              placeholder="Search by name, phone, city, machine..." 
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
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> City</span>
            <span className="flex items-center gap-1"><User className="h-3 w-3" /> Name</span>
          </div>
          
          {isSearching ? (
            <div className="py-2 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="max-h-60 overflow-y-auto">
              {searchResults.map((customer) => (
                <div 
                  key={customer.id}
                  className="p-2 hover:bg-muted rounded-md cursor-pointer flex items-center gap-2"
                  onClick={() => onSelectCustomer(customer)}
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {customer.phone}
                      {customer.email && ` • ${customer.email}`}
                      {customer.location && ` • ${customer.location}`}
                    </div>
                  </div>
                  {customer.machines.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {customer.machines.length} machines
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : searchTerm.length > 0 ? (
            <div className="py-2 text-center text-sm text-muted-foreground">
              No customers found
            </div>
          ) : (
            <div className="py-2 text-center text-sm text-muted-foreground">
              Type to search customers
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CustomerSearch;
