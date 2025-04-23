
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RentalMachine } from "@/types/finance";
import { useRentalMachines } from "@/hooks/rental/useRentalMachines";
import MachinesTab from "@/components/service/rental/MachinesTab";
import BillingTab from "@/components/service/rental/BillingTab";
import PartsTab from "@/components/service/rental/PartsTab";
import AddRentalPartsDialog from "@/components/service/rental/AddRentalPartsDialog";
import AddRentalMachineDialog from "@/components/service/rental/AddRentalMachineDialog";
import AddRentalReadingDialog from "@/components/service/rental/AddRentalReadingDialog";

const RentalMachines = () => {
  const [activeTab, setActiveTab] = useState<string>("machines");
  const [isAddMachineModalOpen, setIsAddMachineModalOpen] = useState<boolean>(false);
  const [isAddReadingModalOpen, setIsAddReadingModalOpen] = useState<boolean>(false);
  const [selectedMachine, setSelectedMachine] = useState<RentalMachine | null>(null);
  const [isAddPartsDialogOpen, setIsAddPartsDialogOpen] = useState<boolean>(false);

  const {
    filteredMachines,
    searchQuery,
    setSearchQuery,
    handleGenerateBilling,
    handlePrintContract,
    isLoading,
    addRentalParts,
    refreshData
  } = useRentalMachines();

  const handleAddReading = (machine: RentalMachine) => {
    setSelectedMachine(machine);
    setIsAddReadingModalOpen(true);
  };

  const handleViewParts = (machine: RentalMachine) => {
    setSelectedMachine(machine);
    setActiveTab("parts");
  };

  const handleAddParts = (machine: RentalMachine) => {
    setSelectedMachine(machine);
    setIsAddPartsDialogOpen(true);
  };

  const handleAddMachine = () => {
    setIsAddMachineModalOpen(true);
  };

  const handlePartAdded = async (data: any) => {
    if (selectedMachine) {
      const success = await addRentalParts(selectedMachine, data);
      if (success) {
        setIsAddPartsDialogOpen(false);
      }
    }
  };

  return (
    <div className="container p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Rental Machines</h1>
          <p className="text-muted-foreground">
            Manage rental machine inventory, billing, and parts usage
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddMachine}>
            <Plus className="mr-2 h-4 w-4" /> Add Machine
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="machines">Machines</TabsTrigger>
            <TabsTrigger value="billing">Billing History</TabsTrigger>
            <TabsTrigger value="parts">Parts Usage</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search machines..."
                className="w-[250px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <TabsContent value="machines">
          <MachinesTab 
            machines={filteredMachines}
            onAddReading={handleAddReading}
            onViewParts={handleViewParts}
            onAddParts={handleAddParts}
            onGenerateBill={handleGenerateBilling}
            onPrintContract={handlePrintContract}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="billing">
          <BillingTab selectedMachine={selectedMachine} />
        </TabsContent>

        <TabsContent value="parts">
          <PartsTab selectedMachine={selectedMachine} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddRentalMachineDialog
        open={isAddMachineModalOpen}
        onOpenChange={setIsAddMachineModalOpen}
        onMachineAdded={refreshData}
      />

      <AddRentalReadingDialog
        open={isAddReadingModalOpen}
        onOpenChange={setIsAddReadingModalOpen}
        machineData={selectedMachine}
        onReadingAdded={refreshData}
      />

      <AddRentalPartsDialog
        open={isAddPartsDialogOpen}
        onOpenChange={setIsAddPartsDialogOpen}
        machineData={selectedMachine}
        onPartAdded={handlePartAdded}
      />
    </div>
  );
};

export default RentalMachines;
