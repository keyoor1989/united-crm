
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, History, Edit, Trash } from "lucide-react";
import { InventoryItem } from "@/types/inventory";

interface MachinePartsTableProps {
  items: InventoryItem[];
  isLoading: boolean;
  error: Error | null;
  onDeleteItem: (item: InventoryItem) => void;
  onViewHistory: (item: InventoryItem) => void;
}

const MachinePartsTable: React.FC<MachinePartsTableProps> = ({
  items,
  isLoading,
  error,
  onDeleteItem,
  onViewHistory,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Part Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead>Compatible Models</TableHead>
          <TableHead>Part Number</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Unit Cost</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-6">
              Loading inventory items...
            </TableCell>
          </TableRow>
        ) : error ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-6 text-red-500">
              Error loading inventory: {error.message}
            </TableCell>
          </TableRow>
        ) : items.length > 0 ? (
          items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.brand}</TableCell>
              <TableCell>
                {Array.isArray(item.compatible_models) 
                  ? item.compatible_models.join(", ") 
                  : item.model}
              </TableCell>
              <TableCell>{item.part_number || "-"}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span className={item.currentStock < item.minStockLevel ? "text-destructive font-medium" : ""}>
                    {item.currentStock}
                  </span>
                  {item.currentStock < item.minStockLevel && (
                    <Badge variant="destructive" className="ml-2">Low</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>₹{item.unitCost?.toLocaleString() || "0"}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewHistory(item)}>
                      <History className="h-4 w-4 mr-2" />
                      View History
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => onDeleteItem(item)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
              No parts found. Try adjusting your filters or add a new part.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default MachinePartsTable;
