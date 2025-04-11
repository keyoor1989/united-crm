
import React, { useState, useMemo } from "react";
import { revenueEntries } from "@/data/finance";
import EntryTable from "@/components/finance/EntryTable";
import EntryFormDialog from "@/components/finance/EntryFormDialog";
import DateRangeFilter from "@/components/finance/DateRangeFilter";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isWithinInterval, parseISO } from "date-fns";
import { Revenue } from "@/types/finance";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Download, PieChart, BarChart2, Filter } from "lucide-react";
import { exportToCsv, exportToPdf } from "@/utils/exportUtils";
import { DateRange } from "react-day-picker";

const revenueTypes = [
  "Machine Sales",
  "Spare Part Sales (Offline)",
  "Spare Part Sales (Online)",
  "Rental Billing",
  "Service Charges"
];

const gstRates = ["0", "5", "12", "18", "28"];
const paymentModes = ["Cash", "UPI", "Bank Transfer", "Cheque"];
const branches = ["Indore", "Bhopal", "Jabalpur"];
const customersList = ["ABC Industries", "XYZ Corporation", "Lakshmi Enterprises", "Sharma & Sons", "MediTech Solutions"];

interface RevenueEntry extends Revenue {
  revenueType: string;
  gstPercentage?: number;
  totalWithGst?: number;
  branch: string;
  paymentMode: string;
}

const DepartmentRevenueNew = () => {
  // Convert existing entries to the new format
  const initialEntries: RevenueEntry[] = revenueEntries.map(entry => ({
    ...entry,
    revenueType: entry.category,
    gstPercentage: Math.floor(Math.random() * 5) * 7, // Random GST for demo
    branch: branches[Math.floor(Math.random() * branches.length)],
    paymentMode: paymentModes[Math.floor(Math.random() * paymentModes.length)],
    totalWithGst: 0
  })).map(entry => {
    // Calculate total with GST
    const gst = entry.gstPercentage ? (entry.amount * entry.gstPercentage / 100) : 0;
    return {
      ...entry,
      totalWithGst: entry.amount + gst
    };
  });

  const [entries, setEntries] = useState<RevenueEntry[]>(initialEntries);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<RevenueEntry>>({
    date: format(new Date(), "yyyy-MM-dd"),
    paymentStatus: "Pending",
    branch: "Indore",
    paymentMode: "Cash"
  });
  
  // Filter states
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>("");
  const [branchFilter, setBranchFilter] = useState<string>("");
  
  // Apply filters
  const filteredEntries = useMemo(() => {
    let filtered = [...entries];
    
    // Date range filter
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(entry => {
        const entryDate = parseISO(entry.date);
        return isWithinInterval(entryDate, { 
          start: dateRange.from as Date,
          end: dateRange.to as Date
        });
      });
    }
    
    // Department filter
    if (departmentFilter) {
      filtered = filtered.filter(entry => entry.revenueType === departmentFilter);
    }
    
    // Payment mode filter
    if (paymentModeFilter) {
      filtered = filtered.filter(entry => entry.paymentMode === paymentModeFilter);
    }
    
    // Branch filter
    if (branchFilter) {
      filtered = filtered.filter(entry => entry.branch === branchFilter);
    }
    
    return filtered;
  }, [entries, dateRange, departmentFilter, paymentModeFilter, branchFilter]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate totals for summary cards
  const totalRevenue = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);
  
  // Prepare chart data
  const chartData = useMemo(() => {
    const departmentTotals = revenueTypes.map(type => ({
      name: type,
      value: filteredEntries.filter(entry => entry.revenueType === type)
        .reduce((sum, entry) => sum + entry.amount, 0)
    })).filter(dept => dept.value > 0);
    
    return departmentTotals;
  }, [filteredEntries]);

  const handleOpenDialog = () => {
    setCurrentEntry({
      date: format(new Date(), "yyyy-MM-dd"),
      paymentStatus: "Pending",
      branch: "Indore",
      paymentMode: "Cash"
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleFormSubmit = () => {
    if (
      !currentEntry.date ||
      !currentEntry.revenueType ||
      !currentEntry.amount ||
      !currentEntry.branch ||
      !currentEntry.paymentMode
    ) {
      // In a real app, show validation message
      console.error("Missing required fields");
      return;
    }

    const gstAmount = currentEntry.gstPercentage 
      ? (Number(currentEntry.amount) * Number(currentEntry.gstPercentage) / 100) 
      : 0;
    
    const totalWithGst = Number(currentEntry.amount) + gstAmount;

    const newEntry: RevenueEntry = {
      id: uuidv4(),
      date: currentEntry.date,
      department: currentEntry.branch || "Indore", // Using branch as department for legacy compatibility
      category: currentEntry.revenueType || "",
      revenueType: currentEntry.revenueType || "",
      amount: Number(currentEntry.amount),
      gstPercentage: currentEntry.gstPercentage ? Number(currentEntry.gstPercentage) : undefined,
      totalWithGst: totalWithGst,
      description: currentEntry.description || "",
      customer: currentEntry.customer,
      invoiceNumber: currentEntry.invoiceNumber,
      paymentStatus: currentEntry.paymentStatus as 'Paid' | 'Pending' | 'Partial',
      paymentMethod: currentEntry.paymentMode,
      paymentMode: currentEntry.paymentMode || "Cash",
      branch: currentEntry.branch || "Indore"
    };

    setEntries([newEntry, ...entries]);
    setIsDialogOpen(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    let newState = { ...currentEntry, [field]: value };
    
    // Auto-calculate total with GST when amount or GST% changes
    if (field === 'amount' || field === 'gstPercentage') {
      const amount = field === 'amount' ? Number(value) : Number(currentEntry.amount || 0);
      const gstPercentage = field === 'gstPercentage' ? Number(value) : Number(currentEntry.gstPercentage || 0);
      
      const gstAmount = amount * gstPercentage / 100;
      newState.totalWithGst = amount + gstAmount;
    }
    
    setCurrentEntry(newState);
  };

  const handleResetFilters = () => {
    setDateRange(undefined);
    setDepartmentFilter("");
    setPaymentModeFilter("");
    setBranchFilter("");
  };

  const handleExportCsv = () => {
    exportToCsv(filteredEntries, 'department_revenue');
  };

  const handleExportPdf = () => {
    exportToPdf(filteredEntries, 'Department Revenue Report');
  };

  const columns = [
    {
      key: "date",
      header: "Date"
    },
    {
      key: "revenueType",
      header: "Revenue Type"
    },
    {
      key: "customer",
      header: "Customer"
    },
    {
      key: "amount",
      header: "Amount",
      cell: (row: RevenueEntry) => formatCurrency(row.amount)
    },
    {
      key: "gstPercentage",
      header: "GST %",
      cell: (row: RevenueEntry) => row.gstPercentage !== undefined ? `${row.gstPercentage}%` : "-"
    },
    {
      key: "totalWithGst",
      header: "Total with GST",
      cell: (row: RevenueEntry) => formatCurrency(row.totalWithGst || row.amount)
    },
    {
      key: "paymentMode",
      header: "Payment Mode"
    },
    {
      key: "branch",
      header: "Branch"
    },
    {
      key: "invoiceNumber",
      header: "Invoice #",
      cell: (row: RevenueEntry) => row.invoiceNumber || "-"
    },
    {
      key: "description",
      header: "Notes"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Department-wise Revenue</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportPdf}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue by Department</CardTitle>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {}}>
                <BarChart2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {}}>
                <PieChart className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="value" name="Revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-muted/40 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <Filter className="mr-2 h-4 w-4" />
          <h3 className="font-medium">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="date-filter" className="block mb-2">Date Range</Label>
            <DateRangeFilter 
              dateRange={dateRange}
              onDateRangeChange={setDateRange} 
            />
          </div>
          <div>
            <Label htmlFor="department-filter" className="block mb-2">Revenue Type</Label>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger id="department-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {revenueTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="payment-mode-filter" className="block mb-2">Payment Mode</Label>
            <Select value={paymentModeFilter} onValueChange={setPaymentModeFilter}>
              <SelectTrigger id="payment-mode-filter">
                <SelectValue placeholder="All Modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                {paymentModes.map(mode => (
                  <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="branch-filter" className="block mb-2">Branch</Label>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger id="branch-filter">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map(branch => (
                  <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4">
            <Button variant="ghost" onClick={handleResetFilters} className="mt-1">
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      <EntryTable 
        columns={columns} 
        data={filteredEntries} 
        onAdd={handleOpenDialog}
        addButtonText="Add Revenue Entry"
      />

      <EntryFormDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title="Add Revenue Entry"
        onSubmit={handleFormSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input 
              id="date" 
              type="date" 
              value={currentEntry.date} 
              onChange={(e) => handleInputChange("date", e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="revenueType">Revenue Type *</Label>
            <Select 
              value={currentEntry.revenueType} 
              onValueChange={(value) => handleInputChange("revenueType", value)}
            >
              <SelectTrigger id="revenueType">
                <SelectValue placeholder="Select revenue type" />
              </SelectTrigger>
              <SelectContent>
                {revenueTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input 
              id="amount" 
              type="number" 
              placeholder="Enter amount" 
              value={currentEntry.amount || ""} 
              onChange={(e) => handleInputChange("amount", e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gstPercentage">GST %</Label>
            <Select 
              value={currentEntry.gstPercentage?.toString()} 
              onValueChange={(value) => handleInputChange("gstPercentage", value)}
            >
              <SelectTrigger id="gstPercentage">
                <SelectValue placeholder="Select GST rate" />
              </SelectTrigger>
              <SelectContent>
                {gstRates.map((rate) => (
                  <SelectItem key={rate} value={rate}>{rate}%</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalWithGst">Total with GST</Label>
            <Input 
              id="totalWithGst" 
              type="number" 
              value={currentEntry.totalWithGst || ""} 
              readOnly
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select 
              value={currentEntry.customer} 
              onValueChange={(value) => handleInputChange("customer", value)}
            >
              <SelectTrigger id="customer">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customersList.map((customer) => (
                  <SelectItem key={customer} value={customer}>{customer}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input 
              id="invoiceNumber" 
              placeholder="Invoice number" 
              value={currentEntry.invoiceNumber || ""} 
              onChange={(e) => handleInputChange("invoiceNumber", e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMode">Payment Mode *</Label>
            <Select 
              value={currentEntry.paymentMode} 
              onValueChange={(value) => handleInputChange("paymentMode", value)}
            >
              <SelectTrigger id="paymentMode">
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
              <SelectContent>
                {paymentModes.map((mode) => (
                  <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Branch *</Label>
            <Select 
              value={currentEntry.branch} 
              onValueChange={(value) => handleInputChange("branch", value)}
            >
              <SelectTrigger id="branch">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Notes</Label>
            <Textarea 
              id="description" 
              placeholder="Enter notes" 
              value={currentEntry.description || ""} 
              onChange={(e) => handleInputChange("description", e.target.value)} 
              rows={3}
            />
          </div>
        </div>
      </EntryFormDialog>
    </div>
  );
};

export default DepartmentRevenueNew;
