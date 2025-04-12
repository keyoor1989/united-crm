import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Package, Scan, Send, CheckCircle2, ShoppingBag, Building, User, ArrowLeft, ReplyAll } from "lucide-react";
import { IssueType, Brand, Model, InventoryItem } from "@/types/inventory";
import ItemSelector from "@/components/inventory/ItemSelector";
import WarehouseSelector from "@/components/inventory/warehouses/WarehouseSelector";
import { useWarehouses } from "@/hooks/warehouses/useWarehouses";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EngineerInventoryItem, InventoryReturnItem } from "@/components/service/inventory/mockData";
import { Skeleton } from "@/components/ui/skeleton";

type ReturnReason = "Unused" | "Defective" | "Wrong Item" | "Excess" | "Other";
type ItemCondition = "Good" | "Damaged" | "Needs Inspection";

const inventoryItems: InventoryItem[] = [
  { 
    id: "1", 
    modelId: "1", 
    brandId: "1", 
    name: "Kyocera 2554ci Toner Black", 
    type: "Toner", 
    minQuantity: 2, 
    currentQuantity: 3, 
    lastPurchasePrice: 4500, 
    lastVendor: "Toner World", 
    barcode: "KYO-TN2554-BK-001", 
    createdAt: "2025-03-10" 
  },
  { 
    id: "2", 
    modelId: "2", 
    brandId: "2", 
    name: "Ricoh MP2014 Drum Unit", 
    type: "Drum", 
    minQuantity: 1, 
    currentQuantity: 2, 
    lastPurchasePrice: 3200, 
    lastVendor: "Copier Zone", 
    barcode: "RICOH-DU2014-001", 
    createdAt: "2025-03-11" 
  },
  { 
    id: "3", 
    modelId: "3", 
    brandId: "3", 
    name: "Xerox 7845 Toner Cyan", 
    type: "Toner", 
    minQuantity: 2, 
    currentQuantity: 1, 
    lastPurchasePrice: 5600, 
    lastVendor: "Printer Parts", 
    barcode: "XER-TN7845-C-001", 
    createdAt: "2025-03-12" 
  },
  { 
    id: "4", 
    modelId: "4", 
    brandId: "4", 
    name: "Canon 2525 Drum Unit", 
    type: "Drum", 
    minQuantity: 1, 
    currentQuantity: 4, 
    lastPurchasePrice: 4200, 
    lastVendor: "Canon Supplies", 
    barcode: "CAN-DRM2525-001", 
    createdAt: "2025-03-13" 
  },
  { 
    id: "5", 
    modelId: "5", 
    brandId: "5", 
    name: "HP M428 Toner", 
    type: "Toner", 
    minQuantity: 3, 
    currentQuantity: 7, 
    lastPurchasePrice: 2800, 
    lastVendor: "HP Store", 
    barcode: "HP-TNM428-002", 
    createdAt: "2025-03-14" 
  }
];

const mockBrands: Brand[] = [
  { id: "1", name: "Kyocera", createdAt: "2025-03-01", updatedAt: "2025-03-01" },
  { id: "2", name: "Ricoh", createdAt: "2025-03-02", updatedAt: "2025-03-02" },
  { id: "3", name: "Xerox", createdAt: "2025-03-03", updatedAt: "2025-03-03" },
  { id: "4", name: "Canon", createdAt: "2025-03-04", updatedAt: "2025-03-04" },
  { id: "5", name: "HP", createdAt: "2025-03-05", updatedAt: "2025-03-05" }
];

const mockModels: Model[] = [
  { id: "1", brandId: "1", name: "2554ci", type: "Machine", createdAt: "2025-03-01", updatedAt: "2025-03-01" },
  { id: "2", brandId: "2", name: "MP2014", type: "Machine", createdAt: "2025-03-02", updatedAt: "2025-03-02" },
  { id: "3", brandId: "3", name: "7845", type: "Machine", createdAt: "2025-03-03", updatedAt: "2025-03-03" },
  { id: "4", brandId: "4", name: "2525", type: "Machine", createdAt: "2025-03-04", updatedAt: "2025-03-04" },
  { id: "5", brandId: "5", name: "M428", type: "Machine", createdAt: "2025-03-05", updatedAt: "2025-03-05" }
];

type Engineer = {
  id: string;
  name: string;
};

type Branch = {
  id: string;
  name: string;
};

type Customer = {
  id: string;
  name: string;
};

const InventoryIssue = () => {
  const queryClient = useQueryClient();
  const [issueType, setIssueType] = useState<IssueType>("Engineer");
  const [quantity, setQuantity] = useState(1);
  const [receiverName, setReceiverName] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [billType, setBillType] = useState("Non-GST");
  const [activeTab, setActiveTab] = useState("form");
  const { warehouses, isLoadingWarehouses } = useWarehouses();
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [returnTab, setReturnTab] = useState("return-form");
  const [selectedEngineer, setSelectedEngineer] = useState("");
  const [engineerItems, setEngineerItems] = useState<EngineerInventoryItem[]>([]);
  const [selectedReturnItem, setSelectedReturnItem] = useState("");
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [returnReason, setReturnReason] = useState<ReturnReason>("Unused");
  const [itemCondition, setItemCondition] = useState<ItemCondition>("Good");
  const [returnNotes, setReturnNotes] = useState("");

  const { data: engineers = [], isLoading: isLoadingEngineers } = useQuery({
    queryKey: ['engineers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engineers')
        .select('id, name')
        .order('name');
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Engineer[];
    }
  });

  const { data: issuedItems = [], isLoading: isLoadingIssuedItems } = useQuery({
    queryKey: ['engineerInventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('engineer_inventory')
        .select('*')
        .order('assigned_date', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as EngineerInventoryItem[];
    }
  });

  const { data: returnedItems = [], isLoading: isLoadingReturnedItems } = useQuery({
    queryKey: ['inventoryReturns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_returns')
        .select('*')
        .order('return_date', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as InventoryReturnItem[];
    }
  });

  const issueMutation = useMutation({
    mutationFn: async (issueData: Omit<EngineerInventoryItem, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('engineer_inventory')
        .insert(issueData)
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engineerInventory'] });
      toast.success(`${quantity} × ${selectedItem?.name} issued to ${receiverName}`);
      
      setSelectedItem(null);
      setQuantity(1);
      setReceiverName("");
      setReceiverId("");
    },
    onError: (error) => {
      toast.error(`Error issuing item: ${error.message}`);
    }
  });

  const returnMutation = useMutation({
    mutationFn: async (returnData: Omit<InventoryReturnItem, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('inventory_returns')
        .insert(returnData)
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryReturns'] });
      
      const item = engineerItems.find(item => item.id === selectedReturnItem);
      if (item) {
        const remainingQuantity = item.quantity - returnQuantity;
        
        if (remainingQuantity <= 0) {
          supabase
            .from('engineer_inventory')
            .delete()
            .eq('id', item.id)
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ['engineerInventory'] });
            });
        } else {
          supabase
            .from('engineer_inventory')
            .update({ quantity: remainingQuantity })
            .eq('id', item.id)
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ['engineerInventory'] });
            });
        }
      }
      
      const engineerName = engineers.find(eng => eng.id === selectedEngineer)?.name;
      const warehouseName = warehouses.find(w => w.id === selectedWarehouse)?.name;
      
      toast.success(`Item returned from ${engineerName} to ${warehouseName}`);
      
      setSelectedEngineer("");
      setSelectedReturnItem("");
      setReturnQuantity(1);
      setReturnReason("Unused");
      setItemCondition("Good");
      setReturnNotes("");
      setEngineerItems([]);
    },
    onError: (error) => {
      toast.error(`Error returning item: ${error.message}`);
    }
  });

  const branches: Branch[] = [
    { id: "1", name: "Indore Office" },
    { id: "2", name: "Bhopal Office" },
    { id: "3", name: "Jabalpur Office" }
  ];

  const customers: Customer[] = [
    { id: "1", name: "ABC Technologies" },
    { id: "2", name: "XYZ Solutions" },
    { id: "3", name: "Tech Innovations" }
  ];

  const handleEngineerSelection = async (engineerId: string) => {
    setSelectedEngineer(engineerId);
    setSelectedReturnItem("");
    
    try {
      const { data, error } = await supabase
        .from('engineer_inventory')
        .select('*')
        .eq('engineer_id', engineerId);
      
      if (error) {
        throw error;
      }
      
      setEngineerItems(data as EngineerInventoryItem[]);
    } catch (error) {
      console.error('Error fetching engineer items:', error);
      toast.error('Failed to fetch engineer items');
      setEngineerItems([]);
    }
  };

  const handleItemSelected = (item: InventoryItem) => {
    setSelectedItem(item);
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem) {
      toast.warning("Please select an item to issue");
      return;
    }

    if (!receiverName || !receiverId) {
      toast.warning(`Please select a ${issueType.toLowerCase()} to issue to`);
      return;
    }

    if (quantity <= 0) {
      toast.warning("Quantity must be greater than 0");
      return;
    }

    if (!selectedWarehouse) {
      toast.warning("Please select a warehouse");
      return;
    }

    const warehouseInfo = warehouses.find(w => w.id === selectedWarehouse);
    
    const issueData: Omit<EngineerInventoryItem, 'id' | 'created_at'> = {
      engineer_id: receiverId,
      engineer_name: receiverName,
      item_id: selectedItem.id,
      item_name: selectedItem.name,
      quantity: quantity,
      assigned_date: new Date().toISOString(),
      warehouse_id: selectedWarehouse,
      warehouse_source: warehouseInfo?.name || 'Unknown Warehouse'
    };
    
    issueMutation.mutate(issueData);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEngineer) {
      toast.warning("Please select an engineer");
      return;
    }

    if (!selectedReturnItem) {
      toast.warning("Please select an item to return");
      return;
    }

    if (returnQuantity <= 0) {
      toast.warning("Quantity must be greater than 0");
      return;
    }

    if (!selectedWarehouse) {
      toast.warning("Please select a warehouse for return");
      return;
    }

    const item = engineerItems.find(item => item.id === selectedReturnItem);
    if (!item) {
      toast.error("Item not found");
      return;
    }

    if (returnQuantity > item.quantity) {
      toast.warning(`Cannot return more than the available quantity (${item.quantity})`);
      return;
    }

    const engineerName = engineers.find(eng => eng.id === selectedEngineer)?.name || 'Unknown Engineer';
    const warehouseInfo = warehouses.find(w => w.id === selectedWarehouse);
    
    const returnData: Omit<InventoryReturnItem, 'id' | 'created_at'> = {
      engineer_id: selectedEngineer,
      engineer_name: engineerName,
      item_id: item.item_id,
      item_name: item.item_name,
      quantity: returnQuantity,
      return_date: new Date().toISOString(),
      reason: returnReason,
      condition: itemCondition,
      warehouse_id: selectedWarehouse,
      warehouse_name: warehouseInfo?.name || 'Unknown Warehouse',
      notes: returnNotes || undefined
    };
    
    returnMutation.mutate(returnData);
  };

  const handleReceiverSelection = (id: string, name: string) => {
    setReceiverId(id);
    setReceiverName(name);
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Issue & Return Entry</h1>
          <p className="text-muted-foreground">Issue inventory to engineers or receive returns</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Send size={16} />
            <span>Issue Item</span>
          </TabsTrigger>
          <TabsTrigger value="return" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            <span>Return Item</span>
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Recent Activities</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleIssueSubmit} className="space-y-4">
                <div className="mb-6">
                  <Label className="text-base font-medium">Select Warehouse</Label>
                  <WarehouseSelector 
                    warehouses={warehouses}
                    selectedWarehouse={selectedWarehouse}
                    onSelectWarehouse={setSelectedWarehouse}
                    isLoading={isLoadingWarehouses}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="issueType">Issue Type</Label>
                    <Select 
                      value={issueType} 
                      onValueChange={(value) => {
                        setIssueType(value as IssueType);
                        setReceiverName("");
                        setReceiverId("");
                      }}
                    >
                      <SelectTrigger id="issueType">
                        <SelectValue placeholder="Select issue type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineer" className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-blue-500" />
                            <span>Engineer</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Customer">
                          <div className="flex items-center gap-2">
                            <ShoppingBag size={16} className="text-green-500" />
                            <span>Customer</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Branch">
                          <div className="flex items-center gap-2">
                            <Building size={16} className="text-purple-500" />
                            <span>Branch</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="receiver">{issueType} Name</Label>
                    <Select 
                      onValueChange={(value) => {
                        const [id, name] = value.split('|');
                        handleReceiverSelection(id, name);
                      }}
                    >
                      <SelectTrigger id="receiver">
                        <SelectValue placeholder={`Select ${issueType.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingEngineers && issueType === "Engineer" ? (
                          <SelectItem value="loading" disabled>Loading engineers...</SelectItem>
                        ) : issueType === "Engineer" && engineers.map(engineer => (
                          <SelectItem key={engineer.id} value={`${engineer.id}|${engineer.name}`}>
                            {engineer.name}
                          </SelectItem>
                        ))}
                        {issueType === "Customer" && customers.map(customer => (
                          <SelectItem key={customer.id} value={`${customer.id}|${customer.name}`}>
                            {customer.name}
                          </SelectItem>
                        ))}
                        {issueType === "Branch" && branches.map(branch => (
                          <SelectItem key={branch.id} value={`${branch.id}|${branch.name}`}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {issueType === "Customer" && (
                    <div className="space-y-2">
                      <Label htmlFor="billType">Bill Type</Label>
                      <Select value={billType} onValueChange={setBillType}>
                        <SelectTrigger id="billType">
                          <SelectValue placeholder="Select bill type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GST">GST Bill</SelectItem>
                          <SelectItem value="Non-GST">Non-GST Bill</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Item Details</h3>
                  
                  <ItemSelector 
                    brands={mockBrands}
                    models={mockModels}
                    items={inventoryItems}
                    onItemSelect={handleItemSelected}
                    warehouseId={selectedWarehouse}
                  />
                  
                  {selectedItem && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <div className="text-sm">
                          <p className="font-medium">{selectedItem.name}</p>
                          <p className="text-muted-foreground">Current Stock: {selectedItem.currentQuantity}</p>
                          <p className={selectedItem.currentQuantity < selectedItem.minQuantity ? "text-destructive" : "text-green-600"}>
                            Status: {selectedItem.currentQuantity < selectedItem.minQuantity ? "Low Stock" : "In Stock"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-6" 
                    disabled={!selectedItem || !selectedWarehouse || !receiverId || issueMutation.isPending}
                  >
                    {issueMutation.isPending ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Package className="mr-2 h-4 w-4" />
                        Issue Item
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="return" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <Tabs value={returnTab} onValueChange={setReturnTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="return-form">Return Form</TabsTrigger>
                  <TabsTrigger value="return-history">Return History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="return-form">
                  <form onSubmit={handleReturnSubmit} className="space-y-4">
                    <div className="mb-6">
                      <Label className="text-base font-medium">Return To Warehouse</Label>
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
                          onValueChange={handleEngineerSelection}
                        >
                          <SelectTrigger id="engineer">
                            <SelectValue placeholder="Select engineer" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingEngineers ? (
                              <SelectItem value="loading" disabled>Loading engineers...</SelectItem>
                            ) : engineers.map(engineer => (
                              <SelectItem key={engineer.id} value={engineer.id}>
                                {engineer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="returnItem">Select Item</Label>
                        <Select 
                          value={selectedReturnItem} 
                          onValueChange={setSelectedReturnItem}
                          disabled={!selectedEngineer}
                        >
                          <SelectTrigger id="returnItem">
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {engineerItems.length === 0 ? (
                              <SelectItem value="none" disabled>No items found for this engineer</SelectItem>
                            ) : (
                              engineerItems.map(item => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.item_name} (Qty: {item.quantity})
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
                          value={returnQuantity}
                          onChange={(e) => setReturnQuantity(parseInt(e.target.value) || 1)}
                          disabled={!selectedReturnItem}
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
                
                <TabsContent value="return-history">
                  {isLoadingReturnedItems ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Returned By</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Warehouse</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {returnedItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No returns history found
                            </TableCell>
                          </TableRow>
                        ) : (
                          returnedItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.item_name}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{item.engineer_name}</TableCell>
                              <TableCell>{new Date(item.return_date).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.reason}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={item.condition === "Good" ? "outline" : "destructive"}>
                                  {item.condition}
                                </Badge>
                              </TableCell>
                              <TableCell>{item.warehouse_name}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent">
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="issues" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="issues">Recent Issues</TabsTrigger>
                  <TabsTrigger value="returns">Recent Returns</TabsTrigger>
                </TabsList>
                
                <TabsContent value="issues">
                  {isLoadingIssuedItems ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Issued To</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Source Warehouse</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {issuedItems.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                No issues found
                              </TableCell>
                            </TableRow>
                          ) : (
                            issuedItems.map((issue) => (
                              <TableRow key={issue.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                  <Package size={16} className="text-muted-foreground" />
                                  {issue.item_name}
                                </TableCell>
                                <TableCell>{issue.quantity}</TableCell>
                                <TableCell>{issue.engineer_name}</TableCell>
                                <TableCell>{new Date(issue.assigned_date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {issue.warehouse_source}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="returns">
                  {isLoadingReturnedItems ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Returned By</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead>Warehouse</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {returnedItems.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                No returns found
                              </TableCell>
                            </TableRow>
                          ) : (
                            returnedItems.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.item_name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.engineer_name}</TableCell>
                                <TableCell>{new Date(item.return_date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{item.reason}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={item.condition === "Good" ? "outline" : "destructive"}>
                                    {item.condition}
                                  </Badge>
                                </TableCell>
                                <TableCell>{item.warehouse_name}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryIssue;
