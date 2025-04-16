
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  BellRing, 
  Plus, 
  RotateCw, 
  FilterX, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { triggerTodayReminders } from "./followUpService";
import { toast } from "sonner";

interface FollowUpHeaderProps {
  onRefresh: () => void;
  totalToday?: number;
  completedToday?: number;
}

const FollowUpHeader: React.FC<FollowUpHeaderProps> = ({ 
  onRefresh,
  totalToday = 0,
  completedToday = 0 
}) => {
  const [isSendingReminders, setIsSendingReminders] = useState(false);
  
  const handleSendReminders = async () => {
    setIsSendingReminders(true);
    try {
      await triggerTodayReminders();
    } finally {
      setIsSendingReminders(false);
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold">Customer Follow-ups</h1>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-sm font-medium">
            Today: {totalToday}
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 text-sm font-medium">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed: {completedToday}
          </Badge>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleSendReminders} variant="outline" size="sm" disabled={isSendingReminders}>
                <BellRing className="h-4 w-4 mr-2" />
                {isSendingReminders ? "Sending..." : "Send Today's Reminders"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send Telegram reminders for today's follow-ups</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onRefresh} variant="outline" size="sm">
                <RotateCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh follow-up data</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" size="sm" onClick={() => toast.info("Add new follow-up feature coming soon")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Follow-up
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new customer follow-up</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default FollowUpHeader;
