
import React, { useState } from "react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SalesItem } from "./SalesTable";

interface RecordPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  sale: SalesItem | null;
  paymentMethods: { value: string; label: string; icon: any }[];
  onSavePayment: (saleId: string, paymentData: any) => void;
}

export const RecordPaymentDialog: React.FC<RecordPaymentDialogProps> = ({
  open,
  onClose,
  sale,
  paymentMethods,
  onSavePayment,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  // Reset form when the dialog opens with a new sale
  React.useEffect(() => {
    if (sale) {
      setAmount(sale.total.toString());
      setInvoiceNumber(sale.invoiceNumber || `INV-${format(new Date(), "yyyyMMdd")}-${Math.floor(Math.random() * 100)}`);
    }
  }, [sale]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sale) return;
    
    const paymentData = {
      saleId: sale.id,
      paymentMethod,
      amount: parseFloat(amount),
      notes,
      paymentDate: new Date().toISOString(),
      invoiceNumber,
    };
    
    onSavePayment(sale.id, paymentData);
    onClose();
    
    // Reset form
    setPaymentMethod("cash");
    setAmount("");
    setNotes("");
    setInvoiceNumber("");
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payment for Sale #{sale.id}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sale-details">Sale Details</Label>
            <div className="rounded-md border p-3 text-sm">
              <p><span className="font-medium">Customer:</span> {sale.customer}</p>
              <p><span className="font-medium">Item:</span> {sale.itemName}</p>
              <p><span className="font-medium">Total Amount:</span> ₹{sale.total}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="invoice-number">Invoice Number</Label>
            <Input
              id="invoice-number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any payment notes here..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Record Payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
