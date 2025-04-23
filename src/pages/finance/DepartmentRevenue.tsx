
import React, { useState, useEffect } from "react";
import { departments, categories, paymentMethods } from "@/data/finance";
import EntryTable from "@/components/finance/EntryTable";
import EntryFormDialog from "@/components/finance/EntryFormDialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CashEntry } from "@/types/finance";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const DepartmentRevenue = () => {
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<CashEntry>>({
    date: format(new Date(), "yyyy-MM-dd"),
    type: "Income",
    payment_method: "Cash",
    entered_by: "Current User"
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEntries();
    // eslint-disable-next-line
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cash_entries")
      .select("*")
      .eq("type", "Income")
      .order("date", { ascending: false });

    if (!error && Array.isArray(data)) {
      setEntries(data as CashEntry[]);
    }
    setLoading(false);
  };

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
      .reduce((sum, entry) => sum + Number(entry.amount), 0)
  })).filter(dept => dept.amount > 0);

  const handleOpenDialog = () => {
    setCurrentEntry({
      date: format(new Date(), "yyyy-MM-dd"),
      type: "Income",
      payment_method: "Cash",
      entered_by: "Current User"
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleFormSubmit = async () => {
    if (
      !currentEntry.date ||
      !currentEntry.department ||
      !currentEntry.category ||
      !currentEntry.amount ||
      !currentEntry.description
    ) {
      // In a real app, show validation message
      return;
    }

    setLoading(true);

    const insertObj = {
      id: uuidv4(),
      date: currentEntry.date,
      amount: Number(currentEntry.amount),
      department: currentEntry.department,
      category: currentEntry.category,
      description: currentEntry.description,
      payment_method: currentEntry.payment_method || "Cash",
      entered_by: currentEntry.entered_by || "Current User",
      type: "Income",
      reference: currentEntry.reference || "",
      po_number: currentEntry.po_number || null,
      invoice_number: currentEntry.invoice_number || null,
      branch: currentEntry.branch || null,
      narration: currentEntry.narration || null
    };

    const { error } = await supabase
      .from("cash_entries")
      .insert([insertObj]);
    setLoading(false);

    if (!error) {
      setIsDialogOpen(false);
      fetchEntries();
    }
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
      cell: (row: CashEntry) => formatCurrency(Number(row.amount))
    },
    {
      key: "entered_by",
      header: "Entered By"
    },
    {
      key: "description",
      header: "Description"
    },
    {
      key: "reference",
      header: "Notes"
    },
    {
      key: "narration",
      header: "Narration"
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
        isSubmitting={loading}
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
              value={currentEntry.department || ""}
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
              value={currentEntry.category || ""}
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
            <Label htmlFor="entered_by">Entered By *</Label>
            <Input 
              id="entered_by"
              placeholder="Name"
              value={currentEntry.entered_by || ""}
              onChange={(e) => handleInputChange("entered_by", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Notes</Label>
            <Input 
              id="reference"
              placeholder="Reference"
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
              rows={2}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="narration">Narration</Label>
            <Textarea
              id="narration"
              placeholder="Enter narration (optional)"
              value={currentEntry.narration || ""}
              onChange={(e) => handleInputChange("narration", e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </EntryFormDialog>
    </div>
  );
};

export default DepartmentRevenue;
