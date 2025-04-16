
import React, { useState } from "react";
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
import { v4 as uuidv4 } from 'uuid';
import { SalesItem } from "./SalesTable";

interface NewSaleDialogProps {
  open: boolean;
  onClose: () => void;
  productCategories: string[];
  customerTypes: { value: string; label: string }[];
  paymentMethods: { value: string; label: string; icon: any }[];
  onSaveSale: (sale: SalesItem) => void;
}

export const NewSaleDialog: React.FC<NewSaleDialogProps> = ({
  open,
  onClose,
  productCategories,
  customerTypes,
  paymentMethods,
  onSaveSale,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerType, setCustomerType] = useState("customer");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState(productCategories[0] || "");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isCredit, setIsCredit] = useState(false);
  
  const resetForm = () => {
    setCustomerName("");
    setCustomerType("customer");
    setItemName("");
    setCategory(productCategories[0] || "");
    setQuantity("1");
    setUnitPrice("");
    setPaymentMethod("cash");
    setIsCredit(false);
  };
  
  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
    setIsCredit(value === "credit");
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const total = Number(quantity) * Number(unitPrice);
    const status = isCredit ? "Credit Sale" : "Completed";
    const paymentStatus = isCredit ? "Due" : "Paid";
    
    const newSale: SalesItem = {
      id: uuidv4(),
      date: new Date().toISOString(),
      customer: customerName,
      customerType: customerTypes.find(type => type.value === customerType)?.label || customerType,
      itemName,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      total,
      status,
      paymentMethod: paymentMethods.find(method => method.value === paymentMethod)?.label || paymentMethod,
      paymentStatus,
      billGenerated: !isCredit,
      invoiceNumber: isCredit ? null : `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 100)}`,
      dueDate: isCredit ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    };
    
    onSaveSale(newSale);
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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>New Sale</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Customer Name</Label>
            <Input
              id="customer-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              required
            />
          </div>
          
          <div className="space-y-2">
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Enter item name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit-price">Unit Price (₹)</Label>
              <Input
                id="unit-price"
                type="number"
                min="0"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
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
          
          <div className="bg-muted/50 p-3 rounded-md">
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-bold">
                ₹{quantity && unitPrice ? (Number(quantity) * Number(unitPrice)).toFixed(2) : "0.00"}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Sale</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
