
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentMethodOption {
  value: string;
  label: string;
  icon: React.ElementType;
}

interface PaymentSectionProps {
  paymentMethod: string;
  isCredit: boolean;
  dueDate: string;
  paymentMethods: PaymentMethodOption[];
  onPaymentMethodChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  paymentMethod,
  isCredit,
  dueDate,
  paymentMethods,
  onPaymentMethodChange,
  onDueDateChange
}) => {
  return (
    <div>
      <Label htmlFor="payment-method">Payment Method</Label>
      <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
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
      
      {isCredit && (
        <div className="mt-4">
          <Label htmlFor="due-date">Due Date</Label>
          <Input
            id="due-date"
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};
