
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
import { Package, Check } from "lucide-react";
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

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-2" />
        <h3 className="text-lg font-medium">No items issued yet</h3>
        <p className="text-muted-foreground">When you issue items to engineers, they will appear here</p>
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
          {items.map((issue) => (
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
                  {issue.warehouseSource || "Main Warehouse"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default IssuedItemsTable;
