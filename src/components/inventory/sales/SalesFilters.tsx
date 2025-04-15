
import React from "react";
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SalesFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  paymentFilter: string;
  onPaymentFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  customerTypeFilter: string;
  onCustomerTypeFilterChange: (value: string) => void;
  onResetFilters: () => void;
}

export const SalesFilters: React.FC<SalesFiltersProps> = ({
  searchQuery,
  onSearchChange,
  paymentFilter,
  onPaymentFilterChange,
  statusFilter,
  onStatusFilterChange,
  customerTypeFilter,
  onCustomerTypeFilterChange,
  onResetFilters,
}) => {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
      <div className="flex-1 space-y-2">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search sales..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="payment-status">Payment Status</Label>
        <Select
          value={paymentFilter}
          onValueChange={onPaymentFilterChange}
        >
          <SelectTrigger id="payment-status" className="w-[140px]">
            <SelectValue placeholder="All Payments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="due">Due</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="sale-status">Sale Status</Label>
        <Select
          value={statusFilter}
          onValueChange={onStatusFilterChange}
        >
          <SelectTrigger id="sale-status" className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="credit sale">Credit Sale</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="customer-type">Customer Type</Label>
        <Select
          value={customerTypeFilter}
          onValueChange={onCustomerTypeFilterChange}
        >
          <SelectTrigger id="customer-type" className="w-[140px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="dealer">Dealer</SelectItem>
            <SelectItem value="government">Government</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button variant="outline" onClick={onResetFilters} className="gap-2">
        <Filter size={16} />
        Reset
      </Button>
    </div>
  );
};

// Add the Label component to avoid extra import
const Label = ({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) => (
  <label 
    htmlFor={htmlFor} 
    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    {children}
  </label>
);
