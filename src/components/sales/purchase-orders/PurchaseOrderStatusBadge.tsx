
import React from "react";
import { Badge } from "@/components/ui/badge";
import { PurchaseOrderStatus } from "@/types/sales";

interface PurchaseOrderStatusBadgeProps {
  status: PurchaseOrderStatus;
}

const PurchaseOrderStatusBadge: React.FC<PurchaseOrderStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case "Draft":
      return <Badge variant="outline">Draft</Badge>;
    case "Sent":
      return <Badge variant="secondary">Sent</Badge>;
    case "Confirmed":
      return <Badge variant="success" className="bg-green-500 hover:bg-green-600">Confirmed</Badge>;
    case "Received":
      return <Badge variant="default">Received</Badge>;
    case "Cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default PurchaseOrderStatusBadge;
