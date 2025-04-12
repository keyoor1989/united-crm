
import React, { useState } from "react";
import BillingReportView from "@/components/service/BillingReportView";
import { useServiceData } from "@/hooks/useServiceData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, CircleDollarSign, PiggyBank, BadgeDollarSign, Receipt } from "lucide-react";
import { ServiceCall } from "@/types/service";
import ServiceChargeForm from "@/components/service/ServiceChargeForm";

const ServiceBilling = () => {
  const { allCalls, isLoading, fetchServiceCalls } = useServiceData();
  const [activeView, setActiveView] = useState<string>("billing");
  
  // Calculate summary data
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
    
    const processedCalls = allCalls.map(call => {
      // Calculate parts cost (estimated at 60% of selling price if cost not provided)
      const partsCost = call.partsUsed?.reduce((total, part) => 
        total + ((part.cost || part.price * 0.6) * part.quantity), 0) || 0;
      
      // Calculate total expenses
      const totalExpenses = (call.expenses?.reduce((total, expense) => 
        total + expense.amount, 0) || 0) + partsCost;
      
      // Calculate total revenue
      const partsRevenue = call.partsUsed?.reduce((total, part) => 
        total + (part.price * part.quantity), 0) || 0;
      const totalRevenue = (call.serviceCharge || 0) + partsRevenue;
      
      // Calculate profit
      const profit = totalRevenue - totalExpenses;
      
      return {
        ...call,
        partsCost,
        totalExpenses,
        totalRevenue,
        profit
      };
    });
    
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
    
    // Calculate service type distribution
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
    
    return {
      totalRevenue,
      totalExpenses,
      totalProfit,
      paidAmount,
      unpaidAmount,
      paidCalls: paidCalls.length,
      unpaidCalls: unpaidCalls.length,
      profitableCallsPercent,
      serviceTypeDistribution
    };
  };
  
  const summary = calculateSummary();
  
  const handleServiceChargeAdded = () => {
    fetchServiceCalls();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Service Billing Management</h1>
        <p className="text-muted-foreground">
          Track service charges, parts usage, financial reconciliation, and profitability
        </p>
      </div>

      {isLoading ? (
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
              <Receipt className="h-4 w-4" />
              Add Service Charge
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="billing">
            <BillingReportView serviceCalls={allCalls} />
          </TabsContent>
          
          <TabsContent value="summary">
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
                    <CardTitle>Service Charge Instructions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      Use this form to record service charges received from customers that are not already 
                      associated with a specific service call in the system.
                    </p>
                    <div className="space-y-2">
                      <h3 className="font-medium">How to add a service charge:</h3>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Select the customer who made the payment</li>
                        <li>Enter the amount received</li>
                        <li>Select the date when the payment was received</li>
                        <li>Add a description of the service provided</li>
                        <li>Click "Add Service Charge" to save the record</li>
                      </ol>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Note: All service charges added here will appear in the expense reports and 
                      will be marked as "reimbursed" by default.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ServiceBilling;
