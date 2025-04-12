
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
import { EngineerInventoryItem } from "@/hooks/inventory/useEngineerInventory";

interface IssuedItemsTableProps {
  items: EngineerInventoryItem[];
  isLoading: boolean;
}

const IssuedItemsTable = ({ items, isLoading }: IssuedItemsTableProps) => {
  console.log("IssuedItemsTable received items:", items);
  
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
            <TableHead>Model</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Issued To</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Source Warehouse</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No items have been issued yet
              </TableCell>
            </TableRow>
          ) : (
            items.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <Package size={16} className="text-muted-foreground" />
                  {issue.itemName}
                </TableCell>
                <TableCell>{issue.modelNumber || "—"}</TableCell>
                <TableCell>{issue.modelBrand || "—"}</TableCell>
                <TableCell>{issue.assignedQuantity}</TableCell>
                <TableCell>{issue.engineerName}</TableCell>
                <TableCell>{new Date(issue.lastUpdated).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    Main Warehouse
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
