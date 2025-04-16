
import React from "react";
import { Badge } from "@/components/ui/badge";

export type SaleStatus = 'Completed' | 'Pending' | 'Credit Sale' | 'Cancelled';

interface SalesStatusBadgeProps {
  status: string;
}

export const SalesStatusBadge: React.FC<SalesStatusBadgeProps> = ({ status }) => {
  const statusLower = status.toLowerCase();
  
  if (statusLower === "completed") {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        Completed
      </Badge>
    );
  }
  
  if (statusLower === "pending") {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
        Pending
      </Badge>
    );
  }
  
  if (statusLower.includes("credit")) {
    return (
      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
        Credit Sale
      </Badge>
    );
  }
  
  if (statusLower === "cancelled") {
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
        Cancelled
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline">
      {status}
    </Badge>
  );
};
