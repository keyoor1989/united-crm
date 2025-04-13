
import React from "react";
import { Badge } from "@/components/ui/badge";
import { QuotationStatus } from "@/types/sales";

interface QuotationStatusBadgeProps {
  status: QuotationStatus;
}

const QuotationStatusBadge: React.FC<QuotationStatusBadgeProps> = ({ status }) => {
  let variant: "default" | "outline" | "secondary" | "destructive" = "default";
  
  switch (status) {
    case "Draft":
      variant = "outline";
      break;
    case "Sent":
      variant = "secondary";
      break;
    case "Accepted":
      variant = "default";
      break;
    case "Rejected":
    case "Expired":
      variant = "destructive";
      break;
  }
  
  return <Badge variant={variant}>{status}</Badge>;
};

export default QuotationStatusBadge;
