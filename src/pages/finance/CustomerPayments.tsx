
import React, { useState, useEffect } from "react";
import { paymentMethods } from "@/data/finance";
import PaymentList from "@/components/finance/PaymentList";
import PaymentForm from "@/components/finance/PaymentForm";
import PaymentSummaryCards from "@/components/finance/PaymentSummaryCards";
import { Payment } from "@/types/finance";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

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
  type: string; // Accept any string here safely for mapping
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
            .maybeSingle();
          
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

  // Columns for PaymentList (can be customized further if needed)
  const columns = undefined; // falling back to defaults for PaymentList

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dealer / Customer Payments</h1>
      </div>

      <PaymentSummaryCards entries={entries} />

      <PaymentList 
        data={entries}
        columns={columns}
        isLoading={loading}
        onAdd={handleOpenDialog}
      />

      <PaymentForm
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleFormSubmit}
        isSubmitting={loading}
        currentEntry={currentEntry}
        onInputChange={handleInputChange}
      />
    </div>
  );
};

export default CustomerPayments;
