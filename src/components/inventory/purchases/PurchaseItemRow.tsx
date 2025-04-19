
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";

interface PurchaseItemDetails {
  itemName?: string;
  name?: string;
  brand?: string;
  model?: string;
  description?: string;
  category?: string;
  quantity: number;
  unitPrice?: number;
  unit_price?: number;
  total?: number;
}

export const PurchaseItemRow = ({ item }: { item: PurchaseItemDetails }) => {
  const displayName = item.itemName || item.name || "N/A";
  const unitPrice = item.unitPrice || item.unit_price || 0;
  const totalAmount = item.total || (item.quantity * unitPrice) || 0;
  
  const getBrandModel = () => {
    if (!item.brand && !item.model) return "N/A";
    
    let display = [];
    if (item.brand) display.push(item.brand);
    if (item.model) display.push(item.model);
    return display.join(" / ");
  };

  return (
    <TableRow>
      <TableCell>{displayName}</TableCell>
      <TableCell>{getBrandModel()}</TableCell>
      <TableCell>{item.description || "N/A"}</TableCell>
      <TableCell>{item.category || "N/A"}</TableCell>
      <TableCell>{item.quantity}</TableCell>
      <TableCell className="text-right">₹{unitPrice.toLocaleString()}</TableCell>
      <TableCell className="text-right">₹{totalAmount.toLocaleString()}</TableCell>
    </TableRow>
  );
};
