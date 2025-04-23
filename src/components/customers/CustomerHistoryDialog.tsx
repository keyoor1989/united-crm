
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ListOrdered, User, MessageSquare, Info, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CustomerType } from "@/types/customer";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerType | null;
}

export const CustomerHistoryDialog: React.FC<Props> = ({ open, onOpenChange, customer }) => {
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [serviceCalls, setServiceCalls] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    const fetchHistory = async () => {
      if (!customer?.id || !open) return;
      
      setLoading(true);
      try {
        // Fetch all data in parallel with proper error handling for each request
        const salesPromise = supabase
          .from("sales")
          .select("*")
          .eq("customer_name", customer.name)
          .order('date', { ascending: false });
            
        const quotationsPromise = supabase
          .from("quotations")
          .select("*")
          .eq("customer_name", customer.name)
          .order('created_at', { ascending: false });
            
        const serviceCallsPromise = supabase
          .from("service_calls")
          .select("*")
          .eq("customer_name", customer.name)
          .order('created_at', { ascending: false });
            
        const notesPromise = supabase
          .from("customer_notes")
          .select("*")
          .eq("customer_id", customer.id)
          .order('created_at', { ascending: false });
        
        // Wait for all promises to resolve
        const [
          salesResponse, 
          quotationsResponse, 
          serviceCallsResponse, 
          notesResponse
        ] = await Promise.allSettled([
          salesPromise,
          quotationsPromise,
          serviceCallsPromise,
          notesPromise
        ]);
        
        // Only update state if component is still mounted
        if (!isMounted) return;

        // Process sales data
        if (salesResponse.status === 'fulfilled') {
          const { data, error } = salesResponse.value;
          if (error) {
            console.error("Error fetching sales:", error);
          } else {
            setSales(data || []);
          }
        }
        
        // Process quotations data
        if (quotationsResponse.status === 'fulfilled') {
          const { data, error } = quotationsResponse.value;
          if (error) {
            console.error("Error fetching quotations:", error);
          } else {
            setQuotations(data || []);
          }
        }
        
        // Process service calls data
        if (serviceCallsResponse.status === 'fulfilled') {
          const { data, error } = serviceCallsResponse.value;
          if (error) {
            console.error("Error fetching service calls:", error);
          } else {
            setServiceCalls(data || []);
          }
        }
        
        // Process notes data
        if (notesResponse.status === 'fulfilled') {
          const { data, error } = notesResponse.value;
          if (error) {
            console.error("Error fetching customer notes:", error);
          } else {
            setNotes(data || []);
          }
        }
      } catch (error) {
        console.error("Error fetching customer history:", error);
        if (isMounted) {
          toast({
            title: "Error loading history",
            description: "There was a problem loading customer history. Please try again.",
            variant: "destructive"
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (open) {
      fetchHistory();
    }
    
    return () => {
      isMounted = false;
    };
  }, [open, customer, toast]);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Customer History</DialogTitle>
          <DialogDescription>
            All activity & records for <span className="font-semibold">{customer?.name}</span>
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="all">
          <TabsList className="mb-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="quotations">Quotations</TabsTrigger>
            <TabsTrigger value="service">Service Calls</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          {/* ALL TAB */}
          <TabsContent value="all">
            {loading ? <HistorySkeleton /> : (
              <div className="space-y-2">
                <Section label="Sales" items={sales} type="sales" />
                <Section label="Quotations" items={quotations} type="quotation" />
                <Section label="Service Calls" items={serviceCalls} type="service" />
                <Section label="Notes" items={notes} type="note" />
              </div>
            )}
          </TabsContent>
          <TabsContent value="sales">
            {loading ? <HistorySkeleton /> : (
              sales.length > 0 ? (
                <Section label="Sales" items={sales} type="sales" />
              ) : (
                <EmptyState message="No sales found for this customer" />
              )
            )}
          </TabsContent>
          <TabsContent value="quotations">
            {loading ? <HistorySkeleton /> : (
              quotations.length > 0 ? (
                <Section label="Quotations" items={quotations} type="quotation" />
              ) : (
                <EmptyState message="No quotations found for this customer" />
              )
            )}
          </TabsContent>
          <TabsContent value="service">
            {loading ? <HistorySkeleton /> : (
              serviceCalls.length > 0 ? (
                <Section label="Service Calls" items={serviceCalls} type="service" />
              ) : (
                <EmptyState message="No service calls found for this customer" />
              )
            )}
          </TabsContent>
          <TabsContent value="notes">
            {loading ? <HistorySkeleton /> : (
              notes.length > 0 ? (
                <Section label="Notes" items={notes} type="note" />
              ) : (
                <EmptyState message="No notes found for this customer" />
              )
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md border-dashed">
      <Info className="w-10 h-10 text-muted-foreground mb-2 opacity-40" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

function Section({ label, items, type }: { label: string, items: any[], type: string }) {
  if (!items.length) {
    return (
      <div className="border rounded px-3 py-4 mb-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Info className="h-4 w-4" />
          No {label.toLowerCase()} found.
        </div>
      </div>
    );
  }
  return (
    <div className="mb-4">
      <div className="font-semibold text-base mb-2 flex items-center gap-2">
        {typeIcon(type)}
        {label}
        <Badge variant="secondary">{items.length}</Badge>
      </div>
      <div className="space-y-2">
        {items.map((item) =>
          <HistoryItem key={item.id || item.created_at} item={item} type={type} />
        )}
      </div>
    </div>
  );
}

function typeIcon(type: string) {
  switch (type) {
    case "sales": return <ListOrdered className="h-4 w-4" />;
    case "quotation": return <FileText className="h-4 w-4" />;
    case "service": return <User className="h-4 w-4" />;
    case "note": return <MessageSquare className="h-4 w-4" />;
    default: return <Info className="h-4 w-4" />;
  }
}

function HistoryItem({ item, type }: { item: any, type: string }) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString || '-';
    }
  };

  switch (type) {
    case "sales":
      return (
        <div className="border rounded-md p-2 flex flex-col sm:flex-row gap-4 items-center justify-between text-sm">
          <div>
            <span className="font-medium">Sale #</span> {item.sales_number || item.invoice_number || "-"} | <span className="font-medium">Amount:</span> ₹{item.total_amount?.toLocaleString() || 0}
            <div className="text-xs text-muted-foreground">Status: {item.status}, Payment: {item.payment_status}</div>
          </div>
          <div className="text-xs text-muted-foreground">{formatDate(item.date)}</div>
        </div>
      );
    case "quotation":
      return (
        <div className="border rounded-md p-2 flex flex-col sm:flex-row gap-4 items-center justify-between text-sm">
          <div>
            <span className="font-medium">Quotation #</span> {item.quotation_number || "-"} | <span className="font-medium">Amount:</span> ₹{item.grand_total?.toLocaleString() || 0}
            <div className="text-xs text-muted-foreground">Status: {item.status}</div>
          </div>
          <div className="text-xs text-muted-foreground">{formatDate(item.created_at)}</div>
        </div>
      );
    case "service":
      return (
        <div className="border rounded-md p-2 flex flex-col sm:flex-row gap-4 items-center justify-between text-sm">
          <div>
            <span className="font-medium">Service Call:</span> {item.issue_type} <span className="text-muted-foreground">({item.machine_model || 'N/A'})</span>
            <div className="text-xs text-muted-foreground">Status: {item.status}</div>
          </div>
          <div className="text-xs text-muted-foreground">{formatDate(item.created_at)}</div>
        </div>
      );
    case "note":
      return (
        <div className="border rounded-md p-2 flex flex-col sm:flex-row gap-4 items-center justify-between text-sm">
          <div>
            <span className="font-medium">Note:</span> {item.content || "-"}
          </div>
          <div className="text-xs text-muted-foreground">{formatDate(item.created_at)}</div>
        </div>
      );
    default:
      return null;
  }
}

function HistorySkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Loading customer history...</span>
      </div>
      {[1, 2, 3].map(i => (
        <Skeleton className="h-12 w-full" key={i} />
      ))}
    </div>
  );
}
