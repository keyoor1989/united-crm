
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSalesHistory } from '@/hooks/inventory/useSalesHistory';
import { format } from 'date-fns';

interface SalesHistoryTabProps {
  itemName: string | null;
}

export const SalesHistoryTab = ({ itemName }: SalesHistoryTabProps) => {
  const { data: salesHistory, isLoading, error } = useSalesHistory(itemName);

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'dd MMM yyyy');
    } catch (e) {
      return date || 'N/A';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4">Loading sales data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4 text-red-500">
            Error loading sales data. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesHistory && salesHistory.length > 0 ? (
              salesHistory.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{formatDate(sale.sales?.date)}</TableCell>
                  <TableCell>{sale.sales?.customer_name || 'Unknown'}</TableCell>
                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell>₹{sale.unit_price}</TableCell>
                  <TableCell>₹{sale.total}</TableCell>
                  <TableCell>
                    <Badge variant={sale.sales?.status === 'completed' ? 'success' : 'secondary'}>
                      {sale.sales?.status || 'Pending'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  No sales history found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
