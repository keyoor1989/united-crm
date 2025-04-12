
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  Printer 
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Mock data for AMC contracts
const mockContracts = [
  { 
    id: "1", 
    customer: "TechSolutions Pvt Ltd", 
    machineModel: "Kyocera ECOSYS M2040dn", 
    type: "AMC", 
    duration: "1/1/2024 -1/1/2025",
    monthlyRent: 5000,
    copyLimit: 20000,
    billingCycle: "Monthly",
    status: "Active"
  },
  { 
    id: "2", 
    customer: "Global Enterprises", 
    machineModel: "Canon iR2625", 
    type: "Rental", 
    duration: "2/15/2024 -2/15/2025",
    monthlyRent: 7500,
    copyLimit: 30000,
    billingCycle: "Quarterly",
    status: "Active"
  },
  { 
    id: "3", 
    customer: "Sunrise Hospital", 
    machineModel: "Kyocera TASKalfa 2553ci", 
    type: "AMC", 
    duration: "3/10/2024 -3/10/2025",
    monthlyRent: 12000,
    copyLimit: 50000,
    billingCycle: "Monthly",
    status: "Active"
  }
];

// Mock data for machines on AMC/Rental
const mockMachines = [
  { 
    id: "1", 
    customer: "TechSolutions Pvt Ltd", 
    machineModel: "Kyocera ECOSYS M2040dn", 
    serialNumber: "VKG8401245",
    location: "3rd Floor, Admin",
    contractType: "AMC",
    currentRent: 5000,
    copyLimit: 20000,
    lastReading: 18500
  },
  { 
    id: "2", 
    customer: "Global Enterprises", 
    machineModel: "Canon iR2625", 
    serialNumber: "CNX43215",
    location: "Reception Area",
    contractType: "Rental",
    currentRent: 7500,
    copyLimit: 30000,
    lastReading: 25600
  },
  { 
    id: "3", 
    customer: "Sunrise Hospital", 
    machineModel: "Kyocera TASKalfa 2553ci", 
    serialNumber: "VLK9245678",
    location: "Main Reception",
    contractType: "AMC",
    currentRent: 12000,
    copyLimit: 50000,
    lastReading: 22300
  }
];

// Mock data for consumable usage
const mockConsumablesUsage = [
  { 
    id: "1", 
    date: "2024-03-10",
    customer: "TechSolutions Pvt Ltd", 
    machine: "Kyocera ECOSYS M2040dn", 
    serialNumber: "VKG8401245",
    engineer: "Rajesh Kumar",
    consumable: "TK-1170 Toner",
    quantity: 1,
    cost: 2500,
    remarks: "Regular replacement"
  },
  { 
    id: "2", 
    date: "2024-03-15",
    customer: "Global Enterprises", 
    machine: "Canon iR2625", 
    serialNumber: "CNX43215",
    engineer: "Amit Singh",
    consumable: "NPG-59 Toner",
    quantity: 1,
    cost: 3200,
    remarks: "Low quality prints reported"
  }
];

// Mock data for monthly billing
const mockBillingEntries = [
  { 
    id: "1", 
    month: "March 2024",
    customer: "TechSolutions Pvt Ltd", 
    machine: "Kyocera ECOSYS M2040dn", 
    openingReading: 12500,
    closingReading: 18500,
    totalCopies: 6000,
    freeCopies: 5000,
    extraCopies: 1000,
    extraCharges: 380,
    rent: 5000,
    totalBill: 6348.4,
    status: "Generated"
  },
  { 
    id: "2", 
    month: "March 2024",
    customer: "Global Enterprises", 
    machine: "Canon iR2625", 
    openingReading: 18200,
    closingReading: 25600,
    totalCopies: 7400,
    freeCopies: 7500,
    extraCopies: 0,
    extraCharges: 0,
    rent: 7500,
    totalBill: 8850,
    status: "Pending"
  }
];

// Mock data for profit reports
const mockProfitData = [
  { 
    id: "1", 
    month: "March 2024",
    customer: "TechSolutions Pvt Ltd", 
    machine: "Kyocera ECOSYS M2040dn", 
    rent: 5000,
    extraCopyIncome: 380,
    totalIncome: 5380,
    consumablesCost: 2500,
    engineerVisits: 800,
    profit: 2080,
    margin: 38.7
  }
];

const mockTopMachines = [
  {
    id: "1",
    rank: 1,
    machine: "Canon iR2625",
    customer: "Global Enterprises",
    profit: 3800,
    margin: 50.7
  },
  {
    id: "2",
    rank: 2,
    machine: "Kyocera ECOSYS M2040dn",
    customer: "TechSolutions Pvt Ltd",
    profit: 2080,
    margin: 38.7
  },
  {
    id: "3",
    rank: 3,
    machine: "Kyocera TASKalfa 2553ci",
    customer: "Sunrise Hospital",
    profit: 1500,
    margin: 30.0
  }
];

const AmcConsumables = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("amc-contracts");
  const [isAddContractOpen, setIsAddContractOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AMC Consumable Tracker</h1>
          <p className="text-muted-foreground">
            Track consumables and manage AMC/Rental contracts
          </p>
        </div>
        <Dialog open={isAddContractOpen} onOpenChange={setIsAddContractOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1 bg-black hover:bg-gray-800">
              <Plus className="h-4 w-4" />
              Add New Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New AMC/Rental Contract</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="customer" className="text-sm font-medium">Customer</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="techsolutions">TechSolutions Pvt Ltd</SelectItem>
                      <SelectItem value="global">Global Enterprises</SelectItem>
                      <SelectItem value="sunrise">Sunrise Hospital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="machine" className="text-sm font-medium">Machine Model</label>
                  <Input placeholder="e.g. Kyocera ECOSYS M2040dn" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="serial" className="text-sm font-medium">Serial Number</label>
                  <Input placeholder="e.g. VKG8401245" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-medium">Contract Type</label>
                  <Select defaultValue="AMC">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AMC">AMC</SelectItem>
                      <SelectItem value="Rental">Rental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="start" className="text-sm font-medium">Start Date</label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="end" className="text-sm font-medium">End Date</label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="rent" className="text-sm font-medium">Monthly Rent (₹)</label>
                  <Input type="number" min="0" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="gst" className="text-sm font-medium">GST %</label>
                  <Input type="number" defaultValue="18" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="free" className="text-sm font-medium">Free Copy Limit</label>
                  <Input type="number" min="0" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="charge" className="text-sm font-medium">Extra Copy Charge (₹)</label>
                  <Input type="number" min="0" step="0.01" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="cycle" className="text-sm font-medium">Billing Cycle</label>
                  <Select defaultValue="monthly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                className="bg-black hover:bg-gray-800"
                onClick={() => setIsAddContractOpen(false)}
              >
                Save Contract
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contracts, machines, or consumables..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="ml-4">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/50 w-full justify-start">
          <TabsTrigger value="amc-contracts" className="flex-1 data-[state=active]:bg-white">AMC Contracts</TabsTrigger>
          <TabsTrigger value="machines" className="flex-1 data-[state=active]:bg-white">Machines</TabsTrigger>
          <TabsTrigger value="consumables" className="flex-1 data-[state=active]:bg-white">Consumable Usage</TabsTrigger>
          <TabsTrigger value="billing" className="flex-1 data-[state=active]:bg-white">Monthly Billing</TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 data-[state=active]:bg-white">Profit Reports</TabsTrigger>
        </TabsList>

        {/* AMC Contracts Tab */}
        <TabsContent value="amc-contracts" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">AMC & Rental Contracts</h2>
                <p className="text-muted-foreground">Manage all customer AMC and rental agreements</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Machine Model</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Monthly Rent</TableHead>
                    <TableHead>Copy Limit</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.customer}</TableCell>
                      <TableCell>{contract.machineModel}</TableCell>
                      <TableCell>
                        <Badge variant={contract.type === "AMC" ? "default" : "secondary"}>
                          {contract.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{contract.duration}</TableCell>
                      <TableCell>₹{contract.monthlyRent.toLocaleString()}</TableCell>
                      <TableCell>{contract.copyLimit.toLocaleString()}</TableCell>
                      <TableCell>{contract.billingCycle}</TableCell>
                      <TableCell>
                        <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100">
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Machines Tab */}
        <TabsContent value="machines" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Machines on AMC/Rental</h2>
                <p className="text-muted-foreground">All machines under active contracts</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Machine Model</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contract Type</TableHead>
                    <TableHead>Current Rent</TableHead>
                    <TableHead>Copy Limit</TableHead>
                    <TableHead>Last Reading</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMachines.map((machine) => (
                    <TableRow key={machine.id}>
                      <TableCell className="font-medium">{machine.customer}</TableCell>
                      <TableCell>{machine.machineModel}</TableCell>
                      <TableCell>{machine.serialNumber}</TableCell>
                      <TableCell>{machine.location}</TableCell>
                      <TableCell>
                        <Badge variant={machine.contractType === "AMC" ? "default" : "secondary"}>
                          {machine.contractType}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{machine.currentRent.toLocaleString()}</TableCell>
                      <TableCell>{machine.copyLimit.toLocaleString()}</TableCell>
                      <TableCell>{machine.lastReading.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consumable Usage Tab */}
        <TabsContent value="consumables" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Consumable Usage</h2>
                  <p className="text-muted-foreground">Track inventory used on AMC/Rental machines</p>
                </div>
                <Button className="bg-black hover:bg-gray-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Consumable Usage
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Engineer</TableHead>
                    <TableHead>Consumable</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockConsumablesUsage.map((usage) => (
                    <TableRow key={usage.id}>
                      <TableCell>{new Date(usage.date).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell className="font-medium">{usage.customer}</TableCell>
                      <TableCell>{usage.machine}</TableCell>
                      <TableCell>{usage.serialNumber}</TableCell>
                      <TableCell>{usage.engineer}</TableCell>
                      <TableCell>{usage.consumable}</TableCell>
                      <TableCell>{usage.quantity}</TableCell>
                      <TableCell>₹{usage.cost.toLocaleString()}</TableCell>
                      <TableCell>{usage.remarks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Billing Tab */}
        <TabsContent value="billing" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Monthly Usage & Billing</h2>
                  <p className="text-muted-foreground">Record meter readings and generate invoices</p>
                </div>
                <Button className="bg-black hover:bg-gray-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Meter Reading
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>Opening Reading</TableHead>
                    <TableHead>Closing Reading</TableHead>
                    <TableHead>Total Copies</TableHead>
                    <TableHead>Free Copies</TableHead>
                    <TableHead>Extra Copies</TableHead>
                    <TableHead>Extra Charges</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Total Bill</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBillingEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.month}</TableCell>
                      <TableCell className="font-medium">{entry.customer}</TableCell>
                      <TableCell>{entry.machine}</TableCell>
                      <TableCell>{entry.openingReading.toLocaleString()}</TableCell>
                      <TableCell>{entry.closingReading.toLocaleString()}</TableCell>
                      <TableCell>{entry.totalCopies.toLocaleString()}</TableCell>
                      <TableCell>{entry.freeCopies.toLocaleString()}</TableCell>
                      <TableCell>{entry.extraCopies.toLocaleString()}</TableCell>
                      <TableCell>₹{entry.extraCharges}</TableCell>
                      <TableCell>₹{entry.rent.toLocaleString()}</TableCell>
                      <TableCell>₹{entry.totalBill.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={entry.status === "Generated" ? "success" : "outline"}
                          className={entry.status === "Generated" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                        >
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Printer className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit Reports Tab */}
        <TabsContent value="reports" className="mt-4">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <Card className="p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total AMC Revenue</h3>
              <div className="text-2xl font-bold">₹87,450</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <span className="mr-1">↑</span>
                <span>12% from last month</span>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Expenses</h3>
              <div className="text-2xl font-bold">₹42,600</div>
              <div className="flex items-center text-xs text-red-600 mt-1">
                <span className="mr-1">↑</span>
                <span>8% from last month</span>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Net Profit</h3>
              <div className="text-2xl font-bold">₹44,850</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <span className="mr-1">↑</span>
                <span>15% from last month</span>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Average Profit Margin</h3>
              <div className="text-2xl font-bold">51.3%</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <span className="mr-1">↑</span>
                <span>3% from last month</span>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardContent className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">AMC Profit & Expense Report</h2>
                  <p className="text-muted-foreground">Machine-wise profit analysis</p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Machine</TableHead>
                      <TableHead>Rent</TableHead>
                      <TableHead>Extra Copy Income</TableHead>
                      <TableHead>Total Income</TableHead>
                      <TableHead>Consumables Cost</TableHead>
                      <TableHead>Engineer Visits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockProfitData.map((data) => (
                      <TableRow key={data.id}>
                        <TableCell>{data.month}</TableCell>
                        <TableCell className="font-medium">{data.customer}</TableCell>
                        <TableCell>{data.machine}</TableCell>
                        <TableCell>₹{data.rent.toLocaleString()}</TableCell>
                        <TableCell>₹{data.extraCopyIncome}</TableCell>
                        <TableCell>₹{data.totalIncome.toLocaleString()}</TableCell>
                        <TableCell>₹{data.consumablesCost.toLocaleString()}</TableCell>
                        <TableCell>₹{data.engineerVisits}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">Top 5 Profitable AMC Machines</h2>
                  <p className="text-muted-foreground">Based on current month data</p>
                </div>
                <div className="space-y-4">
                  {mockTopMachines.map((machine) => (
                    <div key={machine.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                          {machine.rank}
                        </div>
                        <div>
                          <p className="font-medium">{machine.machine}</p>
                          <p className="text-sm text-muted-foreground">{machine.customer}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{machine.profit.toLocaleString()}</p>
                        <p className="text-sm text-green-600">{machine.margin}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AmcConsumables;
