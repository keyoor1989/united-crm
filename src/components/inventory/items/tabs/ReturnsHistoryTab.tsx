
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
import { Skeleton } from "@/components/ui/skeleton";
import { Undo2, AlertCircle, ShieldAlert } from "lucide-react";

interface ReturnsHistoryTabProps {
  itemName: string | null;
}

export const ReturnsHistoryTab = ({ itemName }: ReturnsHistoryTabProps) => {
  const { data: returnsHistory, isLoading, error } = useReturnsHistory(itemName);

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
          <div className="space-y-3">
            <div className="flex space-x-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-2 py-6 text-destructive">
            <ShieldAlert className="h-10 w-10" />
            <span>Error loading returns history</span>
            <span className="text-xs text-muted-foreground">{String(error)}</span>
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
              <TableHead>Engineer</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Details</TableHead>
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
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {return_item.notes && (
                        <span className="text-sm text-muted-foreground truncate max-w-[150px]" title={return_item.notes}>
                          {return_item.notes}
                        </span>
                      )}
                      <Badge variant="outline" className="w-fit text-xs">
                        ID: {return_item.item_id}
                      </Badge>
                      {return_item.warehouse_name && (
                        <Badge variant="outline" className="w-fit text-xs">
                          To: {return_item.warehouse_name}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2 py-6">
                    <Undo2 className="h-10 w-10 text-muted-foreground/50" />
                    <span>No returns history found for this specific item</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> 
                      Filtering by exact item ID match only
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
