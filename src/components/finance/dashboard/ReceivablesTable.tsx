
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Receivable } from "@/types/finance";

interface ReceivablesTableProps {
  receivables: Receivable[];
  formatCurrency: (amount: number) => string;
}

const ReceivablesTable: React.FC<ReceivablesTableProps> = ({ receivables, formatCurrency }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>High Priority Receivables</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receivables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No high priority receivables</TableCell>
              </TableRow>
            ) : (
              receivables.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.invoiceNumber}</TableCell>
                  <TableCell>{item.customer}</TableCell>
                  <TableCell>{item.dueDate}</TableCell>
                  <TableCell>{formatCurrency(item.amount)}</TableCell>
                  <TableCell>{formatCurrency(item.balance)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      item.status === "Overdue" ? "destructive" : 
                      item.status === "Due Soon" ? "warning" : "default"
                    }>
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default React.memo(ReceivablesTable);
