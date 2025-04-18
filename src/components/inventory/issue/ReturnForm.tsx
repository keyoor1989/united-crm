
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { AlertCircle, ReplyAll } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WarehouseSelector from "@/components/inventory/warehouses/WarehouseSelector";
import { useWarehouses } from "@/hooks/warehouses/useWarehouses";
import { useEngineers } from "@/hooks/inventory/useEngineers";
import { useEngineerItems } from "@/hooks/inventory/useEngineerItems";
import { useReturnItem, ReturnReason, ItemCondition } from "@/hooks/inventory/useReturnItem";
import { useReturnedItems } from "@/hooks/inventory/useReturnedItems";
import ReturnHistoryTable from "./ReturnHistoryTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

const ReturnForm = () => {
  // State
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [selectedEngineer, setSelectedEngineer] = useState<string>("");
  const [selectedReturnItem, setSelectedReturnItem] = useState<string>("");
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [returnReason, setReturnReason] = useState<ReturnReason>("Unused");
  const [itemCondition, setItemCondition] = useState<ItemCondition>("Good");
  const [returnNotes, setReturnNotes] = useState("");
  const [activeTab, setActiveTab] = useState("form");
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const { warehouses, isLoadingWarehouses } = useWarehouses();
  const { engineers, isLoading: isLoadingEngineers } = useEngineers();
  const { items: engineerItems, isLoading: isLoadingEngineerItems } = useEngineerItems(selectedEngineer);
  const { items: returnedItems, isLoading: isLoadingReturnedItems } = useReturnedItems();
  const returnMutation = useReturnItem();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedEngineer) {
      setError("Please select an engineer");
      return;
    }

    if (!selectedReturnItem) {
      setError("Please select an item to return");
      return;
    }

    if (returnQuantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    if (!selectedWarehouse) {
      setError("Please select a warehouse for return");
      return;
    }

    const item = engineerItems.find(item => item.id === selectedReturnItem);
    if (!item) {
      setError("Selected item not found in engineer's inventory");
      return;
    }

    if (returnQuantity > item.quantity) {
      setError(`Cannot return more than the available quantity (${item.quantity})`);
      return;
    }

    const engineerName = engineers.find(eng => eng.id === selectedEngineer)?.name || 'Unknown Engineer';
    const warehouseInfo = warehouses.find(w => w.id === selectedWarehouse);
    
    returnMutation.mutate({
      engineerId: selectedEngineer,
      engineerName,
      engineerItemId: selectedReturnItem,
      itemId: item.item_id,
      itemName: item.item_name,
      returnQuantity,
      warehouseId: selectedWarehouse,
      warehouseName: warehouseInfo?.name || null,
      reason: returnReason,
      condition: itemCondition,
      notes: returnNotes || undefined
    }, {
      onSuccess: () => {
        // Reset form
        setSelectedReturnItem("");
        setReturnQuantity(1);
        setReturnReason("Unused");
        setItemCondition("Good");
        setReturnNotes("");
        setError(null);
        toast.success("Item successfully returned to inventory");
      }
    });
  };

  const selectedItem = selectedReturnItem 
    ? engineerItems.find(item => item.id === selectedReturnItem) 
    : null;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="w-full">
        <TabsTrigger value="form" className="flex-1">Return Form</TabsTrigger>
        <TabsTrigger value="history" className="flex-1">Return History</TabsTrigger>
      </TabsList>
      
      <TabsContent value="form">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {returnMutation.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Submission Error</AlertTitle>
            <AlertDescription>{returnMutation.error.message}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-6">
            <Label className="text-base font-medium block mb-2">Return To Warehouse</Label>
            <WarehouseSelector 
              warehouses={warehouses}
              selectedWarehouse={selectedWarehouse}
              onSelectWarehouse={setSelectedWarehouse}
              isLoading={isLoadingWarehouses}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="engineer">Select Engineer</Label>
              <Select 
                value={selectedEngineer} 
                onValueChange={(value) => {
                  setSelectedEngineer(value);
                  setSelectedReturnItem(""); // Reset item selection when engineer changes
                }}
              >
                <SelectTrigger id="engineer">
                  <SelectValue placeholder="Select engineer" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingEngineers ? (
                    <SelectItem value="loading" disabled>Loading engineers...</SelectItem>
                  ) : engineers.length > 0 ? (
                    engineers.map(engineer => (
                      <SelectItem key={engineer.id} value={engineer.id}>
                        {engineer.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-engineers" disabled>No engineers found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="returnItem">Select Item</Label>
              <Select 
                value={selectedReturnItem} 
                onValueChange={setSelectedReturnItem}
                disabled={!selectedEngineer || isLoadingEngineerItems}
              >
                <SelectTrigger id="returnItem">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingEngineerItems ? (
                    <SelectItem value="loading" disabled>Loading items...</SelectItem>
                  ) : engineerItems.length === 0 ? (
                    <SelectItem value="no-items" disabled>No items found for this engineer</SelectItem>
                  ) : (
                    engineerItems.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.item_name} ({item.modelNumber ? `${item.modelNumber}, ` : ''}Qty: {item.quantity})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="returnQuantity">Quantity</Label>
              <Input
                id="returnQuantity"
                type="number"
                min="1"
                max={selectedItem?.quantity || 1}
                value={returnQuantity}
                onChange={(e) => setReturnQuantity(parseInt(e.target.value) || 1)}
                disabled={!selectedReturnItem}
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="returnReason">Return Reason</Label>
              <Select 
                value={returnReason} 
                onValueChange={(value) => setReturnReason(value as ReturnReason)}
              >
                <SelectTrigger id="returnReason">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unused">Unused</SelectItem>
                  <SelectItem value="Defective">Defective</SelectItem>
                  <SelectItem value="Wrong Item">Wrong Item</SelectItem>
                  <SelectItem value="Excess">Excess Quantity</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="itemCondition">Item Condition</Label>
              <Select 
                value={itemCondition} 
                onValueChange={(value) => setItemCondition(value as ItemCondition)}
              >
                <SelectTrigger id="itemCondition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Good">Good (Can be restocked)</SelectItem>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                  <SelectItem value="Needs Inspection">Needs Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="returnNotes">Notes (Optional)</Label>
            <Textarea
              id="returnNotes"
              placeholder="Enter any additional notes about this return"
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <Button 
            type="submit" 
            variant="outline" 
            className="w-full mt-6" 
            disabled={!selectedReturnItem || !selectedWarehouse || returnMutation.isPending}
          >
            {returnMutation.isPending ? (
              <>Processing...</>
            ) : (
              <>
                <ReplyAll className="mr-2 h-4 w-4" />
                Return Item to Inventory
              </>
            )}
          </Button>
        </form>
      </TabsContent>
      
      <TabsContent value="history">
        <ReturnHistoryTable returns={returnedItems} isLoading={isLoadingReturnedItems} />
      </TabsContent>
    </Tabs>
  );
};

export default ReturnForm;
