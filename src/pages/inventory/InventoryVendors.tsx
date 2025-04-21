import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  Plus,
  Store
} from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Vendor } from '@/types/inventory';
import { useVendors } from '@/contexts/VendorContext';
import VendorFormDialog from '@/components/inventory/vendors/VendorFormDialog';
import VendorTable from '@/components/inventory/vendors/VendorTable';
import { DeleteVendorDialog } from '@/components/inventory/vendors/DeleteVendorDialog';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { PurchaseHistory } from '@/components/inventory/vendors/PurchaseHistory';

const InventoryVendors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const { toast } = useToast();
  const { vendors, loading, error, addVendor, updateVendor, deleteVendor, refreshVendors } = useVendors();

  // Only refresh vendors once when the component mounts
  useEffect(() => {
    refreshVendors();
  }, []);

  // Filter vendors based on search query
  const filteredVendors = vendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (vendor.gstNo?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    vendor.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (vendor.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleAddVendor = () => {
    setSelectedVendor(null);
    setFormDialogOpen(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setFormDialogOpen(true);
  };

  const handleDeleteClick = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      setSelectedVendor(vendor);
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedVendor) {
      try {
        await deleteVendor(selectedVendor.id);
        setDeleteDialogOpen(false);
      } catch (error) {
        toast({
          title: "Failed to delete",
          description: "There was an error deleting the vendor.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleViewVendorDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setHistoryDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleSaveVendor = async (data: any) => {
    try {
      if (selectedVendor) {
        await updateVendor(selectedVendor.id, data);
      } else {
        await addVendor(data);
      }
      setFormDialogOpen(false);
      // Refresh vendor list after save
      await refreshVendors();
    } catch (error) {
      console.error("Error saving vendor:", error);
      toast({
        title: "Failed to save",
        description: "There was an error saving the vendor.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading vendors...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading vendors: {error.message}</div>;
  }

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
              <ScrollArea className="h-[calc(100vh-300px)]">
                <VendorTable 
                  vendors={filteredVendors}
                  formatDate={formatDate}
                  onViewVendorDetails={handleViewVendorDetails}
                  onEditVendor={handleEditVendor}
                  onDeleteClick={handleDeleteClick}
                />
              </ScrollArea>
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
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="brand-filter">Brand</Label>
                    <select
                      id="brand-filter"
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
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="all">All Vendors</option>
                      {vendors.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                      ))}
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
                    {vendors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      vendors.slice(0, 5).map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Store className="h-4 w-4 text-muted-foreground" />
                              {vendor.name}
                            </div>
                          </TableCell>
                          <TableCell>0 pcs</TableCell>
                          <TableCell>₹0</TableCell>
                          <TableCell>N/A</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Vendor Dialog */}
      <VendorFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        selectedVendor={selectedVendor}
        onSave={handleSaveVendor}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteVendorDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleConfirmDelete}
        vendorName={selectedVendor?.name || ""}
      />
      
      {/* Purchase History Dialog */}
      <PurchaseHistory
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        vendor={selectedVendor}
      />
    </div>
  );
};

export default InventoryVendors;
