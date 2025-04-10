
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
  Cpu,
  Search,
  Filter,
  Plus,
  Users,
  ArrowRight,
  BarChart2,
  Calendar,
  Printer,
  History,
  Clock,
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

// Mock data for customers
const mockCustomers = [
  { id: "cust1", name: "ABC Technologies", location: "Indore", machineCount: 5 },
  { id: "cust2", name: "XYZ Corp", location: "Bhopal", machineCount: 3 },
  { id: "cust3", name: "Global Solutions", location: "Jabalpur", machineCount: 2 },
  { id: "cust4", name: "Tech Innovators", location: "Indore", machineCount: 4 },
];

// Mock data for machines
const mockMachines = [
  { 
    id: "mach001", 
    customerId: "cust1", 
    customerName: "ABC Technologies",
    model: "Kyocera TASKalfa 2553ci", 
    serialNumber: "KYO2553123456", 
    installDate: "2024-01-15",
    location: "2nd Floor, IT Department",
    status: "Active",
  },
  { 
    id: "mach002", 
    customerId: "cust1", 
    customerName: "ABC Technologies",
    model: "Canon imageRUNNER 2625", 
    serialNumber: "CNR2625789012", 
    installDate: "2024-02-20",
    location: "Reception Area",
    status: "Active",
  },
  { 
    id: "mach003", 
    customerId: "cust2", 
    customerName: "XYZ Corp",
    model: "Ricoh MP 2014AD", 
    serialNumber: "RMP2014345678", 
    installDate: "2023-11-05",
    location: "Accounts Department",
    status: "Active",
  },
  { 
    id: "mach004", 
    customerId: "cust3", 
    customerName: "Global Solutions",
    model: "HP LaserJet M428fdn", 
    serialNumber: "HPLJ428901234", 
    installDate: "2024-03-10",
    location: "Main Office",
    status: "Inactive",
  },
];

// Mock data for part usage
const mockPartUsage = [
  {
    id: "pu001",
    machineId: "mach001",
    customerId: "cust1",
    customerName: "ABC Technologies",
    serialNumber: "KYO2553123456",
    itemId: "item1",
    itemName: "Kyocera TK-8365K Toner Black",
    quantity: 1,
    installedDate: "2025-02-15",
    installedBy: "Rahul Sharma",
    serviceCallId: "SC001",
  },
  {
    id: "pu002",
    machineId: "mach001",
    customerId: "cust1",
    customerName: "ABC Technologies",
    serialNumber: "KYO2553123456",
    itemId: "item2",
    itemName: "Kyocera DK-8315 Drum Unit",
    quantity: 1,
    installedDate: "2024-12-10",
    installedBy: "Amit Patel",
    serviceCallId: "SC002",
  },
  {
    id: "pu003",
    machineId: "mach003",
    customerId: "cust2",
    customerName: "XYZ Corp",
    serialNumber: "RMP2014345678",
    itemId: "item3",
    itemName: "Ricoh SP 200 Toner",
    quantity: 2,
    installedDate: "2025-01-20",
    installedBy: "Pradeep Kumar",
    serviceCallId: "SC003",
  },
];

const MachineParts = () => {
  const [activeTab, setActiveTab] = useState("customers");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  
  // Filter machines by customer ID
  const getCustomerMachines = (customerId: string) => {
    return mockMachines.filter(machine => 
      machine.customerId === customerId &&
      (searchQuery ? 
        machine.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
      : true)
    );
  };
  
  // Filter part usage by machine ID
  const getMachinePartUsage = (machineId: string) => {
    return mockPartUsage.filter(part => 
      part.machineId === machineId &&
      (searchQuery ? 
        part.itemName.toLowerCase().includes(searchQuery.toLowerCase())
      : true)
    );
  };
  
  // Handle recording new part installation
  const handleRecordPart = (machineId: string) => {
    const machine = mockMachines.find(m => m.id === machineId);
    toast.success(`New part recorded for ${machine?.model} (${machine?.serialNumber})`);
  };

  return (
    <Layout>
      <div className="container p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Machine Parts Usage Tracker</h1>
            <p className="text-muted-foreground">
              Track parts installed in customer machines
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="relative grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers, machines, or parts..."
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
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="machines">Machines</TabsTrigger>
            <TabsTrigger value="parts">Parts Usage</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customers" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Customers</CardTitle>
                <CardDescription>
                  Select a customer to view their machines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockCustomers
                    .filter(cust => 
                      searchQuery ? 
                        cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        cust.location.toLowerCase().includes(searchQuery.toLowerCase())
                      : true
                    )
                    .map((customer) => (
                      <Card 
                        key={customer.id}
                        className={`cursor-pointer hover:border-primary transition-colors ${
                          selectedCustomer === customer.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => {
                          setSelectedCustomer(customer.id);
                          setSelectedMachine(null);
                          setActiveTab("machines");
                        }}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">{customer.name}</h3>
                              <p className="text-sm text-muted-foreground">{customer.location}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">
                                  {customer.machineCount} machines
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomer(customer.id);
                                setActiveTab("machines");
                              }}
                            >
                              View Machines
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                  {mockCustomers.filter(cust => 
                    searchQuery ? 
                      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      cust.location.toLowerCase().includes(searchQuery.toLowerCase())
                    : true
                  ).length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No customers found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="machines" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedCustomer ? 
                      `${mockCustomers.find(c => c.id === selectedCustomer)?.name}'s Machines` : 
                      "All Machines"
                    }
                  </CardTitle>
                  <CardDescription>
                    {selectedCustomer ? 
                      `Machines installed at ${mockCustomers.find(c => c.id === selectedCustomer)?.name}` : 
                      "Select a customer from the Customers tab or view all machines"
                    }
                  </CardDescription>
                </div>
                
                {selectedCustomer && (
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setActiveTab("customers")}
                    >
                      Back to Customers
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
                      <TableHead>Customer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Install Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedCustomer ? 
                      getCustomerMachines(selectedCustomer) : 
                      mockMachines.filter(machine => 
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
                        <TableCell>{machine.customerName}</TableCell>
                        <TableCell>{machine.location}</TableCell>
                        <TableCell>{new Date(machine.installDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={machine.status === "Active" ? "success" : "secondary"}>
                            {machine.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedMachine(machine.id);
                                setActiveTab("parts");
                              }}
                            >
                              View Parts
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleRecordPart(machine.id)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Record Part
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {(selectedCustomer ? 
                      getCustomerMachines(selectedCustomer).length === 0 : 
                      mockMachines.filter(machine => 
                        searchQuery ? 
                          machine.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          machine.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          machine.customerName.toLowerCase().includes(searchQuery.toLowerCase())
                        : true
                      ).length === 0
                    ) && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No machines found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="parts" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedMachine ? 
                      `${mockMachines.find(m => m.id === selectedMachine)?.model} (${mockMachines.find(m => m.id === selectedMachine)?.serialNumber})` : 
                      "Machine Parts Usage"
                    }
                  </CardTitle>
                  <CardDescription>
                    {selectedMachine ? 
                      `Parts installed in this machine` : 
                      "Select a machine from the Machines tab first"
                    }
                  </CardDescription>
                </div>
                
                {selectedMachine && (
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm"
                      onClick={() => handleRecordPart(selectedMachine)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add New Part
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
                    {getMachinePartUsage(selectedMachine).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Cpu className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          No parts usage recorded for this machine
                        </p>
                        <Button 
                          className="mt-4"
                          onClick={() => handleRecordPart(selectedMachine)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Record First Part
                        </Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Part Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Installed By</TableHead>
                            <TableHead>Installed Date</TableHead>
                            <TableHead>Service Call</TableHead>
                            <TableHead className="text-right">Age</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getMachinePartUsage(selectedMachine).map((part) => {
                            const installDate = new Date(part.installedDate);
                            const today = new Date();
                            const diffTime = Math.abs(today.getTime() - installDate.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            
                            return (
                              <TableRow key={part.id}>
                                <TableCell className="font-medium">{part.itemName}</TableCell>
                                <TableCell>{part.quantity}</TableCell>
                                <TableCell>{part.installedBy}</TableCell>
                                <TableCell>{new Date(part.installedDate).toLocaleDateString()}</TableCell>
                                <TableCell>{part.serviceCallId}</TableCell>
                                <TableCell className="text-right">
                                  <Badge className="flex items-center gap-1 w-fit ml-auto">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {diffDays} days
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Machine Parts Usage Reports</CardTitle>
                <CardDescription>
                  Analytics and reports for machine parts consumption
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <BarChart2 className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Machine parts usage reports coming soon
                  </p>
                  <p className="text-sm text-muted-foreground text-center max-w-md mt-2">
                    This section will include reports on part consumption by machine model, average part lifespan, and customer-wise part usage statistics.
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

export default MachineParts;
