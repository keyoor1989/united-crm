
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { CustomerType } from "@/types/customer";
import { useCustomerSearch } from "./hooks/useCustomerSearch";
import SearchInput from "./SearchInput";
import SearchResultsList from "./SearchResultsList";

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
  const { 
    searchTerm, 
    setSearchTerm,
    searchResults,
    isSearching,
    formatPhoneNumber,
    searchCustomers
  } = useCustomerSearch();

  // Handler for when search term changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    searchCustomers(value);
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
            placeholder="Enter customer name or search"
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
          <SearchInput 
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onSearchClose={onToggleSearch}
            onSearch={searchCustomers}
          />
          
          <SearchResultsList 
            isSearching={isSearching}
            searchResults={searchResults}
            searchTerm={searchTerm}
            formatPhoneNumber={formatPhoneNumber}
            onSelectCustomer={onSelectCustomer}
          />
        </div>
      )}
    </>
  );
};

export default CustomerSearch;
