
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServiceData } from "@/hooks/useServiceData";
import EngineerInventoryManager from "@/components/service/EngineerInventoryManager";
import PartsReconciliationTable from "@/components/service/PartsReconciliationTable";
import { Truck, CheckSquare, ReceiptText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ServiceCall } from "@/types/service";
import { InventoryItem } from "@/types/inventory";
import ServiceExpenseForm from "@/components/service/ServiceExpenseForm";
import ServiceExpenseList from "@/components/service/ServiceExpenseList";
import { ServiceExpense } from "@/types/serviceExpense";

// Sample inventory items
const mockInventoryItems: InventoryItem[] = [
  { 
    id: "item1", 
    modelId: "model1", 
    brandId: "brand1", 
    name: "Kyocera TK-1175 Toner", 
    type: "Toner", 
    minQuantity: 5, 
    currentQuantity: 12, 
    lastPurchasePrice: 4500, 
    lastVendor: "Kyocera Distributor", 
    barcode: "KYO-TK1175", 
    createdAt: "2025-03-15T10:00:00Z" 
  },
  { 
    id: "item2", 
    modelId: "model2", 
    brandId: "brand2", 
    name: "Canon NPG-59 Drum Unit", 
    type: "Drum", 
    minQuantity: 2, 
    currentQuantity: 4, 
    lastPurchasePrice: 6800, 
    lastVendor: "Canon India", 
    barcode: "CAN-NPG59", 
    createdAt: "2025-03-18T10:00:00Z" 
  },
  { 
    id: "item3", 
    modelId: "model3", 
    brandId: "brand1", 
    name: "Ricoh 1015 Drum Unit", 
    type: "Drum", 
    minQuantity: 1, 
    currentQuantity: 3, 
    lastPurchasePrice: 7500, 
    lastVendor: "Ricoh Distributor", 
    barcode: "RIC-1015-DRM", 
    createdAt: "2025-03-20T10:00:00Z" 
  },
  { 
    id: "item4", 
    modelId: "model4", 
    brandId: "brand2", 
    name: "Drum Cleaning Blade", 
    type: "Other", 
    minQuantity: 5, 
    currentQuantity: 15, 
    lastPurchasePrice: 500, 
    lastVendor: "Parts Supplier", 
    barcode: "DCB-UNIVERSAL", 
    createdAt: "2025-03-25T10:00:00Z" 
  }
];

const ServiceInventoryManagement = () => {
  const { toast } = useToast();
  const { allCalls, engineers, isLoading } = useServiceData();
  const [serviceCalls, setServiceCalls] = useState<ServiceCall[]>(allCalls);
  const [activeTab, setActiveTab] = useState("engineer-inventory");
  const [expenses, setExpenses] = useState<ServiceExpense[]>([]);
  
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Service Inventory Management</h1>
        <p className="text-muted-foreground">
          Manage inventory for service engineers and track parts reconciliation
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading inventory data...</p>
        </div>
      ) : (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
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
          
          <TabsContent value="engineer-inventory">
            <EngineerInventoryManager 
              engineers={engineers} 
              inventoryItems={mockInventoryItems} 
            />
          </TabsContent>
          
          <TabsContent value="parts-reconciliation">
            <PartsReconciliationTable 
              serviceCalls={serviceCalls}
              onReconcile={handleReconcile}
              onPartReconcile={handlePartReconcile}
            />
          </TabsContent>
          
          <TabsContent value="service-expenses">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <ServiceExpenseForm 
                  serviceCallId="dummy-service-call"
                  engineerId={engineers[0]?.id || ""}
                  engineerName={engineers[0]?.name || ""}
                  onExpenseAdded={handleExpenseAdded}
                />
              </div>
              <div className="md:col-span-2">
                <ServiceExpenseList expenses={expenses} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ServiceInventoryManagement;
