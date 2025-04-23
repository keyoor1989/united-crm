
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import EntryFormDialog from "./EntryFormDialog";
import { paymentMethods } from "@/data/finance";
import { Payment } from "@/types/finance";

interface PaymentFormProps {
  currentEntry: Partial<Payment>;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onInputChange: (field: string, value: string | number | string[]) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  currentEntry,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
  onInputChange,
}) => {
  return (
    <EntryFormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add Payment Entry"
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input 
            id="date" 
            type="date" 
            value={currentEntry.date} 
            onChange={(e) => onInputChange("date", e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="entityType">Payment Type *</Label>
          <Select 
            value={currentEntry.entityType} 
            onValueChange={(value) => onInputChange("entityType", value)}
          >
            <SelectTrigger id="entityType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Customer">Customer Payment</SelectItem>
              <SelectItem value="Dealer">Dealer Payment</SelectItem>
              <SelectItem value="Rental">Rental Payment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="entityName">
            {currentEntry.entityType === "Customer" ? "Customer Name *" : 
             currentEntry.entityType === "Dealer" ? "Dealer Name *" : 
             "Client Name *"}
          </Label>
          <Input 
            id="entityName" 
            placeholder={`Enter ${currentEntry.entityType?.toLowerCase() || "entity"} name`} 
            value={currentEntry.entityName || ""} 
            onChange={(e) => onInputChange("entityName", e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹) *</Label>
          <Input 
            id="amount" 
            type="number" 
            placeholder="Enter amount" 
            value={currentEntry.amount || ""} 
            onChange={(e) => onInputChange("amount", e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Payment Method *</Label>
          <Select 
            value={currentEntry.paymentMethod} 
            onValueChange={(value) => onInputChange("paymentMethod", value)}
          >
            <SelectTrigger id="paymentMethod">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem key={method} value={method}>{method}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reference">Reference Number *</Label>
          <Input 
            id="reference" 
            placeholder="Cheque/Transaction reference" 
            value={currentEntry.reference || ""} 
            onChange={(e) => onInputChange("reference", e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoiceNumbers">Invoice/Contract Numbers</Label>
          <Input 
            id="invoiceNumbers" 
            placeholder="e.g. INV-001, RNT-002" 
            value={currentEntry.invoiceNumbers?.join(", ") || ""} 
            onChange={(e) => {
              const invoiceArray = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
              onInputChange("invoiceNumbers", invoiceArray);
            }} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="receivedBy">Received By</Label>
          <Input 
            id="receivedBy" 
            placeholder="Who received the payment" 
            value={currentEntry.receivedBy || ""} 
            onChange={(e) => onInputChange("receivedBy", e.target.value)} 
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea 
            id="description" 
            placeholder="Enter description" 
            value={currentEntry.description || ""} 
            onChange={(e) => onInputChange("description", e.target.value)} 
            rows={3}
          />
        </div>
      </div>
    </EntryFormDialog>
  );
};

export default PaymentForm;
