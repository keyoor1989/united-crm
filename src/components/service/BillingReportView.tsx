import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
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
import DateRangeFilter from "@/components/finance/DateRangeFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCall } from "@/types/service";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { ArrowUpDown, TrendingUp, TrendingDown, DollarSign, FileText } from "lucide-react";
import { fetchServiceExpenses } from "@/services/serviceExpenseService";
import { ServiceExpense } from "@/types/serviceExpense";
import { supabase } from "@/integrations/supabase/client";

interface BillingReportViewProps {
  serviceCalls: ServiceCall[];
}

interface ReconciliationDetail {
  partId: string;
  purchasePrice: number;
}

const BillingReportView = ({ serviceCalls }: BillingReportViewProps) => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [activeTab, setActiveTab] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);
  const [serviceExpenses, setServiceExpenses] = useState<ServiceExpense[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [reconciliationDetails, setReconciliationDetails] = useState<Record<string, ReconciliationDetail[]>>({});
  
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };
  
  useEffect(() => {
    const fetchReconciledPartsDetails = async () => {
      try {
        const { data: reconciliations, error: reconciliationError } = await supabase
          .from('part_reconciliations')
          .select('service_call_id, part_id, part_name');
          
        if (reconciliationError) {
          console.error("Error fetching part reconciliations:", reconciliationError);
          return;
        }
        
        if (!reconciliations || reconciliations.length === 0) {
          return;
        }
        
        const detailsByServiceCall: Record<string, ReconciliationDetail[]> = {};
        
        const partNames = [...new Set(reconciliations.map(r => r.part_name))];
        
        const { data: stockEntries, error: stockError } = await supabase
          .from('opening_stock_entries')
          .select('part_name, purchase_price')
          .in('part_name', partNames);
          
        if (stockError) {
          console.error("Error fetching stock entries:", stockError);
          return;
        }
        
        const partPriceMap: Record<string, number> = {};
        stockEntries?.forEach(entry => {
          partPriceMap[entry.part_name] = Number(entry.purchase_price);
        });
        
        reconciliations.forEach(recon => {
          if (!detailsByServiceCall[recon.service_call_id]) {
            detailsByServiceCall[recon.service_call_id] = [];
          }
          
          detailsByServiceCall[recon.service_call_id].push({
            partId: recon.part_id,
            purchasePrice: partPriceMap[recon.part_name] || 0
          });
        });
        
        console.log("Reconciliation details:", detailsByServiceCall);
        console.log("Part price map:", partPriceMap);
        
        setReconciliationDetails(detailsByServiceCall);
      } catch (error) {
        console.error("Error in fetchReconciledPartsDetails:", error);
      }
    };
    
    fetchReconciledPartsDetails();
  }, []);
  
  useEffect(() => {
    const getServiceExpenses = async () => {
      setIsLoadingExpenses(true);
      try {
        const expenses = await fetchServiceExpenses();
        console.log("BillingReportView - Fetched service expenses:", expenses);
        setServiceExpenses(expenses);
      } catch (error) {
        console.error("Error fetching service expenses:", error);
      } finally {
        setIsLoadingExpenses(false);
      }
    };
    
    getServiceExpenses();
  }, []);
  
  const processedCalls = serviceCalls.map(call => {
    console.log("Processing service call:", call.id, call.customerName);
    
    const reconciledParts = reconciliationDetails[call.id] || [];
    
    const callExpenses = serviceExpenses.filter(expense => 
      expense.serviceCallId === call.id && 
      expense.engineerId !== "system" &&
      !expense.isReimbursed
    );
    
    const partsCost = call.partsUsed?.reduce((total, part) => {
      const reconciledPart = reconciledParts.find(rp => rp.partId === part.id);
      
      const costPerUnit = reconciledPart ? reconciledPart.purchasePrice : 
                          (part.cost || part.price * 0.6);
                          
      return total + (costPerUnit * part.quantity);
    }, 0) || 0;
    
    const serviceExpensesTotal = callExpenses.reduce((total, expense) => 
      total + expense.amount, 0) || 0;
    
    const totalExpenses = serviceExpensesTotal + partsCost;
    
    const partsRevenue = call.partsUsed?.reduce((total, part) => 
      total + (part.price * part.quantity), 0) || 0;
    const totalRevenue = (call.serviceCharge || 0) + partsRevenue;
    
    const profit = totalRevenue - totalExpenses;
    
    console.log(`BillingReportView - Service Call ${call.id}:`, {
      revenue: totalRevenue,
      partsCost,
      serviceExpenses: serviceExpensesTotal,
      allExpensesForThisCall: serviceExpenses.filter(expense => expense.serviceCallId === call.id),
      callExpensesConsideredForProfit: callExpenses,
      totalExpenses,
      profit,
      unreimbursedExpensesCount: callExpenses.length
    });
    
    return {
      ...call,
      partsCost,
      serviceExpensesTotal,
      totalExpenses,
      totalRevenue,
      profit,
      type: "service_call"
    };
  });
  
  const serviceChargeItems = serviceExpenses
    .filter(expense => expense.engineerId === "system" && expense.isReimbursed)
    .map(expense => {
      console.log("Service charge item:", expense);
      
      return {
        id: expense.id,
        createdAt: expense.date,
        customerName: expense.customerName || "Unknown Customer",
        issueType: "Service Charge",
        serviceCharge: expense.amount,
        partsUsed: [],
        totalExpenses: 0,
        totalRevenue: expense.amount,
        profit: expense.amount,
        isPaid: true,
        partsReconciled: true,
        type: "service_charge"
      };
    });
  
  const allBillingItems = [...processedCalls, ...serviceChargeItems];
  
  const filteredCalls = allBillingItems.filter(call => {
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

  const tabFilteredCalls = filteredCalls.filter(call => {
    if (activeTab === "all") return true;
    if (activeTab === "paid") return call.isPaid;
    if (activeTab === "unpaid") return !call.isPaid; 
    if (activeTab === "reconciled") return call.partsReconciled;
    if (activeTab === "unreconciled") return !call.partsReconciled;
    if (activeTab === "profitable") return (call.profit || 0) > 0;
    if (activeTab === "unprofitable") return (call.profit || 0) <= 0;
    return true;
  });
  
  const sortedCalls = [...tabFilteredCalls].sort((a, b) => {
    if (!sortConfig) return 0;

    let aValue, bValue;
    
    switch (sortConfig.key) {
      case 'date':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'customer':
        aValue = a.customerName;
        bValue = b.customerName;
        break;
      case 'serviceCharge':
        aValue = a.serviceCharge || 0;
        bValue = b.serviceCharge || 0;
        break;
      case 'partsValue':
        if (a.type === "service_charge") {
          aValue = 0;
        } else {
          aValue = a.partsUsed?.reduce((total, part) => total + (part.price * part.quantity), 0) || 0;
        }
        if (b.type === "service_charge") {
          bValue = 0;
        } else {
          bValue = b.partsUsed?.reduce((total, part) => total + (part.price * part.quantity), 0) || 0;
        }
        break;
      case 'total':
        aValue = a.totalRevenue || 0;
        bValue = b.totalRevenue || 0;
        break;
      case 'profit':
        aValue = a.profit || 0;
        bValue = b.profit || 0;
        break;
      default:
        return 0;
    }
    
    if (sortConfig.direction === 'ascending') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  const totalServiceCharges = sortedCalls.reduce((sum, call) => sum + (call.serviceCharge || 0), 0);
  const totalPartsValue = sortedCalls.reduce((sum, call) => {
    if (call.type === "service_charge") return sum;
    return sum + (call.partsUsed?.reduce((total, part) => total + (part.price * part.quantity), 0) || 0);
  }, 0);
  const totalExpenses = sortedCalls.reduce((sum, call) => sum + (call.totalExpenses || 0), 0);
  const totalProfit = sortedCalls.reduce((sum, call) => sum + (call.profit || 0), 0);
  
  const unpaidAmount = sortedCalls.filter(call => !call.isPaid).reduce((sum, call) => {
    if (call.type === "service_charge") return sum;
    const partsValue = call.partsUsed?.reduce((total, part) => total + (part.price * part.quantity), 0) || 0;
    return sum + (call.serviceCharge || 0) + partsValue;
  }, 0);
  
  const paidCalls = filteredCalls.filter(call => call.isPaid).length;
  const unpaidCalls = filteredCalls.filter(call => !call.isPaid).length;
  const reconciledCalls = filteredCalls.filter(call => call.partsReconciled).length;
  const unreconciledCalls = filteredCalls.filter(call => !call.partsReconciled).length;
  const profitableCalls = filteredCalls.filter(call => (call.profit || 0) > 0).length;
  const unprofitableCalls = filteredCalls.filter(call => (call.profit || 0) <= 0).length;
  
  const exportToCSV = () => {
    const headers = [
      "Date",
      "Customer",
      "Service Type",
      "Service Charge (₹)",
      "Parts Value (₹)",
      "Expenses (₹)",
      "Total Revenue (₹)",
      "Profit/Loss (₹)",
      "Payment Status",
      "Parts Reconciled"
    ];
    
    const rows = sortedCalls.map(call => {
      const partsValue = call.partsUsed?.reduce((total, part) => total + (part.price * part.quantity), 0) || 0;
      return [
        format(new Date(call.createdAt), "dd/MM/yyyy"),
        call.customerName,
        call.issueType,
        call.serviceCharge || 0,
        partsValue,
        call.totalExpenses || 0,
        call.totalRevenue || 0,
        call.profit || 0,
        call.isPaid ? "Paid" : "Unpaid",
        call.partsReconciled ? "Yes" : "No"
      ];
    });
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
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
      
      <div className="flex flex-col md:flex-row gap-4 md:items-start justify-between">
        <DateRangeFilter 
          dateRange={dateRange} 
          onDateRangeChange={setDateRange} 
        />
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Card className="w-36">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-center">₹{totalServiceCharges.toFixed(2)}</div>
              <div className="text-xs text-center text-muted-foreground">Service Charges</div>
            </CardContent>
          </Card>
          <Card className="w-36">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-center">₹{totalPartsValue.toFixed(2)}</div>
              <div className="text-xs text-center text-muted-foreground">Parts Value</div>
            </CardContent>
          </Card>
          <Card className="w-36">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-center text-red-500">₹{totalExpenses.toFixed(2)}</div>
              <div className="text-xs text-center text-muted-foreground">Total Expenses</div>
            </CardContent>
          </Card>
          <Card className="w-36">
            <CardContent className="p-3">
              <div className={`text-2xl font-bold text-center ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ₹{totalProfit.toFixed(2)}
              </div>
              <div className="text-xs text-center text-muted-foreground">Net Profit/Loss</div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full md:w-auto">
          <TabsTrigger value="all">All ({filteredCalls.length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({paidCalls})</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid ({unpaidCalls})</TabsTrigger>
          <TabsTrigger value="reconciled">Reconciled ({reconciledCalls})</TabsTrigger>
          <TabsTrigger value="unreconciled">Unreconciled ({unreconciledCalls})</TabsTrigger>
          <TabsTrigger value="profitable">Profitable ({profitableCalls})</TabsTrigger>
          <TabsTrigger value="unprofitable">Unprofitable ({unprofitableCalls})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <BillingTable calls={sortedCalls} requestSort={requestSort} sortConfig={sortConfig} />
        </TabsContent>
        
        <TabsContent value="paid" className="mt-4">
          <BillingTable calls={sortedCalls} requestSort={requestSort} sortConfig={sortConfig} />
        </TabsContent>
        
        <TabsContent value="unpaid" className="mt-4">
          <BillingTable calls={sortedCalls} requestSort={requestSort} sortConfig={sortConfig} />
        </TabsContent>
        
        <TabsContent value="reconciled" className="mt-4">
          <BillingTable calls={sortedCalls} requestSort={requestSort} sortConfig={sortConfig} />
        </TabsContent>
        
        <TabsContent value="unreconciled" className="mt-4">
          <BillingTable calls={sortedCalls} requestSort={requestSort} sortConfig={sortConfig} />
        </TabsContent>
        
        <TabsContent value="profitable" className="mt-4">
          <BillingTable calls={sortedCalls} requestSort={requestSort} sortConfig={sortConfig} />
        </TabsContent>
        
        <TabsContent value="unprofitable" className="mt-4">
          <BillingTable calls={sortedCalls} requestSort={requestSort} sortConfig={sortConfig} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface BillingTableProps {
  calls: any[];
  requestSort: (key: string) => void;
  sortConfig: {
    key: string;
    direction: 'ascending' | 'descending';
  } | null;
}

const BillingTable = ({ calls, requestSort, sortConfig }: BillingTableProps) => {
  const getSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-1 h-4 w-4" />;
    }
    
    return sortConfig.direction === 'ascending' 
      ? <TrendingUp className="ml-1 h-4 w-4" />
      : <TrendingDown className="ml-1 h-4 w-4" />;
  };
  
  return (
    <Table>
      <TableCaption>Service billing information</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="cursor-pointer" onClick={() => requestSort('date')}>
            <div className="flex items-center">
              Date {getSortIndicator('date')}
            </div>
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => requestSort('customer')}>
            <div className="flex items-center">
              Customer {getSortIndicator('customer')}
            </div>
          </TableHead>
          <TableHead>Service Type</TableHead>
          <TableHead className="text-right cursor-pointer" onClick={() => requestSort('serviceCharge')}>
            <div className="flex items-center justify-end">
              Service Charge (₹) {getSortIndicator('serviceCharge')}
            </div>
          </TableHead>
          <TableHead className="text-right cursor-pointer" onClick={() => requestSort('partsValue')}>
            <div className="flex items-center justify-end">
              Parts Value (₹) {getSortIndicator('partsValue')}
            </div>
          </TableHead>
          <TableHead className="text-right">Expenses (₹)</TableHead>
          <TableHead className="text-right cursor-pointer" onClick={() => requestSort('total')}>
            <div className="flex items-center justify-end">
              Total Revenue (₹) {getSortIndicator('total')}
            </div>
          </TableHead>
          <TableHead className="text-right cursor-pointer" onClick={() => requestSort('profit')}>
            <div className="flex items-center justify-end">
              Profit/Loss (₹) {getSortIndicator('profit')}
            </div>
          </TableHead>
          <TableHead>Payment Status</TableHead>
          <TableHead>Parts Reconciled</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {calls.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="text-center py-6">No service calls found</TableCell>
          </TableRow>
        ) : (
          calls.map(call => {
            const isServiceCharge = call.type === "service_charge";
            const partsValue = isServiceCharge ? 0 : 
              (call.partsUsed?.reduce((total, part) => total + (part.price * part.quantity), 0) || 0);
            const totalRevenue = isServiceCharge ? call.totalRevenue : 
              ((call.serviceCharge || 0) + partsValue);
            const profit = call.profit || 0;
            
            return (
              <TableRow key={call.id}>
                <TableCell>{format(new Date(call.createdAt), "dd/MM/yyyy")}</TableCell>
                <TableCell>{call.customerName}</TableCell>
                <TableCell>
                  {isServiceCharge ? (
                    <Badge variant="outline" className="bg-blue-50">Service Charge</Badge>
                  ) : (
                    call.issueType
                  )}
                </TableCell>
                <TableCell className="text-right">{(call.serviceCharge || 0).toFixed(2)}</TableCell>
                <TableCell className="text-right">{partsValue.toFixed(2)}</TableCell>
                <TableCell className="text-right text-red-500">{(call.totalExpenses || 0).toFixed(2)}</TableCell>
                <TableCell className="text-right">{totalRevenue.toFixed(2)}</TableCell>
                <TableCell className="text-right font-medium">
                  <span className={profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {profit >= 0 && '+'}{profit.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={call.isPaid ? "success" : "outline"}>
                    {call.isPaid ? "Paid" : "Unpaid"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {isServiceCharge ? (
                    <Badge variant="success">N/A</Badge>
                  ) : (
                    <Badge variant={call.partsReconciled ? "success" : "destructive"}>
                      {call.partsReconciled ? "Yes" : "No"}
                    </Badge>
                  )}
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
