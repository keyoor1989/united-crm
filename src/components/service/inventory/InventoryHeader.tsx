
import React from "react";
import { Truck, CheckSquare, ReceiptText } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InventoryHeaderProps {
  activeTab: string;
}

const InventoryHeader = ({ activeTab }: InventoryHeaderProps) => {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Service Inventory Management</h1>
      <p className="text-muted-foreground">
        Manage inventory for service engineers and track parts reconciliation
      </p>
      
      <TabsList className="mt-4">
        <TabsTrigger value="engineer-inventory" className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Engineer Inventory
        </TabsTrigger>
        <TabsTrigger value="parts-reconciliation" className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4" />
          Parts Reconciliation
        </TabsTrigger>
        <TabsTrigger value="service-expenses" className="flex items-center gap-2">
          <ReceiptText className="h-4 w-4" />
          Service Expenses
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default InventoryHeader;
