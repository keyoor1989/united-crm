
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, Plus, ArrowLeftRight, Box, Building, Send } from "lucide-react";
import { toast } from "sonner";

// Define types for branch transfers
type Branch = 'Indore (HQ)' | 'Bhopal Office' | 'Jabalpur Office';
type TransferStatus = 'Requested' | 'Approved' | 'Dispatched' | 'Received' | 'Cancelled';
type TransferMethod = 'Courier' | 'Hand Delivery' | 'Bus' | 'Railway';

interface BranchTransfer {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  sourceBranch: Branch;
  destinationBranch: Branch;
  requestDate: string;
  approvedDate?: string;
  dispatchDate?: string;
  receivedDate?: string;
  status: TransferStatus;
  transferMethod?: TransferMethod;
  trackingNumber?: string;
  remarks?: string;
  requestedBy: string;
  approvedBy?: string;
}

// Mock inventory items
const mockItems = [
  { id: "1", name: "Black Toner", brand: "Kyocera", model: "2554ci" },
  { id: "2", name: "Drum Unit", brand: "Kyocera", model: "2554ci" },
  { id: "3", name: "Fuser Unit", brand: "Ricoh", model: "MP2014" },
  { id: "4", name: "Cyan Toner", brand: "Kyocera", model: "2554ci" }
];

// Mock transfer data
const mockTransfers: BranchTransfer[] = [
  {
    id: "BT001",
    itemId: "1",
    itemName: "Black Toner",
    quantity: 5,
    sourceBranch: "Indore (HQ)",
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
  },
  {
    id: "BT002",
    itemId: "2",
    itemName: "Drum Unit",
    quantity: 3,
    sourceBranch: "Bhopal Office",
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
  },
  {
    id: "BT003",
    itemId: "3",
    itemName: "Fuser Unit",
    quantity: 2,
    sourceBranch: "Indore (HQ)",
    destinationBranch: "Jabalpur Office",
    requestDate: "2025-03-25",
    approvedDate: "2025-03-26",
    status: "Approved",
    transferMethod: "Hand Delivery",
    remarks: "Stock balancing between branches",
    requestedBy: "Neha Gupta",
    approvedBy: "Amit Sharma",
  },
  {
    id: "BT004",
    itemId: "4",
    itemName: "Cyan Toner",
    quantity: 10,
    sourceBranch: "Bhopal Office",
    destinationBranch: "Indore (HQ)",
    requestDate: "2025-03-30",
    status: "Requested",
    transferMethod: "Courier",
    remarks: "Additional stock for new customer",
    requestedBy: "Rajesh Kumar",
  },
];

const BranchTransfer = () => {
  const [activeTab, setActiveTab] = useState("transfers");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<TransferStatus | "all">("all");
  const [filterBranch, setFilterBranch] = useState<Branch | "all">("all");
  const [showNewTransferDialog, setShowNewTransferDialog] = useState(false);
  
  // New transfer form state
  const [transferForm, setTransferForm] = useState({
    itemId: "",
    quantity: 1,
    sourceBranch: "" as Branch | "",
    destinationBranch: "" as Branch | "",
    transferMethod: "Courier" as TransferMethod,
    trackingNumber: "",
    remarks: ""
  });
  
  const filteredTransfers = mockTransfers.filter(transfer => {
    // Search by ID, item, or branch
    const searchMatch = 
      transfer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.sourceBranch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.destinationBranch.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by status
    const statusMatch = filterStatus === "all" ? true : transfer.status === filterStatus;
    
    // Filter by branch (source or destination)
    const branchMatch = filterBranch === "all" ? true : 
      (transfer.sourceBranch === filterBranch || transfer.destinationBranch === filterBranch);
    
    return searchMatch && statusMatch && branchMatch;
  });
  
  // Handle submitting new transfer
  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that source and destination are different
    if (transferForm.sourceBranch === transferForm.destinationBranch) {
      toast.error("Source and destination branches cannot be the same!");
      return;
    }
    
    // In a real app, you would save to database
    console.log("New transfer:", transferForm);
    toast.success("Transfer request created successfully!");
    
    // Reset form and close dialog
    setTransferForm({
      itemId: "",
      quantity: 1,
      sourceBranch: "",
      destinationBranch: "",
      transferMethod: "Courier",
      trackingNumber: "",
      remarks: ""
    });
    setShowNewTransferDialog(false);
  };
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: TransferStatus) => {
    switch (status) {
      case "Requested": return "secondary";
      case "Approved": return "warning";
      case "Dispatched": return "default";
      case "Received": return "success";
      case "Cancelled": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Branch Transfers</h1>
          <p className="text-muted-foreground">
            Manage and track inventory transfers between branches
          </p>
        </div>
        <Button 
          className="gap-1" 
          onClick={() => setShowNewTransferDialog(true)}
        >
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
          <TabsTrigger value="transfers">Active Transfers</TabsTrigger>
          <TabsTrigger value="history">Transfer History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transfers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Transfers</CardTitle>
              <CardDescription>
                List of all pending and in-transit branch transfers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="status-filter">Filter by Status</Label>
                  <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as TransferStatus | "all")}>
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Requested">Requested</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Dispatched">Dispatched</SelectItem>
                      <SelectItem value="Received">Received</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="branch-filter">Filter by Branch</Label>
                  <Select value={filterBranch} onValueChange={(value) => setFilterBranch(value as Branch | "all")}>
                    <SelectTrigger id="branch-filter">
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      <SelectItem value="Indore (HQ)">Indore (HQ)</SelectItem>
                      <SelectItem value="Bhopal Office">Bhopal Office</SelectItem>
                      <SelectItem value="Jabalpur Office">Jabalpur Office</SelectItem>
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
                    <TableHead>Source Branch</TableHead>
                    <TableHead>Destination Branch</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell className="font-medium">{transfer.id}</TableCell>
                      <TableCell>
                        <div>{transfer.itemName}</div>
                        <div className="text-xs text-muted-foreground">
                          {mockItems.find(i => i.id === transfer.itemId)?.brand} 
                          {" "}
                          {mockItems.find(i => i.id === transfer.itemId)?.model}
                        </div>
                      </TableCell>
                      <TableCell>{transfer.quantity}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Building className="h-4 w-4" />
                          {transfer.sourceBranch}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Building className="h-4 w-4" />
                          {transfer.destinationBranch}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(transfer.requestDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(transfer.status)}>
                          {transfer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{transfer.transferMethod || "-"}</TableCell>
                    </TableRow>
                  ))}
                  
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
                Archived list of all completed and cancelled branch transfers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer ID</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Source Branch</TableHead>
                    <TableHead>Destination Branch</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* We would filter for completed/cancelled transfers in a real app */}
                  {mockTransfers
                    .filter(t => t.status === "Received" || t.status === "Cancelled")
                    .map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">{transfer.id}</TableCell>
                        <TableCell>
                          <div>{transfer.itemName}</div>
                          <div className="text-xs text-muted-foreground">
                            {mockItems.find(i => i.id === transfer.itemId)?.brand} 
                            {" "}
                            {mockItems.find(i => i.id === transfer.itemId)?.model}
                          </div>
                        </TableCell>
                        <TableCell>{transfer.quantity}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Building className="h-4 w-4" />
                            {transfer.sourceBranch}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Building className="h-4 w-4" />
                            {transfer.destinationBranch}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(transfer.requestDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(transfer.status)}>
                            {transfer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{transfer.transferMethod || "-"}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* New Transfer Dialog */}
      <Dialog open={showNewTransferDialog} onOpenChange={setShowNewTransferDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>New Branch Transfer</DialogTitle>
            <DialogDescription>
              Create a request to transfer inventory between branches
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="source-branch">Source Branch</Label>
                    <Select 
                      value={transferForm.sourceBranch} 
                      onValueChange={(value) => setTransferForm({ ...transferForm, sourceBranch: value as Branch })}
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
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    Destination
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="destination-branch">Destination Branch</Label>
                    <Select 
                      value={transferForm.destinationBranch} 
                      onValueChange={(value) => setTransferForm({ ...transferForm, destinationBranch: value as Branch })}
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
  );
};

export default BranchTransfer;
