
import React, { useState } from "react";
import { cashEntries, departments, categories, paymentMethods } from "@/data/financeData";
import EntryTable from "@/components/finance/EntryTable";
import EntryFormDialog from "@/components/finance/EntryFormDialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { CashEntry } from "@/types/finance";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";

const CashRegister = () => {
  const [entries, setEntries] = useState<CashEntry[]>(cashEntries);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<CashEntry>>({
    date: format(new Date(), "yyyy-MM-dd"),
    type: "Income",
    enteredBy: "Current User"
  });
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalIncome = entries.filter(entry => entry.type === "Income").reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpense = entries.filter(entry => entry.type === "Expense").reduce((sum, entry) => sum + entry.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleOpenDialog = () => {
    setCurrentEntry({
      date: format(new Date(), "yyyy-MM-dd"),
      type: "Income",
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
      !currentEntry.category ||
      !currentEntry.description ||
      !currentEntry.paymentMethod ||
      !currentEntry.type
    ) {
      // In a real app, show validation message
      return;
    }

    const newEntry: CashEntry = {
      id: uuidv4(),
      date: currentEntry.date,
      amount: Number(currentEntry.amount),
      department: currentEntry.department,
      category: currentEntry.category,
      description: currentEntry.description,
      paymentMethod: currentEntry.paymentMethod,
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
          {row.type}
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
      key: "category",
      header: "Category"
    },
    {
      key: "description",
      header: "Description"
    },
    {
      key: "paymentMethod",
      header: "Payment Method"
    },
    {
      key: "reference",
      header: "Reference"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Daily Cash Register</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpense)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      <EntryTable 
        columns={columns} 
        data={entries} 
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
                <Label htmlFor="income">Income</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Expense" id="expense" />
                <Label htmlFor="expense">Expense</Label>
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
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={currentEntry.category} 
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {currentEntry.type === "Income" 
                  ? categories.income.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))
                  : categories.expense.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))
                }
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select 
              value={currentEntry.paymentMethod} 
              onValueChange={(value) => handleInputChange("paymentMethod", value)}
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number</Label>
            <Input 
              id="reference" 
              placeholder="Invoice/Bill reference" 
              value={currentEntry.reference || ""} 
              onChange={(e) => handleInputChange("reference", e.target.value)} 
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea 
              id="description" 
              placeholder="Enter description" 
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

export default CashRegister;
