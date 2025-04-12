
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { WarehouseStock } from "@/types/inventory";

interface StockTableProps {
  stock: WarehouseStock[];
  isLoading: boolean;
  warehouseNames: Record<string, string>;
}

const StockTable = ({ stock, isLoading, warehouseNames }: StockTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item ID</TableHead>
          <TableHead>Warehouse</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Last Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading inventory data...</span>
              </div>
            </TableCell>
          </TableRow>
        ) : stock.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No stock found
            </TableCell>
          </TableRow>
        ) : (
          stock.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.itemId}</TableCell>
              <TableCell>{warehouseNames[item.warehouseId] || "Unknown"}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{new Date(item.lastUpdated).toLocaleDateString()}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default StockTable;
