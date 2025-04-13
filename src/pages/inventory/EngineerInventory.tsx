import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  FileText, 
  Building,
  Phone, 
  Mail,
  Receipt
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Vendor } from "@/types/inventory";
import { toast } from "sonner";

// Mock vendors data with contactPerson property
const mockVendors: Vendor[] = [
  {
    id: '1',
    createdAt: new Date().toISOString(),
    name: 'PCB Solutions Pvt Ltd',
    contactPerson: 'Rajesh Kumar',
    gstNo: 'GSTIN123456',
    phone: '+91 9876543210',
    email: 'info@pcbsolutions.in',
    address: '123 Electronics Market, Mumbai'
  },
  {
    id: '2',
    createdAt: new Date().toISOString(),
    name: 'TechParts India',
    contactPerson: 'Sunil Sharma',
    gstNo: 'GSTIN789012',
    phone: '+91 8765432109',
    email: 'support@techparts.in',
    address: '456 Industrial Area, Delhi'
  },
  {
    id: '3',
    createdAt: new Date().toISOString(),
    name: 'Copier Components Ltd',
    contactPerson: 'Amit Patel',
    gstNo: 'GSTIN345678',
    phone: '+91 7654321098',
    email: 'sales@copiercomponents.in',
    address: '789 Business Park, Bangalore'
  }
];

type VendorFormData = {
  id?: string;
  name: string;
  gstNo: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
};

const EngineerInventory = () => {
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [searchQuery, setSearchQuery] = useState("");
  const [vendorDialog, setVendorDialog] = useState(false);
  const [purchaseHistoryDialog, setPurchaseHistoryDialog] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [vendorForm, setVendorForm] = useState<VendorFormData>({
    name: "",
    gstNo: "",
    phone: "",
    email: "",
    address: "",
    contactPerson: ""
  });
  
  const filteredVendors = vendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.gstNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const selectedVendor = vendors.find(v => v.id === selectedVendorId);
  
  const handleAddVendor = () => {
    setVendorForm({
      name: "",
      gstNo: "",
      phone: "",
      email: "",
      address: "",
      contactPerson: ""
    });
    setSelectedVendorId(null);
    setVendorDialog(true);
  };
  
  const handleEditVendor = (vendor: Vendor) => {
    setVendorForm({
      id: vendor.id,
      name: vendor.name,
      gstNo: vendor.gstNo,
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address,
      contactPerson: vendor.contactPerson
    });
    setSelectedVendorId(vendor.id);
    setVendorDialog(true);
  };
  
  const handleViewPurchaseHistory = (vendorId: string) => {
    setSelectedVendorId(vendorId);
    setPurchaseHistoryDialog(true);
  };
  
  const handleDeleteVendor = (vendorId: string) => {
    setVendors(prevVendors => prevVendors.filter(v => v.id !== vendorId));
    toast.success("Vendor deleted successfully");
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVendorForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmitVendor = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedVendorId) {
      setVendors(prevVendors => 
        prevVendors.map(v => 
          v.id === selectedVendorId 
            ? { 
                ...vendorForm, 
                id: selectedVendorId,
                createdAt: v.createdAt
              } as Vendor
            : v
        )
      );
      toast.success("Vendor updated successfully");
    } else {
      const newVendor: Vendor = {
        ...vendorForm,
        id: `${vendors.length + 1}`,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setVendors(prev => [...prev, newVendor]);
      toast.success("Vendor added successfully");
    }
    
    setVendorDialog(false);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Engineer Inventory Management</h1>
          <p className="text-muted-foreground">Manage inventory assigned to service engineers</p>
        </div>
        <Button onClick={handleAddVendor}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>
      
      <Tabs defaultValue="vendors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vendors">Engineer Inventory</TabsTrigger>
          <TabsTrigger value="reports">Usage Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vendors">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Assigned Items</CardTitle>
                <CardDescription>Track items assigned to each engineer</CardDescription>
              </div>
              <div className="relative w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search items..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Engineer Name</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Assignment Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No inventory items found. Assign items to engineers to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell>{vendor.gstNo || "Kyocera TK-1175 Toner"}</TableCell>
                        <TableCell>2</TableCell>
                        <TableCell>{vendor.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditVendor(vendor)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleViewPurchaseHistory(vendor.id)}>
                              <Receipt className="h-4 w-4" />
                              <span className="sr-only">History</span>
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteVendor(vendor.id)}>
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Engineer Usage Reports</CardTitle>
              <CardDescription>Track inventory usage and consumption by each engineer</CardDescription>
            </CardHeader>
            <CardContent>
              <VendorReportComponent />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={vendorDialog} onOpenChange={setVendorDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedVendorId ? "Edit Item Assignment" : "Assign New Item"}
            </DialogTitle>
            <DialogDescription>
              Fill in the item assignment details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitVendor} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Engineer Name *</Label>
              <Input
                id="name"
                name="name"
                value={vendorForm.name}
                onChange={handleFormChange}
                placeholder="Select engineer"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gstNo">Item</Label>
              <Input
                id="gstNo"
                name="gstNo"
                value={vendorForm.gstNo}
                onChange={handleFormChange}
                placeholder="Select inventory item"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Quantity *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={vendorForm.phone}
                  onChange={handleFormChange}
                  placeholder="Enter quantity"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Assignment Date</Label>
                <Input
                  id="email"
                  type="date"
                  name="email"
                  value={vendorForm.email}
                  onChange={handleFormChange}
                  placeholder="Select date"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Notes</Label>
              <Input
                id="address"
                name="address"
                value={vendorForm.address}
                onChange={handleFormChange}
                placeholder="Enter notes (optional)"
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setVendorDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedVendorId ? "Update Assignment" : "Assign Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={purchaseHistoryDialog} onOpenChange={setPurchaseHistoryDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              Usage History: {selectedVendor?.name}
            </DialogTitle>
            <DialogDescription>
              Item usage history for this engineer
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Call ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>10-Mar-2025</TableCell>
                  <TableCell>Ricoh 1015 Drum</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>ABC Technologies</TableCell>
                  <TableCell>SVC-1234</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>05-Feb-2025</TableCell>
                  <TableCell>Kyocera TK-1175 Toner</TableCell>
                  <TableCell>2</TableCell>
                  <TableCell>XYZ Industries</TableCell>
                  <TableCell>SVC-1156</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setPurchaseHistoryDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const VendorReportComponent = () => {
  const [brandFilter, setBrandFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [itemFilter, setItemFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  
  const reportData = [
    {
      vendor: "Rahul Verma", 
      quantityPurchased: 12, 
      avgRate: 3200, 
      lastPurchaseDate: "10-Mar-2025"
    },
    {
      vendor: "Deepak Kumar", 
      quantityPurchased: 8, 
      avgRate: 3350, 
      lastPurchaseDate: "01-Feb-2025"
    },
    {
      vendor: "Sanjay Mishra", 
      quantityPurchased: 15, 
      avgRate: 3100, 
      lastPurchaseDate: "15-Jan-2025"
    }
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="brand-filter">Engineer</Label>
          <select
            id="brand-filter"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Engineers</option>
            <option value="rahul">Rahul Verma</option>
            <option value="deepak">Deepak Kumar</option>
            <option value="sanjay">Sanjay Mishra</option>
          </select>
        </div>
        
        <div>
          <Label htmlFor="model-filter">Item Type</Label>
          <select
            id="model-filter"
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Types</option>
            <option value="toner">Toner</option>
            <option value="drum">Drum</option>
            <option value="parts">Parts</option>
          </select>
        </div>
        
        <div>
          <Label htmlFor="item-filter">Date Range</Label>
          <select
            id="item-filter"
            value={itemFilter}
            onChange={(e) => setItemFilter(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
        
        <div>
          <Label htmlFor="vendor-filter">Status</Label>
          <select
            id="vendor-filter"
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="used">Used</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Engineer Name</TableHead>
            <TableHead>Items Used</TableHead>
            <TableHead>Items Value</TableHead>
            <TableHead>Last Usage Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportData.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.vendor}</TableCell>
              <TableCell>{item.quantityPurchased} pcs</TableCell>
              <TableCell>₹{item.avgRate.toLocaleString()}</TableCell>
              <TableCell>{item.lastPurchaseDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex justify-end">
        <Button variant="outline" className="mr-2">
          <FileText className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </div>
  );
};

export default EngineerInventory;
