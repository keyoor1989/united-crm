
import React from "react";
import { SalesFollowUp } from "../machines/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Phone, MessageSquare, Clock, Bell } from "lucide-react";
import { format } from "date-fns";
import { handleCall, handleWhatsApp } from "./followUpService";
import FollowUpTypeBadge from "./FollowUpTypeBadge";

interface FollowUpItemProps {
  followUp: SalesFollowUp;
  onMarkComplete: (id: number) => void;
}

const FollowUpItem: React.FC<FollowUpItemProps> = ({ followUp, onMarkComplete }) => {
  const formatDate = (date: Date) => {
    return format(date, "MMM d, yyyy");
  };
  
  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };
  
  return (
    <Card className="p-4">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{followUp.customerName}</h3>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(followUp.date)} at {formatTime(followUp.date)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FollowUpTypeBadge type={followUp.type} />
            {followUp.reminderSent && (
              <Badge variant="outline" className="gap-1 bg-blue-50 text-blue-700">
                <Bell className="h-3 w-3" />
                Reminder Sent
              </Badge>
            )}
          </div>
        </div>
        
        {followUp.location && (
          <div className="text-sm">
            <span className="font-medium">Location:</span> {followUp.location}
          </div>
        )}
        
        {followUp.notes && (
          <div className="text-sm">
            <span className="font-medium">Notes:</span> {followUp.notes}
          </div>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-2">
            {followUp.contactPhone && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1 h-8"
                  onClick={() => handleCall(followUp.contactPhone)}
                >
                  <Phone className="h-3 w-3" />
                  Call
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1 h-8"
                  onClick={() => handleWhatsApp(followUp.contactPhone)}
                >
                  <MessageSquare className="h-3 w-3" />
                  WhatsApp
                </Button>
              </>
            )}
          </div>
          
          {followUp.status === "pending" && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1 h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => onMarkComplete(followUp.id)}
            >
              <Check className="h-3 w-3" />
              Complete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FollowUpItem;
