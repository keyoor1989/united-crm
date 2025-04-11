import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileSpreadsheet, 
  FileText, 
  Mail, 
  Share2, 
  Printer,
  Calendar,
  MessageSquare
} from "lucide-react";
import { exportToCsv, exportToPdf } from "@/utils/exportUtils";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Define the data types for the customer follow-up report
interface CustomerFollowUpData {
  id: string;
  customerName: string;
  mobileNumber: string;
  leadSource: "WhatsApp" | "IndiaMart" | "YouTube" | "Facebook" | "Website" | "Manual" | "Referral";
  status: "Pending" | "Completed" | "Missed";
  assignedTo: string;
  lastFollowUpDate: Date | null;
  nextFollowUpDate: Date | null;
  productInterest: string;
  notes: string;
}

// Sample data for demonstration
const sampleFollowUpData: CustomerFollowUpData[] = [
  {
    id: "1",
    customerName: "Rajesh Kumar",
    mobileNumber: "9876543210",
    leadSource: "WhatsApp",
    status: "Pending",
    assignedTo: "Amit Sharma",
    lastFollowUpDate: new Date(2025, 3, 2),
    nextFollowUpDate: new Date(2025, 3, 15),
    productInterest: "Canon IR2525",
    notes: "Interested in office solution for small business"
  },
  {
    id: "2",
    customerName: "Priya Mehta",
    mobileNumber: "8765432109",
    leadSource: "IndiaMart",
    status: "Completed",
    assignedTo: "Sunita Patel",
    lastFollowUpDate: new Date(2025, 3, 7),
    nextFollowUpDate: new Date(2025, 3, 21),
    productInterest: "Xerox WorkCentre",
    notes: "Quotation sent for 3 machines"
  },
  {
    id: "3",
    customerName: "Suresh Verma",
    mobileNumber: "7654321098",
    leadSource: "YouTube",
    status: "Missed",
    assignedTo: "Amit Sharma",
    lastFollowUpDate: new Date(2025, 3, 1),
    nextFollowUpDate: new Date(2025, 3, 8),
    productInterest: "Ricoh MP2014",
    notes: "Need to follow up urgently - missed last call"
  },
  {
    id: "4",
    customerName: "Anita Singh",
    mobileNumber: "9988776655",
    leadSource: "Manual",
    status: "Pending",
    assignedTo: "Vikram Desai",
    lastFollowUpDate: new Date(2025, 3, 5),
    nextFollowUpDate: new Date(2025, 3, 12),
    productInterest: "HP LaserJet Pro",
    notes: "Looking for AMC options"
  },
  {
    id: "5",
    customerName: "Mohammed Khan",
    mobileNumber: "9876123450",
    leadSource: "Referral",
    status: "Completed",
    assignedTo: "Sunita Patel",
    lastFollowUpDate: new Date(2025, 3, 9),
    nextFollowUpDate: new Date(2025, 3, 23),
    productInterest: "Konica Minolta C308",
    notes: "Ready to place order next month"
  },
  {
    id: "6",
    customerName: "Lakshmi Nair",
    mobileNumber: "8877665544",
    leadSource: "IndiaMart",
    status: "Pending",
    assignedTo: "Vikram Desai",
    lastFollowUpDate: null,
    nextFollowUpDate: new Date(2025, 3, 14),
    productInterest: "Canon iR4545",
    notes: "New lead - first contact pending"
  },
  {
    id: "7",
    customerName: "Rahul Kapoor",
    mobileNumber: "7788994455",
    leadSource: "Website",
    status: "Missed",
    assignedTo: "Amit Sharma",
    lastFollowUpDate: new Date(2025, 3, 6),
    nextFollowUpDate: new Date(2025, 3, 10),
    productInterest: "Xerox Phaser 3330",
    notes: "Customer busy last time, schedule call in evening"
  },
  {
    id: "8",
    customerName: "Divya Mishra",
    mobileNumber: "9876543211",
    leadSource: "Facebook",
    status: "Pending",
    assignedTo: "Sunita Patel",
    lastFollowUpDate: new Date(2025, 3, 8),
    nextFollowUpDate: new Date(2025, 3, 18),
    productInterest: "Ricoh MP C3003",
    notes: "Comparing quotes from competitors"
  },
];

const CustomerFollowUpReport = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState("all");
  const [assignedTo, setAssignedTo] = useState("all");
  const [leadSource, setLeadSource] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter the data based on the selected filters
  const filteredData = sampleFollowUpData.filter((item) => {
    // Filter by date range if both dates are selected
    const dateInRange = (!startDate || !endDate) ? true : 
      (item.nextFollowUpDate && 
        item.nextFollowUpDate >= startDate && 
        item.nextFollowUpDate <= endDate);

    // Filter by status
    const statusMatch = status === "all" || item.status === status;

    // Filter by assigned to
    const assignedMatch = assignedTo === "all" || item.assignedTo === assignedTo;

    // Filter by lead source
    const sourceMatch = leadSource === "all" || item.leadSource === leadSource;

    // Filter by search term
    const searchMatch = searchTerm === "" || 
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mobileNumber.includes(searchTerm) ||
      item.productInterest.toLowerCase().includes(searchTerm.toLowerCase());

    return dateInRange && statusMatch && assignedMatch && sourceMatch && searchMatch;
  });

  // Calculate summary metrics
  const totalLeads = sampleFollowUpData.length;
  const leadsWithNoFollowUp = sampleFollowUpData.filter(item => item.lastFollowUpDate === null).length;
  
  // Calculate missed leads this week
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const missedThisWeek = sampleFollowUpData.filter(item => 
    item.status === "Missed" && 
    item.nextFollowUpDate && 
    item.nextFollowUpDate >= startOfWeek && 
    item.nextFollowUpDate <= today
  ).length;

  // Calculate active leads by source
  const leadsBySource = sampleFollowUpData.reduce((acc, item) => {
    const source = item.leadSource;
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get unique salespeople and lead sources for filters
  const salespeople = [...new Set(sampleFollowUpData.map(item => item.assignedTo))];
  const leadSources = [...new Set(sampleFollowUpData.map(item => item.leadSource))];

  // Handle export to CSV
  const handleExportCSV = () => {
    exportToCsv(filteredData, 'Customer_Follow_Up_Report');
  };

  // Handle export to PDF
  const handleExportPDF = () => {
    exportToPdf(filteredData, 'Customer Follow Up Report');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Customer Follow-Up Report</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{totalLeads}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">No Follow-up</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{leadsWithNoFollowUp}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Missed This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{missedThisWeek}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Top Lead Source</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(leadsBySource).length > 0 ? (
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {Object.entries(leadsBySource).sort((a, b) => b[1] - a[1])[0][0]}
                </p>
                <p className="text-sm text-gray-500">
                  {Object.entries(leadsBySource).sort((a, b) => b[1] - a[1])[0][1]} leads
                </p>
              </div>
            ) : (
              <p className="text-lg">No data</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 items-end mb-4">
          <div className="w-full md:w-1/5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Start Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "End Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="w-full md:w-1/5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Missed">Missed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-1/5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="All Salespeople" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Salespeople</SelectItem>
                {salespeople.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-1/5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
            <Select value={leadSource} onValueChange={setLeadSource}>
              <SelectTrigger>
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {leadSources.map((source) => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
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
      
      {/* Export Options */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          Showing {filteredData.length} of {sampleFollowUpData.length} entries
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
            <MessageSquare className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
      
      {/* Report Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Lead Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Last Follow-up</TableHead>
                <TableHead>Next Follow-up</TableHead>
                <TableHead>Product Interest</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.customerName}</TableCell>
                    <TableCell>{item.mobileNumber}</TableCell>
                    <TableCell>{item.leadSource}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === "Completed" ? "bg-green-100 text-green-800" : 
                        item.status === "Pending" ? "bg-blue-100 text-blue-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell>{item.assignedTo}</TableCell>
                    <TableCell>
                      {item.lastFollowUpDate ? format(item.lastFollowUpDate, "dd MMM yyyy") : "Not Started"}
                    </TableCell>
                    <TableCell>
                      {item.nextFollowUpDate ? (
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {format(item.nextFollowUpDate, "dd MMM yyyy")}
                        </div>
                      ) : "Not Scheduled"}
                    </TableCell>
                    <TableCell>{item.productInterest}</TableCell>
                    <TableCell className="max-w-xs truncate" title={item.notes}>{item.notes}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">No data found for the selected filters</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default CustomerFollowUpReport;
