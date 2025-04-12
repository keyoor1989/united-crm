
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IssuedItemsTable from "./IssuedItemsTable";
import ReturnHistoryTable from "./ReturnHistoryTable";
import { useIssuedItems } from "@/hooks/inventory/useEngineerItems";
import { useReturnedItems } from "@/hooks/inventory/useReturnedItems";

const ActivityLog = () => {
  const [activeTab, setActiveTab] = useState("issues");
  const { items: issuedItems, isLoading: isLoadingIssuedItems } = useIssuedItems();
  const { items: returnedItems, isLoading: isLoadingReturnedItems } = useReturnedItems();

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
