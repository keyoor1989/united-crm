
import React, { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useServiceData } from "@/hooks/useServiceData";
import { useToast } from "@/hooks/use-toast";
import { ServiceCall } from "@/types/service";
import { ServiceExpense } from "@/types/serviceExpense";
import { mockInventoryItems } from "@/components/service/inventory/mockData";
import InventoryHeader from "@/components/service/inventory/InventoryHeader";
import EngineerInventoryTab from "@/components/service/inventory/EngineerInventoryTab";
import PartsReconciliationTab from "@/components/service/inventory/PartsReconciliationTab";
import ServiceExpensesTab from "@/components/service/inventory/ServiceExpensesTab";
import { useWarehouses } from "@/hooks/warehouses/useWarehouses";
import WarehouseSelector from "@/components/inventory/warehouses/WarehouseSelector";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ServiceInventoryManagement = () => {
  const { toast } = useToast();
  const { allCalls, engineers, isLoading } = useServiceData();
  const { warehouses, isLoadingWarehouses } = useWarehouses();
  
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>(allCalls);
  const [activeTab, setActiveTab] = useState("engineer-inventory");
  const [expenses, setExpenses] = useState<ServiceExpense[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  
  // Handle expense added
  const handleExpenseAdded = (expense: ServiceExpense) => {
    setExpenses(prev => [...prev, expense]);
    toast({
      title: "Expense Added",
      description: `${expense.category} expense of ₹${expense.amount} added for ${expense.engineerName}`,
    });
  };
  
  // Handle reconcile service call parts
  const handleReconcile = (serviceCallId: string, reconciled: boolean) => {
    setServiceCalls(prev =>
      prev.map(call => {
        if (call.id === serviceCallId) {
          // Mark all parts as reconciled or unreconciled
          const updatedParts = call.partsUsed.map(part => ({
            ...part,
            isReconciled: reconciled
          }));
          
          return {
            ...call,
            partsUsed: updatedParts,
            partsReconciled: reconciled
          };
        }
        return call;
      })
    );
  };
  
  // Handle reconcile individual part
  const handlePartReconcile = (serviceCallId: string, partId: string, reconciled: boolean) => {
    setServiceCalls(prev =>
      prev.map(call => {
        if (call.id === serviceCallId) {
          // Update the specific part
          const updatedParts = call.partsUsed.map(part => {
            if (part.id === partId) {
              return {
                ...part,
                isReconciled: reconciled
              };
            }
            return part;
          });
          
          // Check if all parts are reconciled
          const allReconciled = updatedParts.every(part => part.isReconciled);
          
          return {
            ...call,
            partsUsed: updatedParts,
            partsReconciled: allReconciled
          };
        }
        return call;
      })
    );
  };

  return (
    <div className="container mx-auto space-y-6">
      <InventoryHeader activeTab={activeTab} onTabChange={setActiveTab} />
      
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Inventory Flow</AlertTitle>
        <AlertDescription>
          This page helps you manage inventory for field engineers. The flow is:
          <strong> Warehouse → Engineer → Service Call → Reconciliation</strong>.
          First, assign items to engineers from a warehouse, then track their usage on service calls, 
          and finally reconcile the parts used.
        </AlertDescription>
      </Alert>
      
      {/* Add Warehouse Selector */}
      <WarehouseSelector 
        warehouses={warehouses}
        selectedWarehouse={selectedWarehouse}
        onSelectWarehouse={setSelectedWarehouse}
        isLoading={isLoadingWarehouses}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsContent value="engineer-inventory">
          <EngineerInventoryTab 
            engineers={engineers} 
            inventoryItems={mockInventoryItems}
            selectedWarehouse={selectedWarehouse}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="parts-reconciliation">
          <PartsReconciliationTab 
            serviceCalls={serviceCalls}
            onReconcile={handleReconcile}
            onPartReconcile={handlePartReconcile}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="service-expenses">
          <ServiceExpensesTab 
            expenses={expenses}
            engineers={engineers}
            onExpenseAdded={handleExpenseAdded}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceInventoryManagement;
