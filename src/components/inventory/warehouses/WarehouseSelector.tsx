
import React from "react";
import { Button } from "@/components/ui/button";
import { Warehouse } from "@/types/inventory";

interface WarehouseSelectorProps {
  warehouses: Warehouse[];
  selectedWarehouse: string | null;
  onSelectWarehouse: (warehouseId: string | null) => void;
}

const WarehouseSelector = ({
  warehouses,
  selectedWarehouse,
  onSelectWarehouse,
}: WarehouseSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button 
        variant={selectedWarehouse === null ? "default" : "outline"}
        onClick={() => onSelectWarehouse(null)}
      >
        All Warehouses
      </Button>
      {warehouses.map((warehouse) => (
        <Button
          key={warehouse.id}
          variant={selectedWarehouse === warehouse.id ? "default" : "outline"}
          onClick={() => onSelectWarehouse(warehouse.id)}
          disabled={!warehouse.isActive}
        >
          {warehouse.name}
        </Button>
      ))}
    </div>
  );
};

export default WarehouseSelector;
