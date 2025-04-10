
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ArrowLeftRight, 
  Search, 
  Filter, 
  Plus, 
  Check, 
  Truck, 
  CheckCircle2, 
  Clock,
  Box,
  Send,
  PackageCheck,
  Warehouse
} from "lucide-react";
import { 
  StockTransfer, 
  Branch, 
  TransferStatus, 
  TransferMethod 
} from "@/types/inventory";
import { toast } from "sonner";

// Mock warehouses
const mockWarehouses = [
  { id: "1", name: "Main Warehouse", code: "MW01", location: "Indore", isActive: true },
  { id: "2", name: "Bhopal Warehouse", code: "BW01", location: "Bhopal", isActive: true },
  { id: "3", name: "Jabalpur Storage", code: "JS01", location: "Jabalpur", isActive: true }
];

// Mock data
const mockTransfers: StockTransfer[] = [
  {
    id: "ST001",
    itemId: "1",
    quantity: 5,
    sourceType: "Branch",
    sourceBranch: "Indore (HQ)",
    destinationType: "Branch",
    destinationBranch: "Bhopal Office",
    requestDate: "2025-03-15",
    approvedDate: "2025-03-16",
    dispatchDate: "2025-03-17",
    status: "Dispatched",
    transferMethod: "Courier",
    trackingNumber: "COUR123456",
    remarks: "Urgent requirement for service",
    requestedBy: "Rajesh Kumar",
    approvedBy: "Amit Sharma",
    createdAt: "2025-03-15"
  },
  {
    id: "ST002",
    itemId: "2",
    quantity: 3,
    sourceType: "Branch",
    sourceBranch: "Bhopal Office",
    destinationType: "Branch",
    destinationBranch: "Jabalpur Office",
    requestDate: "2025-03-20",
    approvedDate: "2025-03-21",
    dispatchDate: "2025-03-22",
    status: "Received",
    transferMethod: "Bus",
    trackingNumber: "BUS789012",
    remarks: "Replenishment of low stock",
    requestedBy: "Vikram Singh",
    approvedBy: "Pooja Verma",
    createdAt: "2025-03-20"
  },
  {
    id: "ST003",
    itemId: "3",
    quantity: 2,
    sourceType: "Warehouse",
    sourceWarehouseId: "1",
    sourceWarehouseName: "Main Warehouse",
    destinationType: "Warehouse",
    destinationWarehouseId: "2",
    destinationWarehouseName: "Bhopal Warehouse",
    requestDate: "2025-03-25",
    approvedDate: "2025-03-26",
    dispatchDate: "2025-03-27",
    status: "Approved",
    transferMethod: "Hand Delivery",
    remarks: "Stock balancing between warehouses",
    requestedBy: "Neha Gupta",
    approvedBy: "Amit Sharma",
    createdAt: "2025-03-25"
  },
  {
    id: "ST004",
    itemId: "4",
    quantity: 10,
    sourceType: "Warehouse",
    sourceWarehouseId: "2",
    sourceWarehouseName: "Bhopal Warehouse",
    destinationType: "Branch",
    destinationBranch: "Indore (HQ)",
    requestDate: "2025-03-30",
    status: "Requested",
    transferMethod: "Courier",
    remarks: "Additional stock for new customer",
    requestedBy: "Rajesh Kumar",
    createdAt: "2025-03-30"
  },
];

// Mock inventory items
const mockItems = [
  { id: "1", name: "Black Toner", brand: "Kyocera", model: "2554ci" },
  { id: "2", name: "Drum Unit", brand: "Kyocera", model: "2554ci" },
  { id: "3", name: "Fuser Unit", brand: "Ricoh", model: "MP2014" },
  { id: "4", name: "Cyan Toner", brand: "Kyocera", model: "2554ci" }
];

const InventoryTransfer = () => {
  const [activeTab, setActiveTab] = useState("transfers");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<TransferStatus | "">("");
  const [filterSourceType, setFilterSourceType] = useState<"" | "Branch" | "Warehouse">("");
  const [filterLocation, setFilterLocation] = useState<string>("");
  const [showNewTransferDialog, setShowNewTransferDialog] = useState(false);
  
  // New transfer form state
  const [transferForm, setTransferForm] = useState({
    itemId: "",
    quantity: 1,
    sourceType: "Warehouse" as "Branch" | "Warehouse",
    sourceBranch: "",
    sourceWarehouseId: "",
    destinationType: "Warehouse" as "Branch" | "Warehouse",
    destinationBranch: "",
    destinationWarehouseId: "",
    transferMethod: "Courier" as TransferMethod,
    trackingNumber: "",
    remarks: ""
  });
  
  const filteredTransfers = mockTransfers.filter(transfer => {
    // Search by ID or item
    const searchMatch = 
      transfer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.itemId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transfer.sourceType === "Branch" && transfer.sourceBranch && transfer.sourceBranch.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transfer.destinationType === "Branch" && transfer.destinationBranch && transfer.destinationBranch.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transfer.sourceType === "Warehouse" && transfer.sourceWarehouseName && transfer.sourceWarehouseName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transfer.destinationType === "Warehouse" && transfer.destinationWarehouseName && transfer.destinationWarehouseName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by status
    const statusMatch = filterStatus ? transfer.status === filterStatus : true;
    
    // Filter by source type
    const sourceTypeMatch = filterSourceType ? transfer.sourceType === filterSourceType : true;
    
    // Filter by location (branch or warehouse)
    const locationMatch = filterLocation ? (
      (transfer.sourceType === "Branch" && transfer.sourceBranch === filterLocation) ||
      (transfer.destinationType === "Branch" && transfer.destinationBranch === filterLocation) ||
      (transfer.sourceType === "Warehouse" && transfer.sourceWarehouseId === filterLocation) ||
      (transfer.destinationType === "Warehouse" && transfer.destinationWarehouseId === filterLocation)
    ) : true;
    
    return searchMatch && statusMatch && sourceTypeMatch && locationMatch;
  });

  // Get location options combining branches and warehouses
  const locationOptions = [
    { id: "Indore (HQ)", name: "Indore (HQ)", type: "Branch" },
    { id: "Bhopal Office", name: "Bhopal Office", type: "Branch" },
    { id: "Jabalpur Office", name: "Jabalpur Office", type: "Branch" },
    ...mockWarehouses.map(wh => ({ id: wh.id, name: wh.name, type: "Warehouse" }))
  ];
  
  // Handle submitting new transfer
  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that source and destination are different
    if (
      (transferForm.sourceType === transferForm.destinationType) && 
      (
        (transferForm.sourceType === "Branch" && transferForm.sourceBranch === transferForm.destinationBranch) ||
        (transferForm.sourceType === "Warehouse" && transferForm.sourceWarehouseId === transferForm.destinationWarehouseId)
      )
    ) {
      toast.error("Source and destination cannot be the same!");
      return;
    }
    
    // In a real app, you would save to database
    console.log("New transfer:", transferForm);
    toast.success("Transfer request created successfully!");
    
    // Reset form and close dialog
    setTransferForm({
      itemId: "",
      quantity: 1,
      sourceType: "Warehouse",
      sourceBranch: "",
      sourceWarehouseId: "",
      destinationType: "Warehouse",
      destinationBranch: "",
      destinationWarehouseId: "",
      transferMethod: "Courier",
      trackingNumber: "",
      remarks: ""
    });
    setShowNewTransferDialog(false);
  };
  
  // Get source location name for display
  const getSourceLocationName = (transfer: StockTransfer) => {
    if (transfer.sourceType === "Branch" && transfer.sourceBranch) {
      return transfer.sourceBranch;
    } else if (transfer.sourceType === "Warehouse" && transfer.sourceWarehouseName) {
      return transfer.sourceWarehouseName;
    }
    return "Unknown";
  };
  
  // Get destination location name for display
  const getDestinationLocationName = (transfer: StockTransfer) => {
    if (transfer.destinationType === "Branch" && transfer.destinationBranch) {
      return transfer.destinationBranch;
    } else if (transfer.destinationType === "Warehouse" && transfer.destinationWarehouseName) {
      return transfer.destinationWarehouseName;
    }
    return "Unknown";
  };
  
  // Get location icon
  const getLocationIcon = (type: "Branch" | "Warehouse") => {
    return type === "Branch" ? <Box className="h-4 w-4" /> : <Warehouse className="h-4 w-4" />;
  };

  return (
    <Layout>
      <div className="container p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Stock Transfers</h1>
            <p className="text-muted-foreground">
              Manage and track inventory transfers between branches and warehouses
            </p>
          </div>
          <Button className="gap-1" onClick={() => setShowNewTransferDialog(true)}>
            <Plus className="h-4 w-4" />
            New Transfer Request
          </Button>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="relative grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transfers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transfers" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Transfers</CardTitle>
                <CardDescription>
                  List of all pending and in-transit stock transfers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor="status-filter">Filter by Status</Label>
                    <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as TransferStatus | "")}>
                      <SelectTrigger id="status-filter">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="Requested">Requested</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Dispatched">Dispatched</SelectItem>
                        <SelectItem value="Received">Received</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="source-type-filter">Filter by Source Type</Label>
                    <Select value={filterSourceType} onValueChange={(value) => setFilterSourceType(value as "" | "Branch" | "Warehouse")}>
                      <SelectTrigger id="source-type-filter">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="Branch">Branch</SelectItem>
                        <SelectItem value="Warehouse">Warehouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="location-filter">Filter by Location</Label>
                    <Select value={filterLocation} onValueChange={setFilterLocation}>
                      <SelectTrigger id="location-filter">
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Locations</SelectItem>
                        <SelectItem value="Indore (HQ)">Indore (HQ)</SelectItem>
                        <SelectItem value="Bhopal Office">Bhopal Office</SelectItem>
                        <SelectItem value="Jabalpur Office">Jabalpur Office</SelectItem>
                        {mockWarehouses.map(wh => (
                          <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transfer ID</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransfers.map((transfer) => {
                      const item = mockItems.find(i => i.id === transfer.itemId);
                      return (
                        <TableRow key={transfer.id}>
                          <TableCell className="font-medium">{transfer.id}</TableCell>
                          <TableCell>
                            {item ? (
                              <>
                                <div>{item.name}</div>
                                <div className="text-xs text-muted-foreground">{item.brand} {item.model}</div>
                              </>
                            ) : transfer.itemId}
                          </TableCell>
                          <TableCell>{transfer.quantity}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {getLocationIcon(transfer.sourceType)}
                              {getSourceLocationName(transfer)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {getLocationIcon(transfer.destinationType)}
                              {getDestinationLocationName(transfer)}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(transfer.requestDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium">
                              {transfer.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{transfer.transferMethod}</TableCell>
                        </TableRow>
                      );
                    })}
                    
                    {filteredTransfers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No transfers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Transfer History</CardTitle>
                <CardDescription>
                  Archived list of all completed and cancelled stock transfers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transfer ID</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTransfers.map((transfer) => {
                      const item = mockItems.find(i => i.id === transfer.itemId);
                      return (
                        <TableRow key={transfer.id}>
                          <TableCell className="font-medium">{transfer.id}</TableCell>
                          <TableCell>
                            {item ? (
                              <>
                                <div>{item.name}</div>
                                <div className="text-xs text-muted-foreground">{item.brand} {item.model}</div>
                              </>
                            ) : transfer.itemId}
                          </TableCell>
                          <TableCell>{transfer.quantity}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {getLocationIcon(transfer.sourceType)}
                              {getSourceLocationName(transfer)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              {getLocationIcon(transfer.destinationType)}
                              {getDestinationLocationName(transfer)}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(transfer.requestDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {transfer.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{transfer.transferMethod}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* New Transfer Dialog */}
        <Dialog open={showNewTransferDialog} onOpenChange={setShowNewTransferDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>New Stock Transfer</DialogTitle>
              <DialogDescription>
                Create a request to transfer stock between branches and warehouses
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmitTransfer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-item">Item</Label>
                <Select 
                  value={transferForm.itemId} 
                  onValueChange={(value) => setTransferForm({ ...transferForm, itemId: value })}
                >
                  <SelectTrigger id="transfer-item">
                    <SelectValue placeholder="Select Item" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} - {item.brand} {item.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transfer-quantity">Quantity</Label>
                <Input
                  id="transfer-quantity"
                  type="number"
                  min="1"
                  value={transferForm.quantity}
                  onChange={(e) => setTransferForm({ ...transferForm, quantity: parseInt(e.target.value) })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <ArrowLeftRight className="h-4 w-4" />
                      Source
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="source-type">Source Type</Label>
                      <Select 
                        value={transferForm.sourceType} 
                        onValueChange={(value: "Branch" | "Warehouse") => setTransferForm({ 
                          ...transferForm, 
                          sourceType: value,
                          sourceBranch: "",
                          sourceWarehouseId: ""
                        })}
                      >
                        <SelectTrigger id="source-type">
                          <SelectValue placeholder="Select Source Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Branch">Branch</SelectItem>
                          <SelectItem value="Warehouse">Warehouse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {transferForm.sourceType === "Branch" ? (
                      <div className="space-y-2">
                        <Label htmlFor="source-branch">Source Branch</Label>
                        <Select 
                          value={transferForm.sourceBranch} 
                          onValueChange={(value) => setTransferForm({ ...transferForm, sourceBranch: value })}
                        >
                          <SelectTrigger id="source-branch">
                            <SelectValue placeholder="Select Branch" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Indore (HQ)">Indore (HQ)</SelectItem>
                            <SelectItem value="Bhopal Office">Bhopal Office</SelectItem>
                            <SelectItem value="Jabalpur Office">Jabalpur Office</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="source-warehouse">Source Warehouse</Label>
                        <Select 
                          value={transferForm.sourceWarehouseId} 
                          onValueChange={(value) => setTransferForm({ ...transferForm, sourceWarehouseId: value })}
                        >
                          <SelectTrigger id="source-warehouse">
                            <SelectValue placeholder="Select Warehouse" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockWarehouses.map(warehouse => (
                              <SelectItem key={warehouse.id} value={warehouse.id}>
                                {warehouse.name} ({warehouse.location})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <ArrowLeftRight className="h-4 w-4" />
                      Destination
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="destination-type">Destination Type</Label>
                      <Select 
                        value={transferForm.destinationType} 
                        onValueChange={(value: "Branch" | "Warehouse") => setTransferForm({ 
                          ...transferForm, 
                          destinationType: value,
                          destinationBranch: "",
                          destinationWarehouseId: ""
                        })}
                      >
                        <SelectTrigger id="destination-type">
                          <SelectValue placeholder="Select Destination Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Branch">Branch</SelectItem>
                          <SelectItem value="Warehouse">Warehouse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {transferForm.destinationType === "Branch" ? (
                      <div className="space-y-2">
                        <Label htmlFor="destination-branch">Destination Branch</Label>
                        <Select 
                          value={transferForm.destinationBranch} 
                          onValueChange={(value) => setTransferForm({ ...transferForm, destinationBranch: value })}
                        >
                          <SelectTrigger id="destination-branch">
                            <SelectValue placeholder="Select Branch" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Indore (HQ)">Indore (HQ)</SelectItem>
                            <SelectItem value="Bhopal Office">Bhopal Office</SelectItem>
                            <SelectItem value="Jabalpur Office">Jabalpur Office</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="destination-warehouse">Destination Warehouse</Label>
                        <Select 
                          value={transferForm.destinationWarehouseId} 
                          onValueChange={(value) => setTransferForm({ ...transferForm, destinationWarehouseId: value })}
                        >
                          <SelectTrigger id="destination-warehouse">
                            <SelectValue placeholder="Select Warehouse" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockWarehouses.map(warehouse => (
                              <SelectItem key={warehouse.id} value={warehouse.id}>
                                {warehouse.name} ({warehouse.location})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transfer-method">Transfer Method</Label>
                <Select 
                  value={transferForm.transferMethod} 
                  onValueChange={(value: TransferMethod) => setTransferForm({ ...transferForm, transferMethod: value })}
                >
                  <SelectTrigger id="transfer-method">
                    <SelectValue placeholder="Select Transfer Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Courier">Courier</SelectItem>
                    <SelectItem value="Hand Delivery">Hand Delivery</SelectItem>
                    <SelectItem value="Bus">Bus</SelectItem>
                    <SelectItem value="Railway">Railway</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {transferForm.transferMethod !== "Hand Delivery" && (
                <div className="space-y-2">
                  <Label htmlFor="tracking-number">Tracking Number (optional)</Label>
                  <Input
                    id="tracking-number"
                    placeholder="Enter tracking number if available"
                    value={transferForm.trackingNumber}
                    onChange={(e) => setTransferForm({ ...transferForm, trackingNumber: e.target.value })}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Input
                  id="remarks"
                  placeholder="Enter any additional notes"
                  value={transferForm.remarks}
                  onChange={(e) => setTransferForm({ ...transferForm, remarks: e.target.value })}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowNewTransferDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Send className="h-4 w-4 mr-2" />
                  Create Transfer Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default InventoryTransfer;
