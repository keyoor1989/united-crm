import React, { useState } from "react";
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
  RotateCcw,
  Search,
  Filter,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Package2,
  ClipboardList,
  XCircle,
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  IssueType, 
  ReturnReason, 
  ReturnStatus 
} from "@/types/inventory";

// Mock data
const mockReturns = [
  {
    id: "RET001",
    itemName: "Kyocera TK-1175 Toner",
    itemId: "item1",
    quantity: 2,
    returnedBy: "Rahul Sharma",
    returnType: "Engineer" as IssueType,
    returnDate: "2025-04-08",
    reason: "Defective" as ReturnReason,
    underWarranty: true,
    status: "Pending" as ReturnStatus,
    remarks: "Item arrived damaged, seal broken",
  },
  {
    id: "RET002",
    itemName: "Canon NPG-59 Drum",
    itemId: "item2",
    quantity: 1,
    returnedBy: "ABC Technologies",
    returnType: "Customer" as IssueType,
    returnDate: "2025-04-07",
    reason: "Wrong Item" as ReturnReason,
    underWarranty: false,
    status: "Inspected" as ReturnStatus,
    remarks: "Customer received wrong model",
  },
  {
    id: "RET003",
    itemName: "Ricoh SP 210 Toner",
    itemId: "item3",
    quantity: 3,
    returnedBy: "Bhopal Office",
    returnType: "Branch" as IssueType,
    returnDate: "2025-04-05",
    reason: "Excess" as ReturnReason,
    underWarranty: false,
    status: "Restocked" as ReturnStatus,
    remarks: "Excess inventory returned to HQ",
  },
  {
    id: "RET004",
    itemName: "HP CF217A Toner",
    itemId: "item4",
    quantity: 2,
    returnedBy: "Pradeep Kumar",
    returnType: "Engineer" as IssueType,
    returnDate: "2025-04-02",
    reason: "Defective" as ReturnReason,
    underWarranty: true,
    status: "Returned to Vendor" as ReturnStatus,
    remarks: "Manufacturing defect, sent back to vendor",
  },
  {
    id: "RET005",
    itemName: "Xerox 3020 Drum Unit",
    itemId: "item5",
    quantity: 1,
    returnedBy: "XYZ Corp",
    returnType: "Customer" as IssueType,
    returnDate: "2025-04-01",
    reason: "Damaged" as ReturnReason,
    underWarranty: true,
    status: "Quarantined" as ReturnStatus,
    remarks: "Damaged during transport, insurance claim pending",
  },
];

// Mock items data
const mockItems = [
  { id: "item1", name: "Kyocera TK-1175 Toner" },
  { id: "item2", name: "Canon NPG-59 Drum" },
  { id: "item3", name: "Ricoh SP 210 Toner" },
  { id: "item4", name: "HP CF217A Toner" },
  { id: "item5", name: "Xerox 3020 Drum Unit" },
];

// Mock engineers data
const mockEngineers = [
  { id: "eng1", name: "Rahul Sharma" },
  { id: "eng2", name: "Amit Patel" },
  { id: "eng3", name: "Pradeep Kumar" },
];

// Mock customers data
const mockCustomers = [
  { id: "cust1", name: "ABC Technologies" },
  { id: "cust2", name: "XYZ Corp" },
  { id: "cust3", name: "Global Solutions" },
];

// Mock branches
const mockBranches = [
  "Indore (HQ)",
  "Bhopal Office",
  "Jabalpur Office"
];

const InventoryReturns = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewReturnForm, setShowNewReturnForm] = useState(false);
  
  // Form state
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [returnType, setReturnType] = useState<IssueType | "">("");
  const [returnedBy, setReturnedBy] = useState("");
  const [reason, setReason] = useState<ReturnReason | "">("");
  const [underWarranty, setUnderWarranty] = useState(false);
  const [remarks, setRemarks] = useState("");
  
  // Filter returns by status
  const filterReturns = (status: string) => {
    let filtered = mockReturns;
    
    if (status !== "all") {
      if (status === "pending") {
        filtered = mockReturns.filter(ret => 
          ret.status === "Pending" || ret.status === "Inspected"
        );
      } else if (status === "processed") {
        filtered = mockReturns.filter(ret => 
          ret.status === "Restocked" || ret.status === "Returned to Vendor" || ret.status === "Quarantined"
        );
      } else {
        filtered = mockReturns.filter(ret => 
          ret.status.toLowerCase() === status.toLowerCase()
        );
      }
    }
    
    if (searchQuery) {
      filtered = filtered.filter(ret => 
        ret.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ret.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ret.returnedBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };
  
  // Handle return submission
  const handleSubmitReturn = () => {
    // Validation
    if (!selectedItem) {
      toast.error("Please select an item");
      return;
    }
    
    if (quantity <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }
    
    if (!returnType) {
      toast.error("Please select who is returning the item");
      return;
    }
    
    if (!returnedBy) {
      toast.error("Please select who is returning the item");
      return;
    }
    
    if (!reason) {
      toast.error("Please select a reason for the return");
      return;
    }
    
    // In a real app, this would send data to your backend
    toast.success("Return recorded successfully");
    setShowNewReturnForm(false);
    
    // Reset form
    setSelectedItem("");
    setQuantity(1);
    setReturnType("");
    setReturnedBy("");
    setReason("");
    setUnderWarranty(false);
    setRemarks("");
  };
  
  // Handle return status update
  const handleUpdateStatus = (returnId: string, newStatus: ReturnStatus) => {
    // In a real app, this would update the status in your backend
    toast.success(`Return #${returnId} updated to ${newStatus}`);
  };
  
  // Get status badge variant
  const getStatusBadge = (status: ReturnStatus) => {
    switch (status) {
      case "Pending":
        return { variant: "outline" as const, icon: <Clock className="h-3 w-3 mr-1" /> };
      case "Inspected":
        return { variant: "secondary" as const, icon: <ClipboardList className="h-3 w-3 mr-1" /> };
      case "Restocked":
        return { variant: "success" as const, icon: <Package2 className="h-3 w-3 mr-1" /> };
      case "Quarantined":
        return { variant: "warning" as const, icon: <AlertTriangle className="h-3 w-3 mr-1" /> };
      case "Returned to Vendor":
        return { variant: "destructive" as const, icon: <RotateCcw className="h-3 w-3 mr-1" /> };
      default:
        return { variant: "outline" as const, icon: null };
    }
  };
  
  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Returns & Replacements</h1>
          <p className="text-muted-foreground">
            Manage returned items from engineers, customers, and branches
          </p>
        </div>
        <Button 
          onClick={() => setShowNewReturnForm(!showNewReturnForm)} 
          className="gap-1"
        >
          {showNewReturnForm ? <XCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showNewReturnForm ? "Cancel" : "New Return"}
        </Button>
      </div>
      
      {showNewReturnForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Record New Return</CardTitle>
            <CardDescription>
              Record returned items for inspection and processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
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
                      {mockItems.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="returnType">Return Type</Label>
                  <Select 
                    value={returnType} 
                    onValueChange={(value) => setReturnType(value as IssueType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Who is returning the item?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineer">Engineer</SelectItem>
                      <SelectItem value="Customer">Customer</SelectItem>
                      <SelectItem value="Branch">Branch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="returnedBy">Returned By</Label>
                  <Select 
                    value={returnedBy} 
                    onValueChange={setReturnedBy}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select who is returning" />
                    </SelectTrigger>
                    <SelectContent>
                      {returnType === "Engineer" && mockEngineers.map(eng => (
                        <SelectItem key={eng.id} value={eng.name}>
                          {eng.name}
                        </SelectItem>
                      ))}
                      {returnType === "Customer" && mockCustomers.map(cust => (
                        <SelectItem key={cust.id} value={cust.name}>
                          {cust.name}
                        </SelectItem>
                      ))}
                      {returnType === "Branch" && mockBranches.map(branch => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reason">Return Reason</Label>
                  <Select 
                    value={reason} 
                    onValueChange={(value) => setReason(value as ReturnReason)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Why is the item being returned?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Damaged">Damaged</SelectItem>
                      <SelectItem value="Defective">Defective</SelectItem>
                      <SelectItem value="Excess">Excess/Not Needed</SelectItem>
                      <SelectItem value="Wrong Item">Wrong Item</SelectItem>
                      <SelectItem value="Not Used">Not Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox 
                    id="underWarranty" 
                    checked={underWarranty}
                    onCheckedChange={(checked) => setUnderWarranty(checked === true)}
                  />
                  <Label 
                    htmlFor="underWarranty"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Item is under warranty
                  </Label>
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
              <Button variant="outline" onClick={() => setShowNewReturnForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitReturn}>
                Submit Return
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
            placeholder="Search returns..."
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
          <TabsTrigger value="processed">Processed</TabsTrigger>
          <TabsTrigger value="warranty">Warranty</TabsTrigger>
          <TabsTrigger value="all">All Returns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Returns</CardTitle>
              <CardDescription>
                Returns awaiting inspection and processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Returned By</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterReturns("pending").map((ret) => (
                    <TableRow key={ret.id}>
                      <TableCell className="font-medium">{ret.id}</TableCell>
                      <TableCell>{ret.itemName}</TableCell>
                      <TableCell>{ret.quantity}</TableCell>
                      <TableCell>{ret.returnedBy}</TableCell>
                      <TableCell>{ret.returnType}</TableCell>
                      <TableCell>{ret.reason}</TableCell>
                      <TableCell>{new Date(ret.returnDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadge(ret.status).variant}
                          className="flex items-center gap-1 w-fit"
                        >
                          {getStatusBadge(ret.status).icon}
                          {ret.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {ret.status === "Pending" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateStatus(ret.id, "Inspected")}
                            >
                              Mark Inspected
                            </Button>
                          )}
                          {ret.status === "Inspected" && (
                            <>
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={() => handleUpdateStatus(ret.id, "Restocked")}
                              >
                                Restock
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleUpdateStatus(ret.id, "Quarantined")}
                              >
                                Quarantine
                              </Button>
                              {ret.underWarranty && (
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleUpdateStatus(ret.id, "Returned to Vendor")}
                                >
                                  Return to Vendor
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filterReturns("pending").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        No pending returns found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="processed" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Processed Returns</CardTitle>
              <CardDescription>
                Returns that have been processed (restocked, quarantined, or returned to vendor)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Returned By</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterReturns("processed").map((ret) => (
                    <TableRow key={ret.id}>
                      <TableCell className="font-medium">{ret.id}</TableCell>
                      <TableCell>{ret.itemName}</TableCell>
                      <TableCell>{ret.quantity}</TableCell>
                      <TableCell>{ret.returnedBy}</TableCell>
                      <TableCell>{ret.returnType}</TableCell>
                      <TableCell>{ret.reason}</TableCell>
                      <TableCell>{new Date(ret.returnDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadge(ret.status).variant}
                          className="flex items-center gap-1 w-fit"
                        >
                          {getStatusBadge(ret.status).icon}
                          {ret.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{ret.remarks}</TableCell>
                    </TableRow>
                  ))}
                  
                  {filterReturns("processed").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        No processed returns found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="warranty" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Warranty Returns</CardTitle>
              <CardDescription>
                Items returned under warranty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Returned By</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        Warranty
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReturns
                    .filter(ret => ret.underWarranty)
                    .filter(ret => 
                      searchQuery ? 
                        ret.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        ret.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        ret.returnedBy.toLowerCase().includes(searchQuery.toLowerCase())
                      : true
                    )
                    .map((ret) => (
                      <TableRow key={ret.id}>
                        <TableCell className="font-medium">{ret.id}</TableCell>
                        <TableCell>{ret.itemName}</TableCell>
                        <TableCell>{ret.quantity}</TableCell>
                        <TableCell>{ret.returnedBy}</TableCell>
                        <TableCell>{ret.reason}</TableCell>
                        <TableCell>{new Date(ret.returnDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusBadge(ret.status).variant}
                            className="flex items-center gap-1 w-fit"
                          >
                            {getStatusBadge(ret.status).icon}
                            {ret.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Under Warranty
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                  
                  {mockReturns.filter(ret => ret.underWarranty).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No warranty returns found
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
              <CardTitle>All Returns</CardTitle>
              <CardDescription>
                Complete history of item returns and their processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Returned By</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Warranty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterReturns("all").map((ret) => (
                    <TableRow key={ret.id}>
                      <TableCell className="font-medium">{ret.id}</TableCell>
                      <TableCell>{ret.itemName}</TableCell>
                      <TableCell>{ret.quantity}</TableCell>
                      <TableCell>{ret.returnedBy}</TableCell>
                      <TableCell>{ret.returnType}</TableCell>
                      <TableCell>{ret.reason}</TableCell>
                      <TableCell>{new Date(ret.returnDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadge(ret.status).variant}
                          className="flex items-center gap-1 w-fit"
                        >
                          {getStatusBadge(ret.status).icon}
                          {ret.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ret.underWarranty ? (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filterReturns("all").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        No returns found
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
  );
};

export default InventoryReturns;
