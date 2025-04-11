
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SentOrderSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const SentOrderSearch: React.FC<SentOrderSearchProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sent orders..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SentOrderSearch;
