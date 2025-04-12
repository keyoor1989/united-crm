
import React from "react";
import { Button } from "@/components/ui/button";
import { Warehouse } from "@/types/inventory";
import { Loader2 } from "lucide-react";

interface WarehouseSelectorProps {
  warehouses: Warehouse[];
  selectedWarehouse: string | null;
  onSelectWarehouse: (warehouseId: string | null) => void;
  isLoading?: boolean;
}

const WarehouseSelector = ({
  warehouses,
  selectedWarehouse,
  onSelectWarehouse,
  isLoading = false,
}: WarehouseSelectorProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 mb-4 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading warehouses...</span>
      </div>
    );
  }

  if (warehouses.length === 0) {
    return (
      <div className="p-4 mb-4 border rounded-md bg-muted/30">
        <p className="text-muted-foreground">No warehouses available. Please add warehouses first.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button 
        variant={selectedWarehouse === null ? "default" : "outline"}
        onClick={() => onSelectWarehouse(null)}
      >
        All Warehouses
      </Button>
      {warehouses.map((warehouse) => {
        // Ensure we never try to use undefined or null values for the key, id, or name
        if (!warehouse.id) {
          console.warn("Found warehouse with missing ID, skipping", warehouse);
          return null;
        }
        
        const warehouseName = warehouse.name || "Unnamed Warehouse";
        const warehouseLocation = warehouse.location || "Unknown Location";
        
        return (
          <Button
            key={warehouse.id}
            variant={selectedWarehouse === warehouse.id ? "default" : "outline"}
            onClick={() => onSelectWarehouse(warehouse.id)}
            disabled={!warehouse.isActive}
          >
            {warehouseName} ({warehouseLocation})
          </Button>
        );
      })}
    </div>
  );
};

export default WarehouseSelector;
