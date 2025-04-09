
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ShoppingCart, FileCheck, Calendar } from "lucide-react";

type HistoryItem = {
  id: number;
  type: "quotation" | "invoice" | "appointment";
  title: string;
  date: string;
  amount?: number;
  status: string;
};

const mockHistory: HistoryItem[] = [
  {
    id: 1,
    type: "quotation",
    title: "Quotation for Kyocera 2554ci",
    date: "2025-03-02",
    amount: 85000,
    status: "sent",
  },
  {
    id: 2,
    type: "invoice",
    title: "Invoice #INV-2023-456",
    date: "2025-03-15",
    amount: 92500,
    status: "paid",
  },
  {
    id: 3,
    type: "appointment",
    title: "Service Visit",
    date: "2025-03-20",
    status: "scheduled",
  },
  {
    id: 4,
    type: "quotation",
    title: "Quotation for AMC Renewal",
    date: "2025-03-25",
    amount: 15000,
    status: "pending",
  }
];

export default function CustomerHistory() {
  const [historyItems] = useState<HistoryItem[]>(mockHistory);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-blue-500">Sent</Badge>;
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "pending":
        return <Badge className="bg-amber-500">Pending</Badge>;
      case "scheduled":
        return <Badge className="bg-purple-500">Scheduled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "quotation":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "invoice":
        return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case "appointment":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      default:
        return <FileCheck className="h-4 w-4" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Customer History</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="quotations">Quotations</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[240px]">
            <TabsContent value="all" className="m-0">
              {renderHistoryItems(historyItems)}
            </TabsContent>
            
            <TabsContent value="quotations" className="m-0">
              {renderHistoryItems(historyItems.filter(item => item.type === "quotation"))}
            </TabsContent>
            
            <TabsContent value="invoices" className="m-0">
              {renderHistoryItems(historyItems.filter(item => item.type === "invoice"))}
            </TabsContent>
            
            <TabsContent value="appointments" className="m-0">
              {renderHistoryItems(historyItems.filter(item => item.type === "appointment"))}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
  
  function renderHistoryItems(items: HistoryItem[]) {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-40 border rounded-md border-dashed">
          <FileText className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">No history found</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3 border-b pb-3 last:border-b-0">
            <div className="bg-muted rounded-md p-2">{getIcon(item.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap justify-between gap-2">
                <h4 className="font-medium text-sm">{item.title}</h4>
                {getStatusBadge(item.status)}
              </div>
              <div className="flex flex-wrap gap-4 mt-1 text-xs text-muted-foreground">
                <span>Date: {new Date(item.date).toLocaleDateString()}</span>
                {item.amount && <span>Amount: ₹{item.amount.toLocaleString()}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
