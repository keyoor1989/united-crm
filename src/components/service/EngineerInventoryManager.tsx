
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
import { TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Engineer } from "@/types/service";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { InventoryItem, EngineerInventory } from "@/types/inventory";
import { CornerRightDown, Package, ReplyAll, Truck, Check, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Mock engineer inventory data
const mockEngineerInventory: EngineerInventory[] = [
  {
    id: "1",
    engineerId: "eng1",
    engineerName: "Rahul Verma",
    itemId: "item1",
    itemName: "Kyocera TK-1175 Toner",
    assignedQuantity: 3,
    remainingQuantity: 2,
    lastUpdated: "2025-04-10T10:00:00Z",
    createdAt: "2025-04-10T10:00:00Z"
  },
  {
    id: "2",
    engineerId: "eng1",
    engineerName: "Rahul Verma",
    itemId: "item2",
    itemName: "Canon NPG-59 Drum Unit",
    assignedQuantity: 1,
    remainingQuantity: 1,
    lastUpdated: "2025-04-10T10:00:00Z",
    createdAt: "2025-04-10T10:00:00Z"
  },
  {
    id: "3",
    engineerId: "eng2",
    engineerName: "Deepak Kumar",
    itemId: "item1",
    itemName: "Kyocera TK-1175 Toner",
    assignedQuantity: 2,
    remainingQuantity: 1,
    lastUpdated: "2025-04-10T10:00:00Z",
    createdAt: "2025-04-10T10:00:00Z"
  }
];

interface EngineerInventoryManagerProps {
  engineers: Engineer[];
  inventoryItems: InventoryItem[];
}

const EngineerInventoryManager = ({ engineers, inventoryItems }: EngineerInventoryManagerProps) => {
  const { toast } = useToast();
  const [engineerInventory, setEngineerInventory] = useState<EngineerInventory[]>(mockEngineerInventory);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [returnItemId, setReturnItemId] = useState<string>("");
  const [returnQuantity, setReturnQuantity] = useState<number>(1);
  const [returnReason, setReturnReason] = useState<string>("Unused");
  
  const handleIssueItem = () => {
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
    
    // Check if the item already exists in the engineer's inventory
    const existingInventory = engineerInventory.find(
      inv => inv.engineerId === selectedEngineerId && inv.itemId === selectedItemId
    );
    
    if (existingInventory) {
      // Update existing entry
      setEngineerInventory(prev =>
        prev.map(inv => {
          if (inv.id === existingInventory.id) {
            return {
              ...inv,
              assignedQuantity: inv.assignedQuantity + quantity,
              remainingQuantity: inv.remainingQuantity + quantity,
              lastUpdated: new Date().toISOString()
            };
          }
          return inv;
        })
      );
    } else {
      // Create new entry
      const newInventoryItem: EngineerInventory = {
        id: uuidv4(),
        engineerId: selectedEngineerId,
        engineerName: engineer.name,
        itemId: selectedItemId,
        itemName: item.name,
        assignedQuantity: quantity,
        remainingQuantity: quantity,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      setEngineerInventory(prev => [...prev, newInventoryItem]);
    }
    
    toast({
      title: "Item Issued",
      description: `${quantity} ${item.name} issued to ${engineer.name}`,
    });
    
    // Reset form
    setSelectedEngineerId("");
    setSelectedItemId("");
    setQuantity(1);
    setShowIssueDialog(false);
  };
  
  const handleReturnItem = () => {
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
    
    // Update the inventory
    setEngineerInventory(prev =>
      prev.map(inv => {
        if (inv.id === returnItemId) {
          const newRemainingQuantity = inv.remainingQuantity - returnQuantity;
          
          // If remaining quantity is 0, remove the entry
          if (newRemainingQuantity <= 0 && inv.assignedQuantity === returnQuantity) {
            return null;
          }
          
          return {
            ...inv,
            remainingQuantity: newRemainingQuantity,
            assignedQuantity: inv.assignedQuantity - returnQuantity,
            lastUpdated: new Date().toISOString()
          };
        }
        return inv;
      }).filter(Boolean) as EngineerInventory[]
    );
    
    toast({
      title: "Item Returned",
      description: `${returnQuantity} ${inventoryItem.itemName} returned to warehouse`,
    });
    
    // Reset form
    setReturnItemId("");
    setReturnQuantity(1);
    setReturnReason("Unused");
    setShowReturnDialog(false);
  };
  
  // Group inventory items by engineer
  const groupedInventory = engineers.map(engineer => {
    const items = engineerInventory.filter(item => item.engineerId === engineer.id);
    return {
      engineer,
      items
    };
  }).filter(group => group.items.length > 0);
  
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
                      <TableHead className="text-right">Assigned</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                      <TableHead className="text-right">Used</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.itemName}</TableCell>
                        <TableCell className="text-right">{item.assignedQuantity}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={item.remainingQuantity > 0 ? "outline" : "destructive"}>
                            {item.remainingQuantity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.assignedQuantity - item.remainingQuantity}
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
      
      {/* Issue Items Dialog */}
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
                      {item.name} (Stock: {item.currentQuantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
      
      {/* Return Items Dialog */}
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
                      {item.itemName} ({item.engineerName} - {item.remainingQuantity} remaining)
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
