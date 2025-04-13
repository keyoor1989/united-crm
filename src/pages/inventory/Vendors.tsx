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
import { v4 as uuidv4 } from 'uuid';

const mockVendors: Vendor[] = [
  {
    id: "vendor1",
    name: "Ajanta Traders",
    contactPerson: "Rajesh Kumar",
    gstNo: "24AAKCS9636Q1ZX",
    phone: "9876543210",
    email: "info@ajanta.com",
    address: "142, Industrial Area, Indore, MP",
    createdAt: "2024-01-15"
  },
  {
    id: "vendor2",
    name: "Ravi Distributors",
    contactPerson: "Sunil Ravi",
    gstNo: "08AAQCS5896P1Z0",
    phone: "8765432109",
    email: "sales@ravidistributors.com",
    address: "278, MIDC Area, Nagpur, MH",
    createdAt: "2024-01-20"
  },
  {
    id: "vendor3",
    name: "Mehta Enterprises",
    contactPerson: "Amit Mehta",
    gstNo: "33AAICS4599Q2ZX",
    phone: "7654321098",
    email: "contact@mehtaenterprises.com",
    address: "56, Electronic City, Bangalore, KA",
    createdAt: "2024-02-05"
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

const Vendors = () => {
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
      const formData = vendorForm;
      const newVendor: Vendor = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        name: formData.name,
        contactPerson: formData.contactPerson,
        gstNo: formData.gstNo || '',
        phone: formData.phone,
        email: formData.email || '',
        address: formData.address || ''
      };
      setVendors(prev => [...prev, newVendor]);
      toast.success("Vendor added successfully");
    }
    
    setVendorDialog(false);
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vendor Management</h1>
          <p className="text-muted-foreground">Manage your suppliers and track purchase history</p>
        </div>
        <Button onClick={handleAddVendor}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Vendor
        </Button>
      </div>
      
      <Tabs defaultValue="vendors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="reports">Purchase Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vendors">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Vendor Directory</CardTitle>
                <CardDescription>Manage your supplier information</CardDescription>
              </div>
              <div className="relative w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search vendors..."
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
                    <TableHead>Vendor Name</TableHead>
                    <TableHead>GST No.</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No vendors found. Add your first vendor to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell>{vendor.gstNo || "-"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1" /> {vendor.phone}
                            </span>
                            <span className="flex items-center text-sm text-muted-foreground">
                              <Mail className="h-3 w-3 mr-1" /> {vendor.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{vendor.address}</TableCell>
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
              <CardTitle>Vendor Purchase Reports</CardTitle>
              <CardDescription>Compare purchase quantities and rates across vendors</CardDescription>
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
              {selectedVendorId ? "Edit Vendor" : "Add New Vendor"}
            </DialogTitle>
            <DialogDescription>
              Fill in the vendor details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitVendor} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vendor Name *</Label>
              <Input
                id="name"
                name="name"
                value={vendorForm.name}
                onChange={handleFormChange}
                placeholder="Enter vendor name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gstNo">GST Number</Label>
              <Input
                id="gstNo"
                name="gstNo"
                value={vendorForm.gstNo}
                onChange={handleFormChange}
                placeholder="Enter GST number (optional)"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={vendorForm.phone}
                  onChange={handleFormChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={vendorForm.email}
                  onChange={handleFormChange}
                  placeholder="Enter email address"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                value={vendorForm.address}
                onChange={handleFormChange}
                placeholder="Enter complete address"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={vendorForm.contactPerson}
                onChange={handleFormChange}
                placeholder="Enter contact person"
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setVendorDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedVendorId ? "Update Vendor" : "Add Vendor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={purchaseHistoryDialog} onOpenChange={setPurchaseHistoryDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              Purchase History: {selectedVendor?.name}
            </DialogTitle>
            <DialogDescription>
              Complete purchase history for this vendor
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>10-Mar-2025</TableCell>
                  <TableCell>Ricoh 1015 Drum</TableCell>
                  <TableCell>5</TableCell>
                  <TableCell>₹3,200</TableCell>
                  <TableCell>₹16,000</TableCell>
                  <TableCell>INV-1234</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>05-Feb-2025</TableCell>
                  <TableCell>Kyocera 2551 Toner</TableCell>
                  <TableCell>10</TableCell>
                  <TableCell>₹2,800</TableCell>
                  <TableCell>₹28,000</TableCell>
                  <TableCell>INV-1156</TableCell>
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
      vendor: "Ajanta Traders", 
      quantityPurchased: 150, 
      avgRate: 3200, 
      lastPurchaseDate: "10-Mar-2025"
    },
    {
      vendor: "Ravi Distributors", 
      quantityPurchased: 100, 
      avgRate: 3350, 
      lastPurchaseDate: "01-Feb-2025"
    },
    {
      vendor: "Precision Equipments", 
      quantityPurchased: 80, 
      avgRate: 3100, 
      lastPurchaseDate: "15-Jan-2025"
    }
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="brand-filter">Brand</Label>
          <select
            id="brand-filter"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Brands</option>
            <option value="kyocera">Kyocera</option>
            <option value="ricoh">Ricoh</option>
          </select>
        </div>
        
        <div>
          <Label htmlFor="model-filter">Model</Label>
          <select
            id="model-filter"
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Models</option>
            <option value="2554ci">2554ci</option>
            <option value="1015">1015</option>
          </select>
        </div>
        
        <div>
          <Label htmlFor="item-filter">Item</Label>
          <select
            id="item-filter"
            value={itemFilter}
            onChange={(e) => setItemFilter(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Items</option>
            <option value="toner">Toner</option>
            <option value="drum">Drum</option>
          </select>
        </div>
        
        <div>
          <Label htmlFor="vendor-filter">Vendor</Label>
          <select
            id="vendor-filter"
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Vendors</option>
            <option value="1">Ajanta Traders</option>
            <option value="2">Ravi Distributors</option>
            <option value="3">Precision Equipments</option>
          </select>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vendor Name</TableHead>
            <TableHead>Quantity Purchased</TableHead>
            <TableHead>Avg. Rate</TableHead>
            <TableHead>Last Purchase Date</TableHead>
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

export default Vendors;
