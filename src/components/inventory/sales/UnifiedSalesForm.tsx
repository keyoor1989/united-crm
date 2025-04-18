import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Receipt } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { CustomerSection } from "./components/CustomerSection";
import { PaymentSection } from "./components/PaymentSection";
import { ItemEntrySection } from "./components/ItemEntrySection";
import { CartSection } from "./components/CartSection";
import { GstHandlingSection, GstMode } from "./components/GstHandlingSection";
import { CustomerType } from "@/types/customer";
import { SalesItem } from "./SalesTable";
import { useSalesInventoryItems } from "@/hooks/inventory/useSalesInventoryItems";

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
  const [customerName, setCustomerName] = useState("");
  const [customerType, setCustomerType] = useState("Customer");
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);
  
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isCredit, setIsCredit] = useState(false);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  
  const [items, setItems] = useState<any[]>([]);
  
  const [currentItem, setCurrentItem] = useState({
    itemName: "",
    category: productCategories[0] || "",
    quantity: 1,
    unitPrice: 0,
    barcode: ""
  });
  
  const [isScanning, setIsScanning] = useState(false);
  
  const { data: inventoryItems = [], isLoading: isLoadingItems } = useSalesInventoryItems();
  
  const [gstMode, setGstMode] = useState<GstMode>('exclusive');
  const [gstRate, setGstRate] = useState(18);
  
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const gstAmount = gstMode === 'no-gst' ? 0 : 
    gstMode === 'inclusive' ? 
      (subtotal * gstRate) / (100 + gstRate) : 
      (subtotal * gstRate) / 100;
      
  const grandTotal = gstMode === 'inclusive' ? 
    subtotal : // Price already includes GST
    subtotal + (gstMode === 'no-gst' ? 0 : gstAmount);

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

    const inventoryItem = inventoryItems.find(item => 
      item.display_name === currentItem.itemName || item.part_name === currentItem.itemName
    );
    
    if (!inventoryItem) {
      toast.error("Item not found in inventory");
      return;
    }

    if (currentItem.quantity > inventoryItem.quantity) {
      toast.error(`Only ${inventoryItem.quantity} units available in stock`);
      return;
    }

    let finalUnitPrice = currentItem.unitPrice;
    if (gstMode === 'inclusive') {
      finalUnitPrice = (currentItem.unitPrice * 100) / (100 + gstRate);
    }

    const newItem = {
      id: inventoryItem.id,
      itemName: currentItem.itemName,
      category: currentItem.category,
      quantity: currentItem.quantity,
      unitPrice: finalUnitPrice,
      total: finalUnitPrice * currentItem.quantity
    };
    
    setItems([...items, newItem]);
    setCurrentItem({
      itemName: "",
      category: currentItem.category,
      quantity: 1,
      unitPrice: 0,
      barcode: ""
    });
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
    
    const foundItem = inventoryItems.find(item => item.part_number === currentItem.barcode);
    
    if (foundItem) {
      setCurrentItem({
        ...currentItem,
        itemName: foundItem.display_name || foundItem.part_name,
        category: foundItem.category,
        unitPrice: foundItem.purchase_price * 1.3,
        barcode: ""
      });
      toast.success(`Found: ${foundItem.display_name || foundItem.part_name}`);
    } else {
      toast.error("Product not found");
      setCurrentItem({
        ...currentItem,
        barcode: ""
      });
    }
  };
  
  const handleCustomerSelect = (customer: CustomerType) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setCustomerEmail(customer.email || "");
    setCustomerLocation(customer.location || "");
    
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
      total: grandTotal,
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
          <CustomerSection 
            customerName={customerName}
            customerPhone={customerPhone}
            customerEmail={customerEmail}
            customerLocation={customerLocation}
            customerType={customerType}
            selectedCustomer={selectedCustomer}
            showCustomerSearch={showCustomerSearch}
            customerTypes={customerTypes}
            onCustomerSelect={handleCustomerSelect}
            onCustomerTypeChange={setCustomerType}
            onToggleSearch={() => setShowCustomerSearch(!showCustomerSearch)}
          />
          
          <ItemEntrySection 
            currentItem={currentItem}
            isScanning={isScanning}
            inventoryItems={inventoryItems}
            isLoadingItems={isLoadingItems}
            onItemChange={(changes) => setCurrentItem({ ...currentItem, ...changes })}
            onAddItem={handleAddItem}
            onToggleScanner={() => setIsScanning(!isScanning)}
            onBarcodeSubmit={handleBarcodeSubmit}
          />
        </div>
        
        <div className="mt-6">
          <GstHandlingSection
            gstMode={gstMode}
            gstRate={gstRate}
            onGstModeChange={setGstMode}
            onGstRateChange={setGstRate}
          />
        </div>
        
        <div className="mt-6">
          <CartSection 
            items={items}
            subtotal={subtotal}
            gstMode={gstMode}
            gstRate={gstRate}
            gstAmount={gstAmount}
            grandTotal={grandTotal}
            onRemoveItem={handleRemoveItem}
          />
        </div>
        
        <div className="mt-6">
          <PaymentSection 
            paymentMethod={paymentMethod}
            isCredit={isCredit}
            dueDate={dueDate}
            paymentMethods={paymentMethods}
            onPaymentMethodChange={handlePaymentMethodChange}
            onDueDateChange={setDueDate}
          />
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
