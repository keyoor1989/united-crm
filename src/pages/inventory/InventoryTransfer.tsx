
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowRightLeft,
  Search,
  Filter,
  Plus,
  FileText,
  ChevronDown,
  Calendar,
  ArrowUpDown,
  Check,
  X,
  TruckDelivery,
  CheckCircle2,
  Send,
  BadgeAlert
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Branch, TransferMethod, TransferStatus } from "@/types/inventory";

// Mock data
const mockTransfers = [
  {
    id: "TR001",
    itemName: "Kyocera TK-1175 Toner",
    itemId: "item1",
    quantity: 5,
    sourceBranch: "Indore (HQ)" as Branch,
    destinationBranch: "Bhopal Office" as Branch,
    requestDate: "2025-04-08",
    status: "Approved" as TransferStatus,
    transferMethod: "Courier" as TransferMethod,
    requestedBy: "Rahul Sharma",
  },
  {
    id: "TR002",
    itemName: "Canon NPG-59 Drum",
    itemId: "item2",
    quantity: 2,
    sourceBranch: "Indore (HQ)" as Branch,
    destinationBranch: "Jabalpur Office" as Branch,
    requestDate: "2025-04-07",
    status: "Dispatched" as TransferStatus,
    transferMethod: "Hand Delivery" as TransferMethod,
    requestedBy: "Amit Patel",
  },
  {
    id: "TR003",
    itemName: "Ricoh SP 210 Toner",
    itemId: "item3",
    quantity: 3,
    sourceBranch: "Bhopal Office" as Branch,
    destinationBranch: "Indore (HQ)" as Branch,
    requestDate: "2025-04-05",
    status: "Requested" as TransferStatus,
    transferMethod: null,
    requestedBy: "Priya Verma",
  },
  {
    id: "TR004",
    itemName: "HP CF217A Toner",
    itemId: "item4",
    quantity: 4,
    sourceBranch: "Jabalpur Office" as Branch,
    destinationBranch: "Bhopal Office" as Branch,
    requestDate: "2025-04-02",
    status: "Received" as TransferStatus,
    transferMethod: "Bus" as TransferMethod,
    requestedBy: "Sanjay Gupta",
  },
  {
    id: "TR005",
    itemName: "Xerox 3020 Drum Unit",
    itemId: "item5",
    quantity: 1,
    sourceBranch: "Indore (HQ)" as Branch,
    destinationBranch: "Bhopal Office" as Branch,
    requestDate: "2025-04-01",
    status: "Cancelled" as TransferStatus,
    transferMethod: null,
    requestedBy: "Vijay Kumar",
  },
];

// Mock items data
const mockItems = [
  { id: "item1", name: "Kyocera TK-1175 Toner", quantity: 15, branch: "Indore (HQ)" },
  { id: "item2", name: "Canon NPG-59 Drum", quantity: 8, branch: "Indore (HQ)" },
  { id: "item3", name: "Ricoh SP 210 Toner", quantity: 12, branch: "Bhopal Office" },
  { id: "item4", name: "HP CF217A Toner", quantity: 10, branch: "Jabalpur Office" },
  { id: "item5", name: "Xerox 3020 Drum Unit", quantity: 6, branch: "Indore (HQ)" },
];

const InventoryTransfer = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewTransferForm, setShowNewTransferForm] = useState(false);
  
  // Form state
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [sourceBranch, setSourceBranch] = useState<Branch>("Indore (HQ)");
  const [destinationBranch, setDestinationBranch] = useState<Branch | "">("");
  const [transferMethod, setTransferMethod] = useState<TransferMethod | "">("");
  const [remarks, setRemarks] = useState("");
  
  // Filter transfers by status
  const filterTransfers = (status: string) => {
    let filtered = mockTransfers;
    
    if (status !== "all") {
      filtered = mockTransfers.filter(transfer => 
        transfer.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    if (searchQuery) {
      filtered = filtered.filter(transfer => 
        transfer.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.sourceBranch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.destinationBranch.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };
  
  // Get available quantity for the selected item in the source branch
  const getAvailableQuantity = () => {
    const item = mockItems.find(item => item.id === selectedItem && item.branch === sourceBranch);
    return item ? item.quantity : 0;
  };
  
  // Handle transfer submission
  const handleSubmitTransfer = () => {
    // Validation
    if (!selectedItem) {
      toast.error("Please select an item");
      return;
    }
    
    if (quantity <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }
    
    if (!destinationBranch) {
      toast.error("Please select a destination branch");
      return;
    }
    
    if (sourceBranch === destinationBranch) {
      toast.error("Source and destination branches must be different");
      return;
    }
    
    if (quantity > getAvailableQuantity()) {
      toast.error(`Only ${getAvailableQuantity()} units available at ${sourceBranch}`);
      return;
    }
    
    // In a real app, this would send data to your backend
    toast.success("Transfer request submitted successfully");
    setShowNewTransferForm(false);
    
    // Reset form
    setSelectedItem("");
    setQuantity(1);
    setDestinationBranch("");
    setTransferMethod("");
    setRemarks("");
  };
  
  // Handle transfer status update
  const handleUpdateStatus = (transferId: string, newStatus: TransferStatus) => {
    // In a real app, this would update the status in your backend
    toast.success(`Transfer #${transferId} updated to ${newStatus}`);
  };
  
  // Get status badge variant
  const getStatusBadge = (status: TransferStatus) => {
    switch (status) {
      case "Requested":
        return { variant: "outline" as const, icon: <FileText className="h-3 w-3 mr-1" /> };
      case "Approved":
        return { variant: "success" as const, icon: <Check className="h-3 w-3 mr-1" /> };
      case "Dispatched":
        return { variant: "default" as const, icon: <Send className="h-3 w-3 mr-1" /> };
      case "Received":
        return { variant: "secondary" as const, icon: <CheckCircle2 className="h-3 w-3 mr-1" /> };
      case "Cancelled":
        return { variant: "destructive" as const, icon: <X className="h-3 w-3 mr-1" /> };
      default:
        return { variant: "outline" as const, icon: null };
    }
  };
  
  return (
    <Layout>
      <div className="container p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Inter-Branch Stock Transfer</h1>
            <p className="text-muted-foreground">
              Manage stock transfers between branches
            </p>
          </div>
          <Button 
            onClick={() => setShowNewTransferForm(!showNewTransferForm)} 
            className="gap-1"
          >
            {showNewTransferForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showNewTransferForm ? "Cancel" : "New Transfer"}
          </Button>
        </div>
        
        {showNewTransferForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>New Stock Transfer Request</CardTitle>
              <CardDescription>
                Transfer stock items between branches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sourceBranch">Source Branch</Label>
                    <Select 
                      value={sourceBranch} 
                      onValueChange={(value) => setSourceBranch(value as Branch)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Indore (HQ)">Indore (HQ)</SelectItem>
                        <SelectItem value="Bhopal Office">Bhopal Office</SelectItem>
                        <SelectItem value="Jabalpur Office">Jabalpur Office</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="item">Select Item</Label>
                    <Select 
                      value={selectedItem} 
                      onValueChange={setSelectedItem}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockItems
                          .filter(item => item.branch === sourceBranch)
                          .map(item => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} - {item.quantity} available
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {selectedItem && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Available: {getAvailableQuantity()} units
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      max={getAvailableQuantity()}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="destinationBranch">Destination Branch</Label>
                    <Select 
                      value={destinationBranch} 
                      onValueChange={(value) => setDestinationBranch(value as Branch)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Indore (HQ)">Indore (HQ)</SelectItem>
                        <SelectItem value="Bhopal Office">Bhopal Office</SelectItem>
                        <SelectItem value="Jabalpur Office">Jabalpur Office</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="transferMethod">Transfer Method</Label>
                    <Select 
                      value={transferMethod} 
                      onValueChange={(value) => setTransferMethod(value as TransferMethod)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="How will the items be transferred?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Courier">Courier</SelectItem>
                        <SelectItem value="Hand Delivery">Hand Delivery</SelectItem>
                        <SelectItem value="Bus">Bus</SelectItem>
                        <SelectItem value="Railway">Railway</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="remarks">Remarks</Label>
                    <Input
                      id="remarks"
                      placeholder="Any additional notes"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewTransferForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitTransfer}>
                  Submit Transfer Request
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
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
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="dispatched">Dispatched</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Transfers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Transfers</CardTitle>
                <CardDescription>
                  Transfer requests awaiting approval or dispatch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterTransfers("Requested").map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">{transfer.id}</TableCell>
                        <TableCell>{transfer.itemName}</TableCell>
                        <TableCell>{transfer.quantity}</TableCell>
                        <TableCell>{transfer.sourceBranch}</TableCell>
                        <TableCell>{transfer.destinationBranch}</TableCell>
                        <TableCell>{new Date(transfer.requestDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusBadge(transfer.status).variant}
                            className="flex items-center gap-1 w-fit"
                          >
                            {getStatusBadge(transfer.status).icon}
                            {transfer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateStatus(transfer.id, "Approved")}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateStatus(transfer.id, "Cancelled")}
                            >
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filterTransfers("Approved").map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">{transfer.id}</TableCell>
                        <TableCell>{transfer.itemName}</TableCell>
                        <TableCell>{transfer.quantity}</TableCell>
                        <TableCell>{transfer.sourceBranch}</TableCell>
                        <TableCell>{transfer.destinationBranch}</TableCell>
                        <TableCell>{new Date(transfer.requestDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusBadge(transfer.status).variant}
                            className="flex items-center gap-1 w-fit"
                          >
                            {getStatusBadge(transfer.status).icon}
                            {transfer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateStatus(transfer.id, "Dispatched")}
                            >
                              Mark Dispatched
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filterTransfers("Requested").length === 0 && filterTransfers("Approved").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No pending transfers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="dispatched" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Dispatched Transfers</CardTitle>
                <CardDescription>
                  Transfers that have been dispatched but not yet received
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterTransfers("Dispatched").map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">{transfer.id}</TableCell>
                        <TableCell>{transfer.itemName}</TableCell>
                        <TableCell>{transfer.quantity}</TableCell>
                        <TableCell>{transfer.sourceBranch}</TableCell>
                        <TableCell>{transfer.destinationBranch}</TableCell>
                        <TableCell>{new Date(transfer.requestDate).toLocaleDateString()}</TableCell>
                        <TableCell>{transfer.transferMethod}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateStatus(transfer.id, "Received")}
                          >
                            Mark as Received
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filterTransfers("Dispatched").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No dispatched transfers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Completed Transfers</CardTitle>
                <CardDescription>
                  Transfers that have been received at their destination
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterTransfers("Received").map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">{transfer.id}</TableCell>
                        <TableCell>{transfer.itemName}</TableCell>
                        <TableCell>{transfer.quantity}</TableCell>
                        <TableCell>{transfer.sourceBranch}</TableCell>
                        <TableCell>{transfer.destinationBranch}</TableCell>
                        <TableCell>{new Date(transfer.requestDate).toLocaleDateString()}</TableCell>
                        <TableCell>{transfer.transferMethod}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusBadge(transfer.status).variant}
                            className="flex items-center gap-1 w-fit"
                          >
                            {getStatusBadge(transfer.status).icon}
                            {transfer.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filterTransfers("Received").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No completed transfers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Transfers</CardTitle>
                <CardDescription>
                  Complete history of stock transfers between branches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterTransfers("all").map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">{transfer.id}</TableCell>
                        <TableCell>{transfer.itemName}</TableCell>
                        <TableCell>{transfer.quantity}</TableCell>
                        <TableCell>{transfer.sourceBranch}</TableCell>
                        <TableCell>{transfer.destinationBranch}</TableCell>
                        <TableCell>{new Date(transfer.requestDate).toLocaleDateString()}</TableCell>
                        <TableCell>{transfer.transferMethod || "-"}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusBadge(transfer.status).variant}
                            className="flex items-center gap-1 w-fit"
                          >
                            {getStatusBadge(transfer.status).icon}
                            {transfer.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filterTransfers("all").length === 0 && (
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
        </Tabs>
      </div>
    </Layout>
  );
};

export default InventoryTransfer;
