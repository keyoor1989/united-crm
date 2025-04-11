
import React, { useState } from "react";
import { cashEntries, departments, categories, paymentMethods } from "@/data/financeData";
import EntryTable from "@/components/finance/EntryTable";
import EntryFormDialog from "@/components/finance/EntryFormDialog";
import DateRangeFilter from "@/components/finance/DateRangeFilter";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { format, isWithinInterval, parseISO } from "date-fns";
import { CashEntry } from "@/types/finance";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Calendar, Download, Filter } from "lucide-react";
import { exportToCsv, exportToPdf } from "@/utils/exportUtils";

const cashPurposes = [
  "Sales Payment", "Service Payment", "Utility Bills", "Office Supplies", 
  "Travel Expenses", "Staff Salary", "Petty Cash", "Refund", "Other"
];

const CashRegister = () => {
  const [entries, setEntries] = useState<CashEntry[]>(cashEntries);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<CashEntry>>({
    date: format(new Date(), "yyyy-MM-dd"),
    type: "Income",
    paymentMethod: "Cash",
    enteredBy: "Current User"
  });
  
  // Filter states
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [filteredEntries, setFilteredEntries] = useState<CashEntry[]>(entries);

  // Apply filters
  React.useEffect(() => {
    let filtered = [...entries];
    
    // Date range filter
    if (dateRange.from && dateRange.to) {
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
      filtered = filtered.filter(entry => entry.department === departmentFilter);
    }
    
    setFilteredEntries(filtered);
  }, [entries, dateRange, departmentFilter]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalIncome = filteredEntries.filter(entry => entry.type === "Income").reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpense = filteredEntries.filter(entry => entry.type === "Expense").reduce((sum, entry) => sum + entry.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleOpenDialog = () => {
    setCurrentEntry({
      date: format(new Date(), "yyyy-MM-dd"),
      type: "Income",
      paymentMethod: "Cash",
      enteredBy: "Current User"
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleFormSubmit = () => {
    if (
      !currentEntry.date ||
      !currentEntry.amount ||
      !currentEntry.department ||
      !currentEntry.type ||
      !currentEntry.description
    ) {
      // In a real app, show validation message
      return;
    }

    const newEntry: CashEntry = {
      id: uuidv4(),
      date: currentEntry.date,
      amount: Number(currentEntry.amount),
      department: currentEntry.department,
      category: currentEntry.category || "Other",
      description: currentEntry.description,
      paymentMethod: "Cash", // Fixed to Cash only
      enteredBy: currentEntry.enteredBy || "Current User",
      type: currentEntry.type,
      reference: currentEntry.reference
    };

    setEntries([newEntry, ...entries]);
    setIsDialogOpen(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setCurrentEntry({
      ...currentEntry,
      [field]: value
    });
  };

  const handleResetFilters = () => {
    setDateRange({ from: undefined, to: undefined });
    setDepartmentFilter("");
  };

  const handleExportCsv = () => {
    exportToCsv(filteredEntries, 'cash_register_entries');
  };

  const handleExportPdf = () => {
    exportToPdf(filteredEntries, 'Cash Register Entries');
  };

  const columns = [
    {
      key: "date",
      header: "Date"
    },
    {
      key: "type",
      header: "Type",
      cell: (row: CashEntry) => (
        <Badge variant={row.type === "Income" ? "success" : "destructive"}>
          {row.type === "Income" ? "Cash In" : "Cash Out"}
        </Badge>
      )
    },
    {
      key: "amount",
      header: "Amount",
      cell: (row: CashEntry) => formatCurrency(row.amount)
    },
    {
      key: "department",
      header: "Department"
    },
    {
      key: "description",
      header: "Purpose"
    },
    {
      key: "reference",
      header: "Notes"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Daily Cash Register</h1>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cash In</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cash Out</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpense)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-muted/40 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-auto">
            <Label htmlFor="date-filter" className="block mb-2">Date Range</Label>
            <DateRangeFilter 
              dateRange={dateRange}
              onDateRangeChange={setDateRange} 
            />
          </div>
          <div className="w-full md:w-auto">
            <Label htmlFor="department-filter" className="block mb-2">Department</Label>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger id="department-filter" className="w-full md:w-[200px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" onClick={handleResetFilters} className="mb-0.5">
            Reset Filters
          </Button>
        </div>
      </div>

      <EntryTable 
        columns={columns} 
        data={filteredEntries} 
        onAdd={handleOpenDialog}
        addButtonText="Add Cash Entry"
      />

      <EntryFormDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title="Add Cash Entry"
        onSubmit={handleFormSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="type">Entry Type *</Label>
            <RadioGroup 
              id="type" 
              value={currentEntry.type} 
              onValueChange={(value) => handleInputChange("type", value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Income" id="income" />
                <Label htmlFor="income">Cash In</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Expense" id="expense" />
                <Label htmlFor="expense">Cash Out</Label>
              </div>
            </RadioGroup>
          </div>

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
            <Label htmlFor="department">Department *</Label>
            <Select 
              value={currentEntry.department} 
              onValueChange={(value) => handleInputChange("department", value)}
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {["Sales", "Spare Parts", "Rental", "Service", "Admin"].map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose *</Label>
            <Select 
              value={currentEntry.description} 
              onValueChange={(value) => handleInputChange("description", value)}
            >
              <SelectTrigger id="purpose">
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                {cashPurposes.map((purpose) => (
                  <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment">Payment Mode</Label>
            <Input 
              id="payment" 
              value="Cash" 
              readOnly
              disabled
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              placeholder="Enter additional notes" 
              value={currentEntry.reference || ""} 
              onChange={(e) => handleInputChange("reference", e.target.value)} 
              rows={3}
            />
          </div>
        </div>
      </EntryFormDialog>
    </div>
  );
};

export default CashRegister;
