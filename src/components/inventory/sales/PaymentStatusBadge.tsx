
import React from "react";
import { Badge } from "@/components/ui/badge";

type PaymentStatusProps = {
  status: string;
};

export const PaymentStatusBadge: React.FC<PaymentStatusProps> = ({ status }) => {
  switch (status.toLowerCase()) {
    case "paid":
      return <Badge variant="success">Paid</Badge>;
    case "pending":
      return <Badge variant="warning">Pending</Badge>;
    case "due":
      return <Badge variant="destructive">Due</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};
