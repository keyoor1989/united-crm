import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, Plus, FileText, Settings, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import OpeningStockEntryForm from "@/components/inventory/OpeningStockEntryForm";
import { mockInventoryItems } from "@/components/service/inventory/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const MachinePartsWithQueryClient = () => (
  <QueryClientProvider client={queryClient}>
    <MachineParts />
  </QueryClientProvider>
);

const MachineParts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [openStockEntryForm, setOpenStockEntryForm] = useState(false);
  
  const { data: machineParts = [], isLoading, refetch } = useQuery({
    queryKey: ['machine-parts'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('opening_stock_entries')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching machine parts:", error);
          return mockInventoryItems;
        }
        
        if (data && data.length > 0) {
          return data.map(item => ({
            id: item.id,
            partNumber: item.part_number,
            name: item.part_name,
            brand: item.brand,
            category: item.category,
            compatibleModels: item.compatible_models || [],
            currentStock: item.quantity,
            minStock: item.min_stock,
            purchasePrice: item.purchase_price,
            warehouseId: item.warehouse_id,
            warehouseName: item.warehouse_name || "Main Warehouse",
          }));
        } else {
          return mockInventoryItems;
        }
      } catch (error) {
        console.error("Exception fetching machine parts:", error);
        return mockInventoryItems;
      }
    }
  });
  
  const filteredParts = machineParts.filter(part => {
    const matchesSearch = searchQuery ? 
      part.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.partNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.warehouseName?.toLowerCase().includes(searchQuery.toLowerCase())
    : true;
    
    const matchesCategory = activeTab === "all" || 
      part.category?.toLowerCase().includes(activeTab.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });
  
  const getStockStatus = (current, min) => {
    if (current <= 0) {
      return { label: "Out of Stock", variant: "destructive" as const };
    } else if (current < min) {
      return { label: "Low Stock", variant: "warning" as const };
    } else {
      return { label: "In Stock", variant: "success" as const };
    }
  };

  const handleAddPart = (newPart) => {
    refetch();
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Machine Parts Catalog</h1>
          <p className="text-muted-foreground">
            Manage and organize parts for different machine models
          </p>
        </div>
        <Button 
          className="flex items-center gap-1 bg-black text-white hover:bg-black/90"
          onClick={() => setOpenStockEntryForm(true)}
        >
          <Plus className="h-4 w-4" />
          Add New Part
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search parts by name, number, or brand..."
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
          <TabsTrigger value="all">All Parts</TabsTrigger>
          <TabsTrigger value="toner">Toner</TabsTrigger>
          <TabsTrigger value="drum">Drums</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Kits</TabsTrigger>
          <TabsTrigger value="fuser">Fusers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Parts Catalog</CardTitle>
              <CardDescription>
                Complete listing of all machine parts in inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p>Loading parts inventory...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Compatible Models</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Price (₹)</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParts.length > 0 ? (
                      filteredParts.map((part) => {
                        const stockStatus = getStockStatus(part.currentStock, part.minStock);
                        return (
                          <TableRow key={part.id}>
                            <TableCell className="font-medium">{part.partNumber}</TableCell>
                            <TableCell>{part.name}</TableCell>
                            <TableCell>{part.brand}</TableCell>
                            <TableCell>{part.category}</TableCell>
                            <TableCell>
                              <div className="text-xs max-w-[200px] truncate">
                                {Array.isArray(part.compatibleModels) 
                                  ? part.compatibleModels.join(", ") 
                                  : "N/A"}
                              </div>
                            </TableCell>
                            <TableCell>{part.currentStock}</TableCell>
                            <TableCell>{typeof part.purchasePrice === 'number' 
                              ? part.purchasePrice.toLocaleString() 
                              : part.purchasePrice}</TableCell>
                            <TableCell>{part.warehouseName || "Main Warehouse"}</TableCell>
                            <TableCell>
                              <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon">
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Settings className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="h-24 text-center">
                          No parts found. Add your first part by clicking "Add New Part" above.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="toner" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Toner Cartridges</CardTitle>
              <CardDescription>
                Toner cartridges for various printer and copier models
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredParts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Compatible Models</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Price (₹)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParts.map(part => {
                      const stockStatus = getStockStatus(part.currentStock, part.minStock);
                      return (
                        <TableRow key={part.id}>
                          <TableCell className="font-medium">{part.partNumber}</TableCell>
                          <TableCell>{part.name}</TableCell>
                          <TableCell>{part.brand}</TableCell>
                          <TableCell>
                            <div className="text-xs max-w-[200px] truncate">
                              {part.compatibleModels.join(", ")}
                            </div>
                          </TableCell>
                          <TableCell>{part.currentStock}</TableCell>
                          <TableCell>{part.purchasePrice.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-muted-foreground">No toner cartridges found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="drum" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Drum Units</CardTitle>
              <CardDescription>
                Drum and imaging units for various machine models
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredParts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Compatible Models</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Price (₹)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParts.map(part => {
                      const stockStatus = getStockStatus(part.currentStock, part.minStock);
                      return (
                        <TableRow key={part.id}>
                          <TableCell className="font-medium">{part.partNumber}</TableCell>
                          <TableCell>{part.name}</TableCell>
                          <TableCell>{part.brand}</TableCell>
                          <TableCell>
                            <div className="text-xs max-w-[200px] truncate">
                              {part.compatibleModels.join(", ")}
                            </div>
                          </TableCell>
                          <TableCell>{part.currentStock}</TableCell>
                          <TableCell>{part.purchasePrice.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-muted-foreground">No drum units found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="maintenance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Kits</CardTitle>
              <CardDescription>
                Preventive maintenance kits for various machine models
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredParts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Compatible Models</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Price (₹)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParts.map(part => {
                      const stockStatus = getStockStatus(part.currentStock, part.minStock);
                      return (
                        <TableRow key={part.id}>
                          <TableCell className="font-medium">{part.partNumber}</TableCell>
                          <TableCell>{part.name}</TableCell>
                          <TableCell>{part.brand}</TableCell>
                          <TableCell>
                            <div className="text-xs max-w-[200px] truncate">
                              {part.compatibleModels.join(", ")}
                            </div>
                          </TableCell>
                          <TableCell>{part.currentStock}</TableCell>
                          <TableCell>{part.purchasePrice.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-muted-foreground">No maintenance kits found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fuser" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Fusers & Fixing Film</CardTitle>
              <CardDescription>
                Fuser assemblies and fixing film for various machine models
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredParts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Compatible Models</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Price (₹)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParts.map(part => {
                      const stockStatus = getStockStatus(part.currentStock, part.minStock);
                      return (
                        <TableRow key={part.id}>
                          <TableCell className="font-medium">{part.partNumber}</TableCell>
                          <TableCell>{part.name}</TableCell>
                          <TableCell>{part.brand}</TableCell>
                          <TableCell>
                            <div className="text-xs max-w-[200px] truncate">
                              {part.compatibleModels.join(", ")}
                            </div>
                          </TableCell>
                          <TableCell>{part.currentStock}</TableCell>
                          <TableCell>{part.purchasePrice.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-muted-foreground">No fuser units found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <OpeningStockEntryForm 
        open={openStockEntryForm}
        onOpenChange={setOpenStockEntryForm}
        onAddPart={handleAddPart}
      />
    </div>
  );
};

export default MachinePartsWithQueryClient;
