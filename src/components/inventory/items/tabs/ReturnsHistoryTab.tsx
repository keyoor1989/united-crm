
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
import { useReturnsHistory } from '@/hooks/inventory/useReturnsHistory';
import { format } from 'date-fns';

interface ReturnsHistoryTabProps {
  itemName: string | null;
}

export const ReturnsHistoryTab = ({ itemName }: ReturnsHistoryTabProps) => {
  const { data: returnsHistory } = useReturnsHistory(itemName);

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
              <TableHead>Engineer</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returnsHistory && returnsHistory.length > 0 ? (
              returnsHistory.map((return_item) => (
                <TableRow key={return_item.id}>
                  <TableCell>{formatDate(return_item.return_date)}</TableCell>
                  <TableCell>{return_item.engineer_name}</TableCell>
                  <TableCell>{return_item.quantity}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={return_item.condition === 'Good' ? 'success' : 'destructive'}
                    >
                      {return_item.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>{return_item.reason}</TableCell>
                  <TableCell>{return_item.notes || '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  No returns history found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
