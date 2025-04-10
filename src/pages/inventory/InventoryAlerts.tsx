
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AlertTriangle, ShoppingCart, Package, Search, Filter, CheckCircle2, Clock, BarChart3 } from "lucide-react";

// Sample low stock data
const lowStockItems = [
  {
    id: "1",
    name: "Kyocera 2554ci Toner Black",
    brand: "Kyocera",
    model: "2554ci",
    currentQuantity: 0,
    minQuantity: 2,
    lastPurchaseDate: "2025-03-15",
    lastPurchasePrice: 4500,
    lastVendor: "Tech Supplies Ltd",
    location: "Indore (HQ)",
    status: "Out of Stock"
  },
  {
    id: "2",
    name: "Ricoh MP2014 Drum Unit",
    brand: "Ricoh",
    model: "MP2014",
    currentQuantity: 1,
    minQuantity: 3,
    lastPurchaseDate: "2025-03-18",
    lastPurchasePrice: 3200,
    lastVendor: "Copier Parts India",
    location: "Indore (HQ)",
    status: "Low Stock"
  },
  {
    id: "3",
    name: "Xerox 7845 Toner Cyan",
    brand: "Xerox",
    model: "7845",
    currentQuantity: 1,
    minQuantity: 2,
    lastPurchaseDate: "2025-03-20",
    lastPurchasePrice: 5100,
    lastVendor: "Xerox Distributor",
    location: "Bhopal Office",
    status: "Low Stock"
  },
  {
    id: "4",
    name: "Canon 2525 Fuser Unit",
    brand: "Canon",
    model: "2525",
    currentQuantity: 0,
    minQuantity: 1,
    lastPurchaseDate: "2025-03-10",
    lastPurchasePrice: 7500,
    lastVendor: "Canon Express",
    location: "Indore (HQ)",
    status: "Out of Stock"
  },
  {
    id: "5",
    name: "Samsung ProXpress Toner",
    brand: "Samsung",
    model: "ProXpress",
    currentQuantity: 1,
    minQuantity: 3,
    lastPurchaseDate: "2025-02-28",
    lastPurchasePrice: 2800,
    lastVendor: "Samsung Parts",
    location: "Jabalpur Office",
    status: "Low Stock"
  },
  {
    id: "6",
    name: "HP M428 Scanner Assembly",
    brand: "HP",
    model: "M428",
    currentQuantity: 0,
    minQuantity: 1,
    lastPurchaseDate: "2025-03-05",
    lastPurchasePrice: 9200,
    lastVendor: "HP Enterprise",
    location: "Indore (HQ)",
    status: "Out of Stock"
  },
];

// Sample vendor list
const vendors = [
  { id: "1", name: "Tech Supplies Ltd", contact: "+91 98765 43210" },
  { id: "2", name: "Copier Parts India", contact: "+91 87654 32109" },
  { id: "3", name: "Xerox Distributor", contact: "+91 76543 21098" },
  { id: "4", name: "Canon Express", contact: "+91 65432 10987" },
  { id: "5", name: "Samsung Parts", contact: "+91 54321 09876" },
  { id: "6", name: "HP Enterprise", contact: "+91 43210 98765" },
];

// Sample locations
const locations = ["All Locations", "Indore (HQ)", "Bhopal Office", "Jabalpur Office"];

const InventoryAlerts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Filter low stock items based on search and filters
  const filteredItems = lowStockItems.filter((item) => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Location filter
    const matchesLocation = locationFilter === "All Locations" || 
      item.location === locationFilter;
    
    // Status filter
    const matchesStatus = statusFilter === "All" || 
      item.status === statusFilter;
    
    return matchesSearch && matchesLocation && matchesStatus;
  });
  
  // Handle item selection
  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  };
  
  // Handle select all
  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };
  
  // Handle create purchase order
  const handleCreatePurchaseOrder = () => {
    if (selectedItems.length === 0) {
      toast.warning("Please select at least one item");
      return;
    }
    
    const itemNames = selectedItems.map(id => 
      lowStockItems.find(item => item.id === id)?.name
    );
    
    toast.success(`Purchase order created for ${selectedItems.length} items`);
    console.log("Items for purchase order:", itemNames);
    setSelectedItems([]);
  };
  
  // Generate WhatsApp message
  const generateWhatsAppMessage = (item: typeof lowStockItems[0]) => {
    const message = `Hello ${item.lastVendor}, I would like to inquire about ${item.name} for ${item.brand} ${item.model}. Last purchase price was ₹${item.lastPurchasePrice}. Please quote your best price for 5 units. Thank you.`;
    return encodeURIComponent(message);
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Low Stock Alerts</h1>
          <p className="text-muted-foreground">Manage items that need to be reordered</p>
        </div>
        <Button 
          variant="default" 
          onClick={handleCreatePurchaseOrder}
          disabled={selectedItems.length === 0}
          className="gap-2"
        >
          <ShoppingCart size={16} />
          Create Purchase Order ({selectedItems.length})
        </Button>
      </div>
      
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>Low Stock Items</span>
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Vendor List</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 size={16} />
            <span>Reorder Analytics</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="alerts">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by item name or brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                {/* Location filter */}
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Status filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <input 
                          type="checkbox"
                          checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Brand / Model</TableHead>
                      <TableHead className="text-center">Current</TableHead>
                      <TableHead className="text-center">Minimum</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Last Price</TableHead>
                      <TableHead>Last Vendor</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="h-24 text-center">
                          No low stock items found with the current filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <input 
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => toggleItemSelection(item.id)}
                              className="rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell className="font-medium flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            {item.name}
                          </TableCell>
                          <TableCell>{item.brand} / {item.model}</TableCell>
                          <TableCell className="text-center font-bold">
                            {item.currentQuantity}
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {item.minQuantity}
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.status === "Out of Stock" ? "destructive" : "warning"}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell className="text-right">₹{item.lastPurchasePrice.toLocaleString()}</TableCell>
                          <TableCell className="max-w-[150px] truncate" title={item.lastVendor}>
                            {item.lastVendor}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">
                                Order
                              </Button>
                              <a 
                                href={`https://wa.me/?text=${generateWhatsAppMessage(item)}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Button variant="ghost" size="sm">
                                  WhatsApp
                                </Button>
                              </a>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Directory</CardTitle>
              <CardDescription>
                Contact information for all inventory suppliers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell>{vendor.contact}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">Call</Button>
                            <Button variant="outline" size="sm">Email</Button>
                            <Button variant="outline" size="sm">WhatsApp</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock size={18} />
                  Reorder Frequency
                </CardTitle>
                <CardDescription>
                  Items that need to be reordered most frequently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lowStockItems
                    .sort((a, b) => b.minQuantity - a.minQuantity)
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-muted w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.brand} / {item.model}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{item.minQuantity} min qty</Badge>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle size={18} />
                  Critical Items
                </CardTitle>
                <CardDescription>
                  Items that are completely out of stock
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lowStockItems
                    .filter(item => item.currentQuantity === 0)
                    .map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center">
                            <AlertTriangle size={16} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.brand} / {item.model}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Order Now</Button>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryAlerts;
