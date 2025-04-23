
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import WarehouseTransferTable from "./WarehouseTransferTable";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Warehouse } from "@/types/inventory";

interface WarehouseTransferTabsProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
  transfers: any[];
  warehouses: Warehouse[];
  loading: boolean;
}

const WarehouseTransferTabs = ({
  activeTab,
  setActiveTab,
  transfers,
  warehouses,
  loading,
}: WarehouseTransferTabsProps) => (
  <Tabs value={activeTab} onValueChange={setActiveTab}>
    <TabsList>
      <TabsTrigger value="transfers">Active Transfers</TabsTrigger>
      <TabsTrigger value="history">Transfer History</TabsTrigger>
    </TabsList>
    <TabsContent value="transfers" className="mt-4">
      <Card>
        <CardHeader>
          <CardTitle>Current Transfers</CardTitle>
          <CardDescription>
            All ongoing warehouse transfers (not "Received" or "Cancelled")
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WarehouseTransferTable
            transfers={transfers.filter(t => t.status !== "Received" && t.status !== "Cancelled")}
            warehouses={warehouses}
            loading={loading}
            emptyMessage="No active warehouse transfers"
          />
        </CardContent>
      </Card>
    </TabsContent>
    <TabsContent value="history" className="mt-4">
      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
          <CardDescription>
            Completed and cancelled warehouse transfers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WarehouseTransferTable
            transfers={transfers.filter(t => t.status === "Received" || t.status === "Cancelled")}
            warehouses={warehouses}
            loading={loading}
            emptyMessage="No history transfers"
          />
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
);

export default WarehouseTransferTabs;
