
import React from "react";
import { ServiceExpense } from "@/types/serviceExpense";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Receipt, CalendarDays, User } from "lucide-react";
import { format } from "date-fns";

interface ServiceExpenseListProps {
  expenses: ServiceExpense[];
}

const ServiceExpenseList = ({ expenses }: ServiceExpenseListProps) => {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Service Expenses</span>
          <span>Total: ₹{totalExpenses.toFixed(2)}</span>
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
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Engineer</TableHead>
                <TableHead className="text-right">Amount (₹)</TableHead>
                <TableHead>Status</TableHead>
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
