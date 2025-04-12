
import React from "react";
import { Card } from "@/components/ui/card";
import EngineerInventoryManager from "@/components/service/EngineerInventoryManager";
import { Engineer } from "@/types/service";
import { InventoryItem } from "@/types/inventory";

interface EngineerInventoryTabProps {
  engineers: Engineer[];
  inventoryItems: InventoryItem[];
  isLoading: boolean;
}

const EngineerInventoryTab = ({ engineers, inventoryItems, isLoading }: EngineerInventoryTabProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading inventory data...</p>
      </div>
    );
  }
  
  return (
    <Card>
      <EngineerInventoryManager 
        engineers={engineers} 
        inventoryItems={inventoryItems} 
      />
    </Card>
  );
};

export default EngineerInventoryTab;
