
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ListOrdered, User, MessageSquare, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CustomerType } from "@/types/customer";

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

  useEffect(() => {
    const fetchHistory = async () => {
      if (!customer?.id) return;
      setLoading(true);

      const [{ data: salesData }, { data: quotationsData }, { data: serviceCallsData }, { data: notesData }] = await Promise.all([
        supabase.from("sales").select("*").eq("customer_id", customer.id).order('date', { ascending: false }),
        supabase.from("quotations").select("*").eq("customer_id", customer.id).order('created_at', { ascending: false }),
        supabase.from("service_calls").select("*").eq("customer_id", customer.id).order('created_at', { ascending: false }),
        supabase.from("customer_notes").select("*").eq("customer_id", customer.id).order('created_at', { ascending: false })
      ]);
      setSales(salesData || []);
      setQuotations(quotationsData || []);
      setServiceCalls(serviceCallsData || []);
      setNotes(notesData || []);
      setLoading(false);
    };
    if (open) fetchHistory();
  }, [open, customer]);

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
              <Section label="Sales" items={sales} type="sales" />
            )}
          </TabsContent>
          <TabsContent value="quotations">
            {loading ? <HistorySkeleton /> : (
              <Section label="Quotations" items={quotations} type="quotation" />
            )}
          </TabsContent>
          <TabsContent value="service">
            {loading ? <HistorySkeleton /> : (
              <Section label="Service Calls" items={serviceCalls} type="service" />
            )}
          </TabsContent>
          <TabsContent value="notes">
            {loading ? <HistorySkeleton /> : (
              <Section label="Notes" items={notes} type="note" />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

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
  switch (type) {
    case "sales":
      return (
        <div className="border rounded-md p-2 flex flex-col sm:flex-row gap-4 items-center justify-between text-sm">
          <div>
            <span className="font-medium">Sale #</span> {item.sales_number || item.invoice_number || "-"} | <span className="font-medium">Amount:</span> ₹{item.total_amount || 0}
            <div className="text-xs text-muted-foreground">Status: {item.status}, Payment: {item.payment_status}</div>
          </div>
          <div className="text-xs text-muted-foreground">{new Date(item.date).toLocaleString()}</div>
        </div>
      );
    case "quotation":
      return (
        <div className="border rounded-md p-2 flex flex-col sm:flex-row gap-4 items-center justify-between text-sm">
          <div>
            <span className="font-medium">Quotation #</span> {item.quotation_number || "-"} | <span className="font-medium">Amount:</span> ₹{item.grand_total || 0}
            <div className="text-xs text-muted-foreground">Status: {item.status}</div>
          </div>
          <div className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</div>
        </div>
      );
    case "service":
      return (
        <div className="border rounded-md p-2 flex flex-col sm:flex-row gap-4 items-center justify-between text-sm">
          <div>
            <span className="font-medium">Service Call:</span> {item.issue_type} <span className="text-muted-foreground">({item.machine_model})</span>
            <div className="text-xs text-muted-foreground">Status: {item.status}</div>
          </div>
          <div className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</div>
        </div>
      );
    case "note":
      return (
        <div className="border rounded-md p-2 flex flex-col sm:flex-row gap-4 items-center justify-between text-sm">
          <div>
            <span className="font-medium">Note:</span> {item.content || "-"}
          </div>
          <div className="text-xs text-muted-foreground">{item.created_at ? new Date(item.created_at).toLocaleString() : ""}</div>
        </div>
      );
    default:
      return null;
  }
}

function HistorySkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map(i => (
        <Skeleton className="h-12 w-full" key={i} />
      ))}
    </div>
  );
}
