
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IssuedItemsTable from "./IssuedItemsTable";
import ReturnHistoryTable from "./ReturnHistoryTable";
import { useEngineerItems } from "@/hooks/inventory/useEngineerItems";
import { useReturnedItems } from "@/hooks/inventory/useReturnedItems";
import { EngineerInventoryItem } from "@/hooks/inventory/useEngineerInventory";

const ActivityLog = () => {
  const [activeTab, setActiveTab] = useState("issues");
  // Pass an empty string as engineerId to fetch all items
  const { items: engineerItems, isLoading: isLoadingEngineerItems } = useEngineerItems("");
  const { items: returnedItems, isLoading: isLoadingReturnedItems } = useReturnedItems();

  // Map the items from useEngineerItems format to useEngineerInventory format
  const issuedItems: EngineerInventoryItem[] = engineerItems.map(item => ({
    id: item.id,
    engineerId: item.engineer_id || "",
    engineerName: item.engineer_name || "",
    itemId: item.item_id,
    itemName: item.item_name,
    assignedQuantity: item.quantity,
    remainingQuantity: item.quantity,
    modelNumber: item.modelNumber,
    modelBrand: item.modelBrand,
    lastUpdated: item.return_date || item.quantity ? new Date().toISOString() : new Date().toISOString(),
    createdAt: item.return_date || item.quantity ? new Date().toISOString() : new Date().toISOString(),
    warehouseSource: item.warehouseSource
  }));

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="w-full">
        <TabsTrigger value="issues" className="flex-1">Recent Issues</TabsTrigger>
        <TabsTrigger value="returns" className="flex-1">Recent Returns</TabsTrigger>
      </TabsList>
      
      <TabsContent value="issues">
        <IssuedItemsTable items={issuedItems} isLoading={isLoadingEngineerItems} />
      </TabsContent>
      
      <TabsContent value="returns">
        <ReturnHistoryTable returns={returnedItems} isLoading={isLoadingReturnedItems} />
      </TabsContent>
    </Tabs>
  );
};

export default ActivityLog;
