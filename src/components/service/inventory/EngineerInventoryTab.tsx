
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, FileText, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Engineer } from "@/types/service";
import { InventoryItem } from "@/types/inventory";
import WarehouseSelector from "@/components/inventory/warehouses/WarehouseSelector";
import { useWarehouses } from "@/hooks/warehouses/useWarehouses";

interface EngineerInventoryTabProps {
  engineers: Engineer[];
  inventoryItems: InventoryItem[];
  isLoading: boolean;
}

const EngineerInventoryTab = ({ engineers, inventoryItems, isLoading }: EngineerInventoryTabProps) => {
  const { toast } = useToast();
  const { warehouses, isLoadingWarehouses } = useWarehouses();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  
  // Mock data for engineer inventory - in a real app, this would come from the database
  const [engineerInventory, setEngineerInventory] = useState([
    { id: "1", engineerId: "eng-1", engineerName: "Rajesh Kumar", itemId: "1", itemName: "Kyocera TK-1175 Toner", quantity: 2, assignedDate: "2025-03-15" },
    { id: "2", engineerId: "eng-2", engineerName: "Deepak Sharma", itemId: "2", itemName: "Ricoh MP2014 Drum Unit", quantity: 1, assignedDate: "2025-03-10" },
    { id: "3", engineerId: "eng-1", engineerName: "Rajesh Kumar", itemId: "3", itemName: "Kyocera 2554ci Fuser", quantity: 1, assignedDate: "2025-02-28" },
  ]);
  
  // Form state for assigning items
  const [assignForm, setAssignForm] = useState({
    engineerId: "",
    itemId: "",
    quantity: 1,
    notes: ""
  });
  
  const filteredInventory = engineerInventory.filter(item => 
    item.engineerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleOpenAssignDialog = () => {
    setAssignForm({
      engineerId: "",
      itemId: "",
      quantity: 1,
      notes: ""
    });
    setIsAssignDialogOpen(true);
  };
  
  const handleOpenHistoryDialog = (engineer: Engineer) => {
    setSelectedEngineer(engineer);
    setIsHistoryDialogOpen(true);
  };
  
  const handleAssignItem = () => {
    // Validation
    if (!assignForm.engineerId) {
      toast({
        title: "Error",
        description: "Please select an engineer",
        variant: "destructive"
      });
      return;
    }
    
    if (!assignForm.itemId) {
      toast({
        title: "Error",
        description: "Please select an item",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedWarehouse) {
      toast({
        title: "Error",
        description: "Please select a warehouse to source the item from",
        variant: "destructive"
      });
      return;
    }
    
    // Find the engineer and item
    const engineer = engineers.find(eng => eng.id === assignForm.engineerId);
    const item = inventoryItems.find(item => item.id === assignForm.itemId);
    
    if (!engineer || !item) {
      toast({
        title: "Error",
        description: "Invalid engineer or item selection",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, you would call an API to update the database
    // For now, we'll update the local state
    const newInventoryItem = {
      id: `${Date.now()}`,
      engineerId: assignForm.engineerId,
      engineerName: engineer.name,
      itemId: assignForm.itemId,
      itemName: item.name,
      quantity: assignForm.quantity,
      assignedDate: new Date().toISOString().split('T')[0]
    };
    
    setEngineerInventory(prev => [...prev, newInventoryItem]);
    
    toast({
      title: "Item Assigned",
      description: `${assignForm.quantity} ${item.name} assigned to ${engineer.name}`,
    });
    
    setIsAssignDialogOpen(false);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading inventory data...</p>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Engineer Inventory</CardTitle>
          <CardDescription>Manage inventory assigned to service engineers</CardDescription>
        </div>
        <Button onClick={handleOpenAssignDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Assign Items
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by engineer or item..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <WarehouseSelector 
              warehouses={warehouses}
              selectedWarehouse={selectedWarehouse}
              onSelectWarehouse={setSelectedWarehouse}
              isLoading={isLoadingWarehouses}
            />
          </div>
          
          <Tabs defaultValue="assigned" className="space-y-4">
            <TabsList>
              <TabsTrigger value="assigned">Assigned Items</TabsTrigger>
              <TabsTrigger value="usage">Usage History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="assigned">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Engineer</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No inventory items found for engineers. Assign items to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.engineerName}</TableCell>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.assignedDate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              const engineer = engineers.find(eng => eng.id === item.engineerId);
                              if (engineer) handleOpenHistoryDialog(engineer);
                            }}>
                              <Receipt className="h-4 w-4" />
                              <span className="sr-only">History</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="usage">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Engineer</TableHead>
                    <TableHead>Item Used</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Service Call</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Item usage history will be displayed here when engineers use items on service calls.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      
      {/* Assign Item Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Assign Items to Engineer</DialogTitle>
            <DialogDescription>
              Select an engineer, item, and quantity to assign from the selected warehouse.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="engineer-select">Engineer</Label>
              <Select 
                value={assignForm.engineerId} 
                onValueChange={(value) => setAssignForm({ ...assignForm, engineerId: value })}
              >
                <SelectTrigger id="engineer-select">
                  <SelectValue placeholder="Select Engineer" />
                </SelectTrigger>
                <SelectContent>
                  {engineers.map((engineer) => (
                    <SelectItem key={engineer.id} value={engineer.id}>
                      {engineer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="warehouse-select">Source Warehouse</Label>
              <WarehouseSelector 
                warehouses={warehouses}
                selectedWarehouse={selectedWarehouse}
                onSelectWarehouse={setSelectedWarehouse}
                isLoading={isLoadingWarehouses}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="item-select">Item</Label>
              <Select 
                value={assignForm.itemId} 
                onValueChange={(value) => setAssignForm({ ...assignForm, itemId: value })}
              >
                <SelectTrigger id="item-select">
                  <SelectValue placeholder="Select Item" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.currentQuantity} available)
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
                value={assignForm.quantity}
                onChange={(e) => setAssignForm({ ...assignForm, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={assignForm.notes}
                onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                placeholder="Add any additional information"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignItem}>
              Assign Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Usage History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {selectedEngineer ? `Usage History for ${selectedEngineer.name}` : 'Usage History'}
            </DialogTitle>
            <DialogDescription>
              Record of items used by this engineer on service calls
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Service Call</TableHead>
                  <TableHead>Customer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No usage history found for this engineer.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsHistoryDialogOpen(false)}>
              Close
            </Button>
            <Button variant="outline" onClick={() => {
              toast({
                title: "Export Completed",
                description: "Usage history has been exported to CSV"
              });
            }}>
              <FileText className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EngineerInventoryTab;
