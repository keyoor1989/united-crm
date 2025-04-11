
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

const expenseTypes = [
  "Salaries",
  "Rent",
  "Utilities",
  "Equipment Purchases",
  "Marketing",
  "Travel",
  "Office Supplies",
  "Software Subscriptions",
  "Professional Services",
  "Training"
];

const gstRates = ["0", "5", "12", "18", "28"];
const paymentModes = ["Cash", "UPI", "Bank Transfer", "Cheque"];
const branches = ["Indore", "Bhopal", "Jabalpur"];
const vendorsList = ["ABC Supplies", "XYZ Services", "Prime Technologies", "Global Solutions", "Metro Equipment"];

interface ExpenseEntry extends Revenue {
  expenseType: string;
  gstPercentage?: number;
  totalWithGst?: number;
  branch: string;
  paymentMode: string;
  vendor?: string;
}

const DepartmentExpenses = () => {
  // Convert existing entries to expense format for demo
  const initialEntries: ExpenseEntry[] = revenueEntries.map(entry => ({
    ...entry,
    expenseType: expenseTypes[Math.floor(Math.random() * expenseTypes.length)],
    gstPercentage: Math.floor(Math.random() * 5) * 7, // Random GST for demo
    branch: branches[Math.floor(Math.random() * branches.length)],
    paymentMode: paymentModes[Math.floor(Math.random() * paymentModes.length)],
    vendor: vendorsList[Math.floor(Math.random() * vendorsList.length)],
    totalWithGst: 0
  })).map(entry => {
    // Calculate total with GST
    const gst = entry.gstPercentage ? (entry.amount * entry.gstPercentage / 100) : 0;
    return {
      ...entry,
      totalWithGst: entry.amount + gst
    };
  });

  const [entries, setEntries] = useState<ExpenseEntry[]>(initialEntries);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<ExpenseEntry>>({
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
    if (departmentFilter && departmentFilter !== "all") {
      filtered = filtered.filter(entry => entry.expenseType === departmentFilter);
    }
    
    // Payment mode filter
    if (paymentModeFilter && paymentModeFilter !== "all") {
      filtered = filtered.filter(entry => entry.paymentMode === paymentModeFilter);
    }
    
    // Branch filter
    if (branchFilter && branchFilter !== "all") {
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
  const totalExpenses = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);
  
  // Prepare chart data
  const chartData = useMemo(() => {
    const departmentTotals = expenseTypes.map(type => ({
      name: type,
      value: filteredEntries.filter(entry => entry.expenseType === type)
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
      !currentEntry.expenseType ||
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

    const newEntry: ExpenseEntry = {
      id: uuidv4(),
      date: currentEntry.date,
      department: currentEntry.branch || "Indore", // Using branch as department for legacy compatibility
      category: currentEntry.expenseType || "",
      expenseType: currentEntry.expenseType || "",
      amount: Number(currentEntry.amount),
      gstPercentage: currentEntry.gstPercentage ? Number(currentEntry.gstPercentage) : undefined,
      totalWithGst: totalWithGst,
      description: currentEntry.description || "",
      vendor: currentEntry.vendor,
      invoiceNumber: currentEntry.invoiceNumber,
      paymentStatus: currentEntry.paymentStatus as 'Paid' | 'Pending' | 'Partial',
      paymentMethod: currentEntry.paymentMode,
      paymentMode: currentEntry.paymentMode || "Cash",
      branch: currentEntry.branch || "Indore",
      revenueType: ""
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
    exportToCsv(filteredEntries, 'department_expenses');
  };

  const handleExportPdf = () => {
    exportToPdf(filteredEntries, 'Department Expenses Report');
  };

  const columns = [
    {
      key: "date",
      header: "Date"
    },
    {
      key: "expenseType",
      header: "Expense Type"
    },
    {
      key: "vendor",
      header: "Vendor"
    },
    {
      key: "amount",
      header: "Amount",
      cell: (row: ExpenseEntry) => formatCurrency(row.amount)
    },
    {
      key: "gstPercentage",
      header: "GST %",
      cell: (row: ExpenseEntry) => row.gstPercentage !== undefined ? `${row.gstPercentage}%` : "-"
    },
    {
      key: "totalWithGst",
      header: "Total with GST",
      cell: (row: ExpenseEntry) => formatCurrency(row.totalWithGst || row.amount)
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
      cell: (row: ExpenseEntry) => row.invoiceNumber || "-"
    },
    {
      key: "description",
      header: "Notes"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Department-wise Expenses</h1>
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
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expenses by Category</CardTitle>
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
                  <Bar dataKey="value" name="Expense" fill="#f87171" />
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
            <Label htmlFor="department-filter" className="block mb-2">Expense Type</Label>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger id="department-filter">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {expenseTypes.map(type => (
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
        addButtonText="Add Expense Entry"
      />

      <EntryFormDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title="Add Expense Entry"
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
            <Label htmlFor="expenseType">Expense Type *</Label>
            <Select 
              value={currentEntry.expenseType} 
              onValueChange={(value) => handleInputChange("expenseType", value)}
            >
              <SelectTrigger id="expenseType">
                <SelectValue placeholder="Select expense type" />
              </SelectTrigger>
              <SelectContent>
                {expenseTypes.map((type) => (
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
            <Label htmlFor="vendor">Vendor</Label>
            <Select 
              value={currentEntry.vendor} 
              onValueChange={(value) => handleInputChange("vendor", value)}
            >
              <SelectTrigger id="vendor">
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendorsList.map((vendor) => (
                  <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
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

export default DepartmentExpenses;
