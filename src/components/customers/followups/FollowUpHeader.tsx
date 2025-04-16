
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Bell, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FollowUpHeaderProps {
  onRefresh: () => void;
  totalToday: number;
  completedToday: number;
  onSendReminders?: () => void;
  isSendingReminders?: boolean;
}

const FollowUpHeader: React.FC<FollowUpHeaderProps> = ({ 
  onRefresh, 
  totalToday, 
  completedToday,
  onSendReminders,
  isSendingReminders = false 
}) => {
  const pending = totalToday - completedToday;
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
      <div>
        <h1 className="text-2xl font-bold">Customer Follow-ups</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            Today: {totalToday}
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            Completed: {completedToday}
          </Badge>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
            Pending: {pending}
          </Badge>
        </div>
      </div>
      
      <div className="flex gap-3 w-full sm:w-auto">
        {onSendReminders && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={onSendReminders} 
                    disabled={isSendingReminders || totalToday === 0}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    {isSendingReminders ? "Sending..." : "Send Reminders"}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {totalToday === 0 ? 
                  "No follow-ups scheduled for today" : 
                  "Send Telegram reminders for today's follow-ups"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <Button 
          variant="outline" 
          className="w-full sm:w-auto"
          onClick={onRefresh}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default FollowUpHeader;
