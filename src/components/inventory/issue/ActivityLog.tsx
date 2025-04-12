
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IssuedItemsTable from "./IssuedItemsTable";
import ReturnHistoryTable from "./ReturnHistoryTable";
import { useIssuedItems } from "@/hooks/inventory/useEngineerItems";
import { useReturnedItems } from "@/hooks/inventory/useReturnedItems";
import { EngineerInventoryItem as InventoryHookItem } from "@/hooks/inventory/useEngineerItems";
import { EngineerInventoryItem as EngineerInventoryDisplayItem } from "@/hooks/inventory/useEngineerInventory";

const ActivityLog = () => {
  const [activeTab, setActiveTab] = useState("issues");
  const { items: issuedItemsRaw, isLoading: isLoadingIssuedItems } = useIssuedItems();
  const { items: returnedItems, isLoading: isLoadingReturnedItems } = useReturnedItems();

  // Map the items from useEngineerItems format to useEngineerInventory format
  const issuedItems: EngineerInventoryDisplayItem[] = issuedItemsRaw.map(item => ({
    id: item.id,
    engineerId: item.engineer_id,
    engineerName: item.engineer_name,
    itemId: item.item_id,
    itemName: item.item_name,
    assignedQuantity: item.quantity,
    remainingQuantity: item.quantity,
    modelNumber: item.model_number || null,
    modelBrand: item.model_brand || null,
    lastUpdated: item.assigned_date,
    createdAt: item.assigned_date
  }));

  console.log("Issued items raw:", issuedItemsRaw);
  console.log("Transformed issued items:", issuedItems);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="w-full">
        <TabsTrigger value="issues" className="flex-1">Recent Issues</TabsTrigger>
        <TabsTrigger value="returns" className="flex-1">Recent Returns</TabsTrigger>
      </TabsList>
      
      <TabsContent value="issues">
        <IssuedItemsTable items={issuedItems} isLoading={isLoadingIssuedItems} />
      </TabsContent>
      
      <TabsContent value="returns">
        <ReturnHistoryTable returns={returnedItems} isLoading={isLoadingReturnedItems} />
      </TabsContent>
    </Tabs>
  );
};

export default ActivityLog;
