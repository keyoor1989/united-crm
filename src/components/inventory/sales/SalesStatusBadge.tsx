
import React from "react";
import { Badge } from "@/components/ui/badge";

type SalesStatusProps = {
  status: string;
};

export const SalesStatusBadge: React.FC<SalesStatusProps> = ({ status }) => {
  switch (status.toLowerCase()) {
    case "completed":
      return <Badge variant="success">Completed</Badge>;
    case "pending":
      return <Badge variant="warning">Pending</Badge>;
    case "credit sale":
      return <Badge variant="secondary">Credit Sale</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};
