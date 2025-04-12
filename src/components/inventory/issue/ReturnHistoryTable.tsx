
import React from "react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { InventoryReturnItem } from "@/hooks/inventory/useReturnedItems";

interface ReturnHistoryTableProps {
  returns: InventoryReturnItem[];
  isLoading: boolean;
}

const ReturnHistoryTable = ({ returns, isLoading }: ReturnHistoryTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Returned By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Warehouse</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {returns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No returns history found
              </TableCell>
            </TableRow>
          ) : (
            returns.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.item_name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.engineer_name}</TableCell>
                <TableCell>{new Date(item.return_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.reason}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={item.condition === "Good" ? "outline" : "destructive"}>
                    {item.condition}
                  </Badge>
                </TableCell>
                <TableCell>{item.warehouse_name || "Unknown"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReturnHistoryTable;
