
import React from "react";
import { CustomerType } from "@/types/customer";
import SearchResultItem from "./SearchResultItem";

interface SearchResultsListProps {
  isSearching: boolean;
  searchResults: CustomerType[];
  searchTerm: string;
  formatPhoneNumber: (phone: string) => string;
  onSelectCustomer: (customer: CustomerType) => void;
}

const SearchResultsList: React.FC<SearchResultsListProps> = ({
  isSearching,
  searchResults,
  searchTerm,
  formatPhoneNumber,
  onSelectCustomer
}) => {
  if (isSearching) {
    return (
      <div className="py-2 text-center text-sm text-muted-foreground">
        Searching...
      </div>
    );
  } 
  
  if (searchResults.length > 0) {
    return (
      <div className="max-h-60 overflow-y-auto divide-y divide-muted/20">
        {searchResults.map((customer) => (
          <SearchResultItem 
            key={customer.id}
            customer={customer}
            formatPhoneNumber={formatPhoneNumber}
            onSelectCustomer={onSelectCustomer}
          />
        ))}
      </div>
    );
  } 
  
  if (searchTerm.length > 0) {
    return (
      <div className="py-2 text-center text-sm text-muted-foreground">
        No customers found
      </div>
    );
  } 
  
  return (
    <div className="py-2 text-center text-sm text-muted-foreground">
      Type a name, phone number, or location to search
    </div>
  );
};

export default SearchResultsList;
