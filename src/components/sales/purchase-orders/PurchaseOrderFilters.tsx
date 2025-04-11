
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PurchaseOrderStatus } from "@/types/sales";

interface PurchaseOrderFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: PurchaseOrderStatus | "All";
  setStatusFilter: (status: PurchaseOrderStatus | "All") => void;
}

const PurchaseOrderFilters: React.FC<PurchaseOrderFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search purchase orders..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button 
          variant={statusFilter === "All" ? "default" : "outline"} 
          onClick={() => setStatusFilter("All")}
        >
          All
        </Button>
        <Button 
          variant={statusFilter === "Draft" ? "default" : "outline"} 
          onClick={() => setStatusFilter("Draft")}
        >
          Draft
        </Button>
        <Button 
          variant={statusFilter === "Sent" ? "default" : "outline"} 
          onClick={() => setStatusFilter("Sent")}
        >
          Sent
        </Button>
        <Button 
          variant={statusFilter === "Confirmed" ? "default" : "outline"} 
          onClick={() => setStatusFilter("Confirmed")}
        >
          Confirmed
        </Button>
      </div>
    </div>
  );
};

export default PurchaseOrderFilters;
