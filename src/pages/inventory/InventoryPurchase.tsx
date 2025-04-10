
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Barcode, 
  Calendar as CalendarIcon, 
  Search, 
  ShoppingCart,
  Plus,
  Printer,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { 
  Brand, 
  Model, 
  InventoryItem, 
  PurchaseEntry, 
  Vendor 
} from "@/types/inventory";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// Mock data
const mockBrands: Brand[] = [
  { id: "1", name: "Kyocera", createdAt: "2025-03-01" },
  { id: "2", name: "Ricoh", createdAt: "2025-03-02" },
];

const mockModels: Model[] = [
  { id: "1", brandId: "1", name: "2554ci", type: "Machine", createdAt: "2025-03-01" },
  { id: "2", brandId: "2", name: "MP2014", type: "Machine", createdAt: "2025-03-03" },
];

const mockItems: InventoryItem[] = [
  { 
    id: "1", 
    modelId: "1", 
    brandId: "1", 
    name: "Black Toner", 
    type: "Toner", 
    minQuantity: 5, 
    currentQuantity: 12, 
    lastPurchasePrice: 5200, 
    lastVendor: "Copier Zone", 
    barcode: "KYO2554-BT001", 
    createdAt: "2025-03-10" 
  },
  { 
    id: "2", 
    modelId: "1", 
    brandId: "1", 
    name: "Drum Unit", 
    type: "Drum", 
    minQuantity: 2, 
    currentQuantity: 3, 
    lastPurchasePrice: 8700, 
    lastVendor: "Toner World", 
    barcode: "KYO2554-DR002", 
    createdAt: "2025-03-11" 
  },
];

const mockVendors: Vendor[] = [
  {
    id: "1",
    name: "Ajanta Traders",
    gstNo: "23AABCT1234Q1Z5",
    phone: "9876543210",
    email: "info@ajantatraders.com",
    address: "123 Market Road, Indore, MP",
    createdAt: "2025-01-15"
  },
  {
    id: "2",
    name: "Ravi Distributors",
    gstNo: "23AADCR5678Q1Z6",
    phone: "9876543211",
    email: "contact@ravidistributors.com",
    address: "456 Commercial Street, Bhopal, MP",
    createdAt: "2025-02-10"
  },
  {
    id: "3",
    name: "Precision Equipments",
    gstNo: "23AABCP9012Q1Z7",
    phone: "9876543212",
    email: "service@precisionequipments.com",
    address: "789 Industrial Area, Jabalpur, MP",
    createdAt: "2025-03-05"
  }
];

const mockPurchases: PurchaseEntry[] = [
  {
    id: "1",
    itemId: "1",
    quantity: 5,
    purchaseRate: 5200,
    vendorId: "1",
    vendorName: "Ajanta Traders",
    purchaseDate: "2025-04-05",
    invoiceNo: "INV-1234",
    barcode: "PUR-BT001-001",
    printBarcode: true,
    createdAt: "2025-04-05"
  },
  {
    id: "2",
    itemId: "2",
    quantity: 2,
    purchaseRate: 8500,
    vendorId: "2",
    vendorName: "Ravi Distributors",
    purchaseDate: "2025-04-02",
    invoiceNo: "INV-5678",
    barcode: "PUR-DR002-001",
    printBarcode: false,
    createdAt: "2025-04-02"
  },
];

type VendorFormData = {
  name: string;
  gstNo: string;
  phone: string;
  email: string;
  address: string;
};

const InventoryPurchase = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [brands] = useState<Brand[]>(mockBrands);
  const [models] = useState<Model[]>(mockModels);
  const [items] = useState<InventoryItem[]>(mockItems);
  const [purchases] = useState<PurchaseEntry[]>(mockPurchases);
  const [vendors] = useState<Vendor[]>(mockVendors);
  const [addVendorDialog, setAddVendorDialog] = useState(false);
  
  const [purchaseForm, setPurchaseForm] = useState({
    brandId: "",
    modelId: "",
    itemId: "",
    quantity: 1,
    purchaseRate: 0,
    vendorId: "",
    vendorName: "",
    invoiceNo: "",
    printBarcode: true,
  });

  const [vendorForm, setVendorForm] = useState<VendorFormData>({
    name: "",
    gstNo: "",
    phone: "",
    email: "",
    address: ""
  });

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save to the database
    console.log("Adding purchase:", purchaseForm, "Date:", date);
    
    toast.success("Purchase entry added successfully!");
    
    // Reset form
    setPurchaseForm({
      brandId: "",
      modelId: "",
      itemId: "",
      quantity: 1,
      purchaseRate: 0,
      vendorId: "",
      vendorName: "",
      invoiceNo: "",
      printBarcode: true,
    });
  };

  const handleVendorFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would save to the database
    console.log("Adding vendor:", vendorForm);
    
    toast.success("New vendor added successfully!");
    
    // Update the purchase form with the new vendor
    setPurchaseForm({
      ...purchaseForm,
      vendorId: "new", // In a real app, this would be the new vendor's ID
      vendorName: vendorForm.name
    });
    
    // Reset form and close dialog
    setVendorForm({
      name: "",
      gstNo: "",
      phone: "",
      email: "",
      address: ""
    });
    setAddVendorDialog(false);
  };

  const handleVendorFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVendorForm(prev => ({ ...prev, [name]: value }));
  };

  const modelsForSelectedBrand = models.filter(
    model => model.brandId === purchaseForm.brandId
  );

  const itemsForSelectedModel = items.filter(
    item => item.modelId === purchaseForm.modelId
  );

  const selectedItem = items.find(item => item.id === purchaseForm.itemId);

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Purchase Entry</h1>
          <p className="text-muted-foreground">Add new stock to your inventory</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Add New Purchase</CardTitle>
            <CardDescription>Enter details to add stock</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePurchaseSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purchase-date">Purchase Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purchase-brand">Brand</Label>
                <Select 
                  value={purchaseForm.brandId} 
                  onValueChange={(value) => setPurchaseForm({ ...purchaseForm, brandId: value, modelId: "", itemId: "" })}
                >
                  <SelectTrigger id="purchase-brand">
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
                <Label htmlFor="purchase-model">Model</Label>
                <Select 
                  value={purchaseForm.modelId} 
                  onValueChange={(value) => setPurchaseForm({ ...purchaseForm, modelId: value, itemId: "" })}
                  disabled={!purchaseForm.brandId}
                >
                  <SelectTrigger id="purchase-model">
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
                <Label htmlFor="purchase-item">Item</Label>
                <Select 
                  value={purchaseForm.itemId} 
                  onValueChange={(value) => {
                    const item = items.find(i => i.id === value);
                    setPurchaseForm({ 
                      ...purchaseForm, 
                      itemId: value,
                      purchaseRate: item ? item.lastPurchasePrice : 0,
                      vendorName: item ? item.lastVendor : "",
                    });
                  }}
                  disabled={!purchaseForm.modelId}
                >
                  <SelectTrigger id="purchase-item">
                    <SelectValue placeholder="Select Item" />
                  </SelectTrigger>
                  <SelectContent>
                    {itemsForSelectedModel.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purchase-quantity">Quantity</Label>
                <Input
                  id="purchase-quantity"
                  type="number"
                  min="1"
                  value={purchaseForm.quantity}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: parseInt(e.target.value) })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purchase-rate">Purchase Rate (₹)</Label>
                <Input
                  id="purchase-rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={purchaseForm.purchaseRate}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, purchaseRate: parseFloat(e.target.value) })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="purchase-vendor">Vendor</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setAddVendorDialog(true)}
                    className="h-6 px-2 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" /> New
                  </Button>
                </div>
                <Select 
                  value={purchaseForm.vendorId} 
                  onValueChange={(value) => {
                    const vendor = vendors.find(v => v.id === value);
                    setPurchaseForm({
                      ...purchaseForm,
                      vendorId: value,
                      vendorName: vendor ? vendor.name : ""
                    });
                  }}
                >
                  <SelectTrigger id="purchase-vendor">
                    <SelectValue placeholder="Select Vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="invoice-no">Invoice Number</Label>
                <Input
                  id="invoice-no"
                  value={purchaseForm.invoiceNo}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, invoiceNo: e.target.value })}
                  placeholder="Enter invoice number"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2 py-2">
                <Checkbox 
                  id="print-barcode" 
                  checked={purchaseForm.printBarcode}
                  onCheckedChange={(checked) => 
                    setPurchaseForm({ 
                      ...purchaseForm, 
                      printBarcode: checked as boolean 
                    })
                  }
                />
                <Label 
                  htmlFor="print-barcode" 
                  className="text-sm font-normal flex items-center"
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Print barcode label after saving
                </Label>
              </div>

              {selectedItem && (
                <div className="pt-2">
                  <div className="text-sm flex justify-between">
                    <span className="text-muted-foreground">Current Stock:</span>
                    <span className="font-medium">{selectedItem.currentQuantity}</span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span className="text-muted-foreground">After Purchase:</span>
                    <span className="font-medium">{selectedItem.currentQuantity + purchaseForm.quantity}</span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-medium">₹{(purchaseForm.purchaseRate * purchaseForm.quantity).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <Separator />
              
              <div className="pt-2">
                <Button type="submit" className="w-full">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add Purchase
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
                <Barcode className="h-4 w-4" />
                <span>Barcode will be auto-generated</span>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
            <CardDescription>Last 30 days purchase history</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => {
                  const item = items.find(i => i.id === purchase.itemId);
                  const model = item ? models.find(m => m.id === item.modelId) : null;
                  const brand = model ? brands.find(b => b.id === model.brandId) : null;
                  
                  return (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        {new Date(purchase.purchaseDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item?.name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">
                          {brand?.name} {model?.name}
                        </div>
                      </TableCell>
                      <TableCell>{purchase.quantity}</TableCell>
                      <TableCell>₹{purchase.purchaseRate.toLocaleString()}</TableCell>
                      <TableCell>{purchase.vendorName}</TableCell>
                      <TableCell>{purchase.invoiceNo}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {/* Add New Vendor Dialog */}
      <Dialog open={addVendorDialog} onOpenChange={setAddVendorDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
            <DialogDescription>
              Fill in the vendor details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleVendorFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vendor-name">Vendor Name *</Label>
              <Input
                id="vendor-name"
                name="name"
                value={vendorForm.name}
                onChange={handleVendorFormChange}
                placeholder="Enter vendor name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vendor-gstNo">GST Number</Label>
              <Input
                id="vendor-gstNo"
                name="gstNo"
                value={vendorForm.gstNo}
                onChange={handleVendorFormChange}
                placeholder="Enter GST number (optional)"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor-phone">Phone Number *</Label>
                <Input
                  id="vendor-phone"
                  name="phone"
                  value={vendorForm.phone}
                  onChange={handleVendorFormChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vendor-email">Email</Label>
                <Input
                  id="vendor-email"
                  type="email"
                  name="email"
                  value={vendorForm.email}
                  onChange={handleVendorFormChange}
                  placeholder="Enter email address"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vendor-address">Address *</Label>
              <Input
                id="vendor-address"
                name="address"
                value={vendorForm.address}
                onChange={handleVendorFormChange}
                placeholder="Enter complete address"
                required
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddVendorDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Check className="mr-2 h-4 w-4" />
                Add Vendor
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPurchase;
