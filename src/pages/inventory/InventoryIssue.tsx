
import React, { useState } from "react";
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
import { Package, Scan, Send, CheckCircle2, ShoppingBag, Building, User } from "lucide-react";
import { IssueType } from "@/types/inventory";

// Sample data for issued items
const recentIssues = [
  {
    id: "1",
    itemName: "Kyocera 2554ci Toner Black",
    quantity: 1,
    issuedTo: "Rahul Verma",
    issueType: "Engineer" as IssueType,
    issueDate: "2025-04-08",
    billType: "Non-GST",
    barcode: "KYO-TN2554-BK-001"
  },
  {
    id: "2",
    itemName: "Canon 2525 Drum Unit",
    quantity: 2,
    issuedTo: "Indore Office",
    issueType: "Branch" as IssueType,
    issueDate: "2025-04-07",
    billType: "GST",
    barcode: "CAN-DRM2525-001"
  },
  {
    id: "3",
    itemName: "HP M428 Toner",
    quantity: 1,
    issuedTo: "ABC Technologies",
    issueType: "Customer" as IssueType,
    issueDate: "2025-04-05",
    billType: "GST",
    barcode: "HP-TNM428-002"
  }
];

// Sample inventory items for dropdown selection
const inventoryItems = [
  { id: "1", name: "Kyocera 2554ci Toner Black", quantity: 3 },
  { id: "2", name: "Ricoh MP2014 Drum Unit", quantity: 2 },
  { id: "3", name: "Xerox 7845 Toner Cyan", quantity: 1 },
  { id: "4", name: "Canon 2525 Drum Unit", quantity: 4 },
  { id: "5", name: "HP M428 Toner", quantity: 7 }
];

// Sample engineers
const engineers = [
  { id: "1", name: "Rahul Verma" },
  { id: "2", name: "Deepak Kumar" },
  { id: "3", name: "Sanjay Mishra" }
];

// Sample branches
const branches = [
  { id: "1", name: "Indore Office" },
  { id: "2", name: "Bhopal Office" },
  { id: "3", name: "Jabalpur Office" }
];

// Sample customers
const customers = [
  { id: "1", name: "ABC Technologies" },
  { id: "2", name: "XYZ Solutions" },
  { id: "3", name: "Tech Innovations" }
];

const InventoryIssue = () => {
  const [issueType, setIssueType] = useState<IssueType>("Engineer");
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [billType, setBillType] = useState("Non-GST");
  const [activeTab, setActiveTab] = useState("form");

  // Handle barcode scan
  const handleBarcodeScan = () => {
    if (!barcodeInput) {
      toast.warning("Please enter a barcode to scan");
      return;
    }

    // Simulate finding item by barcode
    toast.success(`Barcode ${barcodeInput} scanned successfully`);
    
    // In a real app, you would look up the item in your database
    setSelectedItem("1"); // Set to first item as an example
    setBarcodeInput("");
  };

  // Handle issue submission
  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem) {
      toast.warning("Please select an item to issue");
      return;
    }

    if (!receiverName) {
      toast.warning(`Please select a ${issueType.toLowerCase()} to issue to`);
      return;
    }

    // In a real app, you would send this data to your API
    toast.success(`Item issued successfully to ${receiverName}`);
    
    // Reset form
    setSelectedItem("");
    setQuantity("1");
    setReceiverName("");
    setBarcodeInput("");
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Issue Entry</h1>
          <p className="text-muted-foreground">Issue inventory to engineers, customers or branches</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Send size={16} />
            <span>Issue Item</span>
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Recent Issues</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleIssueSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Issue Type Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="issueType">Issue Type</Label>
                    <Select 
                      value={issueType} 
                      onValueChange={(value) => setIssueType(value as IssueType)}
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
                  
                  {/* Receiver Selection based on Issue Type */}
                  <div className="space-y-2">
                    <Label htmlFor="receiver">{issueType} Name</Label>
                    <Select value={receiverName} onValueChange={setReceiverName}>
                      <SelectTrigger id="receiver">
                        <SelectValue placeholder={`Select ${issueType.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {issueType === "Engineer" && engineers.map(engineer => (
                          <SelectItem key={engineer.id} value={engineer.name}>
                            {engineer.name}
                          </SelectItem>
                        ))}
                        {issueType === "Customer" && customers.map(customer => (
                          <SelectItem key={customer.id} value={customer.name}>
                            {customer.name}
                          </SelectItem>
                        ))}
                        {issueType === "Branch" && branches.map(branch => (
                          <SelectItem key={branch.id} value={branch.name}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Bill Type - Only show for Customer */}
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    {/* Barcode Scanner */}
                    <div className="space-y-2">
                      <Label htmlFor="barcode">Scan Barcode</Label>
                      <div className="flex gap-2">
                        <Input
                          id="barcode"
                          placeholder="Enter or scan barcode"
                          value={barcodeInput}
                          onChange={(e) => setBarcodeInput(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="button" onClick={handleBarcodeScan} variant="outline">
                          <Scan size={16} className="mr-2" />
                          Scan
                        </Button>
                      </div>
                    </div>
                    
                    {/* Manual Item Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="item">Item Selection</Label>
                      <Select value={selectedItem} onValueChange={setSelectedItem}>
                        <SelectTrigger id="item">
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems.map(item => (
                            <SelectItem key={item.id} value={item.id}>
                              <div className="flex justify-between w-full">
                                <span>{item.name}</span>
                                <Badge variant={item.quantity < 3 ? "destructive" : "outline"}>
                                  {item.quantity} in stock
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Quantity */}
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline">Clear</Button>
                  <Button type="submit" className="gap-2">
                    <Send size={16} />
                    Issue Item
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Issued To</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Bill Type</TableHead>
                      <TableHead>Barcode</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentIssues.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <Package size={16} className="text-muted-foreground" />
                          {issue.itemName}
                        </TableCell>
                        <TableCell>{issue.quantity}</TableCell>
                        <TableCell>{issue.issuedTo}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {issue.issueType}
                          </Badge>
                        </TableCell>
                        <TableCell>{issue.issueDate}</TableCell>
                        <TableCell>
                          <Badge variant={issue.billType === "GST" ? "default" : "secondary"}>
                            {issue.billType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{issue.barcode}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryIssue;
