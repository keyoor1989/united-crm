import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus } from "lucide-react";
import { toast } from "sonner";
import { Vendor, VendorPerformanceMetric } from "@/types/inventory";
import { useVendors } from "@/contexts/VendorContext";

import VendorTable from "@/components/inventory/vendors/VendorTable";
import PurchaseHistory from "@/components/inventory/vendors/PurchaseHistory";
import VendorFormDialog from "@/components/inventory/vendors/VendorFormDialog";
import DeleteVendorDialog from "@/components/inventory/vendors/DeleteVendorDialog";
import VendorPerformanceMetrics from "@/components/inventory/vendors/VendorPerformanceMetrics";

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

// Update the mockVendor to include all required fields
const mockVendor: Vendor = {
  id: "vendor1",
  name: "Ajanta Traders",
  contactPerson: "Rajesh Kumar",
  gstNo: "24AAKCS9636Q1ZX",
  phone: "9876543210",
  email: "info@ajanta.com",
  address: "142, Industrial Area, Indore, MP",
  createdAt: "2024-01-15"
};

// Mock performance data
const mockPerformanceData: VendorPerformanceMetric[] = [
  {
    id: "perf001",
    vendorId: "vendor1",
    period: "Q1 2025",
    totalOrders: 42,
    onTimeDelivery: 38,
    avgDeliveryTime: 2.3,
    priceConsistency: 4.5,
    productQuality: 4.7,
    returnRate: 1.2,
    reliabilityScore: 92,
    createdAt: "2025-04-01"
  },
  {
    id: "perf002",
    vendorId: "vendor1",
    period: "Q4 2024",
    totalOrders: 38,
    onTimeDelivery: 34,
    avgDeliveryTime: 2.5,
    priceConsistency: 4.3,
    productQuality: 4.5,
    returnRate: 1.5,
    reliabilityScore: 89,
    createdAt: "2025-01-01"
  },
  {
    id: "perf003",
    vendorId: "vendor1",
    period: "Q3 2024",
    totalOrders: 35,
    onTimeDelivery: 30,
    avgDeliveryTime: 2.8,
    priceConsistency: 4.2,
    productQuality: 4.4,
    returnRate: 1.8,
    reliabilityScore: 86,
    createdAt: "2024-10-01"
  }
];

const VendorPerformance = () => {
  const { vendors: salesVendors, addVendor, updateVendor, deleteVendor } = useVendors();
  const [activeTab, setActiveTab] = useState("management");
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
  
  // Convert from sales vendors to inventory vendors
  const vendors: Vendor[] = salesVendors.map(vendor => ({
    id: vendor.id,
    name: vendor.name,
    contactPerson: vendor.contactPerson,
    email: vendor.email,
    phone: vendor.phone,
    address: vendor.address,
    gstNo: '',
    createdAt: new Date().toISOString().split('T')[0]
  }));
  
  // Performance tab states
  const mockTimePeriods = ["Q1 2025", "Q4 2024", "Q3 2024"];
  
  const filteredVendors = vendors.filter(vendor => 
    searchQuery ? 
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.gstNo && vendor.gstNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
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
      gstNo: vendor.gstNo || "",
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
      // Convert from inventory vendor to sales vendor format
      const salesVendor = {
        id: selectedVendor.id,
        name: formData.name,
        contactPerson: selectedVendor.contactPerson,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
      };
      
      updateVendor(salesVendor);
      toast.success("Vendor updated successfully");
    } else {
      // Convert from form data to sales vendor format for adding
      const newSalesVendor = {
        name: formData.name,
        contactPerson: "",
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
      };
      
      addVendor(newSalesVendor);
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
    setActiveTab("history");
  };
  
  const handleViewPerformance = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setActiveTab("metrics");
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
            Manage vendors and monitor their performance metrics
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

      {/* Search and filter row */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button variant="outline" className="sm:ml-auto flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="management">Vendor Directory</TabsTrigger>
          <TabsTrigger value="history">Purchase History</TabsTrigger>
          <TabsTrigger value="metrics">Performance</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        {/* Vendor Management Tab */}
        <TabsContent value="management" className="mt-4">
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
        
        {/* Purchase History Tab */}
        <TabsContent value="history" className="mt-4">
          <PurchaseHistory 
            selectedVendor={selectedVendor}
            setActiveTab={setActiveTab}
            formatDate={formatDate}
            purchaseHistory={mockPurchaseHistory}
            searchQuery={searchQuery}
          />
        </TabsContent>
        
        {/* Performance Metrics Tab */}
        <TabsContent value="metrics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>
                Overall vendor performance metrics and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VendorPerformanceMetrics 
                vendor={selectedVendor || mockVendor} 
                performanceData={mockPerformanceData} 
                timePeriods={mockTimePeriods} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs content */}
        <TabsContent value="quality" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics</CardTitle>
              <CardDescription>
                Product quality and defect rates by vendor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Quality metrics content would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Performance</CardTitle>
              <CardDescription>
                On-time delivery rates and fulfillment metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Delivery metrics content would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Analysis</CardTitle>
              <CardDescription>
                Cost trends and competitive pricing analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Pricing analysis content would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Vendor Form Dialog */}
      <VendorFormDialog 
        open={isAddVendorOpen}
        onOpenChange={setIsAddVendorOpen}
        selectedVendor={selectedVendor}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSaveVendor={handleSaveVendor}
      />
      
      {/* Delete Vendor Dialog */}
      <DeleteVendorDialog 
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        handleDeleteVendor={handleDeleteVendor}
      />
    </div>
  );
};

export default VendorPerformance;
