import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, FilePlus, Settings, Printer, FileSpreadsheet, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { RentalMachine, RentalBilling, RentalPartsUsage } from "@/types/finance";
import { InventoryItem } from "@/types/inventory";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/finance/financeUtils";
import AddRentalPartsDialog from "@/components/service/rental/AddRentalPartsDialog";

// Mock data for initial display
const initialRentalMachines: RentalMachine[] = [
  {
    id: "1",
    serialNumber: "XYZ-1234",
    model: "Canon iR2520",
    clientName: "ABC Company",
    clientId: "client-001",
    location: "Head Office",
    startDate: "2025-01-01",
    endDate: "2026-01-01",
    monthlyRent: 5000,
    copyLimitA4: 5000,
    copyLimitA3: 500,
    extraCopyChargeA4: 0.50,
    extraCopyChargeA3: 1.00,
    currentA4Reading: 12000,
    currentA3Reading: 1200,
    lastReadingDate: "2025-04-01",
    status: "Active"
  },
  {
    id: "2",
    serialNumber: "ABC-5678",
    model: "Ricoh MP2014",
    clientName: "XYZ Corporation",
    clientId: "client-002",
    location: "Branch Office",
    startDate: "2025-02-01",
    endDate: "2026-02-01",
    monthlyRent: 7500,
    copyLimitA4: 8000,
    copyLimitA3: 1000,
    extraCopyChargeA4: 0.60,
    extraCopyChargeA3: 1.20,
    currentA4Reading: 15000,
    currentA3Reading: 2000,
    lastReadingDate: "2025-04-05",
    status: "Active"
  }
];

const RentalMachines = () => {
  const [activeTab, setActiveTab] = useState<string>("machines");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [machines, setMachines] = useState<RentalMachine[]>(initialRentalMachines);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAddMachineModalOpen, setIsAddMachineModalOpen] = useState<boolean>(false);
  const [isAddReadingModalOpen, setIsAddReadingModalOpen] = useState<boolean>(false);
  const [selectedMachine, setSelectedMachine] = useState<RentalMachine | null>(null);
  const [isAddPartsDialogOpen, setIsAddPartsDialogOpen] = useState<boolean>(false);

  // Filter machines based on search query
  const filteredMachines = machines.filter(machine => 
    machine.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle add new machine
  const handleAddMachine = () => {
    toast.info("This functionality will be implemented soon");
    setIsAddMachineModalOpen(false);
  };

  // Handle add new reading
  const handleAddReading = () => {
    if (!selectedMachine) return;
    
    toast.info("Reading updated successfully");
    setIsAddReadingModalOpen(false);
    setSelectedMachine(null);
  };

  // Handle view parts used
  const handleViewPartsUsed = (machine: RentalMachine) => {
    setSelectedMachine(machine);
    setActiveTab("parts");
  };
  
  // Handle view billing
  const handleViewBilling = (machine: RentalMachine) => {
    setSelectedMachine(machine);
    setActiveTab("billing");
  };

  // Handle generate billing
  const handleGenerateBilling = (machine: RentalMachine) => {
    toast.info(`Generating billing for ${machine.model} (${machine.serialNumber})`);
    // Implement billing generation logic here
  };

  // Handle print contract
  const handlePrintContract = (machine: RentalMachine) => {
    toast.info(`Preparing to print contract for ${machine.model} (${machine.serialNumber})`);
    // Implement contract printing logic here
  };

  // Add new handler for parts
  const handleAddParts = async (partData: any) => {
    try {
      const { data, error } = await supabase
        .from('amc_consumable_usage')
        .insert({
          machine_id: partData.machine_id,
          machine_model: partData.machine_model,
          machine_type: partData.machine_type,
          serial_number: partData.serial_number,
          item_id: partData.item_id,
          item_name: partData.item_name,
          quantity: partData.quantity,
          cost: partData.cost,
          date: format(new Date(), 'yyyy-MM-dd'), // Format date as a string
          customer_id: partData.machine_id.split('-')[0], // Ensure this is a valid UUID
          customer_name: partData.customer_name || selectedMachine?.clientName,
          contract_id: selectedMachine?.id,
        });

      if (error) throw error;

      // Update machine readings
      await supabase
        .from('amc_machines')
        .update({
          last_a4_reading: partData.readings.a4,
          last_a3_reading: partData.readings.a3,
          last_reading_date: format(new Date(), 'yyyy-MM-dd') // Format date as a string
        })
        .eq('id', partData.machine_id);

      toast.success("Parts added successfully");
      setSelectedMachine(null);
      setIsAddPartsDialogOpen(false);
    } catch (error) {
      console.error('Error adding parts:', error);
      toast.error("Failed to add parts");
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
          <Button onClick={() => setIsAddMachineModalOpen(true)}>
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

        {/* Machines Tab */}
        <TabsContent value="machines">
          <Card>
            <CardHeader>
              <CardTitle>Rental Machines</CardTitle>
              <CardDescription>View and manage all rental machines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Contract Period</TableHead>
                      <TableHead>Monthly Rent</TableHead>
                      <TableHead>Last Reading</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMachines.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center h-24">
                          No machines found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMachines.map((machine) => (
                        <TableRow key={machine.id}>
                          <TableCell>{machine.serialNumber}</TableCell>
                          <TableCell>{machine.model}</TableCell>
                          <TableCell>{machine.clientName}</TableCell>
                          <TableCell>{machine.location}</TableCell>
                          <TableCell>
                            {format(new Date(machine.startDate), "dd/MM/yyyy")} - 
                            {format(new Date(machine.endDate), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>{formatCurrency(machine.monthlyRent)}</TableCell>
                          <TableCell>
                            <div className="text-xs">
                              A4: {machine.currentA4Reading.toLocaleString()}
                            </div>
                            <div className="text-xs">
                              A3: {machine.currentA3Reading.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(machine.lastReadingDate), "dd/MM/yyyy")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={machine.status === "Active" ? "default" : 
                                     machine.status === "Inactive" ? "secondary" : "destructive"}
                            >
                              {machine.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => setIsAddReadingModalOpen(true)}
                                title="Add Reading"
                              >
                                <FilePlus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleViewPartsUsed(machine)}
                                title="View Parts"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => {
                                  setSelectedMachine(machine);
                                  setIsAddPartsDialogOpen(true);
                                }}
                                title="Add Parts"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleGenerateBilling(machine)}
                                title="Generate Bill"
                              >
                                <FileSpreadsheet className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handlePrintContract(machine)}
                                title="Print Contract"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing History Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                {selectedMachine ? 
                  `Billing history for ${selectedMachine.model} (${selectedMachine.serialNumber})` :
                  "Select a machine to view billing history"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Billing Date</TableHead>
                      <TableHead>A4 Copies</TableHead>
                      <TableHead>A3 Copies</TableHead>
                      <TableHead>Extra Copies</TableHead>
                      <TableHead>Base Rent</TableHead>
                      <TableHead>Extra Charges</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={9} className="text-center h-24">
                        {selectedMachine ? 
                          "No billing history found" : 
                          "Select a machine to view billing history"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parts Usage Tab */}
        <TabsContent value="parts">
          <Card>
            <CardHeader>
              <CardTitle>Parts Usage</CardTitle>
              <CardDescription>
                {selectedMachine ? 
                  `Parts used for ${selectedMachine.model} (${selectedMachine.serialNumber})` :
                  "Select a machine to view parts usage"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Part Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reading</TableHead>
                      <TableHead>Expected Life</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24">
                        {selectedMachine ? 
                          "No parts usage history found" : 
                          "Select a machine to view parts usage"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* TODO: Add modals for adding machine and readings */}

      <AddRentalPartsDialog
        open={isAddPartsDialogOpen}
        onOpenChange={setIsAddPartsDialogOpen}
        machineData={selectedMachine}
        onPartAdded={handleAddParts}
      />
    </div>
  );
};

export default RentalMachines;
