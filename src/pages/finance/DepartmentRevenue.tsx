
import React, { useState } from "react";
import { revenueEntries, departments, categories, paymentMethods } from "@/data/financeData";
import EntryTable from "@/components/finance/EntryTable";
import EntryFormDialog from "@/components/finance/EntryFormDialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Revenue } from "@/types/finance";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DepartmentRevenue = () => {
  const [entries, setEntries] = useState<Revenue[]>(revenueEntries);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<Revenue>>({
    date: format(new Date(), "yyyy-MM-dd"),
    paymentStatus: "Pending"
  });
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate department-wise totals for the chart
  const departmentTotals = departments.map(dept => ({
    name: dept,
    amount: entries.filter(entry => entry.department === dept)
      .reduce((sum, entry) => sum + entry.amount, 0)
  })).filter(dept => dept.amount > 0);

  const handleOpenDialog = () => {
    setCurrentEntry({
      date: format(new Date(), "yyyy-MM-dd"),
      paymentStatus: "Pending"
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleFormSubmit = () => {
    if (
      !currentEntry.date ||
      !currentEntry.department ||
      !currentEntry.category ||
      !currentEntry.amount ||
      !currentEntry.description ||
      !currentEntry.paymentStatus
    ) {
      // In a real app, show validation message
      return;
    }

    const newEntry: Revenue = {
      id: uuidv4(),
      date: currentEntry.date,
      department: currentEntry.department,
      category: currentEntry.category,
      amount: Number(currentEntry.amount),
      description: currentEntry.description,
      customer: currentEntry.customer,
      invoiceNumber: currentEntry.invoiceNumber,
      paymentStatus: currentEntry.paymentStatus as 'Paid' | 'Pending' | 'Partial',
      paymentMethod: currentEntry.paymentMethod
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
      key: "department",
      header: "Department"
    },
    {
      key: "category",
      header: "Category"
    },
    {
      key: "amount",
      header: "Amount",
      cell: (row: Revenue) => formatCurrency(row.amount)
    },
    {
      key: "customer",
      header: "Customer"
    },
    {
      key: "invoiceNumber",
      header: "Invoice #"
    },
    {
      key: "description",
      header: "Description"
    },
    {
      key: "paymentStatus",
      header: "Payment Status",
      cell: (row: Revenue) => (
        <Badge variant={
          row.paymentStatus === "Paid" ? "success" : 
          row.paymentStatus === "Partial" ? "warning" : 
          "outline"
        }>
          {row.paymentStatus}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Department-wise Revenue</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentTotals}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="amount" name="Revenue" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <EntryTable 
        columns={columns} 
        data={entries} 
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
                {categories.income.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
            <Label htmlFor="customer">Customer</Label>
            <Input 
              id="customer" 
              placeholder="Customer name" 
              value={currentEntry.customer || ""} 
              onChange={(e) => handleInputChange("customer", e.target.value)} 
            />
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
            <Label htmlFor="paymentStatus">Payment Status *</Label>
            <Select 
              value={currentEntry.paymentStatus} 
              onValueChange={(value) => handleInputChange("paymentStatus", value)}
            >
              <SelectTrigger id="paymentStatus">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
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

export default DepartmentRevenue;
