
import React from "react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { InventoryItem } from "@/types/inventory";

interface ItemsTableProps {
  filteredItems: InventoryItem[];
  selectedItemId: string | null;
  handleSelectItem: (itemId: string) => void;
  isLoading: boolean;
}

const ItemsTable = ({ filteredItems, selectedItemId, handleSelectItem, isLoading }: ItemsTableProps) => {
  if (isLoading) {
    return (
      <div className="border rounded-md overflow-hidden mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Select</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Compatible Models</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7}>
                <div className="space-y-2 py-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden mb-8">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Select</TableHead>
            <TableHead>Item Name</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Compatible Models</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <TableRow key={item.id} className={selectedItemId === item.id ? "bg-muted" : ""}>
                <TableCell>
                  <div className="flex justify-center">
                    <input
                      type="radio"
                      name="selectedItem"
                      checked={selectedItemId === item.id}
                      onChange={() => handleSelectItem(item.id)}
                      className="h-4 w-4 rounded-full border-gray-300"
                    />
                  </div>
                </TableCell>
                <TableCell>{item.part_name}</TableCell>
                <TableCell>{item.brand || "-"}</TableCell>
                <TableCell>
                  {item.compatible_models ? 
                    (Array.isArray(item.compatible_models) ? 
                      item.compatible_models.join(", ") : 
                      typeof item.compatible_models === 'string' ? 
                        item.compatible_models : 
                        JSON.stringify(item.compatible_models)) : 
                    "-"}
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <span className={item.quantity < item.min_stock ? "text-destructive" : "text-green-600"}>
                    {item.quantity}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    (Min: {item.min_stock})
                  </span>
                </TableCell>
                <TableCell>₹{item.purchase_price}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No items found. Try adjusting your search or filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ItemsTable;
