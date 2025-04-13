
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MachinesList from "./machines/MachinesList";
import AddMachineDialog from "./machines/AddMachineDialog";
import SalesFollowUpList from "./machines/SalesFollowUpList";
import FollowUpDialog from "./machines/FollowUpDialog";
import SalesFollowUpDialog from "./machines/SalesFollowUpDialog";
import { Machine } from "./machines/types";

interface CustomerMachinesProps {
  customerId?: string;
}

const CustomerMachines: React.FC<CustomerMachinesProps> = ({ customerId }) => {
  const { toast } = useToast();
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [isSalesFollowUpOpen, setIsSalesFollowUpOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  const handleAddMachine = () => {
    setIsAddMachineOpen(true);
  };

  const handleMachineAdded = () => {
    toast({
      title: "Machine Added",
      description: "The machine has been added successfully."
    });
    setIsAddMachineOpen(false);
  };

  const handleScheduleFollowUp = (machine: Machine) => {
    setSelectedMachine(machine);
    setIsFollowUpOpen(true);
  };

  const handleAddSalesFollowUp = () => {
    setIsSalesFollowUpOpen(true);
  };

  const handleFollowUpAdded = () => {
    toast({
      title: "Follow-up Scheduled",
      description: "The follow-up has been scheduled successfully."
    });
    setIsFollowUpOpen(false);
    setSelectedMachine(null);
  };

  const handleSalesFollowUpAdded = () => {
    toast({
      title: "Sales Follow-up Scheduled",
      description: "The sales follow-up has been scheduled successfully."
    });
    setIsSalesFollowUpOpen(false);
  };

  if (!customerId) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Please save customer information first to manage machines.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Customer Machines</h3>
          <Button variant="outline" size="sm" className="gap-1" onClick={handleAddMachine}>
            <Plus className="h-4 w-4" /> Add Machine
          </Button>
        </div>
        <MachinesList 
          customerId={customerId} 
          onAddMachine={handleAddMachine}
          onScheduleFollowUp={handleScheduleFollowUp}
        />
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Sales Follow-ups</h3>
          <Button variant="outline" size="sm" className="gap-1" onClick={handleAddSalesFollowUp}>
            <Plus className="h-4 w-4" /> Add Follow-up
          </Button>
        </div>
        <SalesFollowUpList customerId={customerId} />
      </div>

      {/* Dialogs */}
      <AddMachineDialog 
        isOpen={isAddMachineOpen} 
        onClose={() => setIsAddMachineOpen(false)}
        onMachineAdded={handleMachineAdded}
        customerId={customerId}
      />
      
      <FollowUpDialog
        isOpen={isFollowUpOpen}
        onClose={() => setIsFollowUpOpen(false)}
        onFollowUpAdded={handleFollowUpAdded}
        machine={selectedMachine}
        customerId={customerId}
      />
      
      <SalesFollowUpDialog
        isOpen={isSalesFollowUpOpen}
        onClose={() => setIsSalesFollowUpOpen(false)}
        onFollowUpAdded={handleSalesFollowUpAdded}
        customerId={customerId}
      />
    </div>
  );
};

export default CustomerMachines;
