
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/finance/financeUtils";
import { GstMode } from './GstHandlingSection';

interface CartItem {
  id: string;
  itemName: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface CartSectionProps {
  items: CartItem[];
  subtotal: number;
  gstMode: GstMode;
  gstRate: number;
  gstAmount: number;
  grandTotal: number;
  onRemoveItem: (id: string) => void;
}

export const CartSection: React.FC<CartSectionProps> = ({
  items,
  subtotal,
  gstMode,
  gstRate,
  gstAmount,
  grandTotal,
  onRemoveItem
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cart Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No items added yet. Add items to the cart above.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {item.itemName}
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-6 flex justify-end">
          <div className="w-80 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{gstMode === 'inclusive' ? 'Price (Incl. GST):' : 'Subtotal:'}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            {gstMode !== 'no-gst' && (
              <div className="flex justify-between text-sm">
                <span>GST ({gstRate}%):</span>
                <span>{formatCurrency(gstAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Total{gstMode === 'inclusive' ? ' (Incl. GST)' : ''}:</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
