
import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhoneCall, MessageSquare, ClipboardCheck, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SalesFollowUp } from "../machines/types";
import FollowUpTypeBadge from "./FollowUpTypeBadge";
import { handleCall, handleWhatsApp } from "./followupUtils";

interface FollowUpItemProps {
  followUp: SalesFollowUp;
  onMarkComplete: (id: number) => void;
}

const FollowUpItem: React.FC<FollowUpItemProps> = ({ followUp, onMarkComplete }) => {
  const handleComplete = () => {
    console.log("Marking follow-up complete:", followUp.id);
    onMarkComplete(followUp.id);
  };

  return (
    <div key={followUp.id} className="border rounded-md p-3 bg-card">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{followUp.customerName}</h4>
            <FollowUpTypeBadge type={followUp.type} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {format(followUp.date, "PPP")} {followUp.location && `• ${followUp.location}`}
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleComplete}>
              Mark Complete
            </DropdownMenuItem>
            <DropdownMenuItem>
              Reschedule
            </DropdownMenuItem>
            <DropdownMenuItem>
              View Customer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {followUp.notes && (
        <p className="text-sm mt-2 line-clamp-2">{followUp.notes}</p>
      )}
      
      <div className="flex justify-end mt-3 gap-2">
        {followUp.contactPhone && (
          <>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 px-2 text-xs"
              onClick={() => handleCall(followUp.contactPhone)}
            >
              <PhoneCall className="h-3 w-3 mr-1" />
              Call
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 px-2 text-xs"
              onClick={() => handleWhatsApp(followUp.contactPhone)}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              WhatsApp
            </Button>
          </>
        )}
        <Button 
          size="sm" 
          variant="default" 
          className="h-7 px-2 text-xs"
          onClick={handleComplete}
        >
          <ClipboardCheck className="h-3 w-3 mr-1" />
          Complete
        </Button>
      </div>
    </div>
  );
};

export default FollowUpItem;
