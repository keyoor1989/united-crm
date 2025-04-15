
import React, { useState } from "react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
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
import { toast } from "sonner";

interface NewSaleDialogProps {
  open: boolean;
  onClose: () => void;
  productCategories: string[];
  customerTypes: { value: string; label: string; }[];
  paymentMethods: { value: string; label: string; icon: React.ElementType; }[];
  onSaveSale: (sale: any) => void;
}

export const NewSaleDialog: React.FC<NewSaleDialogProps> = ({
  open,
  onClose,
  productCategories,
  customerTypes,
  paymentMethods,
  onSaveSale,
}) => {
  const [saleData, setSaleData] = useState({
    customerName: "",
    customerType: "customer",
    itemName: "",
    category: productCategories[0] || "Toner",
    quantity: 1,
    unitPrice: 0,
    paymentMethod: "cash",
    paymentStatus: "paid",
    status: "Completed",
  });

  const handleChange = (field: string, value: string | number) => {
    setSaleData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    return saleData.quantity * saleData.unitPrice;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!saleData.customerName) {
      toast.error("Customer name is required");
      return;
    }
    
    if (!saleData.itemName) {
      toast.error("Item name is required");
      return;
    }
    
    if (saleData.quantity <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }
    
    if (saleData.unitPrice <= 0) {
      toast.error("Unit price must be greater than zero");
      return;
    }
    
    // Set payment status based on method
    const paymentStatus = saleData.paymentMethod === "credit" ? "Due" : "Paid";
    const saleStatus = saleData.paymentMethod === "credit" ? "Credit Sale" : "Completed";
    
    // Create new sale object
    const newSale = {
      id: `S${Math.floor(Math.random() * 1000)}`,
      date: format(new Date(), "yyyy-MM-dd"),
      customer: saleData.customerName,
      customerType: saleData.customerType === "customer" 
        ? "Customer" 
        : saleData.customerType === "dealer" 
          ? "Dealer" 
          : "Government",
      itemName: saleData.itemName,
      category: saleData.category,
      quantity: saleData.quantity,
      unitPrice: saleData.unitPrice,
      total: calculateTotal(),
      status: saleStatus,
      paymentMethod: 
        saleData.paymentMethod === "cash" 
          ? "Cash" 
          : saleData.paymentMethod === "credit_card" 
            ? "Credit Card" 
            : saleData.paymentMethod === "bank_transfer" 
              ? "Bank Transfer" 
              : saleData.paymentMethod === "upi" 
                ? "UPI" 
                : "Credit",
      paymentStatus: paymentStatus,
      billGenerated: saleData.paymentMethod !== "credit",
      invoiceNumber: saleData.paymentMethod !== "credit" 
        ? `INV-${format(new Date(), "yyyyMMdd")}-${Math.floor(Math.random() * 100)}` 
        : null,
      dueDate: saleData.paymentMethod === "credit" 
        ? format(new Date(new Date().setDate(new Date().getDate() + 30)), "yyyy-MM-dd") 
        : undefined,
    };
    
    // Call the parent component's save handler
    onSaveSale(newSale);
    
    // Reset form and close dialog
    setSaleData({
      customerName: "",
      customerType: "customer",
      itemName: "",
      category: productCategories[0] || "Toner",
      quantity: 1,
      unitPrice: 0,
      paymentMethod: "cash",
      paymentStatus: "paid",
      status: "Completed",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record New Sale</DialogTitle>
            <DialogDescription>
              Enter the details of the sale below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={saleData.customerName}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  placeholder="Enter customer name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerType">Customer Type</Label>
                <Select
                  value={saleData.customerType}
                  onValueChange={(value) => handleChange("customerType", value)}
                >
                  <SelectTrigger id="customerType">
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
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Product Category</Label>
                <Select
                  value={saleData.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  value={saleData.itemName}
                  onChange={(e) => handleChange("itemName", e.target.value)}
                  placeholder="Enter item name"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={saleData.quantity}
                  onChange={(e) => handleChange("quantity", parseInt(e.target.value))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price (₹)</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={saleData.unitPrice}
                  onChange={(e) => handleChange("unitPrice", parseFloat(e.target.value))}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={saleData.paymentMethod}
                  onValueChange={(value) => handleChange("paymentMethod", value)}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center gap-2">
                          {React.createElement(method.icon, { size: 16 })}
                          <span>{method.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end space-y-2">
                <div className="rounded-md border p-3 text-right w-full">
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                  <div className="text-2xl font-bold">₹{calculateTotal()}</div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Record Sale</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
