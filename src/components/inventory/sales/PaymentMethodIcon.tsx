
import React from "react";
import {
  CreditCard,
  Wallet,
  Building2,
  IndianRupee,
  Calendar,
  RefreshCcw,
  CircleDollarSign,
  BanknoteIcon
} from "lucide-react";

interface PaymentMethodIconProps {
  method: string;
  className?: string;
}

export const PaymentMethodIcon: React.FC<PaymentMethodIconProps> = ({
  method,
  className = "h-4 w-4"
}) => {
  const methodLower = method.toLowerCase();
  
  if (methodLower.includes("credit card")) return <CreditCard className={className} />;
  if (methodLower.includes("cash")) return <Wallet className={className} />;
  if (methodLower.includes("bank")) return <Building2 className={className} />;
  if (methodLower.includes("cb bank")) return <Building2 className={className} />;
  if (methodLower.includes("uc bank")) return <Building2 className={className} />;
  if (methodLower.includes("keyoor bank")) return <Building2 className={className} />;
  if (methodLower.includes("nitesh bank")) return <Building2 className={className} />;
  if (methodLower.includes("jyoti bank")) return <Building2 className={className} />;
  if (methodLower.includes("sy bank")) return <Building2 className={className} />;
  if (methodLower.includes("online")) return <CircleDollarSign className={className} />;
  if (methodLower.includes("upi")) return <IndianRupee className={className} />;
  if (methodLower.includes("due") || methodLower.includes("credit")) return <Calendar className={className} />;
  if (methodLower.includes("cheque")) return <BanknoteIcon className={className} />;
  
  // Default icon for other payment methods
  return <RefreshCcw className={className} />;
};
