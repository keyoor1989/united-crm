
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
import { Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EngineerInventoryItem } from "@/hooks/inventory/useEngineerItems";

interface IssuedItemsTableProps {
  items: EngineerInventoryItem[];
  isLoading: boolean;
}

const IssuedItemsTable = ({ items, isLoading }: IssuedItemsTableProps) => {
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
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Issued To</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Source Warehouse</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No items have been issued yet
              </TableCell>
            </TableRow>
          ) : (
            items.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <Package size={16} className="text-muted-foreground" />
                  {issue.item_name}
                </TableCell>
                <TableCell>{issue.quantity}</TableCell>
                <TableCell>{issue.engineer_name}</TableCell>
                <TableCell>{new Date(issue.assigned_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {issue.warehouse_source || "Unknown Warehouse"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default IssuedItemsTable;
