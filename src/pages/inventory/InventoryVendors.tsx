import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Store,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  History,
  ShoppingCart,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Vendor } from "@/types/inventory";

// Mock vendors data
const mockVendors: Vendor[] = [
  {
    id: "vendor1",
    name: "Ajanta Traders",
    gstNo: "24AAKCS9636Q1ZX",
    phone: "9876543210",
    email: "info@ajanta.com",
    address: "142, Industrial Area, Indore, MP",
    createdAt: "2024-01-15"
  },
  {
    id: "vendor2",
    name: "Ravi Distributors",
    gstNo: "27AAVCS8142M1Z5",
    phone: "9988776655",
    email: "sales@ravidist.com",
    address: "78, Tech Park, Bhopal, MP",
    createdAt: "2024-02-20"
  },
  {
    id: "vendor3",
    name: "Mehta Enterprises",
    gstNo: "06AABCU9603R1ZP",
    phone: "9865432109",
    email: "contact@mehta.co.in",
    address: "23, Old Market, Jabalpur, MP",
    createdAt: "2023-11-05"
  },
  {
    id: "vendor4",
    name: "Global Supplies",
    gstNo: "29AAKCG1412Q1Z5",
    phone: "9889900001",
    email: "info@globalsupplies.com",
    address: "56, MG Road, Indore, MP",
    createdAt: "2024-03-12"
  },
  {
    id: "vendor5",
    name: "Tech Parts Ltd",
    gstNo: "23AADFT2613R1ZM",
    phone: "9870123456",
    email: "support@techparts.in",
    address: "110, Industrial Estate, Pithampur, MP",
    createdAt: "2023-12-10"
  },
];

// Mock purchase history data
const mockPurchaseHistory = [
  {
    id: "ph001",
    vendorId: "vendor1",
    vendorName: "Ajanta Traders",
    itemName: "Kyocera TK-1175 Toner",
    quantity: 5,
    purchaseRate: 3200,
    purchaseDate: "2025-03-15",
    invoiceNo: "AJT/2025/1234",
  },
  {
    id: "ph002",
    vendorId: "vendor1",
    vendorName: "Ajanta Traders",
    itemName: "Canon NPG-59 Drum",
    quantity: 2,
    purchaseRate: 4200,
    purchaseDate: "2025-02-20",
    invoiceNo: "AJT/2025/1156",
  },
  {
    id: "ph003",
    vendorId: "vendor2",
    vendorName: "Ravi Distributors",
    itemName: "Ricoh SP 210 Toner",
    quantity: 8,
    purchaseRate: 2400,
    purchaseDate: "2025-03-05",
    invoiceNo: "RD/2025/0458",
  },
  {
    id: "ph004",
    vendorId: "vendor3",
    vendorName: "Mehta Enterprises",
    itemName: "HP CF217A Toner",
    quantity: 10,
    purchaseRate: 1800,
    purchaseDate: "2025-03-18",
    invoiceNo: "ME/2025/0712",
  },
  {
    id: "ph005",
    vendorId: "vendor4",
    vendorName: "Global Supplies",
    itemName: "Xerox 3020 Drum Unit",
    quantity: 3,
    purchaseRate: 3500,
    purchaseDate: "2025-03-10",
    invoiceNo: "GS/2025/0221",
  },
];

const InventoryVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [activeTab, setActiveTab] = useState("vendors");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);
  
  // Form state for add/edit vendor
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    gstNo: "",
    phone: "",
    email: "",
    address: "",
  });
  
  // Filter vendors by search query
  const filteredVendors = vendors.filter(vendor => 
    searchQuery ? 
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.gstNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase())
    : true
  );
  
  // Get purchase history for a vendor
  const getVendorPurchaseHistory = (vendorId: string) => {
    return mockPurchaseHistory.filter(purchase => 
      purchase.vendorId === vendorId &&
      (searchQuery ? 
        purchase.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        purchase.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase())
      : true)
    );
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Open add vendor modal
  const handleAddVendor = () => {
    setSelectedVendor(null);
    setFormData({
      id: "",
      name: "",
      gstNo: "",
      phone: "",
      email: "",
      address: "",
    });
    setIsAddVendorOpen(true);
  };
  
  // Open edit vendor modal
  const handleEditVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      id: vendor.id,
      name: vendor.name,
      gstNo: vendor.gstNo,
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address,
    });
    setIsAddVendorOpen(true);
  };
  
  // Open delete confirmation dialog
  const handleDeleteClick = (vendorId: string) => {
    setVendorToDelete(vendorId);
    setIsDeleteConfirmOpen(true);
  };
  
  // Save vendor (add or update)
  const handleSaveVendor = () => {
    // Check required fields
    if (!formData.name || !formData.phone || !formData.email || !formData.address) {
      toast.error("Please fill all required fields");
      return;
    }
    
    if (selectedVendor) {
      // Update existing vendor
      const updatedVendors = vendors.map(vendor => 
        vendor.id === selectedVendor.id ? 
          { 
            ...vendor, 
            name: formData.name,
            gstNo: formData.gstNo,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
          } : vendor
      );
      setVendors(updatedVendors);
      toast.success("Vendor updated successfully");
    } else {
      // Add new vendor
      const newVendor: Vendor = {
        id: `vendor${vendors.length + 1}`,
        name: formData.name,
        gstNo: formData.gstNo,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setVendors([...vendors, newVendor]);
      toast.success("Vendor added successfully");
    }
    
    setIsAddVendorOpen(false);
  };
  
  // Delete vendor
  const handleDeleteVendor = () => {
    if (vendorToDelete) {
      // Check if vendor has purchase history
      const hasHistory = mockPurchaseHistory.some(purchase => purchase.vendorId === vendorToDelete);
      
      if (hasHistory) {
        toast.error("Cannot delete vendor with purchase history");
      } else {
        // Delete vendor
        const updatedVendors = vendors.filter(vendor => vendor.id !== vendorToDelete);
        setVendors(updatedVendors);
        toast.success("Vendor deleted successfully");
      }
      
      setIsDeleteConfirmOpen(false);
      setVendorToDelete(null);
    }
  };
  
  // View vendor details
  const handleViewVendorDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setActiveTab("purchase-history");
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vendor Management</h1>
          <p className="text-muted-foreground">
            Manage your suppliers and purchase sources
          </p>
        </div>
        <Button 
          onClick={handleAddVendor} 
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add New Vendor
        </Button>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="relative grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search vendors..."
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
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="purchase-history">Purchase History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vendors" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Directory</CardTitle>
              <CardDescription>
                List of all registered suppliers and distributors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>GST Number</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Since</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-muted-foreground" />
                          {vendor.name}
                        </div>
                      </TableCell>
                      <TableCell>{vendor.gstNo || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {vendor.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {vendor.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {vendor.address}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(vendor.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewVendorDetails(vendor)}
                          >
                            <History className="h-4 w-4 mr-1" />
                            History
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditVendor(vendor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteClick(vendor.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredVendors.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No vendors found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="purchase-history" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {selectedVendor ? 
                    `Purchase History: ${selectedVendor.name}` : 
                    "Vendor Purchase History"
                  }
                </CardTitle>
                <CardDescription>
                  {selectedVendor ? 
                    `Items purchased from ${selectedVendor.name}` : 
                    "Select a vendor to view their purchase history"
                  }
                </CardDescription>
              </div>
              
              {selectedVendor && (
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setActiveTab("vendors")}
                  >
                    Back to Vendors
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!selectedVendor ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Store className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Please select a vendor from the Vendors tab to view their purchase history
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab("vendors")}
                  >
                    Go to Vendors
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-muted/50">
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Vendor Details</h3>
                      <div className="space-y-1">
                        <p className="text-sm flex items-center gap-2">
                          <Store className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{selectedVendor.name}</span>
                        </p>
                        <p className="text-sm flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedVendor.gstNo || "GST not available"}</span>
                        </p>
                        <p className="text-sm flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedVendor.address}</span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Contact Information</h3>
                      <div className="space-y-1">
                        <p className="text-sm flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedVendor.phone}</span>
                        </p>
                        <p className="text-sm flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedVendor.email}</span>
                        </p>
                        <p className="text-sm flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          <span>Vendor since {formatDate(selectedVendor.createdAt)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Purchase Transactions</h3>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toast.success("Feature coming soon!")}
                        className="gap-1"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        New Purchase
                      </Button>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Invoice No.</TableHead>
                          <TableHead>Purchase Date</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead className="text-right">Rate (₹)</TableHead>
                          <TableHead className="text-right">Total (₹)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getVendorPurchaseHistory(selectedVendor.id).map((purchase) => (
                          <TableRow key={purchase.id}>
                            <TableCell className="font-medium">{purchase.itemName}</TableCell>
                            <TableCell>{purchase.invoiceNo}</TableCell>
                            <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                            <TableCell>{purchase.quantity}</TableCell>
                            <TableCell className="text-right">{purchase.purchaseRate.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{(purchase.purchaseRate * purchase.quantity).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                        
                        {getVendorPurchaseHistory(selectedVendor.id).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                              No purchase history found for this vendor
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Vendor Dialog */}
      <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedVendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
            <DialogDescription>
              {selectedVendor ? 
                "Update vendor details below." : 
                "Enter the vendor details to add them to your directory."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="name" className="text-right">
                Vendor Name*
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter vendor name"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="gstNo" className="text-right">
                GST Number
              </Label>
              <Input
                id="gstNo"
                name="gstNo"
                value={formData.gstNo}
                onChange={handleInputChange}
                placeholder="Enter GST number (optional)"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="phone" className="text-right">
                Phone Number*
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="email" className="text-right">
                Email Address*
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="address" className="text-right">
                Address*
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter complete address"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddVendorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVendor}>
              {selectedVendor ? "Update Vendor" : "Add Vendor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Vendor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this vendor? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteVendor}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryVendors;
