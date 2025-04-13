
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { InventoryItem } from "@/types/inventory";

interface LowStockTableProps {
  items: InventoryItem[];
  isLoading: boolean;
  error: Error | null;
}

const LowStockTable: React.FC<LowStockTableProps> = ({
  items,
  isLoading,
  error,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Part Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead>Current Stock</TableHead>
          <TableHead>Min Stock</TableHead>
          <TableHead>Reorder Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-6">
              Loading inventory items...
            </TableCell>
          </TableRow>
        ) : error ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-6 text-red-500">
              Error loading inventory: {error.message}
            </TableCell>
          </TableRow>
        ) : items.length > 0 ? (
          items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.brand}</TableCell>
              <TableCell className="text-destructive font-medium">{item.currentStock}</TableCell>
              <TableCell>{item.minStockLevel}</TableCell>
              <TableCell>{item.maxStockLevel - item.currentStock}</TableCell>
              <TableCell className="text-right">
                <Button size="sm">Reorder</Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
              No low stock items found. All inventory levels are healthy.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default LowStockTable;
