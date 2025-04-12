
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Warehouse, WarehouseStock } from "@/types/inventory";

// Clear mock arrays - we'll use the database now
export const mockWarehouses: Warehouse[] = [];
const mockWarehouseStock: WarehouseStock[] = [];

// Form schema for adding/editing warehouses
const warehouseFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  code: z.string().min(2, { message: "Code must be at least 2 characters." }),
  location: z.string().min(3, { message: "Location is required." }),
  address: z.string().min(5, { message: "Address is required." }),
  contactPerson: z.string().min(3, { message: "Contact person name is required." }),
  contactPhone: z.string().min(10, { message: "Valid phone number is required." }),
  isActive: z.boolean().default(true),
});

type WarehouseFormValues = z.infer<typeof warehouseFormSchema>;

// Fetch warehouses from Supabase
const fetchWarehouses = async (): Promise<Warehouse[]> => {
  const { data, error } = await supabase
    .from('warehouses')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    throw error;
  }
  
  // Transform the data to match our Warehouse type
  return data.map(warehouse => ({
    id: warehouse.id,
    name: warehouse.name,
    code: warehouse.code,
    location: warehouse.location,
    address: warehouse.address,
    contactPerson: warehouse.contact_person,
    contactPhone: warehouse.contact_phone,
    isActive: warehouse.is_active,
    createdAt: warehouse.created_at
  }));
};

// Fetch warehouse stock from Supabase
const fetchWarehouseStock = async (warehouseId: string | null): Promise<WarehouseStock[]> => {
  let query = supabase
    .from('warehouse_stock')
    .select(`
      id,
      warehouse_id,
      item_id,
      quantity,
      last_updated
    `);
    
  if (warehouseId) {
    query = query.eq('warehouse_id', warehouseId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return data.map(stock => ({
    id: stock.id,
    warehouseId: stock.warehouse_id,
    itemId: stock.item_id,
    quantity: stock.quantity,
    lastUpdated: stock.last_updated
  }));
};

const InventoryWarehouses = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("warehouses");
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Initialize form
  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: {
      name: "",
      code: "",
      location: "",
      address: "",
      contactPerson: "",
      contactPhone: "",
      isActive: true,
    },
  });

  // Fetch warehouses query
  const { 
    data: warehouses = [], 
    isLoading: isLoadingWarehouses,
    error: warehousesError 
  } = useQuery({
    queryKey: ['warehouses'],
    queryFn: fetchWarehouses
  });

  // Fetch warehouse stock query
  const { 
    data: warehouseStock = [], 
    isLoading: isLoadingStock 
  } = useQuery({
    queryKey: ['warehouseStock', selectedWarehouse],
    queryFn: () => fetchWarehouseStock(selectedWarehouse),
    enabled: activeTab === "inventory"
  });

  // Create warehouse mutation
  const createWarehouseMutation = useMutation({
    mutationFn: async (values: WarehouseFormValues) => {
      const { data, error } = await supabase
        .from('warehouses')
        .insert({
          name: values.name,
          code: values.code,
          location: values.location,
          address: values.address,
          contact_person: values.contactPerson,
          contact_phone: values.contactPhone,
          is_active: values.isActive
        })
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setOpenAddDialog(false);
      form.reset();
      toast.success("Warehouse added successfully!");
    },
    onError: (error) => {
      console.error("Error adding warehouse:", error);
      toast.error("Failed to add warehouse: " + error.message);
    }
  });

  // Update warehouse mutation
  const updateWarehouseMutation = useMutation({
    mutationFn: async (values: WarehouseFormValues & { id: string }) => {
      const { data, error } = await supabase
        .from('warehouses')
        .update({
          name: values.name,
          code: values.code,
          location: values.location,
          address: values.address,
          contact_person: values.contactPerson,
          contact_phone: values.contactPhone,
          is_active: values.isActive
        })
        .eq('id', values.id)
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setOpenAddDialog(false);
      setEditingWarehouse(null);
      form.reset();
      toast.success("Warehouse updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating warehouse:", error);
      toast.error("Failed to update warehouse: " + error.message);
    }
  });

  // Delete warehouse mutation
  const deleteWarehouseMutation = useMutation({
    mutationFn: async (warehouseId: string) => {
      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', warehouseId);
        
      if (error) throw error;
      return warehouseId;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setDeleteConfirmId(null);
      toast.success("Warehouse deleted successfully!");
      
      // If we're viewing stock for the deleted warehouse, reset selection
      if (selectedWarehouse === deletedId) {
        setSelectedWarehouse(null);
      }
    },
    onError: (error) => {
      console.error("Error deleting warehouse:", error);
      toast.error("Failed to delete warehouse: " + error.message);
    }
  });

  // Filter warehouses based on search
  const filteredWarehouses = warehouses.filter(warehouse =>
    searchQuery
      ? warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warehouse.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warehouse.location.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // Filter stock based on selected warehouse
  const filteredStock = warehouseStock.filter(stock =>
    selectedWarehouse ? stock.warehouseId === selectedWarehouse : true
  );

  // Handle form submission
  const onSubmit = (values: WarehouseFormValues) => {
    if (editingWarehouse) {
      updateWarehouseMutation.mutate({
        ...values,
        id: editingWarehouse.id
      });
    } else {
      createWarehouseMutation.mutate(values);
    }
  };

  // Handle edit warehouse
  const handleEditWarehouse = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    form.reset({
      name: warehouse.name,
      code: warehouse.code,
      location: warehouse.location,
      address: warehouse.address,
      contactPerson: warehouse.contactPerson,
      contactPhone: warehouse.contactPhone,
      isActive: warehouse.isActive,
    });
    setOpenAddDialog(true);
  };

  // Handle delete warehouse
  const handleDeleteWarehouse = (warehouseId: string) => {
    setDeleteConfirmId(warehouseId);
  };

  // Confirm delete warehouse
  const confirmDeleteWarehouse = () => {
    if (deleteConfirmId) {
      deleteWarehouseMutation.mutate(deleteConfirmId);
    }
  };

  // Handle errors with toast notifications
  useEffect(() => {
    if (warehousesError) {
      toast.error(`Error loading warehouses: ${warehousesError.message}`);
    }
  }, [warehousesError]);
  
  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Warehouse Management</h1>
          <p className="text-muted-foreground">
            Manage warehouses and track inventory across locations
          </p>
        </div>
        <Button onClick={() => {
          setEditingWarehouse(null);
          form.reset();
          setOpenAddDialog(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Warehouse
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search warehouses..."
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
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="inventory">Warehouse Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="warehouses" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Locations</CardTitle>
              <CardDescription>
                Manage your warehouse facilities and storage locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingWarehouses ? (
                <div className="h-24 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading warehouses...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWarehouses.map((warehouse) => (
                      <TableRow key={warehouse.id}>
                        <TableCell className="font-medium">{warehouse.name}</TableCell>
                        <TableCell>{warehouse.code}</TableCell>
                        <TableCell>{warehouse.location}</TableCell>
                        <TableCell>{warehouse.contactPerson}</TableCell>
                        <TableCell>{warehouse.contactPhone}</TableCell>
                        <TableCell>
                          <Badge variant={warehouse.isActive ? "success" : "secondary"}>
                            {warehouse.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleEditWarehouse(warehouse)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleDeleteWarehouse(warehouse.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredWarehouses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No warehouses found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Inventory</CardTitle>
              <CardDescription>
                View inventory levels across all warehouses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button 
                  variant={selectedWarehouse === null ? "default" : "outline"}
                  onClick={() => setSelectedWarehouse(null)}
                >
                  All Warehouses
                </Button>
                {warehouses.map((warehouse) => (
                  <Button
                    key={warehouse.id}
                    variant={selectedWarehouse === warehouse.id ? "default" : "outline"}
                    onClick={() => setSelectedWarehouse(warehouse.id)}
                    disabled={!warehouse.isActive}
                  >
                    {warehouse.name}
                  </Button>
                ))}
              </div>

              {isLoadingStock ? (
                <div className="h-24 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading inventory data...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item ID</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStock.map((stock) => {
                      const warehouse = warehouses.find(w => w.id === stock.warehouseId);
                      return (
                        <TableRow key={stock.id}>
                          <TableCell className="font-medium">{stock.itemId}</TableCell>
                          <TableCell>{warehouse?.name || "Unknown"}</TableCell>
                          <TableCell>{stock.quantity}</TableCell>
                          <TableCell>{new Date(stock.lastUpdated).toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    })}

                    {filteredStock.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No stock found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Warehouse Dialog */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingWarehouse ? "Edit Warehouse" : "Add New Warehouse"}</DialogTitle>
            <DialogDescription>
              {editingWarehouse 
                ? "Update the warehouse details below." 
                : "Enter the warehouse details below to add a new storage location."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Main Warehouse" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse Code</FormLabel>
                      <FormControl>
                        <Input placeholder="MW01" {...field} />
                      </FormControl>
                      <FormDescription>
                        A unique code for this warehouse
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Indore" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Is this warehouse currently active?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Industrial Area, Indore, MP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input placeholder="Rajesh Singh" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setOpenAddDialog(false);
                    setEditingWarehouse(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createWarehouseMutation.isPending || updateWarehouseMutation.isPending}
                >
                  {(createWarehouseMutation.isPending || updateWarehouseMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingWarehouse ? "Update Warehouse" : "Add Warehouse"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this warehouse? This action cannot be undone, and all inventory 
              associated with this warehouse will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4 flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteWarehouse}
              disabled={deleteWarehouseMutation.isPending}
            >
              {deleteWarehouseMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Warehouse
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryWarehouses;
