import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Download, 
  FileText,
  Filter,
  Calendar,
  User,
  FileCheck,
  Building,
  CircleCheck,
  TrendingUp,
  PieChart,
  BarChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { exportToCsv, exportToPdf } from "@/utils/exportUtils";
import { mockServiceCalls } from "@/data/mockData";
import { Engineer } from "@/types/service";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

const EngineerServiceReport = () => {
  // Engineers state
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  
  // Filter states
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });
  const [selectedEngineer, setSelectedEngineer] = useState<string>("");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");

  // Fetch engineers
  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      const { data, error } = await supabase
        .from('engineers')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching engineers:", error);
        return;
      }
      
      const transformedEngineers: Engineer[] = data.map(eng => ({
        id: eng.id,
        name: eng.name,
        phone: eng.phone,
        email: eng.email,
        location: eng.location,
        status: eng.status,
        skillLevel: eng.skill_level,
        currentJob: eng.current_job,
        currentLocation: eng.current_location
      }));
      
      setEngineers(transformedEngineers);
    } catch (err) {
      console.error("Unexpected error fetching engineers:", err);
    }
  };

  // Process service calls data
  const filteredServiceCalls = mockServiceCalls.filter(call => {
    // Date range filter
    const callDate = new Date(call.createdAt);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    toDate.setHours(23, 59, 59); // Include the entire day
    
    const dateInRange = callDate >= fromDate && callDate <= toDate;
    
    // Engineer filter
    const engineerMatch = selectedEngineer === "" || call.engineerId === selectedEngineer;
    
    // Service type filter
    const serviceTypeMatch = selectedServiceType === "" || call.callType === selectedServiceType;
    
    // Branch/location filter
    const branchMatch = selectedBranch === "" || call.location.includes(selectedBranch);
    
    return dateInRange && engineerMatch && serviceTypeMatch && branchMatch;
  });

  // Calculate summary data
  const summaryData = React.useMemo(() => {
    const engineerVisitCounts = new Map();
    const engineerCosts = new Map();
    const machineVisits = new Map();
    let firstVisitResolutions = 0;

    filteredServiceCalls.forEach(call => {
      // Count visits by engineer
      if (call.engineerId) {
        engineerVisitCounts.set(
          call.engineerId,
          (engineerVisitCounts.get(call.engineerId) || 0) + 1
        );

        // Calculate costs
        const partsCost = call.partsUsed.reduce((sum, part) => sum + part.price * part.quantity, 0);
        const engineerCost = 500; // Assuming a fixed engineer cost per visit
        const totalCost = partsCost + engineerCost;
        
        engineerCosts.set(
          call.engineerId,
          (engineerCosts.get(call.engineerId) || 0) + totalCost
        );
      }

      // Count machine visits
      const machineKey = `${call.machineModel}-${call.serialNumber}`;
      machineVisits.set(
        machineKey,
        (machineVisits.get(machineKey) || 0) + 1
      );

      // Check if resolved on first visit
      if (call.status === "Completed" && call.partsUsed.length === 0) {
        firstVisitResolutions++;
      }
    });

    // Calculate most visited machines
    const sortedMachines = Array.from(machineVisits.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Calculate average cost per visit
    let totalVisits = 0;
    let totalCost = 0;
    engineerCosts.forEach((cost) => {
      totalCost += cost;
    });
    engineerVisitCounts.forEach((count) => {
      totalVisits += count;
    });

    const avgCostPerVisit = totalVisits > 0 ? totalCost / totalVisits : 0;

    return {
      totalVisits,
      avgCostPerVisit,
      mostVisitedMachines: sortedMachines,
      firstVisitResolutions,
      engineerVisitCounts,
    };
  }, [filteredServiceCalls]);

  // Calculate cost of visit (engineer + parts)
  const calculateVisitCost = (call) => {
    const partsCost = call.partsUsed.reduce((sum, part) => sum + part.price * part.quantity, 0);
    const engineerCost = 500; // Assuming fixed cost for engineer visit
    return partsCost + engineerCost;
  };

  // Handle export functions
  const handleExportPdf = () => {
    const exportData = filteredServiceCalls.map(call => ({
      engineerName: call.engineerName,
      visitDate: format(new Date(call.createdAt), 'dd/MM/yyyy'),
      customerName: call.customerName,
      machineModel: call.machineModel,
      problem: call.issueDescription,
      partsUsed: call.partsUsed.map(part => `${part.name} (${part.quantity})`).join(', '),
      totalCost: `₹${calculateVisitCost(call).toFixed(2)}`,
      serviceType: call.callType,
      status: call.status
    }));
    
    exportToPdf(exportData, "Engineer Service Call Report");
  };

  const handleExportCsv = () => {
    const exportData = filteredServiceCalls.map(call => ({
      engineerName: call.engineerName,
      visitDate: format(new Date(call.createdAt), 'dd/MM/yyyy'),
      customerName: call.customerName,
      machineModel: call.machineModel,
      problem: call.issueDescription,
      partsUsed: call.partsUsed.map(part => `${part.name} (${part.quantity})`).join(', '),
      totalCost: calculateVisitCost(call).toFixed(2),
      serviceType: call.callType,
      status: call.status
    }));
    
    exportToCsv(exportData, "Engineer_Service_Call_Report");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Engineer-wise Service Call Report</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportPdf} variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={handleExportCsv} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Date Range
              </label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-full"
                />
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Engineer Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <User className="h-4 w-4" />
                Engineer
              </label>
              <Select value={selectedEngineer} onValueChange={setSelectedEngineer}>
                <SelectTrigger>
                  <SelectValue placeholder="All Engineers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Engineers</SelectItem>
                  {engineers.map((engineer) => (
                    <SelectItem key={engineer.id} value={engineer.id}>
                      {engineer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service Type Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <FileCheck className="h-4 w-4" />
                Service Type
              </label>
              <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="AMC">AMC</SelectItem>
                  <SelectItem value="Warranty">Warranty</SelectItem>
                  <SelectItem value="Rental">Rental</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Branch Filter */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Building className="h-4 w-4" />
                Branch
              </label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Branches</SelectItem>
                  <SelectItem value="Indore">Indore</SelectItem>
                  <SelectItem value="Bhopal">Bhopal</SelectItem>
                  <SelectItem value="Jabalpur">Jabalpur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{summaryData.totalVisits}</div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Avg. Cost per Visit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">₹{summaryData.avgCostPerVisit.toFixed(2)}</div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Closed on First Visit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{summaryData.firstVisitResolutions}</div>
              <CircleCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Most Visited Machine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold">
                {summaryData.mostVisitedMachines.length > 0 
                  ? summaryData.mostVisitedMachines[0][0].split('-')[0]
                  : "N/A"}
              </div>
              <PieChart className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Service Call Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Engineer Name</TableHead>
                  <TableHead>Visit Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Machine Model</TableHead>
                  <TableHead>Problem</TableHead>
                  <TableHead>Parts Used</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServiceCalls.length > 0 ? (
                  filteredServiceCalls.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell>{call.engineerName}</TableCell>
                      <TableCell>{format(new Date(call.createdAt), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{call.customerName}</TableCell>
                      <TableCell>{call.machineModel}</TableCell>
                      <TableCell>
                        <span className="text-xs">{call.issueType}: </span>
                        {call.issueDescription.substring(0, 30)}
                        {call.issueDescription.length > 30 ? "..." : ""}
                      </TableCell>
                      <TableCell>
                        {call.partsUsed.length > 0 
                          ? call.partsUsed.map(part => (
                              <div key={part.id} className="text-xs">
                                {part.name} x{part.quantity}
                              </div>
                            ))
                          : <span className="text-xs text-muted-foreground">None</span>
                        }
                      </TableCell>
                      <TableCell>₹{calculateVisitCost(call).toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                          ${call.callType === 'AMC' ? 'bg-green-100 text-green-800' :
                            call.callType === 'Warranty' ? 'bg-blue-100 text-blue-800' :
                            call.callType === 'Rental' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'}`
                        }>
                          {call.callType}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                          ${call.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            call.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'}`
                        }>
                          {call.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      No service calls found matching the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EngineerServiceReport;
