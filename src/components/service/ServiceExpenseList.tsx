
import React, { useState } from "react";
import { ServiceExpense } from "@/types/serviceExpense";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Receipt, CalendarDays, User, DollarSign, Wrench, Building, Search, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { updateExpenseReimbursementStatus } from "@/services/serviceExpenseService";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ServiceExpenseListProps {
  expenses: ServiceExpense[];
  onExpenseStatusChanged?: () => void;
}

const ServiceExpenseList = ({ 
  expenses,
  onExpenseStatusChanged 
}: ServiceExpenseListProps) => {
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);
  const [customerFilter, setCustomerFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const filteredExpenses = expenses.filter(expense => {
    if (!customerFilter) return true;
    const customerName = expense.customerName || expense.serviceCallInfo?.customerName || "";
    return customerName.toLowerCase().includes(customerFilter.toLowerCase());
  });
  
  // Separate income records (service charges to customers) from expenses
  const incomeRecords = filteredExpenses.filter(expense => 
    expense.isReimbursed && expense.customerName && expense.engineerId === "system");
  
  const expenseRecords = filteredExpenses.filter(expense => 
    !(expense.isReimbursed && expense.customerName && expense.engineerId === "system"));
  
  // Get general expenses (not tied to service calls)
  const generalExpenses = expenseRecords.filter(expense => 
    (expense.serviceCallId === "general" || expense.serviceCallId === "00000000-0000-0000-0000-000000000000") &&
    expense.engineerId !== "system" &&
    !expense.isReimbursed
  );
  
  // Apply tab filtering
  const displayedRecords = activeTab === "all" 
    ? filteredExpenses 
    : activeTab === "income" 
      ? incomeRecords 
      : activeTab === "general"
      ? generalExpenses
      : expenseRecords;
  
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalReimbursed = filteredExpenses
    .filter(expense => expense.isReimbursed)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const totalPending = totalExpenses - totalReimbursed;
  
  const totalIncome = incomeRecords.reduce((sum, expense) => sum + expense.amount, 0);
  const totalActualExpenses = expenseRecords.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate true profit (income - expenses)
  const totalProfit = totalIncome - totalActualExpenses;
  
  // Calculate total general expenses
  const totalGeneralExpenses = generalExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const handleToggleReimbursement = async (expense: ServiceExpense) => {
    const newStatus = !expense.isReimbursed;
    setUpdating(expense.id);
    
    const success = await updateExpenseReimbursementStatus(expense.id, newStatus);
    
    if (success) {
      // Update the local state
      expense.isReimbursed = newStatus;
      
      // Notify parent component if a callback is provided
      if (onExpenseStatusChanged) {
        onExpenseStatusChanged();
      }
      
      toast({
        title: newStatus ? "Expense Reimbursed" : "Reimbursement Cancelled",
        description: `${expense.category} expense of ₹${expense.amount.toFixed(2)} for ${expense.engineerName}`,
        variant: newStatus ? "default" : "destructive",
      });
    }
    
    setUpdating(null);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row justify-between gap-2">
          <span>Service Finances Overview</span>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center">
              <Badge variant="outline" className="mr-1">Total:</Badge> 
              ₹{totalExpenses.toFixed(2)}
            </span>
            <span className="flex items-center">
              <Badge variant="success" className="mr-1">
                <TrendingUp className="h-3 w-3 mr-1" />Income:
              </Badge> 
              ₹{totalIncome.toFixed(2)}
            </span>
            <span className="flex items-center">
              <Badge variant="destructive" className="mr-1">
                <TrendingDown className="h-3 w-3 mr-1" />Expenses:
              </Badge> 
              ₹{totalActualExpenses.toFixed(2)}
            </span>
            <span className="flex items-center">
              <Badge variant={totalProfit >= 0 ? "success" : "destructive"} className="mr-1">
                Profit:
              </Badge> 
              ₹{totalProfit.toFixed(2)}
            </span>
          </div>
        </CardTitle>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 mt-2">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              placeholder="Filter by customer name"
              value={customerFilter}
              onChange={e => setCustomerFilter(e.target.value)}
              className="h-9"
            />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCustomerFilter("")}
              disabled={!customerFilter}
            >
              Clear
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All ({filteredExpenses.length})
              </TabsTrigger>
              <TabsTrigger value="income" className="text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                Income ({incomeRecords.length})
              </TabsTrigger>
              <TabsTrigger value="expenses" className="text-red-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                Expenses ({expenseRecords.length})
              </TabsTrigger>
              <TabsTrigger value="general" className="text-amber-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                Unallocated ({generalExpenses.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {activeTab === "general" && generalExpenses.length > 0 && (
          <Alert variant="warning" className="mt-4 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unallocated Expenses Warning</AlertTitle>
            <AlertDescription>
              These expenses (₹{totalGeneralExpenses.toFixed(2)} total) are not linked to any specific service call
              and will not be calculated in any service call's profit. Consider re-adding these expenses with a specific
              service call selected to ensure accurate profit calculations.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        {displayedRecords.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            {expenses.length === 0 ? "No expenses or income recorded" : "No records match your filter"}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service Call</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Engineer</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedRecords.map((expense) => {
                const isIncomeRecord = expense.isReimbursed && expense.customerName && expense.engineerId === "system";
                const isGeneralExpense = (expense.serviceCallId === "general" || expense.serviceCallId === "00000000-0000-0000-0000-000000000000") && !isIncomeRecord;
                
                return (
                  <TableRow 
                    key={expense.id} 
                    className={
                      isIncomeRecord 
                        ? "bg-green-50" 
                        : isGeneralExpense 
                          ? "bg-amber-50" 
                          : ""
                    }
                  >
                    <TableCell>
                      <div className="flex items-center">
                        <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                        {format(new Date(expense.date), "dd/MM/yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                        {expense.customerName || (expense.serviceCallInfo && expense.serviceCallInfo.customerName) || (
                          <span className="text-muted-foreground text-sm">General</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Wrench className="mr-2 h-4 w-4 text-muted-foreground" />
                        {isGeneralExpense ? (
                          <Badge variant="warning" className="bg-amber-100 text-amber-800">Not Linked to Service Call</Badge>
                        ) : expense.serviceCallId === "general" || !expense.serviceCallInfo ? (
                          <Badge variant="outline" className="bg-gray-100">General Expense</Badge>
                        ) : (
                          <span className="text-sm font-medium">
                            {expense.serviceCallInfo.machineModel || "Unknown Model"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isIncomeRecord ? "success" : "outline"}>{expense.category}</Badge>
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        {isIncomeRecord ? (
                          <span className="flex items-center text-green-600">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Service Income
                          </span>
                        ) : (
                          expense.engineerName
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${isIncomeRecord ? "text-green-600" : ""}`}>
                      {isIncomeRecord ? "+" : ""}{expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {isIncomeRecord ? (
                        <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100">
                          <TrendingUp className="h-3 w-3 mr-1" /> Income
                        </Badge>
                      ) : isGeneralExpense ? (
                        <Badge variant="warning" className="bg-amber-100 text-amber-800">
                          <AlertCircle className="h-3 w-3 mr-1" /> Unallocated
                        </Badge>
                      ) : (
                        <Badge variant={expense.isReimbursed ? "outline" : "secondary"}>
                          {expense.isReimbursed ? "Reimbursed" : "Pending"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isIncomeRecord ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-green-600 border-green-200"
                          disabled
                        >
                          <Receipt className="h-4 w-4 mr-1" />
                          Received
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleReimbursement(expense)}
                          disabled={updating === expense.id}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          {expense.isReimbursed ? "Mark Unpaid" : "Reimburse"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceExpenseList;
