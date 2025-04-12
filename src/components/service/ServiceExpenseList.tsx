
import React, { useState } from "react";
import { ServiceExpense } from "@/types/serviceExpense";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Receipt, CalendarDays, User, DollarSign, Tool } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { updateExpenseReimbursementStatus } from "@/services/serviceExpenseService";
import { useToast } from "@/hooks/use-toast";

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
  
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalReimbursed = expenses
    .filter(expense => expense.isReimbursed)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const totalPending = totalExpenses - totalReimbursed;
  
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
          <span>Service Expenses</span>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center">
              <Badge variant="outline" className="mr-1">Total:</Badge> 
              ₹{totalExpenses.toFixed(2)}
            </span>
            <span className="flex items-center">
              <Badge variant="success" className="mr-1">Reimbursed:</Badge> 
              ₹{totalReimbursed.toFixed(2)}
            </span>
            <span className="flex items-center">
              <Badge variant="secondary" className="mr-1">Pending:</Badge> 
              ₹{totalPending.toFixed(2)}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No expenses recorded</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Service Call</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Engineer</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                      {format(new Date(expense.date), "dd/MM/yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Tool className="mr-2 h-4 w-4 text-muted-foreground" />
                      {expense.serviceCallId === "general" || !expense.serviceCallInfo ? (
                        <Badge variant="outline" className="bg-gray-100">General Expense</Badge>
                      ) : (
                        <span className="text-sm font-medium">
                          {expense.serviceCallInfo.customerName || "Unknown Customer"}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.category}</Badge>
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      {expense.engineerName}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {expense.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={expense.isReimbursed ? "success" : "secondary"}>
                      {expense.isReimbursed ? "Reimbursed" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleReimbursement(expense)}
                      disabled={updating === expense.id}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      {expense.isReimbursed ? "Mark Unpaid" : "Reimburse"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceExpenseList;
