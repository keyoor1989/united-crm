
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePurchaseHistory } from '@/hooks/inventory/usePurchaseHistory';
import { format } from 'date-fns';

interface PurchaseHistoryTabProps {
  itemName: string | null;
}

export const PurchaseHistoryTab = ({ itemName }: PurchaseHistoryTabProps) => {
  const { data: purchaseHistory } = usePurchaseHistory(itemName);

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'dd MMM yyyy');
    } catch (e) {
      return date || 'N/A';
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Rate (₹)</TableHead>
              <TableHead>PO Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchaseHistory && purchaseHistory.length > 0 ? (
              purchaseHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDate(record.date)}</TableCell>
                  <TableCell>{record.vendor}</TableCell>
                  <TableCell className="text-right">{record.quantity}</TableCell>
                  <TableCell className="text-right">₹{record.rate.toLocaleString()}</TableCell>
                  <TableCell>{record.invoiceNo}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No purchase history found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
