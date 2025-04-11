
import React, { useState, useEffect } from "react";
import { Search, Plus, Filter, FileText, Printer, BarChart2, CalendarClock, Edit, Trash, File, Download } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  AMCContract, 
  AMCMachine, 
  AMCConsumableUsage, 
  AMCBilling, 
  AMCProfitReport,
  ProfitableMachine 
} from "@/types/inventory";
import AddContractDialog from "@/components/inventory/amc/AddContractDialog";
import AddConsumableUsageDialog from "@/components/inventory/amc/AddConsumableUsageDialog";
import AddMeterReadingDialog from "@/components/inventory/amc/AddMeterReadingDialog";

// Mock data for AMC contracts
const initialContracts: AMCContract[] = [
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
const initialMachines: AMCMachine[] = [
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
const initialConsumableUsage: AMCConsumableUsage[] = [
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
const initialBillingData: AMCBilling[] = [
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
const initialProfitReports: AMCProfitReport[] = [
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
const initialProfitableMachines: ProfitableMachine[] = [
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
  
  // State for our data
  const [contracts, setContracts] = useState<AMCContract[]>(initialContracts);
  const [machines, setMachines] = useState<AMCMachine[]>(initialMachines);
  const [consumableUsage, setConsumableUsage] = useState<AMCConsumableUsage[]>(initialConsumableUsage);
  const [billingData, setBillingData] = useState<AMCBilling[]>(initialBillingData);
  const [profitReports, setProfitReports] = useState<AMCProfitReport[]>(initialProfitReports);
  const [profitableMachines, setProfitableMachines] = useState<ProfitableMachine[]>(initialProfitableMachines);
  
  // Summary metrics
  const [summaryMetrics, setSummaryMetrics] = useState({
    totalRevenue: 87450,
    totalExpenses: 42600,
    netProfit: 44850,
    profitMargin: 51.3
  });
  
  // Function to add a new contract
  const handleAddContract = (newContract: AMCContract) => {
    setContracts(prevContracts => [...prevContracts, newContract]);
    
    // Also add the machine to the machines list
    const newMachine: AMCMachine = {
      id: `machine${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
      contractId: newContract.id,
      customerId: newContract.customerId,
      customerName: newContract.customerName,
      model: newContract.machineModel,
      serialNumber: newContract.serialNumber,
      location: "Main Office", // Default location
      contractType: newContract.contractType,
      startDate: newContract.startDate,
      endDate: newContract.endDate,
      currentRent: newContract.monthlyRent,
      copyLimit: newContract.copyLimit,
      lastMeterReading: 0,
      lastReadingDate: new Date().toISOString().split('T')[0]
    };
    
    setMachines(prevMachines => [...prevMachines, newMachine]);
  };
  
  // Function to add consumable usage
  const handleAddConsumableUsage = (newUsage: AMCConsumableUsage) => {
    setConsumableUsage(prevUsage => [...prevUsage, newUsage]);
    
    // Auto-generate a profit report entry or update existing one
    const existingReportIndex = profitReports.findIndex(
      report => report.machineId === newUsage.machineId && report.month.includes(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }))
    );
    
    if (existingReportIndex > -1) {
      // Update existing report
      const updatedReports = [...profitReports];
      const report = updatedReports[existingReportIndex];
      
      // Update consumables cost and recalculate
      const newConsumablesCost = report.consumablesCost + newUsage.cost;
      const newTotalExpense = newConsumablesCost + report.engineerVisitCost;
      const newProfit = report.totalIncome - newTotalExpense;
      const newProfitMargin = (newProfit / report.totalIncome) * 100;
      
      updatedReports[existingReportIndex] = {
        ...report,
        consumablesCost: newConsumablesCost,
        totalExpense: newTotalExpense,
        profit: newProfit,
        profitMargin: newProfitMargin
      };
      
      setProfitReports(updatedReports);
    } else {
      // Create a new report
      const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      const contract = contracts.find(c => c.id === newUsage.contractId);
      
      if (contract) {
        const newReport: AMCProfitReport = {
          id: `report${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
          contractId: newUsage.contractId,
          machineId: newUsage.machineId,
          customerId: newUsage.customerId,
          customerName: newUsage.customerName,
          machineModel: newUsage.machineModel,
          serialNumber: newUsage.serialNumber,
          month: currentMonth,
          rentReceived: contract.monthlyRent,
          extraCopyIncome: 0, // Will be updated when billing is done
          totalIncome: contract.monthlyRent,
          consumablesCost: newUsage.cost,
          engineerVisitCost: 0,
          totalExpense: newUsage.cost,
          profit: contract.monthlyRent - newUsage.cost,
          profitMargin: ((contract.monthlyRent - newUsage.cost) / contract.monthlyRent) * 100
        };
        
        setProfitReports(prevReports => [...prevReports, newReport]);
      }
    }
    
    // Update summary metrics
    setSummaryMetrics(prev => ({
      ...prev,
      totalExpenses: prev.totalExpenses + newUsage.cost,
      netProfit: prev.totalRevenue - (prev.totalExpenses + newUsage.cost),
      profitMargin: ((prev.totalRevenue - (prev.totalExpenses + newUsage.cost)) / prev.totalRevenue) * 100
    }));
  };
  
  // Function to add meter reading and generate billing
  const handleAddMeterReading = (newBilling: AMCBilling) => {
    setBillingData(prevBilling => [...prevBilling, newBilling]);
    
    // Update the machine's last meter reading
    const updatedMachines = machines.map(machine => 
      machine.id === newBilling.machineId 
        ? { 
            ...machine, 
            lastMeterReading: newBilling.closingReading,
            lastReadingDate: newBilling.billDate
          } 
        : machine
    );
    setMachines(updatedMachines);
    
    // Update profit reports if there are extra copies
    if (newBilling.extraCopies > 0) {
      const existingReportIndex = profitReports.findIndex(
        report => report.machineId === newBilling.machineId && report.month === newBilling.month
      );
      
      if (existingReportIndex > -1) {
        // Update existing report
        const updatedReports = [...profitReports];
        const report = updatedReports[existingReportIndex];
        
        // Update income and recalculate
        const newExtraCopyIncome = newBilling.extraCopyCharge;
        const newTotalIncome = report.rentReceived + newExtraCopyIncome;
        const newProfit = newTotalIncome - report.totalExpense;
        const newProfitMargin = (newProfit / newTotalIncome) * 100;
        
        updatedReports[existingReportIndex] = {
          ...report,
          extraCopyIncome: newExtraCopyIncome,
          totalIncome: newTotalIncome,
          profit: newProfit,
          profitMargin: newProfitMargin
        };
        
        setProfitReports(updatedReports);
      } else {
        // Create a new report
        const contract = contracts.find(c => c.id === newBilling.contractId);
        
        if (contract) {
          const newReport: AMCProfitReport = {
            id: `report${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            contractId: newBilling.contractId,
            machineId: newBilling.machineId,
            customerId: newBilling.customerId,
            customerName: newBilling.customerName,
            machineModel: newBilling.machineModel,
            serialNumber: newBilling.serialNumber,
            month: newBilling.month,
            rentReceived: contract.monthlyRent,
            extraCopyIncome: newBilling.extraCopyCharge,
            totalIncome: contract.monthlyRent + newBilling.extraCopyCharge,
            consumablesCost: 0, // Will be updated when consumables are used
            engineerVisitCost: 0,
            totalExpense: 0,
            profit: contract.monthlyRent + newBilling.extraCopyCharge,
            profitMargin: 100 // 100% profit initially since no expenses yet
          };
          
          setProfitReports(prevReports => [...prevReports, newReport]);
        }
      }
      
      // Update summary metrics
      setSummaryMetrics(prev => {
        const newRevenue = prev.totalRevenue + newBilling.extraCopyCharge;
        const newProfit = newRevenue - prev.totalExpenses;
        return {
          totalRevenue: newRevenue,
          totalExpenses: prev.totalExpenses,
          netProfit: newProfit,
          profitMargin: (newProfit / newRevenue) * 100
        };
      });
    }
    
    // Update profitable machines list
    updateProfitableMachines();
  };
  
  // Function to update the list of profitable machines
  const updateProfitableMachines = () => {
    // Group profit reports by machine and calculate total profit
    const machineProfits: Record<string, ProfitableMachine> = {};
    
    profitReports.forEach(report => {
      if (!machineProfits[report.machineId]) {
        machineProfits[report.machineId] = {
          id: report.machineId,
          customerName: report.customerName,
          machineModel: report.machineModel,
          serialNumber: report.serialNumber,
          profit: 0,
          profitMargin: 0
        };
      }
      
      machineProfits[report.machineId].profit += report.profit;
      // Average profit margin across all reports for this machine
      machineProfits[report.machineId].profitMargin = 
        (machineProfits[report.machineId].profitMargin + report.profitMargin) / 2;
    });
    
    // Sort machines by profit and take top 5
    const sortedMachines = Object.values(machineProfits)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
    
    setProfitableMachines(sortedMachines);
  };
  
  // Function to generate a PDF invoice
  const generateInvoice = (billing: AMCBilling) => {
    toast.success(`Invoice generated for ${billing.customerName}`);
    
    // In a real application, this would generate a PDF
    // For now, we'll just update the status
    const updatedBillingData = billingData.map(bill => 
      bill.id === billing.id 
        ? { 
            ...bill, 
            billStatus: "Generated" as const,
            invoiceNo: bill.invoiceNo || `INV/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${bill.id.substring(4)}`
          }
        : bill
    );
    
    setBillingData(updatedBillingData);
  };
  
  // Function to print an invoice
  const printInvoice = (billing: AMCBilling) => {
    if (!billing.invoiceNo) {
      toast.error("Please generate an invoice first");
      return;
    }
    
    toast.success(`Printing invoice ${billing.invoiceNo} for ${billing.customerName}`);
    // In a real app, this would open a print dialog with the invoice PDF
  };
  
  // Function to generate a profit report
  const generateProfitReport = () => {
    toast.success("Profit report generated successfully");
    // In a real app, this would generate a detailed profit report
  };
  
  // Filter function for search across all tabs
  const filterItems = (items: any[], query: string) => {
    if (!query) return items;
    
    return items.filter(item => 
      Object.values(item).some(value => 
        value !== null && 
        value !== undefined &&
        value.toString().toLowerCase().includes(query.toLowerCase())
      )
    );
  };
  
  // Filtered data based on search query
  const filteredContracts = filterItems(contracts, searchQuery);
  const filteredMachines = filterItems(machines, searchQuery);
  const filteredUsage = filterItems(consumableUsage, searchQuery);
  const filteredBilling = filterItems(billingData, searchQuery);
  const filteredReports = filterItems(profitReports, searchQuery);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AMC Consumable Tracker</h1>
          <p className="text-muted-foreground">
            Track consumables and manage AMC/Rental contracts
          </p>
        </div>
        <AddContractDialog onContractAdded={handleAddContract} />
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
                  {filteredContracts.map((contract) => (
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Contract
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="h-4 w-4 mr-2" />
                              Print Contract
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <File className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                  {filteredMachines.map((machine) => (
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setActiveTab("billing")}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Meter Reading
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Machine
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <File className="h-4 w-4 mr-2" />
                              View History
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                  {filteredUsage.map((usage) => (
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
                <AddConsumableUsageDialog onUsageAdded={handleAddConsumableUsage} />
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
                  {filteredBilling.map((billing) => (
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
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => generateInvoice(billing)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => printInvoice(billing)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 flex justify-end">
                <AddMeterReadingDialog onReadingAdded={handleAddMeterReading} />
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
                <div className="text-2xl font-bold">₹{summaryMetrics.totalRevenue.toLocaleString()}</div>
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
                <div className="text-2xl font-bold">₹{summaryMetrics.totalExpenses.toLocaleString()}</div>
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
                <div className="text-2xl font-bold">₹{summaryMetrics.netProfit.toLocaleString()}</div>
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
                <div className="text-2xl font-bold">{summaryMetrics.profitMargin.toFixed(1)}%</div>
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
                    {filteredReports.map((report) => (
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
                    <Download className="h-4 w-4" />
                    Export PDF
                  </Button>
                  <Button 
                    className="flex items-center gap-1 bg-black text-white hover:bg-black/90"
                    onClick={generateProfitReport}
                  >
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
                  {profitableMachines.map((machine, index) => (
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
