import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileSpreadsheet, 
  FileText, 
  Mail, 
  Download, 
  Share2, 
  Filter,
  Printer
} from "lucide-react";
import { exportToCsv, exportToPdf } from "@/utils/exportUtils";

interface MachineRentalData {
  id: string;
  customerName: string;
  machineDetails: string;
  serialNo: string;
  location: string;
  billingCycle: "Monthly" | "Quarterly" | "Annually";
  rentAmount: number;
  gstAmount: number;
  copiesUsed: number;
  extraCopies: number;
  extraCharges: number;
  tonerCosts: number;
  partCosts: number;
  engineerVisits: number;
  netProfit: number;
  profitMargin: number;
}

const sampleRentalData: MachineRentalData[] = [
  {
    id: "1",
    customerName: "ABC Corporation",
    machineDetails: "Canon IR2525",
    serialNo: "IR2525-78945",
    location: "Indore HQ",
    billingCycle: "Monthly",
    rentAmount: 5000,
    gstAmount: 900,
    copiesUsed: 15000,
    extraCopies: 2000,
    extraCharges: 1000,
    tonerCosts: 1200,
    partCosts: 500,
    engineerVisits: 2,
    netProfit: 4300,
    profitMargin: 72.88
  },
  {
    id: "2",
    customerName: "XYZ Ltd",
    machineDetails: "Ricoh MP2014",
    serialNo: "MP2014-12345",
    location: "Bhopal Office",
    billingCycle: "Quarterly",
    rentAmount: 12000,
    gstAmount: 2160,
    copiesUsed: 28000,
    extraCopies: 3000,
    extraCharges: 1500,
    tonerCosts: 2500,
    partCosts: 800,
    engineerVisits: 3,
    netProfit: 10200,
    profitMargin: 73.91
  },
  {
    id: "3",
    customerName: "Global Solutions",
    machineDetails: "Konica C308",
    serialNo: "C308-54321",
    location: "Jabalpur Office",
    billingCycle: "Monthly",
    rentAmount: 8000,
    gstAmount: 1440,
    copiesUsed: 22000,
    extraCopies: 0,
    extraCharges: 0,
    tonerCosts: 2800,
    partCosts: 1200,
    engineerVisits: 1,
    netProfit: 4000,
    profitMargin: 42.55
  },
  {
    id: "4",
    customerName: "Tech Innovators",
    machineDetails: "HP M725",
    serialNo: "M725-98765",
    location: "Indore HQ",
    billingCycle: "Monthly",
    rentAmount: 6500,
    gstAmount: 1170,
    copiesUsed: 18000,
    extraCopies: 1500,
    extraCharges: 750,
    tonerCosts: 1800,
    partCosts: 300,
    engineerVisits: 2,
    netProfit: 5150,
    profitMargin: 69.12
  },
  {
    id: "5",
    customerName: "Educational Institute",
    machineDetails: "Canon IR4545",
    serialNo: "IR4545-67890",
    location: "Bhopal Office",
    billingCycle: "Quarterly",
    rentAmount: 15000,
    gstAmount: 2700,
    copiesUsed: 45000,
    extraCopies: 5000,
    extraCharges: 2500,
    tonerCosts: 3500,
    partCosts: 1000,
    engineerVisits: 4,
    netProfit: 13000,
    profitMargin: 74.29
  }
];

const MachineRentalReport = () => {
  const [month, setMonth] = useState("april");
  const [customer, setCustomer] = useState("all");
  const [model, setModel] = useState("all");
  const [branch, setBranch] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = sampleRentalData.filter((item) => {
    return (
      (customer === "all" || item.customerName.includes(customer)) &&
      (model === "all" || item.machineDetails.includes(model)) &&
      (branch === "all" || item.location.includes(branch)) &&
      (searchTerm === "" || 
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.machineDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const totalRentalIncome = filteredData.reduce((sum, item) => sum + item.rentAmount + item.extraCharges, 0);
  const totalConsumableCost = filteredData.reduce((sum, item) => sum + item.tonerCosts + item.partCosts, 0);
  const totalEngineerCost = filteredData.reduce((sum, item) => sum + (item.engineerVisits * 500), 0);
  const overallRentalProfit = filteredData.reduce((sum, item) => sum + item.netProfit, 0);
  const overallProfitMargin = totalRentalIncome > 0 ? (overallRentalProfit / totalRentalIncome) * 100 : 0;

  const handleExportCSV = () => {
    exportToCsv(filteredData, 'Machine_Rental_Report');
  };

  const handleExportPDF = () => {
    exportToPdf(filteredData, 'Machine Rental Report');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Machine-wise Rental Report</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Rental Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">₹{totalRentalIncome.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Consumable Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">₹{totalConsumableCost.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Engineer Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">₹{totalEngineerCost.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overall Rental Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">₹{overallRentalProfit.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Margin: {overallProfitMargin.toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 items-end">
          <div className="w-full md:w-1/5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="january">January 2025</SelectItem>
                <SelectItem value="february">February 2025</SelectItem>
                <SelectItem value="march">March 2025</SelectItem>
                <SelectItem value="april">April 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-1/5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <Select value={customer} onValueChange={setCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="ABC">ABC Corporation</SelectItem>
                <SelectItem value="XYZ">XYZ Ltd</SelectItem>
                <SelectItem value="Global">Global Solutions</SelectItem>
                <SelectItem value="Tech">Tech Innovators</SelectItem>
                <SelectItem value="Educational">Educational Institute</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-1/5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Machine Model</label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="All Models" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                <SelectItem value="Canon IR2525">Canon IR2525</SelectItem>
                <SelectItem value="Ricoh MP2014">Ricoh MP2014</SelectItem>
                <SelectItem value="Konica C308">Konica C308</SelectItem>
                <SelectItem value="HP M725">HP M725</SelectItem>
                <SelectItem value="Canon IR4545">Canon IR4545</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-1/5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <Select value={branch} onValueChange={setBranch}>
              <SelectTrigger>
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="Indore">Indore HQ</SelectItem>
                <SelectItem value="Bhopal">Bhopal Office</SelectItem>
                <SelectItem value="Jabalpur">Jabalpur Office</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-1/5">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          Showing {filteredData.length} of {sampleRentalData.length} entries
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="flex items-center">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button onClick={handleExportPDF} variant="outline" size="sm" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Machine Details</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Billing Cycle</TableHead>
                <TableHead className="text-right">Rent + GST (₹)</TableHead>
                <TableHead className="text-right">Copies Used</TableHead>
                <TableHead className="text-right">Extra Copies</TableHead>
                <TableHead className="text-right">Toner/Parts Cost (₹)</TableHead>
                <TableHead className="text-center">Engineer Visits</TableHead>
                <TableHead className="text-right">Net Profit (₹)</TableHead>
                <TableHead className="text-right">Margin %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.customerName}</TableCell>
                    <TableCell>
                      {item.machineDetails}
                      <div className="text-xs text-gray-500">S/N: {item.serialNo}</div>
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.billingCycle}</TableCell>
                    <TableCell className="text-right">{item.rentAmount.toLocaleString()} + {item.gstAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{item.copiesUsed.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {item.extraCopies.toLocaleString()}
                      {item.extraCharges > 0 && (
                        <div className="text-xs">₹{item.extraCharges.toLocaleString()}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{(item.tonerCosts + item.partCosts).toLocaleString()}</TableCell>
                    <TableCell className="text-center">{item.engineerVisits}</TableCell>
                    <TableCell className="text-right font-medium">{item.netProfit.toLocaleString()}</TableCell>
                    <TableCell 
                      className={`text-right font-medium ${
                        item.profitMargin > 60 ? 'text-green-600' : 
                        item.profitMargin > 40 ? 'text-amber-600' : 'text-red-600'
                      }`}
                    >
                      {item.profitMargin.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-4">No data found for the selected filters</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default MachineRentalReport;
