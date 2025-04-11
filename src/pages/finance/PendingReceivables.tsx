
import React, { useState } from "react";
import { receivableEntries } from "@/data/finance";
import EntryTable from "@/components/finance/EntryTable";
import EntryFormDialog from "@/components/finance/EntryFormDialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Receivable } from "@/types/finance";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Clock, AlertCircle } from "lucide-react";

const PendingReceivables = () => {
  const [entries, setEntries] = useState<Receivable[]>(receivableEntries);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<Receivable>>({
    date: format(new Date(), "yyyy-MM-dd"),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    status: "Due Soon",
    priority: "Medium"
  });
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Filter entries by status
  const overdueEntries = entries.filter(entry => entry.status === "Overdue");
  const dueSoonEntries = entries.filter(entry => entry.status === "Due Soon");
  const dueEntries = entries.filter(entry => entry.status === "Due");

  // Calculate totals
  const overdueTotal = overdueEntries.reduce((sum, entry) => sum + entry.balance, 0);
  const dueSoonTotal = dueSoonEntries.reduce((sum, entry) => sum + entry.balance, 0);
  const dueTotal = dueEntries.reduce((sum, entry) => sum + entry.balance, 0);
  const totalReceivables = entries.reduce((sum, entry) => sum + entry.balance, 0);

  const handleOpenDialog = () => {
    setCurrentEntry({
      date: format(new Date(), "yyyy-MM-dd"),
      dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      status: "Due Soon",
      priority: "Medium",
      amountPaid: 0
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleFormSubmit = () => {
    if (
      !currentEntry.invoiceNumber ||
      !currentEntry.customer ||
      !currentEntry.date ||
      !currentEntry.dueDate ||
      !currentEntry.amount ||
      currentEntry.amountPaid === undefined ||
      !currentEntry.status ||
      !currentEntry.priority
    ) {
      // In a real app, show validation message
      return;
    }

    const amount = Number(currentEntry.amount);
    const amountPaid = Number(currentEntry.amountPaid);
    const balance = amount - amountPaid;

    const newEntry: Receivable = {
      id: uuidv4(),
      invoiceNumber: currentEntry.invoiceNumber,
      customer: currentEntry.customer,
      date: currentEntry.date,
      dueDate: currentEntry.dueDate,
      amount: amount,
      amountPaid: amountPaid,
      balance: balance,
      status: currentEntry.status as 'Overdue' | 'Due Soon' | 'Due',
      lastFollowUp: currentEntry.lastFollowUp,
      notes: currentEntry.notes,
      contactPerson: currentEntry.contactPerson,
      contactNumber: currentEntry.contactNumber,
      priority: currentEntry.priority as 'High' | 'Medium' | 'Low'
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
      key: "invoiceNumber",
      header: "Invoice #"
    },
    {
      key: "customer",
      header: "Customer"
    },
    {
      key: "dueDate",
      header: "Due Date"
    },
    {
      key: "amount",
      header: "Total Amount",
      cell: (row: Receivable) => formatCurrency(row.amount)
    },
    {
      key: "amountPaid",
      header: "Amount Paid",
      cell: (row: Receivable) => formatCurrency(row.amountPaid)
    },
    {
      key: "balance",
      header: "Balance",
      cell: (row: Receivable) => formatCurrency(row.balance)
    },
    {
      key: "status",
      header: "Status",
      cell: (row: Receivable) => (
        <Badge variant={
          row.status === "Overdue" ? "destructive" : 
          row.status === "Due Soon" ? "warning" : 
          "default"
        }>
          {row.status}
        </Badge>
      )
    },
    {
      key: "priority",
      header: "Priority",
      cell: (row: Receivable) => (
        <Badge variant={
          row.priority === "High" ? "destructive" : 
          row.priority === "Medium" ? "warning" : 
          "default"
        }>
          {row.priority}
        </Badge>
      )
    },
    {
      key: "lastFollowUp",
      header: "Last Follow-up"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pending Receivables</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Receivables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalReceivables)}</div>
            <p className="text-xs text-muted-foreground">
              {entries.length} outstanding invoices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{formatCurrency(overdueTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {overdueEntries.length} overdue invoices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(dueSoonTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {dueSoonEntries.length} invoices due soon
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Due</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{formatCurrency(dueTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {dueEntries.length} invoices due
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Receivables</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="due-soon">Due Soon</TabsTrigger>
          <TabsTrigger value="due">Due</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <EntryTable 
            columns={columns} 
            data={entries} 
            onAdd={handleOpenDialog}
            addButtonText="Add Receivable"
          />
        </TabsContent>
        
        <TabsContent value="overdue">
          <EntryTable 
            columns={columns} 
            data={overdueEntries} 
            onAdd={handleOpenDialog}
            addButtonText="Add Receivable"
          />
        </TabsContent>
        
        <TabsContent value="due-soon">
          <EntryTable 
            columns={columns} 
            data={dueSoonEntries} 
            onAdd={handleOpenDialog}
            addButtonText="Add Receivable"
          />
        </TabsContent>
        
        <TabsContent value="due">
          <EntryTable 
            columns={columns} 
            data={dueEntries} 
            onAdd={handleOpenDialog}
            addButtonText="Add Receivable"
          />
        </TabsContent>
      </Tabs>

      <EntryFormDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title="Add Receivable"
        onSubmit={handleFormSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number *</Label>
            <Input 
              id="invoiceNumber" 
              placeholder="Enter invoice number" 
              value={currentEntry.invoiceNumber || ""} 
              onChange={(e) => handleInputChange("invoiceNumber", e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer">Customer *</Label>
            <Input 
              id="customer" 
              placeholder="Enter customer name" 
              value={currentEntry.customer || ""} 
              onChange={(e) => handleInputChange("customer", e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Invoice Date *</Label>
            <Input 
              id="date" 
              type="date" 
              value={currentEntry.date} 
              onChange={(e) => handleInputChange("date", e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input 
              id="dueDate" 
              type="date" 
              value={currentEntry.dueDate} 
              onChange={(e) => handleInputChange("dueDate", e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Total Amount (₹) *</Label>
            <Input 
              id="amount" 
              type="number" 
              placeholder="Enter amount" 
              value={currentEntry.amount || ""} 
              onChange={(e) => handleInputChange("amount", e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amountPaid">Amount Paid (₹) *</Label>
            <Input 
              id="amountPaid" 
              type="number" 
              placeholder="Enter amount already paid" 
              value={currentEntry.amountPaid || 0} 
              onChange={(e) => handleInputChange("amountPaid", e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select 
              value={currentEntry.status} 
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Due Soon">Due Soon</SelectItem>
                <SelectItem value="Due">Due</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <Select 
              value={currentEntry.priority} 
              onValueChange={(value) => handleInputChange("priority", value)}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastFollowUp">Last Follow-up Date</Label>
            <Input 
              id="lastFollowUp" 
              type="date" 
              value={currentEntry.lastFollowUp || ""} 
              onChange={(e) => handleInputChange("lastFollowUp", e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input 
              id="contactPerson" 
              placeholder="Contact person name" 
              value={currentEntry.contactPerson || ""} 
              onChange={(e) => handleInputChange("contactPerson", e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input 
              id="contactNumber" 
              placeholder="Contact phone number" 
              value={currentEntry.contactNumber || ""} 
              onChange={(e) => handleInputChange("contactNumber", e.target.value)} 
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Enter notes or payment promises" 
              value={currentEntry.notes || ""} 
              onChange={(e) => handleInputChange("notes", e.target.value)} 
              rows={3}
            />
          </div>
        </div>
      </EntryFormDialog>
    </div>
  );
};

export default PendingReceivables;
