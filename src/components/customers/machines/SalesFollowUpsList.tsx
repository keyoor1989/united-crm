
import React from "react";
import { DollarSign, PhoneCall, CalendarClock, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SalesFollowUp } from "./types";
import { format } from "date-fns";

interface SalesFollowUpsListProps {
  salesFollowUps: SalesFollowUp[];
  onMarkComplete: (id: number) => void;
}

export const SalesFollowUpsList: React.FC<SalesFollowUpsListProps> = ({
  salesFollowUps,
  onMarkComplete,
}) => {
  const getSalesTypeBadge = (type: string) => {
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

  if (salesFollowUps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 border rounded-md border-dashed">
        <CalendarClock className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-sm">No sales follow-ups scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {salesFollowUps.map((followUp) => (
        <div key={followUp.id} className={`border rounded-md p-3 ${followUp.status === 'completed' ? 'bg-gray-50' : ''}`}>
          <div className="flex justify-between items-start">
            <div className="flex gap-2 items-center">
              <DollarSign className={`h-4 w-4 ${followUp.status === 'completed' ? 'text-green-500' : 'text-blue-500'}`} />
              <div>
                <h4 className="font-medium">{followUp.customerName}</h4>
                <p className="text-xs text-muted-foreground">
                  {format(followUp.date, "PPP")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getSalesTypeBadge(followUp.type)}
              <Badge variant={followUp.status === 'completed' ? 'outline' : 'secondary'}>
                {followUp.status === 'completed' ? 'Completed' : 'Pending'}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Edit Follow-up</DropdownMenuItem>
                  {followUp.status !== 'completed' && (
                    <DropdownMenuItem onClick={() => onMarkComplete(followUp.id)}>
                      Mark as Completed
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>Reschedule</DropdownMenuItem>
                  <DropdownMenuItem>Cancel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="mt-2 text-sm">
            <p>{followUp.notes}</p>
          </div>
          
          <div className="flex justify-end mt-3">
            <Button size="sm" variant="ghost" className="h-6 gap-1">
              <PhoneCall className="h-3 w-3" />
              <span className="text-xs">Call Now</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
