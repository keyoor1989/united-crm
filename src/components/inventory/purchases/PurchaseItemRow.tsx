
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
  specs?: {
    brand?: string;
    model?: string;
    partNumber?: string;
    minStock?: number;
    [key: string]: any;
  };
}

export const PurchaseItemRow = ({ item }: { item: PurchaseItemDetails }) => {
  const displayName = item.itemName || item.name || "N/A";
  const unitPrice = item.unitPrice || item.unit_price || 0;
  const totalAmount = item.total || (item.quantity * unitPrice) || 0;
  
  const getBrandModel = () => {
    // First check for direct properties
    const brand = item.brand || (item.specs?.brand) || "N/A";
    const model = item.model || (item.specs?.model) || "";
    
    if (brand === "N/A" && !model) return "N/A";
    
    if (model) {
      return `${brand} / ${model}`;
    }
    
    return brand;
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
