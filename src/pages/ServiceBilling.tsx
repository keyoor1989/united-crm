
import React, { useState, useEffect } from "react";
import BillingReportView from "@/components/service/BillingReportView";
import { useServiceData } from "@/hooks/useServiceData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, CircleDollarSign, PiggyBank, BadgeDollarSign, Receipt, TrendingUp, AlertCircle } from "lucide-react";
import { ServiceCall } from "@/types/service";
import ServiceChargeForm from "@/components/service/ServiceChargeForm";
import ServiceExpenseList from "@/components/service/ServiceExpenseList";
import { fetchServiceExpenses } from "@/services/serviceExpenseService";
import { ServiceExpense } from "@/types/serviceExpense";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ServiceBilling = () => {
  const { allCalls, isLoading, fetchServiceCalls } = useServiceData();
  const [activeView, setActiveView] = useState<string>("billing");
  const [serviceExpenses, setServiceExpenses] = useState<ServiceExpense[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  
  useEffect(() => {
    const getServiceExpenses = async () => {
      setIsLoadingExpenses(true);
      try {
        const expenses = await fetchServiceExpenses();
        setServiceExpenses(expenses);
        console.log("Fetched service expenses:", expenses);
      } catch (error) {
        console.error("Error fetching service expenses:", error);
      } finally {
        setIsLoadingExpenses(false);
      }
    };
    
    getServiceExpenses();
  }, []);
  
  const calculateSummary = () => {
    if (!allCalls.length) return {
      totalRevenue: 0,
      totalExpenses: 0,
      totalProfit: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      paidCalls: 0,
      unpaidCalls: 0,
      profitableCallsPercent: 0,
      serviceTypeDistribution: []
    };
    
    console.log("All service expenses before processing:", serviceExpenses);
    
    const processedCalls = allCalls.map(call => {
      // Calculate parts cost
      const partsCost = call.partsUsed?.reduce((total, part) => 
        total + ((part.cost || part.price * 0.6) * part.quantity), 0) || 0;
      
      // Find expenses that actually impact profit calculation - only non-reimbursed expenses
      // We specifically match expenses to this exact service call ID (important!)
      const callExpenses = serviceExpenses.filter(expense => 
        expense.serviceCallId === call.id && 
        expense.engineerId !== "system" &&
        !expense.isReimbursed
      );
      
      console.log(`Finding expenses for call ${call.id} (${call.customerName}):`, callExpenses);
      
      // Calculate service expenses that affect profit (only unreimbursed expenses)
      const serviceCallExpenses = callExpenses.reduce((total, expense) => 
        total + expense.amount, 0) || 0;
      
      // Total expenses that affect profit
      const totalExpenses = serviceCallExpenses + partsCost;
      
      // Calculate revenue
      const partsRevenue = call.partsUsed?.reduce((total, part) => 
        total + (part.price * part.quantity), 0) || 0;
      const totalRevenue = (call.serviceCharge || 0) + partsRevenue;
      
      // Profit calculation - only considering expenses that haven't been reimbursed
      const profit = totalRevenue - totalExpenses;
      
      console.log(`Service Call ${call.id} calculation:`, {
        id: call.id,
        customerName: call.customerName,
        partsCost,
        unreimbursedExpenses: callExpenses,
        serviceCallExpenses,
        totalExpenses,
        partsRevenue,
        serviceCharge: call.serviceCharge || 0,
        totalRevenue,
        profit
      });
      
      return {
        ...call,
        partsCost,
        serviceCallExpenses,
        totalExpenses,
        totalRevenue,
        profit
      };
    });
    
    // Calculate summary statistics
    const totalRevenue = processedCalls.reduce((sum, call) => sum + (call.totalRevenue || 0), 0);
    const totalExpenses = processedCalls.reduce((sum, call) => sum + (call.totalExpenses || 0), 0);
    const totalProfit = processedCalls.reduce((sum, call) => sum + (call.profit || 0), 0);
    
    const paidCalls = processedCalls.filter(call => call.isPaid);
    const unpaidCalls = processedCalls.filter(call => !call.isPaid);
    
    const paidAmount = paidCalls.reduce((sum, call) => sum + (call.totalRevenue || 0), 0);
    const unpaidAmount = unpaidCalls.reduce((sum, call) => sum + (call.totalRevenue || 0), 0);
    
    const profitableCalls = processedCalls.filter(call => (call.profit || 0) > 0);
    const profitableCallsPercent = processedCalls.length > 0 
      ? (profitableCalls.length / processedCalls.length) * 100 
      : 0;
    
    // Count general expenses (not tied to service calls)
    const generalExpenses = serviceExpenses.filter(expense => 
      (expense.serviceCallId === "general" || expense.serviceCallId === "00000000-0000-0000-0000-000000000000") && 
      expense.engineerId !== "system" &&
      !expense.isReimbursed
    );
    
    const generalExpensesTotal = generalExpenses.reduce((total, expense) => total + expense.amount, 0);
    
    const serviceTypes = [...new Set(processedCalls.map(call => call.issueType))];
    const serviceTypeDistribution = serviceTypes.map(type => {
      const callsOfType = processedCalls.filter(call => call.issueType === type);
      const revenue = callsOfType.reduce((sum, call) => sum + (call.totalRevenue || 0), 0);
      const profit = callsOfType.reduce((sum, call) => sum + (call.profit || 0), 0);
      
      return {
        type,
        count: callsOfType.length,
        revenue,
        profit,
        margin: revenue > 0 ? (profit / revenue) * 100 : 0
      };
    }).sort((a, b) => b.revenue - a.revenue);
    
    console.log("Final summary calculation:", {
      totalRevenue,
      totalExpenses,
      totalProfit,
      paidAmount,
      unpaidAmount,
      generalExpensesTotal
    });
    
    return {
      totalRevenue,
      totalExpenses,
      totalProfit,
      paidAmount,
      unpaidAmount,
      paidCalls: paidCalls.length,
      unpaidCalls: unpaidCalls.length,
      profitableCallsPercent,
      serviceTypeDistribution,
      generalExpensesTotal,
      generalExpenses
    };
  };
  
  const summary = calculateSummary();
  
  const handleServiceChargeAdded = () => {
    fetchServiceCalls();
  };

  const handleExpenseStatusChanged = () => {
    console.log("Expense status changed, refreshing data...");
    fetchServiceCalls();
    
    const refreshExpenses = async () => {
      setIsLoadingExpenses(true);
      try {
        const expenses = await fetchServiceExpenses();
        console.log("Refreshed service expenses:", expenses);
        setServiceExpenses(expenses);
      } catch (error) {
        console.error("Error refreshing service expenses:", error);
      } finally {
        setIsLoadingExpenses(false);
      }
    };
    
    refreshExpenses();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Service Billing Management</h1>
        <p className="text-muted-foreground">
          Track service charges, parts usage, financial reconciliation, and profitability
        </p>
      </div>

      {isLoading || isLoadingExpenses ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading billing data...</p>
        </div>
      ) : (
        <Tabs value={activeView} onValueChange={setActiveView} className="space-y-4">
          <TabsList>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4" />
              Billing Report
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Financial Summary
            </TabsTrigger>
            <TabsTrigger value="add-charge" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Add Service Income
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Income & Expenses
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="billing">
            <BillingReportView serviceCalls={allCalls} />
          </TabsContent>
          
          <TabsContent value="summary">
            {summary.generalExpensesTotal > 0 && (
              <Alert variant="warning" className="mb-4 bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Unallocated Expenses Detected</AlertTitle>
                <AlertDescription>
                  There are ₹{summary.generalExpensesTotal.toFixed(2)} in general expenses not allocated to any service call.
                  These expenses are not reflected in any service call's profit calculation.
                  To fix this, edit these expenses and assign them to the appropriate service calls.
                </AlertDescription>
              </Alert>
            )}
          
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">₹{summary.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-full">
                      <CircleDollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Paid Amount</p>
                      <p className="text-lg font-semibold text-green-600">
                        ₹{summary.paidAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">{summary.paidCalls} calls</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Unpaid Amount</p>
                      <p className="text-lg font-semibold text-amber-600">
                        ₹{summary.unpaidAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">{summary.unpaidCalls} calls</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Profit Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Net Profit/Loss</p>
                      <p className={`text-2xl font-bold ${summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{summary.totalProfit.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-full">
                      <PiggyBank className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Total Expenses</p>
                      <p className="text-lg font-semibold text-red-600">
                        ₹{summary.totalExpenses.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Profitable Calls</p>
                      <p className="text-lg font-semibold">
                        {summary.profitableCallsPercent.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Service Type Profitability</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] overflow-auto">
                  {summary.serviceTypeDistribution.length === 0 ? (
                    <p className="text-center text-muted-foreground">No data available</p>
                  ) : (
                    <div className="space-y-4">
                      {summary.serviceTypeDistribution.map(item => (
                        <div key={item.type} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{item.type}</p>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                              {item.count} calls
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Revenue: ₹{item.revenue.toFixed(2)}</span>
                            <span className={item.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                              Profit: ₹{item.profit.toFixed(2)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full ${item.margin >= 0 ? 'bg-green-600' : 'bg-red-600'}`}
                              style={{ width: `${Math.abs(Math.min(Math.max(item.margin, -100), 100))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="add-charge">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <ServiceChargeForm onChargeAdded={handleServiceChargeAdded} />
              </div>
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Service Income Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      Use this form to record service income received from customers that is not already 
                      associated with a specific service call in the system.
                    </p>
                    <div className="space-y-2">
                      <h3 className="font-medium">How to add service income:</h3>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Select the customer who made the payment</li>
                        <li>Enter the amount received</li>
                        <li>Select the date when the payment was received</li>
                        <li>Add a description of the service provided</li>
                        <li>Click "Record Service Income" to save the record</li>
                      </ol>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                      <p className="text-sm text-amber-800">
                        <strong>Note:</strong> All service income added here will appear as income in the financial reports
                        even though they're stored in the expense system as "reimbursed" records for technical reasons.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="expenses">
            <ServiceExpenseList 
              expenses={serviceExpenses} 
              onExpenseStatusChanged={handleExpenseStatusChanged}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ServiceBilling;
