
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
import { Badge } from "@/components/ui/badge";
import { usePurchaseHistory } from '@/hooks/inventory/usePurchaseHistory';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface PurchaseHistoryTabProps {
  itemName: string | null;
}

export const PurchaseHistoryTab = ({ itemName }: PurchaseHistoryTabProps) => {
  const { data: purchaseHistory, isLoading } = usePurchaseHistory(itemName);

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
        <CardContent className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading purchase history...</span>
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
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Rate (₹)</TableHead>
              <TableHead>PO Number</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchaseHistory && purchaseHistory.length > 0 ? (
              purchaseHistory.map((record, index) => (
                <TableRow key={`purchase-${record.id || index}`}>
                  <TableCell>{formatDate(record.date)}</TableCell>
                  <TableCell>{record.vendor}</TableCell>
                  <TableCell className="text-right">{record.quantity}</TableCell>
                  <TableCell className="text-right">
                    {typeof record.rate === 'number' 
                      ? `₹${record.rate.toLocaleString()}` 
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{record.invoiceNo}</TableCell>
                  <TableCell>
                    {record.status && (
                      <Badge variant={record.status === 'Completed' ? 'success' : 'secondary'}>
                        {record.status}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
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
