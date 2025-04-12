
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FilterX, Filter, Phone, MapPin, Printer } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string | null;
  onStatusFilterChange: (value: string | null) => void;
  locationFilter: string | null;
  onLocationFilterChange: (value: string | null) => void;
  onResetFilters: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  uniqueStatuses: string[];
  uniqueLocations: string[];
}

const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  locationFilter,
  onLocationFilterChange,
  onResetFilters,
  showFilters,
  onToggleFilters,
  uniqueStatuses,
  uniqueLocations,
}) => {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, phone, city, machine..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="absolute right-2.5 top-2.5 flex gap-1.5 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <MapPin className="h-4 w-4" />
            <Printer className="h-4 w-4" />
          </div>
        </div>

        <div className="flex gap-2 self-end">
          <Button variant="outline" className="gap-1" onClick={onResetFilters}>
            <FilterX className="h-4 w-4" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
          <Button 
            variant="outline" 
            className="gap-1"
            onClick={onToggleFilters}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-md">
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <Select value={statusFilter || "all_statuses"} onValueChange={(value) => onStatusFilterChange(value === "all_statuses" ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {/* Changed "all" to "all_statuses" to avoid empty string */}
                <SelectItem value="all_statuses">All Statuses</SelectItem>
                {uniqueStatuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Location</label>
            <Select value={locationFilter || "all_locations"} onValueChange={(value) => onLocationFilterChange(value === "all_locations" ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {/* Changed "all" to "all_locations" to avoid empty string */}
                <SelectItem value="all_locations">All Locations</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerFilters;
