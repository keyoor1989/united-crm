
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CustomerInfoFormProps {
  customerEmail: string;
  customerPhone: string;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  customerEmail,
  customerPhone,
  onEmailChange,
  onPhoneChange,
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="customerEmail">Customer Email (Optional)</Label>
        <Input
          id="customerEmail"
          value={customerEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="Enter customer email"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="customerPhone">Customer Phone (Optional)</Label>
        <Input
          id="customerPhone"
          value={customerPhone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="Enter customer phone"
        />
      </div>
    </>
  );
};

export default CustomerInfoForm;
