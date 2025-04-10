
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileCheck,
  Search,
  Filter,
  Plus,
  Copy,
  FileText,
  BarChart2,
  Calendar,
  Printer,
  Calculator,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Mock data for AMC contracts
const mockContracts = [
  { 
    id: "AMC001", 
    customerId: "cust1", 
    customerName: "ABC Technologies", 
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    status: "Active",
    machineCount: 5,
    billingType: "Per Copy",
    billingFrequency: "Monthly",
  },
  { 
    id: "AMC002", 
    customerId: "cust2", 
    customerName: "XYZ Corp", 
    startDate: "2024-07-01",
    endDate: "2025-06-30",
    status: "Active",
    machineCount: 3,
    billingType: "Fixed",
    billingFrequency: "Quarterly",
  },
  { 
    id: "AMC003", 
    customerId: "cust3", 
    customerName: "Global Solutions", 
    startDate: "2024-10-01",
    endDate: "2025-09-30",
    status: "Active",
    machineCount: 2,
    billingType: "Per Copy",
    billingFrequency: "Monthly",
  },
];

// Mock data for AMC machines
const mockAmcMachines = [
  { 
    id: "machine001", 
    contractId: "AMC001",
    customerId: "cust1", 
    customerName: "ABC Technologies",
    model: "Kyocera TASKalfa 2553ci", 
    serialNumber: "KYO2553123456", 
    location: "2nd Floor, IT Department",
    startMeterReading: 15000,
    currentMeterReading: 28500,
    lastReadingDate: "2025-03-15",
    colorRate: 4.5,
    bwRate: 0.75,
  },
  { 
    id: "machine002", 
    contractId: "AMC001",
    customerId: "cust1", 
    customerName: "ABC Technologies",
    model: "Canon imageRUNNER 2625", 
    serialNumber: "CNR2625789012", 
    location: "Reception Area",
    startMeterReading: 8000,
    currentMeterReading: 15200,
    lastReadingDate: "2025-03-15",
    colorRate: null,
    bwRate: 0.60,
  },
  { 
    id: "machine003", 
    contractId: "AMC002",
    customerId: "cust2", 
    customerName: "XYZ Corp",
    model: "Ricoh MP 2014AD", 
    serialNumber: "RMP2014345678", 
    location: "Accounts Department",
    startMeterReading: 5000,
    currentMeterReading: 9800,
    lastReadingDate: "2025-03-10",
    colorRate: null,
    bwRate: 0.65,
  },
];

// Mock data for consumable usage
const mockConsumableUsage = [
  {
    id: "cons001",
    machineId: "machine001",
    contractId: "AMC001",
    customerId: "cust1",
    customerName: "ABC Technologies",
    itemId: "item1",
    itemName: "Kyocera TK-8365K Toner Black",
    quantity: 1,
    usageDate: "2025-03-01",
    meterReading: 25000,
    copyCount: 10000,
    billingAmount: 7500,
  },
  {
    id: "cons002",
    machineId: "machine001",
    contractId: "AMC001",
    customerId: "cust1",
    customerName: "ABC Technologies",
    itemId: "item2",
    itemName: "Kyocera TK-8365C Toner Cyan",
    quantity: 1,
    usageDate: "2025-02-15",
    meterReading: 20000,
    copyCount: 5000,
    billingAmount: 22500,
  },
  {
    id: "cons003",
    machineId: "machine002",
    contractId: "AMC001",
    customerId: "cust1",
    customerName: "ABC Technologies",
    itemId: "item3",
    itemName: "Canon NPG-56 Toner",
    quantity: 1,
    usageDate: "2025-03-05",
    meterReading: 14000,
    copyCount: 6000,
    billingAmount: 3600,
  },
];

const AmcTracker = () => {
  const [activeTab, setActiveTab] = useState("contracts");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  
  // Filter AMC machines by contract ID
  const getContractMachines = (contractId: string) => {
    return mockAmcMachines.filter(machine => 
      machine.contractId === contractId &&
      (searchQuery ? 
        machine.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
      : true)
    );
  };
  
  // Filter consumable usage by machine ID
  const getMachineConsumables = (machineId: string) => {
    return mockConsumableUsage.filter(usage => 
      usage.machineId === machineId &&
      (searchQuery ? 
        usage.itemName.toLowerCase().includes(searchQuery.toLowerCase())
      : true)
    );
  };
  
  // Handle adding a meter reading
  const handleAddReading = (machineId: string) => {
    const machine = mockAmcMachines.find(m => m.id === machineId);
    toast.success(`Meter reading added for ${machine?.model} (${machine?.serialNumber})`);
  };
  
  // Handle recording consumable usage
  const handleRecordConsumable = (machineId: string) => {
    const machine = mockAmcMachines.find(m => m.id === machineId);
    toast.success(`Consumable recorded for ${machine?.model} (${machine?.serialNumber})`);
  };
  
  // Handle generating a bill
  const handleGenerateBill = (contractId: string) => {
    const contract = mockContracts.find(c => c.id === contractId);
    toast.success(`Bill generated for ${contract?.customerName}`);
  };

  return (
    <Layout>
      <div className="container p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">AMC Consumable Tracker</h1>
            <p className="text-muted-foreground">
              Track consumables used in AMC/Rental contracts
            </p>
          </div>
          <Button 
            onClick={() => toast.success("Feature coming soon!")} 
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            New AMC Contract
          </Button>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="relative grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search contracts, machines, or consumables..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="contracts">AMC Contracts</TabsTrigger>
            <TabsTrigger value="machines">Machines</TabsTrigger>
            <TabsTrigger value="consumables">Consumable Usage</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="contracts" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Active AMC/Rental Contracts</CardTitle>
                <CardDescription>
                  Manage your ongoing maintenance contracts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contract ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Machines</TableHead>
                      <TableHead>Billing Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockContracts
                      .filter(contract => 
                        searchQuery ? 
                          contract.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          contract.id.toLowerCase().includes(searchQuery.toLowerCase())
                        : true
                      )
                      .map((contract) => (
                        <TableRow 
                          key={contract.id}
                          className={selectedContract === contract.id ? "bg-primary/5" : ""}
                        >
                          <TableCell className="font-medium">{contract.id}</TableCell>
                          <TableCell>{contract.customerName}</TableCell>
                          <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(contract.endDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="success">{contract.status}</Badge>
                          </TableCell>
                          <TableCell>{contract.machineCount}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{contract.billingType}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedContract(contract.id);
                                  setActiveTab("machines");
                                }}
                              >
                                View Machines
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleGenerateBill(contract.id)}
                              >
                                <Calculator className="h-4 w-4 mr-1" />
                                Generate Bill
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                    {mockContracts.filter(contract => 
                      searchQuery ? 
                        contract.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        contract.id.toLowerCase().includes(searchQuery.toLowerCase())
                      : true
                    ).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No contracts found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="machines" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedContract ? 
                      `Machines under ${mockContracts.find(c => c.id === selectedContract)?.customerName}` : 
                      "All AMC Machines"
                    }
                  </CardTitle>
                  <CardDescription>
                    {selectedContract ? 
                      `Contract: ${selectedContract} (${mockContracts.find(c => c.id === selectedContract)?.billingType})` : 
                      "Machines under AMC/Rental contracts"
                    }
                  </CardDescription>
                </div>
                
                {selectedContract && (
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setActiveTab("contracts")}
                    >
                      Back to Contracts
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Start Reading</TableHead>
                      <TableHead>Current Reading</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedContract ? 
                      getContractMachines(selectedContract) : 
                      mockAmcMachines.filter(machine => 
                        searchQuery ? 
                          machine.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          machine.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          machine.customerName.toLowerCase().includes(searchQuery.toLowerCase())
                        : true
                      )
                    ).map((machine) => (
                      <TableRow 
                        key={machine.id}
                        className={selectedMachine === machine.id ? "bg-primary/5" : ""}
                      >
                        <TableCell className="font-medium">{machine.model}</TableCell>
                        <TableCell>{machine.serialNumber}</TableCell>
                        <TableCell>{machine.location}</TableCell>
                        <TableCell>{machine.startMeterReading.toLocaleString()}</TableCell>
                        <TableCell>{machine.currentMeterReading.toLocaleString()}</TableCell>
                        <TableCell>{new Date(machine.lastReadingDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {machine.colorRate ? 
                            <>B/W: ₹{machine.bwRate}, Color: ₹{machine.colorRate}</> : 
                            <>B/W: ₹{machine.bwRate}</>
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAddReading(machine.id)}
                            >
                              <Calculator className="h-4 w-4 mr-1" />
                              Add Reading
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedMachine(machine.id);
                                setActiveTab("consumables");
                              }}
                            >
                              View Usage
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {(selectedContract ? 
                      getContractMachines(selectedContract).length === 0 : 
                      mockAmcMachines.filter(machine => 
                        searchQuery ? 
                          machine.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          machine.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          machine.customerName.toLowerCase().includes(searchQuery.toLowerCase())
                        : true
                      ).length === 0
                    ) && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No machines found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="consumables" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedMachine ? 
                      `Consumables for ${mockAmcMachines.find(m => m.id === selectedMachine)?.model}` : 
                      "Consumable Usage"
                    }
                  </CardTitle>
                  <CardDescription>
                    {selectedMachine ? 
                      `Serial: ${mockAmcMachines.find(m => m.id === selectedMachine)?.serialNumber}` : 
                      "Track consumables used in AMC/rental machines"
                    }
                  </CardDescription>
                </div>
                
                {selectedMachine && (
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm"
                      onClick={() => handleRecordConsumable(selectedMachine)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Record Consumable
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setActiveTab("machines")}
                    >
                      Back to Machines
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {!selectedMachine ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Printer className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Please select a machine from the Machines tab
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab("machines")}
                    >
                      Go to Machines
                    </Button>
                  </div>
                ) : (
                  <>
                    {getMachineConsumables(selectedMachine).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Printer className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          No consumable usage recorded for this machine
                        </p>
                        <Button 
                          className="mt-4"
                          onClick={() => handleRecordConsumable(selectedMachine)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Record First Consumable
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Consumable</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Usage Date</TableHead>
                            <TableHead>Meter Reading</TableHead>
                            <TableHead>Copy Count</TableHead>
                            <TableHead className="text-right">Billing Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getMachineConsumables(selectedMachine).map((usage) => (
                            <TableRow key={usage.id}>
                              <TableCell className="font-medium">{usage.itemName}</TableCell>
                              <TableCell>{usage.quantity}</TableCell>
                              <TableCell>{new Date(usage.usageDate).toLocaleDateString()}</TableCell>
                              <TableCell>{usage.meterReading.toLocaleString()}</TableCell>
                              <TableCell>{usage.copyCount.toLocaleString()}</TableCell>
                              <TableCell className="text-right">₹{usage.billingAmount.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>AMC Billing</CardTitle>
                <CardDescription>
                  Generate bills based on meter readings and consumable usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <BarChart2 className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    AMC billing module coming soon
                  </p>
                  <p className="text-sm text-muted-foreground text-center max-w-md mt-2">
                    This section will enable automated billing based on copy count, consumable usage, and contract terms.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AmcTracker;
