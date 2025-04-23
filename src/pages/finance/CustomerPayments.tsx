import React, { useState, useEffect } from "react";
import { paymentMethods } from "@/data/finance";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/utils/finance/financeUtils";

// Define a type for the raw data coming from Supabase
type RawCashEntry = {
  id: string;
  date: string;
  amount: number;
  department: string;
  category: string;
  description: string;
  payment_method: string;
  entered_by: string;
  type: string;
  reference?: string;
  branch?: string;
  invoice_number?: string;
  narration?: string;
  po_number?: string;
  created_at?: string;
};

// Define a type for the raw data coming from receivables table
type RawReceivable = {
  id: string;
  customer: string;
  customer_id: string;
  invoicenumber: string;
  date: string;
  duedate: string;
  amount: number;
  amountpaid: number;
  balance: number;
  status: string;
  contactperson?: string;
  contactnumber?: string;
  lastfollowup?: string;
  notes?: string;
  department?: string;
  branch?: string;
  paymentmethod?: string;
  paymentmode?: string;
  created_at: string;
  priority: string;
};

const CustomerPayments = () => {
  const [entries, setEntries] = useState<Payment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<Payment>>({
    date: format(new Date(), "yyyy-MM-dd"),
    entityType: "Customer",
    receivedBy: "Current User"
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchPaymentEntries();
  }, []);

  const fetchPaymentEntries = async () => {
    setLoading(true);
    
    try {
      // Fetch payments from cash_entries table where type is Income
      // These represent customer payments (revenue)
      const { data, error } = await supabase
        .from("cash_entries")
        .select("*")
        .eq("type", "Income")
        .order("date", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Transform the cash entries into the Payment type format
        const formattedEntries: Payment[] = data.map((entry: RawCashEntry) => ({
          id: entry.id,
          date: entry.date,
          entityType: "Customer",
          entityName: entry.description.split(' ')[0] || "Customer",
          amount: entry.amount,
          paymentMethod: entry.payment_method,
          reference: entry.reference || "",
          description: entry.description,
          invoiceNumbers: entry.invoice_number ? [entry.invoice_number] : [],
          receivedBy: entry.entered_by
        }));
        
        setEntries(formattedEntries);
      }
    } catch (error: any) {
      console.error("Error fetching payments:", error.message);
      toast({
        title: "Error",
        description: "Failed to load payment data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  const handleFormSubmit = async () => {
    if (
      !currentEntry.date ||
      !currentEntry.entityType ||
      !currentEntry.entityName ||
      !currentEntry.amount ||
      !currentEntry.paymentMethod ||
      !currentEntry.description
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Insert into cash_entries for tracking payments
      const insertData = {
        id: uuidv4(),
        date: currentEntry.date,
        amount: Number(currentEntry.amount),
        type: "Income",
        department: currentEntry.entityType === "Customer" ? "Sales" : "Dealer",
        category: "Payment",
        description: `${currentEntry.entityName} - ${currentEntry.description}`,
        payment_method: currentEntry.paymentMethod,
        reference: currentEntry.reference || "",
        entered_by: currentEntry.receivedBy || "Current User",
        invoice_number: currentEntry.invoiceNumbers?.join(", ") || null
      };

      const { error } = await supabase
        .from("cash_entries")
        .insert([insertData]);
      
      if (error) throw error;

      // If this payment is for a specific receivable, update the receivable record
      if (currentEntry.invoiceNumbers && currentEntry.invoiceNumbers.length > 0) {
        // Update each receivable with this invoice number
        for (const invoiceNumber of currentEntry.invoiceNumbers) {
          const { data: receivableData } = await supabase
            .from("receivables")
            .select("*")
            .eq("invoicenumber", invoiceNumber)
            .single();
          
          if (receivableData) {
            const newAmountPaid = (receivableData.amountpaid || 0) + Number(currentEntry.amount);
            const newBalance = receivableData.amount - newAmountPaid;
            const newStatus = newBalance <= 0 ? "Cleared" : "Partial";
            
            await supabase
              .from("receivables")
              .update({
                amountpaid: newAmountPaid,
                balance: newBalance,
                status: newStatus,
                paymentmethod: currentEntry.paymentMethod
              })
              .eq("id", receivableData.id);
          }
        }
      }

      toast({
        title: "Success",
        description: "Payment entry added successfully.",
      });

      // Refresh the data
      fetchPaymentEntries();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error adding payment:", error.message);
      toast({
        title: "Error",
        description: "Failed to add payment entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  
  const dealerTotal = entries
    .filter(entry => entry.entityType === "Dealer")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

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
      cell: (row: Payment) => formatCurrency(Number(row.amount))
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
        isLoading={loading}
      />

      <EntryFormDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title="Add Payment Entry"
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
                const invoiceArray = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
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
