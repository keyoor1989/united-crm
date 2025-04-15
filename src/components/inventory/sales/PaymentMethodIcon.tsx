
import React from "react";
import { 
  CreditCard, 
  Calendar, 
  IndianRupee, 
  Wallet, 
  Building2 
} from "lucide-react";

type PaymentMethodIconProps = {
  method: string;
  size?: number;
};

export const PaymentMethodIcon: React.FC<PaymentMethodIconProps> = ({ 
  method, 
  size = 16 
}) => {
  switch (method.toLowerCase()) {
    case "credit card":
      return <CreditCard size={size} className="text-blue-500" />;
    case "bank transfer":
      return <Building2 size={size} className="text-green-600" />;
    case "upi":
      return <IndianRupee size={size} className="text-purple-500" />;
    case "credit":
      return <Calendar size={size} className="text-amber-500" />;
    case "cash":
    default:
      return <Wallet size={size} className="text-gray-700" />;
  }
};
