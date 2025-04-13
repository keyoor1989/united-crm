
import React, { useState, useEffect } from "react";
import { Printer, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MachineItem } from "./MachineItem";
import { Machine } from "./types";
import { fetchCustomerMachines } from "./MachineService";
import { Skeleton } from "@/components/ui/skeleton";

interface MachinesListProps {
  customerId: string;
  onScheduleFollowUp?: (machine: Machine) => void;
  onAddMachine?: () => void;
  machines?: Machine[];
}

export const MachinesList: React.FC<MachinesListProps> = ({
  customerId,
  onScheduleFollowUp,
  onAddMachine,
  machines: externalMachines,
}) => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (externalMachines) {
      setMachines(externalMachines);
      setIsLoading(false);
      return;
    }

    const loadMachines = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCustomerMachines(customerId);
        setMachines(data);
      } catch (err: any) {
        console.error("Error loading machines:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (customerId) {
      loadMachines();
    }
  }, [customerId, externalMachines]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading machines: {error.message}</div>;
  }

  if (machines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 border rounded-md border-dashed bg-muted/20">
        <Printer className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground mb-2">No machines added yet</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={onAddMachine}
        >
          <Plus className="h-4 w-4" />
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

export default MachinesList;
