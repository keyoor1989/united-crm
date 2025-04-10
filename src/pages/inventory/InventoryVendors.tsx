import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus } from "lucide-react";
import { toast } from "sonner";
import { Vendor } from "@/types/inventory";
import { useVendors } from "@/contexts/VendorContext";

import VendorTable from "@/components/inventory/vendors/VendorTable";
import PurchaseHistory from "@/components/inventory/vendors/PurchaseHistory";
import VendorFormDialog from "@/components/inventory/vendors/VendorFormDialog";
import DeleteVendorDialog from "@/components/inventory/vendors/DeleteVendorDialog";

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
  const { vendors, addVendor, updateVendor, deleteVendor } = useVendors();
  const [activeTab, setActiveTab] = useState("vendors");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    gstNo: "",
    phone: "",
    email: "",
    address: "",
  });
  
  const filteredVendors = vendors.filter(vendor => 
    searchQuery ? 
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.gstNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase())
    : true
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
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
  
  const handleDeleteClick = (vendorId: string) => {
    setVendorToDelete(vendorId);
    setIsDeleteConfirmOpen(true);
  };
  
  const handleSaveVendor = () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.address) {
      toast.error("Please fill all required fields");
      return;
    }
    
    if (selectedVendor) {
      const updatedVendor = { 
        ...selectedVendor, 
        name: formData.name,
        gstNo: formData.gstNo,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
      };
      updateVendor(updatedVendor);
      toast.success("Vendor updated successfully");
    } else {
      const newVendor: Vendor = {
        id: `vendor${Date.now()}`,
        name: formData.name,
        gstNo: formData.gstNo,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        createdAt: new Date().toISOString().split('T')[0],
      };
      addVendor(newVendor);
      toast.success("Vendor added successfully");
    }
    
    setIsAddVendorOpen(false);
  };
  
  const handleDeleteVendor = () => {
    if (vendorToDelete) {
      const hasHistory = mockPurchaseHistory.some(purchase => purchase.vendorId === vendorToDelete);
      
      if (hasHistory) {
        toast.error("Cannot delete vendor with purchase history");
      } else {
        deleteVendor(vendorToDelete);
        toast.success("Vendor deleted successfully");
      }
      
      setIsDeleteConfirmOpen(false);
      setVendorToDelete(null);
    }
  };
  
  const handleViewVendorDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setActiveTab("purchase-history");
  };
  
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
              <VendorTable 
                vendors={filteredVendors}
                formatDate={formatDate}
                onViewVendorDetails={handleViewVendorDetails}
                onEditVendor={handleEditVendor}
                onDeleteClick={handleDeleteClick}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="purchase-history" className="mt-4">
          <PurchaseHistory 
            selectedVendor={selectedVendor}
            setActiveTab={setActiveTab}
            formatDate={formatDate}
            purchaseHistory={mockPurchaseHistory}
            searchQuery={searchQuery}
          />
        </TabsContent>
      </Tabs>
      
      <VendorFormDialog 
        open={isAddVendorOpen}
        onOpenChange={setIsAddVendorOpen}
        selectedVendor={selectedVendor}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSaveVendor={handleSaveVendor}
      />
      
      <DeleteVendorDialog 
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        handleDeleteVendor={handleDeleteVendor}
      />
    </div>
  );
};

export default InventoryVendors;
