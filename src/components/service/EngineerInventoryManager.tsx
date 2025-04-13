import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Engineer } from "@/types/service";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Package, ReplyAll, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { EngineerInventoryItem } from "@/hooks/inventory/useEngineerInventory";

interface EngineerInventoryManagerProps {
  engineers: Engineer[];
  inventoryItems: any[];
  engineerInventory: EngineerInventoryItem[];
  selectedWarehouse: string | null;
}

const EngineerInventoryManager = ({ 
  engineers, 
  inventoryItems, 
  engineerInventory,
  selectedWarehouse 
}: EngineerInventoryManagerProps) => {
  const { toast } = useToast();
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [modelNumber, setModelNumber] = useState<string>("");
  const [modelBrand, setModelBrand] = useState<string>("");
  const [returnItemId, setReturnItemId] = useState<string>("");
  const [returnQuantity, setReturnQuantity] = useState<number>(1);
  const [returnReason, setReturnReason] = useState<string>("Unused");
  const [returnCondition, setReturnCondition] = useState<string>("Good");
  const [returnNotes, setReturnNotes] = useState<string>("");
  
  const handleIssueItem = async () => {
    try {
      if (!selectedEngineerId || !selectedItemId || quantity <= 0) {
        toast({
          title: "Error",
          description: "Please fill all the required fields",
          variant: "destructive"
        });
        return;
      }
      
      const engineer = engineers.find(e => e.id === selectedEngineerId);
      const item = inventoryItems.find(i => i.id === selectedItemId);
      
      if (!engineer || !item) {
        toast({
          title: "Error",
          description: "Invalid engineer or item selection",
          variant: "destructive"
        });
        return;
      }
      
      const issueData = {
        engineer_id: selectedEngineerId,
        engineer_name: engineer.name,
        item_id: selectedItemId,
        item_name: item.part_name || item.name,
        quantity: quantity,
        assigned_date: new Date().toISOString(),
        warehouse_id: selectedWarehouse,
        warehouse_source: selectedWarehouse ? 
          (await supabase.from('warehouses').select('name').eq('id', selectedWarehouse).single()).data?.name 
          : "Main Warehouse",
        model_number: modelNumber || null,
        model_brand: modelBrand || null
      };
      
      console.log("Issuing item with data:", issueData);
      
      const { error } = await supabase
        .from('engineer_inventory')
        .insert(issueData);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `${quantity} ${item.part_name || item.name} issued to ${engineer.name}`,
      });
      
      setSelectedEngineerId("");
      setSelectedItemId("");
      setQuantity(1);
      setModelNumber("");
      setModelBrand("");
      setShowIssueDialog(false);
      
    } catch (error) {
      console.error("Error issuing item:", error);
      toast({
        title: "Error",
        description: "Failed to issue item. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleReturnItem = async () => {
    try {
      if (!returnItemId || returnQuantity <= 0) {
        toast({
          title: "Error",
          description: "Please fill all the required fields",
          variant: "destructive"
        });
        return;
      }
      
      const inventoryItem = engineerInventory.find(item => item.id === returnItemId);
      
      if (!inventoryItem) {
        toast({
          title: "Error",
          description: "Invalid item selection",
          variant: "destructive"
        });
        return;
      }
      
      if (returnQuantity > inventoryItem.remainingQuantity) {
        toast({
          title: "Error",
          description: `Cannot return more than the remaining quantity (${inventoryItem.remainingQuantity})`,
          variant: "destructive"
        });
        return;
      }
      
      const returnData = {
        engineer_id: inventoryItem.engineerId,
        engineer_name: inventoryItem.engineerName,
        item_id: inventoryItem.itemId,
        item_name: inventoryItem.itemName,
        quantity: returnQuantity,
        return_date: new Date().toISOString(),
        reason: returnReason,
        condition: returnCondition,
        notes: returnNotes,
        warehouse_id: selectedWarehouse,
        warehouse_name: selectedWarehouse ? 
          (await supabase.from('warehouses').select('name').eq('id', selectedWarehouse).single()).data?.name 
          : "Main Warehouse"
      };
      
      const { error: returnError } = await supabase
        .from('inventory_returns')
        .insert(returnData);
      
      if (returnError) throw returnError;
      
      toast({
        title: "Item Returned",
        description: `${returnQuantity} ${inventoryItem.itemName} returned to warehouse`,
      });
      
      setReturnItemId("");
      setReturnQuantity(1);
      setReturnReason("Unused");
      setReturnCondition("Good");
      setReturnNotes("");
      setShowReturnDialog(false);
      
    } catch (error) {
      console.error("Error returning item:", error);
      toast({
        title: "Error",
        description: "Failed to return item. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const groupedInventory = engineers
    .filter(engineer => engineerInventory.some(item => item.engineerId === engineer.id))
    .map(engineer => {
      const items = engineerInventory.filter(item => item.engineerId === engineer.id);
      return {
        engineer,
        items
      };
    });
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Engineer Inventory Management</CardTitle>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowIssueDialog(true)}
            size="sm" 
            className="flex items-center gap-2"
          >
            <Truck className="h-4 w-4" />
            Issue Items
          </Button>
          <Button 
            onClick={() => setShowReturnDialog(true)}
            size="sm" 
            variant="outline"
            className="flex items-center gap-2"
          >
            <ReplyAll className="h-4 w-4" />
            Return Items
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {groupedInventory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="mx-auto h-12 w-12 mb-2 text-muted-foreground/50" />
            <p>No items have been issued to engineers yet</p>
            <Button 
              onClick={() => setShowIssueDialog(true)}
              variant="outline" 
              className="mt-4"
            >
              Issue Items to Engineers
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedInventory.map(group => (
              <div key={group.engineer.id} className="space-y-3">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold">{group.engineer.name}</h3>
                  <Badge variant="outline" className="ml-2">
                    {group.engineer.status}
                  </Badge>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead className="text-right">Assigned</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.itemName}</TableCell>
                        <TableCell>{item.modelNumber || "—"}</TableCell>
                        <TableCell>{item.modelBrand || "—"}</TableCell>
                        <TableCell className="text-right">{item.assignedQuantity}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">
                            {item.remainingQuantity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(item.lastUpdated).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setReturnItemId(item.id);
                              setReturnQuantity(1);
                              setShowReturnDialog(true);
                            }}
                          >
                            <ReplyAll className="h-4 w-4 mr-1" />
                            Return
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Items to Engineer</DialogTitle>
            <DialogDescription>
              Select an engineer, item, and quantity to issue.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="engineer">Engineer</Label>
              <Select
                value={selectedEngineerId}
                onValueChange={setSelectedEngineerId}
              >
                <SelectTrigger id="engineer">
                  <SelectValue placeholder="Select engineer" />
                </SelectTrigger>
                <SelectContent>
                  {engineers.map(engineer => (
                    <SelectItem key={engineer.id} value={engineer.id}>
                      {engineer.name} ({engineer.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="item">Item</Label>
              <Select
                value={selectedItemId}
                onValueChange={setSelectedItemId}
              >
                <SelectTrigger id="item">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.part_name || item.name} (Stock: {item.quantity || item.currentStock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modelNumber">Model Number</Label>
              <Input
                id="modelNumber"
                placeholder="e.g., DK-1150"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modelBrand">Brand</Label>
              <Input
                id="modelBrand"
                placeholder="e.g., Kyocera"
                value={modelBrand}
                onChange={(e) => setModelBrand(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIssueDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleIssueItem}>
              <Truck className="h-4 w-4 mr-2" />
              Issue Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Items to Warehouse</DialogTitle>
            <DialogDescription>
              Select an item and quantity to return to the warehouse.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="returnItem">Item</Label>
              <Select
                value={returnItemId}
                onValueChange={setReturnItemId}
              >
                <SelectTrigger id="returnItem">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {engineerInventory.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.itemName}{item.modelNumber ? ` (${item.modelNumber})` : ''} - {item.engineerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="returnQuantity">Quantity</Label>
              <Input
                id="returnQuantity"
                type="number"
                min="1"
                value={returnQuantity}
                onChange={(e) => setReturnQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="returnReason">Reason for Return</Label>
              <Select
                value={returnReason}
                onValueChange={setReturnReason}
              >
                <SelectTrigger id="returnReason">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unused">Unused</SelectItem>
                  <SelectItem value="Defective">Defective</SelectItem>
                  <SelectItem value="Excess">Excess</SelectItem>
                  <SelectItem value="Wrong Item">Wrong Item</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="returnCondition">Item Condition</Label>
              <Select
                value={returnCondition}
                onValueChange={setReturnCondition}
              >
                <SelectTrigger id="returnCondition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                  <SelectItem value="Needs Repair">Needs Repair</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="returnNotes">Notes (Optional)</Label>
              <Input
                id="returnNotes"
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="Additional notes about the return"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReturnItem}>
              <ReplyAll className="h-4 w-4 mr-2" />
              Return Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EngineerInventoryManager;
