
import React, { useState, useRef, useEffect } from "react";
import { useSalesInventoryItems, SalesInventoryItem } from "@/hooks/inventory/useSalesInventoryItems";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Barcode, 
  Trash2, 
  Plus, 
  Save, 
  Search, 
  CreditCard, 
  Receipt
} from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { SalesItem } from "./SalesTable";
import { formatCurrency } from "@/utils/finance/financeUtils";
import CustomerSearch from "@/components/chat/quotation/CustomerSearch";
import { CustomerType } from "@/types/customer";

interface SaleItemData {
  id: string;
  itemName: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface UnifiedSalesFormProps {
  open: boolean;
  onClose: () => void;
  productCategories: string[];
  customerTypes: { value: string; label: string }[];
  paymentMethods: { value: string; label: string; icon: any }[];
  onSaveSale: (sale: SalesItem) => void;
}

export const UnifiedSalesForm: React.FC<UnifiedSalesFormProps> = ({
  open,
  onClose,
  productCategories,
  customerTypes,
  paymentMethods,
  onSaveSale,
}) => {
  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerType, setCustomerType] = useState("Customer");
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);
  
  // Payment information
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isCredit, setIsCredit] = useState(false);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  
  // Cart items
  const [items, setItems] = useState<SaleItemData[]>([]);
  
  // Current item being added
  const [currentItem, setCurrentItem] = useState({
    itemName: "",
    category: productCategories[0] || "",
    quantity: 1,
    unitPrice: 0,
    barcode: ""
  });
  
  // For barcode scanner
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // Fetch inventory items
  const { data: inventoryItems = [], isLoading: isLoadingItems } = useSalesInventoryItems();
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const gstRate = 18; // Default GST rate (can be made configurable)
  const gstAmount = (subtotal * gstRate) / 100;
  const grandTotal = subtotal + gstAmount;
  
  // Focus barcode input when scanning mode is activated
  useEffect(() => {
    if (isScanning && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [isScanning]);
  
  const resetForm = () => {
    setCustomerName("");
    setCustomerType("Customer");
    setPaymentMethod("Cash");
    setIsCredit(false);
    setItems([]);
    setCurrentItem({
      itemName: "",
      category: productCategories[0] || "",
      quantity: 1,
      unitPrice: 0,
      barcode: ""
    });
    setIsScanning(false);
    setSelectedCustomer(null);
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerLocation("");
    
    const date = new Date();
    date.setDate(date.getDate() + 30);
    setDueDate(date.toISOString().split('T')[0]);
  };
  
  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
    setIsCredit(value === "Credit");
  };
  
  const handleAddItem = () => {
    if (!currentItem.itemName) {
      toast.error("Please enter an item name");
      return;
    }
    
    if (currentItem.unitPrice <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    // Check if item exists and has enough stock
    const inventoryItem = inventoryItems.find(item => item.part_name === currentItem.itemName);
    
    if (!inventoryItem) {
      toast.error("Item not found in inventory");
      return;
    }

    if (currentItem.quantity > inventoryItem.quantity) {
      toast.error(`Only ${inventoryItem.quantity} units available in stock`);
      return;
    }

    const newItem = {
      id: inventoryItem.id,
      itemName: currentItem.itemName,
      category: currentItem.category,
      quantity: currentItem.quantity,
      unitPrice: currentItem.unitPrice,
      total: currentItem.quantity * currentItem.unitPrice
    };
    
    setItems([...items, newItem]);
    
    setCurrentItem({
      itemName: "",
      category: currentItem.category,
      quantity: 1,
      unitPrice: 0,
      barcode: ""
    });
    
    if (isScanning && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };
  
  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentItem.barcode) {
      toast.error("Please enter a barcode");
      return;
    }
    
    // Look up item by part number
    const foundItem = inventoryItems.find(item => item.part_number === currentItem.barcode);
    
    if (foundItem) {
      setCurrentItem({
        ...currentItem,
        itemName: foundItem.part_name,
        category: foundItem.category,
        unitPrice: foundItem.purchase_price * 1.3, // 30% markup by default
        barcode: ""
      });
      toast.success(`Found: ${foundItem.part_name}`);
    } else {
      toast.error("Product not found");
      setCurrentItem({
        ...currentItem,
        barcode: ""
      });
    }
    
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };
  
  const handleCustomerSelect = (customer: CustomerType) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setCustomerEmail(customer.email || "");
    setCustomerLocation(customer.location || "");
    
    // Set customer type based on customer information if available
    if (customer.name.toLowerCase().includes("govt") || 
        customer.name.toLowerCase().includes("government")) {
      setCustomerType("Government");
    } else if (customer.name.toLowerCase().includes("dealer")) {
      setCustomerType("Dealer");
    }
    
    setShowCustomerSearch(false);
    
    toast.success(`Customer "${customer.name}" selected`);
  };
  
  const handleSubmit = () => {
    if (!customerName) {
      toast.error("Please enter customer name");
      return;
    }
    
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }
    
    // Create a new sale from the first item (to maintain compatibility)
    // In a real implementation, you'd want to store all items in the database
    const firstItem = items[0];
    const status = isCredit ? "Credit Sale" : "Completed";
    const paymentStatus = isCredit ? "Due" : "Paid";
    
    const newSale: SalesItem = {
      id: uuidv4(),
      date: new Date().toISOString(),
      customer: customerName,
      customerType: customerTypes.find(type => type.value === customerType)?.label || customerType,
      itemName: firstItem.itemName,
      quantity: firstItem.quantity,
      unitPrice: firstItem.unitPrice,
      total: grandTotal, // Using the grand total for all items
      status,
      paymentMethod: paymentMethods.find(method => method.value === paymentMethod)?.label || paymentMethod,
      paymentStatus,
      billGenerated: !isCredit,
      invoiceNumber: isCredit ? null : `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 100)}`,
      dueDate: isCredit ? dueDate : undefined,
    };
    
    onSaveSale(newSale);
    toast.success(`Sale created with ${items.length} items`);
    onClose();
    resetForm();
  };
  
  const toggleScanner = () => {
    setIsScanning(!isScanning);
    // Focus on barcode input when enabled
    if (!isScanning && barcodeInputRef.current) {
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Sale</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer & Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CustomerSearch 
                onSelectCustomer={handleCustomerSelect}
                showSearch={showCustomerSearch}
                onToggleSearch={() => setShowCustomerSearch(!showCustomerSearch)}
                customerName={customerName}
              />
              
              {selectedCustomer && (
                <div className="text-sm space-y-1 border-l-2 border-primary/20 pl-2">
                  {customerPhone && <p className="text-muted-foreground">Phone: {customerPhone}</p>}
                  {customerEmail && <p className="text-muted-foreground">Email: {customerEmail}</p>}
                  {customerLocation && <p className="text-muted-foreground">Location: {customerLocation}</p>}
                </div>
              )}
              
              <div>
                <Label htmlFor="customer-type">Customer Type</Label>
                <Select value={customerType} onValueChange={setCustomerType}>
                  <SelectTrigger id="customer-type">
                    <SelectValue placeholder="Select customer type" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center">
                          {React.createElement(method.icon, { className: "mr-2 h-4 w-4" })}
                          {method.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {isCredit && (
                <div>
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Item Entry Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Item Details
                {isLoadingItems && " (Loading...)"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isScanning ? (
                <form onSubmit={handleBarcodeSubmit} className="space-y-4">
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Label htmlFor="barcode">Scan Barcode</Label>
                      <Input
                        id="barcode"
                        ref={barcodeInputRef}
                        value={currentItem.barcode}
                        onChange={(e) => setCurrentItem({...currentItem, barcode: e.target.value})}
                        placeholder="Scan barcode..."
                        autoComplete="off"
                      />
                    </div>
                    <Button type="submit" size="sm">Find</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="item-name">Item Name</Label>
                    <Select 
                      value={currentItem.itemName} 
                      onValueChange={(value) => {
                        const item = inventoryItems.find(i => i.part_name === value);
                        if (item) {
                          setCurrentItem({
                            ...currentItem,
                            itemName: item.part_name,
                            category: item.category,
                            unitPrice: item.purchase_price * 1.3 // 30% markup
                          });
                        }
                      }}
                    >
                      <SelectTrigger id="item-name">
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems.map((item) => (
                          <SelectItem key={item.id} value={item.part_name}>
                            {item.part_name} ({item.quantity} in stock)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={currentItem.category}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit-price">Unit Price (₹)</Label>
                  <Input
                    id="unit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentItem.unitPrice}
                    onChange={(e) => setCurrentItem({...currentItem, unitPrice: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleScanner}
                  className="flex items-center gap-1"
                >
                  <Barcode className="h-4 w-4 mr-1" />
                  {isScanning ? "Manual Entry" : "Scan Barcode"}
                </Button>
                
                <Button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!currentItem.itemName || currentItem.unitPrice <= 0}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
              </div>
              
              <div className="text-sm text-right">
                <p>Item Total: {formatCurrency(currentItem.quantity * currentItem.unitPrice)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Cart Section */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cart Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          No items added yet. Add items to the cart above.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.itemName}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-6 flex justify-end">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST ({gstRate}%):</span>
                    <span>{formatCurrency(gstAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={items.length === 0 || !customerName}
            className="gap-1"
          >
            {isCredit ? (
              <>
                <CreditCard className="h-4 w-4 mr-1" />
                Create Credit Sale
              </>
            ) : (
              <>
                <Receipt className="h-4 w-4 mr-1" />
                Complete Sale
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
