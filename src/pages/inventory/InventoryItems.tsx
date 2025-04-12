
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, Edit, Trash, Barcode, Printer } from "lucide-react";
import { Brand, Model, InventoryItem, ItemType } from "@/types/inventory";

const itemTypes: ItemType[] = ["Toner", "Drum", "Developer", "Fuser", "Paper Feed", "Other"];

const InventoryItems = () => {
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  const [newItem, setNewItem] = useState<{
    brandId: string;
    modelId: string;
    name: string;
    type: ItemType;
    minQuantity: number;
    purchasePrice: number;
    vendor: string;
  }>({
    brandId: "",
    modelId: "",
    name: "",
    type: "Toner",
    minQuantity: 1,
    purchasePrice: 0,
    vendor: "",
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save to the database
    console.log("Saving item:", selectedItem ? "Update" : "New", newItem);
    setOpenItemDialog(false);
    
    // Reset form
    setNewItem({
      brandId: "",
      modelId: "",
      name: "",
      type: "Toner",
      minQuantity: 1,
      purchasePrice: 0,
      vendor: "",
    });
    setSelectedItem(null);
  };

  const filteredItems = items.filter(item => {
    const brand = brands.find(b => b.id === item.brandId);
    const model = models.find(m => m.id === item.modelId);
    
    const searchLower = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      brand?.name.toLowerCase().includes(searchLower) ||
      model?.name.toLowerCase().includes(searchLower) ||
      item.type.toLowerCase().includes(searchLower) ||
      item.barcode.toLowerCase().includes(searchLower)
    );
  });

  const modelsForSelectedBrand = models.filter(
    model => model.brandId === newItem.brandId
  );

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Item Master</h1>
          <p className="text-muted-foreground">Manage all your inventory items</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Items</CardTitle>
            <CardDescription>Manage all spare parts and consumables</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search items..."
                className="w-[250px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={openItemDialog} onOpenChange={setOpenItemDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Item</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <form onSubmit={handleAddItem}>
                  <DialogHeader>
                    <DialogTitle>{selectedItem ? "Edit Item" : "Add New Item"}</DialogTitle>
                    <DialogDescription>
                      Enter the item details and generate a barcode.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="item-brand">Brand</Label>
                      <Select 
                        value={newItem.brandId} 
                        onValueChange={(value) => setNewItem({ ...newItem, brandId: value, modelId: "" })}
                      >
                        <SelectTrigger id="item-brand">
                          <SelectValue placeholder="Select Brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item-model">Model</Label>
                      <Select 
                        value={newItem.modelId} 
                        onValueChange={(value) => setNewItem({ ...newItem, modelId: value })}
                        disabled={!newItem.brandId}
                      >
                        <SelectTrigger id="item-model">
                          <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                        <SelectContent>
                          {modelsForSelectedBrand.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item-name">Item Name</Label>
                      <Input
                        id="item-name"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        placeholder="e.g. Black Toner, Drum Unit"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item-type">Item Type</Label>
                      <Select 
                        value={newItem.type} 
                        onValueChange={(value) => setNewItem({ ...newItem, type: value as ItemType })}
                      >
                        <SelectTrigger id="item-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {itemTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="min-quantity">Minimum Quantity</Label>
                      <Input
                        id="min-quantity"
                        type="number"
                        min="0"
                        value={newItem.minQuantity}
                        onChange={(e) => setNewItem({ ...newItem, minQuantity: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purchase-price">Purchase Price (₹)</Label>
                      <Input
                        id="purchase-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newItem.purchasePrice}
                        onChange={(e) => setNewItem({ ...newItem, purchasePrice: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="vendor">Vendor</Label>
                      <Input
                        id="vendor"
                        value={newItem.vendor}
                        onChange={(e) => setNewItem({ ...newItem, vendor: e.target.value })}
                        placeholder="e.g. Copier Zone, Toner World"
                        required
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Barcode className="h-4 w-4" />
                        <span>Barcode will be auto-generated</span>
                      </div>
                      <Button variant="outline" type="button" className="flex items-center gap-1">
                        <Printer className="h-4 w-4" />
                        <span>Print Barcode</span>
                      </Button>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {selectedItem ? "Update Item" : "Add Item"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand / Model</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Last Purchase</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No items found. Try changing your search or add a new item.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const brand = brands.find(b => b.id === item.brandId);
                  const model = models.find(m => m.id === item.modelId);
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{brand?.name || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">{model?.name || "Unknown"}</div>
                        </div>
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${item.currentQuantity < item.minQuantity ? "text-red-500" : ""}`}>
                          {item.currentQuantity} {item.currentQuantity < item.minQuantity && "⚠️"}
                        </div>
                        <div className="text-xs text-muted-foreground">Min: {item.minQuantity}</div>
                      </TableCell>
                      <TableCell>
                        <div>₹{item.lastPurchasePrice.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{item.lastVendor}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Barcode className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{item.barcode}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryItems;
