
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { MachinesList } from "./machines/MachinesList";
import { SalesFollowUpsList } from "./machines/SalesFollowUpsList";
import { AddMachineDialog } from "./machines/AddMachineDialog";
import { FollowUpDialog } from "./machines/FollowUpDialog";
import { SalesFollowUpDialog } from "./machines/SalesFollowUpDialog";
import { 
  Machine, 
  SalesFollowUp, 
  MachineFormData, 
  SalesFollowUpFormData 
} from "./machines/types";
import * as MachineService from "./machines/MachineService";

export default function CustomerMachines() {
  const { id: customerId } = useParams<{ id: string }>();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [salesFollowUps, setSalesFollowUps] = useState<SalesFollowUp[]>([]);
  const [followUpMachine, setFollowUpMachine] = useState<Machine | null>(null);
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(undefined);
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [salesFollowUpDialogOpen, setSalesFollowUpDialogOpen] = useState(false);
  const [addMachineDialogOpen, setAddMachineDialogOpen] = useState(false);
  const [newMachineData, setNewMachineData] = useState<MachineFormData>({
    model: "",
    machineType: "copier",
    status: "active"
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const [newSalesFollowUp, setNewSalesFollowUp] = useState<SalesFollowUpFormData>({
    status: "pending",
    type: "quotation"
  });
  const [activeTab, setActiveTab] = useState("machines");

  useEffect(() => {
    if (customerId) {
      fetchCustomerMachines();
    }
  }, [customerId]);

  const fetchCustomerMachines = async () => {
    if (!customerId) return;
    
    try {
      const machinesData = await MachineService.fetchCustomerMachines(customerId);
      setMachines(machinesData);
    } catch (error) {
      toast.error("Failed to load customer machines");
    }
  };

  const handleAddMachine = async () => {
    if (!newMachineData.model) {
      toast.error("Please enter a machine model");
      return;
    }
    
    if (!newMachineData.machineType) {
      toast.error("Please select a machine type");
      return;
    }
    
    if (!customerId) {
      toast.error("Customer ID is missing");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Adding machine for customer:", customerId);
      await MachineService.addMachine(customerId, newMachineData);
      toast.success("Machine added successfully!");
      
      // Reset only required fields after successful addition
      setNewMachineData({
        model: "",
        machineType: "copier",
        status: "active"
      });
      setAddMachineDialogOpen(false);
      
      // Refresh the machines list
      fetchCustomerMachines();
      
    } catch (error) {
      console.error("Error details:", error);
      toast.error("An error occurred while adding the machine");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleFollowUp = (machine: Machine) => {
    setFollowUpMachine(machine);
    setFollowUpDate(machine.followUp?.date);
    setFollowUpNotes(machine.followUp?.notes || "");
    setFollowUpDialogOpen(true);
  };

  const saveFollowUp = () => {
    if (!followUpMachine || !followUpDate) {
      toast.error("Please select a follow-up date");
      return;
    }

    const updatedMachines = machines.map(machine => {
      if (machine.id === followUpMachine.id) {
        return {
          ...machine,
          followUp: {
            date: followUpDate,
            notes: followUpNotes,
            type: "service" as const
          }
        };
      }
      return machine;
    });

    setMachines(updatedMachines);
    setFollowUpDialogOpen(false);
    toast.success(`Follow-up scheduled for ${followUpDate.toLocaleDateString()}`);
  };

  const handleAddSalesFollowUp = () => {
    if (!newSalesFollowUp.date || !newSalesFollowUp.customerName || !newSalesFollowUp.notes) {
      toast.error("Please fill all required fields");
      return;
    }

    const newFollowUp: SalesFollowUp = {
      id: salesFollowUps.length + 1,
      date: newSalesFollowUp.date,
      customerId: Math.floor(Math.random() * 1000) + 100,
      customerName: newSalesFollowUp.customerName,
      notes: newSalesFollowUp.notes,
      status: newSalesFollowUp.status,
      type: newSalesFollowUp.type
    };

    setSalesFollowUps([...salesFollowUps, newFollowUp]);
    setSalesFollowUpDialogOpen(false);
    toast.success(`Sales follow-up scheduled for ${newFollowUp.date.toLocaleDateString()}`);
    setNewSalesFollowUp({
      status: "pending",
      type: "quotation"
    });
  };

  const markSalesFollowUpComplete = (id: number) => {
    const updatedFollowUps = salesFollowUps.map(followUp => {
      if (followUp.id === id) {
        return {
          ...followUp,
          status: "completed" as const
        };
      }
      return followUp;
    });

    setSalesFollowUps(updatedFollowUps);
    toast.success("Follow-up marked as completed");
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md">Customer Management</CardTitle>
        <div className="flex gap-2">
          {activeTab === "machines" && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1"
              onClick={() => setAddMachineDialogOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Machine</span>
            </Button>
          )}
          {activeTab === "sales-followups" && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1"
              onClick={() => setSalesFollowUpDialogOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Sales Follow-up</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="machines">Machines</TabsTrigger>
            <TabsTrigger value="sales-followups">Sales Follow-ups</TabsTrigger>
          </TabsList>
          
          <TabsContent value="machines">
            <MachinesList 
              machines={machines} 
              onScheduleFollowUp={handleScheduleFollowUp}
              onAddMachine={() => setAddMachineDialogOpen(true)}
            />
          </TabsContent>
          
          <TabsContent value="sales-followups">
            <SalesFollowUpsList 
              salesFollowUps={salesFollowUps}
              onMarkComplete={markSalesFollowUpComplete}
            />
          </TabsContent>
        </Tabs>
      </CardContent>

      <AddMachineDialog 
        open={addMachineDialogOpen}
        isLoading={isLoading}
        onOpenChange={setAddMachineDialogOpen}
        onAddMachine={handleAddMachine}
        newMachineData={newMachineData}
        setNewMachineData={setNewMachineData}
      />

      <FollowUpDialog 
        open={followUpDialogOpen}
        onOpenChange={setFollowUpDialogOpen}
        followUpMachine={followUpMachine}
        followUpDate={followUpDate}
        setFollowUpDate={setFollowUpDate}
        followUpNotes={followUpNotes}
        setFollowUpNotes={setFollowUpNotes}
        onSaveFollowUp={saveFollowUp}
      />

      <SalesFollowUpDialog 
        open={salesFollowUpDialogOpen}
        onOpenChange={setSalesFollowUpDialogOpen}
        newSalesFollowUp={newSalesFollowUp}
        setNewSalesFollowUp={setNewSalesFollowUp}
        onAddSalesFollowUp={handleAddSalesFollowUp}
      />
    </Card>
  );
}
