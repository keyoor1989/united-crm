import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MachinesList from "./machines/MachinesList";
import AddMachineDialog from "./machines/AddMachineDialog";
import { FollowUpDialog } from "./machines/FollowUpDialog";
import SalesFollowUpDialog from "./machines/SalesFollowUpDialog";
import SalesFollowUpList from "./machines/SalesFollowUpList";
import { Machine, MachineFormData } from "./machines/types";
import { addMachine } from "./machines/MachineService";
import { supabase } from "@/integrations/supabase/client";

interface CustomerMachinesProps {
  customerId?: string;
  customerName?: string;
  customerLocation?: string;
  customerPhone?: string;
}

const CustomerMachines: React.FC<CustomerMachinesProps> = ({ 
  customerId, 
  customerName = "", 
  customerLocation = "", 
  customerPhone = ""
}) => {
  const { toast } = useToast();
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [isSalesFollowUpOpen, setIsSalesFollowUpOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newMachineData, setNewMachineData] = useState<MachineFormData>({
    model: "",
    machineType: "copier",
    status: "active"
  });
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(undefined);
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [machinesKey, setMachinesKey] = useState(Date.now());
  const [customerDetails, setCustomerDetails] = useState({
    name: customerName,
    location: customerLocation,
    phone: customerPhone
  });
  const [isCustomerConverted, setIsCustomerConverted] = useState(false);

  useEffect(() => {
    if (customerId && (!customerName || !customerLocation || !customerPhone)) {
      fetchCustomerDetails();
    } else {
      setCustomerDetails({
        name: customerName,
        location: customerLocation,
        phone: customerPhone
      });
    }
  }, [customerId, customerName, customerLocation, customerPhone]);

  const fetchCustomerDetails = async () => {
    if (!customerId) return;
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('name, area, phone')
        .eq('id', customerId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setCustomerDetails({
          name: data.name || "",
          location: data.area || "",
          phone: data.phone || ""
        });
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
    }
  };

  useEffect(() => {
    if (customerId) {
      const checkCustomerStatus = async () => {
        const { data, error } = await supabase
          .from('customers')
          .select('lead_status')
          .eq('id', customerId)
          .single();
          
        if (!error && data) {
          setIsCustomerConverted(data.lead_status === 'Converted');
        }
      };
      
      checkCustomerStatus();
    }
  }, [customerId]);

  const handleAddMachine = () => {
    setIsAddMachineOpen(true);
    setNewMachineData({
      model: "",
      machineType: "copier",
      status: "active"
    });
  };

  const handleMachineAdded = async () => {
    if (!customerId) {
      toast({
        title: "Error",
        description: "Customer ID is required to add a machine.",
        variant: "destructive"
      });
      return;
    }

    if (!newMachineData.model || !newMachineData.machineType) {
      toast({
        title: "Missing Information",
        description: "Please provide machine model and type.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await addMachine(customerId, newMachineData);
      
      toast({
        title: "Machine Added",
        description: "The machine has been added successfully."
      });
      
      setNewMachineData({
        model: "",
        machineType: "copier",
        status: "active"
      });
      
      setIsAddMachineOpen(false);
      
      setMachinesKey(Date.now());
    } catch (error: any) {
      console.error("Error adding machine:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add machine",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
    setMachinesKey(Date.now());
  };

  const onSaveFollowUp = () => {
    handleFollowUpAdded();
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
          <h3 className="text-lg font-semibold">
            {isCustomerConverted ? "Customer Machines" : "Machine Interests"}
          </h3>
          {isCustomerConverted && (
            <Button variant="outline" size="sm" className="gap-1" onClick={handleAddMachine}>
              <Plus className="h-4 w-4" /> Add Machine
            </Button>
          )}
        </div>
        <MachinesList 
          key={machinesKey}
          customerId={customerId} 
          onAddMachine={handleAddMachine}
          onScheduleFollowUp={handleScheduleFollowUp}
          isCustomerConverted={isCustomerConverted}
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

      <AddMachineDialog 
        open={isAddMachineOpen} 
        isLoading={isLoading}
        onOpenChange={setIsAddMachineOpen}
        onAddMachine={handleMachineAdded}
        newMachineData={newMachineData}
        setNewMachineData={setNewMachineData}
      />
      
      <FollowUpDialog
        open={isFollowUpOpen}
        onOpenChange={setIsFollowUpOpen}
        followUpMachine={selectedMachine}
        followUpDate={followUpDate}
        setFollowUpDate={setFollowUpDate}
        followUpNotes={followUpNotes}
        setFollowUpNotes={setFollowUpNotes}
        onSaveFollowUp={onSaveFollowUp}
      />
      
      <SalesFollowUpDialog
        open={isSalesFollowUpOpen}
        setOpen={setIsSalesFollowUpOpen}
        customerId={customerId}
        customerName={customerDetails.name}
        location={customerDetails.location}
        phone={customerDetails.phone}
        onSave={handleSalesFollowUpAdded}
      />
    </div>
  );
};

export default CustomerMachines;
