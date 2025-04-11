
import React, { useState } from "react";
import { Search, Plus, Filter, FileText, Printer, BarChart2, CalendarClock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data for AMC contracts
const mockContracts = [
  {
    id: "amc001",
    customerId: "cust001",
    customerName: "TechSolutions Pvt Ltd",
    machineModel: "Kyocera ECOSYS M2040dn",
    serialNumber: "VKG8401245",
    contractType: "AMC",
    startDate: "2024-01-01",
    endDate: "2025-01-01",
    monthlyRent: 5000,
    gstPercent: 18,
    copyLimit: 20000,
    extraCopyCharge: 0.38,
    billingCycle: "Monthly",
    status: "Active"
  },
  {
    id: "amc002",
    customerId: "cust002",
    customerName: "Global Enterprises",
    machineModel: "Canon iR2625",
    serialNumber: "CNX43215",
    contractType: "Rental",
    startDate: "2024-02-15",
    endDate: "2025-02-15",
    monthlyRent: 7500,
    gstPercent: 18,
    copyLimit: 30000,
    extraCopyCharge: 0.42,
    billingCycle: "Quarterly",
    status: "Active"
  },
  {
    id: "amc003",
    customerId: "cust003",
    customerName: "Sunrise Hospital",
    machineModel: "Kyocera TASKalfa 2553ci",
    serialNumber: "VLK9245678",
    contractType: "AMC",
    startDate: "2024-03-10",
    endDate: "2025-03-10",
    monthlyRent: 12000,
    gstPercent: 18,
    copyLimit: 50000,
    extraCopyCharge: 0.35,
    billingCycle: "Monthly",
    status: "Active"
  }
];

// Mock data for machines on AMC/rental
const mockMachines = [
  {
    id: "machine001",
    contractId: "amc001",
    customerId: "cust001",
    customerName: "TechSolutions Pvt Ltd",
    model: "Kyocera ECOSYS M2040dn",
    serialNumber: "VKG8401245",
    location: "3rd Floor, Admin",
    contractType: "AMC",
    startDate: "2024-01-01",
    endDate: "2025-01-01",
    currentRent: 5000,
    copyLimit: 20000,
    lastMeterReading: 18500,
    lastReadingDate: "2024-03-15"
  },
  {
    id: "machine002",
    contractId: "amc002",
    customerId: "cust002",
    customerName: "Global Enterprises",
    model: "Canon iR2625",
    serialNumber: "CNX43215",
    location: "Reception Area",
    contractType: "Rental",
    startDate: "2024-02-15",
    endDate: "2025-02-15",
    currentRent: 7500,
    copyLimit: 30000,
    lastMeterReading: 25600,
    lastReadingDate: "2024-03-20"
  },
  {
    id: "machine003",
    contractId: "amc003",
    customerId: "cust003",
    customerName: "Sunrise Hospital",
    model: "Kyocera TASKalfa 2553ci",
    serialNumber: "VLK9245678",
    location: "Main Reception",
    contractType: "AMC",
    startDate: "2024-03-10",
    endDate: "2025-03-10",
    currentRent: 12000,
    copyLimit: 50000,
    lastMeterReading: 22300,
    lastReadingDate: "2024-03-25"
  }
];

// Mock data for consumable usage
const mockConsumableUsage = [
  {
    id: "usage001",
    contractId: "amc001",
    machineId: "machine001",
    customerId: "cust001",
    customerName: "TechSolutions Pvt Ltd",
    machineModel: "Kyocera ECOSYS M2040dn",
    serialNumber: "VKG8401245",
    engineerId: "eng001",
    engineerName: "Rajesh Kumar",
    date: "2024-03-10",
    itemId: "item001",
    itemName: "TK-1170 Toner",
    quantity: 1,
    cost: 2500,
    remarks: "Regular replacement"
  },
  {
    id: "usage002",
    contractId: "amc002",
    machineId: "machine002",
    customerId: "cust002",
    customerName: "Global Enterprises",
    machineModel: "Canon iR2625",
    serialNumber: "CNX43215",
    engineerId: "eng002",
    engineerName: "Amit Singh",
    date: "2024-03-15",
    itemId: "item002",
    itemName: "NPG-59 Toner",
    quantity: 1,
    cost: 3200,
    remarks: "Low quality prints reported"
  }
];

// Mock data for monthly meter readings and billing
const mockBillingData = [
  {
    id: "bill001",
    contractId: "amc001",
    machineId: "machine001",
    customerId: "cust001",
    customerName: "TechSolutions Pvt Ltd",
    machineModel: "Kyocera ECOSYS M2040dn",
    serialNumber: "VKG8401245",
    month: "March 2024",
    openingReading: 12500,
    closingReading: 18500,
    totalCopies: 6000,
    freeCopies: 5000,
    extraCopies: 1000,
    extraCopyRate: 0.38,
    extraCopyCharge: 380,
    gstPercent: 18,
    gstAmount: 68.4,
    rent: 5000,
    rentGst: 900,
    totalBill: 6348.4,
    billDate: "2024-03-31",
    billStatus: "Generated",
    invoiceNo: "INV/2024/03/123"
  },
  {
    id: "bill002",
    contractId: "amc002",
    machineId: "machine002",
    customerId: "cust002",
    customerName: "Global Enterprises",
    machineModel: "Canon iR2625",
    serialNumber: "CNX43215",
    month: "March 2024",
    openingReading: 18200,
    closingReading: 25600,
    totalCopies: 7400,
    freeCopies: 7500,
    extraCopies: 0,
    extraCopyRate: 0.42,
    extraCopyCharge: 0,
    gstPercent: 18,
    gstAmount: 0,
    rent: 7500,
    rentGst: 1350,
    totalBill: 8850,
    billDate: "2024-03-31",
    billStatus: "Pending",
    invoiceNo: ""
  }
];

// Mock data for AMC profit/expense report
const mockProfitReports = [
  {
    id: "report001",
    contractId: "amc001",
    machineId: "machine001",
    customerId: "cust001",
    customerName: "TechSolutions Pvt Ltd",
    machineModel: "Kyocera ECOSYS M2040dn",
    serialNumber: "VKG8401245",
    month: "March 2024",
    rentReceived: 5000,
    extraCopyIncome: 380,
    totalIncome: 5380,
    consumablesCost: 2500,
    engineerVisitCost: 800,
    totalExpense: 3300,
    profit: 2080,
    profitMargin: 38.7
  },
  {
    id: "report002",
    contractId: "amc002",
    machineId: "machine002",
    customerId: "cust002",
    customerName: "Global Enterprises",
    machineModel: "Canon iR2625",
    serialNumber: "CNX43215",
    month: "March 2024",
    rentReceived: 7500,
    extraCopyIncome: 0,
    totalIncome: 7500,
    consumablesCost: 3200,
    engineerVisitCost: 500,
    totalExpense: 3700,
    profit: 3800,
    profitMargin: 50.7
  }
];

// Top profitable machines
const topProfitableMachines = [
  {
    id: "machine002",
    customerName: "Global Enterprises",
    machineModel: "Canon iR2625",
    serialNumber: "CNX43215",
    profit: 3800,
    profitMargin: 50.7
  },
  {
    id: "machine001",
    customerName: "TechSolutions Pvt Ltd",
    machineModel: "Kyocera ECOSYS M2040dn",
    serialNumber: "VKG8401245",
    profit: 2080,
    profitMargin: 38.7
  },
  {
    id: "machine003",
    customerName: "Sunrise Hospital",
    machineModel: "Kyocera TASKalfa 2553ci",
    serialNumber: "VLK9245678",
    profit: 1500,
    profitMargin: 30.0
  }
];

const AmcTracker = () => {
  const [activeTab, setActiveTab] = useState<string>("contracts");
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AMC Consumable Tracker</h1>
          <p className="text-muted-foreground">
            Track consumables and manage AMC/Rental contracts
          </p>
        </div>
        <Button className="flex items-center gap-1 bg-black text-white hover:bg-black/90">
          <Plus className="h-4 w-4" />
          New AMC Contract
        </Button>
      </div>

      {/* Search and filter row */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contracts, machines, or consumables..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button variant="outline" className="sm:ml-auto flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="contracts">AMC Contracts</TabsTrigger>
          <TabsTrigger value="machines">Machines</TabsTrigger>
          <TabsTrigger value="consumables">Consumable Usage</TabsTrigger>
          <TabsTrigger value="billing">Monthly Billing</TabsTrigger>
          <TabsTrigger value="reports">Profit Reports</TabsTrigger>
        </TabsList>

        {/* AMC Contracts Tab */}
        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>AMC & Rental Contracts</CardTitle>
              <CardDescription>Manage all customer AMC and rental agreements</CardDescription>
            </CardHeader>
            <CardContent>
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.customerName}</TableCell>
                      <TableCell>{contract.machineModel}</TableCell>
                      <TableCell>
                        <Badge variant={contract.contractType === "AMC" ? "outline" : "secondary"}>
                          {contract.contractType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(contract.startDate).toLocaleDateString()} - 
                        {new Date(contract.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>₹{contract.monthlyRent.toLocaleString()}</TableCell>
                      <TableCell>{contract.copyLimit.toLocaleString()}</TableCell>
                      <TableCell>{contract.billingCycle}</TableCell>
                      <TableCell>
                        <Badge variant="success">{contract.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
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
        <TabsContent value="machines">
          <Card>
            <CardHeader>
              <CardTitle>Machines on AMC/Rental</CardTitle>
              <CardDescription>All machines under active contracts</CardDescription>
            </CardHeader>
            <CardContent>
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMachines.map((machine) => (
                    <TableRow key={machine.id}>
                      <TableCell className="font-medium">{machine.customerName}</TableCell>
                      <TableCell>{machine.model}</TableCell>
                      <TableCell>{machine.serialNumber}</TableCell>
                      <TableCell>{machine.location}</TableCell>
                      <TableCell>
                        <Badge variant={machine.contractType === "AMC" ? "outline" : "secondary"}>
                          {machine.contractType}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{machine.currentRent.toLocaleString()}</TableCell>
                      <TableCell>{machine.copyLimit.toLocaleString()}</TableCell>
                      <TableCell>{machine.lastMeterReading.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
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
        <TabsContent value="consumables">
          <Card>
            <CardHeader>
              <CardTitle>Consumable Usage</CardTitle>
              <CardDescription>Track inventory used on AMC/Rental machines</CardDescription>
            </CardHeader>
            <CardContent>
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
                  {mockConsumableUsage.map((usage) => (
                    <TableRow key={usage.id}>
                      <TableCell>{usage.date}</TableCell>
                      <TableCell className="font-medium">{usage.customerName}</TableCell>
                      <TableCell>{usage.machineModel}</TableCell>
                      <TableCell>{usage.serialNumber}</TableCell>
                      <TableCell>{usage.engineerName}</TableCell>
                      <TableCell>{usage.itemName}</TableCell>
                      <TableCell>{usage.quantity}</TableCell>
                      <TableCell>₹{usage.cost.toLocaleString()}</TableCell>
                      <TableCell>{usage.remarks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 flex justify-end">
                <Button className="bg-black text-white hover:bg-black/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Consumable Usage
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Usage & Billing</CardTitle>
              <CardDescription>Record meter readings and generate invoices</CardDescription>
            </CardHeader>
            <CardContent>
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBillingData.map((billing) => (
                    <TableRow key={billing.id}>
                      <TableCell>{billing.month}</TableCell>
                      <TableCell className="font-medium">{billing.customerName}</TableCell>
                      <TableCell>{billing.machineModel}</TableCell>
                      <TableCell>{billing.openingReading.toLocaleString()}</TableCell>
                      <TableCell>{billing.closingReading.toLocaleString()}</TableCell>
                      <TableCell>{billing.totalCopies.toLocaleString()}</TableCell>
                      <TableCell>{billing.freeCopies.toLocaleString()}</TableCell>
                      <TableCell>{billing.extraCopies.toLocaleString()}</TableCell>
                      <TableCell>₹{billing.extraCopyCharge.toLocaleString()}</TableCell>
                      <TableCell>₹{billing.rent.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">₹{billing.totalBill.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={billing.billStatus === "Generated" ? "success" : "outline"}>
                          {billing.billStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 flex justify-end">
                <Button className="bg-black text-white hover:bg-black/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Meter Reading
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit Reports Tab */}
        <TabsContent value="reports">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total AMC Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹87,450</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-500">↑ 12%</span> from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹42,600</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-red-500">↑ 8%</span> from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹44,850</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-500">↑ 15%</span> from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Profit Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">51.3%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-500">↑ 3%</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mb-6">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>AMC Profit & Expense Report</CardTitle>
                <CardDescription>Machine-wise profit analysis</CardDescription>
              </CardHeader>
              <CardContent>
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
                      <TableHead>Total Expense</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Margin %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockProfitReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.month}</TableCell>
                        <TableCell className="font-medium">{report.customerName}</TableCell>
                        <TableCell>{report.machineModel}</TableCell>
                        <TableCell>₹{report.rentReceived.toLocaleString()}</TableCell>
                        <TableCell>₹{report.extraCopyIncome.toLocaleString()}</TableCell>
                        <TableCell>₹{report.totalIncome.toLocaleString()}</TableCell>
                        <TableCell>₹{report.consumablesCost.toLocaleString()}</TableCell>
                        <TableCell>₹{report.engineerVisitCost.toLocaleString()}</TableCell>
                        <TableCell>₹{report.totalExpense.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">₹{report.profit.toLocaleString()}</TableCell>
                        <TableCell>{report.profitMargin.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="mt-4 flex justify-end space-x-2">
                  <Button variant="outline" className="flex items-center gap-1">
                    <Printer className="h-4 w-4" />
                    Export PDF
                  </Button>
                  <Button className="flex items-center gap-1 bg-black text-white hover:bg-black/90">
                    <BarChart2 className="h-4 w-4" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Profitable AMC Machines</CardTitle>
                <CardDescription>Based on current month data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProfitableMachines.map((machine, index) => (
                    <div key={machine.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{machine.machineModel}</p>
                          <p className="text-xs text-muted-foreground">{machine.customerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">₹{machine.profit.toLocaleString()}</p>
                        <p className="text-xs text-green-500">{machine.profitMargin.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Contract Renewals</CardTitle>
              <CardDescription>AMC contracts ending in next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Machine Model</TableHead>
                    <TableHead>Contract Type</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Current Rent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Dev Enterprises</TableCell>
                    <TableCell>Canon iR2530</TableCell>
                    <TableCell>
                      <Badge variant="outline">AMC</Badge>
                    </TableCell>
                    <TableCell>15-Apr-2025</TableCell>
                    <TableCell>₹4,500</TableCell>
                    <TableCell>
                      <Badge variant="warning">Renewal Due</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <CalendarClock className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AmcTracker;
