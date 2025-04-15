
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
import { SalesItem } from "./SalesTable";
import { PaymentMethodIcon } from "./PaymentMethodIcon";

interface RecordPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  sale: SalesItem | null;
  paymentMethods: { value: string; label: string; icon: React.ElementType; }[];
  onSavePayment: (saleId: string, paymentData: any) => void;
}

export const RecordPaymentDialog: React.FC<RecordPaymentDialogProps> = ({
  open,
  onClose,
  sale,
  paymentMethods,
  onSavePayment,
}) => {
  const [paymentData, setPaymentData] = useState({
    method: "cash",
    amount: 0,
    reference: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  // Set the default amount to the sale total when a sale is selected
  React.useEffect(() => {
    if (sale) {
      setPaymentData(prev => ({ ...prev, amount: sale.total }));
    }
  }, [sale]);

  const handleChange = (field: string, value: string | number) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sale) return;
    
    // Basic validation
    if (paymentData.amount <= 0) {
      toast.error("Payment amount must be greater than zero");
      return;
    }
    
    if (paymentData.amount > sale.total) {
      toast.error("Payment amount cannot exceed the total due");
      return;
    }
    
    // Create payment record
    const payment = {
      ...paymentData,
      saleId: sale.id,
      customerName: sale.customer,
      paymentDate: paymentData.date,
      invoiceNumber: `INV-${format(new Date(), "yyyyMMdd")}-${Math.floor(Math.random() * 100)}`,
    };
    
    // Call the parent component's save handler
    onSavePayment(sale.id, payment);
    
    // Reset form and close dialog
    setPaymentData({
      method: "cash",
      amount: 0,
      reference: "",
      date: format(new Date(), "yyyy-MM-dd"),
    });
    onClose();
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Enter payment details for Invoice #{sale.id} - {sale.customer}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="rounded-md border p-3">
              <div className="text-sm text-muted-foreground">Total Due</div>
              <div className="text-2xl font-bold">₹{sale.total}</div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                max={sale.total}
                step="0.01"
                value={paymentData.amount}
                onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={paymentData.method}
                onValueChange={(value) => handleChange("method", value)}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods
                    .filter(method => method.value !== "credit") // Exclude credit option
                    .map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center gap-2">
                          <PaymentMethodIcon method={method.label} />
                          <span>{method.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reference">
                {paymentData.method === "cash" 
                  ? "Receipt Number" 
                  : paymentData.method === "bank_transfer" 
                    ? "Transaction ID" 
                    : "Reference"}
              </Label>
              <Input
                id="reference"
                value={paymentData.reference}
                onChange={(e) => handleChange("reference", e.target.value)}
                placeholder={
                  paymentData.method === "cash" 
                    ? "Enter receipt number" 
                    : paymentData.method === "bank_transfer" 
                      ? "Enter transaction ID" 
                      : "Enter reference"
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Payment Date</Label>
              <Input
                id="date"
                type="date"
                value={paymentData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                max={format(new Date(), "yyyy-MM-dd")}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
