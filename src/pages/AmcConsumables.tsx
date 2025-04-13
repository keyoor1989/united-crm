
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Printer,
  Plus,
  Calendar,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Mock data for AMC Consumable Usage
const mockConsumableUsage = [
  {
    id: "1",
    date: "2023-04-10",
    customerName: "Acme Corporation",
    serialNumber: "XC-4850-1234",
    machineModel: "HP LaserJet Pro M404n",
    machineType: "Printer",
    department: "Finance",
    itemName: "Toner Cartridge",
    quantity: 1,
    cost: 3500,
    engineerName: "Rajesh Kumar",
    remarks: "Regular replacement"
  },
  {
    id: "2",
    date: "2023-04-12",
    customerName: "Tech Solutions Ltd",
    serialNumber: "XP-1120-5678",
    machineModel: "Canon ImageCLASS MF644Cdw",
    machineType: "Multifunction",
    department: "HR",
    itemName: "Black Toner",
    quantity: 1,
    cost: 4200,
    engineerName: "Suresh Patel",
    remarks: "Customer reported low quality prints"
  },
  {
    id: "3",
    date: "2023-04-15",
    customerName: "Global Enterprises",
    serialNumber: "MC-3390-9012",
    machineModel: "Xerox WorkCentre 6515",
    machineType: "Multifunction",
    department: "Marketing",
    itemName: "Drum Unit",
    quantity: 1,
    cost: 5500,
    engineerName: "Ankit Singh",
    remarks: "Preventive maintenance"
  },
  {
    id: "4",
    date: "2023-04-18",
    customerName: "Acme Corporation",
    serialNumber: "XC-4850-1234",
    machineModel: "HP LaserJet Pro M404n",
    machineType: "Printer",
    department: "Finance",
    itemName: "Fuser Assembly",
    quantity: 1,
    cost: 7800,
    engineerName: "Rajesh Kumar",
    remarks: "Replaced due to paper jams"
  },
  {
    id: "5",
    date: "2023-04-20",
    customerName: "Innovative Systems",
    serialNumber: "IR-5580-3456",
    machineModel: "Ricoh MP 2555SP",
    machineType: "Copier",
    department: "Admin",
    itemName: "Cyan Toner",
    quantity: 1,
    cost: 3200,
    engineerName: "Vivek Sharma",
    remarks: "Regular replacement"
  },
  {
    id: "6",
    date: "2023-04-22",
    customerName: "Tech Solutions Ltd",
    serialNumber: "XP-1120-5678",
    machineModel: "Canon ImageCLASS MF644Cdw",
    machineType: "Multifunction",
    department: "HR",
    itemName: "Magenta Toner",
    quantity: 1,
    cost: 4200,
    engineerName: "Suresh Patel",
    remarks: "Low toner warning"
  },
  {
    id: "7",
    date: "2023-04-25",
    customerName: "Global Enterprises",
    serialNumber: "MC-3390-9012",
    machineModel: "Xerox WorkCentre 6515",
    machineType: "Multifunction",
    department: "Marketing",
    itemName: "Yellow Toner",
    quantity: 1,
    cost: 4200,
    engineerName: "Ankit Singh",
    remarks: "Customer requested replacement"
  },
  {
    id: "8",
    date: "2023-04-28",
    customerName: "Innovative Systems",
    serialNumber: "IR-5580-3456",
    machineModel: "Ricoh MP 2555SP",
    machineType: "Copier",
    department: "Admin",
    itemName: "Paper Feed Roller",
    quantity: 2,
    cost: 1800,
    engineerName: "Vivek Sharma",
    remarks: "Multiple paper jam incidents"
  }
];

// Mock contracts data
const mockContracts = [
  {
    id: "1",
    customerName: "Acme Corporation",
    machineModel: "HP LaserJet Pro M404n",
    serialNumber: "XC-4850-1234",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    monthlyRent: 5000,
    copyLimitA4: 5000,
    extraA4CopyCharge: 0.50,
    contractType: "Full Service",
    department: "Finance",
    status: "Active"
  },
  {
    id: "2",
    customerName: "Tech Solutions Ltd",
    machineModel: "Canon ImageCLASS MF644Cdw",
    serialNumber: "XP-1120-5678",
    startDate: "2023-02-15",
    endDate: "2024-02-14",
    monthlyRent: 7500,
    copyLimitA4: 8000,
    extraA4CopyCharge: 0.65,
    contractType: "Full Service",
    department: "HR",
    status: "Active"
  },
  {
    id: "3",
    customerName: "Global Enterprises",
    machineModel: "Xerox WorkCentre 6515",
    serialNumber: "MC-3390-9012",
    startDate: "2023-03-01",
    endDate: "2024-02-28",
    monthlyRent: 9000,
    copyLimitA4: 10000,
    extraA4CopyCharge: 0.70,
    contractType: "Full Service",
    department: "Marketing",
    status: "Active"
  },
  {
    id: "4",
    customerName: "Innovative Systems",
    machineModel: "Ricoh MP 2555SP",
    serialNumber: "IR-5580-3456",
    startDate: "2023-01-15",
    endDate: "2023-12-31",
    monthlyRent: 8500,
    copyLimitA4: 9500,
    extraA4CopyCharge: 0.65,
    contractType: "Full Service",
    department: "Admin",
    status: "Active"
  },
  {
    id: "5",
    customerName: "Smart Solutions",
    machineModel: "Brother MFC-L8900CDW",
    serialNumber: "BR-8900-7890",
    startDate: "2023-02-01",
    endDate: "2024-01-31",
    monthlyRent: 6500,
    copyLimitA4: 7000,
    extraA4CopyCharge: 0.60,
    contractType: "Toner Only",
    department: "Sales",
    status: "On Hold"
  }
];

const AmcConsumables = () => {
  const [selectedTab, setSelectedTab] = useState("usage");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Filter for consumable usage
  const filteredUsage = mockConsumableUsage.filter(item => {
    const matchesSearch = item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.machineModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCustomer = selectedCustomer === "all" || item.customerName === selectedCustomer;
    
    return matchesSearch && matchesCustomer;
  });

  // Get unique customer names
  const customers = [...new Set(mockConsumableUsage.map(item => item.customerName))];

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">AMC Consumables Tracker</h1>
          <p className="text-muted-foreground">
            Track and manage consumables used for AMC contracts
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Select Date Range
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Record Consumable Usage
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>AMC Consumables Management</CardTitle>
              <CardDescription>
                Monitor and track consumable usage across all AMC contracts
              </CardDescription>
            </div>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full sm:w-auto">
              <TabsList className="bg-muted">
                <TabsTrigger value="usage">Usage History</TabsTrigger>
                <TabsTrigger value="contracts">AMC Contracts</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex flex-1 gap-3">
              <Input
                placeholder="Search by customer, machine, or item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer} value={customer}>
                      {customer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsContent value="usage" className="mt-0">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Machine</TableHead>
                      <TableHead>Serial No.</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Cost (₹)</TableHead>
                      <TableHead>Engineer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsage.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Printer className="h-8 w-8 mb-2" />
                            <p>No consumable usage records found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsage.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>
                            <div className="font-medium">{item.customerName}</div>
                            <div className="text-xs text-muted-foreground">{item.department}</div>
                          </TableCell>
                          <TableCell>
                            <div>{item.machineModel}</div>
                            <div className="text-xs text-muted-foreground">{item.machineType}</div>
                          </TableCell>
                          <TableCell>{item.serialNumber}</TableCell>
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.cost.toLocaleString()}</TableCell>
                          <TableCell>{item.engineerName}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="contracts" className="mt-0">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Machine</TableHead>
                      <TableHead>Serial No.</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Monthly Rent</TableHead>
                      <TableHead>Copy Limit</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockContracts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Printer className="h-8 w-8 mb-2" />
                            <p>No AMC contracts found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      mockContracts.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell>
                            <div className="font-medium">{contract.customerName}</div>
                            <div className="text-xs text-muted-foreground">{contract.department}</div>
                          </TableCell>
                          <TableCell>{contract.machineModel}</TableCell>
                          <TableCell>{contract.serialNumber}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {contract.startDate.split('-')[0]}-{contract.endDate.split('-')[0]}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {contract.startDate} - {contract.endDate}
                            </div>
                          </TableCell>
                          <TableCell>₹{contract.monthlyRent.toLocaleString()}</TableCell>
                          <TableCell>
                            <div>{contract.copyLimitA4.toLocaleString()} A4</div>
                            <div className="text-xs text-muted-foreground">
                              ₹{contract.extraA4CopyCharge} per extra copy
                            </div>
                          </TableCell>
                          <TableCell>{contract.contractType}</TableCell>
                          <TableCell>
                            <Badge variant={contract.status === "Active" ? "success" : "secondary"}>
                              {contract.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AmcConsumables;
