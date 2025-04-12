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
import { IssueType, Brand, Model, InventoryItem } from "@/types/inventory";
import ItemSelector from "@/components/inventory/ItemSelector";

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

// Sample brands and models
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
  const [quantity, setQuantity] = useState(1);
  const [receiverName, setReceiverName] = useState("");
  const [billType, setBillType] = useState("Non-GST");
  const [activeTab, setActiveTab] = useState("form");
  
  // State for selected item using our reusable component
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Handle item selection from the ItemSelector component
  const handleItemSelected = (item: InventoryItem) => {
    setSelectedItem(item);
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

    if (quantity <= 0) {
      toast.warning("Quantity must be greater than 0");
      return;
    }

    // In a real app, you would send this data to your API
    toast.success(`${quantity} × ${selectedItem.name} issued successfully to ${receiverName}`);
    
    // Reset form
    setSelectedItem(null);
    setQuantity(1);
    setReceiverName("");
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
                  
                  {/* Use the ItemSelector component for brand/model/item selection */}
                  <ItemSelector 
                    brands={mockBrands}
                    models={mockModels}
                    items={inventoryItems}
                    onItemSelect={handleItemSelected}
                  />
                  
                  {/* Quantity */}
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
                  
                  <Button type="submit" className="w-full mt-6" disabled={!selectedItem}>
                    <Package className="mr-2 h-4 w-4" />
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
