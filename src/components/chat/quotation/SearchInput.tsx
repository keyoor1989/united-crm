import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Phone, MapPin, User } from "lucide-react";

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchClose: () => void;
  onSearch: (term: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  searchTerm,
  onSearchChange,
  onSearchClose,
  onSearch
}) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by phone number..." 
          value={searchTerm}
          onChange={(e) => {
            onSearchChange(e.target.value);
            onSearch(e.target.value);
          }}
          className="flex-1"
          autoFocus
        />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onSearchClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex gap-1.5 text-xs text-muted-foreground mb-2">
        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> Enter phone number</span>
      </div>
    </div>
  );
};

export default SearchInput;
