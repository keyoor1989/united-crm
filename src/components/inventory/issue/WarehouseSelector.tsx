
import React from "react";
import { Button } from "@/components/ui/button";
import { useWarehouses } from "@/hooks/warehouses/useWarehouses";

interface WarehouseSelectorProps {
  selectedWarehouse: string | null;
  setSelectedWarehouse: (id: string | null) => void;
}

const WarehouseSelector = ({ selectedWarehouse, setSelectedWarehouse }: WarehouseSelectorProps) => {
  const { warehouses, isLoadingWarehouses } = useWarehouses();

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Select Warehouse</h3>
      <div className="flex gap-2">
        <Button 
          type="button"
          variant="outline"
          className={`rounded-md py-2 px-6 ${!selectedWarehouse ? 'bg-black text-white hover:bg-black hover:text-white' : ''}`}
          onClick={() => setSelectedWarehouse(null)}
        >
          All Warehouses
        </Button>
        {warehouses.map(warehouse => (
          <Button
            key={warehouse.id}
            type="button"
            variant="outline"
            className={`rounded-md py-2 px-6 ${selectedWarehouse === warehouse.id ? 'bg-black text-white hover:bg-black hover:text-white' : ''}`}
            onClick={() => setSelectedWarehouse(warehouse.id)}
          >
            {warehouse.name} ({warehouse.location})
          </Button>
        ))}
      </div>
    </div>
  );
};

export default WarehouseSelector;
