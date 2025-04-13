import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Download, Printer, MoreHorizontal } from "lucide-react";
import { InventoryItem } from "@/types/inventory";

// Mock data for machine parts
const mockInventoryItems = [
  {
    id: '1',
    name: 'Toner Cartridge',
    category: 'Toner',
    brand: 'Canon',
    model: 'IR2525',
    currentStock: 15,
    minStockLevel: 5,
    maxStockLevel: 30,
    reorderPoint: 10,
    unitCost: 2500,
    unitPrice: 3000,
    location: 'Warehouse A',
    lastRestocked: '2023-01-15',
    createdAt: '2023-01-01',
    modelId: 'model-1',
    brandId: 'brand-1',
    type: 'Toner',
    minQuantity: 5,
    currentQuantity: 15,
    lastPurchasePrice: 2500,
    lastVendor: 'ABC Supplies',
    barcode: 'TON-12345',
    part_name: 'Toner Cartridge',
    quantity: 15,
    min_stock: 5,
    purchase_price: 2500,
    part_number: 'TON-12345',
    compatible_models: ['IR2525', 'IR2530'],
    brand_id: 'brand-1',
    model_id: 'model-1'
  }
];

const MachineParts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch items (mock data for now)
  useEffect(() => {
    // In a real app, this would be an API call
    setItems(mockInventoryItems);
  }, []);

  // Filter items based on search term, category, and brand
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.part_number && item.part_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesBrand = selectedBrand === "all" || item.brand === selectedBrand;
    
    // Filter by tab
    if (activeTab === "low_stock") {
      return matchesSearch && matchesCategory && matchesBrand && item.currentStock < item.minStockLevel;
    }
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

  // Get unique categories and brands for filters
  const categories = Array.from(new Set(items.map(item => item.category)));
  const brands = Array.from(new Set(items.map(item => item.brand)));

  // Add new item handler (would connect to API in real app)
  const handleAddItem = (formData: any) => {
    console.log("Adding new item:", formData);
    setIsAddDialogOpen(false);
    // In a real app, this would make an API call and then refresh the items
  };

  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>Machine Parts Inventory</title>
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Machine Parts Inventory</h1>
          <p className="text-muted-foreground">
            Manage your machine parts, toners, and other consumables
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Part
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Machine Part</DialogTitle>
                <DialogDescription>
                  Enter the details of the new part to add it to inventory
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Part Name</Label>
                    <Input id="name" placeholder="e.g., Toner Cartridge" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Toner">Toner</SelectItem>
                        <SelectItem value="Drum">Drum</SelectItem>
                        <SelectItem value="Fuser">Fuser</SelectItem>
                        <SelectItem value="Developer">Developer</SelectItem>
                        <SelectItem value="Paper Feed">Paper Feed</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                        <SelectItem value="other">Add New Brand...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Compatible Model</Label>
                    <Input id="model" placeholder="e.g., IR2525, WorkCentre" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentStock">Current Stock</Label>
                    <Input id="currentStock" type="number" min="0" defaultValue="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStock">Min Stock Level</Label>
                    <Input id="minStock" type="number" min="0" defaultValue="5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitCost">Unit Cost (₹)</Label>
                    <Input id="unitCost" type="number" min="0" defaultValue="0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partNumber">Part Number / SKU</Label>
                  <Input id="partNumber" placeholder="e.g., NPG-51" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => handleAddItem({})}>Add Part</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All Parts</TabsTrigger>
            <TabsTrigger value="low_stock">Low Stock</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search parts..."
                className="w-[250px] pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Compatible Models</TableHead>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.brand}</TableCell>
                        <TableCell>
                          {Array.isArray(item.compatible_models) 
                            ? item.compatible_models.join(", ") 
                            : item.model}
                        </TableCell>
                        <TableCell>{item.part_number || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={item.currentStock < item.minStockLevel ? "text-destructive font-medium" : ""}>
                              {item.currentStock}
                            </span>
                            {item.currentStock < item.minStockLevel && (
                              <Badge variant="destructive" className="ml-2">Low</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>₹{item.unitCost.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                        No parts found. Try adjusting your filters or add a new part.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low_stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
              <CardDescription>
                Items that are below their minimum stock level and need to be reordered
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min Stock</TableHead>
                    <TableHead>Reorder Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.brand}</TableCell>
                        <TableCell className="text-destructive font-medium">{item.currentStock}</TableCell>
                        <TableCell>{item.minStockLevel}</TableCell>
                        <TableCell>{item.maxStockLevel - item.currentStock}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm">Reorder</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No low stock items found. All inventory levels are healthy.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MachineParts;
