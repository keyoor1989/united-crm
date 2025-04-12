
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateRangeFilter } from "@/components/finance/DateRangeFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCall } from "@/types/service";
import { format } from "date-fns";

interface BillingReportViewProps {
  serviceCalls: ServiceCall[];
}

const BillingReportView = ({ serviceCalls }: BillingReportViewProps) => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [activeTab, setActiveTab] = useState("all");
  
  // Filter service calls by date range if set
  const filteredCalls = serviceCalls.filter(call => {
    const callDate = new Date(call.createdAt);
    
    if (dateRange.from && dateRange.to) {
      return callDate >= dateRange.from && callDate <= dateRange.to;
    }
    
    if (dateRange.from && !dateRange.to) {
      return callDate >= dateRange.from;
    }
    
    if (!dateRange.from && dateRange.to) {
      return callDate <= dateRange.to;
    }
    
    return true;
  });

  // Further filter by tab/payment status
  const tabFilteredCalls = filteredCalls.filter(call => {
    if (activeTab === "all") return true;
    if (activeTab === "paid") return call.isPaid;
    if (activeTab === "unpaid") return !call.isPaid; 
    if (activeTab === "reconciled") return call.partsReconciled;
    if (activeTab === "unreconciled") return !call.partsReconciled;
    return true;
  });
  
  // Calculate totals
  const totalServiceCharges = tabFilteredCalls.reduce((sum, call) => sum + (call.serviceCharge || 0), 0);
  const totalPartsValue = tabFilteredCalls.reduce((sum, call) => {
    return sum + (call.partsUsed?.reduce((total, part) => total + (part.price * part.quantity), 0) || 0);
  }, 0);
  
  // Calculate how many calls are paid and unpaid
  const paidCalls = filteredCalls.filter(call => call.isPaid).length;
  const unpaidCalls = filteredCalls.filter(call => !call.isPaid).length;
  
  // Calculate how many calls have parts reconciled and unreconciled
  const reconciledCalls = filteredCalls.filter(call => call.partsReconciled).length;
  const unreconciledCalls = filteredCalls.filter(call => !call.partsReconciled).length;
  
  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      "Date",
      "Customer",
      "Service Type",
      "Service Charge (₹)",
      "Parts Value (₹)",
      "Total (₹)",
      "Payment Status",
      "Parts Reconciled"
    ];
    
    const rows = tabFilteredCalls.map(call => {
      const partsValue = call.partsUsed?.reduce((total, part) => total + (part.price * part.quantity), 0) || 0;
      return [
        format(new Date(call.createdAt), "dd/MM/yyyy"),
        call.customerName,
        call.issueType,
        call.serviceCharge || 0,
        partsValue,
        (call.serviceCharge || 0) + partsValue,
        call.isPaid ? "Paid" : "Unpaid",
        call.partsReconciled ? "Yes" : "No"
      ];
    });
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `service-billing-report-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Report Exported",
      description: "The billing report has been exported to CSV"
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Service Billing Report</h2>
        <Button onClick={exportToCSV}>Export to CSV</Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <DateRangeFilter 
          dateRange={dateRange} 
          onDateRangeChange={setDateRange} 
        />
        
        <div className="flex gap-2">
          <Card className="w-32">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-center">₹{totalServiceCharges}</div>
              <div className="text-xs text-center text-muted-foreground">Service Charges</div>
            </CardContent>
          </Card>
          <Card className="w-32">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-center">₹{totalPartsValue}</div>
              <div className="text-xs text-center text-muted-foreground">Parts Value</div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full md:w-auto">
          <TabsTrigger value="all">All ({filteredCalls.length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({paidCalls})</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid ({unpaidCalls})</TabsTrigger>
          <TabsTrigger value="reconciled">Reconciled Parts ({reconciledCalls})</TabsTrigger>
          <TabsTrigger value="unreconciled">Unreconciled Parts ({unreconciledCalls})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <BillingTable calls={tabFilteredCalls} />
        </TabsContent>
        
        <TabsContent value="paid" className="mt-4">
          <BillingTable calls={tabFilteredCalls} />
        </TabsContent>
        
        <TabsContent value="unpaid" className="mt-4">
          <BillingTable calls={tabFilteredCalls} />
        </TabsContent>
        
        <TabsContent value="reconciled" className="mt-4">
          <BillingTable calls={tabFilteredCalls} />
        </TabsContent>
        
        <TabsContent value="unreconciled" className="mt-4">
          <BillingTable calls={tabFilteredCalls} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface BillingTableProps {
  calls: ServiceCall[];
}

const BillingTable = ({ calls }: BillingTableProps) => {
  return (
    <Table>
      <TableCaption>Service billing information</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Service Type</TableHead>
          <TableHead className="text-right">Service Charge (₹)</TableHead>
          <TableHead className="text-right">Parts Value (₹)</TableHead>
          <TableHead className="text-right">Total (₹)</TableHead>
          <TableHead>Payment Status</TableHead>
          <TableHead>Parts Reconciled</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {calls.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-6">No service calls found</TableCell>
          </TableRow>
        ) : (
          calls.map(call => {
            const partsValue = call.partsUsed?.reduce((total, part) => total + (part.price * part.quantity), 0) || 0;
            return (
              <TableRow key={call.id}>
                <TableCell>{format(new Date(call.createdAt), "dd/MM/yyyy")}</TableCell>
                <TableCell>{call.customerName}</TableCell>
                <TableCell>{call.issueType}</TableCell>
                <TableCell className="text-right">{call.serviceCharge || 0}</TableCell>
                <TableCell className="text-right">{partsValue}</TableCell>
                <TableCell className="text-right font-medium">{(call.serviceCharge || 0) + partsValue}</TableCell>
                <TableCell>
                  <Badge variant={call.isPaid ? "success" : "outline"}>
                    {call.isPaid ? "Paid" : "Unpaid"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={call.partsReconciled ? "success" : "destructive"}>
                    {call.partsReconciled ? "Yes" : "No"}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

export default BillingReportView;
