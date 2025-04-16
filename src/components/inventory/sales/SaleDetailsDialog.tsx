
import React from "react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Receipt, CreditCard } from "lucide-react";
import { SalesItem } from "./SalesTable";
import { SalesStatusBadge } from "./SalesStatusBadge";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { PaymentMethodIcon } from "./PaymentMethodIcon";

interface SaleDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  sale: SalesItem | null;
  onGenerateBill: (sale: SalesItem) => void;
  onPrintInvoice: (sale: SalesItem) => void;
  onRecordPayment: (sale: SalesItem) => void;
}

export const SaleDetailsDialog: React.FC<SaleDetailsDialogProps> = ({
  open,
  onClose,
  sale,
  onGenerateBill,
  onPrintInvoice,
  onRecordPayment,
}) => {
  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Sale Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Sale #{sale.id}</h3>
            <div className="flex items-center gap-2">
              <SalesStatusBadge status={sale.status} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {format(new Date(sale.date), "dd MMM yyyy")}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Invoice</p>
              <p className="font-medium">
                {sale.invoiceNumber || "Not Generated"}
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Customer</p>
            <p className="font-medium">{sale.customer}</p>
            <p className="text-sm text-muted-foreground">{sale.customerType}</p>
          </div>
          
          <div className="rounded-md border p-4">
            <div className="mb-4">
              <h4 className="font-medium">Item Details</h4>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm text-muted-foreground">Item</p>
                <p className="text-sm font-medium">{sale.itemName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="text-sm font-medium">{sale.quantity}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm text-muted-foreground">Unit Price</p>
                <p className="text-sm font-medium">₹{sale.unitPrice}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 border-t pt-2">
                <p className="text-sm font-medium">Total</p>
                <p className="text-sm font-bold">₹{sale.total}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-md border p-4">
            <div className="mb-4">
              <h4 className="font-medium">Payment Information</h4>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <div className="flex items-center gap-2">
                  <PaymentMethodIcon method={sale.paymentMethod} />
                  <p className="text-sm font-medium">{sale.paymentMethod}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <div>
                  <PaymentStatusBadge status={sale.paymentStatus} />
                </div>
              </div>
              
              {sale.paymentStatus === "Due" && sale.dueDate && (
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="text-sm font-medium">
                    {format(new Date(sale.dueDate), "dd MMM yyyy")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-end">
          {!sale.billGenerated && (
            <Button
              onClick={() => {
                onGenerateBill(sale);
                onClose();
              }}
              className="gap-2"
            >
              <Receipt size={16} />
              Generate Bill
            </Button>
          )}
          
          {sale.billGenerated && (
            <Button
              onClick={() => {
                onPrintInvoice(sale);
                onClose();
              }}
              className="gap-2"
            >
              <Printer size={16} />
              Print Invoice
            </Button>
          )}
          
          {sale.paymentStatus === "Due" && (
            <Button
              onClick={() => {
                onRecordPayment(sale);
                onClose();
              }}
              className="gap-2"
            >
              <CreditCard size={16} />
              Record Payment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
