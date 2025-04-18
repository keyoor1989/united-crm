
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MachineItem } from "./MachineItem";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Machine } from "./types";

interface MachinesListProps {
  customerId?: string;
  onAddMachine: () => void;
  onScheduleFollowUp: (machine: Machine) => void;
  isCustomerConverted?: boolean;
}

const MachinesList: React.FC<MachinesListProps> = ({ 
  customerId, 
  onAddMachine, 
  onScheduleFollowUp,
  isCustomerConverted = false
}) => {
  // Fetch owned machines
  const { data: ownedMachines = [], isLoading: isLoadingOwned } = useQuery({
    queryKey: ['customer-machines', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data, error } = await supabase
        .from('customer_machines')
        .select('*')
        .eq('customer_id', customerId);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId
  });

  // Fetch machine interests for non-converted customers
  const { data: machineInterests = [], isLoading: isLoadingInterests } = useQuery({
    queryKey: ['machine-interests', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data, error } = await supabase
        .from('customer_machine_interests')
        .select('*')
        .eq('customer_id', customerId);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId && !isCustomerConverted
  });

  if (isLoadingOwned || isLoadingInterests) {
    return <div className="p-4">Loading machines...</div>;
  }

  if (!customerId) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Please save customer information first to manage machines.</p>
      </div>
    );
  }

  // Transform the database machine objects to match the Machine type
  const transformedMachines = ownedMachines.map(machine => ({
    id: machine.id,
    model: machine.machine_name,
    serialNumber: machine.machine_serial || 'N/A',
    installationDate: machine.installation_date || new Date().toISOString(),
    status: 'active' as const,
    lastService: machine.last_service || new Date().toISOString(),
  }));

  return (
    <div className="space-y-4">
      {/* Show interests section when not converted */}
      {!isCustomerConverted && machineInterests.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Interested In</h4>
          {machineInterests.map((interest) => (
            <div key={interest.id} className="p-3 border rounded-lg bg-muted/50">
              <p className="font-medium">{interest.machine_name}</p>
              {interest.machine_type && (
                <p className="text-sm text-muted-foreground">{interest.machine_type}</p>
              )}
              {interest.notes && (
                <p className="text-sm mt-1">{interest.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Show owned machines section for converted customers */}
      {isCustomerConverted && (
        <>
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Owned Machines</h4>
            <Button variant="outline" size="sm" onClick={onAddMachine}>
              <Plus className="h-4 w-4 mr-1" />
              Add Machine
            </Button>
          </div>
          
          {transformedMachines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No machines added yet.</p>
          ) : (
            <div className="space-y-2">
              {transformedMachines.map((machine) => (
                <MachineItem 
                  key={machine.id} 
                  machine={machine}
                  onScheduleFollowUp={() => onScheduleFollowUp(machine)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MachinesList;
