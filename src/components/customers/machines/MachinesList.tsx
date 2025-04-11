
import React from "react";
import { Printer, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MachineItem } from "./MachineItem";
import { Machine } from "./types";

interface MachinesListProps {
  machines: Machine[];
  onScheduleFollowUp: (machine: Machine) => void;
  onAddMachine: () => void;
}

export const MachinesList: React.FC<MachinesListProps> = ({
  machines,
  onScheduleFollowUp,
  onAddMachine,
}) => {
  if (machines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 border rounded-md border-dashed">
        <Printer className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-sm">No machines added yet</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1 mt-4"
          onClick={onAddMachine}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add First Machine</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {machines.map((machine) => (
        <MachineItem 
          key={machine.id} 
          machine={machine} 
          onScheduleFollowUp={onScheduleFollowUp} 
        />
      ))}
    </div>
  );
};
