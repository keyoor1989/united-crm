
import React, { useState } from "react";
import { paymentEntries, paymentMethods } from "@/data/financeData";
import EntryTable from "@/components/finance/EntryTable";
import EntryFormDialog from "@/components/finance/EntryFormDialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Payment } from "@/types/finance";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CustomerPayments = () => {
  const [entries, setEntries] = useState<Payment[]>(paymentEntries);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<Payment>>({
    date: format(new Date(), "yyyy-MM-dd"),
    entityType: "Customer",
    receivedBy: "Current User"
  });
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleOpenDialog = () => {
    setCurrentEntry({
      date: format(new Date(), "yyyy-MM-dd"),
      entityType: "Customer",
      receivedBy: "Current User"
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleFormSubmit = () => {
    if (
      !currentEntry.date ||
      !currentEntry.entityType ||
      !currentEntry.entityName ||
      !currentEntry.amount ||
      !currentEntry.paymentMethod ||
      !currentEntry.reference ||
      !currentEntry.description
    ) {
      // In a real app, show validation message
      return;
    }

    const newEntry: Payment = {
      id: uuidv4(),
      date: currentEntry.date,
      entityType: currentEntry.entityType as 'Customer' | 'Dealer',
      entityName: currentEntry.entityName,
      amount: Number(currentEntry.amount),
      paymentMethod: currentEntry.paymentMethod,
      reference: currentEntry.reference,
      description: currentEntry.description,
      invoiceNumbers: currentEntry.invoiceNumbers,
      receivedBy: currentEntry.receivedBy || "Current User"
    };

    setEntries([newEntry, ...entries]);
    setIsDialogOpen(false);
  };

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setCurrentEntry({
      ...currentEntry,
      [field]: value
    });
  };

  // Calculate total payments by type
  const customerTotal = entries
    .filter(entry => entry.entityType === "Customer")
    .reduce((sum, entry) => sum + entry.amount, 0);
  
  const dealerTotal = entries
    .filter(entry => entry.entityType === "Dealer")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const columns = [
    {
      key: "date",
      header: "Date"
    },
    {
      key: "entityType",
      header: "Type",
      cell: (row: Payment) => (
        <Badge variant={row.entityType === "Customer" ? "default" : "secondary"}>
          {row.entityType}
        </Badge>
      )
    },
    {
      key: "entityName",
      header: "Name"
    },
    {
      key: "amount",
      header: "Amount",
      cell: (row: Payment) => formatCurrency(row.amount)
    },
    {
      key: "paymentMethod",
      header: "Payment Method"
    },
    {
      key: "reference",
      header: "Reference"
    },
    {
      key: "description",
      header: "Description"
    },
    {
      key: "invoiceNumbers",
      header: "Invoices",
      cell: (row: Payment) => row.invoiceNumbers?.join(", ") || "-"
    },
    {
      key: "receivedBy",
      header: "Received By"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dealer / Customer Payments</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Customer Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(customerTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {entries.filter(e => e.entityType === "Customer").length} payments received
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dealer Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dealerTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {entries.filter(e => e.entityType === "Dealer").length} payments made
            </p>
          </CardContent>
        </Card>
      </div>

      <EntryTable 
        columns={columns} 
        data={entries} 
        onAdd={handleOpenDialog}
        addButtonText="Add Payment Entry"
      />

      <EntryFormDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title="Add Payment Entry"
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
            <Label htmlFor="entityType">Payment Type *</Label>
            <Select 
              value={currentEntry.entityType} 
              onValueChange={(value) => handleInputChange("entityType", value)}
            >
              <SelectTrigger id="entityType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Customer">Customer Payment</SelectItem>
                <SelectItem value="Dealer">Dealer Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entityName">
              {currentEntry.entityType === "Customer" ? "Customer Name *" : "Dealer Name *"}
            </Label>
            <Input 
              id="entityName" 
              placeholder={`Enter ${currentEntry.entityType?.toLowerCase() || "entity"} name`} 
              value={currentEntry.entityName || ""} 
              onChange={(e) => handleInputChange("entityName", e.target.value)} 
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
            <Label htmlFor="reference">Reference Number *</Label>
            <Input 
              id="reference" 
              placeholder="Cheque/Transaction reference" 
              value={currentEntry.reference || ""} 
              onChange={(e) => handleInputChange("reference", e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoiceNumbers">Invoice Numbers (comma separated)</Label>
            <Input 
              id="invoiceNumbers" 
              placeholder="e.g. INV-001, INV-002" 
              value={currentEntry.invoiceNumbers?.join(", ") || ""} 
              onChange={(e) => {
                const invoiceArray = e.target.value.split(",").map(s => s.trim());
                handleInputChange("invoiceNumbers", invoiceArray);
              }} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receivedBy">Received By</Label>
            <Input 
              id="receivedBy" 
              placeholder="Who received the payment" 
              value={currentEntry.receivedBy || ""} 
              onChange={(e) => handleInputChange("receivedBy", e.target.value)} 
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

export default CustomerPayments;
