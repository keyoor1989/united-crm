
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  BarChart2, 
  LineChart as LineChartIcon,
  Filter,
  Calendar
} from "lucide-react";
import { exportToCsv, exportToPdf } from "@/utils/exportUtils";
import { format, parseISO, subMonths, isWithinInterval } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

// Define interfaces for our report data
interface BranchProfitData {
  branch: string;
  revenue: {
    machine: number;
    spare: number;
    service: number;
    rental: number;
    total: number;
  };
  expenses: {
    machine: number;
    spare: number;
    service: number;
    rental: number;
    total: number;
  };
  netProfit: number;
  profitMargin: number;
  machinesSold: number;
  serviceCalls: number;
  rentalContracts: number;
}

interface MonthlyTrendData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

// Sample data for demonstration
const sampleBranchData: BranchProfitData[] = [
  {
    branch: "Indore",
    revenue: {
      machine: 1250000,
      spare: 350000,
      service: 450000,
      rental: 250000,
      total: 2300000
    },
    expenses: {
      machine: 950000,
      spare: 200000,
      service: 300000,
      rental: 120000,
      total: 1570000
    },
    netProfit: 730000,
    profitMargin: 31.7,
    machinesSold: 42,
    serviceCalls: 156,
    rentalContracts: 28
  },
  {
    branch: "Bhopal",
    revenue: {
      machine: 920000,
      spare: 280000,
      service: 350000,
      rental: 190000,
      total: 1740000
    },
    expenses: {
      machine: 750000,
      spare: 170000,
      service: 250000,
      rental: 100000,
      total: 1270000
    },
    netProfit: 470000,
    profitMargin: 27.0,
    machinesSold: 32,
    serviceCalls: 124,
    rentalContracts: 22
  },
  {
    branch: "Jabalpur",
    revenue: {
      machine: 680000,
      spare: 190000,
      service: 220000,
      rental: 120000,
      total: 1210000
    },
    expenses: {
      machine: 520000,
      spare: 110000,
      service: 180000,
      rental: 70000,
      total: 880000
    },
    netProfit: 330000,
    profitMargin: 27.3,
    machinesSold: 24,
    serviceCalls: 87,
    rentalContracts: 15
  }
];

// Sample monthly trend data
const sampleMonthlyTrend: MonthlyTrendData[] = [
  { month: "Jan", revenue: 1740000, expenses: 1250000, profit: 490000 },
  { month: "Feb", revenue: 1820000, expenses: 1310000, profit: 510000 },
  { month: "Mar", revenue: 1950000, expenses: 1380000, profit: 570000 },
  { month: "Apr", revenue: 2050000, expenses: 1420000, profit: 630000 },
  { month: "May", revenue: 1890000, expenses: 1350000, profit: 540000 },
  { month: "Jun", revenue: 1970000, expenses: 1390000, profit: 580000 },
];

const BranchProfitReport = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [viewMode, setViewMode] = useState<string>("monthly");
  const [chartType, setChartType] = useState<string>("bar");
  
  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Apply filters to branch data
  const filteredBranchData = useMemo(() => {
    let filtered = [...sampleBranchData];
    
    if (selectedBranch !== "all") {
      filtered = filtered.filter(branch => branch.branch === selectedBranch);
    }
    
    // Date filtering would be implemented here in a real app
    // with actual date fields in the data
    
    return filtered;
  }, [selectedBranch, dateRange]);

  // Calculate overall totals
  const totalRevenue = filteredBranchData.reduce((sum, branch) => sum + branch.revenue.total, 0);
  const totalExpenses = filteredBranchData.reduce((sum, branch) => sum + branch.expenses.total, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  
  // Prepare data for bar chart comparison
  const comparisonChartData = filteredBranchData.map(branch => ({
    name: branch.branch,
    revenue: branch.revenue.total,
    expenses: branch.expenses.total,
    profit: branch.netProfit
  }));

  // Handle export to PDF
  const handleExportPDF = () => {
    exportToPdf(filteredBranchData, 'Branch_Profit_Loss_Report');
  };

  // Handle export to CSV (Excel)
  const handleExportCSV = () => {
    exportToCsv(filteredBranchData, 'Branch_Profit_Loss_Report');
  };

  // Reset all filters
  const handleResetFilters = () => {
    setDateRange(undefined);
    setSelectedBranch("all");
    setViewMode("monthly");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Branch-wise Profit & Loss Report</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">{averageMargin.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center mb-2">
          <Filter className="mr-2 h-4 w-4" />
          <h3 className="font-medium">Filters</h3>
        </div>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 items-end mb-2">
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">View Mode</label>
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select view mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom Date Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {viewMode === "custom" && (
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange?.from ? format(dateRange.from, "PPP") : "Start Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={dateRange?.from}
                      onSelect={(date) => setDateRange({ from: date, to: dateRange?.to })}
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
                      {dateRange?.to ? format(dateRange.to, "PPP") : "End Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={dateRange?.to}
                      onSelect={(date) => setDateRange({ from: dateRange?.from, to: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          
          <div className="w-full md:w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="Indore">Indore</SelectItem>
                <SelectItem value="Bhopal">Bhopal</SelectItem>
                <SelectItem value="Jabalpur">Jabalpur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-auto">
            <Button variant="ghost" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Revenue vs Expenses by Branch</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant={chartType === "bar" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setChartType("bar")}
              >
                <BarChart2 className="h-4 w-4" />
              </Button>
              <Button 
                variant={chartType === "line" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setChartType("line")}
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "bar" ? (
                  <BarChart
                    data={comparisonChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#0088FE" />
                    <Bar dataKey="expenses" name="Expenses" fill="#FF8042" />
                  </BarChart>
                ) : (
                  <LineChart
                    data={sampleMonthlyTrend}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#0088FE" />
                    <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#FF8042" />
                    <Line type="monotone" dataKey="profit" name="Profit" stroke="#00C49F" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Profit Margin by Branch</h3>
                <div className="space-y-3">
                  {filteredBranchData.map((branch) => (
                    <div key={branch.branch} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{branch.branch}</span>
                        <span className="text-sm font-bold">{branch.profitMargin.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(branch.profitMargin * 2, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Department-wise Revenue Share</h3>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <p className="text-xs text-gray-500">Machine</p>
                    <p className="font-bold text-blue-700">
                      {filteredBranchData.length ? 
                        ((filteredBranchData.reduce((sum, branch) => sum + branch.revenue.machine, 0) / totalRevenue) * 100).toFixed(1) 
                        : 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <p className="text-xs text-gray-500">Spare</p>
                    <p className="font-bold text-green-700">
                      {filteredBranchData.length ?
                        ((filteredBranchData.reduce((sum, branch) => sum + branch.revenue.spare, 0) / totalRevenue) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <p className="text-xs text-gray-500">Service</p>
                    <p className="font-bold text-purple-700">
                      {filteredBranchData.length ?
                        ((filteredBranchData.reduce((sum, branch) => sum + branch.revenue.service, 0) / totalRevenue) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <p className="text-xs text-gray-500">Rental</p>
                    <p className="font-bold text-yellow-700">
                      {filteredBranchData.length ?
                        ((filteredBranchData.reduce((sum, branch) => sum + branch.revenue.rental, 0) / totalRevenue) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Export Options */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          Showing {filteredBranchData.length} of {sampleBranchData.length} branches
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
        </div>
      </div>
      
      {/* Detailed Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch</TableHead>
                <TableHead className="text-right">Machine Revenue</TableHead>
                <TableHead className="text-right">Spare Revenue</TableHead>
                <TableHead className="text-right">Service Revenue</TableHead>
                <TableHead className="text-right">Rental Revenue</TableHead>
                <TableHead className="text-right">Total Revenue</TableHead>
                <TableHead className="text-right">Total Expenses</TableHead>
                <TableHead className="text-right">Net Profit</TableHead>
                <TableHead className="text-right">Profit Margin</TableHead>
                <TableHead className="text-right">Machines Sold</TableHead>
                <TableHead className="text-right">Service Calls</TableHead>
                <TableHead className="text-right">Rental Contracts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBranchData.length > 0 ? (
                filteredBranchData.map((branch) => (
                  <TableRow key={branch.branch}>
                    <TableCell className="font-medium">{branch.branch}</TableCell>
                    <TableCell className="text-right">{formatCurrency(branch.revenue.machine)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(branch.revenue.spare)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(branch.revenue.service)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(branch.revenue.rental)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(branch.revenue.total)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(branch.expenses.total)}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">{formatCurrency(branch.netProfit)}</TableCell>
                    <TableCell className="text-right font-medium">{branch.profitMargin.toFixed(1)}%</TableCell>
                    <TableCell className="text-right">{branch.machinesSold}</TableCell>
                    <TableCell className="text-right">{branch.serviceCalls}</TableCell>
                    <TableCell className="text-right">{branch.rentalContracts}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-4">No data found for the selected filters</TableCell>
                </TableRow>
              )}
              
              {/* Totals row */}
              {filteredBranchData.length > 1 && (
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(filteredBranchData.reduce((sum, b) => sum + b.revenue.machine, 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(filteredBranchData.reduce((sum, b) => sum + b.revenue.spare, 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(filteredBranchData.reduce((sum, b) => sum + b.revenue.service, 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(filteredBranchData.reduce((sum, b) => sum + b.revenue.rental, 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(totalExpenses)}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatCurrency(totalProfit)}
                  </TableCell>
                  <TableCell className="text-right">
                    {averageMargin.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {filteredBranchData.reduce((sum, b) => sum + b.machinesSold, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {filteredBranchData.reduce((sum, b) => sum + b.serviceCalls, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {filteredBranchData.reduce((sum, b) => sum + b.rentalContracts, 0)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default BranchProfitReport;
