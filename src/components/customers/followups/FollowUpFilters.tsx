
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface FollowUpFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  typeFilter: string | null;
  setTypeFilter: (value: string | null) => void;
  showFilters: boolean;
  toggleFilters: () => void;
}

const FollowUpFilters: React.FC<FollowUpFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  showFilters,
  toggleFilters,
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex-1"></div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleFilters}
          className="gap-1"
        >
          <Filter className="h-4 w-4" /> 
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>
      
      {showFilters && (
        <div className="flex flex-col md:flex-row gap-2 py-2">
          <div className="flex-1">
            <Input
              placeholder="Search by customer or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={typeFilter || "all_types"} onValueChange={(value) => setTypeFilter(value === "all_types" ? null : value)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_types">All Types</SelectItem>
              <SelectItem value="quotation">Quotation</SelectItem>
              <SelectItem value="demo">Demo</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="closure">Closure</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
};

export default FollowUpFilters;
