
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Home,
  Search,
  Filter,
  Plus,
  Package,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Warehouse
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

// Mock data for warehouses
const mockWarehouses = [
  {
    id: "1",
    name: "Main Warehouse",
    code: "MW01",
    location: "Indore",
    address: "123 Industrial Area, Indore, MP",
    contactPerson: "Rajesh Singh",
    contactPhone: "9876543210",
    isActive: true,
    createdAt: "2025-01-10"
  },
  {
    id: "2",
    name: "Bhopal Warehouse",
    code: "BW01",
    location: "Bhopal",
    address: "456 Commerce Zone, Bhopal, MP",
    contactPerson: "Priya Sharma",
    contactPhone: "9876543211",
    isActive: true,
    createdAt: "2025-02-15"
  },
  {
    id: "3",
    name: "Jabalpur Storage",
    code: "JS01",
    location: "Jabalpur",
    address: "789 Warehouse Complex, Jabalpur, MP",
    contactPerson: "Amit Kumar",
    contactPhone: "9876543212",
    isActive: false,
    createdAt: "2025-03-20"
  }
];

// Mock data for warehouse stock
const mockWarehouseStock = [
  {
    id: "1",
    warehouseId: "1",
    itemId: "1",
    itemName: "Black Toner",
    brand: "Kyocera",
    model: "2554ci",
    quantity: 15,
    lastUpdated: "2025-04-01"
  },
  {
    id: "2",
    warehouseId: "1",
    itemId: "2",
    itemName: "Drum Unit",
    brand: "Kyocera",
    model: "2554ci",
    quantity: 8,
    lastUpdated: "2025-03-28"
  },
  {
    id: "3",
    warehouseId: "2",
    itemId: "1",
    itemName: "Black Toner",
    brand: "Kyocera",
    model: "2554ci",
    quantity: 5,
    lastUpdated: "2025-03-25"
  }
];

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

const InventoryWarehouses = () => {
  const [activeTab, setActiveTab] = useState("warehouses");
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);

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

  // Filter warehouses based on search
  const filteredWarehouses = mockWarehouses.filter(warehouse =>
    searchQuery
      ? warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warehouse.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warehouse.location.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // Filter stock based on selected warehouse
  const filteredStock = mockWarehouseStock.filter(stock =>
    selectedWarehouse ? stock.warehouseId === selectedWarehouse : true
  );

  // Handle form submission
  const onSubmit = (values: WarehouseFormValues) => {
    if (editingWarehouse) {
      // In a real app, update warehouse in database
      console.log("Updating warehouse:", values);
      toast.success(`Warehouse "${values.name}" updated successfully!`);
    } else {
      // In a real app, add new warehouse to database
      console.log("Adding new warehouse:", values);
      toast.success(`Warehouse "${values.name}" added successfully!`);
    }
    
    setOpenAddDialog(false);
    setEditingWarehouse(null);
    form.reset();
  };

  // Handle edit warehouse
  const handleEditWarehouse = (warehouse: any) => {
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
    // In a real app, delete warehouse from database
    console.log("Deleting warehouse:", warehouseId);
    toast.success("Warehouse deleted successfully!");
  };

  return (
    <Layout>
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
                  {mockWarehouses.map((warehouse) => (
                    <Button
                      key={warehouse.id}
                      variant={selectedWarehouse === warehouse.id ? "default" : "outline"}
                      onClick={() => setSelectedWarehouse(warehouse.id)}
                    >
                      {warehouse.name}
                    </Button>
                  ))}
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStock.map((stock) => {
                      const warehouse = mockWarehouses.find(w => w.id === stock.warehouseId);
                      return (
                        <TableRow key={stock.id}>
                          <TableCell className="font-medium">{stock.itemName}</TableCell>
                          <TableCell>{stock.brand}</TableCell>
                          <TableCell>{stock.model}</TableCell>
                          <TableCell>{warehouse?.name || "Unknown"}</TableCell>
                          <TableCell>{stock.quantity}</TableCell>
                          <TableCell>{new Date(stock.lastUpdated).toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    })}

                    {filteredStock.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No stock found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
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
                  <Button type="submit">
                    {editingWarehouse ? "Update Warehouse" : "Add Warehouse"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default InventoryWarehouses;
