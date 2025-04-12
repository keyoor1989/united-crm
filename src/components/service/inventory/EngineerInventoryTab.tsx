
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import EngineerInventoryManager from "@/components/service/EngineerInventoryManager";
import { useEngineerInventory } from "@/hooks/inventory/useEngineerInventory";

interface EngineerInventoryTabProps {
  engineers: any[];
  inventoryItems: any[];
  selectedWarehouse: string | null;
  isLoading: boolean;
}

const EngineerInventoryTab = ({ 
  engineers, 
  inventoryItems, 
  selectedWarehouse,
  isLoading 
}: EngineerInventoryTabProps) => {
  // Fetch real engineer inventory data
  const { items: engineerInventory, isLoading: isLoadingInventory } = useEngineerInventory();
  
  if (isLoading || isLoadingInventory) {
    return (
      <div className="p-8 bg-white rounded-lg shadow">
        <Skeleton className="h-10 w-1/4 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  return (
    <EngineerInventoryManager 
      engineers={engineers} 
      inventoryItems={inventoryItems}
      engineerInventory={engineerInventory}
      selectedWarehouse={selectedWarehouse}
    />
  );
};

export default EngineerInventoryTab;
