import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, Search, PackagePlus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { PurchaseItem, GstMode } from "@/pages/inventory/UnifiedPurchase";
import { InventoryItem, Vendor } from "@/types/inventory";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { GstHandlingSection } from "@/components/inventory/sales/components/GstHandlingSection";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { usePurchaseForm } from "./usePurchaseForm";

interface UnifiedPurchaseFormProps {
  vendors: Vendor[];
  inventoryItems: InventoryItem[];
  categories: string[];
  purchaseType: 'cash' | 'credit';
  gstMode: GstMode;
  gstRate: number;
  onGstModeChange: (mode: GstMode) => void;
  onGstRateChange: (rate: number) => void;
  purchaseDate: string;
}

export default function UnifiedPurchaseForm({
  vendors,
  inventoryItems,
  categories,
  purchaseType,
  gstMode,
  gstRate,
  onGstModeChange,
  onGstRateChange,
  purchaseDate
}: UnifiedPurchaseFormProps) {
  const { isLoading, handleSavePurchase } = usePurchaseForm();

  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [vendorName, setVendorName] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    partName: "",
    partNumber: "",
    brand: "",
    model: "",
    category: categories[0] || "Other",
    quantity: 1,
    purchasePrice: 0,
    minStock: 5
  });

  const filteredItems = inventoryItems?.filter((item) =>
    (item.name || item.part_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  useEffect(() => {
    recalculateItemsGst();
  }, [gstMode, gstRate]);

  useEffect(() => {
    if (selectedVendorId) {
      const selectedVendor = vendors.find(v => v.id === selectedVendorId);
      if (selectedVendor) {
        setVendorName(selectedVendor.name);
      }
    }
  }, [selectedVendorId, vendors]);

  const handleAddItem = (inventoryItem: InventoryItem) => {
    console.log("Adding inventory item:", inventoryItem);
    const basePrice = inventoryItem.purchase_price || inventoryItem.unitCost || 0;
    const quantity = 1;
    let unitPrice = basePrice;
    let gstAmount = 0;
    
    if (gstMode === 'inclusive') {
      const divisor = 1 + (gstRate / 100);
      const priceWithoutGst = basePrice / divisor;
      unitPrice = priceWithoutGst;
      gstAmount = basePrice - priceWithoutGst;
    } else if (gstMode === 'exclusive') {
      gstAmount = basePrice * (gstRate / 100);
    }

    const totalAmount = unitPrice * quantity;
    
    const newItem: PurchaseItem = {
      id: uuidv4(),
      itemId: inventoryItem.id,
      itemName: inventoryItem.name || inventoryItem.part_name || "",
      quantity: quantity,
      unitPrice: unitPrice,
      totalAmount: totalAmount,
      category: inventoryItem.category,
      isCustomItem: false,
      gstPercent: gstMode === 'no-gst' ? 0 : gstRate,
      gstAmount: gstAmount * quantity,
      brand: inventoryItem.brand || "",
      model: inventoryItem.model || "",
      specs: {
        brand: inventoryItem.brand || "",
        model: inventoryItem.model || "",
        partNumber: inventoryItem.part_number || "",
        minStock: inventoryItem.min_stock || 5
      }
    };

    console.log("New purchase item created:", newItem);
    setItems([...items, newItem]);
  };

  const handleOpenNewItemDialog = () => {
    setNewItem({
      partName: "",
      partNumber: "",
      brand: "",
      model: "",
      category: categories[0] || "Other",
      quantity: 1,
      purchasePrice: 0,
      minStock: 5
    });
    setShowNewItemDialog(true);
  };

  const handleAddNewItem = () => {
    if (!newItem.partName.trim()) {
      toast.error("Item name is required");
      return;
    }
    
    if (!newItem.brand.trim()) {
      toast.error("Brand is required");
      return;
    }
    
    if (newItem.purchasePrice <= 0) {
      toast.error("Price must be greater than zero");
      return;
    }

    if (newItem.quantity <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }

    let unitPrice = newItem.purchasePrice;
    let gstAmount = 0;
    
    if (gstMode === 'inclusive') {
      const divisor = 1 + (gstRate / 100);
      const priceWithoutGst = unitPrice / divisor;
      unitPrice = priceWithoutGst;
      gstAmount = newItem.purchasePrice - priceWithoutGst;
    } else if (gstMode === 'exclusive') {
      gstAmount = unitPrice * (gstRate / 100);
    }

    const totalAmount = unitPrice * newItem.quantity;

    const customItem: PurchaseItem = {
      id: uuidv4(),
      itemName: `${newItem.brand} ${newItem.partName}`,
      quantity: newItem.quantity,
      unitPrice: unitPrice,
      totalAmount: totalAmount,
      category: newItem.category,
      isCustomItem: true,
      gstPercent: gstMode === 'no-gst' ? 0 : gstRate,
      gstAmount: gstAmount * newItem.quantity,
      brand: newItem.brand,
      model: newItem.model,
      specs: {
        brand: newItem.brand,
        model: newItem.model,
        partNumber: newItem.partNumber,
        minStock: newItem.minStock
      }
    };

    console.log("Adding custom item:", customItem);
    setItems([...items, customItem]);
    setShowNewItemDialog(false);
  };

  const handleUpdateItem = (itemId: string, field: keyof PurchaseItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalAmount = updatedItem.unitPrice * updatedItem.quantity;
          
          if (gstMode === 'exclusive') {
            updatedItem.gstAmount = updatedItem.totalAmount * (updatedItem.gstPercent / 100);
          } else if (gstMode === 'inclusive') {
            const divisor = 1 + (updatedItem.gstPercent / 100);
            const amountWithoutGst = updatedItem.totalAmount / divisor;
            updatedItem.gstAmount = updatedItem.totalAmount - amountWithoutGst;
          } else {
            updatedItem.gstAmount = 0;
          }
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const recalculateItemsGst = () => {
    setItems(items.map(item => {
      let unitPrice = item.unitPrice;
      let totalAmount = unitPrice * item.quantity;
      let gstAmount = 0;
      
      if (gstMode === 'exclusive') {
        gstAmount = totalAmount * (gstRate / 100);
      } else if (gstMode === 'inclusive') {
        const divisor = 1 + (gstRate / 100);
        const amountWithoutGst = totalAmount / divisor;
        gstAmount = totalAmount - amountWithoutGst;
      }
      
      return {
        ...item,
        gstPercent: gstMode === 'no-gst' ? 0 : gstRate,
        gstAmount: gstAmount
      };
    }));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.totalAmount, 0);
  };

  const calculateTotalGst = () => {
    return items.reduce((sum, item) => sum + (item.gstAmount || 0), 0);
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const totalGst = calculateTotalGst();
    return subtotal + totalGst;
  };

  const handleSubmit = async () => {
    console.log("Submitting purchase validation:", {
      itemsCount: items.length,
      selectedVendorId,
      vendorName,
      purchaseType,
      dueDate,
      invoiceNumber
    });

    if (items.length === 0) {
      toast.error("Please add at least one item to the purchase");
      return;
    }

    if (purchaseType === 'credit' && !dueDate) {
      toast.error("Please select a due date for credit purchase");
      return;
    }

    if (!selectedVendorId && !vendorName) {
      toast.error("Please select a vendor or enter vendor name");
      return;
    }
    
    if (!invoiceNumber) {
      toast.error("Please enter an invoice number");
      return;
    }
    
    const result = await handleSavePurchase(
      items, 
      selectedVendorId, 
      vendorName, 
      notes, 
      purchaseType, 
      invoiceNumber,
      purchaseDate,
      dueDate || undefined
    );
    
    if (result) {
      setItems([]);
      setSelectedVendorId("");
      setVendorName("");
      setNotes("");
      setInvoiceNumber("");
      setDueDate("");
      setSearchTerm("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vendorId">Vendor</Label>
          <div className="flex gap-2">
            <Select value={selectedVendorId} onValueChange={(value) => {
              setSelectedVendorId(value);
              if (value) setVendorName(""); // Clear manual vendor name if vendor is selected
            }}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-full">
              <Input
                placeholder="Or enter vendor name"
                value={vendorName}
                onChange={(e) => {
                  setVendorName(e.target.value);
                  if (e.target.value) setSelectedVendorId(""); // Clear selected vendor if manual name is entered
                }}
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input
            id="invoiceNumber"
            placeholder="Enter invoice number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            required
          />
        </div>
      </div>

      {purchaseType === 'credit' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
        </div>
      )}

      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">GST Handling</h3>
        </div>
        <GstHandlingSection
          gstMode={gstMode}
          gstRate={gstRate}
          onGstModeChange={onGstModeChange}
          onGstRateChange={onGstRateChange}
        />
      </div>

      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Add Items</h3>
          <div className="flex gap-2">
            <Button 
              onClick={handleOpenNewItemDialog} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
            >
              <PackagePlus className="h-4 w-4" />
              Add New Item
            </Button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search inventory items..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
            {filteredItems.slice(0, 9).map((item) => (
              <div 
                key={item.id} 
                className="border rounded p-3 flex flex-col justify-between hover:border-primary cursor-pointer"
                onClick={() => handleAddItem(item)}
              >
                <div className="font-medium truncate">{item.name || item.part_name}</div>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-muted-foreground">{item.category}</span>
                  <span className="text-sm font-medium">₹{item.purchase_price || item.unitCost || 0}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No items found. Try a different search term or add a new item.
          </div>
        )}

        {items.length > 0 ? (
          <div className="mt-6">
            <h4 className="font-medium mb-2">Selected Items</h4>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium flex items-center gap-2">
                      {item.isCustomItem && (
                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded">New Item</span>
                      )}
                      {item.itemName}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Unit Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Total</Label>
                      <div className="flex items-center h-10 mt-1 px-3 border rounded-md bg-muted">
                        ₹{(item.totalAmount).toFixed(2)}
                        {item.gstAmount > 0 && gstMode !== 'no-gst' && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            {gstMode === 'exclusive' ? '+ ' : 'inc '}
                            ₹{item.gstAmount.toFixed(2)} GST
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Subtotal:</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              {gstMode !== 'no-gst' && (
                <div className="flex justify-between text-sm mb-1">
                  <span>GST ({gstRate}%):</span>
                  <span>₹{calculateTotalGst().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{calculateGrandTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No items added yet. Search and click on items above to add them to your purchase.
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Enter additional notes about this purchase"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1"></span>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Purchase
            </>
          )}
        </Button>
      </div>

      <Dialog open={showNewItemDialog} onOpenChange={setShowNewItemDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
            <DialogDescription>
              Add a new item to your inventory with brand and model details
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="partName">Item Name</Label>
                <Input
                  id="partName"
                  value={newItem.partName}
                  onChange={(e) => setNewItem({...newItem, partName: e.target.value})}
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={newItem.brand}
                  onChange={(e) => setNewItem({...newItem, brand: e.target.value})}
                  placeholder="Enter brand name"
                />
              </div>
              <div>
                <Label htmlFor="partNumber">Part Number</Label>
                <Input
                  id="partNumber"
                  value={newItem.partNumber}
                  onChange={(e) => setNewItem({...newItem, partNumber: e.target.value})}
                  placeholder="Enter part number (optional)"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={newItem.model}
                  onChange={(e) => setNewItem({...newItem, model: e.target.value})}
                  placeholder="Enter model (optional)"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newItem.category}
                  onValueChange={(value) => setNewItem({...newItem, category: value})}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.purchasePrice}
                  onChange={(e) => setNewItem({...newItem, purchasePrice: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              <div>
                <Label htmlFor="minStock">Minimum Stock</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={newItem.minStock}
                  onChange={(e) => setNewItem({...newItem, minStock: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewItem}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
