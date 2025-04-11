
import React from "react";
import { Printer, CalendarDays, Settings, CalendarClock, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Machine } from "./types";

interface MachineItemProps {
  machine: Machine;
  onScheduleFollowUp: (machine: Machine) => void;
}

export const MachineItem: React.FC<MachineItemProps> = ({ 
  machine, 
  onScheduleFollowUp 
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "maintenance":
        return <Badge className="bg-amber-500">Maintenance Required</Badge>;
      case "replacement-due":
        return <Badge className="bg-red-500">Replacement Due</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="border rounded-md p-3">
      <div className="flex justify-between items-start">
        <div className="flex gap-2 items-center">
          <Printer className="h-4 w-4 text-muted-foreground" />
          <div>
            <h4 className="font-medium">{machine.model}</h4>
            <p className="text-xs text-muted-foreground">
              SN: {machine.serialNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(machine.status)}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Service History</DropdownMenuItem>
              <DropdownMenuItem>Log Service Call</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onScheduleFollowUp(machine)}>
                Schedule Service Follow-up
              </DropdownMenuItem>
              <DropdownMenuItem>Schedule Maintenance</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <CalendarDays className="h-3 w-3 text-muted-foreground" />
          <span>Installed: {new Date(machine.installationDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Settings className="h-3 w-3 text-muted-foreground" />
          <span>Last Service: {new Date(machine.lastService).toLocaleDateString()}</span>
        </div>
        {machine.followUp && (
          <div className="flex items-center gap-1">
            <CalendarClock className="h-3 w-3 text-blue-500" />
            <span className="text-blue-600 font-medium">
              Follow-up: {new Date(machine.followUp.date).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
