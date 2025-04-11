
import React from "react";
import { Badge } from "@/components/ui/badge";

interface FollowUpTypeBadgeProps {
  type: string;
}

const FollowUpTypeBadge: React.FC<FollowUpTypeBadgeProps> = ({ type }) => {
  switch (type) {
    case "quotation":
      return <Badge className="bg-blue-500">Quotation</Badge>;
    case "demo":
      return <Badge className="bg-purple-500">Demo</Badge>;
    case "negotiation":
      return <Badge className="bg-amber-500">Negotiation</Badge>;
    case "closure":
      return <Badge className="bg-green-500">Closure</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
};

export default FollowUpTypeBadge;
