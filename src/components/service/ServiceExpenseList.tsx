
import React, { useState } from "react";
import { ServiceExpense } from "@/types/serviceExpense";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Receipt, CalendarDays, User, DollarSign, Wrench, Building, Search, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { updateExpenseReimbursementStatus } from "@/services/serviceExpenseService";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

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
  
  const filteredExpenses = expenses.filter(expense => {
    if (!customerFilter) return true;
    const customerName = expense.customerName || expense.serviceCallInfo?.customerName || "";
    return customerName.toLowerCase().includes(customerFilter.toLowerCase());
  });
  
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalReimbursed = filteredExpenses
    .filter(expense => expense.isReimbursed)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const totalPending = totalExpenses - totalReimbursed;
  
  // Separate income records (service charges to customers) from expenses
  const incomeRecords = filteredExpenses.filter(expense => 
    expense.isReimbursed && expense.customerName && expense.engineerId === "system");
  
  const expenseRecords = filteredExpenses.filter(expense => 
    !(expense.isReimbursed && expense.customerName && expense.engineerId === "system"));
    
  const totalIncome = incomeRecords.reduce((sum, expense) => sum + expense.amount, 0);
  const totalActualExpenses = expenseRecords.reduce((sum, expense) => sum + expense.amount, 0);
  
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
          <span>Service Finances</span>
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
          </div>
        </CardTitle>
        <div className="flex w-full max-w-sm items-center space-x-2 mt-2">
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
      </CardHeader>
      <CardContent>
        {filteredExpenses.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            {expenses.length === 0 ? "No expenses recorded" : "No expenses match your filter"}
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
              {filteredExpenses.map((expense) => {
                const isIncomeRecord = expense.isReimbursed && expense.customerName && expense.engineerId === "system";
                
                return (
                  <TableRow key={expense.id} className={isIncomeRecord ? "bg-green-50" : ""}>
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
                        {expense.serviceCallId === "general" || !expense.serviceCallInfo ? (
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
