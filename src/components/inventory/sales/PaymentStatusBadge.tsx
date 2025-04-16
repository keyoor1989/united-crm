
import React from "react";
import { Badge } from "@/components/ui/badge";

export type PaymentStatus = 'Paid' | 'Pending' | 'Due' | 'Partial' | 'Cancelled';

interface PaymentStatusBadgeProps {
  status: string;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  const statusLower = status.toLowerCase();
  
  if (statusLower === "paid") {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Paid
      </Badge>
    );
  }
  
  if (statusLower === "pending") {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        Pending
      </Badge>
    );
  }
  
  if (statusLower === "due") {
    return (
      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
        Due
      </Badge>
    );
  }
  
  if (statusLower === "partial") {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        Partial
      </Badge>
    );
  }
  
  if (statusLower === "cancelled" || statusLower === "rejected") {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        {status}
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline">
      {status}
    </Badge>
  );
};
